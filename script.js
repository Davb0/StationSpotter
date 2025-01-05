// Initialize map centered on Romania
let map = L.map('map').setView([45.9432, 24.9668], 7);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Function to fetch and display gas stations (mock implementation)
function fetchGasStations(lat, lng) {
    // Simulate fetching gas stations around the user's location
    const gasStations = [
        { lat: lat + 0.02, lon: lng + 0.02, name: 'Gas Station 1' },
        { lat: lat - 0.03, lon: lng - 0.03, name: 'Gas Station 2' },
        { lat: lat + 0.03, lon: lng - 0.05, name: 'Gas Station 3' }
    ];

    // Add markers for the gas stations
    gasStations.forEach(station => {
        L.marker([station.lat, station.lon])
            .addTo(map)
            .bindPopup(`<strong>${station.name}</strong>`);
    });
}

// Function to locate the user
function locateUser() {
    map.locate({ setView: true, maxZoom: 14 });

    map.on('locationfound', (e) => {
        const { lat, lng } = e.latlng;
        console.log('Location found:', lat, lng);  // Check the coordinates in the console

        // Add marker for user's location
        L.marker([lat, lng]).addTo(map).bindPopup('You are here!').openPopup();

        // Fetch and show gas stations near the user's location
        fetchGasStations(lat, lng);
    });

    map.on('locationerror', (e) => {
        alert("Unable to retrieve your location. Please enable location services.");
    });
}

// Automatically locate user when the page loads if geolocation is available
if (navigator.geolocation) {
    locateUser();
} else {
    alert("Geolocation is not supported by your browser.");
}
