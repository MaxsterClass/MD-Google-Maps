// ver 10-22 2024
import { MarkerClusterer } from "https://cdn.skypack.dev/@googlemaps/markerclusterer@2.3.1";

const victoriaBC = { lat: 48.4284, lng: -123.3656 };
let currentPos = victoriaBC, markers = [];
let map, markerCluster;

window.onload = initMap();

function initMap() {
	map = new google.maps.Map(document.getElementById("map"), {
		center: victoriaBC,
		zoom: 13,
	});
	const centerControlDiv = document.createElement("div");
	const locationButton = document.createElement("button");
	const controlButton = document.createElement("button");
	const infoWindow = new google.maps.InfoWindow();
	const directionsService = new google.maps.DirectionsService();
	const directionsRenderer = new google.maps.DirectionsRenderer();	
	let parkRadius = document.getElementById("park-radius");
	let slider = document.getElementById("park-radius-slider");

	directionsRenderer.setMap(map);

	document.getElementById("map").addEventListener("click", function (event) {
		if (event.target && event.target.classList.contains("directionButton")) {
			const lat = event.target.getAttribute("data-lat");
			const lng = event.target.getAttribute("data-lng");
			const destination = { lat: parseFloat(lat), lng: parseFloat(lng) };
			calculateAndDisplayRoute(directionsService, directionsRenderer, destination);
		}
	});
	
	slider.addEventListener("change", function () {
		searchParks(map, slider.value);
	});

	locationButton.type = controlButton.type = "button";
	locationButton.style.backgroundColor = controlButton.style.backgroundColor = "#fff";
	locationButton.style.border = controlButton.style.border = "2px solid #fff";
	locationButton.style.boxShadow = controlButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
	locationButton.style.color = controlButton.style.color = "rgb(25,25,25)";
	locationButton.style.cursor = controlButton.style.cursor = "pointer";
	locationButton.style.fontFamily = controlButton.style.fontFamily = "Roboto, Arial, sans-serif";
	locationButton.style.fontSize = controlButton.style.fontSize = "var(--MapControlFontSize)";
	locationButton.style.lineHeight = controlButton.style.lineHeight = "38px";
	locationButton.style.margin = controlButton.style.margin = "8px 0 22px";
	locationButton.style.padding = controlButton.style.padding = "0 5px";
	locationButton.style.textAlign = controlButton.style.textAlign = "center";
	locationButton.textContent = "Pan to Current Location";
	controlButton.textContent = "Center Map";
	locationButton.title = "Click to recenter the map";
	controlButton.title = "Click to re-center the map";
	locationButton.style.borderTopRightRadius = "3px";
	locationButton.style.borderBottomRightRadius = "3px";
	controlButton.style.borderTopLeftRadius = "3px";
	controlButton.style.borderBottomLeftRadius = "3px";
  
  	locationButton.addEventListener("click", () => {
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

				const infoWindow = new google.maps.InfoWindow({ content: "Current Location" });

				marker.addListener("click", function () {
					infoWindow.open(map, marker);
				});
				map.setCenter(pos);
			}, () => {handleLocationError(true, infoWindow, map.getCenter());});
		} else handleLocationError(false, infoWindow, map.getCenter());
	});

	controlButton.addEventListener("click", () => {
		map.setCenter(currentPos);
		map.setZoom(14);
	});

  	locationButton.classList.add("custom-map-control-button");
	centerControlDiv.appendChild(controlButton);
	centerControlDiv.appendChild(locationButton);
	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(centerControlDiv);

	window.addEventListener("resize", function () {
		if (screen.width <= 400) {
			locationButton.textContent = "Pan";
			controlButton.textContent = "Center";
		} else {
			locationButton.textContent = "Pan to Current Location";
			controlButton.textContent = "Center Map";
		}
  	});
	searchParks(map, 5000, parkRadius);
} // initiate map

function calculateAndDisplayRoute(directionsService, directionsRenderer, destination) {
	directionsService.route({
		origin: currentPos,
		destination: destination,
		travelMode: google.maps.TravelMode.DRIVING,
	  }).then((response) => {directionsRenderer.setDirections(response);}).catch((e) => window.alert("Directions request failed due to " + e));
} // calculate and display route

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ? "Error: The Geolocation service failed." : "Error: Your browser doesn't support geolocation.");
	infoWindow.open(map);
} // handle location error

function searchParks(map, radius, parkRadius) {
	const service = new google.maps.places.PlacesService(map);
	const request = {
		location: currentPos,
		radius: radius.toString(),
		type: ["park"],
	};

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
	const rating = place.rating ? place.rating : "<em>No ratings avaliable.</em>";
	const review = place.reviews ? place.reviews : "<em>No reviews avaliable.</em>";
	const marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
	});
	console.log(review)

	const infoWindow = place.photos ? new google.maps.InfoWindow({
		content: `<img src="${place.photos[0].getUrl({maxWidth: 150, maxHeight: 150,})}}" style="display:block; margin-left:auto; margin-right:auto;">
			<h4>${place.name}</h4>
			<p>${place.vicinity}<br><br>Rating: ${rating}<br><br>${review}</p>
			<button type="button" class="directionButton" data-lat="${place.geometry.location.lat()}" data-lng="${place.geometry.location.lng()}" style="border-radius: 5px;">Get Directions</button>`,
	}) : new google.maps.InfoWindow({
		content: `<p><em>No image avaliable.</em></p><br>
			<h4>${place.name}</h4>
			<p>${place.vicinity}<br><br>Rating: ${rating}<br><br>${review}</p>
			<button type="button" class="directionButton" data-lat="${place.geometry.location.lat()}" data-lng="${place.geometry.location.lng()}" style="border-radius: 5px;">Get Directions</button>`,
	});
	
	marker.addListener("click", function () {
		infoWindow.open(map, marker);
	});
	markers.push(marker);
} // create marker

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('/sw.js').then(function(registration) {
			console.log('Service Worker registered with scope:', registration.scope);
		}, function(error) {
			console.log('Service Worker registration failed:', error);
		});
	});
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  
    const installButton = document.getElementById('installButton');
    installButton.style.display = 'block';
  
    installButton.addEventListener('click', () => {
		installButton.style.display = 'none';
		deferredPrompt.prompt();
		deferredPrompt.userChoice.then((choiceResult) => {
			if (choiceResult.outcome === 'accepted') {
				console.log('User accepted the install prompt');
			} else {
				console.log('User dismissed the install prompt');
			}
			deferredPrompt = null;
      	});
    });
});