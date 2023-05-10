let map;
let correctLocations = 0;
let currentLocation = 0;
const locations = [
  { name: "Chaparral Hall", position: { lat: 34.2382238, lng: -118.5269897 } },
  { name: "Jacaranda Hall", position: { lat: 34.2412774, lng: -118.5288907 } },
  { name: "Monterey Hall", position: { lat: 34.2361909, lng: -118.5240869 } },
  { name: "Klotz Health Center", position: { lat: 34.2382476, lng: -118.5263245 } },
  { name: "Bayramian Hall", position: { lat: 34.2403636, lng: -118.5310838 } },
];

let rectangles = [];
let highScore = 0;

function initMap() {
  const mapOptions = {
    center: { lat: 34.242573, lng: -118.529456 },
    zoom: 16.4,
    mapTypeId: 'satellite',
    draggable: false,
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    disableTilt: true,
    gestureHandling: "none",
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  };

  map = new google.maps.Map(document.getElementById("map"), mapOptions);

  map.addListener("dblclick", (e) => {
    hideNotification();
    checkLocation(e.latLng);
  });

  document.getElementById("reset-button").addEventListener("click", resetGame);

  promptNextLocation();
}

function checkLocation(userLatLng) {
  const location = locations[currentLocation];
  const distance = google.maps.geometry.spherical.computeDistanceBetween(
    userLatLng,
    location.position
  );

  const isCorrect = distance < 50; // Set a threshold (in meters) for correct answers
  drawRectangle(location.position, isCorrect);

  if (isCorrect) {
    correctLocations++;
    document.getElementById("score").textContent = `Score: ${correctLocations}/${locations.length}`;
    showNotification("Correct!");
  } else {
    showNotification("Incorrect.");
  }

  currentLocation++;
  promptNextLocation();
}

function showNotification(message, autoHide = true) {
  const notificationElement = document.getElementById("notification");
  notificationElement.innerHTML = message;
  notificationElement.style.display = "block";

  if (autoHide) {
    setTimeout(() => {
      notificationElement.style.display = "none";
    }, 3000);
  }
}


function hideNotification() {
  const notificationElement = document.getElementById("notification");
  notificationElement.style.display = "none";
}

function showResultNotification(message) {
  const resultNotificationElement = document.getElementById("result-notification");
  resultNotificationElement.innerHTML = message;
  resultNotificationElement.style.display = "block";

  setTimeout(() => {
    resultNotificationElement.style.display = "none";
  }, 3000);
}

function promptNextLocation() {
  const directionsElement = document.getElementById("directions");
  
  if (currentLocation < locations.length) {
    directionsElement.textContent = `Directions: Double click on ${locations[currentLocation].name}`;
  } else {
    updateHighScore();
    directionsElement.textContent = `Game Finished!`;
  }
}

function drawRectangle(position, isCorrect) {
  const rectangleSize = 100; // Set the size of the rectangle in meters

  const northEast = google.maps.geometry.spherical.computeOffset(position, rectangleSize / Math.sqrt(2), 45);
  const southWest = google.maps.geometry.spherical.computeOffset(position, rectangleSize / Math.sqrt(2), 225);

  const rectangle = new google.maps.Rectangle({
    strokeColor: isCorrect ? "#008000" : "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: isCorrect ? "#008000" : "#FF0000",
    fillOpacity: 0.35,
    map: map,
    bounds: {
      north: northEast.lat(),
      south: southWest.lat(),
      east: northEast.lng(),
      west: southWest.lng(),
    },
  });

  // Add the rectangle to the rectangles array
  rectangles.push(rectangle);
}

function resetGame() {
  // Remove all drawn rectangles
  rectangles.forEach((rectangle) => {
    rectangle.setMap(null);
  });

  // Clear the rectangles array
  rectangles = [];

  // Reset the game state
  correctLocations = 0;
  currentLocation = 0;
  document.getElementById("score").textContent = `Score: ${correctLocations}/${locations.length}`;

  // Prompt the next location
  promptNextLocation();
}

function updateHighScore() {
  if (correctLocations > highScore) {
    highScore = correctLocations;
    document.getElementById("high-score").textContent = `High Score: ${highScore}/${locations.length}`;
  }
}

