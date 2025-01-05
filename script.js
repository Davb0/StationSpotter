let map = L.map('map').setView([45.9432, 24.9668], 7); // Default center: Romania
let gasStationMarkers = new L.LayerGroup().addTo(map); // Layer for gas station markers

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to fetch and display gas stations based on a bounding box
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
        headers: { 'Content-Type': 'text/plain' }
    })
        .then(response => response.json())
        .then(data => {
            if (data.elements && data.elements.length > 0) {
                data.elements.forEach(element => {
                    if (element.lat && element.lon) {
                        let popupContent = `Gas Station: ${element.tags.name || 'Unnamed'}`;
                        L.marker([element.lat, element.lon])
                            .addTo(gasStationMarkers)
                            .bindPopup(popupContent);
                    }
                });
            } else {
                alert('No gas stations found in this area.');
            }
        })
        .catch(error => alert('Error fetching gas stations.'));
}

// Locate User
function locateUser() {
    map.locate({ setView: true, maxZoom: 14 });

    map.on('locationfound', (e) => {
        const { lat, lng } = e.latlng;

        L.marker([lat, lng]).addTo(map).bindPopup('You are here!').openPopup();

        fetchGasStations(lat, lng);
    });

    map.on('locationerror', () => {
        alert('Unable to retrieve your location. Please enable location services.');
    });
}

// Search Location
function searchLocation() {
    const location = document.getElementById('search-bar').value;
    if (!location) return alert('Please enter a location.');

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                map.setView([lat, lon], 14);
                fetchGasStations(parseFloat(lat), parseFloat(lon));
            } else {
                alert('Location not found.');
            }
        })
        .catch(error => alert('Error fetching location data.'));
}

// Event Listeners
document.getElementById('locate-btn').addEventListener('click', locateUser);
document.getElementById('search-btn').addEventListener('click', searchLocation);

// Initialize Map
locateUser();
