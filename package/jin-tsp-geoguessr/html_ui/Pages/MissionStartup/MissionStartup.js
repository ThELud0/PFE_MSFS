class MissionStartupData {
}

// Geoguessing-specific code
function endBriefing(arg) {
    console.log("END BRIEFING");
    LaunchFlowEventToGlobalFlow("END_BRIEFING", "FlyButton");
}


class MissionStartupElement extends UIElement {
    narrateStart() {
        ScreenReader.onEvent(this, "OnStartReady");
        setTimeout(() => { this.narrateStart(); }, 5000);
    }
    connectedCallback() {
        // Geoguessing-specific code
        RegisterViewListener('JS_LISTENER_COMM_BUS').on('PFE_JIN_end_briefing', endBriefing);


        var g_timeout;
        Coherent.on("SetMissionStartupData", (data) => {
            var flyButton = document.querySelector("#FlyButton");
            if (flyButton) {
                flyButton.classList.toggle("hide", !data.ShowButton);
            }
            let airport = this.querySelector("#AirportInfos");
            let plane = this.querySelector("#PlaneInfos");
            while (airport.firstChild) {
                airport.removeChild(airport.firstChild);
            }
            while (plane.firstChild) {
                plane.removeChild(plane.firstChild);
            }
            let planeTitle = new PanelInfoLineElement();
            planeTitle.heading = true;
            planeTitle.setData(data.AirplaneTitle);
            plane.appendChild(planeTitle);
            let airportTitle = new PanelInfoLineElement();
            airportTitle.heading = true;
            airportTitle.setData(data.LocationTitle);
            airport.appendChild(airportTitle);
            for (let dataValue of data.DataValuesAirplane) {
                if (dataValue.valueStr.length > 0) {
                    let infoLine = new PanelInfoLineElement();
                    infoLine.setData(dataValue);
                    plane.appendChild(infoLine);
                }
            }
            for (let dataValue of data.DataValuesLocation) {
                let infoLine = new PanelInfoLineElement();
                infoLine.setData(dataValue);
                airport.appendChild(infoLine);
            }
        });
        Coherent.on("MissionStartup_Step", (step) => {
            switch (step) {
                case 0:
                    {
                        document.getElementById("AirportInfos").classList.remove("invisible");
                        document.getElementById("PlaneInfos").classList.add("invisible");
                        clearTimeout(g_timeout);
                        g_timeout = setTimeout(function () { Coherent.trigger("MissionStartup_Step", 1); }, 10000);
                        break;
                    }
                case 1:
                    {
                        document.getElementById("AirportInfos").classList.add("invisible");
                        document.getElementById("PlaneInfos").classList.remove("invisible");
                        clearTimeout(g_timeout);
                        g_timeout = setTimeout(function () { Coherent.trigger("MissionStartup_Step", 0); }, 10000);
                        break;
                    }
                case 2:
                    {
                        document.getElementById("AirportInfos").classList.add("invisible");
                        document.getElementById("PlaneInfos").classList.add("invisible");
                        Coherent.trigger("MissionStartUp_Finished");
                        break;
                    }
            }
        });
        Coherent.on("SwitchVRModeState", updateVREnabled);
        function updateVREnabled(state) {
            var startupContainer = document.querySelector("#StartupContainer").classList;
            if (startupContainer) {
                startupContainer.toggle("VRMode", state);
            }
            else {
                console.error("updateVREnabled > #StartupContainer not found");
            }
            var flyButton = document.querySelector("#FlyButton").classList;
            if (flyButton) {
                flyButton.toggle("VRMode", state);
            }
            else {
                console.error("updateVREnabled > #FlyButton not found");
            }
        }
        UINavigation.askGrabKeys();
        Coherent.on("ON_VIEW_LOADED", () => {
            setTimeout(() => {
                var flyButton = document.querySelector("#FlyButton");
                if (flyButton) {
                    UINavigation.forcePadCursorPosition(flyButton);
                }
            });
            setTimeout(() => { this.narrateStart(); }, 1500);
            setTimeout(() => {        // Geoguessing-specific code
                Coherent.call("COMM_BUS_WASM_CALLBACK", "PFE_JIN_skip_briefing", "[]");
            }, 300);
        });
    }
}
window.customElements.define('mission-startup', MissionStartupElement);
checkAutoload();
if (EDITION_MODE()) {
    document.documentElement.style.backgroundColor = "steelblue";
    Coherent.on("MissionStartup_Step", (i) => {
        Coherent.trigger("SetMissionStartupData", {
            AirplaneTitle: {
                ID: 1,
                name: "Cessna Cessna C172Sp",
                valueStr: "C1000",
                type: "name"
            },
            LocationTitle: {
                ID: 1,
                valueStr: "N 47° 29'35.30||W 122° 12'56.70",
                type: "split"
            },
            DataValuesAirplane: [
                {
                    ID: 2,
                    name: "Altitude",
                    value: 35000,
                    valueStr: "35000",
                    unit: "ft"
                }, {
                    ID: 3,
                    name: "Speed",
                    value: 35000,
                    valueStr: "35000",
                    unit: "ft"
                }, {
                    ID: 4,
                    name: "ETA",
                    value: 6,
                    valueStr: "6",
                    unit: "hrs"
                },
            ],
            DataValuesLocation: [
                {
                    ID: 2,
                    name: "Lat",
                    value: null,
                    valueStr: "44° 50' 16.0404'' N",
                    unit: ""
                }, {
                    ID: 2,
                    name: "Lon",
                    value: null,
                    valueStr: "0° 34' 45.048'' W",
                    unit: ""
                }, {
                    ID: 4,
                    name: "ETA",
                    value: 6,
                    valueStr: "6",
                    unit: "hrs"
                }
            ],
        });
    });
}
g_debugMgr.AddDebugButton("ADD PLANE", function () {
    Coherent.trigger("MissionStartup_Step", 0);
}, true);
//# sourceMappingURL=MissionStartup.js.map