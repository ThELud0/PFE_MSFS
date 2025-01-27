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


function updateDebugCoordinatesDisplay(latVal, lgnVal) {
    //document.getElementById("latitude").value = latVal;
    //document.getElementById("longitude").value =lgnVal;
} 

/*
map.on("click", (event) => {
  if (!isInVr)
    putDownMarker(event);
});*/

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

const northAmerica = { topleft: [70, -166], botright: [18, -67] };
const southAmerica = { topleft: [8.6, -83], botright: [-55, -43] };
const europeAndAfrica = { topleft: [68, -8.6], botright: [-35, 45] };
const asia = { topleft: [72, 45], botright: [14.8, 146] };
const oceania = { topleft: [5, 100], botright: [-44, 155] };

const land = [northAmerica, southAmerica, europeAndAfrica, asia, oceania];

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

// Function to generate a random latitude and longitude
function generateRandomCoordinates() {
    // Latitude ranges from -90 to 90
    const latitude = (Math.random() * 135 - 55).toFixed(7);
    // Longitude ranges from -180 to 180
    const longitude = (Math.random() * 360 - 180).toFixed(7);
  
    return { latitude, longitude };
  }