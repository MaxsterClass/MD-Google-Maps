// ver 10-19 2024
import { MarkerClusterer } from "https://cdn.skypack.dev/@googlemaps/markerclusterer@2.3.1";

const victoriaBC = { lat: 48.4284, lng: -123.3656 };
let currentPos = victoriaBC;
let map, parkRadius, markerCluster, slider;
let markers = [];

window.onload = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: victoriaBC,
    zoom: 13,
  });
  parkRadius = document.getElementById("park-radius");
  slider = document.getElementById("park-radius-slider");
  slider.addEventListener("change", function () {
    searchParks(map, slider.value);
  });
  initMap();
  searchParks(map, 5000);
}; // window.onload

function initMap() {
  const centerControlDiv = document.createElement("div");
  const controlButton = document.createElement("button");
  const locationButton = document.createElement("button");
  const infoWindow = new google.maps.InfoWindow();

  controlButton.style.backgroundColor = "#fff";
  controlButton.style.border = "2px solid #fff";
  controlButton.style.borderTopLeftRadius = "3px";
  controlButton.style.borderBottomLeftRadius = "3px";
  controlButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlButton.style.color = "rgb(25,25,25)";
  controlButton.style.cursor = "pointer";
  controlButton.style.fontFamily = "Roboto, Arial, sans-serif";
  controlButton.style.fontSize = "var(--MapControlFontSize)";
  controlButton.style.lineHeight = "38px";
  controlButton.style.margin = "8px 0 22px";
  controlButton.style.padding = "0 5px";
  controlButton.style.textAlign = "center";
  controlButton.textContent = "Center Map";
  controlButton.title = "Click to re-center the map";
  controlButton.type = "button";
  locationButton.textContent = "Pan to Current Location";
  locationButton.style.backgroundColor = "#fff";
  locationButton.style.border = "2px solid #fff";
  locationButton.style.borderTopRightRadius = "3px";
  locationButton.style.borderBottomRightRadius = "3px";
  locationButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  locationButton.style.color = "rgb(25,25,25)";
  locationButton.style.cursor = "pointer";
  locationButton.style.fontFamily = "Roboto,Arial,sans-serif";
  locationButton.style.fontSize = "var(--MapControlFontSize)";
  locationButton.style.lineHeight = "38px";
  locationButton.style.margin = "8px 0 22px";
  locationButton.style.padding = "0 5px";
  locationButton.style.textAlign = "center";
  locationButton.title = "Click to recenter the map";
  locationButton.type = "button";

  controlButton.addEventListener("click", () => {
    map.setCenter(currentPos);
    map.setZoom(14);
  });
  
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          currentPos = pos;

          const svgMarker = {
            path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
            fillColor: "red",
            fillOpacity: 0.6,
            strokeWeight: 0,
            rotation: 0,
            scale: 2,
            anchor: new google.maps.Point(0, 20),
          };

          const marker = new google.maps.Marker({
            map: map,
            icon: svgMarker,
            position: pos,
          });

          // Create an info window for each park
          // https://developers.google.com/maps/documentation/javascript/infowindows
          const infoWindow = new google.maps.InfoWindow({
            content: "Current Location",
          });

          // Add event listener to open info window when marker is clicked
          marker.addListener("click", function () {
            infoWindow.open(map, marker);
          });
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });

  locationButton.classList.add("custom-map-control-button");
  centerControlDiv.appendChild(controlButton);
  centerControlDiv.appendChild(locationButton);
  map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(
    centerControlDiv
  );

  window.addEventListener("resize", function () {
    if (screen.width <= 400) {
      locationButton.textContent = "Pan";
      controlButton.textContent = "Center";
    } else {
      locationButton.textContent = "Pan to Current Location";
      controlButton.textContent = "Center Map";
    }
  });
} // initiate map

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
} // handle location error

function searchParks(map, radius) {
  const request = {
    location: currentPos,
    radius: radius.toString(),
    type: ["park"],
  };
  const service = new google.maps.places.PlacesService(map);

  for (let marker of markers) marker.setMap(null);

  markers = [];

  service.nearbySearch(request, function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) createMarker(results[i], map);
    }
    markerCluster = new MarkerClusterer({ markers, map });
  });
  parkRadius.textContent = radius;
} // search parks

function createMarker(place, map) {
  const marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
  });
  let infoWindow;

  if (place.photos) {
    infoWindow = new google.maps.InfoWindow({
      content: `<img src="${place.photos[0].getUrl({
        maxWidth: 150,
        maxHeight: 150,
      })}}" style="display:block; margin-left:auto; margin-right:auto;"><h4>${
        place.name
      }</h4><p>${place.vicinity}</p>`,
    });
  } else {
    infoWindow = new google.maps.InfoWindow({
      content: `<h4>${place.name}</h4><p>${place.vicinity}</p>`,
    });
  }
  
  marker.addListener("click", function () {
    infoWindow.open(map, marker);
  });
  markers.push(marker);
} // create marker