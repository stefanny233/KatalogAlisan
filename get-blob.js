import https from 'https';

const initialData = {
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

const postData = JSON.stringify(initialData);

const req = https.request({
  hostname: 'jsonblob.com',
  path: '/api/jsonBlob',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // JSONBlob returns the location header or response JSON
    console.log('BODY:', data);
    const location = res.headers['location'] || res.headers['Location'];
    if (location) {
      console.log('SUCCESS! BLOB URL:', location);
      const parts = location.split('/');
      const blobId = parts[parts.length - 1];
      console.log('BLOB_ID:', blobId);
    }
  });
});

req.on('error', (err) => {
  console.error('ERROR:', err);
});

req.write(postData);
req.end();
