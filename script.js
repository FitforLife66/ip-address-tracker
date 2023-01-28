//  Getting geoData
//  ====================================================
//  IPv4, Domain or empty input is possible
//  If input value is empty, it gets the geoData of the own location

async function getGeoData(str) {

    // Simple pattern checking
    const ipv4Pattern = new RegExp(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    const domainPattern = new RegExp(/[a-zA-Z0-9\-]{2,63}\.[a-zA-Z]{1,10}$/);   
   
    //  Building the path (empty string is the users location)
    let inputType = '';

    if(ipv4Pattern.test(str)) {
        inputType = '&ipAddress=';
    } else if(domainPattern.test(str)) {
        inputType = '&domain=';  
    } else if(str === '') {
    } else {
        console.log('please check your input');     // !!!! Define an alert
    };

    const apiKeyIpify = 'at_UXznpQu647FqSmJn62xRAm9QDn4vn';
    url = `https://geo.ipify.org/api/v2/country,city?apiKey=${apiKeyIpify}${inputType}${str}`;

    //  Getting the geoData
    const response = await fetch(url);
    const geoData = await response.json();
    return geoData;
}

//  Rendering map and data
//  ====================================================

async function renderAddressData(str) {
 
    const geoData = await getGeoData(str);

    const ip = geoData.ip;
    const country = geoData.location.country;
    const postalCode = geoData.location.postalCode;
    const city = geoData.location.city;
    const location = `${country}-${postalCode} ${city}`;
    const timezone = `UTC${geoData.location.timezone}`; 
    const isp = geoData.isp;

    document.getElementById('ip').textContent = ip;
    document.getElementById('location').textContent = location;
    document.getElementById('timezone').textContent = timezone;
    document.getElementById('isp').textContent = isp;

    const lat = geoData.location.lat;
    const lng = geoData.location.lng;
    const latOffset = 0.01;   // To adjust the center of the map

    //  Leaflet Map & Marker
    if(marker) {
        map.removeLayer(marker);
    };
    
    map.flyTo([lat + latOffset, lng], 13);
    marker = L.marker([lat, lng], {icon: markerIcon}).addTo(map);  
}

//  Events
//  ====================================================

const inputEl = document.getElementById('input');
const inputBtnEl = document.getElementById('input-btn');

//  Click clears the input field 
inputEl.addEventListener('click', (event) => {
    event.target.value = '';
});

//  Press Enter or button click to get data
inputEl.addEventListener('keydown', (event) => {
    if(event.key === "Enter")  renderAddressData(inputEl.value)
});

inputBtnEl.addEventListener('click', () => {
 renderAddressData(inputEl.value);
});

//  Changeing input placeholder size for large (desktop) viewport
addEventListener("resize", () => {
    setPlaceholder(desktopViewport);
});


//  Synchronous code start
//  ====================================================

//  Input placeholder depending on viewport size
function setPlaceholder(viewportWidth) {
    if(window.innerWidth >= viewportWidth) {
        inputEl.setAttribute('placeholder', 'Search for any IP address or domain')      
    } else {
        inputEl.setAttribute('placeholder', 'Search IP addr or domain')
    }
}

const desktopViewport = 1160;
setPlaceholder(desktopViewport);

//  Init Leaflet map and fly to the user's location
let map = L.map('map', {
    keyboard: false,
    zoomControl: false
}).setView([50, 10], 3);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let marker;
let markerIcon = L.icon({
    iconUrl: './images/icon-location.svg',
    iconAnchor:   [23, 60],     // point of the icon which will correspond to marker's location
});

//  Empty string: User's location
renderAddressData('');
