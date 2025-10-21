// Ідентифікатор клієнта Mapillary - замініть на ваш ID
const MAPILLARY_CLIENT_ID = 'YOUR_MAPILLARY_CLIENT_ID'; 

function initOSMMap() {
    // 1. Координати Стоунхенджа та околиць
    const stonehengeCoords = [51.1789, -1.8262];
    const amesburyCoords = [51.176, -1.789];

    // 2. Створення карти
    const map = L.map('map').setView(stonehengeCoords, 14);

    // 3. Зміна фону / схеми відображення (Tiles)
    const darkTileLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '© <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, © <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    const standardOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    const baseLayers = {
        "Темний фон (Stadia)": darkTileLayer,
        "Стандартний OSM": standardOSM
    };
    L.control.layers(baseLayers).addTo(map);


    // 4. Додавання міток (Markers)
    L.marker(stonehengeCoords)
        .addTo(map)
        .bindPopup("<b>Стоунхендж</b><br>Історична пам'ятка.").openPopup();

    const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });

    L.marker(amesburyCoords, { icon: customIcon })
        .addTo(map)
        .bindPopup("<b>Еймсбері</b><br>Найближче місто.");


    // 5. Прокладання маршруту (використання Leaflet Routing Machine з OSRM)
    L.Routing.control({
        waypoints: [
            L.latLng(amesburyCoords),
            L.latLng(stonehengeCoords)
        ],
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        routeWhileDragging: true,
        show: false,
        lineOptions: {
            styles: [{ color: '#00cc66', weight: 6, opacity: 0.8 }]
        },
        language: 'uk'
    }).addTo(map);


    // 6. Додатково: Панорамний перегляд (Mapillary)
    try {
        // У цьому випадку Mapillary Viewer повинен бути ініціалізований після завантаження його бібліотеки.
        const viewer = new mapillary.Viewer({
            container: 'mapillary-viewer',
            component: { cover: false },
            imageKey: '2647614459524021', // Демо-ключ зображення
        });
        
    } catch (e) {
        document.getElementById('mapillary-viewer').innerHTML = 'Помилка завантаження Mapillary Viewer. Спробуйте оновити бібліотеку або перевірте Ваш Client ID.';
        console.error('Mapillary Error:', e);
    }
}

// Ініціалізація карти після завантаження всіх зовнішніх ресурсів
window.onload = initOSMMap;

delete L.Icon.Default.prototype._get  IconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
// ========================================================


const MAPILLARY_CLIENT_ID = 'YOUR_MAPILLARY_CLIENT_ID'; 

function initOSMMap() {
    // 1. Координати Стоунхенджа та околиць
    const stonehengeCoords = [51.1789, -1.8262];
    const amesburyCoords = [51.176, -1.789];

    // ... (решта коду залишається тією ж) ...
    // ... (L.map, L.tileLayer, L.marker, L.Routing.control) ...

    // Примітка: Оскільки ви використовуєте customIcon для Еймсбері,
    // він не потребує виправлення, але стандартний маркер Стоунхенджа (якщо ви не вказали customIcon)
    // тепер завантажуватиметься правильно завдяки блоку вище.

    // 6. Додатково: Панорамний перегляд (Mapillary)
    try {
        const viewer = new mapillary.Viewer({
            container: 'mapillary-viewer',
            component: { cover: false },
            imageKey: '2647614459524021', 
        });
        
    } catch (e) {
        document.getElementById('mapillary-viewer').innerHTML = 'Помилка завантаження Mapillary Viewer. Спробуйте оновити бібліотеку або перевірте Ваш Client ID.';
        console.error('Mapillary Error:', e);
    }
}

window.onload = initOSMMap;
