// Initialize the map centered on Romania
let map = L.map('map').setView([45.9432, 24.9668], 7);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Layer group to manage gas station markers
let gasStationMarkers = new L.LayerGroup().addTo(map);

// Custom gas pump icon
const gasPumpIcon = L.icon({
    iconUrl: 'images/gas-pump.png', // Path to your custom icon
    iconSize: [32, 32], // Icon size
    iconAnchor: [16, 32], // Anchor point for positioning
    popupAnchor: [0, -32] // Position of the popup
});

// Function to fetch and display gas stations
function fetchGasStations(lat, lon) {
    const boundingBox = `${lat - 0.5},${lon - 0.5},${lat + 0.5},${lon + 0.5}`; // Adjust the size as needed
    const query = `
[out:json][timeout:25];
node["amenity"="fuel"](${boundingBox});
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
                        // Extract station name or default to "Gas Station"
                        const stationName = element.tags && element.tags.name ? element.tags.name : "Gas Station";

                        // Add marker with popup
                        L.marker([element.lat, element.lon], { icon: gasPumpIcon })
                            .addTo(gasStationMarkers)
                            .bindPopup(`<strong>${stationName}</strong>`);
                    }
                });
            } else {
                console.error('No gas stations found in this area.');
            }
        })
        .catch(error => console.error('Error fetching Overpass API data:', error));
}

// Locate the user and fetch nearby gas stations
function locateUser() {
    map.locate({ setView: true, maxZoom: 14 });

    map.on('locationfound', (e) => {
        const { lat, lng } = e.latlng;

        // Add a marker for the user's location
        L.marker([lat, lng]).addTo(map).bindPopup('You are here!').openPopup();

        // Fetch gas stations near the user's location
        fetchGasStations(lat, lng);
    });

    map.on('locationerror', () => {
        alert("Unable to retrieve your location. Please enable location services.");
    });
}

// Automatically locate the user on map load
locateUser();
