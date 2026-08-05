import { useState, useEffect } from 'react';
import './App.css';
import CatalogView from './components/CatalogView';
import AdminView from './components/AdminView';
import PasscodeModal from './components/PasscodeModal';

import dbData from '../db.json';

// Cloud Database Endpoint (JSONBlob) untuk sinkronisasi Real-Time serentak di semua HP & Laptop
const CLOUD_DB_URL = 'https://jsonblob.com/api/jsonBlob/019fd06a-28ba-7f9f-88d8-6b4ff8feebc1';

// Ambil Kategori dan Produk Bawaan Awal secara langsung dari db.json
const DEFAULT_CATEGORIES = dbData.categories || ['Thinwall', 'Paper Bowl', 'Gelas Plastik', 'Paper Lunch'];
const DEFAULT_PRODUCTS = dbData.products || [];

function App() {
  const CURRENT_DB_VERSION = dbData.version || 1;

  // State untuk data produk (mengambil dari localStorage atau default jika belum ada)
  const [products, setProducts] = useState(() => {
    const savedVersion = localStorage.getItem('alisan_db_version');
    const saved = localStorage.getItem('alisan_products');

    if (!savedVersion || parseInt(savedVersion, 10) < CURRENT_DB_VERSION) {
      localStorage.setItem('alisan_db_version', CURRENT_DB_VERSION.toString());
      localStorage.setItem('alisan_products', JSON.stringify(dbData.products || []));
      localStorage.setItem('alisan_categories', JSON.stringify(dbData.categories || []));
      return dbData.products || [];
    }

    return saved ? JSON.parse(saved) : (dbData.products || []);
  });

  // State untuk daftar kategori dinamis
  const [categories, setCategories] = useState(() => {
    const savedVersion = localStorage.getItem('alisan_db_version');
    const saved = localStorage.getItem('alisan_categories');

    if (!savedVersion || parseInt(savedVersion, 10) < CURRENT_DB_VERSION) {
      return dbData.categories || [];
    }

    return saved ? JSON.parse(saved) : (dbData.categories || []);
  });

  // Flag penanda apakah data cloud pertama kali sudah dimuat
  const [isCloudLoaded, setIsCloudLoaded] = useState(false);

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

  // 1. Fetch data terbaru dari Cloud Database setiap kali aplikasi dibuka di HP/Laptop mana saja
  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        const response = await fetch(CLOUD_DB_URL, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.products && Array.isArray(data.products)) {
            setProducts(data.products);
            localStorage.setItem('alisan_products', JSON.stringify(data.products));
          }
          if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
            localStorage.setItem('alisan_categories', JSON.stringify(data.categories));
          }
          console.log('✓ Data berhasil disinkronkan secara Real-Time dari Cloud Database Alisan!');
        }
      } catch (err) {
        console.warn('Mode offline / Gagal terhubung ke Cloud Database. Menggunakan data tersimpan di memori browser.', err);
      } finally {
        setIsCloudLoaded(true);
      }
    };
    fetchCloudData();
  }, []);

  // Helper untuk push pembaruan data ke Cloud Database
  const pushToCloud = async (newProducts, newCategories) => {
    try {
      await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          version: Date.now(),
          categories: newCategories,
          products: newProducts
        })
      });
      console.log('✓ Perubahan berhasil di-update secara otomatis ke Cloud Database!');
    } catch (err) {
      console.warn('Gagal menyimpan ke Cloud Database:', err);
    }
  };

  // Sync data produk ke localStorage & Cloud Database
  useEffect(() => {
    try {
      localStorage.setItem('alisan_products', JSON.stringify(products));
    } catch (err) {
      console.warn('localStorage limit reached.', err);
    }

    if (isCloudLoaded) {
      pushToCloud(products, categories);
    }
  }, [products]);

  // Sync data kategori ke localStorage & Cloud Database
  useEffect(() => {
    try {
      localStorage.setItem('alisan_categories', JSON.stringify(categories));
    } catch (err) {
      console.warn('localStorage limit reached for categories.', err);
    }

    if (isCloudLoaded) {
      pushToCloud(products, categories);
    }
  }, [categories]);

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