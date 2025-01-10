let map = L.map('map').setView([45.9432, 24.9668], 7); // Default center: Romania
let gasStationMarkers = new L.LayerGroup().addTo(map); // Layer for gas station markers

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to fetch and display gas stations based on a bounding box
function fetchGasStations(lat, lon) {
    const boundingBox = `${lat - 0.5},${lon - 0.5},${lat + 0.5},${lon + 0.5}`; // Adjust bounding box size as needed
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
                        L.marker([element.lat, element.lon])
                            .addTo(gasStationMarkers)
                            .bindPopup(element.tags.name || 'Gas Station');
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

// Event listeners
document.getElementById('locate-button').addEventListener('click', locateUser);
document.getElementById('search-button').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input').value;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                map.setView([lat, lon], 14);
                fetchGasStations(parseFloat(lat), parseFloat(lon));
            } else {
                alert("Location not found. Please try again.");
            }
        })
        .catch(error => console.error('Error fetching location data:', error));
});
