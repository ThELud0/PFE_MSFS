const northAmerica = { topleft: [70, -166], botright: [18, -67] };
const southAmerica = { topleft: [8.6, -83], botright: [-55, -43] };
const europeAndAfrica = { topleft: [68, -8.6], botright: [-35, 45] };
const asia = { topleft: [72, 45], botright: [14.8, 146] };
const oceania = { topleft: [5, 100], botright: [-44, 155] };

const land = [northAmerica, southAmerica, europeAndAfrica, asia, oceania];

const eiffelTower = {latitude:48.857308, longitude:2.294126};
const libertyStatue = {latitude:40.691100, longitude:-74.047628};
const bigBen = {latitude:51.500388, longitude:-0.124305};
const pyramides = {latitude:29.976022, longitude:31.132387};
const telecomSudparis = {latitude:48.623716, longitude: 2.443632};

const chosenLandmarks = [eiffelTower,libertyStatue,bigBen,pyramides,telecomSudparis];

const maxScore = 5000;
const maxRound = 5;
const timerDuration = 120; //in seconds

var markerLatitude;
var markerLongitude;

let marker = null;

let distanceLine = null;

let guessMarker = null;

let coordinates = null;

let totalDistance = 0;
let totalGuessTime = 0;
let totalScore = 0;

let currentRound = 1;
var timer = null;
var mapInteractable = true;

var southWestBound = L.latLng(-89.98155760646617, -360),
  northEastBound = L.latLng(89.99346179538875, 360);

var southWestResultBound = L.latLng(-89.98155760646617, -360),
  northEastResultBound = L.latLng(89.99346179538875, 360);

var bounds = L.latLngBounds(southWestBound, northEastBound);
var resultBounds = L.latLngBounds(southWestResultBound, northEastResultBound);

// Creating map options
var mapOptions = {
  center: [0, 0],
  minZoom: 2,
  zoom: 2,
  maxBounds: bounds,
  maxBoundsViscosity: 1.0,
};

var flagIcon = L.icon({
  iconUrl: "./flag_marker.png",

  iconSize: [26, 48], // size of the icon
  iconAnchor: [1, 48],
});

////////////////////////////////////////////////////////////////////////////////
//------------------------------ MAP CREATION ---------------------------------//
////////////////////////////////////////////////////////////////////////////////

// Creating a map object
var map = new L.map("map", mapOptions);

// Creating a Layer object
var layer = new L.TileLayer(
  "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
);

// Adding layer to the map
map.addLayer(layer);

////////////////////////////////////////////////////////////////////////////////
//------------------------------ DISPLAY METHODS -----------------------------//
////////////////////////////////////////////////////////////////////////////////

function updateDebugCoordinatesDisplay(latVal, lgnVal) {
  //document.getElementById("latitude").value = latVal;
  //document.getElementById("longitude").value =lgnVal;
}

map.on("click", (event) => {
  if (mapInteractable) {
    if (marker !== null) {
      map.removeLayer(marker);
    }
    if (marker == null) {
      document.getElementById("btn").style.pointerEvents = "all";
      document.getElementById("btn").disabled = false;
    }
    markerLatitude = event.latlng.lat;
    markerLongitude = event.latlng.lng;
    marker = L.marker([event.latlng.lat, event.latlng.lng]).addTo(map);
    console.log("clicked map");
    updateDebugCoordinatesDisplay(event.latlng.lat, event.latlng.lng);
  }
});

// Function to display a marker at var coordinates in the div and on map
function displayCoordinates() {
  if (guessMarker == null) {
    guessMarker = L.marker([coordinates.latitude, coordinates.longitude], {
      icon: flagIcon,
    }).addTo(map);
  } else {
    map.removeLayer(guessMarker);
    guessMarker = L.marker([coordinates.latitude, coordinates.longitude], {
      icon: flagIcon,
    }).addTo(map);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
//------------------------ RANDOM COORDINATES GENERATION METHODS --------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////

// Function to generate a random latitude and longitude
function generateRandomCoordinates() {
  // Latitude ranges from -90 to 90
  const latitude = (Math.random() * 135 - 55).toFixed(7);
  // Longitude ranges from -180 to 180
  const longitude = (Math.random() * 360 - 180).toFixed(7);

  return { latitude, longitude };
}

function generateRandomLandCoordinates() {
  // Select a random continent from the land array
  const chosenContinent = land[Math.floor(Math.random() * land.length)];
  //const chosenContinent = land[0];

  // Extract latitude and longitude ranges
  const minLatitude = chosenContinent.topleft[0];
  const maxLatitude = chosenContinent.botright[0];
  const minLongitude = chosenContinent.topleft[1];
  const maxLongitude = chosenContinent.botright[1];

  // Generate random latitude and longitude within the ranges
  const latitude = (
    Math.random() * (maxLatitude - minLatitude) +
    minLatitude
  ).toFixed(7);
  const longitude = (
    Math.random() * (maxLongitude - minLongitude) +
    minLongitude
  ).toFixed(7);

  return { latitude, longitude };
}

function generateChosenLandCoordinates() {
  // Select a random continent from the land array
  const chosenContinent = chosenLandmarks[currentRound-1];
  //const chosenContinent = land[0];

  // Generate random latitude and longitude within the ranges
  const latitude = chosenContinent.latitude;
  const longitude = chosenContinent.longitude;

  return { latitude, longitude };
}

function generateNewTarget() {
  //coordinates = generateRandomLandCoordinates();
  coordinates = generateChosenLandCoordinates();

  if (typeof parent.SimVar === "undefined") {
    console.log("SimVar is not loaded. Check your simvar.js inclusion.");
    return;
  } else console.log("SimVar is loaded.");

  parent.setPlanePosition(coordinates.latitude, coordinates.longitude);


  //displayCoordinates();
}
/*

function setSimVarFromIframe(variable, unit, value) {
  parent.simvar
    .setSimVarValue(variable, unit, value)
    .then((result) => {
      console.log(`SimVar set successfully: ${variable} = ${value} ${unit}`);
    })
    .catch((error) => {
      console.error(`Failed to set SimVar:`, error);
    });
}*/

function resetMarker() {
  if (marker !== null) {
    map.removeLayer(marker);
    //document.getElementById("btn").style.pointerEvents = "none";
    document.getElementById("btn").disabled = true;
  }

  marker = null;
  markerLatitude = null;
  markerLongitude = null;

  updateDebugCoordinatesDisplay(null, null);
}

//////////////////////////////////////////////////////////////////////////////////////////////
//------------------------ CONFIRM BUTTON AND POPUP METHODS --------------------------------//
//////////////////////////////////////////////////////////////////////////////////////////////

// Confirm button click event
document.getElementById("btn").addEventListener("click", function () {
  if (marker != null) {
    resultWithMarkerChoice();
    clearInterval(timer);
  }
});

function showAnswer() {
  displayCoordinates();

  distanceLine = L.polyline(
    [
      L.latLng(markerLatitude, markerLongitude),
      L.latLng(coordinates.latitude, coordinates.longitude),
    ],
    {
      color: "red",
    }
  );

  map.removeLayer(marker);
  marker = L.marker([markerLatitude, markerLongitude]).addTo(map);

  map.fitBounds(distanceLine.getBounds(), { animate: false });

  distanceLine.addTo(map);
}

function clearAnswer() {
  map.fitBounds(bounds);
  map.removeLayer(distanceLine);
  map.removeLayer(guessMarker);
}

function displayRound() {
  var roundDisplayBox = document.getElementById("roundDisplayDiv");
  roundDisplayBox.innerHTML = `<div class="roundDisplay">Round ${currentRound}/${maxRound}</br>Total score: ${totalScore}</div>`;
}

function topPercentileCalculation(score) {
  if (score >= 24999) return 100;
  else if (score <= 0) return 0;
  var f2 = 1.82502 - score / 2000 > 0 ? 1.82502 - score / 2000 : 0;
  var top =
    104.3912 +
    (1.825022 - 104.3912) / (1 + (score / 8360.522) ** 2 * 0.599949) -
    f2 +
    0.000042 * score;
  return top.toFixed(2);
}

//Pop-up on confirm event when a marker has been put down
function resultWithMarkerChoice() {
  var popupContainer = document.getElementById("popup-container");
  var popupBox = document.createElement("div");
  //var popupMapDiv = document.createElement("div");
  var closeButton = document.createElement("button");

  //you can scroll past antimeridians on the map to the left/right (beyond 180°/-180°) so we have to get the coordinates back in range for the result calculation

  markerLongitude =
    markerLongitude < 0
      ? ((markerLongitude - 180) % 360) + 180
      : ((markerLongitude + 180) % 360) - 180;

  let distance = getDistanceFromLatLonInKm(
    markerLatitude,
    markerLongitude,
    coordinates.latitude,
    coordinates.longitude
  );

  let score = null;
  if (distance <= 0.5) score = maxScore;
  else if (distance > 10000) score = 0;
  else
    score = Math.floor(
      (maxScore * 1000) / (distance + 1000 - 0.5) - distance ** 1.5 / 2500
    );

  totalScore += score;

  let numbersOfDecimals = distance > 10 ? 0 : 3;
  distance = distance.toFixed(numbersOfDecimals);

  totalDistance += Number(distance);

  popupBox.className = "popup-box";
  popupBox.innerHTML = `<div class="popup-content">Round ${currentRound}/${maxRound}</br>You chose coordinates (lat,lng) couple: (${markerLatitude}, ${markerLongitude}) which is ${distance} km away from target. You have scored ${score} points (total: ${totalScore}).</div>`;
  /*
  popupMapDiv.className = "popUpMap";
  popupMapDiv.style = "width:90%;height:66vh";*/

  closeButton.className = "close-btn";
  closeButton.type = "button";
  closeButton.innerHTML =
    currentRound < maxRound ? "Next Round" : "Show End Results";

  document.getElementById("btn").disabled = true;

  //popupBox.appendChild(popupMapDiv);
  popupBox.appendChild(closeButton);
  popupContainer.appendChild(popupBox);
  mapInteractable = false;

  //replacing the marker beyond the antimeridian when it is graphically closer on the map to have one point on one side and the other on the other side
  if (Math.abs(coordinates.longitude - markerLongitude) > 180) {
    if (coordinates.longitude >= 0) markerLongitude += 360;
    else markerLongitude -= 360;
  }

  showAnswer();

  closeButton.addEventListener("click", function () {
    clearAnswer();
    if (currentRound < maxRound) {
      currentRound++;
      generateNewTarget();
      startTimer();
      

      mapInteractable = true;
    } else ShowEndResults();
    displayRound();
    resetMarker();
    popupContainer.removeChild(popupBox);
  });
}

//Pop-up on confirm event when no marker has been put down
function resultWithoutMarkerChoice() {
  var popupContainer = document.getElementById("popup-container");
  var popupBox = document.createElement("div");

  var closeButton = document.createElement("button");

  popupBox.className = "popup-box";
  popupBox.innerHTML = `<div class="popup-content">Round ${currentRound}/${maxRound}</br>Time out! You did not make any guess, no points for you this round! (total: ${totalScore})</div>`;

  closeButton.className = "close-btn";
  closeButton.type = "button";
  closeButton.innerHTML =
    currentRound < maxRound ? "Next Round" : "Show End Results";

  //document.getElementById("btn").style.pointerEvents = "none";
  document.getElementById("btn").disabled = true;
  mapInteractable = false;
  popupBox.appendChild(closeButton);
  popupContainer.appendChild(popupBox);

  closeButton.addEventListener("click", function () {
    if (currentRound < maxRound) {
      currentRound++;
      generateNewTarget();
      startTimer();
      
    } else ShowEndResults();
    displayRound();
    mapInteractable = true;
    popupContainer.removeChild(popupBox);
  });
}

//Pop-up on game end
function ShowEndResults() {
  var popupContainer = document.getElementById("popup-container");
  var popupBox = document.createElement("div");

  var closeButton = document.createElement("button");

  popupBox.className = "popup-box";

  var topBeat = topPercentileCalculation(totalScore);

  popupBox.innerHTML = `<div class="popup-content">Game end !</br>Congratulations ! You scored a total of ${totalScore} points and beat ${topBeat}% of players. </br>Average guess time: ${
    totalGuessTime / maxRound
  } seconds (Total time: ${totalGuessTime} seconds)
  <br/>Average distance from marker: ${
    totalDistance / maxRound
  }km (Total distance: ${totalDistance}km)</div>`;
  mapInteractable = false;
  closeButton.className = "close-btn";
  closeButton.type = "button";
  closeButton.innerHTML = "Restart Game";

  //document.getElementById("btn").style.pointerEvents = "none";
  document.getElementById("btn").disabled = true;

  popupBox.appendChild(closeButton);
  popupContainer.appendChild(popupBox);

  closeButton.addEventListener("click", function () {
    startGame();
    mapInteractable = true;
    popupContainer.removeChild(popupBox);
  });
}

//Pop-up on game end
function ShowStartMenu() {
  var popupContainer = document.getElementById("popup-container");
  var popupBox = document.createElement("div");

  var closeButton = document.createElement("button");

  popupBox.className = "popup-box";
  popupBox.innerHTML = `<div class="popup-content">Ready ?</div>`;

  closeButton.className = "close-btn";
  closeButton.type = "button";
  closeButton.innerHTML = "Start Game";

  //document.getElementById("btn").style.pointerEvents = "none";
  document.getElementById("btn").disabled = true;
  mapInteractable = false;
  popupBox.appendChild(closeButton);
  popupContainer.appendChild(popupBox);

  closeButton.addEventListener("click", function () {
    startGame();
    mapInteractable = true;
    popupContainer.removeChild(popupBox);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------- TIMER METHODS -------------------------------------//
//////////////////////////////////////////////////////////////////////////////////////////////

function startTimer() {
  var sec = timerDuration;
  timer = setInterval(function () {
    secDisplay = sec % 60;
    min = Math.floor(sec / 60);
    zeroFiller = secDisplay < 10 ? "0" : "";

    document.getElementById("safeTimerDisplay").innerHTML =
      min + ":" + zeroFiller + secDisplay;
    sec--;
    totalGuessTime++;
    if (sec < 0) {
      clearInterval(timer);
      if (marker != null) resultWithMarkerChoice();
      else resultWithoutMarkerChoice();
    }
  }, 1000);
}

function startGame() {
  score = 0;
  totalScore = 0;
  totalDistance = 0;
  totalGuessTime = 0;
  currentRound = 1;

  resetMarker();
  document.getElementById("btn").disabled = true;
  generateNewTarget();
  displayRound();
  startTimer();
}

window.onload = function () {
  ShowStartMenu();
};

//////////////////////////////////////////////////////////////////////////////////////////////
//------------------------------------- MATHS FUNCTIONS ------------------------------------//
//////////////////////////////////////////////////////////////////////////////////////////////

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
