import { useState } from 'react';

function AdminView({ products, categories, onAddProduct, onUpdateProduct, onDeleteProduct, onAddCategory, onDeleteCategory, onResetDefaults }) {
  // Tab Admin Aktif ('list' = daftar barang, 'form' = tambah/edit produk, 'category' = kelola kategori)
  const [activeAdminTab, setActiveAdminTab] = useState('list');

  // State Mode Form (null = Tambah Produk Baru, ID = Edit Produk)
  const [editingProductId, setEditingProductId] = useState(null);

  // State Field Form Produk
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Thinwall');
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
    { size: '', price: '', inStock: true, panjang: '', lebar: '', tinggi: '', diameter: '', ml: '', oz: '', rawSize: '', imageUrl: '' }
  ]);

  // State Input Kategori Baru
  const [newCatInput, setNewCatInput] = useState('');

  // State Notifikasi
  const [alertMessage, setAlertMessage] = useState('');
  // State Filter di Daftar Admin
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('Semua');

  // Total statistik produk
  const totalProducts = products.length;
  const outOfStockCount = products.reduce((acc, p) => {
    const hasOut = p.variants && p.variants.some(v => !v.inStock);
    return hasOut ? acc + 1 : acc;
  }, 0);

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
    setVariants([...variants, { size: '', price: '', inStock: true, panjang: '', lebar: '', tinggi: '', diameter: '', ml: '', oz: '', rawSize: '', imageUrl: '' }]);
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

    // Diameter
    if (v.diameter) {
      parts.push(`Ø ${v.diameter} cm`);
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

    return parts.length > 0 ? parts.join(' / ') : 'Standar';
  };

  // Mulai Mode Edit Produk (otomatis buka Tab Form)
  const handleStartEdit = (product) => {
    setEditingProductId(product.id);
    setName(product.name || '');
    setCategory(product.category || categories[0] || 'Thinwall');
    setSubCategory(product.subCategory || '');
    setLabelBadge(product.labelBadge || 'Tanpa Label');
    setMinOrder(product.minOrder || '1 Pak (50 pcs)');
    setDescription(product.description || '');
    setImageUrl(product.imageUrl || '');
    setExtraImages(product.extraImages || []);

    setVariants(product.variants && product.variants.length > 0 
      ? product.variants.map(v => ({
          size: v.size || '',
          rawSize: v.size || '',
          price: v.price !== undefined ? v.price : '',
          inStock: v.inStock !== undefined ? v.inStock : true,
          panjang: v.panjang || '',
          lebar: v.lebar || '',
          tinggi: v.tinggi || '',
          diameter: v.diameter || '',
          ml: v.ml || '',
          oz: v.oz || '',
          imageUrl: v.imageUrl || ''
        }))
      : [{ size: 'Standar', price: '', inStock: true, imageUrl: '' }]
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
    setVariants([{ size: '', price: '', inStock: true, panjang: '', lebar: '', tinggi: '', diameter: '', ml: '', oz: '', rawSize: '', imageUrl: '' }]);
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
        const parsedPrice = v.price !== '' && !isNaN(v.price) ? parseFloat(v.price) : 0;
        return {
          size: label,
          price: parsedPrice,
          inStock: v.inStock,
          panjang: v.panjang,
          lebar: v.lebar,
          tinggi: v.tinggi,
          diameter: v.diameter,
          ml: v.ml,
          oz: v.oz,
          imageUrl: v.imageUrl
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
    return new Intl.NumberFormat('id-ID').format(number);
  };

  // Helper: Bypass CORS/hotlink block untuk gambar Instagram & media sosial
  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:image')) return url;
    if (
      url.includes('instagram.com') ||
      url.includes('cdninstagram.com') ||
      url.includes('fbcdn.net') ||
      url.includes('scontent')
    ) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // List semua gambar produk yang sudah diupload untuk dropdown varian
  const allAvailableImages = [imageUrl, ...extraImages].filter(Boolean);

  // Filter daftar produk di admin
  const filteredAdminProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          p.subCategory.toLowerCase().includes(adminSearch.toLowerCase());
    const matchesCat = adminCategoryFilter === 'Semua' || p.category === adminCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="admin-page-wrapper">
      
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
          <span className="stat-card-value">{categories.length} Kategori</span>
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
          Daftar Semua Barang ({products.length})
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
          {editingProductId ? `Edit Produk #${editingProductId}` : '+ Tambah Produk Baru'}
        </button>

        <button 
          type="button"
          className={`admin-tab-btn ${activeAdminTab === 'category' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('category')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          Kelola Kategori ({categories.length})
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
              {['Semua', ...categories].map(cat => (
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
                        {product.category[0]}
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
                      onClick={() => handleStartEdit(product)}
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
            
            {/* LANGKAH 1: INFORMASI UTAMA PRODUK */}
            <div className="form-card-step">
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
                    <label className="field-label">Label Promo Highlight (Katalog Guest)</label>
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
                  <label className="field-label">Deskripsi Lengkap Produk</label>
                  <textarea 
                    placeholder="Contoh: Box makanan bahan berkualitas tinggi, kedap udara, aman untuk makanan berkuah panas..."
                    className="field-textarea-neat"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* LANGKAH 2: UPLOAD GALERI FOTO BANYAK (Shopee Multi-Photo Gallery) */}
            <div className="form-card-step">
              <div className="step-header">
                <div className="step-badge">2</div>
                <div>
                  <h3 className="step-title">Galeri Foto Produk</h3>
                  <p className="step-subtitle">Upload foto utama dan foto-foto varian lain agar pengunjung melihat detail produk.</p>
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
                      🔗 Gunakan Link Gambar Web
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
                          <span className="dropzone-text-primary">Klik untuk Pilih FOTO UTAMA</span>
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

            {/* LANGKAH 3: TABEL VARIAN UKURAN, DIMENSI, FOTO VARIAN & HARGA */}
            <div className="form-card-step">
              <div className="step-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="step-badge">3</div>
                  <div>
                    <h3 className="step-title">Varian Ukuran, Dimensi, Foto & Harga</h3>
                    <p className="step-subtitle">Ketik dimensi, volume, harga, serta hubungkan foto spesifik untuk masing-masing ukuran varian di bawah ini.</p>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-add-variant-size"
                  onClick={addVariantRow}
                >
                  + Tambah Baris Varian
                </button>
              </div>

              <div className="step-content">
                <div className="neat-table-responsive-wrapper">
                  <table className="neat-variant-table-grid">
                    <thead>
                      <tr>
                        <th style={{ width: '35px' }}>#</th>
                        <th>Panjang (cm)</th>
                        <th>Lebar (cm)</th>
                        <th>Tinggi (cm)</th>
                        <th>Diameter (cm)</th>
                        <th>Vol (ml)</th>
                        <th>Ukuran (oz)</th>
                        <th style={{ minWidth: '130px' }}>Pilih Foto Varian</th>
                        <th style={{ minWidth: '120px' }}>Harga Per Pack (Rp)</th>
                        <th style={{ width: '90px', textAlign: 'center' }}>Stok</th>
                        <th style={{ width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v, index) => (
                        <tr key={index}>
                          <td className="row-index">{index + 1}</td>

                          <td>
                            <input 
                              type="number" 
                              step="0.1" 
                              placeholder="P (cm)"
                              className="table-input-neat"
                              value={v.panjang || ''}
                              onChange={(e) => handleVariantChange(index, 'panjang', e.target.value)}
                            />
                          </td>

                          <td>
                            <input 
                              type="number" 
                              step="0.1" 
                              placeholder="L (cm)"
                              className="table-input-neat"
                              value={v.lebar || ''}
                              onChange={(e) => handleVariantChange(index, 'lebar', e.target.value)}
                            />
                          </td>

                          <td>
                            <input 
                              type="number" 
                              step="0.1" 
                              placeholder="T (cm)"
                              className="table-input-neat"
                              value={v.tinggi || ''}
                              onChange={(e) => handleVariantChange(index, 'tinggi', e.target.value)}
                            />
                          </td>

                          <td>
                            <input 
                              type="number" 
                              step="0.1" 
                              placeholder="Ø (cm)"
                              className="table-input-neat"
                              value={v.diameter || ''}
                              onChange={(e) => handleVariantChange(index, 'diameter', e.target.value)}
                            />
                          </td>

                          <td>
                            <input 
                              type="number" 
                              placeholder="ml"
                              className="table-input-neat"
                              value={v.ml || ''}
                              onChange={(e) => handleVariantChange(index, 'ml', e.target.value)}
                            />
                          </td>

                          <td>
                            <input 
                              type="text" 
                              placeholder="oz"
                              className="table-input-neat"
                              value={v.oz || ''}
                              onChange={(e) => handleVariantChange(index, 'oz', e.target.value)}
                            />
                          </td>

                          {/* HUBUNGKAN FOTO SPESIFIK KE VARIAN INI */}
                          <td>
                            <select
                              className="table-input-neat"
                              value={v.imageUrl || ''}
                              onChange={(e) => handleVariantChange(index, 'imageUrl', e.target.value)}
                              style={{ fontSize: '0.8rem' }}
                            >
                              <option value="">(Foto Utama)</option>
                              {allAvailableImages.map((imgUrl, imgIdx) => (
                                <option key={imgIdx} value={imgUrl}>
                                  Foto #{imgIdx + 1}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* HARGA SATUAN */}
                          <td>
                            <div className="table-price-wrap">
                              <span className="table-rp">Rp</span>
                              <input 
                                type="number" 
                                placeholder="0"
                                className="table-input-neat padded-rp"
                                value={v.price}
                                onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                              />
                            </div>
                          </td>

                          {/* TOGGLE STOK */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className={`stock-toggle-btn-small ${v.inStock ? 'in-stock' : 'out-of-stock'}`}
                              onClick={() => toggleVariantStock(index)}
                            >
                              {v.inStock ? '✓ Ada' : '✗ Habis'}
                            </button>
                          </td>

                          {/* HAPUS */}
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              type="button" 
                              className="btn-remove-row-neat"
                              onClick={() => removeVariantRow(index)}
                              title="Hapus baris varian ini"
                            >
                              &times;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="variant-preview-summary-box">
                  <span className="summary-title">Preview Label Hasil Otomatis di Katalog:</span>
                  <div className="summary-labels-list">
                    {variants.map((v, i) => (
                      <span key={i} className="summary-chip-badge">
                        Varian #{i + 1}: {buildVariantLabel(v)} {v.price ? `(Rp ${formatRupiah(v.price)})` : ''} {v.imageUrl ? '📷 [Foto Khusus]' : ''}
                      </span>
                    ))}
                  </div>
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


      {/* ==================== TAB 3: KELOLA KATEGORI UTAMA (DINAMIS) ==================== */}
      {activeAdminTab === 'category' && (
        <div className="admin-category-view-container">
          
          <div className="form-card-step" style={{ maxWidth: '800px' }}>
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

                        <button 
                          type="button" 
                          className="btn-delete-cat"
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