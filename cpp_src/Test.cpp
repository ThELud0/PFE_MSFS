#include <MSFS\MSFS.h>
#include <MSFS\MSFS_WindowsTypes.h>
#include <rapidjson/document.h>

#include <iostream>
#include <fstream>
#include <sstream>
#include <cstdint>
#include <SimConnect.h>
#include <chrono>
#include <MSFS\MSFS_CommBus.h>
#include <random>

#define WORK_DIRECTORY "\\work\\" // should be "\\work\\" in WASM
#define FLIGHT_SAVE_NAME "INITIAL_FLIGHT.FLT"
#define FLIGHT_LOAD_NAME "TMP.FLT"

#define FLIGHT_SAVE_LOCATION ( WORK_DIRECTORY FLIGHT_SAVE_NAME)
#define FLIGHT_LOAD_LOCATION ( WORK_DIRECTORY FLIGHT_LOAD_NAME)

#define GUESS_TIME (3 * 60 * 6)

float const known_positions[] = {
    2.294126f, 48.857308f,                    // Eiffel tower
    -0.124305f, 51.500388f,                   // Big Ben
    -74.047628f, 40.6911f,                    // Statue of Liberty
    31.132387f, 29.976022f,                   // Pyramides
    2.443632f, 48.623716f,                    // TSP
    116.5704392693513f, 40.43203833604343f,   // Somewhere on the great wall of China
    -112.3462442354791f, 36.29895670157174f,  // Great Canyon
    -79.06552582283697f, 43.08760331208694f,  // Niagara falls
    12.491039010441456f, 41.89206671095406f,  // Colosseum
    78.04533863272798f, 27.1722021135075f,    // Taj Mahal
    23.72404331140337f, 37.97176908768301f,   // Acropolis
    2.174194844167786f, 41.40260777338642f,   // Basilica
    -122.44579473794794f, 37.80457130090765f, // Golden Gate Bridge
    -115.5512131704649f, 51.17801485320009f,  // Banff
    -1.8301657694558358f, 51.18158663107134f, // Stone Henge
    55.157423667532534f, 25.093509207449106f, // Dubai
    151.21509537241187f, -33.85755346008194f  // Sydney Opera House
};
constexpr uint64_t known_position_cnt = sizeof(known_positions) / sizeof(float) / 2;

class FLightLoader {
public:
    static bool compare_file_names(char const* const file_name, size_t const name_size, char const* const target_file, size_t const target_size) {
        char const* file_ptr = file_name + name_size - 1;
        char const* target_ptr = target_file + target_size - 1;

        while (file_ptr >= file_name && target_ptr >= target_file && *file_ptr == *target_ptr) {
            --file_ptr;
            --target_ptr;
        }
        return target_ptr < target_file;
    }

    static void replace_coordinates(std::istream& istream, double const new_longitude, double const new_latitude, std::ostream& ostream) {
        static char const SIM_VARS[] = "[SimVars.0]";
        static char const LAT_STR[] = "Latitude=";
        static char const LON_STR[] = "Longitude=";
        static char END = '\n';

        auto state = State::WAITING_SIM_VAR;
        size_t current_line_start = 0;
        for (;;) {
            char buffer[100] = { 0 };
            istream.getline(buffer, sizeof(buffer), END);
            if (istream.eof()) {
                ostream << buffer << END;
                break;
            }
            else if (istream.fail()) {
                ostream << buffer;
                istream.clear();
                continue;
            }
            size_t const previous_line = current_line_start;
            current_line_start = istream.tellg();

            if (state == State::WAITING_SIM_VAR && !strncmp(buffer, SIM_VARS, sizeof(SIM_VARS) - 1)) {
                state = State::IN_SIM_VAR;
            }
            else if (state == State::IN_SIM_VAR) {
                if (current_line_start - previous_line == 2) {
                    state = State::MET_SIM_VAR;
                }
                else if (!strncmp(buffer, LAT_STR, sizeof(LAT_STR) - 1)) {
                    ostream << LAT_STR;
                    convert_to_deg_min_sec(new_latitude, "SN", ostream);
                    ostream << '\r' << END;
                    continue;
                }
                else if (!strncmp(buffer, LON_STR, sizeof(LON_STR) - 1)) {
                    ostream << LON_STR;
                    convert_to_deg_min_sec(new_longitude, "WE", ostream);
                    ostream << '\r' << END;
                    continue;
                }
            }
            ostream << buffer << END;
        }
    }
private:
    static inline double no_if_abs(double const angle) {
        uint64_t const abs_int = (*reinterpret_cast<uint64_t const*>(&angle)) & ~((uint64_t)1 << 63);
        return *reinterpret_cast<double const*>(&abs_int);
    }

    static void convert_to_deg_min_sec(double const angle, char const cardinal_symbols[2], std::ostream& stream) {
        stream << cardinal_symbols[angle > 0.0];
        double const abs_angle = no_if_abs(angle);
        auto const degrees = static_cast<uint64_t>(abs_angle);
        stream << degrees << (char)0xb0 << ' ';
        double const minutes = abs_angle * 60.;
        auto const i_minutes = static_cast<uint64_t>(minutes) % 60;
        stream << i_minutes << "' ";
        double const second = static_cast<double>(abs_angle) * 3600. * 100.;
        auto const i_second_2d = static_cast<uint64_t>(second) % 6000;
        stream << (i_second_2d / 100) << '.' << (i_second_2d % 100) << '"';
    }

    enum class State {
        WAITING_SIM_VAR,
        IN_SIM_VAR,
        MET_SIM_VAR
    };

};

void CALLBACK dispatch(SIMCONNECT_RECV* data, DWORD size, void* context);

class GeoGuessing {
public:
    GeoGuessing() = default;

    static GeoGuessing& get() {
        static GeoGuessing gg{};
        return gg;
    }

    void connect() {
        if (SimConnect_Open(&sim, "PFE JIN", nullptr, 0, 0, 0) != S_OK) {
            std::cerr << "SIM connection failed\n";
            state = State::NOT_CONNECTED;
            return;
        }
        state = State::INACTIVE;
        std::cerr << "SIM connection successful\n";
        if (SimConnect_SubscribeToSystemEvent(sim, static_cast<DWORD>(UserEvent::FLIGHT_LOADED), "FlightLoaded") != S_OK) {
            return;
        }
        if (SimConnect_SubscribeToSystemEvent(sim, static_cast<DWORD>(UserEvent::PAUSE_STATE), "Pause") != S_OK) {
            return;
        }
        SimConnect_CallDispatch(sim, &dispatch, nullptr);
    }

    /**
     * Use in out of process application
     */
    void dispatch_proc() {
        SIMCONNECT_RECV* data; DWORD size;
        if (state == State::NOT_CONNECTED) {
            return;
        }
        SimConnect_GetNextDispatch(sim, &data, &size);
        internal_dispatch_proc(data, size, nullptr);
    }

    void JS_get_state() {
        switch (state) {
        case State::INACTIVE:
            break;
        case State::ROUND_X:   
        case State::RESULT_X:
        {
            std::stringstream ss;
            ss << "{";
            ss << "\"round\": " << round << ",";
            ss << "\"total_guess_time\": " << total_guess_time / 6 << ",";
            ss << "\"total_distance\": " << total_distance << ",";
            ss << "\"total_score\": " << total_score << ",";
            ss << "\"target_longitude\": " << targets[2 * (round-1)] << ",";
            ss << "\"target_latitude\": " << targets[2 * (round-1) + 1] << ",";
            ss << "\"remaining_time\": " << countdown / 6 << ",";
            ss << "\"guessed_longitude\": " << marker[0] << ",";
            ss << "\"guessed_latitude\": " << marker[1] << ",";
            ss << "\"guessed\": " << (guessed ? "true" : "false") << "}";

            fsCommBusCall("PFE_JIN_round_x", ss.str().c_str(), ss.str().size(), FsCommBusBroadcast_JS);
            break;
        }
        case State::RESULTS: 
        {
            std::stringstream ss;
            ss << "{";
            ss << "\"total_guess_time\": " << total_guess_time / 6 << ",";
            ss << "\"total_distance\": " << total_distance << ",";
            ss << "\"total_score\": " << total_score << "}";

            fsCommBusCall("PFE_JIN_results", ss.str().c_str(), ss.str().size(), FsCommBusBroadcast_JS);
            break;
        }
        default:
            fsCommBusCall("PFE_JIN_start_menu", "[]", 3, FsCommBusBroadcast_JS);
            break;
        }
    }
    void JS_briefing() {
        if (state == State::ACTIVE_BRIEFING_PAUSE) {
            fsCommBusCall("PFE_JIN_end_briefing", "[]", 3, FsCommBusBroadcast_JS);
        }
    }

    void JS_start_gg() {
        round = 0;
        total_score = 0;
        total_distance = 0.0f;
        total_guess_time = 0;

        uint64_t shuffle[known_position_cnt] = {0};
        for (uint64_t i = 0; i < known_position_cnt; ++i) shuffle[i] = i;

        static auto const time = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch());
        static std::default_random_engine generator(time.count());
        for (uint64_t i = 0; i < 5; ++i) {
            std::uniform_int_distribution<uint64_t> rd{i, known_position_cnt - 1};
            uint64_t new_i = rd(generator);

            uint64_t tmp = shuffle[i];
            shuffle[i] = shuffle[new_i];
            shuffle[new_i] = tmp;
        }
        for (uint64_t i = 0; i < 5; ++i) {
            targets[2 * i] = known_positions[2 * shuffle[i]];
            targets[2 * i + 1] = known_positions[2 * shuffle[i] + 1];
        }
        next_round();
    }

    void JS_quit_gg() {
        SimConnect_UnsubscribeFromSystemEvent(sim, static_cast<DWORD>(UserEvent::TIME));
        state = State::CUSTOM_FLIGHT;
    }
    void JS_guess() {
        if (state != State::ROUND_X) return;
        guessed = true;
        register_round();
    }

    void JS_marker(rapidjson::Document& doc) {
        if (state != State::ROUND_X) return;

        marker[0] = doc["longitude"].GetFloat();
        marker[1] = doc["latitude"].GetFloat();

        distance = doc["distance"].GetFloat();
        score = doc["score"].GetUint64();

    }

    void JS_end_round() {
        if (round == 5) {
            state = State::RESULTS;
            JS_get_state();
        } else {
            next_round();
        }
    }

private:
    void register_round() {
        state = State::RESULT_X;
        total_guess_time += GUESS_TIME - countdown;
        total_distance += distance;
        total_score += score;
    }
    
    void next_round() {
        ++round;
        countdown = GUESS_TIME;
        guessed = false;

        std::fstream saved{FLIGHT_SAVE_LOCATION, std::ios::in};
        std::fstream to_load{FLIGHT_LOAD_LOCATION, std::ios::out | std::ios::trunc};
        if (saved.is_open() && to_load.is_open()) {
            // the part that does not work on Loic's PC
            FLightLoader::replace_coordinates(saved, targets[2 * round - 2], targets[2 * round - 1], to_load);
            saved.close();
            to_load.close();
        }
        SimConnect_UnsubscribeFromSystemEvent(sim, static_cast<DWORD>(UserEvent::TIME));
        SimConnect_FlightLoad(sim, FLIGHT_LOAD_LOCATION);
        state = State::TP_LAUNCHED;
    }


    void internal_dispatch_proc(SIMCONNECT_RECV* data, DWORD size, void*) {
        if (!size) {
            return;
        }
        switch (data->dwID) {
        case SIMCONNECT_RECV_ID_EVENT_FILENAME:
            return recv_file(static_cast<SIMCONNECT_RECV_EVENT_FILENAME*>(data));
        case SIMCONNECT_RECV_ID_EVENT:
            return recv_event(static_cast<SIMCONNECT_RECV_EVENT*>(data));
        default:
            std::stringstream ss;
            ss << "[PFE] Received unknown event: " << data->dwID << std::endl;
            std::cerr << ss.str();
            break;
        }
    }

    void recv_file(SIMCONNECT_RECV_EVENT_FILENAME* data) {
        static char const CUSTOM_FLIGHT_NAME[] = "CustomFlight.FLT";
        static char const TMP_FLIGHT_NAME[] = FLIGHT_LOAD_NAME;
        if (data->uEventID != static_cast<DWORD>(UserEvent::FLIGHT_LOADED)) {
            return;
        }
        size_t const name_size = strnlen(data->szFileName, sizeof(data->szFileName)) + 1;
        std::stringstream ss;
        ss << "[PFE] Loading file " << data->szFileName << std::endl;
        std::cerr << ss.str();
        bool is_custom_flight = FLightLoader::compare_file_names(data->szFileName, name_size, CUSTOM_FLIGHT_NAME, sizeof(CUSTOM_FLIGHT_NAME));
        if (state == State::INACTIVE) {
            if (is_custom_flight) {
                state = State::CUSTOM_FLIGHT_LAUNCHED;
            }
        }
        else if (!is_custom_flight && !FLightLoader::compare_file_names(data->szFileName, name_size, TMP_FLIGHT_NAME, sizeof(TMP_FLIGHT_NAME))) {
            SimConnect_UnsubscribeFromSystemEvent(sim, static_cast<DWORD>(UserEvent::TIME));
            state = State::INACTIVE;
        }
    }
    void recv_event(SIMCONNECT_RECV_EVENT* data) {
        switch (data->uEventID) {
        case static_cast<DWORD>(UserEvent::PAUSE_STATE):
            return recv_pause_event(data);
        case static_cast<DWORD>(UserEvent::TIME):
            return recv_time_event(data);
        }
        if (data->uEventID != static_cast<DWORD>(UserEvent::PAUSE_STATE)) {
            return;
        }

    }

    void recv_time_event(SIMCONNECT_RECV_EVENT* data) {
        if (state == State::ROUND_X) {
            std::cerr << "[PFE] Time step\n";
            --countdown;
            if (!countdown) {
                SimConnect_UnsubscribeFromSystemEvent(sim, static_cast<DWORD>(UserEvent::TIME));
                register_round();
            }
        }
    }

    void recv_pause_event(SIMCONNECT_RECV_EVENT* data) {
        State const old_state = state;
        switch (state) {
        case State::CUSTOM_FLIGHT_LAUNCHED:
            state = State::CUSTOM_FLIGHT_BRIEFING_NO_PAUSE;
            break;
        case State::CUSTOM_FLIGHT_BRIEFING_NO_PAUSE:
            state = State::CUSTOM_FLIGHT_BRIEFING_PAUSE;
            break;
        case State::CUSTOM_FLIGHT_BRIEFING_PAUSE:
            SimConnect_FlightSave(sim, FLIGHT_SAVE_LOCATION, "User-loaded flight", "Geo-guessing utility flight", 0);
            state = State::CUSTOM_FLIGHT;
            break;
        case State::TP_LAUNCHED:
            state = State::ACTIVE_BRIEFING_NO_PAUSE;
            break;
        case State::ACTIVE_BRIEFING_NO_PAUSE:
            state = State::ACTIVE_BRIEFING_PAUSE;
            break;
        case State::ACTIVE_BRIEFING_PAUSE:
            state = State::ROUND_X;
            SimConnect_SubscribeToSystemEvent(sim, static_cast<DWORD>(UserEvent::TIME), "6Hz");
        default:
            break;
        }
        std::stringstream ss{};
        ss << "[PFE] Received PAUSE event (" << data->dwData << ") " << static_cast<uint64_t>(old_state) << " -> " << static_cast<uint64_t>(state) << std::endl;
        std::cerr << ss.str();
    }

    HANDLE sim = 0;
    uint64_t score = 0;
    uint64_t total_score = 0;
    uint64_t total_guess_time = 0;
    float distance = 0.0f;
    float total_distance = 0.0f;
    float marker[2] = { 0.0f };
    float targets[10] = { 0.0f };
    bool guessed = false;

    uint64_t round = 0;
    uint64_t countdown = 0;

    enum class State {
        NOT_CONNECTED,
        INACTIVE,
        CUSTOM_FLIGHT_LAUNCHED,
        CUSTOM_FLIGHT_BRIEFING_NO_PAUSE,
        CUSTOM_FLIGHT_BRIEFING_PAUSE,
        CUSTOM_FLIGHT,
        TP_LAUNCHED,
        ACTIVE_BRIEFING_NO_PAUSE,
        ACTIVE_BRIEFING_PAUSE,
        ROUND_X,
        RESULT_X,
        RESULTS
    } state {State::NOT_CONNECTED};

    enum class UserEvent {
        FLIGHT_LOADED,
        PAUSE_STATE,
        TIME
    };
    friend void CALLBACK dispatch(SIMCONNECT_RECV* data, DWORD size, void* context);
};

void CALLBACK dispatch(SIMCONNECT_RECV* data, DWORD size, void* context) {
    GeoGuessing::get().internal_dispatch_proc(data, size, nullptr);
}

void JS_briefing(char const*, unsigned int, void*) {
    std::cerr << "[PFE] JS requested briefing skip\n";
    GeoGuessing::get().JS_briefing();
    // sometimes CustomPanel.html is loaded before MissionStartup.html
    GeoGuessing::get().JS_get_state();
}

void JS_requested_state(char const*, unsigned int, void*) {
    std::cerr << "[PFE] JS requested state\n";
    GeoGuessing::get().JS_get_state();
}

void JS_start_geoguessing(char const*, unsigned int, void*) {
    std::cerr << "[PFE] JS requested to start geoguessing\n";
    GeoGuessing::get().JS_start_gg();
}

void JS_quit_geoguessing(char const*, unsigned int, void*) {
    std::cerr << "[PFE] JS requested to quit geoguessing\n";
    GeoGuessing::get().JS_quit_gg();
}

void JS_guess(char const*, unsigned int, void*) {
    std::cerr << "[PFE] JS requested to guess\n";
    GeoGuessing::get().JS_guess();
}

void JS_marker(char const* data, unsigned int size, void*) {
    std::cerr << "[PFE] JS placed marker";
    rapidjson::Document doc;
    doc.Parse(data);
    GeoGuessing::get().JS_marker(doc);
}

void JS_end_round(char const*, unsigned int, void*) {
    std::cerr << "[PFE] JS requested to end the round\n";
    GeoGuessing::get().JS_end_round();
}

extern "C" MSFS_CALLBACK void module_init(void)
{
    GeoGuessing::get().connect();
    
    // MissionStartup.html
    fsCommBusRegister("PFE_JIN_skip_briefing", JS_briefing);


    // CustomPanel.html
    fsCommBusRegister("PFE_JIN_get_state", JS_requested_state);
    fsCommBusRegister("PFE_JIN_start_geoguessing", JS_start_geoguessing);
    fsCommBusRegister("PFE_JIN_quit_geoguessing", JS_quit_geoguessing);
    fsCommBusRegister("PFE_JIN_guess", JS_guess);
    fsCommBusRegister("PFE_JIN_place_marker", JS_marker);
    fsCommBusRegister("PFE_JIN_end_of_round", JS_end_round);
}

extern "C" MSFS_CALLBACK void module_deinit(void)
{

}

