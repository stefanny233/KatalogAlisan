import { useState } from 'react';

function CatalogView({ products, categories = [], activeCategory, setActiveCategory, searchQuery }) {
  const [activeSubCategory, setActiveSubCategory] = useState('Semua Tipe');
  const [selectedVariantMap, setSelectedVariantMap] = useState({});
  
  // State untuk Quick Selector (Pilih Kemasan Anda)
  const [quickCategory, setQuickCategory] = useState('Semua');
  const [quickType, setQuickType] = useState('Semua Tipe');

  // State untuk modal detail produk Shopee-style
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailVariantIdx, setDetailVariantIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const formatRupiah = (number) => {
    const val = parseFloat(number);
    if (isNaN(val)) return '0';
    return new Intl.NumberFormat('id-ID').format(val);
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

  // Buka modal detail produk
  const openDetail = (product) => {
    setDetailProduct(product);
    setDetailVariantIdx(0);
    setActiveImageIdx(0);
    document.body.style.overflow = 'hidden';
  };

  // Tutup modal detail produk
  const closeDetail = () => {
    setDetailProduct(null);
    document.body.style.overflow = '';
  };

  // Ambil sub-kategori unik berdasarkan kategori aktif
  const getSubCategories = () => {
    const list = ['Semua Tipe'];
    products.forEach(p => {
      if (activeCategory === 'Semua' || p.category.toLowerCase() === activeCategory.toLowerCase()) {
        if (p.subCategory && !list.includes(p.subCategory)) {
          list.push(p.subCategory);
        }
      }
    });
    return list;
  };

  // Ambil sub-kategori untuk menu selector cepat
  const getAllSubCategoriesForSelector = () => {
    const list = ['Semua Tipe'];
    products.forEach(p => {
      if (quickCategory === 'Semua' || p.category.toLowerCase() === quickCategory.toLowerCase()) {
        if (p.subCategory && !list.includes(p.subCategory)) {
          list.push(p.subCategory);
        }
      }
    });
    return list;
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    setActiveCategory(quickCategory);
    setActiveSubCategory(quickType);
    const element = document.getElementById('catalog-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderFallbackImage = (category, name) => {
    let iconSvg = null;
    if (category === 'Thinwall') {
      iconSvg = (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
          <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
          <polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08" />
          <polygon points="12 12 21 6.92 12 1.84 3 6.92 12 12" />
        </svg>
      );
    } else if (category === 'Paper Bowl') {
      iconSvg = (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12h20" />
          <path d="M20 12v4a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6v-4" />
          <path d="M12 2v6" />
          <path d="M8 3v3" />
          <path d="M16 3v3" />
        </svg>
      );
    } else {
      iconSvg = (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      );
    }
    return (
      <div className="placeholder-image">
        <div className="placeholder-icon">{iconSvg}</div>
        <div className="placeholder-text">{name}</div>
      </div>
    );
  };

  // Filter produk
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'Semua' || product.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSubCategory = activeSubCategory === 'Semua Tipe' || product.subCategory === activeSubCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.subCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  const handleVariantSelect = (productId, variantIndex) => {
    setSelectedVariantMap(prev => ({
      ...prev,
      [productId]: variantIndex
    }));
  };

  const getBadgeClass = (label) => {
    if (!label || label === 'Tanpa Label') return '';
    if (label === 'Terlaris') return 'badge-terlaris';
    if (label === 'Promo') return 'badge-promo';
    if (label === 'Baru') return 'badge-baru';
    return 'badge-rekomendasi';
  };

  // Kumpulan foto produk untuk galeri Shopee di detail modal
  const getProductGallery = (prod) => {
    if (!prod) return [];
    const list = [];
    if (prod.imageUrl) list.push(prod.imageUrl);
    if (prod.extraImages && Array.isArray(prod.extraImages)) {
      prod.extraImages.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    // Masukkan juga variant images agar tidak terlewat
    if (prod.variants && Array.isArray(prod.variants)) {
      prod.variants.forEach(v => {
        if (v.imageUrl && !list.includes(v.imageUrl)) {
          list.push(v.imageUrl);
        }
      });
    }
    return list;
  };

  const galleryList = detailProduct ? getProductGallery(detailProduct) : [];
  const currentMainImage = galleryList[activeImageIdx] || detailProduct?.imageUrl;
  const detailActiveVariant = detailProduct?.variants?.[detailVariantIdx] || detailProduct?.variants?.[0];

  // Helper pembanding URL gambar yang kokoh
  const isMatch = (url1, url2) => {
    if (!url1 || !url2) return false;
    const clean = (url) => {
      let u = url.trim().toLowerCase();
      if (u.includes('images.weserv.nl/?url=')) {
        const parts = u.split('url=');
        if (parts[1]) u = decodeURIComponent(parts[1]);
      }
      return u;
    };
    return clean(url1) === clean(url2);
  };

  // Helper ganti foto utama dan sync otomatis variant yang sesuai (dua arah)
  const changeActiveImage = (newIdx) => {
    setActiveImageIdx(newIdx);
    const targetImg = galleryList[newIdx];
    if (targetImg && detailProduct?.variants) {
      const matchedIdx = detailProduct.variants.findIndex(v => {
        // Jika targetImg adalah image utama produk, cocokkan dengan variant yang kosong atau sama
        if (isMatch(targetImg, detailProduct.imageUrl)) {
          return !v.imageUrl || isMatch(v.imageUrl, targetImg);
        }
        return isMatch(v.imageUrl, targetImg);
      });
      if (matchedIdx !== -1) {
        setDetailVariantIdx(matchedIdx);
      }
    }
  };

  // Saat pilih ukuran varian, otomatis ganti foto ke foto varian tersebut (bila ada)
  const handleSelectModalVariant = (idx) => {
    setDetailVariantIdx(idx);
    const selectedVariant = detailProduct?.variants?.[idx];
    if (selectedVariant && selectedVariant.imageUrl) {
      const matchIndex = galleryList.findIndex(img => isMatch(img, selectedVariant.imageUrl));
      if (matchIndex !== -1) {
        setActiveImageIdx(matchIndex);
      }
    } else {
      // Jika varian tidak memiliki image khusus, kembali ke foto utama
      setActiveImageIdx(0);
    }
  };

  // Navigasi foto geser (Next & Prev)
  const handleNextPhoto = () => {
    if (galleryList.length > 0) {
      const nextIdx = (activeImageIdx + 1) % galleryList.length;
      changeActiveImage(nextIdx);
    }
  };

  const handlePrevPhoto = () => {
    if (galleryList.length > 0) {
      const prevIdx = (activeImageIdx - 1 + galleryList.length) % galleryList.length;
      changeActiveImage(prevIdx);
    }
  };

  return (
    <div className="catalog-wrapper">

      {/* ========== MODAL DETAIL PRODUK SHOPEE-STYLE DENGAN GALERI GESER ========== */}
      {detailProduct && (
        <div className="detail-modal-overlay" onClick={closeDetail}>
          <div className="detail-modal-card shopee-style-card" onClick={(e) => e.stopPropagation()}>

            {/* Tombol Tutup */}
            <button className="detail-modal-close" onClick={closeDetail} aria-label="Tutup">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="detail-modal-body">
              
              {/* Kolom Kiri: Galeri Foto Slider Ala Shopee */}
              <div className="shopee-gallery-col">
                <div className="shopee-main-image-wrap">
                  {currentMainImage ? (
                    <img
                      src={resolveImageUrl(currentMainImage)}
                      alt={detailProduct.name}
                      className="shopee-main-image"
                    />
                  ) : (
                    renderFallbackImage(detailProduct.category, detailProduct.name)
                  )}

                  {/* Tombol Panah Geser Foto (< dan >) */}
                  {galleryList.length > 1 && (
                    <>
                      <button type="button" className="gallery-arrow-btn prev" onClick={handlePrevPhoto}>
                        ‹
                      </button>
                      <button type="button" className="gallery-arrow-btn next" onClick={handleNextPhoto}>
                        ›
                      </button>
                      <span className="gallery-counter-pill">
                        {activeImageIdx + 1} / {galleryList.length}
                      </span>
                    </>
                  )}

                  {/* Badge */}
                  {detailProduct.labelBadge && detailProduct.labelBadge !== 'Tanpa Label' && (
                    <span className={`detail-badge ${getBadgeClass(detailProduct.labelBadge)}`}>
                      {detailProduct.labelBadge}
                    </span>
                  )}
                </div>

                {/* Thumbnails Foto Dibawah Main Photo */}
                {galleryList.length > 1 && (
                  <div className="shopee-thumbnails-row">
                    {galleryList.map((imgUrl, i) => (
                      <div
                        key={i}
                        className={`shopee-thumb-item ${activeImageIdx === i ? 'active' : ''}`}
                        onClick={() => changeActiveImage(i)}
                      >
                        <img src={resolveImageUrl(imgUrl)} alt={`Thumb ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Info Produk & Variasi */}
              <div className="detail-info-col">
                <div className="detail-crumbs">
                  <span>{detailProduct.category}</span>
                  <span className="crumb-sep">›</span>
                  <span>{detailProduct.subCategory}</span>
                </div>

                <h2 className="detail-product-title">{detailProduct.name}</h2>

                {detailProduct.minOrder && (
                  <div className="detail-min-order">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    Isi / Minimal Pembelian: <strong>{detailProduct.minOrder}</strong>
                  </div>
                )}

                <p className="detail-description">{detailProduct.description}</p>

                {/* PILIH UKURAN & DIMENSI */}
                {detailProduct.variants && detailProduct.variants.length > 0 && (
                  <div className="detail-variants-section">
                    <h4 className="detail-variants-label">📦 Pilihan Ukuran & Dimensi:</h4>
                    <div className="detail-variants-grid">
                      {detailProduct.variants.map((v, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`detail-variant-btn ${detailVariantIdx === idx ? 'active' : ''} ${!v.inStock ? 'out-of-stock' : ''}`}
                          onClick={() => handleSelectModalVariant(idx)}
                        >
                          <span className="dv-size">{v.size}</span>
                          <span className="dv-price">Rp {formatRupiah(v.price)} / pack</span>
                          {!v.inStock && <span className="dv-empty">Habis</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* HARGA FINAL PER PACK */}
                {detailActiveVariant && (
                  <div className="detail-price-box">
                    <span className="detail-price-label">
                      {detailActiveVariant.inStock ? 'Harga Per Pack' : '⚠ Stok Sedang Kosong'}
                    </span>
                    <div className="detail-price-value">
                      <span className="detail-price-rp">Rp</span>
                      {formatRupiah(detailActiveVariant.price)}
                      <span className="detail-price-size"> / pack ({detailActiveVariant.size})</span>
                    </div>
                  </div>
                )}

                {/* TOMBOL ORDER WA */}
                <a
                  href={`https://wa.me/6282384442202?text=Halo%20Alisan%20Plastik,%20saya%20ingin%20memesan:%0A%0A%E2%80%A2%20Produk:%20${encodeURIComponent(detailProduct.name)}%0A%E2%80%A2%20Jenis:%20${encodeURIComponent(detailProduct.subCategory)}%0A%E2%80%A2%20Ukuran:%20${encodeURIComponent(detailActiveVariant?.size || '-')}%0A%E2%80%A2%20Harga:%20Rp%20${formatRupiah(detailActiveVariant?.price || 0)}%20/%20pack%0A%E2%80%A2%20Min.%20Order:%20${encodeURIComponent(detailProduct.minOrder || '1 Pak')}%0A%0ATolong%20info%20stok%20dan%20ongkos%20kirim.%20Terima%20kasih!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`detail-wa-btn ${detailActiveVariant && !detailActiveVariant.inStock ? 'disabled-detail-wa' : ''}`}
                  onClick={(e) => {
                    if (detailActiveVariant && !detailActiveVariant.inStock) {
                      e.preventDefault();
                      alert('Stok ukuran ini sedang kosong. Pilih ukuran lain ya!');
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.005 5.319 5.324.001 11.873.001c3.178.001 6.165 1.24 8.409 3.486 2.245 2.246 3.481 5.235 3.479 8.414-.005 6.557-5.322 11.875-11.872 11.875-2.001-.001-3.968-.507-5.717-1.472L0 24zm6.59-4.846c1.6.95 3.6 1.488 5.275 1.489 5.428 0 9.845-4.417 9.849-9.847.002-2.63-1.023-5.101-2.887-6.966a9.78 9.78 0 0 0-6.96-2.88c-5.428 0-9.849 4.42-9.853 9.85-.002 1.902.497 3.758 1.446 5.4L2.238 21.725l4.409-1.157zm11.215-7.617c-.3-.149-1.786-.881-2.067-.983-.281-.102-.485-.152-.689.153-.204.304-.787.983-.965 1.186-.178.203-.356.229-.656.079-.3-.15-1.266-.466-2.41-1.487-.89-.793-1.49-1.773-1.665-2.072-.175-.3-.019-.462.13-.611.135-.134.3-.349.45-.524.15-.175.2-.299.3-.499.1-.2.05-.375-.025-.524-.075-.15-.689-1.658-.944-2.272-.249-.598-.5-.517-.689-.527-.178-.009-.383-.01-.588-.01s-.538.077-.82.385c-.282.309-1.077 1.053-1.077 2.569 0 1.516 1.102 2.985 1.253 3.19.15.204 2.169 3.312 5.253 4.643.734.316 1.307.505 1.753.647.737.234 1.407.201 1.937.122.59-.088 1.786-.73 2.037-1.434.25-.704.25-1.307.175-1.434-.075-.127-.281-.203-.582-.352z" />
                  </svg>
                  {detailActiveVariant?.inStock ? 'Pesan via WhatsApp' : 'Stok Habis'}
                </a>

                <p className="detail-wa-note">Klik tombol di atas untuk langsung chat ke WA Admin Alisan Plastik</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONDITIONAL RENDER: 
          JIKA activeCategory === 'Semua': TAMPILKAN HERO UTAMA
          JIKA activeCategory !== 'Semua': TAMPILKAN HALAMAN KATEGORI KHUSUS 
      */}
      {activeCategory === 'Semua' ? (
        <>
          {/* 1. HERO SECTION UTAMA */}
          <section className="hero-section">
            <div className="quick-selector-card">
              <div className="selector-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/>
                </svg>
                <h3>Pilih Kemasan Anda</h3>
              </div>
              <form onSubmit={handleQuickSearch} className="selector-form">
                <div className="selector-group">
                  <label>Kategori Utama</label>
                  <select 
                    value={quickCategory} 
                    onChange={(e) => { setQuickCategory(e.target.value); setQuickType('Semua Tipe'); }}
                    className="selector-select"
                  >
                    <option value="Semua">Semua Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="selector-group">
                  <label>Jenis / Sub-Kategori</label>
                  <select 
                    value={quickType} 
                    onChange={(e) => setQuickType(e.target.value)}
                    className="selector-select"
                  >
                    {getAllSubCategoriesForSelector().map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-selector-submit">Cari Kemasan</button>
              </form>
              <div className="selector-footer">
                <span>Butuh bantuan?</span>
                <a href="https://wa.me/6282384442202" target="_blank" rel="noopener noreferrer">Hubungi WA Kami</a>
              </div>
            </div>

            <div className="hero-banner-card">
              <div className="banner-overlay"></div>
              <div className="banner-content">
                <span className="banner-badge">ALISAN PLASTIK - PARTNER BISNIS KULINER ANDA</span>
                <h2 className="banner-title">Largest Catalog of Premium &amp; Food Grade Plastic Packaging</h2>
                <p className="banner-subtitle">Pilihan terlengkap kemasan cup plastik, box thinwall, dan paper bowl dengan harga grosir terbaik.</p>
                <div className="banner-stats">
                  <div className="stat-item"><span className="stat-num">1M+</span><span className="stat-label">Produk Terjual</span></div>
                  <div className="stat-item"><span className="stat-num">100%</span><span className="stat-label">Bahan Food Grade</span></div>
                  <div className="stat-item"><span className="stat-num">Express</span><span className="stat-label">WhatsApp Delivery</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. FEATURE BADGES */}
          <section className="feature-badges-section">
            <div className="feature-badge-item">
              <div className="badge-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
              <div className="badge-text-wrap"><h4>Bahan Food Grade Premium</h4><p>Aman untuk makanan panas &amp; dingin</p></div>
            </div>
            <div className="feature-badge-item">
              <div className="badge-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 10v4M8 12h8"/></svg></div>
              <div className="badge-text-wrap"><h4>Harga Grosir Termurah</h4><p>Harga langsung dari tangan pertama</p></div>
            </div>
            <div className="feature-badge-item">
              <div className="badge-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></div>
              <div className="badge-text-wrap"><h4>Order WhatsApp Instan</h4><p>Proses cepat langsung kirim detailnya</p></div>
            </div>
            <div className="feature-badge-item">
              <div className="badge-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></div>
              <div className="badge-text-wrap"><h4>Pilihan Varian Ukuran</h4><p>Tersedia beragam ukuran sesuai kebutuhan</p></div>
            </div>
          </section>

          {/* 3. QUICK NAV */}
          <section className="quick-nav-section">
            {categories.slice(0, 3).map((catName) => (
              <div key={catName} className="quick-nav-card" onClick={() => { setActiveCategory(catName); setActiveSubCategory('Semua Tipe'); }}>
                <div className="quick-nav-content"><h4>Koleksi {catName}</h4><span>Lihat Halaman &rarr;</span></div>
              </div>
            ))}
            <div className="quick-nav-card highlight" onClick={() => window.open('https://wa.me/6282384442202', '_blank')}>
              <div className="quick-nav-content"><h4>Sablon &amp; Custom Logo</h4><span>Konsultasi WA &rarr;</span></div>
            </div>
          </section>
        </>
      ) : (
        /* HALAMAN KHUSUS KATEGORI TERPILIH */
        <section className="dedicated-category-page-banner">
          <div className="category-banner-card">
            <div className="cat-banner-crumbs">
              <span onClick={() => setActiveCategory('Semua')} className="crumb-clickable">Katalog Utama</span>
              <span className="crumb-arrow">›</span>
              <span className="crumb-current">{activeCategory}</span>
            </div>

            <div className="cat-banner-header-row">
              <div>
                <h1 className="cat-banner-title">Koleksi Kemasan {activeCategory}</h1>
                <p className="cat-banner-subtitle">
                  Menampilkan seluruh ragam {activeCategory} dengan berbagai spesifikasi ukuran, dimensi, dan harga per pack grosir termurah.
                </p>
              </div>

              <button 
                type="button" 
                className="btn-back-all-cats"
                onClick={() => { setActiveCategory('Semua'); setActiveSubCategory('Semua Tipe'); }}
              >
                ← Kembali ke Semua Katalog
              </button>
            </div>

            <div className="cat-banner-meta-bar">
              <span className="cat-meta-chip">📦 {filteredProducts.length} Produk Ditemukan</span>
              <span className="cat-meta-chip">✓ Food Grade Premium</span>
              <span className="cat-meta-chip">⚡ Ready Stock</span>
            </div>
          </div>
        </section>
      )}

      {/* 4. PRODUCT GRID & SUBCATEGORY FILTER */}
      <section className="catalog-products-section" id="catalog-products">
        <div className="section-title-wrap">
          <h2 className="section-title">
            {activeCategory === 'Semua' ? 'Katalog Produk Terpilih' : `Daftar Produk ${activeCategory}`}
          </h2>
          {getSubCategories().length > 1 && (
            <div className="subcategory-tabs-wrap">
              {getSubCategories().map((subCat) => (
                <button
                  key={subCat}
                  className={`tab-btn-sub ${activeSubCategory === subCat ? 'active' : ''}`}
                  onClick={() => setActiveSubCategory(subCat)}
                >
                  {subCat}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const activeVariantIdx = selectedVariantMap[product.id] !== undefined ? selectedVariantMap[product.id] : 0;
              const activeVariant = product.variants?.length > 0
                ? (product.variants[activeVariantIdx] || product.variants[0])
                : { size: 'Standar', price: 0, inStock: true };

              const photoCount = (product.imageUrl ? 1 : 0) + (product.extraImages ? product.extraImages.length : 0);
              const displayImage = activeVariant.imageUrl || product.imageUrl;

              return (
                <div key={product.id} className="product-card">
                  {/* Area gambar — klik buka detail Shopee */}
                  <div
                    className="image-container clickable-image"
                    onClick={() => openDetail(product)}
                    title="Klik untuk lihat galeri & detail produk"
                  >
                    {product.labelBadge && product.labelBadge !== 'Tanpa Label' && (
                      <span className={`label-badge-highlight ${getBadgeClass(product.labelBadge)}`}>
                        {product.labelBadge}
                      </span>
                    )}
                    <span className="category-badge">{product.category}</span>
                    <span className="subcategory-badge-card">{product.subCategory}</span>

                    {photoCount > 1 && (
                      <span className="photo-count-badge">
                        📷 {photoCount} Foto
                      </span>
                    )}

                    {displayImage ? (
                      <img
                        src={resolveImageUrl(displayImage)}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      renderFallbackImage(product.category, product.name)
                    )}

                    {/* Overlay "Lihat Detail" saat hover */}
                    <div className="image-hover-overlay">
                      <span className="overlay-text">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>
                        Lihat Detail ({photoCount} Foto)
                      </span>
                    </div>
                  </div>

                  <div className="product-info">
                    <h3
                      className="product-title clickable-title"
                      onClick={() => openDetail(product)}
                    >
                      {product.name}
                    </h3>

                    {product.minOrder && (
                      <div className="product-min-order">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                        Isi / Min. Pemesanan: {product.minOrder}
                      </div>
                    )}

                    <div className="product-price-section">
                      <div className="product-price-label">{activeVariant.inStock ? 'Harga Per Pack' : 'Stok Kosong'}</div>
                      <div className="product-price">
                        <span className="price-currency">Rp</span>
                        {formatRupiah(activeVariant.price)}
                        <span className="price-unit-pack"> / pack</span>
                      </div>
                    </div>

                    <p className="product-desc">{product.description}</p>

                    {product.variants?.length > 0 && (
                      <div className="variant-pills-container">
                        <div className="variant-pills">
                          {product.variants.map((v, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className={`variant-pill-btn ${activeVariantIdx === idx ? 'active' : ''} ${!v.inStock ? 'out-of-stock-pill' : ''}`}
                              onClick={() => handleVariantSelect(product.id, idx)}
                            >
                              {v.size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <a
                      href={`https://wa.me/6282384442202?text=Halo%20Alisan%20Plastik,%20saya%20tertarik%20untuk%20memesan%20produk%20berikut:%0A%0A-%20Nama%20Produk:%20${encodeURIComponent(product.name)}%0A-%20Jenis/Bahan:%20${encodeURIComponent(product.subCategory)}%0A-%20Ukuran:%20${encodeURIComponent(activeVariant.size)}%0A-%20Harga:%20Rp%20${formatRupiah(activeVariant.price)}%20/%20pack%0A-%20Min.%20Order:%20${encodeURIComponent(product.minOrder || '1 Pak')}%0A%0AMohon%20informasi%20stok.%20Terima%20kasih.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn-order-wa ${!activeVariant.inStock ? 'disabled-wa' : ''}`}
                      onClick={(e) => {
                        if (!activeVariant.inStock) {
                          e.preventDefault();
                          alert('Maaf, produk ukuran ini sedang kosong. Silakan pilih ukuran lainnya!');
                        }
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.005 5.319 5.324.001 11.873.001c3.178.001 6.165 1.24 8.409 3.486 2.245 2.246 3.481 5.235 3.479 8.414-.005 6.557-5.322 11.875-11.872 11.875-2.001-.001-3.968-.507-5.717-1.472L0 24zm6.59-4.846c1.6.95 3.6 1.488 5.275 1.489 5.428 0 9.845-4.417 9.849-9.847.002-2.63-1.023-5.101-2.887-6.966a9.78 9.78 0 0 0-6.96-2.88c-5.428 0-9.849 4.42-9.853 9.85-.002 1.902.497 3.758 1.446 5.4L2.238 21.725l4.409-1.157zm11.215-7.617c-.3-.149-1.786-.881-2.067-.983-.281-.102-.485-.152-.689.153-.204.304-.787.983-.965 1.186-.178.203-.356.229-.656.079-.3-.15-1.266-.466-2.41-1.487-.89-.793-1.49-1.773-1.665-2.072-.175-.3-.019-.462.13-.611.135-.134.3-.349.45-.524.15-.175.2-.299.3-.499.1-.2.05-.375-.025-.524-.075-.15-.689-1.658-.944-2.272-.249-.598-.5-.517-.689-.527-.178-.009-.383-.01-.588-.01s-.538.077-.82.385c-.282.309-1.077 1.053-1.077 2.569 0 1.516 1.102 2.985 1.253 3.19.15.204 2.169 3.312 5.253 4.643.734.316 1.307.505 1.753.647.737.234 1.407.201 1.937.122.59-.088 1.786-.73 2.037-1.434.25-.704.25-1.307.175-1.434-.075-.127-.281-.203-.582-.352z" />
                      </svg>
                      {activeVariant.inStock ? 'Pesan via WhatsApp' : 'Stok Habis'}
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-products">
              <h3>Produk Tidak Ditemukan di Kategori {activeCategory}</h3>
              <p>Belum ada produk yang terdaftar untuk kategori ini atau pencarian tidak cocok.</p>
              <button 
                type="button" 
                className="btn-back-all-cats" 
                style={{ marginTop: '1rem' }}
                onClick={() => { setActiveCategory('Semua'); setActiveSubCategory('Semua Tipe'); }}
              >
                Lihat Semua Produk
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. PROMO BANNER */}
      <section className="everything-needed-banner">
        <div className="needed-banner-bg"></div>
        <div className="needed-banner-content">
          <h3>Everything you need is here!</h3>
          <p>Butuh cetak sablon logo cup? Atau butuh penawaran khusus untuk kemasan restoran skala besar? Kami siap membantu.</p>
          <div className="needed-banner-actions">
            <button className="btn-needed-primary" onClick={() => window.open('https://wa.me/6282384442202', '_blank')}>Hubungi WA</button>
            <button className="btn-needed-secondary" onClick={() => { setActiveCategory('Semua'); setActiveSubCategory('Semua Tipe'); document.getElementById('catalog-products')?.scrollIntoView({ behavior: 'smooth' }); }}>Lihat Katalog</button>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="catalog-footer">
        <div className="footer-cols">
          <div className="footer-col-about">
            <h4>ALISAN PLASTIK</h4>
            <p>Partner terpercaya penyedia kemasan makanan dan minuman higienis, berkualitas tinggi, serta harga grosir bersahabat.</p>
            <div className="footer-contacts">
              <span>WA: +62 823-8444-2202</span>
              <span>Alamat: Toko Alisan Plastik, Indonesia</span>
            </div>
          </div>
          <div className="footer-col-links">
            <h5>Kemasan</h5>
            <ul>
              {categories.map((cat) => (
                <li key={cat} onClick={() => { setActiveCategory(cat); setActiveSubCategory('Semua Tipe'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  {cat}
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col-newsletter">
            <h5>Berlangganan Info Promo</h5>
            <p>Dapatkan update stok barang baru dan diskon khusus grosir langsung ke email Anda.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Terima kasih sudah berlangganan!'); }} className="newsletter-form">
              <input type="email" placeholder="Masukkan email Anda..." required className="newsletter-input" />
              <button type="submit" className="newsletter-btn">&rarr;</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ALISAN PLASTIK. All Rights Reserved. Designed for Professional Catalog.</p>
        </div>
      </footer>

    </div>
  );
}

export default CatalogView;