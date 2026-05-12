const APP_CONFIG = window.__ESTATECORE_CONFIG__ || {};
const API_BASE = APP_CONFIG.apiBase || '';
const GOOGLE_MAPS_API_KEY = APP_CONFIG.googleMapsApiKey || '';
let googleMap = null;
let googleInfoWindow = null;
let googleMarkers = new Map();

const DB = {
  users: [
    { id: 1, name: 'Admin User', email: 'admin@demo.com', password: 'any', role: 'admin', phone: '+60 12-345 6789', joined: '2024-01-15' },
    { id: 2, name: 'Ahmad Farid', email: 'agent@demo.com', password: 'any', role: 'agent', phone: '+60 11-234 5678', joined: '2024-02-10' },
    { id: 3, name: 'Siti Nurhaliza', email: 'buyer@demo.com', password: 'any', role: 'buyer', phone: '+60 16-789 0123', joined: '2024-03-05' },
  ],
  listings: [
    { id:1, title:'Luxury Skyline Condo @ KLCC', type:'Condo', listingType:'sale', price:1850000, location:'Kuala Lumpur', city:'Kuala Lumpur', beds:3, baths:2, size:1450, amenities:['Pool','Gym','Parking','Security'], desc:'Stunning skyline views with premium finishes. Fully furnished luxury unit steps from the iconic towers.', agent:'Ahmad Farid', agentId:2, rating:4.8, reviews:[{user:'Lee Wei',rating:5,text:'Absolutely breathtaking views, top-notch facilities!'}], status:'active', featured:true, emoji:'🏢', lat:3.158, lng:101.712 },
    { id:2, title:'Modern 4BR Bungalow in Damansara', type:'House', listingType:'sale', price:2400000, location:'Petaling Jaya', city:'Petaling Jaya', beds:4, baths:3, size:3200, amenities:['Pool','Garden','Parking','Security'], desc:'Beautifully renovated bungalow with private pool and lush garden in a gated community.', agent:'Ahmad Farid', agentId:2, rating:4.9, reviews:[], status:'active', featured:true, emoji:'🏡', lat:3.128, lng:101.621 },
    { id:3, title:'Cozy Studio Apartment @ Mont Kiara', type:'Apartment', listingType:'rent', price:2200, location:'Kuala Lumpur', city:'Kuala Lumpur', beds:1, baths:1, size:550, amenities:['Gym','Pool','Parking'], desc:'Chic studio in the heart of Mont Kiara. Fully furnished, walk to cafes and international schools.', agent:'Ahmad Farid', agentId:2, rating:4.6, reviews:[], status:'active', featured:false, emoji:'🏠', lat:3.169, lng:101.651 },
    { id:4, title:'Elegant Penthouse @ Bangsar South', type:'Condo', listingType:'sale', price:3200000, location:'Kuala Lumpur', city:'Kuala Lumpur', beds:4, baths:4, size:2800, amenities:['Pool','Gym','Parking','Security','Furnished'], desc:'Rare duplex penthouse offering panoramic city views. Private rooftop deck, designer kitchen, smart home features.', agent:'Ahmad Farid', agentId:2, rating:5.0, reviews:[], status:'active', featured:true, emoji:'🏙️', lat:3.111, lng:101.680 },
    { id:5, title:'Charming Terrace House @ Taman Tun', type:'House', listingType:'sale', price:980000, location:'Kuala Lumpur', city:'Kuala Lumpur', beds:4, baths:3, size:2100, amenities:['Garden','Parking'], desc:'Well-maintained terrace house in one of KLs most sought-after neighbourhoods. Large garden, renovated kitchen.', agent:'Ahmad Farid', agentId:2, rating:4.5, reviews:[], status:'active', featured:false, emoji:'🏘️', lat:3.145, lng:101.629 },
    { id:6, title:'New Condo @ PJ Uptown', type:'Condo', listingType:'rent', price:3500, location:'Petaling Jaya', city:'Petaling Jaya', beds:2, baths:2, size:900, amenities:['Pool','Gym','Parking','Furnished'], desc:'Brand new unit in PJ Uptown with full facilities. Walking distance to LRT and Jaya One mall.', agent:'Ahmad Farid', agentId:2, rating:4.7, reviews:[], status:'active', featured:false, emoji:'🏢', lat:3.103, lng:101.637 },
    { id:7, title:'Seafront Villa in Penang Hill', type:'Villa', listingType:'sale', price:4500000, location:'Penang', city:'Penang', beds:5, baths:5, size:5000, amenities:['Pool','Garden','Parking','Security','Gym'], desc:'Spectacular hilltop villa with sweeping sea views. Private infinity pool, smart home technology, lavish interiors.', agent:'Ahmad Farid', agentId:2, rating:4.9, reviews:[], status:'active', featured:true, emoji:'🏖️', lat:5.421, lng:100.274 },
    { id:8, title:'Affordable Apartment @ Subang Jaya', type:'Apartment', listingType:'rent', price:1400, location:'Subang Jaya', city:'Subang', beds:2, baths:1, size:700, amenities:['Parking'], desc:'Clean and affordable apartment in Subang Jaya, close to amenities and public transport.', agent:'Ahmad Farid', agentId:2, rating:4.2, reviews:[], status:'active', featured:false, emoji:'🏬', lat:3.055, lng:101.582 },
    { id:9, title:'Heritage Shophouse @ Georgetown', type:'House', listingType:'sale', price:1200000, location:'Penang', city:'Penang', beds:3, baths:2, size:1600, amenities:['Garden'], desc:'Beautifully restored pre-war shophouse in UNESCO Heritage Zone. Unique blend of history and modern living.', agent:'Ahmad Farid', agentId:2, rating:4.8, reviews:[], status:'active', featured:false, emoji:'🏛️', lat:5.414, lng:100.330 },
    { id:10, title:'New Launch Condo @ Johor Bahru', type:'Condo', listingType:'sale', price:650000, location:'Johor Bahru', city:'Johor Bahru', beds:3, baths:2, size:1100, amenities:['Pool','Gym','Parking','Security'], desc:'New launch condominium near CIQ checkpoint. Excellent investment opportunity with strong rental yield.', agent:'Ahmad Farid', agentId:2, rating:4.4, reviews:[], status:'active', featured:false, emoji:'🏗️', lat:1.484, lng:103.762 },
    { id:11, title:'Semi-D in Setia Alam Shah Alam', type:'House', listingType:'sale', price:1450000, location:'Shah Alam', city:'Shah Alam', beds:5, baths:4, size:3500, amenities:['Garden','Parking','Security'], desc:'Spacious semi-detached home in premium Setia Alam. Corner lot with extra land.', agent:'Ahmad Farid', agentId:2, rating:4.6, reviews:[], status:'pending', featured:false, emoji:'🏠', lat:3.069, lng:101.487 },
    { id:12, title:'SOHO @ KL Sentral', type:'Apartment', listingType:'rent', price:2800, location:'Kuala Lumpur', city:'Kuala Lumpur', beds:1, baths:1, size:620, amenities:['Gym','Pool','Parking','Security','Furnished'], desc:'Fully furnished SOHO unit at KL Sentral. Perfect for professionals, direct access to transport hub.', agent:'Ahmad Farid', agentId:2, rating:4.5, reviews:[], status:'active', featured:false, emoji:'🏢', lat:3.133, lng:101.686 },
    { id:13, title:'Lakefront Residence @ Cyberjaya', type:'Condo', listingType:'sale', price:720000, location:'Cyberjaya', city:'Cyberjaya', beds:3, baths:2, size:1050, amenities:['Pool','Gym','Parking','Security','Lake View'], desc:'New launch residence near Cyberjaya lake gardens. Under construction with expected completion in 2028.', agent:'Ahmad Farid', agentId:2, rating:4.6, reviews:[], status:'active', featured:true, emoji:'🏢', lat:2.9213, lng:101.6559 },
    { id:14, title:'Putrajaya Precinct 15 Family Home', type:'House', listingType:'sale', price:1180000, location:'Putrajaya', city:'Putrajaya', beds:4, baths:3, size:2400, amenities:['Garden','Parking','Security'], desc:'Spacious family home close to schools, parks, and government offices in Putrajaya.', agent:'Nur Aina', agentId:2, rating:4.7, reviews:[], status:'active', featured:false, emoji:'🏡', lat:2.9264, lng:101.6964 },
    { id:15, title:'Merdeka View Suite @ Bukit Bintang', type:'Apartment', listingType:'rent', price:4200, location:'Bukit Bintang', city:'Kuala Lumpur', beds:2, baths:2, size:880, amenities:['Gym','Pool','Furnished','Security'], desc:'Fully furnished city apartment with skyline views and quick access to MRT and shopping malls.', agent:'Jason Tan', agentId:2, rating:4.8, reviews:[], status:'active', featured:true, emoji:'🏙️', lat:3.1468, lng:101.7113 },
    { id:16, title:'Desa ParkCity Garden Condo', type:'Condo', listingType:'sale', price:1350000, location:'Desa ParkCity', city:'Kuala Lumpur', beds:3, baths:2, size:1280, amenities:['Pool','Gym','Parking','Park View','Security'], desc:'Bright condo facing the central park, ideal for families who want walkable facilities.', agent:'Mei Ling', agentId:2, rating:4.9, reviews:[], status:'active', featured:true, emoji:'🏢', lat:3.1880, lng:101.6300 },
    { id:17, title:'Cheras MRT Serviced Apartment', type:'Apartment', listingType:'rent', price:2100, location:'Cheras', city:'Kuala Lumpur', beds:2, baths:1, size:760, amenities:['Near Transit','Parking','Security'], desc:'Practical serviced apartment close to MRT, eateries, and daily conveniences.', agent:'Ahmad Farid', agentId:2, rating:4.3, reviews:[], status:'active', featured:false, emoji:'🏬', lat:3.1068, lng:101.7250 },
    { id:18, title:'Puchong South Terrace House', type:'House', listingType:'sale', price:820000, location:'Puchong', city:'Puchong', beds:4, baths:3, size:1900, amenities:['Garden','Parking'], desc:'Renovated terrace house with open kitchen and easy access to major highways.', agent:'Nur Aina', agentId:2, rating:4.4, reviews:[], status:'active', featured:false, emoji:'🏠', lat:3.0327, lng:101.6188 },
    { id:19, title:'Setapak Student Studio', type:'Apartment', listingType:'rent', price:1200, location:'Setapak', city:'Kuala Lumpur', beds:1, baths:1, size:480, amenities:['Furnished','Security','Near Transit'], desc:'Affordable studio near universities, food options, and public transport.', agent:'Jason Tan', agentId:2, rating:4.1, reviews:[], status:'active', featured:false, emoji:'🏠', lat:3.2001, lng:101.7219 },
    { id:20, title:'Kajang Semi-D Green Enclave', type:'House', listingType:'sale', price:1280000, location:'Kajang', city:'Kajang', beds:5, baths:4, size:3300, amenities:['Garden','Parking','Security'], desc:'Quiet semi-detached home in a gated neighborhood with generous family spaces.', agent:'Mei Ling', agentId:2, rating:4.6, reviews:[], status:'active', featured:false, emoji:'🏡', lat:2.9935, lng:101.7874 },
    { id:21, title:'Seremban 2 Starter Home', type:'House', listingType:'sale', price:460000, location:'Seremban 2', city:'Seremban', beds:3, baths:2, size:1400, amenities:['Parking','Garden'], desc:'Accessible starter home for first-time buyers, close to shops and schools.', agent:'Ahmad Farid', agentId:2, rating:4.2, reviews:[], status:'active', featured:false, emoji:'🏘️', lat:2.7297, lng:101.9381 },
    { id:22, title:'Klang Bandar Botanic Cluster Home', type:'House', listingType:'sale', price:930000, location:'Bandar Botanic', city:'Klang', beds:4, baths:3, size:2200, amenities:['Garden','Parking','Security'], desc:'Cluster home in a mature township with nearby shopping and green spaces.', agent:'Nur Aina', agentId:2, rating:4.5, reviews:[], status:'active', featured:false, emoji:'🏠', lat:3.0029, lng:101.4420 },
    { id:23, title:'Ara Damansara Loft Suite', type:'Condo', listingType:'rent', price:3200, location:'Ara Damansara', city:'Petaling Jaya', beds:2, baths:2, size:980, amenities:['Gym','Pool','Parking','Furnished'], desc:'Modern loft suite near LRT, business hubs, and lifestyle retail.', agent:'Jason Tan', agentId:2, rating:4.6, reviews:[], status:'active', featured:false, emoji:'🏢', lat:3.1126, lng:101.5798 },
    { id:24, title:'Ampang Hilltop Villa', type:'Villa', listingType:'sale', price:3900000, location:'Ampang', city:'Kuala Lumpur', beds:5, baths:5, size:4600, amenities:['Pool','Garden','Parking','Security','City View'], desc:'Private hilltop villa with city views, pool deck, and large entertaining areas.', agent:'Mei Ling', agentId:2, rating:4.9, reviews:[], status:'active', featured:true, emoji:'🏡', lat:3.1594, lng:101.7622 },
    { id:25, title:'Genting Foothills Retreat', type:'Villa', listingType:'sale', price:2100000, location:'Genting Permai', city:'Genting Highlands', beds:4, baths:4, size:3000, amenities:['Garden','Security','Mountain View','Parking'], desc:'Cool-weather retreat near Genting access road, ideal for holiday living.', agent:'Ahmad Farid', agentId:2, rating:4.7, reviews:[], status:'active', featured:false, emoji:'🏔️', lat:3.3866, lng:101.7778 },
    { id:26, title:'Iskandar Puteri New Launch Condo', type:'Condo', listingType:'sale', price:580000, location:'Iskandar Puteri', city:'Johor Bahru', beds:3, baths:2, size:980, amenities:['Pool','Gym','Parking','Security'], desc:'New launch condo near EduCity and Medini. Under construction with expected completion in 2028.', agent:'Nur Aina', agentId:2, rating:4.4, reviews:[], status:'active', featured:true, emoji:'🏗️', lat:1.4270, lng:103.6295 },
    { id:27, title:'Batu Kawan Smart Condo', type:'Condo', listingType:'sale', price:520000, location:'Batu Kawan', city:'Penang', beds:3, baths:2, size:920, amenities:['Pool','Gym','Parking','Security'], desc:'Upcoming smart condo near industrial and retail growth areas. Expected completion in 2027.', agent:'Jason Tan', agentId:2, rating:4.3, reviews:[], status:'active', featured:false, emoji:'🏢', lat:5.2417, lng:100.4381 },
    { id:28, title:'Bayan Lepas Airport Apartment', type:'Apartment', listingType:'rent', price:1800, location:'Bayan Lepas', city:'Penang', beds:2, baths:2, size:780, amenities:['Parking','Security','Near Transit'], desc:'Convenient apartment near airport, factories, and Queensbay area.', agent:'Mei Ling', agentId:2, rating:4.2, reviews:[], status:'active', featured:false, emoji:'🏬', lat:5.2944, lng:100.2598 },
    { id:29, title:'Melaka Riverside Heritage Loft', type:'Apartment', listingType:'sale', price:690000, location:'Melaka Riverside', city:'Melaka', beds:2, baths:2, size:1050, amenities:['River View','Security','Parking'], desc:'Character loft near Melaka river attractions with a compact modern layout.', agent:'Ahmad Farid', agentId:2, rating:4.5, reviews:[], status:'active', featured:false, emoji:'🏛️', lat:2.1944, lng:102.2491 },
    { id:30, title:'Ipoh Garden East Bungalow', type:'House', listingType:'sale', price:1380000, location:'Ipoh Garden East', city:'Ipoh', beds:5, baths:4, size:3800, amenities:['Garden','Parking','Mountain View'], desc:'Large bungalow in an established neighborhood with views toward limestone hills.', agent:'Nur Aina', agentId:2, rating:4.6, reviews:[], status:'active', featured:false, emoji:'🏡', lat:4.6151, lng:101.1164 },
    { id:31, title:'Kota Kinabalu Seaview Condo', type:'Condo', listingType:'sale', price:980000, location:'Kota Kinabalu', city:'Kota Kinabalu', beds:3, baths:2, size:1180, amenities:['Sea View','Pool','Gym','Parking','Security'], desc:'Seaview condo close to waterfront lifestyle and city conveniences.', agent:'Jason Tan', agentId:2, rating:4.8, reviews:[], status:'active', featured:true, emoji:'🏖️', lat:5.9804, lng:116.0735 },
    { id:32, title:'Kuching Riverfront Apartment', type:'Apartment', listingType:'rent', price:1900, location:'Kuching Riverfront', city:'Kuching', beds:2, baths:2, size:850, amenities:['River View','Furnished','Parking'], desc:'Comfortable apartment near Kuching waterfront, cafes, and offices.', agent:'Mei Ling', agentId:2, rating:4.4, reviews:[], status:'active', featured:false, emoji:'🏬', lat:1.5533, lng:110.3592 },
    { id:33, title:'Miri Marina Bay Condo', type:'Condo', listingType:'rent', price:2600, location:'Miri Marina', city:'Miri', beds:3, baths:2, size:1100, amenities:['Sea View','Pool','Parking','Furnished'], desc:'Furnished condo near marina lifestyle area, suitable for professionals and families.', agent:'Ahmad Farid', agentId:2, rating:4.3, reviews:[], status:'active', featured:false, emoji:'🏢', lat:4.3995, lng:113.9914 },
    { id:34, title:'Rawang Eco Terrace', type:'House', listingType:'sale', price:760000, location:'Rawang', city:'Rawang', beds:4, baths:3, size:2000, amenities:['Garden','Parking','Security'], desc:'Eco township terrace home with wider roads, parks, and family-focused facilities.', agent:'Nur Aina', agentId:2, rating:4.3, reviews:[], status:'active', featured:false, emoji:'🏘️', lat:3.3213, lng:101.5767 },
    { id:35, title:'Setia Alam New Launch Residence', type:'Condo', listingType:'sale', price:610000, location:'Setia Alam', city:'Shah Alam', beds:3, baths:2, size:1000, amenities:['Pool','Gym','Parking','Security'], desc:'New launch residence near Setia City Mall. Under construction with expected completion in 2028.', agent:'Jason Tan', agentId:2, rating:4.4, reviews:[], status:'pending', featured:false, emoji:'🏗️', lat:3.1088, lng:101.4590 },
    { id:36, title:'Kepong Metro Prima Apartment', type:'Apartment', listingType:'rent', price:1600, location:'Kepong', city:'Kuala Lumpur', beds:3, baths:2, size:900, amenities:['Parking','Security','Near Transit'], desc:'Budget-friendly apartment near shops, schools, and transit options.', agent:'Mei Ling', agentId:2, rating:4.1, reviews:[], status:'active', featured:false, emoji:'🏬', lat:3.2140, lng:101.6365 },  ]
};

let state = {
  currentUser: null,
  favorites: [],
  compareList: [],
  filters: { keyword: '', location: '', listingType: '', type: '', minPrice: '', maxPrice: '', beds: 0, baths: 0, amenities: [], sort: 'default' },
  currentPage: 'home',
  selectedRating: 0,
  searchHistory: [],
  viewingSchedules: [],
};

function getApiUrl(path) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(getApiUrl(path), {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }
  return data;
}

async function hydrateListings() {
  try {
    const listings = await apiRequest('/api/listings');
    if (Array.isArray(listings) && listings.length) {
      DB.listings = listings;
    }
  } catch (error) {
    console.warn('Using bundled listing data because API load failed.', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  loadFromStorage();
  await hydrateListings();
  renderAll();
  updateStats();
  updateTypeCounts();
  calcMortgage();
});

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('estatex');
    if (saved) {
      const data = JSON.parse(saved);
      state.favorites = data.favorites || [];
      state.compareList = data.compareList || [];
      state.searchHistory = data.searchHistory || [];
      if (data.currentUser) {
        loginAs(data.currentUser, false);
      }
    }
  } catch(e) {}
}

function saveToStorage() {
  try {
    localStorage.setItem('estatex', JSON.stringify({
      favorites: state.favorites,
      compareList: state.compareList,
      searchHistory: state.searchHistory,
      currentUser: state.currentUser || null
    }));
  } catch(e) {}
}


function setupGoogleMaps() {
  if (!GOOGLE_MAPS_API_KEY) return;
  if (document.querySelector('script[data-estatecore-google-map]')) return;

  window.initEstateCoreMap = initEstateCoreMap;
  const script = document.createElement('script');
  script.dataset.estatecoreGoogleMap = 'true';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&callback=initEstateCoreMap&v=weekly&libraries=marker`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function initEstateCoreMap() {
  const mapElement = document.getElementById('mapView');
  if (!mapElement || !window.google?.maps) return;
  if (googleMap) {
    google.maps.event.trigger(googleMap, 'resize');
    googleMap.setCenter({ lat: 3.139, lng: 101.686 });
    return;
  }

  mapElement.classList.add('google-map-active');
  googleMap = new google.maps.Map(mapElement, {
    center: { lat: 3.139, lng: 101.686 },
    zoom: 10,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#a0a0c0' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
      { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e1e3a' }] }
    ]
  });

  googleInfoWindow = new google.maps.InfoWindow();
  googleMarkers = new Map();

  DB.listings.filter(l => l.status === 'active').forEach(listing => {
    const isRent = listing.listingType === 'rent';
    const label = isRent
      ? `RM ${listing.price.toLocaleString()}/mo`
      : `RM ${listing.price.toLocaleString()}`;
    const color = isRent ? '#4f9cf9' : '#c9a96e';
    const textColor = isRent ? 'white' : 'black';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="30">
      <rect width="96" height="24" rx="7" fill="${color}"/>
      <polygon points="43,24 53,24 48,31" fill="${color}"/>
      <text x="48" y="16" text-anchor="middle" fill="${textColor}" font-size="10" font-weight="bold" font-family="Arial,sans-serif">${label}</text>
    </svg>`;

    const marker = new google.maps.Marker({
      map: googleMap,
      position: { lat: Number(listing.lat), lng: Number(listing.lng) },
      title: listing.title,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        scaledSize: new google.maps.Size(96, 36),
        anchor: new google.maps.Point(48, 31)
      }
    });

    marker.addListener('click', () => {
      googleInfoWindow.setContent(`
        <div style="font-family:sans-serif;padding:4px 2px;min-width:190px">
          <div style="font-size:1.4rem;margin-bottom:6px">${listing.emoji}</div>
          <div style="font-weight:bold;font-size:13px;margin-bottom:2px">${listing.title}</div>
          <div style="color:#888;font-size:12px;margin-bottom:6px">📍 ${listing.location}</div>
          <div style="font-weight:bold;color:#b8860b;font-size:14px;margin-bottom:8px">RM ${listing.price.toLocaleString()}${isRent ? '/mo' : ''}</div>
          <div style="font-size:11px;color:#888;margin-bottom:8px">🛏 ${listing.beds} &nbsp;|&nbsp; 🚿 ${listing.baths} &nbsp;|&nbsp; 📐 ${listing.size} sqft</div>
          <button onclick="openDetail(${listing.id})" style="background:#c9a96e;color:#000;border:none;padding:7px 0;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold;width:100%">View Property →</button>
        </div>
      `);
      googleInfoWindow.open({ anchor: marker, map: googleMap });
    });

    googleMarkers.set(listing.id, marker);
  });

  filterMapPins();
}
function renderAll() {
  renderFeatured();
  renderRecommended();
  renderListings();
  renderFavorites();
  renderMapPins();
  renderMapList();
  updateFavBtn();
  updateCompareUI();
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const el = document.getElementById('page-' + page);
  if (el) { el.classList.remove('hidden'); state.currentPage = page; }
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });
  window.scrollTo(0,0);
  closeUserDropdown();
  if (page === 'favorites') renderFavorites();
  if (page === 'profile') renderProfile();
  if (page === 'listings') renderListings();
  if (page === 'map') {
    setupGoogleMaps();
    setTimeout(() => {
      if (googleMap && window.google?.maps) {
        google.maps.event.trigger(googleMap, 'resize');
        googleMap.setCenter({ lat: 3.139, lng: 101.686 });
      }
    }, 150);
  }
}

// ======== AUTH ========
function openAuth() { document.getElementById('authModal').classList.remove('hidden'); }
function closeAuth() { document.getElementById('authModal').classList.add('hidden'); }
function switchTab(tab) {
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');
  document.getElementById('resetForm')?.classList.toggle('hidden', tab !== 'reset');
  document.querySelectorAll('.auth-tab').forEach((t,i) => t.classList.toggle('active', (i===0 && tab==='login') || (i===1 && tab==='signup')));
}
function setRole(el, role) {
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active'); el.dataset.role = role;
}

async function sendResetLink() {
  const email = document.getElementById('resetEmail').value.trim().toLowerCase();
  const message = document.getElementById('resetMessage');

  if (!email) {
    showToast('Please enter your email address', 'error');
    return;
  }

  try {
    const result = await apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    message.textContent = result.message;
    showToast('Password reset link prepared', 'success');
  } catch (error) {
    message.textContent = error.message;
    showToast(error.message, 'error');
  }
}
async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPwd').value;
  if (!email) {
    showToast('Please enter your email address', 'error');
    return;
  }
  try {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    loginAs(result.user);
    closeAuth();
    showToast(`Welcome back, ${result.user.name.split(' ')[0]}!`, 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function doSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPwd').value;
  const role = document.querySelector('.role-btn.active')?.dataset.role || 'buyer';
  if (!name || !email || !password) { showToast('Please fill all fields', 'error'); return; }
  try {
    const result = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
    loginAs(result.user);
    closeAuth();
    showToast(`Welcome to EstateCore, ${result.user.name.split(' ')[0]}!`, 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function doLoginWith(user) { loginAs(user); }

function loginAs(user, save = true) {
  state.currentUser = user;
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('userMenu').classList.remove('hidden');
  document.getElementById('userAvatar').textContent = user.name[0].toUpperCase();
  document.getElementById('dropdownName').textContent = user.name;
  document.getElementById('dropdownRole').textContent = capitalize(user.role);

  const agentOnly = document.querySelectorAll('.agent-only');
  agentOnly.forEach(el => el.classList.toggle('hidden', user.role === 'buyer'));
  if (save) saveToStorage();
}

function doLogout() {
  state.currentUser = null;
  document.getElementById('loginBtn').style.display = '';
  document.getElementById('userMenu').classList.add('hidden');
  document.querySelectorAll('.agent-only').forEach(el => el.classList.add('hidden'));
  showPage('home'); showToast('Signed out successfully', 'info');
  saveToStorage();
}

function toggleUserDropdown() {
  document.getElementById('userDropdown').classList.toggle('hidden');
}
function closeUserDropdown() { document.getElementById('userDropdown').classList.add('hidden'); }
document.addEventListener('click', e => {
  if (!e.target.closest('.user-menu')) closeUserDropdown();
});

function getFilteredListings() {
  const f = state.filters;
  let list = DB.listings.filter(l => l.status !== 'removed');
  if (f.keyword) list = list.filter(l => l.title.toLowerCase().includes(f.keyword.toLowerCase()) || l.desc.toLowerCase().includes(f.keyword.toLowerCase()));
  if (f.location) list = list.filter(l => l.location.toLowerCase().includes(f.location.toLowerCase()) || l.city.toLowerCase().includes(f.location.toLowerCase()));
  if (f.listingType) list = list.filter(l => l.listingType === f.listingType);
  if (f.type) list = list.filter(l => l.type === f.type);
  if (f.minPrice) list = list.filter(l => l.price >= Number(f.minPrice));
  if (f.maxPrice) list = list.filter(l => l.price <= Number(f.maxPrice));
  if (f.beds > 0) list = list.filter(l => l.beds >= f.beds);
  if (f.baths > 0) list = list.filter(l => l.baths >= f.baths);
  if (f.amenities.length > 0) list = list.filter(l => f.amenities.every(a => l.amenities.includes(a)));
  // sort
  if (f.sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  else if (f.sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  else if (f.sort === 'newest') list.sort((a,b) => b.id - a.id);
  else if (f.sort === 'size') list.sort((a,b) => b.size - a.size);
  return list;
}

function renderCard(listing, compact = false) {
  const isFav = state.favorites.includes(listing.id);
  const inCompare = state.compareList.includes(listing.id);
  const price = listing.listingType === 'rent'
    ? `RM ${listing.price.toLocaleString()}/mo`
    : `RM ${(listing.price/1000).toFixed(0)}k`;

  return `
    <div class="property-card" onclick="openDetail(${listing.id})">
      <div class="card-image-wrap">
        <div class="card-image"><span class="card-image-emoji">${listing.emoji}</span></div>
        <div class="card-badge badge-${listing.listingType}">${listing.listingType === 'rent' ? 'For Rent' : 'For Sale'}</div>
        ${listing.featured ? '<div class="card-badge badge-featured" style="top:42px">Featured</div>' : ''}
        <div class="card-actions" onclick="event.stopPropagation()">
          <button class="card-action-btn ${isFav ? 'active' : ''}" onclick="toggleFav(${listing.id},this)" title="Save">
            ${isFav ? '❤️' : '♡'}
          </button>
          <button class="card-action-btn ${inCompare ? 'compare-active' : ''}" onclick="toggleCompare(${listing.id},this)" title="Compare">
            ⇄
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-price"><sup>RM</sup>${formatPrice(listing)}</div>
        <div class="card-title">${listing.title}</div>
        <div class="card-location">${listing.location}</div>
        <div class="card-meta">
          <div class="card-meta-item"><span>🛏</span> ${listing.beds} Bed${listing.beds>1?'s':''}</div>
          <div class="card-meta-item"><span>🚿</span> ${listing.baths} Bath${listing.baths>1?'s':''}</div>
          <div class="card-meta-item"><span>📐</span> ${listing.size.toLocaleString()} sqft</div>
        </div>
      </div>
      <div class="card-agent">
        <div class="agent-avatar-sm">${listing.agent[0]}</div>
        <div class="agent-name-sm">${listing.agent}</div>
        <div class="card-rating">★ ${listing.rating}</div>
      </div>
    </div>`;
}

function formatPrice(l) {
  if (l.listingType === 'rent') return `${l.price.toLocaleString()}<small style="font-size:0.5em;color:var(--text2)">/mo</small>`;
  if (l.price >= 1000000) return `${(l.price/1000000).toFixed(2)}M`;
  return `${(l.price/1000).toFixed(0)}K`;
}

function renderFeatured() {
  const featured = DB.listings.filter(l => l.featured && l.status === 'active').slice(0, 6);
  document.getElementById('featuredGrid').innerHTML = featured.map(l => renderCard(l)).join('');
  document.getElementById('statTotal').textContent = DB.listings.filter(l=>l.status==='active').length + '+';
}

function renderRecommended() {
  let recs;
  if (state.searchHistory.length > 0 || state.favorites.length > 0) {
    const favListings = DB.listings.filter(l => state.favorites.includes(l.id));
    const favTypes = [...new Set(favListings.map(l => l.type))];
    recs = DB.listings.filter(l => l.status === 'active' && (favTypes.includes(l.type) || state.searchHistory.some(s => l.location.toLowerCase().includes(s.toLowerCase())))).slice(0, 4);
  }
  if (!recs || recs.length === 0) recs = DB.listings.filter(l => l.status === 'active').sort((a,b) => b.rating - a.rating).slice(0, 4);
  document.getElementById('recommendedGrid').innerHTML = recs.map(l => renderCard(l)).join('');
}

function renderListings() {
  const filtered = getFilteredListings();
  const grid = document.getElementById('mainListingsGrid');
  const noRes = document.getElementById('noResults');
  const count = document.getElementById('filteredCount');
  count.textContent = `${filtered.length} propert${filtered.length===1?'y':'ies'} found`;
  document.getElementById('listingsCount').textContent = `${filtered.length} properties available`;
  if (filtered.length === 0) { grid.innerHTML = ''; noRes.classList.remove('hidden'); }
  else { noRes.classList.add('hidden'); grid.innerHTML = filtered.map(l => renderCard(l)).join(''); }
}

function applyFilters() {
  state.filters.keyword = document.getElementById('filterKeyword')?.value || '';
  state.filters.location = document.getElementById('filterLocation')?.value || '';
  state.filters.type = document.getElementById('filterType')?.value || '';
  state.filters.minPrice = document.getElementById('filterMinPrice')?.value || '';
  state.filters.maxPrice = document.getElementById('filterMaxPrice')?.value || '';
  state.filters.sort = document.getElementById('filterSort')?.value || 'default';
  const amenityCheckboxes = document.querySelectorAll('.checkbox-group input:checked');
  state.filters.amenities = Array.from(amenityCheckboxes).map(c => c.value);
  renderListings();
}

function resetFilters() {
  state.filters = { keyword: '', location: '', listingType: '', type: '', minPrice: '', maxPrice: '', beds: 0, baths: 0, amenities: [], sort: 'default' };
  ['filterKeyword','filterLocation','filterType','filterMinPrice','filterMaxPrice'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  document.getElementById('filterSort').value = 'default';
  document.querySelectorAll('.checkbox-group input').forEach(c => c.checked = false);
  document.querySelectorAll('.pill').forEach((p,i) => p.classList.toggle('active', i===0));
  document.querySelectorAll('#bedroomPills .pill, #bathroomPills .pill').forEach((p,i) => p.classList.toggle('active', i===0));
  setListingType('', document.getElementById('toggleAll'));
  renderListings();
}

function setListingType(type, el) {
  state.filters.listingType = type;
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderListings();
}

function setBeds(n, el) {
  state.filters.beds = n;
  document.querySelectorAll('#bedroomPills .pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderListings();
}
function setBaths(n, el) {
  state.filters.baths = n;
  document.querySelectorAll('#bathroomPills .pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderListings();
}

function setView(view, el) {
  document.getElementById('mainListingsGrid').classList.toggle('list-view', view === 'list');
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function updateTypeCounts() {
  const active = DB.listings.filter(l => l.status === 'active');
  ['House','Condo','Apartment','Villa'].forEach(t => {
    const el = document.getElementById('type' + t);
    if (el) el.textContent = active.filter(l => l.type === t).length + ' listings';
  });
}

function heroSearchGo() {
  const q = document.getElementById('heroSearch').value.trim();
  const type = document.getElementById('heroType').value;
  const purpose = document.getElementById('heroPurpose').value;
  if (q) { state.filters.location = q; state.searchHistory.push(q); saveToStorage(); }
  if (type) state.filters.type = type;
  if (purpose) state.filters.listingType = purpose;
  showPage('listings');
  renderListings();
}
function updateHeroSearch() {}
function quickSearch(city) {
  state.filters.location = city;
  state.searchHistory.push(city);
  saveToStorage();
  showPage('listings');
  renderListings();
}
function filterByType(type) {
  state.filters.type = type;
  showPage('listings');
  renderListings();
}

function openDetail(id) {
  const l = DB.listings.find(x => x.id === id);
  if (!l) return;
  const isFav = state.favorites.includes(id);
  const html = `
    <div class="detail-back-row">
      <button class="detail-back-btn" type="button" onclick="closeDetail()">← Back to listings</button>
    </div>
    <div class="detail-gallery">
      ${l.emoji}
      <div class="detail-gallery-badge"><span class="card-badge badge-${l.listingType}">${l.listingType==='rent'?'For Rent':'For Sale'}</span></div>
    </div>
    <div class="detail-body">
      <div class="detail-header">
        <div>
          <div class="detail-price">RM ${l.price.toLocaleString()}${l.listingType==='rent'?'/mo':''}</div>
          <div class="detail-title">${l.title}</div>
          <div class="detail-location">📍 ${l.location}</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-primary" onclick="openSchedule(${l.id})">📅 Schedule Viewing</button>
          <button class="btn-ghost" onclick="toggleFavDetail(${l.id},this)">${isFav?'❤️ Saved':'♡ Save'}</button>
        </div>
      </div>
      <div class="detail-meta-row">
        <div class="detail-meta-item"><span>Type</span><span>${l.type}</span></div>
        <div class="detail-meta-item"><span>Bedrooms</span><span>${l.beds}</span></div>
        <div class="detail-meta-item"><span>Bathrooms</span><span>${l.baths}</span></div>
        <div class="detail-meta-item"><span>Size</span><span>${l.size.toLocaleString()} sqft</span></div>
        <div class="detail-meta-item"><span>Rating</span><span>★ ${l.rating}</span></div>
      </div>
      <div class="detail-grid">
        <div>
          <div class="detail-desc">
            <h4>About this property</h4>
            <p>${l.desc}</p>
            <h4>Amenities</h4>
            <div class="amenity-tags">${l.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}</div>
          </div>
          <div class="rating-section">
            <h4>Rate this property</h4>
            <div class="stars" id="detailStars">
              ${[1,2,3,4,5].map(i=>`<span class="star ${i<=state.selectedRating?'active':''}" onclick="setRating(${i},${l.id})" onmouseover="hoverStars(${i})" onmouseout="resetStars(${l.id})">★</span>`).join('')}
            </div>
            ${l.reviews.length > 0 ? `<div class="reviews-list">${l.reviews.map(r=>`<div class="review-item"><div class="review-stars">${'★'.repeat(r.rating)}</div><strong>${r.user}</strong><p>${r.text}</p></div>`).join('')}</div>` : '<p style="font-size:0.82rem;color:var(--text3)">No reviews yet</p>'}
          </div>
        </div>
        <div class="detail-sidebar">
          <div class="agent-card">
            <div class="agent-card-header">
              <div class="agent-avatar">${l.agent[0]}</div>
              <div><div class="agent-card-name">${l.agent}</div><div class="agent-card-role">Verified Agent</div></div>
            </div>
            <div class="agent-rating">★★★★★ ${l.rating}/5.0</div>
            <button class="btn-primary full" onclick="showToast('Message sent to agent!','success')">✉ Contact Agent</button>
            <button class="btn-ghost full" style="margin-top:8px" onclick="showToast('📞 +60 11-234 5678','info')">📞 Show Number</button>
          </div>
          <div class="map-placeholder">
            <span>🗺</span>
            <span>${l.location}</span>
            <span style="font-size:0.65rem">Map integration available</span>
          </div>
          <button class="btn-ghost full" onclick="document.getElementById('calcModal').classList.remove('hidden');document.getElementById('calcPrice').value=${l.price};calcMortgage()">💰 Mortgage Calculator</button>
        </div>
      </div>
    </div>`;
  document.getElementById('detailContent').innerHTML = html;
  document.getElementById('detailModal').classList.remove('hidden');
}

function closeDetail() { document.getElementById('detailModal').classList.add('hidden'); state.selectedRating = 0; }
function toggleFavDetail(id, btn) {
  toggleFav(id, null);
  const isFav = state.favorites.includes(id);
  btn.textContent = isFav ? '❤️ Saved' : '♡ Save';
}
function hoverStars(n) { document.querySelectorAll('#detailStars .star').forEach((s,i) => s.classList.toggle('active', i<n)); }
function resetStars(id) { const l = DB.listings.find(x=>x.id===id); hoverStars(state.selectedRating); }
function setRating(n, id) {
  state.selectedRating = n;
  hoverStars(n);
  showToast(`You rated this property ${n} star${n>1?'s':''}!`, 'success');
}

// ======== SCHEDULE VIEWING ========
function openSchedule(id) {
  const l = DB.listings.find(x => x.id === id);
  document.getElementById('schedulePropertyName').textContent = l ? l.title : '';
  document.getElementById('scheduleModal').classList.remove('hidden');
  document.getElementById('detailModal').classList.add('hidden');
}
async function confirmSchedule() {
  const name = document.getElementById('schedName').value;
  const email = document.getElementById('schedEmail').value;
  const phone = document.getElementById('schedPhone').value;
  const date = document.getElementById('schedDate').value;
  const time = document.getElementById('schedTime').value;
  const note = document.getElementById('schedMsg').value;
  const propertyName = document.getElementById('schedulePropertyName').textContent;
  const listing = DB.listings.find(x => x.title === propertyName);
  if (!name || !date || !listing) { showToast('Please fill in required fields', 'error'); return; }
  try {
    await apiRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        userId: state.currentUser?.id || null,
        listingId: listing.id,
        name,
        email,
        phone,
        date,
        time,
        note
      })
    });
    document.getElementById('scheduleModal').classList.add('hidden');
    showToast('Viewing scheduled. Confirmation has been recorded.', 'success');
    state.viewingSchedules.push({ name, date, time, listingId: listing.id });
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function toggleFav(id, btn) {
  const idx = state.favorites.indexOf(id);
  if (idx > -1) { state.favorites.splice(idx, 1); if(btn){btn.textContent='♡';btn.classList.remove('active');} showToast('Removed from saved properties', 'info'); }
  else {
    if (!state.currentUser) { openAuth(); return; }
    state.favorites.push(id);
    if(btn){btn.innerHTML='❤️';btn.classList.add('active');}
    showToast('❤️ Saved to favorites!', 'success');
  }
  updateFavBtn();
  if (state.currentPage === 'favorites') renderFavorites();
  saveToStorage();
}

function updateFavBtn() {
  document.getElementById('favCount').textContent = state.favorites.length;
  const btn = document.getElementById('compareBtn');
  if (btn) btn.style.display = state.favorites.length >= 2 ? '' : 'none';
}

function renderFavorites() {
  const grid = document.getElementById('favoritesGrid');
  const empty = document.getElementById('emptyFav');
  const favListings = DB.listings.filter(l => state.favorites.includes(l.id));
  if (favListings.length === 0) { grid.innerHTML = ''; empty.classList.remove('hidden'); }
  else { empty.classList.add('hidden'); grid.innerHTML = favListings.map(l => renderCard(l)).join(''); }
}

function toggleCompare(id, btn) {
  const idx = state.compareList.indexOf(id);
  if (idx > -1) {
    state.compareList.splice(idx, 1);
    if(btn){btn.classList.remove('compare-active');}
    showToast('Removed from compare', 'info');
  } else {
    if (state.compareList.length >= 3) { showToast('Max 3 properties to compare', 'error'); return; }
    state.compareList.push(id);
    if(btn){btn.classList.add('compare-active');}
    showToast('Added to compare!', 'info');
  }
  updateCompareUI();
  saveToStorage();
}

function updateCompareUI() {
  const tray = document.getElementById('compareTray');
  const count = document.getElementById('compareCount');
  if (state.compareList.length > 0) {
    tray.classList.remove('hidden');
    count.textContent = state.compareList.length;
    const items = state.compareList.map(id => {
      const l = DB.listings.find(x => x.id === id);
      return `<div class="compare-tray-item">${l.emoji} ${l.title.split('@')[0].trim()}<button onclick="toggleCompare(${id},null)">✕</button></div>`;
    }).join('');
    document.getElementById('compareTrayItems').innerHTML = items;
  } else {
    tray.classList.add('hidden');
    if (count) count.textContent = '0';
  }
}

function clearCompare() { state.compareList = []; updateCompareUI(); renderListings(); saveToStorage(); }

function openCompare() {
  if (state.compareList.length < 2) { showToast('Select at least 2 properties to compare', 'error'); return; }
  const listings = state.compareList.map(id => DB.listings.find(l => l.id === id));
  const fields = [
    ['emoji', 'Property'],
    ['price', 'Price', v => `RM ${v.toLocaleString()}`],
    ['type', 'Type'],
    ['location', 'Location'],
    ['beds', 'Bedrooms'],
    ['baths', 'Bathrooms'],
    ['size', 'Size', v => `${v.toLocaleString()} sqft`],
    ['rating', 'Rating', v => `★ ${v}`],
    ['listingType', 'Listing', v => v === 'rent' ? 'For Rent' : 'For Sale'],
  ];
  let html = '<div style="overflow-x:auto"><table class="compare-table">';
  html += '<thead><tr><th>Feature</th>' + listings.map(l => `<th>${l.title}</th>`).join('') + '</tr></thead><tbody>';
  fields.forEach(([key, label, fmt]) => {
    html += `<tr><td style="font-size:0.78rem;color:var(--text2);text-align:left;font-weight:500">${label}</td>`;
    listings.forEach(l => { html += `<td>${fmt ? fmt(l[key]) : l[key]}</td>`; });
    html += '</tr>';
  });

  html += `<tr><td style="font-size:0.78rem;color:var(--text2);text-align:left;font-weight:500">Amenities</td>`;
  listings.forEach(l => { html += `<td style="font-size:0.75rem">${l.amenities.join(', ')}</td>`; });
  html += '</tr></tbody></table></div>';
  document.getElementById('compareContent').innerHTML = html;
  document.getElementById('compareModal').classList.remove('hidden');
}

function renderMapPins() {
  const container = document.getElementById('mapPinsContainer');
  if (!container) return;
  const listings = DB.listings.filter(l => l.status === 'active');
  // Simulate pin positions based on index
  const positions = [
    {x:52,y:38},{x:30,y:52},{x:65,y:28},{x:42,y:62},{x:72,y:48},
    {x:25,y:35},{x:58,y:70},{x:78,y:35},{x:38,y:75},{x:85,y:58},
    {x:18,y:65},{x:55,y:45}
  ];
  container.innerHTML = listings.map((l, i) => {
    const pos = positions[i % positions.length];
    const isRent = l.listingType === 'rent';
    const priceLabel = isRent ? `RM ${l.price.toLocaleString()}/mo` : `RM ${l.price.toLocaleString()}`;
    return `<div class="map-pin" style="left:${pos.x}%;top:${pos.y}%"
      onmouseenter="showMapTooltip(${l.id},${pos.x},${pos.y})"
      onmouseleave="hideMapTooltip()"
      onclick="openDetail(${l.id})">
      <div class="map-pin-inner ${isRent?'rent':''}">${priceLabel}</div>
    </div>`;
  }).join('');
}

function showMapTooltip(id, x, y) {
  const l = DB.listings.find(d => d.id === id);
  const tooltip = document.getElementById('mapTooltip');
  tooltip.innerHTML = `<div style="font-size:1.5rem;margin-bottom:6px">${l.emoji}</div>
    <div style="font-size:0.85rem;font-weight:500;margin-bottom:2px">${l.title}</div>
    <div style="font-size:0.75rem;color:var(--text2);margin-bottom:6px">📍 ${l.location}</div>
    <div style="font-size:0.9rem;color:var(--gold);font-family:'Cormorant Garamond',serif">RM ${l.price.toLocaleString()}${l.listingType==='rent'?'/mo':''}</div>
    <div style="font-size:0.72rem;color:var(--text3);margin-top:4px">🛏 ${l.beds} | 🚿 ${l.baths} | 📐 ${l.size}sqft</div>`;
  const adjustedX = x > 70 ? 'auto' : `${x+2}%`;
  const adjustedRight = x > 70 ? `${100-x+2}%` : 'auto';
  tooltip.style.left = adjustedX;
  tooltip.style.right = adjustedRight;
  tooltip.style.top = `${Math.max(5, y-25)}%`;
  tooltip.classList.remove('hidden');
}
function hideMapTooltip() { document.getElementById('mapTooltip').classList.add('hidden'); }

function renderMapList() {
  const list = document.getElementById('mapListingsList');
  if (!list) return;
  const listings = DB.listings.filter(l => l.status === 'active');
  list.innerHTML = listings.map(l => `
    <div class="map-listing-item" onclick="openDetail(${l.id})" id="mapItem${l.id}">
      <div class="map-listing-emoji">${l.emoji}</div>
      <div class="map-listing-info">
        <div class="map-listing-title">${l.title}</div>
        <div class="map-listing-loc">${l.location}</div>
        <div class="map-listing-price">RM ${l.price.toLocaleString()}${l.listingType==='rent'?'/mo':''}</div>
      </div>
    </div>`).join('');
}

function filterMapPins() {
  const q = document.getElementById('mapSearch')?.value?.toLowerCase() || '';
  const type = document.getElementById('mapTypeFilter')?.value || '';
  const listings = DB.listings.filter(l => l.status === 'active');
  listings.forEach(l => {
    const show = (!q || l.location.toLowerCase().includes(q) || l.title.toLowerCase().includes(q)) && (!type || l.type === type);
    const item = document.getElementById('mapItem' + l.id);
    if (item) item.style.display = show ? '' : 'none';
    if (googleMap && googleMarkers.has(l.id)) {
      googleMarkers.get(l.id).setVisible(show);
    }
  });
}

async function submitListing() {
  if (!state.currentUser) { openAuth(); return; }
  const title = document.getElementById('newTitle').value.trim();
  const type = document.getElementById('newType').value;
  const price = Number(document.getElementById('newPrice').value);
  const location = document.getElementById('newLocation').value.trim();
  if (!title || !type || !price || !location) { showToast('Please fill all required fields', 'error'); return; }
  try {
    const created = await apiRequest('/api/listings', {
      method: 'POST',
      body: JSON.stringify({
        title,
        type,
        price,
        location,
        city: location,
        listingType: document.getElementById('newListingType').value,
        beds: Number(document.getElementById('newBeds').value) || 1,
        baths: Number(document.getElementById('newBaths').value) || 1,
        size: Number(document.getElementById('newSize').value) || 1000,
        desc: document.getElementById('newDesc').value,
        amenities: document.getElementById('newAmenities').value.split(',').map(s => s.trim()).filter(Boolean),
        agent: state.currentUser.name,
        agentId: state.currentUser.id,
        lat: 3.1,
        lng: 101.6
      })
    });
    DB.listings.unshift(created);
    document.getElementById('addListingModal').classList.add('hidden');
    renderAll();
    updateStats();
    showToast('Listing submitted for approval', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function renderProfile() {
  if (!state.currentUser) return;
  const u = state.currentUser;
  document.getElementById('profileAvatar').textContent = u.name[0].toUpperCase();
  document.getElementById('profileName').textContent = u.name;
  document.getElementById('profileEmail').textContent = u.email;
  document.getElementById('profileRole').textContent = capitalize(u.role);
  document.getElementById('editName').value = u.name;
  document.getElementById('editEmail').value = u.email;
  document.getElementById('editPhone').value = u.phone || '';
}
function saveProfile() {
  if (!state.currentUser) return;
  state.currentUser.name = document.getElementById('editName').value;
  state.currentUser.email = document.getElementById('editEmail').value;
  state.currentUser.phone = document.getElementById('editPhone').value;
  document.getElementById('userAvatar').textContent = state.currentUser.name[0].toUpperCase();
  document.getElementById('dropdownName').textContent = state.currentUser.name;
  renderProfile();
  showToast('Profile updated!', 'success');
  saveToStorage();
}

function calcMortgage() {
  const price = Number(document.getElementById('calcPrice')?.value) || 500000;
  const downPct = Number(document.getElementById('calcDown')?.value) || 10;
  const term = Number(document.getElementById('calcTerm')?.value) || 20;
  const rate = Number(document.getElementById('calcRate')?.value) || 4.5;
  if(document.getElementById('calcDownVal')) document.getElementById('calcDownVal').textContent = downPct + '%';
  const loan = price * (1 - downPct/100);
  const monthlyRate = rate/100/12;
  const n = term * 12;
  const monthly = monthlyRate === 0 ? loan/n : loan * (monthlyRate * Math.pow(1+monthlyRate,n)) / (Math.pow(1+monthlyRate,n)-1);
  const totalPaid = monthly * n;
  const totalInterest = totalPaid - loan;
  if(document.getElementById('calcMonthly')) document.getElementById('calcMonthly').textContent = `RM ${monthly.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  if(document.getElementById('calcLoan')) document.getElementById('calcLoan').textContent = `RM ${loan.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  if(document.getElementById('calcInterest')) document.getElementById('calcInterest').textContent = `RM ${totalInterest.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  if(document.getElementById('calcTotal')) document.getElementById('calcTotal').textContent = `RM ${totalPaid.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function toggleMobileNav() { document.getElementById('mobileNav').classList.toggle('hidden'); }

let toastTimer;
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3200);
}

// ======== STATS ========
function updateStats() {
  const total = DB.listings.filter(l=>l.status==='active').length;
  document.getElementById('statTotal').textContent = total + '+';
}

// ======== HELPERS ========
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
