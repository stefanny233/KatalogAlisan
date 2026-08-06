import { useState, useEffect } from 'react';
import './App.css';
import CatalogView from './components/CatalogView';
import AdminView from './components/AdminView';
import PasscodeModal from './components/PasscodeModal';

import dbData from '../db.json';
import { supabase } from './supabaseClient';

// Ambil Kategori dan Produk Bawaan Awal secara langsung dari db.json
const DEFAULT_CATEGORIES = (dbData && dbData.categories) ? dbData.categories : ['Thinwall', 'Paper Bowl', 'Gelas Plastik', 'Paper Lunch'];
const DEFAULT_PRODUCTS = (dbData && dbData.products) ? dbData.products : [];

function App() {
  // State untuk data produk
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('alisan_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  // State untuk daftar kategori dinamis
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('alisan_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

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

  // 1. Fetch Data dari Supabase Database saat aplikasi dibuka
  useEffect(() => {
    const loadSupabaseData = async () => {
      try {
        // Fetch Categories
        const { data: catData, error: catErr } = await supabase
          .from('categories')
          .select('*')
          .order('id', { ascending: true });

        if (!catErr && catData && catData.length > 0) {
          const catList = catData.map(c => c.name);
          setCategories(catList);
          localStorage.setItem('alisan_categories', JSON.stringify(catList));
        }

        // Fetch Products
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: false });

        if (!prodErr && prodData && prodData.length > 0) {
          const formattedProducts = prodData.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            subCategory: p.sub_category || p.subCategory || 'Umum',
            labelBadge: p.label_badge || p.labelBadge || 'Tanpa Label',
            minOrder: p.min_order || p.minOrder || '1 Pak',
            description: p.description || '',
            imageUrl: p.image_url || p.imageUrl || '',
            extraImages: p.extra_images || p.extraImages || [],
            variants: p.variants || []
          }));
          setProducts(formattedProducts);
          localStorage.setItem('alisan_products', JSON.stringify(formattedProducts));
        }
        console.log('✓ Database Supabase Alisan Plastik Berhasil Terhubung!');
      } catch (err) {
        console.warn('Mode offline/Gagal fetch Supabase, menggunakan data browser:', err);
      }
    };

    loadSupabaseData();
  }, []);

  // 2. Real-Time Subscription Supabase (Meng-update layar secara instant jika ada perubahan dari HP/device lain)
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
        if (data && data.length > 0) {
          const formatted = data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            subCategory: p.sub_category || p.subCategory || 'Umum',
            labelBadge: p.label_badge || p.labelBadge || 'Tanpa Label',
            minOrder: p.min_order || p.minOrder || '1 Pak',
            description: p.description || '',
            imageUrl: p.image_url || p.imageUrl || '',
            extraImages: p.extra_images || p.extraImages || [],
            variants: p.variants || []
          }));
          setProducts(formatted);
          localStorage.setItem('alisan_products', JSON.stringify(formatted));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
        const { data } = await supabase.from('categories').select('*').order('id', { ascending: true });
        if (data && data.length > 0) {
          const list = data.map(c => c.name);
          setCategories(list);
          localStorage.setItem('alisan_categories', JSON.stringify(list));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync data produk ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem('alisan_products', JSON.stringify(products));
    } catch (err) {
      console.warn('localStorage limit reached.', err);
    }
  }, [products]);

  // Sync data kategori ke localStorage
  useEffect(() => {
    try {
      localStorage.setItem('alisan_categories', JSON.stringify(categories));
    } catch (err) {
      console.warn('localStorage limit reached for categories.', err);
    }
  }, [categories]);

  // Sync status login admin ke sessionStorage
  useEffect(() => {
    sessionStorage.setItem('alisan_is_admin', isAdmin);
  }, [isAdmin]);

  // Handler tambah produk baru (dipanggil oleh AdminView)
  const handleAddProduct = async (newProd) => {
    const tempId = Date.now();
    const productToAdd = {
      id: tempId,
      ...newProd
    };
    setProducts(prev => [productToAdd, ...prev]);

    try {
      const { data, error } = await supabase.from('products').insert([{
        name: newProd.name,
        category: newProd.category,
        sub_category: newProd.subCategory || 'Umum',
        label_badge: newProd.labelBadge || 'Tanpa Label',
        min_order: newProd.minOrder || '1 Pak',
        description: newProd.description || '',
        image_url: newProd.imageUrl || '',
        extra_images: newProd.extraImages || [],
        variants: newProd.variants || []
      }]).select();

      if (error) {
        console.warn('Catatan Supabase Insert:', error.message);
      } else if (data && data[0]) {
        const realId = data[0].id;
        setProducts(prev => prev.map(p => p.id === tempId ? { ...p, id: realId } : p));
      }
    } catch (err) {
      console.warn('Gagal menyimpan produk ke Supabase:', err);
    }
  };

  // Handler edit/update produk (dipanggil oleh AdminView)
  const handleUpdateProduct = async (updatedProd) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));

    try {
      const { error } = await supabase.from('products').update({
        name: updatedProd.name,
        category: updatedProd.category,
        sub_category: updatedProd.subCategory || 'Umum',
        label_badge: updatedProd.labelBadge || 'Tanpa Label',
        min_order: updatedProd.minOrder || '1 Pak',
        description: updatedProd.description || '',
        image_url: updatedProd.imageUrl || '',
        extra_images: updatedProd.extraImages || [],
        variants: updatedProd.variants || []
      }).eq('id', updatedProd.id);

      if (error) console.warn('Catatan Supabase Update:', error.message);
    } catch (err) {
      console.warn('Gagal update produk ke Supabase:', err);
    }
  };

  // Handler hapus produk (dipanggil oleh AdminView)
  const handleDeleteProduct = async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) console.warn('Catatan Supabase Delete:', error.message);
    } catch (err) {
      console.warn('Gagal hapus produk dari Supabase:', err);
    }
  };

  // Handler tambah kategori baru
  const handleAddCategory = async (newCatName) => {
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

    try {
      const { error } = await supabase.from('categories').insert([{ name: trimmed }]);
      if (error) console.warn('Catatan Supabase Insert Category:', error.message);
    } catch (err) {
      console.warn('Gagal tambah kategori ke Supabase:', err);
    }
    return true;
  };

  // Handler hapus kategori
  const handleDeleteCategory = async (catToDelete) => {
    const isUsed = products.some(p => p.category.toLowerCase() === catToDelete.toLowerCase());
    if (isUsed) {
      alert(`Tidak dapat menghapus kategori "${catToDelete}" karena masih digunakan oleh beberapa produk. Hapus atau ganti kategori produk tersebut terlebih dahulu.`);
      return false;
    }
    setCategories(prev => prev.filter(c => c.toLowerCase() !== catToDelete.toLowerCase()));
    if (activeCategory === catToDelete) {
      setActiveCategory('Semua');
    }

    try {
      const { error } = await supabase.from('categories').delete().eq('name', catToDelete);
      if (error) console.warn('Catatan Supabase Delete Category:', error.message);
    } catch (err) {
      console.warn('Gagal hapus kategori dari Supabase:', err);
    }
    return true;
  };

  // Handler edit/rename nama kategori
  const handleEditCategory = async (oldCatName, newCatName) => {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      alert('Nama kategori tidak boleh kosong!');
      return false;
    }
    if (oldCatName.toLowerCase() !== trimmed.toLowerCase() && categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      alert(`Kategori "${trimmed}" sudah ada di sistem!`);
      return false;
    }

    // Update state categories
    setCategories(prev => prev.map(c => c === oldCatName ? trimmed : c));
    if (activeCategory === oldCatName) {
      setActiveCategory(trimmed);
    }

    // Update state products yang mengacu pada kategori lama
    setProducts(prev => prev.map(p => p.category === oldCatName ? { ...p, category: trimmed } : p));

    try {
      // Update tabel categories di Supabase
      const { error: catErr } = await supabase.from('categories').update({ name: trimmed }).eq('name', oldCatName);
      if (catErr) console.warn('Catatan Supabase Edit Category:', catErr.message);

      // Update tabel products di Supabase
      const { error: prodErr } = await supabase.from('products').update({ category: trimmed }).eq('category', oldCatName);
      if (prodErr) console.warn('Catatan Supabase Edit Products Category:', prodErr.message);
    } catch (err) {
      console.warn('Gagal edit kategori ke Supabase:', err);
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
              onEditCategory={handleEditCategory}
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