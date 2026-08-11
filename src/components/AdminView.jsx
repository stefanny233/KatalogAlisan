import { useState } from 'react';

function AdminView({ products = [], categories = [], onAddProduct, onUpdateProduct, onDeleteProduct, onAddCategory, onEditCategory, onDeleteCategory, onResetDefaults, onBackToCatalog }) {
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Tab Admin Aktif ('list' = daftar barang, 'form' = tambah/edit produk, 'category' = kelola kategori)
  const [activeAdminTab, setActiveAdminTab] = useState('list');

  // State Mode Form (null = Tambah Produk Baru, ID = Edit Produk)
  const [editingProductId, setEditingProductId] = useState(null);

  // State Field Form Produk
  const [name, setName] = useState('');
  const [category, setCategory] = useState(safeCategories[0] || 'Thinwall');
  const [subCategory, setSubCategory] = useState('Persegi Panjang');
  const [labelBadge, setLabelBadge] = useState('Tanpa Label');
  const [minOrder, setMinOrder] = useState('1 Pak (50 pcs)');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // State Galeri Foto Banyak (Multi-Image)
  const [extraImages, setExtraImages] = useState([]);

  // State mode input gambar ('file' atau 'url')
  const [imageInputMode, setImageInputMode] = useState('file');

  // State Varian Ukuran Opsional (Lengkap: Panjang, Lebar, Tinggi, Diameter, Vol ml, Oz, Foto Varian)
  const [variants, setVariants] = useState([
    { size: '', price: '', packUnitType: 'pack', priceDus: '', wholesaleUnitType: 'dus', pricePcs: '', inStock: true, panjang: '', lebar: '', tinggi: '', diameterTop: '', diameterBottom: '', ml: '', oz: '', rawSize: '', imageUrl: '' }
  ]);

  // State Input Kategori Baru
  const [newCatInput, setNewCatInput] = useState('');

  // State Notifikasi
  const [alertMessage, setAlertMessage] = useState('');
  // State Filter di Daftar Admin
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('Semua');

  // Total statistik produk
  const totalProducts = safeProducts.length;
  const outOfStockCount = safeProducts.reduce((acc, p) => {
    const hasOut = p && p.variants && p.variants.some(v => v && !v.inStock);
    return hasOut ? acc + 1 : acc;
  }, 0);

  // Helper: Bypass CORS/hotlink block & optimasi WebP instan ultra-cepat (10x lebih cepat)
  const resolveImageUrl = (url, width = 300) => {
    if (!url) return '';
    if (url.startsWith('data:image')) return url;

    if (url.includes('images.unsplash.com')) {
      const cleanUrl = url.split('?')[0];
      return `${cleanUrl}?w=${width}&auto=format&fit=crop&q=75&format=webp`;
    }

    if (
      url.includes('instagram.com') ||
      url.includes('cdninstagram.com') ||
      url.includes('fbcdn.net') ||
      url.includes('scontent')
    ) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=75&output=webp`;
    }
    return url;
  };

  // Auto-fill sub-kategori default saat kategori utama diubah
  const handleCategoryChange = (e) => {
    const selectedCat = e.target.value;
    setCategory(selectedCat);
    
    if (!editingProductId) {
      if (selectedCat === 'Gelas Plastik') {
        setSubCategory('PP Starindo');
      } else if (selectedCat === 'Thinwall') {
        setSubCategory('Persegi Panjang');
      } else if (selectedCat === 'Paper Bowl') {
        setSubCategory('Polos Putih');
      } else {
        setSubCategory('Umum');
      }
    }
  };

  // Upload Foto Utama dengan Kompresi Canvas
  const handleMainFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressFile(file, (dataUrl) => {
        setImageUrl(dataUrl);
      });
    }
  };

  // Upload Foto Tambahan / Galeri Varian Banyak
  const handleExtraFilesChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      compressFile(file, (dataUrl) => {
        setExtraImages(prev => [...prev, dataUrl]);
      });
    });
  };

  // Function Canvas Compression Helper
  const compressFile = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        callback(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Hapus foto dari galeri ekstra
  const removeExtraImage = (index) => {
    setExtraImages(extraImages.filter((_, i) => i !== index));
  };

  // Tambah baris varian ukuran
  const addVariantRow = () => {
    setVariants([...variants, { size: '', price: '', packUnitType: 'pack', priceDus: '', wholesaleUnitType: 'dus', pricePcs: '', inStock: true, panjang: '', lebar: '', tinggi: '', diameterTop: '', diameterBottom: '', ml: '', oz: '', rawSize: '', imageUrl: '' }]);
  };

  // Hapus baris varian
  const removeVariantRow = (index) => {
    if (variants.length === 1) {
      alert('Minimal harus ada 1 baris varian!');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Edit isi baris varian
  const handleVariantChange = (index, field, value) => {
    const updated = variants.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setVariants(updated);
  };

  // Toggle status stok varian
  const toggleVariantStock = (index) => {
    const updated = variants.map((item, i) => {
      if (i === index) {
        return { ...item, inStock: !item.inStock };
      }
      return item;
    });
    setVariants(updated);
  };

  // Helper membuat string label ukuran dari bidang opsional (Panjang, Lebar, Tinggi, Diameter, ml, oz)
  const buildVariantLabel = (v) => {
    if (v.rawSize && v.rawSize.trim()) return v.rawSize.trim();

    const parts = [];
    
    // Dimensi (Panjang x Lebar x Tinggi cm)
    if (v.panjang || v.lebar || v.tinggi) {
      const p = v.panjang ? `P:${v.panjang}` : '';
      const l = v.lebar ? `L:${v.lebar}` : '';
      const t = v.tinggi ? `T:${v.tinggi}` : '';
      const plt = [p, l, t].filter(Boolean).join('×');
      parts.push(`${plt} cm`);
    }

    // Diameter Atas & Diameter Bawah
    const dTop = v.diameterTop || v.diameter;
    const dBot = v.diameterBottom;

    if (dTop && dBot) {
      parts.push(`Ø Atas ${dTop}cm / Bawah ${dBot}cm`);
    } else if (dTop) {
      parts.push(`Ø Atas ${dTop}cm`);
    } else if (dBot) {
      parts.push(`Ø Bawah ${dBot}cm`);
    }

    // Oz
    if (v.oz) {
      parts.push(`${v.oz}oz`);
    }

    // Ml
    if (v.ml) {
      parts.push(`${v.ml}ml`);
    }

    if (v.size && v.size.trim() && parts.length === 0) {
      return v.size.trim();
    }

    if (parts.length === 0) return 'Standar';
    return parts.join(' | ');
  };

  // Buka Form Edit Produk
  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setName(product.name || '');
    setCategory(product.category || categories[0]);
    setSubCategory(product.subCategory || '');
    setLabelBadge(product.labelBadge || 'Tanpa Label');
    setMinOrder(product.minOrder || '1 Pak (50 pcs)');
    setDescription(product.description || '');
    setImageUrl(product.imageUrl || '');

    setVariants(product.variants && product.variants.length > 0 
      ? product.variants.map(v => ({
          ...v,
          rawSize: v.size || ''
        }))
      : [{ size: '', price: '', packUnitType: 'pack', priceDus: '', wholesaleUnitType: 'dus', pricePcs: '', inStock: true, panjang: '', lebar: '', tinggi: '', diameterTop: '', diameterBottom: '', ml: '', oz: '', rawSize: '', imageUrl: '' }]
    );
    
    setActiveAdminTab('form');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Batal Mode Edit
  const handleCancelEdit = () => {
    setEditingProductId(null);
    resetForm();
    setActiveAdminTab('list');
  };

  // Reset Isian Form Produk
  const resetForm = () => {
    setName('');
    setCategory(categories[0] || 'Thinwall');
    setSubCategory('Persegi Panjang');
    setLabelBadge('Tanpa Label');
    setMinOrder('1 Pak (50 pcs)');
    setDescription('');
    setImageUrl('');
    setExtraImages([]);
    setVariants([{ size: '', price: '', packUnitType: 'pack', priceDus: '', wholesaleUnitType: 'dus', pricePcs: '', inStock: true, panjang: '', lebar: '', tinggi: '', diameterTop: '', diameterBottom: '', ml: '', oz: '', rawSize: '', imageUrl: '' }]);
  };

  // Submit Simpan Kategori Baru
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatInput.trim()) {
      alert('Nama kategori tidak boleh kosong!');
      return;
    }
    const success = onAddCategory(newCatInput);
    if (success) {
      setAlertMessage(`Kategori "${newCatInput.trim()}" berhasil ditambahkan!`);
      setNewCatInput('');
      setTimeout(() => setAlertMessage(''), 3500);
    }
  };

  // Submit Simpan Produk (Tambah atau Edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama produk utama wajib diisi!');
      return;
    }

    try {
      const processedVariants = variants.map(v => {
        const label = buildVariantLabel(v);
        
        return {
          ...v,
          size: label,
          price: parseFloat(v.price) || 0,
          priceDus: v.priceDus ? parseFloat(v.priceDus) : null,
          pricePcs: v.pricePcs ? parseFloat(v.pricePcs) : null,
        };
      });

      const productPayload = {
        name: name.trim(),
        category: category || categories[0],
        subCategory: subCategory.trim() || 'Lainnya',
        labelBadge,
        minOrder: minOrder.trim() || '1 Pak',
        description: description.trim() || 'Tidak ada deskripsi khusus.',
        imageUrl,
        extraImages,
        variants: processedVariants
      };

      if (editingProductId) {
        onUpdateProduct({
          id: editingProductId,
          ...productPayload
        });
        setAlertMessage('Produk berhasil diperbarui!');
        setEditingProductId(null);
      } else {
        onAddProduct(productPayload);
        setAlertMessage('Produk baru berhasil ditambahkan ke katalog!');
      }

      resetForm();
      setActiveAdminTab('list');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setAlertMessage(''), 3500);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan produk. Silakan periksa isian Anda.');
    }
  };

  const formatRupiah = (number) => {
    const val = parseFloat(number);
    if (isNaN(val)) return '0';
    return new Intl.NumberFormat('id-ID').format(val);
  };

  // List semua gambar produk yang sudah diupload untuk dropdown varian
  const allAvailableImages = [imageUrl, ...extraImages].filter(Boolean);

  // Filter daftar produk di admin
  const filteredAdminProducts = safeProducts.filter(p => {
    if (!p) return false;
    const matchesSearch = (p.name || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
                          (p.category || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
                          (p.subCategory && p.subCategory.toLowerCase().includes(adminSearch.toLowerCase()));
    const matchesCat = adminCategoryFilter === 'Semua' || p.category === adminCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Handler ekspor data ke JSON untuk db.json
  const handleExportJSON = () => {
    const exportData = {
      categories: categories,
      products: products
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jsonString).then(() => {
        alert('✓ Data katalog berhasil disalin ke Clipboard!\n\nSilakan buka file "db.json" di VS Code, paste (Ctrl+V) isi data ini, lalu git commit & push ke GitHub agar Vercel otomatis meng-update tampilannya di HP & semua perangkat!');
      }).catch(() => {
        prompt('Salin teks JSON berikut dan paste ke db.json di VS Code:', jsonString);
      });
    } else {
      prompt('Salin teks JSON berikut dan paste ke db.json di VS Code:', jsonString);
    }
  };

  return (
    <div className="admin-page-wrapper">
      
      {/* TOMBOL KEMBALI KE KATALOG UTAMA */}
      <div className="admin-back-btn-bar" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className="btn-back-to-catalog"
          onClick={() => {
            if (onBackToCatalog) {
              onBackToCatalog();
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            border: '1.5px solid #d5b58c',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>← Kembali ke Halaman Katalog Utama</span>
        </button>
      </div>

      {/* 1. HEADER & SUMMARY BAR */}
      <header className="admin-top-bar">
        <div>
          <h1 className="admin-main-title">Panel Kelola Barang</h1>
          <p className="admin-main-subtitle">Kelola produk, kategori utama, foto galeri Shopee-style, varian ukuran, dan harga untuk katalog ALISAN PLASTIK.</p>
        </div>

        <button 
          type="button" 
          onClick={onResetDefaults}
          className="btn-reset-data"
          title="Kembalikan data ke contoh awal"
        >
          Reset Data Contoh
        </button>
      </header>

      {/* 2. KARTU STATISTIK ADMIN */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card primary">
          <span className="stat-card-label">Total Produk Registered</span>
          <span className="stat-card-value">{totalProducts} Item</span>
        </div>
        <div className="admin-stat-card secondary">
          <span className="stat-card-label">Total Kategori Utama</span>
          <span className="stat-card-value">{safeCategories.length} Kategori</span>
        </div>
        <div className="admin-stat-card alert">
          <span className="stat-card-label">Produk Ada Stok Kosong</span>
          <span className="stat-card-value">{outOfStockCount} Item</span>
        </div>
      </div>

      {/* 3. NAVIGASI TAB UTAMA ADMIN */}
      <div className="admin-tab-nav">
        <button 
          type="button"
          className={`admin-tab-btn ${activeAdminTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('list')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Daftar Semua Barang ({safeProducts.length})
        </button>

        <button 
          type="button"
          className={`admin-tab-btn ${activeAdminTab === 'form' ? 'active' : ''}`}
          onClick={() => {
            if (!editingProductId) resetForm();
            setActiveAdminTab('form');
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {editingProductId ? `Edit Produk #${editingProductId}` : ' Tambah Produk Baru'}
        </button>

        <button 
          type="button"
          className={`admin-tab-btn ${activeAdminTab === 'category' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('category')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          Kelola Kategori ({safeCategories.length})
        </button>
      </div>

      {/* NOTIFIKASI SUKSES */}
      {alertMessage && (
        <div className="admin-alert-success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {alertMessage}
        </div>
      )}

      {/* ==================== TAB 1: DAFTAR BARANG ==================== */}
      {activeAdminTab === 'list' && (
        <div className="admin-list-view-container">
          
          <div className="admin-filter-bar">
            <div className="admin-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Cari produk di admin..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="admin-search-input"
              />
            </div>

            <div className="admin-cat-filter-wrap">
              {['Semua', ...safeCategories].map(cat => (
                <button 
                  key={cat}
                  type="button"
                  className={`admin-cat-chip ${adminCategoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setAdminCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button 
              type="button" 
              className="btn-add-new-header"
              onClick={() => {
                setEditingProductId(null);
                resetForm();
                setActiveAdminTab('form');
              }}
            >
              + Tambah Barang
            </button>
          </div>

          <div className="admin-products-table-list">
            {filteredAdminProducts.length > 0 ? (
              filteredAdminProducts.map((product) => (
                <div 
                  key={product.id} 
                  className={`admin-product-row-card ${editingProductId === product.id ? 'is-editing' : ''}`}
                >
                  <div className="product-row-image">
                    {product.imageUrl ? (
                      <img src={resolveImageUrl(product.imageUrl)} alt={product.name} />
                    ) : (
                      <div className="product-row-placeholder">
                        {(product.category && product.category[0]) || 'P'}
                      </div>
                    )}
                  </div>

                  <div className="product-row-main">
                    <div className="product-row-header">
                      <h4 className="product-row-title">{product.name}</h4>
                      {product.labelBadge && product.labelBadge !== 'Tanpa Label' && (
                        <span className="product-row-tag">{product.labelBadge}</span>
                      )}
                    </div>
                    
                    <div className="product-row-meta">
                      <span className="meta-cat">{product.category}</span>
                      <span className="meta-dot">•</span>
                      <span className="meta-sub">{product.subCategory}</span>
                      <span className="meta-dot">•</span>
                      <span className="meta-min">Min Order: {product.minOrder || '1 Pak'}</span>
                    </div>

                    <p className="product-row-desc">{product.description}</p>
                  </div>

                  <div className="product-row-variants">
                    <span className="variants-title">Varian Ukuran & Harga:</span>
                    <div className="variants-badges-wrap">
                      {product.variants && product.variants.map((v, idx) => (
                        <div key={idx} className={`variant-chip ${v.inStock ? 'in-stock' : 'out-of-stock'}`}>
                          <span className="chip-size">{v.size}</span>
                          <span className="chip-price">Rp {formatRupiah(v.price)}</span>
                          {!v.inStock && <span className="chip-empty">(Kosong)</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="product-row-actions">
                    <button 
                      type="button"
                      className="btn-admin-edit"
                      onClick={() => handleEditClick(product)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      Edit
                    </button>

                    <button 
                      type="button"
                      className="btn-admin-delete"
                      onClick={() => {
                        if (window.confirm(`Yakin ingin menghapus produk "${product.name}"?`)) {
                          onDeleteProduct(product.id);
                        }
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Hapus
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div className="admin-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                <h3>Tidak Ada Produk Ditemukan</h3>
                <p>Coba ubah kata kunci pencarian atau filter kategori di atas.</p>
              </div>
            )}
          </div>

        </div>
      )}


      {/* ==================== TAB 2: FORM TAMBAH / EDIT PRODUK ==================== */}
      {activeAdminTab === 'form' && (
        <div className="admin-form-view-container">
          
          {editingProductId && (
            <div className="edit-banner-info">
              <span>Mode Edit Aktif: Mengubah Produk #{editingProductId} ({name})</span>
              <button type="button" onClick={handleCancelEdit} className="btn-cancel-banner">&times; Batal Edit</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-neat-form">
            
            {/* BARIS ATAS 2 KOLOM (LANGKAH 1 & LANGKAH 2 BERSAMPINGAN AGAR PANJANG KE SEBELAH) */}
            <div className="admin-form-top-row">
              
              {/* LANGKAH 1: INFORMASI UTAMA PRODUK */}
              <div className="form-card-step step-left-col">
                <div className="step-header">
                  <div className="step-badge">1</div>
                  <div>
                    <h3 className="step-title">Informasi Utama Produk</h3>
                    <p className="step-subtitle">Isi nama, kategori, merk bahan, dan keterangan pemesanan.</p>
                  </div>
                </div>
                
                <div className="step-content">
                  <div className="form-field-group">
                    <div className="field-label-row">
                      <label className="field-label">Nama Produk Utama</label>
                      <span className="badge-required">Wajib Isi</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Contoh: Thinwall Rectangular Box Makan Bening"
                      className="field-input-neat"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <span className="field-hint">Gunakan nama yang jelas agar mudah dicari pembeli.</span>
                  </div>

                  <div className="form-grid-2col">
                    <div className="form-field-group">
                      <div className="field-label-row">
                        <label className="field-label">Kategori Utama</label>
                        <span className="badge-required">Wajib Isi</span>
                      </div>
                      <select 
                        className="field-select-neat"
                        value={category}
                        onChange={handleCategoryChange}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field-group">
                      <div className="field-label-row">
                        <label className="field-label">Sub-Kategori / Merk / Bahan</label>
                        <span className="badge-optional">(Opsional)</span>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Contoh: Tutup Rapat, PP Starindo, Eco Brown"
                        className="field-input-neat"
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2col">
                    <div className="form-field-group">
                      <label className="field-label">Label Promo Highlight</label>
                      <select 
                        className="field-select-neat"
                        value={labelBadge}
                        onChange={(e) => setLabelBadge(e.target.value)}
                      >
                        <option value="Tanpa Label">Tanpa Label Promo</option>
                        <option value="Terlaris">Terlaris (Best Seller - Lencana Emas)</option>
                        <option value="Promo">Promo Diskon (Lencana Merah)</option>
                        <option value="Baru">Produk Baru (Lencana Biru)</option>
                        <option value="Rekomendasi">Rekomendasi Admin (Lencana Gelap)</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Minimal Pemesanan & Isi (Min. Order)</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Isi 50 pcs/pack atau 1 Dus (500 pcs)"
                        className="field-input-neat"
                        value={minOrder}
                        onChange={(e) => setMinOrder(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="field-label">Deskripsi Lengkap &amp; Spesifikasi Produk</label>
                    <textarea 
                      placeholder="Contoh format deskripsi rapi:&#10;&#10;• Bahan: Plastik PP Food Grade tebal &amp; bening&#10;• Fitur: Tahan panas, tidak mudah sobek, dapat dipress sealer&#10;• Cocok untuk: Kopi susu, boba, jus, dan es teh&#10;&#10;Catatan:&#10;Isi per pack 50 pcs. Pembelian grosir tersedia harga dus/bal."
                      className="field-textarea-neat"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                    />
                    <span className="field-hint">Tekan Enter untuk membuat paragraf/baris baru.</span>
                  </div>
                </div>
              </div>

              {/* LANGKAH 2: UPLOAD GALERI FOTO BANYAK */}
              <div className="form-card-step step-right-col">
                <div className="step-header">
                  <div className="step-badge">2</div>
                  <div>
                    <h3 className="step-title">Galeri Foto Produk</h3>
                    <p className="step-subtitle">Upload foto utama dan foto varian pendukung.</p>
                  </div>
                </div>

                <div className="step-content">
                  <div className="image-uploader-container">
                    
                    <div className="uploader-mode-selector">
                      <button 
                        type="button" 
                        className={`mode-btn ${imageInputMode === 'file' ? 'active' : ''}`}
                        onClick={() => setImageInputMode('file')}
                      >
                        📁 Upload File
                      </button>
                      <button 
                        type="button" 
                        className={`mode-btn ${imageInputMode === 'url' ? 'active' : ''}`}
                        onClick={() => setImageInputMode('url')}
                      >
                        🔗 Link Gambar Web
                      </button>
                    </div>

                    {imageInputMode === 'file' ? (
                      <div className="upload-dropzones-stack">
                        
                        {/* Uploader Foto Utama */}
                        <div className="upload-dropzone">
                          <input 
                            type="file" 
                            accept="image/*" 
                            id="neat-file-input-main"
                            onChange={handleMainFileChange}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="neat-file-input-main" className="dropzone-label">
                            <div className="dropzone-icon-circle">📸</div>
                            <span className="dropzone-text-primary">Pilih FOTO UTAMA</span>
                            <span className="dropzone-text-secondary">Foto sampul depan katalog</span>
                          </label>
                        </div>

                        {/* Uploader Foto Galeri Banyak */}
                        <div className="upload-dropzone secondary-dz">
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            id="neat-file-input-extra"
                            onChange={handleExtraFilesChange}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="neat-file-input-extra" className="dropzone-label">
                            <div className="dropzone-icon-circle">🖼️</div>
                            <span className="dropzone-text-primary">Upload FOTO LAIN / VARIAN (Bisa Pilih Banyak)</span>
                          </label>
                        </div>

                      </div>
                    ) : (
                      <div className="form-field-group" style={{ marginTop: '1rem' }}>
                        <input 
                          type="text" 
                          placeholder="https://images.unsplash.com/... (URL Foto Utama)"
                          className="field-input-neat"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                        />
                      </div>
                    )}

                    {/* GALERI PREVIEW FOTO-FOTO DENGAN TOMBOL HAPUS */}
                    <div className="multi-photo-gallery-preview">
                      {imageUrl && (
                        <div className="photo-thumb-card is-main">
                          <span className="thumb-badge">FOTO UTAMA</span>
                          <img src={resolveImageUrl(imageUrl)} alt="Foto Utama" />
                          <button type="button" onClick={() => setImageUrl('')} className="btn-thumb-del">&times;</button>
                        </div>
                      )}

                      {extraImages.map((img, idx) => (
                        <div key={idx} className="photo-thumb-card">
                          <span className="thumb-badge">FOTO #{idx + 2}</span>
                          <img src={resolveImageUrl(img)} alt={`Foto ${idx + 2}`} />
                          <button type="button" onClick={() => removeExtraImage(idx)} className="btn-thumb-del">&times;</button>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* LANGKAH 3: CARD VARIAN UKURAN, DIMENSI, FOTO VARIAN & HARGA (VERTIKAL CARD LAYOUT) */}
            <div className="form-card-step">
              <div className="step-header">
                <div className="step-badge">3</div>
                <div>
                  <h3 className="step-title">Varian Ukuran, Dimensi, Foto & Harga Multi-Satuan</h3>
                  <p className="step-subtitle">Setiap varian dikelola dalam Card terpisah. Ketik dimensi, volume, harga per satuan, foto varian, dan stok ketersediaan di bawah ini.</p>
                </div>
              </div>

              <div className="step-content">
                <div className="variant-cards-stack">
                  {variants.map((v, index) => (
                    <div key={index} className="variant-card-item">
                      
                      {/* HEADER CARD VARIAN */}
                      <div className="variant-card-header">
                        <div className="card-header-left">
                          <span className="card-badge-num">Varian #{index + 1}</span>
                          <span className="card-preview-size-tag">
                            🏷️ Label: <strong>{buildVariantLabel(v)}</strong>
                          </span>
                        </div>

                        <button 
                          type="button" 
                          className="btn-delete-variant-card"
                          onClick={() => removeVariantRow(index)}
                          title="Hapus varian ini"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          Hapus Varian
                        </button>
                      </div>

                      {/* ISI GRID CARD VARIAN */}
                      <div className="variant-card-body">
                        
                        {/* KELOMPOK 1: DIMENSI & UKURAN */}
                        <div className="variant-group-box">
                          <h4 className="group-box-title">📐 Kelompok Dimensi & Ukuran</h4>
                          <div className="group-fields-grid dim-grid">
                            
                            {/* SUB-NAMA PRODUK SPESIFIK VARIAN */}
                            <div className="v-field full-width" style={{ gridColumn: '1 / -1', marginBottom: '0.6rem' }}>
                              <label style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>
                                🏷️ Nama Produk
                              </label>
                              <input 
                                type="text" 
                                placeholder="Contoh: Paper Lunch Box M.." 
                                value={v.variantName || ''}
                                onChange={(e) => handleVariantChange(index, 'variantName', e.target.value)}
                                className="field-input-neat"
                                style={{ borderColor: '#e2e8f0', fontWeight: 600 }}
                              />
                              <small style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                                Jika diisi, nama produk di Katalog akan menyesuaikan otomatis menjadi nama khusus ini saat varian dipilih.
                              </small>
                            </div>

                            {/* NAMA LABEL VARIAN KUSTOM */}
                            <div className="v-field full-width" style={{ gridColumn: '1 / -1', marginBottom: '0.4rem' }}>
                              <label style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>
                                ✍️ Nama Label Varian 
                              </label>
                              <input 
                                type="text" 
                                placeholder="Contoh: 200 ml (Kecil), P:10×L:20×T:10 cm, Pack 50 Pcs..." 
                                value={v.rawSize || ''}
                                onChange={(e) => handleVariantChange(index, 'rawSize', e.target.value)}
                                className="field-input-neat"
                                style={{ borderColor: '#3b82f6', backgroundColor: '#eff6ff', fontWeight: 700 }}
                              />
                              <small style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                                Biarkan kosong jika ingin label dibuat otomatis dari isian P × L × T / Diameter di bawah ini.
                              </small>
                            </div>

                            <div className="v-field">
                              <label>Panjang (cm)</label>
                              <input 
                                type="number" 
                                step="0.1" 
                                placeholder="P (cm)" 
                                value={v.panjang || ''}
                                onChange={(e) => handleVariantChange(index, 'panjang', e.target.value)}
                              />
                            </div>

                            <div className="v-field">
                              <label>Lebar (cm)</label>
                              <input 
                                type="number" 
                                step="0.1" 
                                placeholder="L (cm)" 
                                value={v.lebar || ''}
                                onChange={(e) => handleVariantChange(index, 'lebar', e.target.value)}
                              />
                            </div>

                            <div className="v-field">
                              <label>Tinggi (cm)</label>
                              <input 
                                type="number" 
                                step="0.1" 
                                placeholder="T (cm)" 
                                value={v.tinggi || ''}
                                onChange={(e) => handleVariantChange(index, 'tinggi', e.target.value)}
                              />
                            </div>

                            <div className="v-field">
                              <label>Diameter Atas (cm)</label>
                              <input 
                                type="number" 
                                step="0.1" 
                                placeholder="Ø Atas (cm)" 
                                value={v.diameterTop || v.diameter || ''}
                                onChange={(e) => handleVariantChange(index, 'diameterTop', e.target.value)}
                              />
                            </div>

                            <div className="v-field">
                              <label>Diameter Bawah (cm)</label>
                              <input 
                                type="number" 
                                step="0.1" 
                                placeholder="Ø Bawah (cm)" 
                                value={v.diameterBottom || ''}
                                onChange={(e) => handleVariantChange(index, 'diameterBottom', e.target.value)}
                               />
                            </div>

                            <div className="v-field">
                              <label>Volume (ml)</label>
                              <input 
                                type="number" 
                                placeholder="ml" 
                                value={v.ml || ''}
                                onChange={(e) => handleVariantChange(index, 'ml', e.target.value)}
                              />
                            </div>

                            <div className="v-field">
                              <label>Ukuran (oz)</label>
                              <input 
                                type="text" 
                                placeholder="oz" 
                                value={v.oz || ''}
                                onChange={(e) => handleVariantChange(index, 'oz', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* KELOMPOK 2: HARGA MULTI-SATUAN (GABUNGAN INPUT + DROPDOWN SATUAN) */}
                        <div className="variant-group-box highlight-price">
                          <h4 className="group-box-title">💰 Kelompok Harga Multi-Satuan (Digabung Praktis)</h4>
                          <div className="group-fields-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                            
                            {/* GABUNGAN 1: HARGA ECERAN (PACK / ROLL) */}
                            <div className="v-field">
                              <label>1. Harga Eceran Kemasan <span className="req-star">*</span></label>
                              <div className="price-combined-input" style={{ display: 'flex', gap: '0.35rem' }}>
                                <div className="price-input-wrapper" style={{ flex: 1 }}>
                                  <span>Rp</span>
                                  <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={v.price}
                                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                    required
                                  />
                                </div>
                                <select
                                  value={v.packUnitType || 'pack'}
                                  onChange={(e) => handleVariantChange(index, 'packUnitType', e.target.value)}
                                  className="v-select-neat"
                                  style={{ width: '110px', fontWeight: 700, padding: '0.4rem 0.5rem' }}
                                >
                                  <option value="pack">/ Pack</option>
                                  <option value="roll">/ Roll</option>
                                </select>
                              </div>
                            </div>

                            {/* GABUNGAN 2: HARGA GROSIR BESAR (DUS / BAL) */}
                            <div className="v-field">
                              <label>2. Harga Grosir Besar <span className="opt-tag">(Opsional)</span></label>
                              <div className="price-combined-input" style={{ display: 'flex', gap: '0.35rem' }}>
                                <div className="price-input-wrapper" style={{ flex: 1 }}>
                                  <span>Rp</span>
                                  <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={v.priceDus || ''}
                                    onChange={(e) => handleVariantChange(index, 'priceDus', e.target.value)}
                                  />
                                </div>
                                <select
                                  value={v.wholesaleUnitType || 'dus'}
                                  onChange={(e) => handleVariantChange(index, 'wholesaleUnitType', e.target.value)}
                                  className="v-select-neat"
                                  style={{ width: '110px', fontWeight: 700, padding: '0.4rem 0.5rem' }}
                                >
                                  <option value="dus">/ Dus</option>
                                  <option value="bal">/ Bal</option>
                                </select>
                              </div>
                            </div>

                            {/* HARGA PER PCS */}
                            <div className="v-field" style={{ gridColumn: '1 / -1' }}>
                              <label>3. Harga per Pcs (Rp) <span className="opt-tag">(Opsional - Informasi Eceran)</span></label>
                              <div className="price-input-wrapper">
                                <span>Rp</span>
                                <input 
                                  type="number" 
                                  placeholder="0" 
                                  value={v.pricePcs || ''}
                                  onChange={(e) => handleVariantChange(index, 'pricePcs', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* KELOMPOK 3: MEDIA & STOK */}
                        <div className="variant-group-box">
                          <h4 className="group-box-title">🖼️ Media & Stok Varian</h4>
                          <div className="group-fields-grid media-grid">
                            <div className="v-field">
                              <label>Hubungkan Foto Spesifik Varian</label>
                              <select
                                className="v-select-neat"
                                value={v.imageUrl || ''}
                                onChange={(e) => handleVariantChange(index, 'imageUrl', e.target.value)}
                              >
                                <option value="">(Gunakan Foto Utama Produk)</option>
                                {allAvailableImages.map((imgUrl, imgIdx) => (
                                  <option key={imgIdx} value={imgUrl}>
                                    Foto Galeri #{imgIdx + 1}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="v-field">
                              <label>Status Ketersediaan Stok</label>
                              <button
                                type="button"
                                className={`variant-stock-card-toggle ${v.inStock ? 'is-in-stock' : 'is-out-of-stock'}`}
                                onClick={() => toggleVariantStock(index)}
                              >
                                {v.inStock ? '✓ Stok Tersedia (Aktif)' : '✗ Stok Habis (Kosong)'}
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* FOOTER CARD VARIAN - LIVE PREVIEW LABEL AUTOMATIC */}
                      <div className="variant-card-footer">
                        <span className="footer-label-preview">
                          ✨ <strong>Hasil Label Otomatis:</strong> "{buildVariantLabel(v)}" {v.price ? `— Rp ${formatRupiah(v.price)} / pack` : ''}
                          {v.priceRoll ? ` | Rp ${formatRupiah(v.priceRoll)} / roll` : ''}
                          {v.priceDus ? ` | Rp ${formatRupiah(v.priceDus)} / dus` : ''}
                        </span>
                      </div>

                    </div>
                  ))}

                  {/* TOMBOL + TAMBAH VARIAN BARU DI BAGIAN BAWAH CARD */}
                  <button 
                    type="button" 
                    className="btn-add-variant-card-bottom"
                    onClick={addVariantRow}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Varian Ukuran Baru
                  </button>

                </div>
              </div>
            </div>

            {/* BAR TOMBOL SIMPAN / BATAL */}
            <div className="neat-form-actions">
              <button type="submit" className="btn-submit-neat-primary">
                {editingProductId ? 'Simpan Perubahan Produk' : 'Simpan Produk ke Katalog'}
              </button>
              <button type="button" onClick={handleCancelEdit} className="btn-submit-neat-secondary">
                Batal & Kembali
              </button>
            </div>

          </form>
        </div>
      )}


      {activeAdminTab === 'category' && (
        <div className="admin-category-view-container">
          
          <div className="form-card-step" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="step-header">
              <div className="step-badge">🏷️</div>
              <div>
                <h3 className="step-title">Tambah & Kelola Kategori Utama</h3>
                <p className="step-subtitle">Kategori baru akan otomatis muncul di Navigasi Guest Header dan Dropdown Form Tambah Produk.</p>
              </div>
            </div>

            <div className="step-content">
              
              {/* Form Tambah Kategori */}
              <form onSubmit={handleCategorySubmit} className="add-category-form-row">
                <div className="form-field-group" style={{ flex: 1 }}>
                  <label className="field-label">Nama Kategori Baru</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Sedotan & Aksesoris, Botol Plastik PET, Sendok Plastik..."
                    className="field-input-neat"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-add-cat-primary">
                  + Tambah Kategori Baru
                </button>
              </form>

              {/* Daftar Kategori Terdaftar */}
              <div className="registered-categories-list">
                <h4 className="registered-cat-header">Daftar Kategori Aktif ({categories.length})</h4>
                
                <div className="category-cards-grid">
                  {categories.map((cat, idx) => {
                    const prodCount = products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
                    return (
                      <div key={idx} className="category-item-card">
                        <div className="cat-card-info">
                          <span className="cat-card-name">{cat}</span>
                          <span className="cat-card-count">{prodCount} Produk Terdaftar</span>
                        </div>

                        <div className="cat-card-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '85px' }}>
                          <button 
                            type="button" 
                            className="btn-admin-edit"
                            onClick={() => {
                              const newName = prompt(`Edit / Perbaiki Nama Kategori "${cat}":`, cat);
                              if (newName && newName.trim() && newName.trim() !== cat) {
                                onEditCategory(cat, newName.trim());
                              }
                            }}
                            title="Edit nama kategori ini (Perbaiki typo)"
                          >
                            Edit
                          </button>
                          <button 
                            type="button" 
                            className="btn-admin-delete"
                            onClick={() => {
                              if (window.confirm(`Yakin ingin menghapus kategori "${cat}"?`)) {
                                onDeleteCategory(cat);
                              }
                            }}
                            title="Hapus kategori ini"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default AdminView;