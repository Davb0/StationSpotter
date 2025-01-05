let map = L.map('map').setView([45.9432, 24.9668], 7); // Centered on Romania
let gasStationMarkers = L.layerGroup().addTo(map);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to fetch and display gas stations
function fetchGasStations(lat, lon) {
    const boundingBox = `${lat - 0.5},${lon - 0.5},${lat + 0.5},${lon + 0.5}`;
    const query = `
[out:json][timeout:25];
node["amenity"="fuel"](${boundingBox});
out body;
    `;

    gasStationMarkers.clearLayers();

    fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: {
            'Content-Type': 'text/plain'
        }
    })
        .then(response => response.json())
        .then(data => {
            data.elements.forEach(element => {
                if (element.lat && element.lon) {
                    const marker = L.marker([element.lat, element.lon])
                        .addTo(gasStationMarkers)
                        .bindPopup(element.tags.name || 'Gas Station');
                }
            });
        })
        .catch(console.error);
}

// Locate the user
function locateUser() {
    map.locate({ setView: true, maxZoom: 14 });

    map.on('locationfound', (e) => {
        const { lat, lng } = e.latlng;
        L.marker([lat, lng]).addTo(map).bindPopup('You are here!').openPopup();
        fetchGasStations(lat, lng);
    });

    map.on('locationerror', () => {
        alert('Unable to retrieve location.');
    });
}

// Search for an address
function searchLocation() {
    const address = document.getElementById('search-bar').value;
    if (!address) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                map.setView([lat, lon], 14);
                fetchGasStations(lat, lon);
            } else {
                alert('Location not found.');
            }
        })
        .catch(console.error);
}

// Event listeners
document.getElementById('locate-btn').addEventListener('click', locateUser);
document.getElementById('search-btn').addEventListener('click', searchLocation);

// Initialize
locateUser();
