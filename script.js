document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map
    let map = L.map('map').setView([45.9432, 24.9668], 7); // Default to Romania

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Layer for gas station markers
    let gasStationMarkers = new L.LayerGroup().addTo(map);

    // Function to fetch gas stations
    function fetchGasStations(lat, lon) {
        const boundingBox = `${lat - 0.5},${lon - 0.5},${lat + 0.5},${lon + 0.5}`;
        const query = `
[out:json][timeout:25];
node["amenity"="fuel"](${boundingBox});
out body;`;

        fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query,
            headers: { 'Content-Type': 'text/plain' }
        })
            .then(response => response.json())
            .then(data => {
                gasStationMarkers.clearLayers(); // Clear old markers
                data.elements.forEach(element => {
                    if (element.lat && element.lon) {
                        const redMarker = L.icon({
                            iconUrl: 'images/redmarkericon.png', // Ensure this file exists
                            iconSize: [32, 32],
                            iconAnchor: [16, 32]
                        });
                        L.marker([element.lat, element.lon], { icon: redMarker })
                            .addTo(gasStationMarkers)
                            .bindPopup(element.tags.name || 'Gas Station');
                    }
                });
            })
            .catch(err => console.error('Error fetching gas stations:', err));
    }

    // Locate Me button functionality
    document.getElementById('locateMeButton').addEventListener('click', () => {
        map.locate({ setView: true, maxZoom: 14 });
    });

    map.on('locationfound', (e) => {
        const { lat, lng } = e.latlng;
        L.marker([lat, lng]).addTo(map).bindPopup('You are here!').openPopup();
        fetchGasStations(lat, lng);
    });

    map.on('locationerror', () => {
        alert('Location access denied. Please enable location services.');
    });

    // Search bar functionality
    document.getElementById('searchButton').addEventListener('click', () => {
        const location = document.getElementById('locationInput').value;
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const { lat, lon } = data[0];
                    map.setView([lat, lon], 14);
                    fetchGasStations(parseFloat(lat), parseFloat(lon));
                } else {
                    alert('Location not found. Please try a different search term.');
                }
            })
            .catch(err => console.error('Error searching location:', err));
    });
});
