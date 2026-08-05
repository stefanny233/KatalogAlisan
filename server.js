import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');
const PORT = 3001;

// Data bawaan awal jika db.json belum dibuat
const INITIAL_DATA = {
  categories: ['Thinwall', 'Paper Bowl', 'Gelas Plastik'],
  products: [
    {
      id: 1,
      name: 'Gelas Plastik Oval PP',
      category: 'Gelas Plastik',
      subCategory: 'PP Starindo',
      labelBadge: 'Terlaris',
      minOrder: '1 Pak (50 pcs)',
      description: 'Gelas plastik PP tebal model oval yang estetik. Sangat cocok untuk kopi susu, boba, dan jus.',
      imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&auto=format&fit=crop&q=60',
      variants: [
        { size: '12oz', price: 850, inStock: true },
        { size: '14oz', price: 900, inStock: true },
        { size: '16oz', price: 950, inStock: true },
        { size: '22oz', price: 1200, inStock: false }
      ]
    },
    {
      id: 2,
      name: 'Gelas Plastik Datar PET Premium',
      category: 'Gelas Plastik',
      subCategory: 'PET Premium',
      labelBadge: 'Rekomendasi',
      minOrder: '1 Pak (50 pcs)',
      description: 'Gelas plastik PET bening super jernih, kaku, dan terlihat mewah. Biasa digunakan oleh cafe-cafe besar.',
      imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=500&auto=format&fit=crop&q=60',
      variants: [
        { size: '12oz', price: 1100, inStock: true },
        { size: '16oz', price: 1300, inStock: true },
        { size: '22oz', price: 1600, inStock: true }
      ]
    },
    {
      id: 3,
      name: 'Thinwall Rectangular (Persegi Panjang)',
      category: 'Thinwall',
      subCategory: 'Tutup Rapat',
      labelBadge: 'Promo',
      minOrder: '1 Dus (500 pcs)',
      description: 'Kotak makan plastik persegi panjang. Tahan microwave, aman untuk freezer, dan kedap udara.',
      imageUrl: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=500&auto=format&fit=crop&q=60',
      variants: [
        { size: '500ml', price: 1400, inStock: true },
        { size: '650ml', price: 1500, inStock: true },
        { size: '750ml', price: 1650, inStock: true },
        { size: '1000ml', price: 2000, inStock: false }
      ]
    },
    {
      id: 4,
      name: 'Paper Bowl Polos + Tutup',
      category: 'Paper Bowl',
      subCategory: 'Polos Putih',
      labelBadge: 'Baru',
      minOrder: '1 Pak (25 pcs)',
      description: 'Mangkok kertas tebal dengan lapisan laminasi anti bocor, tahan panas untuk makanan berkuah.',
      imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop&q=60',
      variants: [
        { size: '500ml', price: 1500, inStock: true },
        { size: '650ml', price: 1700, inStock: true },
        { size: '800ml', price: 1900, inStock: true }
      ]
    }
  ]
};

// Inisialisasi file db.json jika belum ada
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
}

const server = http.createServer((req, res) => {
  // Atur Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Router API
  if (req.url === '/api/data' && req.method === 'GET') {
    fs.readFile(DB_FILE, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Gagal membaca database server.' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    });
  } 
  else if (req.url === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFile(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8', (err) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Gagal menyimpan database server.' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Database server berhasil diupdate.' }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Format JSON tidak valid.' }));
      }
    });
  } 
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint tidak ditemukan.' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server database Alisan berjalan di http://localhost:${PORT}`);
});
