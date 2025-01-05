// Initialize the Leaflet map with a center and zoom level
let map = L.map('map').setView([45.9432, 24.9668], 7); // Default center: Romania

// Add OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to fetch gas stations using Nominatim API
function fetchGasStations(location) {
    // Create the URL to search for gas stations within the bounding box
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=gas+station&bounded=1&viewbox=${location.west},${location.north},${location.east},${location.south}`;

    // Fetch data from Nominatim API
    fetch(url, {
        method: 'GET',
        headers: {
            'User-Agent': 'YourWebsiteName (contact@yourwebsite.com)' // Replace with your website name/contact
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            // Loop through the data and add markers to the map
            data.forEach(item => {
                // Add a marker for each gas station
                L.marker([item.lat, item.lon])
                    .addTo(map)
                    .bindPopup(`<strong>${item.display_name}</strong>`);
            });
        } else {
            console.error("No gas stations found in this area.");
        }
    })
    .catch(error => console.error("Error fetching Nominatim data:", error));
}

// Define a bounding box around Romania (can be adjusted as needed)
const location = {
    north: 48.265, // Northern latitude
    south: 43.618, // Southern latitude
    east: 29.626,  // Eastern longitude
    west: 20.261   // Western longitude
};

// Fetch and display gas stations in the specified region (Romania)
fetchGasStations(location);

