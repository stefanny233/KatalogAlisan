import { useState, useEffect } from 'react';
import './App.css';
import CatalogView from './components/CatalogView';
import AdminView from './components/AdminView';
import PasscodeModal from './components/PasscodeModal';

// Kategori Bawaan Awal
const DEFAULT_CATEGORIES = ['Thinwall', 'Paper Bowl', 'Gelas Plastik'];

// Data produk bawaan awal terstruktur dengan sub-kategori dan banyak varian ukuran + harga
const DEFAULT_PRODUCTS = [
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
];

const API_BASE = window.location.protocol + '//' + window.location.hostname + ':3001';

function App() {
  // State untuk data produk (mengambil dari localStorage atau default jika kosong)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('alisan_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  // State untuk daftar kategori dinamis
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('alisan_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  // Flag untuk mendeteksi apakah data awal sudah berhasil di-sync dari server
  const [isLoadedFromServer, setIsLoadedFromServer] = useState(false);

  // Tampilan halaman aktif ('catalog' atau 'admin')
  const [currentView, setCurrentView] = useState('catalog');

  // Filter kategori utama secara global di header
  const [activeCategory, setActiveCategory] = useState('Semua');

  // Input pencarian secara global di header
  const [searchQuery, setSearchQuery] = useState('');

  // Status autentikasi admin (menggunakan sessionStorage agar reset saat tab browser ditutup)
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('alisan_is_admin') === 'true';
  });

  // State untuk mengontrol buka/tutup Modal PIN
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // 1. Load data awal dari server database (jika server aktif)
  useEffect(() => {
    const loadServerData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/data`);
        if (response.ok) {
          const data = await response.json();
          if (data.products && Array.isArray(data.products)) {
            setProducts(data.products);
          }
          if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
          console.log('Database Alisan berhasil disinkronkan dari server database.');
        }
      } catch (err) {
        console.log('Server database tidak terdeteksi. Menggunakan database browser (localStorage).', err);
      } finally {
        setIsLoadedFromServer(true);
      }
    };
    loadServerData();
  }, []);

  // 2. Simpan data produk & kategori ke server & localStorage setiap kali berubah
  useEffect(() => {
    try {
      localStorage.setItem('alisan_products', JSON.stringify(products));
    } catch (err) {
      console.warn('localStorage limit reached. Products stored in active memory.', err);
    }

    if (isLoadedFromServer) {
      const syncToServer = async () => {
        try {
          await fetch(`${API_BASE}/api/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products, categories })
          });
        } catch (err) {
          console.warn('Gagal sinkronisasi data produk ke server database.', err);
        }
      };
      syncToServer();
    }
  }, [products, isLoadedFromServer]);

  useEffect(() => {
    try {
      localStorage.setItem('alisan_categories', JSON.stringify(categories));
    } catch (err) {
      console.warn('localStorage limit reached for categories.', err);
    }

    if (isLoadedFromServer) {
      const syncToServer = async () => {
        try {
          await fetch(`${API_BASE}/api/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products, categories })
          });
        } catch (err) {
          console.warn('Gagal sinkronisasi data kategori ke server database.', err);
        }
      };
      syncToServer();
    }
  }, [categories, isLoadedFromServer]);

  // Sync status login admin ke sessionStorage
  useEffect(() => {
    sessionStorage.setItem('alisan_is_admin', isAdmin);
  }, [isAdmin]);

  // Handler tambah produk baru (dipanggil oleh AdminView)
  const handleAddProduct = (newProd) => {
    const productToAdd = {
      id: Date.now(),
      ...newProd
    };
    setProducts(prev => [productToAdd, ...prev]);
  };

  // Handler edit/update produk (dipanggil oleh AdminView)
  const handleUpdateProduct = (updatedProd) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  // Handler hapus produk (dipanggil oleh AdminView)
  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Handler tambah kategori baru
  const handleAddCategory = (newCatName) => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      alert('Nama kategori tidak boleh kosong!');
      return false;
    }
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      alert(`Kategori "${trimmed}" sudah ada di sistem!`);
      return false;
    }
    setCategories(prev => [...prev, trimmed]);
    return true;
  };

  // Handler hapus kategori
  const handleDeleteCategory = (catToDelete) => {
    const isUsed = products.some(p => p.category.toLowerCase() === catToDelete.toLowerCase());
    if (isUsed) {
      alert(`Tidak dapat menghapus kategori "${catToDelete}" karena masih digunakan oleh beberapa produk. Hapus atau ganti kategori produk tersebut terlebih dahulu.`);
      return false;
    }
    setCategories(prev => prev.filter(c => c.toLowerCase() !== catToDelete.toLowerCase()));
    if (activeCategory === catToDelete) {
      setActiveCategory('Semua');
    }
    return true;
  };

  // Handler reset data ke default
  const handleResetDefaults = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan semua data katalog ke produk dan kategori contoh awal?')) {
      setProducts(DEFAULT_PRODUCTS);
      setCategories(DEFAULT_CATEGORIES);
      localStorage.removeItem('alisan_products');
      localStorage.removeItem('alisan_categories');
    }
  };

  // Handler Keluar / Mengunci kembali sesi Admin
  const handleLockAdmin = () => {
    setIsAdmin(false);
    setCurrentView('catalog');
  };

  // Handler klik tombol buka admin panel
  const handleUnlockAdminClick = () => {
    setIsPinModalOpen(true);
  };

  // Handler jika masukan PIN benar di Modal
  const handlePinSuccess = () => {
    setIsAdmin(true);
    setIsPinModalOpen(false);
    setCurrentView('admin');
  };

  return (
    <div className="app-container-global">
      
      {/* HEADER ATAS PENUH (Top Header Bar) sesuai Referensi */}
      <header className="site-header">
        <div className="top-header-bar">
          
          {/* Logo ALISAN PLASTIK */}
          <div className="logo-container" onClick={() => { setCurrentView('catalog'); setActiveCategory('Semua'); }}>
            <span className="logo-text-primary">ALISAN</span>
            <span className="logo-text-secondary">PLASTIK</span>
            <div className="logo-indicator"></div>
          </div>
          
          {/* Search Input di Header (hanya muncul di Katalog Guest) */}
          {currentView === 'catalog' && (
            <div className="header-search-bar">
              <span className="search-icon-svg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Cari nama produk, jenis bahan..." 
                className="header-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Navigasi Link Header */}
          <nav className="header-nav-links">
            <button 
              className={`header-nav-btn ${currentView === 'catalog' ? 'active' : ''}`}
              onClick={() => { setCurrentView('catalog'); setActiveCategory('Semua'); }}
            >
              Katalog
            </button>
            <a 
              href="https://wa.me/6282384442202" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="header-nav-link-a"
            >
              Hubungi WA
            </a>
            
            {isAdmin ? (
              <div className="header-admin-controls">
                <button 
                  className={`header-nav-btn admin-btn-active ${currentView === 'admin' ? 'active' : ''}`}
                  onClick={() => setCurrentView('admin')}
                >
                  Kelola Barang
                </button>
                <button className="header-lock-btn" onClick={handleLockAdmin} title="Kunci Panel Admin">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </button>
              </div>
            ) : (
              <button 
                className="header-nav-btn admin-locked-btn"
                onClick={handleUnlockAdminClick}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
                Admin
              </button>
            )}
          </nav>
        </div>

        {/* Tab Kategori Dinamis di Bawah Header (hanya muncul di Katalog Guest) */}
        {currentView === 'catalog' && (
          <div className="category-navigation-bar">
            <div className="category-nav-links">
              {['Semua', ...categories].map((category) => (
                <button
                  key={category}
                  className={`category-nav-btn ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* KONTEN UTAMA */}
      <main className="main-content-global">
        {currentView === 'catalog' ? (
          <CatalogView 
            products={products} 
            categories={categories}
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
          />
        ) : (
          isAdmin && (
            <AdminView 
              products={products}
              categories={categories}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onResetDefaults={handleResetDefaults}
            />
          )
        )}
      </main>

      {/* Pop-up Modal PIN Keamanan */}
      <PasscodeModal 
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
}

export default App;