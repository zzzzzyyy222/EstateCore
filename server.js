require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const APP_ROOT = __dirname;

app.use(cors({ origin: FRONTEND_ORIGIN === '*' ? true : FRONTEND_ORIGIN }));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'buyer',
      phone TEXT DEFAULT '',
      joined DATE DEFAULT CURRENT_DATE
    );

    CREATE TABLE IF NOT EXISTS listings (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      listing_type TEXT NOT NULL DEFAULT 'sale',
      price NUMERIC NOT NULL,
      location TEXT NOT NULL,
      city TEXT NOT NULL,
      beds INTEGER DEFAULT 0,
      baths INTEGER DEFAULT 0,
      size INTEGER DEFAULT 0,
      amenities JSONB DEFAULT '[]',
      description TEXT DEFAULT '',
      agent TEXT DEFAULT 'Demo Agent',
      agent_id INTEGER DEFAULT 2,
      rating NUMERIC DEFAULT 0,
      reviews JSONB DEFAULT '[]',
      status TEXT DEFAULT 'pending',
      featured BOOLEAN DEFAULT false,
      emoji TEXT DEFAULT '🏠',
      lat NUMERIC DEFAULT 3.139,
      lng NUMERIC DEFAULT 101.686
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      listing_id INTEGER,
      name TEXT,
      email TEXT,
      phone TEXT,
      date DATE,
      time TEXT,
      note TEXT,
      status TEXT DEFAULT 'requested',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, listing_id)
    );
  `);

  // Seed demo users if empty
  const { rowCount } = await pool.query('SELECT 1 FROM users LIMIT 1');
  if (rowCount === 0) {
    await pool.query(`
      INSERT INTO users (name, email, password, role, phone, joined) VALUES
      ('Admin User',     'admin@demo.com',  'any', 'admin', '+60 12-345 6789', '2024-01-15'),
      ('Ahmad Farid',    'agent@demo.com',  'any', 'agent', '+60 11-234 5678', '2024-02-10'),
      ('Siti Nurhaliza', 'buyer@demo.com',  'any', 'buyer', '+60 16-789 0123', '2024-03-05')
    `);
  }

  const { rowCount: lCount } = await pool.query('SELECT 1 FROM listings LIMIT 1');
  if (lCount === 0) {
    const seed = [
      ['Luxury Skyline Condo @ KLCC','Condo','sale',1850000,'Kuala Lumpur','Kuala Lumpur',3,2,1450,'["Pool","Gym","Parking","Security"]','Stunning skyline views with premium finishes. Fully furnished luxury unit steps from the iconic towers.','Ahmad Farid',2,4.8,'[{"user":"Lee Wei","rating":5,"text":"Absolutely breathtaking views, top-notch facilities!"}]','active',true,'🏢',3.158,101.712],
      ['Modern 4BR Bungalow in Damansara','House','sale',2400000,'Petaling Jaya','Petaling Jaya',4,3,3200,'["Pool","Garden","Parking","Security"]','Beautifully renovated bungalow with private pool and lush garden in a gated community.','Ahmad Farid',2,4.9,'[]','active',true,'🏡',3.128,101.621],
      ['Cozy Studio Apartment @ Mont Kiara','Apartment','rent',2200,'Kuala Lumpur','Kuala Lumpur',1,1,550,'["Gym","Pool","Parking"]','Chic studio in the heart of Mont Kiara. Fully furnished, walk to cafes and international schools.','Ahmad Farid',2,4.6,'[]','active',false,'🏠',3.169,101.651],
      ['Elegant Penthouse @ Bangsar South','Condo','sale',3200000,'Kuala Lumpur','Kuala Lumpur',4,4,2800,'["Pool","Gym","Parking","Security","Furnished"]','Rare duplex penthouse offering panoramic city views. Private rooftop deck, designer kitchen, smart home features.','Ahmad Farid',2,5.0,'[]','active',true,'🏙️',3.111,101.680],
      ['Charming Terrace House @ Taman Tun','House','sale',980000,'Kuala Lumpur','Kuala Lumpur',4,3,2100,'["Garden","Parking"]','Well-maintained terrace house in one of KLs most sought-after neighbourhoods. Large garden, renovated kitchen.','Ahmad Farid',2,4.5,'[]','active',false,'🏘️',3.145,101.629],
      ['New Condo @ PJ Uptown','Condo','rent',3500,'Petaling Jaya','Petaling Jaya',2,2,900,'["Pool","Gym","Parking","Furnished"]','Brand new unit in PJ Uptown with full facilities. Walking distance to LRT and Jaya One mall.','Ahmad Farid',2,4.7,'[]','active',false,'🏢',3.103,101.637],
      ['Seafront Villa in Penang Hill','Villa','sale',4500000,'Penang','Penang',5,5,5000,'["Pool","Garden","Parking","Security","Gym"]','Spectacular hilltop villa with sweeping sea views. Private infinity pool, smart home technology, lavish interiors.','Ahmad Farid',2,4.9,'[]','active',true,'🏖️',5.421,100.274],
      ['Affordable Apartment @ Subang Jaya','Apartment','rent',1400,'Subang Jaya','Subang',2,1,700,'["Parking"]','Clean and affordable apartment in Subang Jaya, close to amenities and public transport.','Ahmad Farid',2,4.2,'[]','active',false,'🏬',3.055,101.582],
      ['Heritage Shophouse @ Georgetown','House','sale',1200000,'Penang','Penang',3,2,1600,'["Garden"]','Beautifully restored pre-war shophouse in UNESCO Heritage Zone. Unique blend of history and modern living.','Ahmad Farid',2,4.8,'[]','active',false,'🏛️',5.414,100.330],
      ['New Launch Condo @ Johor Bahru','Condo','sale',650000,'Johor Bahru','Johor Bahru',3,2,1100,'["Pool","Gym","Parking","Security"]','New launch condominium near CIQ checkpoint. Excellent investment opportunity with strong rental yield.','Ahmad Farid',2,4.4,'[]','active',false,'🏗️',1.484,103.762],
      ['Semi-D in Setia Alam Shah Alam','House','sale',1450000,'Shah Alam','Shah Alam',5,4,3500,'["Garden","Parking","Security"]','Spacious semi-detached home in premium Setia Alam. Corner lot with extra land.','Ahmad Farid',2,4.6,'[]','pending',false,'🏠',3.069,101.487],
      ['SOHO @ KL Sentral','Apartment','rent',2800,'Kuala Lumpur','Kuala Lumpur',1,1,620,'["Gym","Pool","Parking","Security","Furnished"]','Fully furnished SOHO unit at KL Sentral. Perfect for professionals, direct access to transport hub.','Ahmad Farid',2,4.5,'[]','active',false,'🏢',3.133,101.686],
      ['Lakefront Residence @ Cyberjaya','Condo','sale',720000,'Cyberjaya','Cyberjaya',3,2,1050,'["Pool","Gym","Parking","Security","Lake View"]','New launch residence near Cyberjaya lake gardens. Under construction with expected completion in 2028.','Ahmad Farid',2,4.6,'[]','active',true,'🏢',2.9213,101.6559],
      ['Putrajaya Precinct 15 Family Home','House','sale',1180000,'Putrajaya','Putrajaya',4,3,2400,'["Garden","Parking","Security"]','Spacious family home close to schools, parks, and government offices in Putrajaya.','Nur Aina',2,4.7,'[]','active',false,'🏡',2.9264,101.6964],
      ['Merdeka View Suite @ Bukit Bintang','Apartment','rent',4200,'Bukit Bintang','Kuala Lumpur',2,2,880,'["Gym","Pool","Furnished","Security"]','Fully furnished city apartment with skyline views and quick access to MRT and shopping malls.','Jason Tan',2,4.8,'[]','active',true,'🏙️',3.1468,101.7113],
      ['Desa ParkCity Garden Condo','Condo','sale',1350000,'Desa ParkCity','Kuala Lumpur',3,2,1280,'["Pool","Gym","Parking","Park View","Security"]','Bright condo facing the central park, ideal for families who want walkable facilities.','Mei Ling',2,4.9,'[]','active',true,'🏢',3.1880,101.6300],
      ['Cheras MRT Serviced Apartment','Apartment','rent',2100,'Cheras','Kuala Lumpur',2,1,760,'["Near Transit","Parking","Security"]','Practical serviced apartment close to MRT, eateries, and daily conveniences.','Ahmad Farid',2,4.3,'[]','active',false,'🏬',3.1068,101.7250],
      ['Puchong South Terrace House','House','sale',820000,'Puchong','Puchong',4,3,1900,'["Garden","Parking"]','Renovated terrace house with open kitchen and easy access to major highways.','Nur Aina',2,4.4,'[]','active',false,'🏠',3.0327,101.6188],
      ['Setapak Student Studio','Apartment','rent',1200,'Setapak','Kuala Lumpur',1,1,480,'["Furnished","Security","Near Transit"]','Affordable studio near universities, food options, and public transport.','Jason Tan',2,4.1,'[]','active',false,'🏠',3.2001,101.7219],
      ['Kajang Semi-D Green Enclave','House','sale',1280000,'Kajang','Kajang',5,4,3300,'["Garden","Parking","Security"]','Quiet semi-detached home in a gated neighborhood with generous family spaces.','Mei Ling',2,4.6,'[]','active',false,'🏡',2.9935,101.7874],
      ['Seremban 2 Starter Home','House','sale',460000,'Seremban 2','Seremban',3,2,1400,'["Parking","Garden"]','Accessible starter home for first-time buyers, close to shops and schools.','Ahmad Farid',2,4.2,'[]','active',false,'🏘️',2.7297,101.9381],
      ['Klang Bandar Botanic Cluster Home','House','sale',930000,'Bandar Botanic','Klang',4,3,2200,'["Garden","Parking","Security"]','Cluster home in a mature township with nearby shopping and green spaces.','Nur Aina',2,4.5,'[]','active',false,'🏠',3.0029,101.4420],
      ['Ara Damansara Loft Suite','Condo','rent',3200,'Ara Damansara','Petaling Jaya',2,2,980,'["Gym","Pool","Parking","Furnished"]','Modern loft suite near LRT, business hubs, and lifestyle retail.','Jason Tan',2,4.6,'[]','active',false,'🏢',3.1126,101.5798],
      ['Ampang Hilltop Villa','Villa','sale',3900000,'Ampang','Kuala Lumpur',5,5,4600,'["Pool","Garden","Parking","Security","City View"]','Private hilltop villa with city views, pool deck, and large entertaining areas.','Mei Ling',2,4.9,'[]','active',true,'🏡',3.1594,101.7622],
      ['Genting Foothills Retreat','Villa','sale',2100000,'Genting Permai','Genting Highlands',4,4,3000,'["Garden","Security","Mountain View","Parking"]','Cool-weather retreat near Genting access road, ideal for holiday living.','Ahmad Farid',2,4.7,'[]','active',false,'🏔️',3.3866,101.7778],
      ['Iskandar Puteri New Launch Condo','Condo','sale',580000,'Iskandar Puteri','Johor Bahru',3,2,980,'["Pool","Gym","Parking","Security"]','New launch condo near EduCity and Medini. Under construction with expected completion in 2028.','Nur Aina',2,4.4,'[]','active',true,'🏗️',1.4270,103.6295],
      ['Batu Kawan Smart Condo','Condo','sale',520000,'Batu Kawan','Penang',3,2,920,'["Pool","Gym","Parking","Security"]','Upcoming smart condo near industrial and retail growth areas. Expected completion in 2027.','Jason Tan',2,4.3,'[]','active',false,'🏢',5.2417,100.4381],
      ['Bayan Lepas Airport Apartment','Apartment','rent',1800,'Bayan Lepas','Penang',2,2,780,'["Parking","Security","Near Transit"]','Convenient apartment near airport, factories, and Queensbay area.','Mei Ling',2,4.2,'[]','active',false,'🏬',5.2944,100.2598],
      ['Melaka Riverside Heritage Loft','Apartment','sale',690000,'Melaka Riverside','Melaka',2,2,1050,'["River View","Security","Parking"]','Character loft near Melaka river attractions with a compact modern layout.','Ahmad Farid',2,4.5,'[]','active',false,'🏛️',2.1944,102.2491],
      ['Ipoh Garden East Bungalow','House','sale',1380000,'Ipoh Garden East','Ipoh',5,4,3800,'["Garden","Parking","Mountain View"]','Large bungalow in an established neighborhood with views toward limestone hills.','Nur Aina',2,4.6,'[]','active',false,'🏡',4.6151,101.1164],
      ['Kota Kinabalu Seaview Condo','Condo','sale',980000,'Kota Kinabalu','Kota Kinabalu',3,2,1180,'["Sea View","Pool","Gym","Parking","Security"]','Seaview condo close to waterfront lifestyle and city conveniences.','Jason Tan',2,4.8,'[]','active',true,'🏖️',5.9804,116.0735],
      ['Kuching Riverfront Apartment','Apartment','rent',1900,'Kuching Riverfront','Kuching',2,2,850,'["River View","Furnished","Parking"]','Comfortable apartment near Kuching waterfront, cafes, and offices.','Mei Ling',2,4.4,'[]','active',false,'🏬',1.5533,110.3592],
      ['Miri Marina Bay Condo','Condo','rent',2600,'Miri Marina','Miri',3,2,1100,'["Sea View","Pool","Parking","Furnished"]','Furnished condo near marina lifestyle area, suitable for professionals and families.','Ahmad Farid',2,4.3,'[]','active',false,'🏢',4.3995,113.9914],
      ['Rawang Eco Terrace','House','sale',760000,'Rawang','Rawang',4,3,2000,'["Garden","Parking","Security"]','Eco township terrace home with wider roads, parks, and family-focused facilities.','Nur Aina',2,4.3,'[]','active',false,'🏘️',3.3213,101.5767],
      ['Setia Alam New Launch Residence','Condo','sale',610000,'Setia Alam','Shah Alam',3,2,1000,'["Pool","Gym","Parking","Security"]','New launch residence near Setia City Mall. Under construction with expected completion in 2028.','Jason Tan',2,4.4,'[]','pending',false,'🏗️',3.1088,101.4590],
      ['Kepong Metro Prima Apartment','Apartment','rent',1600,'Kepong','Kuala Lumpur',3,2,900,'["Parking","Security","Near Transit"]','Budget-friendly apartment near shops, schools, and transit options.','Mei Ling',2,4.1,'[]','active',false,'🏬',3.2140,101.6365],
    ];

    for (const row of seed) {
      await pool.query(
        `INSERT INTO listings
          (title,type,listing_type,price,location,city,beds,baths,size,amenities,description,agent,agent_id,rating,reviews,status,featured,emoji,lat,lng)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        row
      );
    }
  }

  console.log('Database ready.');
}

function rowToListing(r) {
  return {
    id: r.id, title: r.title, type: r.type, listingType: r.listing_type,
    price: Number(r.price), location: r.location, city: r.city,
    beds: r.beds, baths: r.baths, size: r.size,
    amenities: r.amenities, desc: r.description,
    agent: r.agent, agentId: r.agent_id,
    rating: Number(r.rating), reviews: r.reviews,
    status: r.status, featured: r.featured,
    emoji: r.emoji, lat: Number(r.lat), lng: Number(r.lng)
  };
}

function publicUser(u) {
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, joined: u.joined };
}

// ======== ROUTES ========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'EstateCore API', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
  if (!rows[0]) return res.status(401).json({ message: 'Account not found. Use buyer@demo.com, agent@demo.com, or admin@demo.com.' });
  res.json({ user: publicUser(rows[0]), token: `demo-token-${rows[0].id}` });
});

app.post('/api/auth/signup', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const role = req.body.role === 'agent' ? 'agent' : 'buyer';
  const password = String(req.body.password || 'demo');
  if (!name || !email) return res.status(400).json({ message: 'Name and email are required.' });
  const exists = await pool.query('SELECT 1 FROM users WHERE LOWER(email) = $1', [email]);
  if (exists.rowCount > 0) return res.status(409).json({ message: 'Email already exists.' });
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *',
    [name, email, password || 'demo', role]
  );
  res.status(201).json({ user: publicUser(rows[0]), token: `demo-token-${rows[0].id}` });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  const { rows } = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
  const sent = rows.length > 0;
  res.json({
    sent,
    message: sent
      ? `Reset link generated for ${email}. In production, send this by email.`
      : `If ${email} is registered, a reset link will be sent.`
  });
});

app.get('/api/listings', async (req, res) => {
  const { keyword, location, listingType, type, minPrice, maxPrice, beds, baths, status } = req.query;
  let conditions = ["status != 'removed'"];
  const values = [];
  let i = 1;

  if (status)      { conditions.push(`status = $${i++}`);          values.push(status); }
  if (listingType) { conditions.push(`listing_type = $${i++}`);    values.push(listingType); }
  if (type)        { conditions.push(`type = $${i++}`);            values.push(type); }
  if (minPrice)    { conditions.push(`price >= $${i++}`);          values.push(Number(minPrice)); }
  if (maxPrice)    { conditions.push(`price <= $${i++}`);          values.push(Number(maxPrice)); }
  if (beds)        { conditions.push(`beds >= $${i++}`);           values.push(Number(beds)); }
  if (baths)       { conditions.push(`baths >= $${i++}`);          values.push(Number(baths)); }
  if (keyword)     { conditions.push(`(title ILIKE $${i} OR description ILIKE $${i++})`); values.push(`%${keyword}%`); }
  if (location)    { conditions.push(`(location ILIKE $${i} OR city ILIKE $${i++})`);     values.push(`%${location}%`); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const { rows } = await pool.query(`SELECT * FROM listings ${where} ORDER BY id`, values);
  res.json(rows.map(rowToListing));
});

app.get('/api/listings/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Listing not found.' });
  res.json(rowToListing(rows[0]));
});

app.post('/api/listings', async (req, res) => {
  const { title, type, price, location } = req.body;
  if (!title || !type || !price || !location) return res.status(400).json({ message: 'Title, type, price, and location are required.' });
  const { rows } = await pool.query(
    `INSERT INTO listings (title,type,listing_type,price,location,city,beds,baths,size,amenities,description,agent,agent_id,status,lat,lng)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
    [
      String(title).trim(), type,
      req.body.listingType || 'sale',
      Number(price),
      String(location).trim(),
      String(req.body.city || location).trim(),
      Number(req.body.beds || 0),
      Number(req.body.baths || 0),
      Number(req.body.size || 0),
      JSON.stringify(Array.isArray(req.body.amenities) ? req.body.amenities : []),
      req.body.desc || '',
      req.body.agent || 'Demo Agent',
      Number(req.body.agentId || 2),
      req.body.status || 'pending',
      Number(req.body.lat || 3.139),
      Number(req.body.lng || 101.686)
    ]
  );
  res.status(201).json(rowToListing(rows[0]));
});

app.patch('/api/admin/listings/:id/approve', async (req, res) => {
  const { rows } = await pool.query("UPDATE listings SET status='active' WHERE id=$1 RETURNING *", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Listing not found.' });
  res.json(rowToListing(rows[0]));
});

app.delete('/api/admin/listings/:id', async (req, res) => {
  const { rows } = await pool.query("UPDATE listings SET status='removed' WHERE id=$1 RETURNING *", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Listing not found.' });
  res.json(rowToListing(rows[0]));
});

app.post('/api/favorites', async (req, res) => {
  const userId = Number(req.body.userId || 3);
  const listingId = Number(req.body.listingId);
  if (!listingId) return res.status(400).json({ message: 'listingId is required.' });
  await pool.query(
    'INSERT INTO favorites (user_id, listing_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [userId, listingId]
  );
  res.status(201).json({ userId, listingId });
});

app.post('/api/bookings', async (req, res) => {
  const { userId, listingId, name, email, phone, date, time, note } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO bookings (user_id,listing_id,name,email,phone,date,time,note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [userId, listingId, name, email, phone, date, time, note || '']
  );
  res.status(201).json(rows[0]);
});

app.post('/api/listings/:id/reviews', async (req, res) => {
  const { rows } = await pool.query('SELECT reviews FROM listings WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Listing not found.' });
  const review = { user: req.body.user || 'Guest', rating: Number(req.body.rating || 5), text: req.body.text || '' };
  const updated = [...rows[0].reviews, review];
  await pool.query('UPDATE listings SET reviews = $1 WHERE id = $2', [JSON.stringify(updated), req.params.id]);
  res.status(201).json(review);
});

app.get('/config.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.__ESTATECORE_CONFIG__ = ${JSON.stringify({ apiBase: '', googleMapsApiKey: GOOGLE_MAPS_API_KEY })};`);
});

app.use(express.static(APP_ROOT));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (req.path === '/config.js') return next();
  res.sendFile(path.join(APP_ROOT, 'index.html'));
});

initDB()
  .then(() => app.listen(PORT, () => console.log(`EstateCore API running on port ${PORT}`)))
  .catch(err => { console.error('DB init failed:', err); process.exit(1); });
