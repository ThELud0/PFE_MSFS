const browserOnly = false; //FlightSim methods will break the code when they fail; if trying out code in browser, set this to true to not break other code

const northAmerica = { topleft: [70, -166], botright: [18, -67] };
const southAmerica = { topleft: [8.6, -83], botright: [-55, -43] };
const europeAndAfrica = { topleft: [68, -8.6], botright: [-35, 45] };
const asia = { topleft: [72, 45], botright: [14.8, 146] };
const oceania = { topleft: [5, 100], botright: [-44, 155] };
const randomLandArea = []

// America Land Areas
//North America
randomLandArea.push({ topleft: [69.19, -160.22], botright: [59.93, -128.61] });
randomLandArea.push({ topleft: [67.44, -129.32], botright: [59.98, -95.23] });
randomLandArea.push({ topleft: [59.93, -133.85], botright: [54.57, -95.48] });
randomLandArea.push({ topleft: [54.57, -125.87], botright: [48.75, -83] });
randomLandArea.push({ topleft: [57.94, -75.98], botright: [50.62, -63.77] });
randomLandArea.push({ topleft: [50.96, -83], botright: [41.64, -71.06] }); // big usa/canada lakes in there
randomLandArea.push({ topleft: [48.75, -122.09], botright: [37, -76.24] }); // bigger usa lakes in there
randomLandArea.push({ topleft: [37, -119.02], botright: [34.08, -79.34] });
randomLandArea.push({ topleft: [34.08, -118.47], botright: [33.18, -79.4] });
randomLandArea.push({ topleft: [33.18, -116.51], botright: [31.77, -81.47] });
randomLandArea.push({ topleft: [31.77, -105.11], botright: [19.7, -97.55] });
//South America
randomLandArea.push({ topleft: [19.7, -102.6], botright: [16.03, -88.9] }); // some surrounding sea around mexico in there too
randomLandArea.push({ topleft: [16.03, -91.93], botright: [12.84, -83.59] });
randomLandArea.push({ topleft: [12.84, -86.33], botright: [9.35, -83.59] });
randomLandArea.push({ topleft: [9.35, -83.59], botright: [6.32, -60.66] });
randomLandArea.push({ topleft: [4.73, -77.15], botright: [-12.22, -51.35] });
randomLandArea.push({ topleft: [-3.01, -51.35], botright: [-23, -41.91] });
randomLandArea.push({ topleft: [-12.22, -70.15], botright: [-34.61, -54.07] });
randomLandArea.push({ topleft: [-34.61, -71.64], botright: [-41.2, -62.59] });
randomLandArea.push({ topleft: [-41.2, -73.83], botright: [-55.09, -68.04] });
//Groenland
randomLandArea.push({ topleft: [, ], botright: [, ] });



const land = [northAmerica, southAmerica, europeAndAfrica, asia, oceania];

const eiffelTower = { latitude: 48.857308, longitude: 2.294126 };
const libertyStatue = { latitude: 40.6911, longitude: -74.047628 };
const bigBen = { latitude: 51.500388, longitude: -0.124305 };
const pyramides = { latitude: 29.976022, longitude: 31.132387 };
const telecomSudparis = { latitude: 48.623716, longitude: 2.443632 };
const greatWallChina = {latitude:40.43203833604343, longitude:116.5704392693513};
const greatCanyon = {latitude: 36.29895670157174,longitude: -112.3462442354791}; 
const niagaraFalls = {latitude: 43.08760331208694, longitude: -79.06552582283697};
const colosseum = {latitude: 41.89206671095406, longitude: 12.491039010441456};
const tajMahal = {latitude: 27.1722021135075,longitude:  78.04533863272798};
const acropolis = {latitude: 37.97176908768301, longitude: 23.72404331140337};
const basilica = {latitude: 41.40260777338642, longitude: 2.174194844167786};
const goldenGateBridge = {latitude: 37.80457130090765, longitude: -122.44579473794794};
const banff = {latitude: 51.17801485320009, longitude: -115.5512131704649};
const stoneHenge = {latitude: 51.18158663107134, longitude: -1.8301657694558358};
const dubai = {latitude: 25.093509207449106, longitude: 55.157423667532534};
const sydneyOperaHouse = {latitude: -33.85755346008194, longitude: 151.21509537241187};



const listOfLandmarks = [
  eiffelTower,
  libertyStatue,
  bigBen,
  pyramides,
  greatWallChina,
  greatCanyon,
  niagaraFalls,
  colosseum,
  tajMahal,
  acropolis,
  basilica,
  goldenGateBridge,
  banff,
  stoneHenge,
  dubai,
  sydneyOperaHouse
];

var chosenLandmarks;

const maxScore = 5000;
const maxRound = 5;
const timerDuration = 180; //in seconds

var markerLatitude;
var markerLongitude;

let isInVr = true;

let marker = null;

let distanceLine = null;

let guessMarker = null;

let coordinates = null;

let totalDistance = 0;
let totalGuessTime = 0;
let totalScore = 0;

let currentRound = 1;
var timer = null;
var clickTimer = null;
var clickCountdown = 0;
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
  minZoom: 3,
  zoom: 3,
  maxBounds: bounds,
  maxBoundsViscosity: 1.0,
};

var flagIcon = L.icon({
  iconUrl: "./flag_marker.png",

  iconSize: [26, 48], // size of the icon
  iconAnchor: [1, 48],
});

function setIsInVR(state) {
  isInVr = state;
  document.getElementById("isinvr").value = isInVr;
}

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

function putDownMarker(event) {
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
}

/*
map.on("click", (event) => {
  if (!isInVr)
    putDownMarker(event);
});*/

map.on("mousedown", (event) => {
  if (isInVr) {
    clickCountdown = 0;

    clickTimer = setInterval(function () {
      clickCountdown += 0.05;
      document.getElementById("ctd").value = 1;
      if (clickCountdown >= 0.15) clearInterval(clickTimer);
    }, 50);
  }
});

map.on("mouseup", (event) => {
  if (isInVr) {
    if (clickCountdown <= 0.1) {
      putDownMarker(event);
    }
    clearInterval(clickTimer);
    clickCountdown = 0;
  }
});

map.on("mouseout", (event) => {
  if (isInVr) {
    clearInterval(clickTimer);
    clickCountdown = 0;
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

  const chosenContinent = land[Math.floor(Math.random() * land.length)];
  //const chosenContinent = land[0];


  const minLatitude = chosenContinent.topleft[0];
  const maxLatitude = chosenContinent.botright[0];
  const minLongitude = chosenContinent.topleft[1];
  const maxLongitude = chosenContinent.botright[1];


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

function chooseFromLandmarks(array, count) {
  const copy = [...array]; // Make a copy to avoid modifying the original array
  const selected = [];
  
  while (selected.length < count && copy.length > 0) {
    const randomIndex = Math.floor(Math.random() * copy.length);
    selected.push(copy.splice(randomIndex, 1)[0]); // Remove and add to the selected array
  }
  
  return selected;
}

function generateChosenLandCoordinates() {

  const chosenContinent = chosenLandmarks[currentRound - 1];
  //const chosenContinent = land[0];


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

  if (!browserOnly)
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
    hideConfirmButton();
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
  roundDisplayBox.innerHTML = `<div class="roundDisplay">Round ${currentRound}/${maxRound}</div>`;

  var scoreDisplayBox = document.getElementById("scoreDisplayDiv");
  scoreDisplayBox.innerHTML = `<div class="scoreDisplay">Total score: ${totalScore}</div>`;
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
  hideConfirmButton();
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

  let notAccurate = "That's... not very accurate, is it ?";
  let goodEnough = "Keep going ! Improvement is only a few rounds away !";
  let notRandom = "Beginner's luck or keen eye ?";
  let closer = "Getting closer !";
  let notBad = "Pretty good !";
  let almostPerfect =
    "That's as close to perfection as one could get, take all my points !";
  let excellent = "Excellent !";
  let perfect = "Geoguessing is an art and you are the artist !";

  let customMessage = "";

  if (distance <= 0.05) customMessage = perfect;
  else if (distance < 0.5) customMessage = almostPerfect;
  else if (distance < 50) customMessage = excellent;
  else if (distance < 500) customMessage = notBad;
  else if (distance < 2500) customMessage = closer;
  else if (distance < 5000) customMessage = notRandom;
  else if (distance <= 10000) customMessage = goodEnough;
  else customMessage = notAccurate;

  popupBox.className = "popup-box";
  popupBox.innerHTML = `<h1>Round ${currentRound}/${maxRound}</h1><div class="popup-content"><div class="line-separator"></div>Your guess was</br><h1>${distance} km away</h1></br>from your spawn position.</br></br>You have scored </br><h1>${score} points (total: ${totalScore}).</h1></br>${customMessage}</div>`;
  /*
  popupMapDiv.className = "popUpMap";
  popupMapDiv.style = "width:90%;height:66vh";*/

  closeButton.className = "close-btn";
  closeButton.type = "button";
  closeButton.innerHTML =
    currentRound < maxRound ? "Next Round" : "End Results";

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
      showConfirmButton();
      mapInteractable = true;
      /*
      if (!browserOnly)
        parent.checkIfInVR();*/
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
  hideConfirmButton();
  popupBox.className = "popup-box";
  popupBox.innerHTML = `<h1>Round ${currentRound}/${maxRound}</h1><div class="popup-content">Time out!</br>You did not make any guess,</br>no points for you this round!</br><h1>(total: ${totalScore})</h1></div>`;

  closeButton.className = "close-btn";
  closeButton.type = "button";
  closeButton.innerHTML =
    currentRound < maxRound ? "Next Round" : "End Results";

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
      showConfirmButton();
      /*
      if (!browserOnly)
        parent.checkIfInVR();*/
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

  let numbersOfDecimalsBis = totalDistance > 10 ? 0 : 3;

  let numbersOfDecimalsAverage = (totalDistance / maxRound) > 10 ? 1 : 3;

  popupBox.innerHTML = `<h1>Game end !</h1><div class="popup-content"></br>Congratulations !</br>You scored a total of <h1>${totalScore} points</h1> and beat <h1>${topBeat}% of players</h1>.</br></br>Average guess time: <h1>${
    totalGuessTime / maxRound
  } seconds</h1><br/>(Total time: ${totalGuessTime} seconds)
  <br/><br/>Average distance from marker: <h1>${
    (totalDistance / maxRound).toFixed(numbersOfDecimalsAverage)
  }km</h1><br/>(Total distance: ${totalDistance.toFixed(numbersOfDecimalsBis)}km)</div>`;
  mapInteractable = false;
  closeButton.className = "close-btn";
  closeButton.type = "button";
  closeButton.innerHTML = "Restart Game";

  //document.getElementById("btn").style.pointerEvents = "none";
  document.getElementById("btn").disabled = true;

  popupBox.appendChild(closeButton);
  popupContainer.appendChild(popupBox);
  hideConfirmButton();

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
  var modeSelector = document.createElement("div");
  var closeButton = document.createElement("button");

  popupBox.className = "popup-box";
  popupBox.innerHTML = `<div class="popup-content"></br>You are about to be teleported to a random place on Earth.</br></br>Look around, try your best to find out where you appeared</br>and put your guess on this map!</br></br>Are you ready ?</div>`;

  closeButton.className = "close-btn";
  closeButton.type = "button";
  closeButton.innerHTML = "Start Game";

  modeSelector.className = "mode-selector-div";
  modeSelector.style.pointerEvents = "auto";
  modeSelector.innerHTML = `
    <label class="tooltip-trigger">
      <input class="input-coding" type="checkbox" id="coding" value="coding" />
      Discovery Mode
      <div class="tooltip-content"> If on, you will be teleported to the</br>same set of locations every game.</div>
    </label>`;

  document.getElementById("btn").disabled = true;
  mapInteractable = false;
  //popupBox.appendChild(modeSelector);
  popupBox.appendChild(closeButton);

  popupContainer.appendChild(popupBox);
  hideConfirmButton();

  /*
  let checkbox = document.getElementById("coding");
  if (checkbox.checked) {
    console.log("checked");
  } else {
    console.log("not checked");
  }

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      console.log("checked");
    } else {
      console.log("not checked");
    }
  });*/

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
    /*if ((sec % 5 == 0) && !browserOnly)
      parent.checkIfInVR();*/
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
  chosenLandmarks = chooseFromLandmarks(listOfLandmarks,5);
  generateNewTarget();
  displayRound();
  startTimer();
  showConfirmButton();
  /*
  if (!browserOnly)
    parent.checkIfInVR();*/
}

window.onload = function () {
  ShowStartMenu();
  map.zoomControl.remove();
  let zoomElement = L.control
    .zoom({
      position: "topleft",
      zoomInText: '<span aria-hidden="false">+</span>',
      zoomOutText: '<span aria-hidden="false">-</span>',
    })
    .addTo(map);
  zoomElement._container.addEventListener(
    "mousedown",
    L.DomEvent.stopPropagation
  );
  zoomElement._container.addEventListener(
    "mouseup",
    L.DomEvent.stopPropagation
  );
  //parent.updateBackgroundColor();
  addAttribution();
  setHelpDefaultState();
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

//////////////////////////////////////////////////////////////////////////////////////////////
//------------------------------------- UI TEXT FUNCTIONS ------------------------------------//
//////////////////////////////////////////////////////////////////////////////////////////////

function toggle(button) {
  const buttonIcon = document.getElementById("button-icon");
  if (button.classList.contains("off")) {
    button.classList.remove("off");
    button.classList.add("on");
    showUIElements();
  } else {
    button.classList.add("off");
    button.classList.remove("on");
    hideUIElements();
  }
}

function setHelpDefaultState() {
  const button = document.getElementById("help-button");
  const buttonIcon = document.getElementById("button-icon");
  button.classList.add("off");
  hideUIElements();
}

let UIHidden = true;
let ConfirmHidden = true;
function showUIElements() {
  UIHidden = false;
  document.getElementById("timer-help-text").style.visibility = "visible";
  document.getElementById("zoom-help-text").style.visibility = "visible";
  document.getElementById("warning-help-text").style.visibility = "visible";
  if (!ConfirmHidden)
    document.getElementById("map-help-text").style.visibility = "visible";
  document.getElementById("confirm-help-text").style.visibility = "visible";
  document.getElementById("help-help-text").style.visibility = "visible";
}

function hideUIElements() {
  UIHidden = true;
  document.getElementById("timer-help-text").style.visibility = "hidden";
  document.getElementById("zoom-help-text").style.visibility = "hidden";
  document.getElementById("warning-help-text").style.visibility = "hidden";
  document.getElementById("map-help-text").style.visibility = "hidden";
  document.getElementById("confirm-help-text").style.visibility = "hidden";
  document.getElementById("help-help-text").style.visibility = "hidden";
}

function addAttribution() {
  const parentDiv = document.querySelector(".leaflet-control-attribution");
  //parentDiv.textContent = "ahh";
  const separation = document.createElement("a");
  separation.textContent = " | ";
  const newAnchor = document.createElement("a");
  newAnchor.textContent = "OpenStreetMap";
  newAnchor.href = "https://www.openstreetmap.org/copyright";
  parentDiv.appendChild(separation);
  parentDiv.appendChild(newAnchor);
}

function hideConfirmButton() {
  ConfirmHidden = true;
  document.getElementById("map-help-text").style.visibility = "hidden";
  document.querySelector(".form").style.display = "none";
}
function showConfirmButton() {
  ConfirmHidden = false;
  if (!UIHidden)
    document.getElementById("map-help-text").style.visibility = "visible";
  document.querySelector(".form").style.display = "block";
}
