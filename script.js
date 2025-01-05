let map = L.map('map').setView([45.9432, 24.9668], 7); // Default center: Romania
let gasStationMarkers = new L.LayerGroup().addTo(map); // Layer for gas station markers

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to fetch and display gas stations based on a bounding box
function fetchGasStations(lat, lon) {
    // Larger bounding box to fetch more gas stations
    const boundingBox = `${lat - 1.0},${lon - 1.0},${lat + 1.0},${lon + 1.0}`; // Adjust bounding box size as needed
    const query = `
    [out:json][timeout:25];
    node["amenity"="fuel"]( ${boundingBox} );
    node["shop"="fuel"]( ${boundingBox} );
    out body;
    `;

    // Clear existing markers
    gasStationMarkers.clearLayers();

    // Fetch data from Overpass API
    fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: {
            'Content-Type': 'text/plain'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.elements && data.elements.length > 0) {
                data.elements.forEach(element => {
                    if (element.lat && element.lon) {
                        const redMarkerIcon = L.icon({
                            iconUrl: 'images/redmarkericon.png', // Use your red marker icon path
                            iconSize: [32, 32],
                            iconAnchor: [16, 32]
                        });

                        let popupContent = `Gas Station: ${element.tags && element.tags.name ? element.tags.name : 'Unnamed'}`;

                        L.marker([element.lat, element.lon], { icon: redMarkerIcon })
                            .addTo(gasStationMarkers)
                            .bindPopup(popupContent);
                    }
                });
            } else {
                console.error('No gas stations found in this area.');
            }
        })
        .catch(error => console.error('Error fetching Overpass API data:', error));
}

// Function to locate the user and update gas stations
function locateUser() {
    map.locate({ setView: true, maxZoom: 14 });

    map.on('locationfound', (e) => {
        const { lat, lng } = e.latlng;

        // Add a marker for the user's location
        L.marker([lat, lng]).addTo(map).bindPopup('You are here!').openPopup();

        // Fetch gas stations near the user's location
        fetchGasStations(lat, lng);
    });

    map.on('locationerror', (e) => {
        alert("Unable to retrieve your location. Please enable location services.");
    });
}

// Automatically locate the user on map load
locateUser();

// Button to locate user when clicked
document.getElementById('locate-btn').addEventListener('click', function() {
    locateUser();
});

