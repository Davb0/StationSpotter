// Initialize the map, centered on Romania
let map = L.map('map').setView([45.9432, 24.9668], 7);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Layer group for gas station markers
let gasStationMarkers = new L.LayerGroup().addTo(map);

// Custom gas pump icon
const gasPumpIcon = L.icon({
    iconUrl: 'images/redmarkericon.png', // Replace with the path to your icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Function to fetch and display gas stations
function fetchGasStations(lat, lon) {
    const boundingBox = `${lat - 0.5},${lon - 0.5},${lat + 0.5},${lon + 0.5}`;
    const query = `
[out:json][timeout:25];
node["amenity"="fuel"](${boundingBox});
out body;
    `;

    // Clear existing markers
    gasStationMarkers.clearLayers();

    // Fetch gas station data
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
                        const stationName = element.tags.name || "Unnamed Gas Station";
                        const popupContent = `
                            <strong>${stationName}</strong><br>
                            Latitude: ${element.lat.toFixed(6)}<br>
                            Longitude: ${element.lon.toFixed(6)}
                        `;

                        L.marker([element.lat, element.lon], { icon: gasPumpIcon })
                            .addTo(gasStationMarkers)
                            .bindPopup(popupContent);
                    }
                });
            } else {
                alert('No gas stations found in this area.');
            }
        })
        .catch(error => console.error('Error fetching gas stations:', error));
}

// Function to locate the user and fetch nearby gas stations
function locateUser() {
    map.locate({ setView: true, maxZoom: 14 });

    map.on('locationfound', (e) => {
        const { lat, lng } = e.latlng;

        // Add marker for user's location
        L.marker([lat, lng]).addTo(map).bindPopup('You are here!').openPopup();

        // Fetch nearby gas stations
        fetchGasStations(lat, lng);
    });

    map.on('locationerror', () => {
        alert('Unable to retrieve your location. Please enable location services.');
    });
}

// Function to search for a location
function searchLocation() {
    const location = document.getElementById('search-input').value.trim();
    if (!location) {
        alert('Please enter a location.');
        return;
    }

    // Use Nominatim to get coordinates for the entered location
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                map.setView([lat, lon], 14);

                // Fetch gas stations near the searched location
                fetchGasStations(parseFloat(lat), parseFloat(lon));
            } else {
                alert('Location not found. Please try again.');
            }
        })
        .catch(error => console.error('Error searching location:', error));
}

// Event listeners for buttons
document.getElementById('locate-button').addEventListener('click', locateUser);
document.getElementById('search-button').addEventListener('click', searchLocation);

// Automatically fetch gas stations for Romania on page load
fetchGasStations(45.9432, 24.9668);
