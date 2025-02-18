const socket = io();




if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("send-location", { latitude, longitude });
    }, (error) => {
        console.error(error);
        
    }, {
        enableHighAccuracy: true,
        timeout:5000,
        maximumAge:0
    })
}


const map = L.map("map").setView([0, 0], 10);
L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap"
}).addTo(map)

const markers = {};


const userName = prompt("Enter your name:");
socket.emit("join", userName);

function createCustomIcon(color) {
    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
        shadowSize: [41, 41]
    });
}

function addOrUpdateMarker(id,name, latitude, longitude,color) {
     if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]).bindPopup(name).openPopup();
    } else {
        const icon = createCustomIcon(color);
        markers[id] = L.marker([latitude, longitude], { icon })
            .addTo(map)
            .bindPopup(name) // Show user’s name below the marker
            .openPopup();
    }
}

socket.on("all-users", (users) => {
    Object.values(users).forEach(user => {
        addOrUpdateMarker(user.id, user.name ,user.latitude, user.longitude, user.color);
    });
});




socket.on("receive-location", (data) => {
    addOrUpdateMarker(data.id, data.name, data.latitude, data.longitude,data.color);
});

socket.on("user-disconnect", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})