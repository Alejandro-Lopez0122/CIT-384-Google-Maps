// Declare the main map variable
let map;

// Initialize a counter for correct locations guessed
let correctLocations = 0;

// Initialize a counter for the current location in the game
let currentLocation = 0;

// Define an array of objects containing location names and positions (latitude and longitude)
const locations = [
  { name: "Chaparral Hall", position: { lat: 34.2382238, lng: -118.5269897 } },
  { name: "Jacaranda Hall", position: { lat: 34.2412774, lng: -118.5288907 } },
  { name: "Monterey Hall", position: { lat: 34.2361909, lng: -118.5240869 } },
  { name: "Klotz Health Center", position: { lat: 34.2382476, lng: -118.5263245 } },
  { name: "Bayramian Hall", position: { lat: 34.2403636, lng: -118.5310838 } },
];

// Declare an array to store rectangle overlays for the map
let rectangles = [];

// Initialize a variable to store the highest score achieved
let highScore = 0;

// Function to initialize the Google Map
function initMap() {
  // Define map options including center, zoom, mapTypeId, and other settings to control map appearance and interactivity
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

  // Create a new Google Map using the map options and render it in the "map" div
  map = new google.maps.Map(document.getElementById("map"), mapOptions);

  // Add a "dblclick" event listener to the map that hides the notification and checks the location clicked
  map.addListener("dblclick", (e) => {
    hideNotification();
    checkLocation(e.latLng);
  });

  // Add a "click" event listener to the reset button to reset the game
  document.getElementById("reset-button").addEventListener("click", resetGame);

  // Call the promptNextLocation function to start the game
  promptNextLocation();
}

// Function to check the user's guessed location against the actual location
function checkLocation(userLatLng) {
  // Get the current location object from the locations array
  const location = locations[currentLocation];

  // Calculate the distance between the user's guessed position and the actual position
  const distance = google.maps.geometry.spherical.computeDistanceBetween(
    userLatLng,
    location.position
  );

  // Determine if the user's guess is within 50 meters of the actual location
  const isCorrect = distance < 50;

  // Draw a rectangle on the map to indicate the user's guess and whether it's correct
  drawRectangle(location.position, isCorrect);

  // If the guess is correct, increment the correctLocations counter and update the score
  if (isCorrect) {
    correctLocations++;
    document.getElementById("score").textContent = `Score: ${correctLocations}/${locations.length}`;
    showNotification("Correct!"); // Show a "Correct!" notification
  } else {
    showNotification("Incorrect."); // Show an "Incorrect" notification
  }

  // Increment the currentLocation counter to move on to the next location
  currentLocation++;
  promptNextLocation();
}

// Function to show a notification with a message and an optional auto-hide feature
function showNotification(message, autoHide = true) {
  const notificationElement = document.getElementById("notification");
  notificationElement.innerHTML = message;
  notificationElement.style.display = "block";

  // Hide the notification automatically after 3 seconds if autoHide is true
  if (autoHide) {
    setTimeout(() => {
      notificationElement.style.display = "none";
    }, 3000);
  }
}

// Function to hide the notification
function hideNotification() {
  const notificationElement = document.getElementById("notification");
  notificationElement.style.display = "none";
}

// Function to show a result notification with a message, and auto-hide it after 3 seconds
function showResultNotification(message) {
  const resultNotificationElement = document.getElementById("result-notification");
  resultNotificationElement.innerHTML = message;
  resultNotificationElement.style.display = "block";

  setTimeout(() => {
    resultNotificationElement.style.display = "none";
  }, 3000);
}

// Function to prompt the user with the next location or indicate the game has finished
function promptNextLocation() {
  const directionsElement = document.getElementById("directions");
  
  if (currentLocation < locations.length) {
    // Provide directions for the next location if there are more locations to guess
    directionsElement.textContent = `Directions: Double click on ${locations[currentLocation].name}`;
  } else {
    updateHighScore(); // Update the high score when the game is finished
    directionsElement.textContent = `Game Finished!`;
  }
}

// Function to draw a rectangle on the map to indicate the user's guess and whether it's correct
function drawRectangle(position, isCorrect) {
  const rectangleSize = 100; // Set the size of the rectangle in meters

  // Calculate the north-east and south-west corners of the rectangle
  const northEast = google.maps.geometry.spherical.computeOffset(position, rectangleSize / Math.sqrt(2), 45);
  const southWest = google.maps.geometry.spherical.computeOffset(position, rectangleSize / Math.sqrt(2), 225);

  // Create a new rectangle object with the specified options
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

// Function to reset the game state
function resetGame() {
  // Remove all drawn rectangles from the map
  rectangles.forEach((rectangle) => {
    rectangle.setMap(null);
  });

  // Clear the rectangles array
  rectangles = [];

  // Reset the game state variables
  correctLocations = 0;
  currentLocation = 0;
  document.getElementById("score").textContent = `Score: ${correctLocations}/${locations.length}`;

  // Prompt the next location for the user to guess
  promptNextLocation();
}

// Function to update the high score if the current score is higher
function updateHighScore() {
  if (correctLocations > highScore) {
    highScore = correctLocations;
    document.getElementById("high-score").textContent = `High Score: ${highScore}/${locations.length}`;
  }
}