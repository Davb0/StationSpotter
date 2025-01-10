let map = L.map('map').setView([45.9432, 24.9668], 7); // Default center: Romania
let gasStationMarkers = new L.LayerGroup().addTo(map);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch and display gas stations
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
                        L.marker([element.lat, element.lon])
                            .addTo(gasStationMarkers)
                            .bindPopup(element.tags.name || 'Gas Station');
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching Overpass API:', error));
}

// Locate user
function locateUser() {
    map.locate({ setView: true, maxZoom: 14 });
    map.on('locationfound', e => {
        const { lat, lng } = e.latlng;
        L.marker([lat, lng]).addTo(map).bindPopup('You are here!').openPopup();
        fetchGasStations(lat, lng);
    });
    map.on('locationerror', () => alert('Unable to retrieve your location.'));
}

// Search functionality
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
                alert('Location not found.');
            }
        })
        .catch(error => console.error('Error fetching location:', error));
});

// Locate button
document.getElementById('locate-button').addEventListener('click', locateUser);

// Initial Gas Stations
fetchGasStations(45.9432, 24.9668);
