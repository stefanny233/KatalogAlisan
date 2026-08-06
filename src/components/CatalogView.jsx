import { useState, useEffect } from 'react';

function CatalogView({ products, categories = [], activeCategory, setActiveCategory, searchQuery }) {
  const [activeSubCategory, setActiveSubCategory] = useState('Semua Tipe');
  const [selectedVariantMap, setSelectedVariantMap] = useState({});

  // Reset subkategori ketika kategori aktif berubah (mencegah bug "0 produk ditemukan")
  useEffect(() => {
    setActiveSubCategory('Semua Tipe');
  }, [activeCategory]);
  
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

  // State untuk Mobile Off-Canvas Drawer Filter
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const renderFallbackImage = (category, name) => {
    const catLower = (category || '').toLowerCase();
    let iconSvg = null;
    let categoryBadgeText = category || 'Kemasan';
    let gradientBg = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
    let iconColor = '#d5b58c';

    if (catLower.includes('eco') || catLower.includes('bio') || catLower.includes('paper lunch') || catLower.includes('daun')) {
      categoryBadgeText = '🌱 Eco-Friendly Bio';
      gradientBg = 'linear-gradient(135deg, #064e3b 0%, #047857 100%)';
      iconColor = '#6ee7b7';
      iconSvg = (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      );
    } else if (catLower.includes('gelas') || catLower.includes('cup') || catLower.includes('boba')) {
      categoryBadgeText = '🥤 Cup & Gelas Plastik';
      gradientBg = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
      iconColor = '#7dd3fc';
      iconSvg = (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      );
    } else if (catLower.includes('bowl') || catLower.includes('mangkuk')) {
      categoryBadgeText = '🥣 Paper Bowl';
      gradientBg = 'linear-gradient(135deg, #451a03 0%, #78350f 100%)';
      iconColor = '#fde047';
      iconSvg = (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12h20" />
          <path d="M20 12v4a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6v-4" />
          <path d="M12 2v6" />
          <path d="M8 3v3" />
          <path d="M16 3v3" />
        </svg>
      );
    } else if (catLower.includes('thinwall') || catLower.includes('box') || catLower.includes('kotak')) {
      categoryBadgeText = '📦 Thinwall Box';
      gradientBg = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)';
      iconColor = '#a5b4fc';
      iconSvg = (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      );
    } else {
      categoryBadgeText = category || 'ALISAN PLASTIK';
      gradientBg = 'linear-gradient(135deg, #0f172a 0%, #334155 100%)';
      iconColor = '#d5b58c';
      iconSvg = (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16.5 9.4 7.5 4.21" />
          <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
          <polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08" />
          <polygon points="12 12 21 6.92 12 1.84 3 6.92 12 12" />
        </svg>
      );
    }

    return (
      <div className="placeholder-image-rich" style={{ background: gradientBg }}>
        <span className="placeholder-cat-badge" style={{ color: iconColor }}>{categoryBadgeText}</span>
        <div className="placeholder-icon-wrap" style={{ color: iconColor }}>{iconSvg}</div>
        <div className="placeholder-text-title">{name}</div>
        <span className="placeholder-sub-note">Food Grade Premium</span>
      </div>
    );
  };

  // Filter produk
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'Semua' || 
      (product.category && product.category.trim().toLowerCase() === activeCategory.trim().toLowerCase());
    const matchesSubCategory = activeSubCategory === 'Semua Tipe' || 
      (product.subCategory && product.subCategory.trim().toLowerCase() === activeSubCategory.trim().toLowerCase());
    const matchesSearch = (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (product.subCategory && product.subCategory.toLowerCase().includes(searchQuery.toLowerCase()));
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

  // Helper membuat URL WhatsApp dengan template chat profesional & rapi
  const buildWhatsAppUrl = (product, variant) => {
    if (!product || !variant) return 'https://wa.me/6282384442202';
    
    const pricePack = `Rp ${formatRupiah(variant.price || 0)} / pack`;
    const priceRollStr = variant.priceRoll ? `\n• *Harga Roll*: Rp ${formatRupiah(variant.priceRoll)}` : '';
    const priceDusStr = variant.priceDus ? `\n• *Harga Dus/Bal*: Rp ${formatRupiah(variant.priceDus)}` : '';
    const specificProdName = variant.variantName ? `${product.name} (${variant.variantName})` : product.name;

    const text = `Halo Admin ALISAN PLASTIK! 👋
Saya berminat untuk memesan produk dari Katalog Web berikut:

📦 *DETAIL PESANAN:*
------------------------------------
• *Nama Produk*: ${specificProdName}
• *Kategori*: ${product.category} (${product.subCategory || 'Umum'})
• *Ukuran / Dimensi*: ${variant.size || 'Standar'}
• *Harga*: ${pricePack}${priceRollStr}${priceDusStr}
• *Min. Pemesanan*: ${product.minOrder || '1 Pak'}

📍 *LOKASI TOKO ALISAN PLASTIK:*
------------------------------------
🏢 *ALISAN PLASTIK*
📍 Alamat: Jln Moh.Yamin No 45
📞 Telp / WA: 0823-8444-2202

Mohon informasi ketersediaan stok & total pembayaran ya min. Terima kasih! 🙏`;

    return `https://wa.me/6282384442202?text=${encodeURIComponent(text)}`;
  };

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

                <h2 className="detail-product-title">
                  {detailActiveVariant?.variantName ? detailActiveVariant.variantName : detailProduct.name}
                </h2>
                {detailActiveVariant?.variantName && (
                  <span className="detail-parent-name-tag" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginTop: '-0.25rem', marginBottom: '0.5rem' }}>
                    Seri Produk: <strong>{detailProduct.name}</strong>
                  </span>
                )}

                {detailProduct.minOrder && (
                  <div className="detail-min-order">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    Isi / Minimal Pembelian: <strong>{detailProduct.minOrder}</strong>
                  </div>
                )}

                {/* HARGA MULTI-SATUAN UTAMA (DIPINDAHKAN KE ATAS DESKRIPSI) */}
                {detailActiveVariant && (
                  <div className="detail-price-box">
                    <span className="detail-price-label">
                      {detailActiveVariant.inStock ? 'Harga Satuan Utama' : 'Stok Sedang Kosong'}
                    </span>
                    <div className="detail-price-value">
                      <span className="detail-price-rp">Rp</span>
                      {formatRupiah(detailActiveVariant.price)}
                      <span className="detail-price-size"> / pack ({detailActiveVariant.size})</span>
                    </div>

                    {(detailActiveVariant.priceRoll || detailActiveVariant.priceDus) && (
                      <div className="detail-multi-pricing-row">
                        {detailActiveVariant.priceRoll && (
                          <div className="multi-price-badge">
                            <span className="mp-unit">Harga Roll:</span>
                            <span className="mp-val">Rp {formatRupiah(detailActiveVariant.priceRoll)}</span>
                          </div>
                        )}
                        {detailActiveVariant.priceDus && (
                          <div className="multi-price-badge">
                            <span className="mp-unit">Harga Dus / Bal:</span>
                            <span className="mp-val">Rp {formatRupiah(detailActiveVariant.priceDus)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* PILIH UKURAN & DIMENSI */}
                {detailProduct.variants && detailProduct.variants.length > 0 && (
                  <div className="detail-variants-section">
                    <h4 className="detail-variants-label">Pilihan Ukuran & Dimensi:</h4>
                    <div className="detail-variants-grid">
                      {detailProduct.variants.map((v, idx) => {
                        const isSelected = detailVariantIdx === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`detail-variant-btn ${isSelected ? 'active' : ''} ${!v.inStock ? 'out-of-stock' : ''}`}
                            onClick={() => handleSelectModalVariant(idx)}
                          >
                            <div className="dv-left-info">
                              <span className={`dv-radio-circle ${isSelected ? 'selected' : ''}`}>
                                {isSelected ? '✓' : ''}
                              </span>
                              <span className="dv-size">{v.size}</span>
                            </div>
                            <div className="dv-right-info">
                              {v.inStock ? (
                                <span className="dv-price">Rp {formatRupiah(v.price)} <small>/ pack</small></span>
                              ) : (
                                <span className="dv-empty">Stok Habis</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* DESKRIPSI & SPESIFIKASI DENGAN DUKUNGAN PARAGRAF & ENTER */}
                <div className="detail-description-container">
                  <h4 className="detail-desc-header-title">Deskripsi Lengkap Produk:</h4>
                  <div className="detail-description">{detailProduct.description || 'Tidak ada deskripsi khusus.'}</div>
                </div>

                {/* TOMBOL ORDER WA */}
                <a
                  href={buildWhatsAppUrl(detailProduct, detailActiveVariant)}
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

      {/* MOBILE SLIDE-OUT OFF-CANVAS DRAWER FILTER */}
      <div className={`mobile-drawer-overlay ${isMobileDrawerOpen ? 'open' : ''}`} onClick={() => setIsMobileDrawerOpen(false)}>
        <div className="mobile-drawer-card" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <div className="drawer-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filter & Kategori Produk
            </div>
            <button className="btn-close-drawer" onClick={() => setIsMobileDrawerOpen(false)}>&times;</button>
          </div>

          <div className="drawer-body">
            <div className="drawer-section-title">Kategori Utama</div>
            <div className="drawer-categories-list">
              {['Semua', ...categories].map((cat) => {
                const count = cat === 'Semua' ? products.length : products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <button
                    key={cat}
                    className={`drawer-cat-item ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => {
                      setActiveCategory(cat);
                      setActiveSubCategory('Semua Tipe');
                      setIsMobileDrawerOpen(false);
                    }}
                  >
                    <span>{cat}</span>
                    <span className="cat-count-badge">{count}</span>
                  </button>
                );
              })}
            </div>

            {getSubCategories().length > 1 && (
              <div className="drawer-subcats-group">
                <div className="drawer-section-title">Jenis / Sub-Kategori</div>
                <div className="drawer-subcats-pills">
                  {getSubCategories().map((subCat) => (
                    <button
                      key={subCat}
                      className={`drawer-subcat-pill ${activeSubCategory === subCat ? 'active' : ''}`}
                      onClick={() => {
                        setActiveSubCategory(subCat);
                        setIsMobileDrawerOpen(false);
                      }}
                    >
                      {subCat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN DASHBOARD LAYOUT (SIDEBAR KIRI & VIEWPORT KANAN ALA SCREENSHOT ACUAN) */}
      <div className="dashboard-app-layout">
        
        {/* SIDEBAR VERTIKAL KIRI (MINIMALIS & TANPA EMOJI) */}
        <aside className="app-vertical-sidebar">
          <div className="sidebar-section-label">Kategori Produk</div>

          <div className="sidebar-menu-list">
            {['Semua', ...categories].map((cat) => {
              const count = cat === 'Semua' ? products.length : products.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length;
              const isActive = activeCategory === cat;

              return (
                <div key={cat} className="sidebar-menu-group">
                  <button
                    type="button"
                    className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveCategory(cat);
                      setActiveSubCategory('Semua Tipe');
                    }}
                    title={cat}
                  >
                    <div className="menu-item-left">
                      <span className="menu-dot"></span>
                      <span className="menu-title">{cat === 'Semua' ? 'Semua Produk' : cat}</span>
                    </div>
                    <span className="menu-count">{count}</span>
                  </button>

                  {isActive && getSubCategories().length > 1 && (
                    <div className="sidebar-sub-accordion">
                      {getSubCategories().map((subCat) => (
                        <button
                          key={subCat}
                          type="button"
                          className={`sidebar-sub-link ${activeSubCategory === subCat ? 'active' : ''}`}
                          onClick={() => setActiveSubCategory(subCat)}
                        >
                          {subCat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* KONTEN UTAMA SEBELAH KANAN */}
        <main className="app-main-viewport">
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
                    <span className="banner-badge">ALISAN PLASTIK — DISTRIBUTOR & GROSIR KEMASAN F&B</span>
                    <h2 className="banner-title">Pusat Kemasan F&B, Plastik Premium & Eco-Bio Friendly</h2>
                    <p className="banner-subtitle">Pusat Kemasan F&B Terlengkap & Eco-Friendly — Solusi Cup Plastik, Thinwall Box, Paper Bowl & Kemasan Bio Ramah Lingkungan dengan Harga Grosir Pabrik Tangan Pertama.</p>
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
                  <div className="badge-text-wrap"><h4>Bahan Food Grade Premium</h4><p>Aman untuk makanan panas & dingin</p></div>
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
                  <span className="cat-meta-chip">Produk: {filteredProducts.length} Item</span>
                  <span className="cat-meta-chip">Food Grade Premium</span>
                  <span className="cat-meta-chip">Ready Stock</span>
                </div>
              </div>
            </section>
          )}

          {/* 4. PRODUCT GRID & SUBCATEGORY FILTER */}
          <section className="catalog-products-section" id="catalog-products">
            {/* BLOK NAVIGASI KATEGORI MOBILE SUPER MUDAH DIPAHAMI ORANG AWAM */}
            <div className="mobile-easy-category-bar">
              <div className="mobile-cat-pills-scroll">
                {['Semua', ...categories].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`mobile-cat-pill-btn ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => {
                      setActiveCategory(cat);
                      setActiveSubCategory('Semua Tipe');
                    }}
                  >
                    {cat === 'Semua' ? 'Semua' : cat}
                  </button>
                ))}
              </div>

              <div className="mobile-filter-trigger-row">
                <button 
                  type="button" 
                  className="mobile-all-categories-trigger"
                  onClick={() => setIsMobileDrawerOpen(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
                  <div className="m-text-wrap">
                    <strong>Kategori: {activeCategory}</strong>
                    <span>Klik untuk lihat semua kategori & filter &rarr;</span>
                  </div>
                </button>
                <span className="mobile-product-count">{filteredProducts.length} Produk</span>
              </div>
            </div>

            <div className="section-title-wrap">
              <h2 className="section-title">
                {activeCategory === 'Semua' ? 'Katalog Produk Terpilih' : `Daftar Produk ${activeCategory}`}
              </h2>
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
                        {photoCount} Foto
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
                      href={buildWhatsAppUrl(product, activeVariant)}
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

      {/* 5. PROMO & SABLON CUSTOM LOGO BANNER */}
      <section className="rich-bottom-highlights-section">
        <div className="sablon-promo-banner-card">
          <div className="sablon-card-overlay"></div>
          <div className="sablon-card-content">
            <span className="sablon-badge">JASA SABLON &amp; BRANDING KEMASAN</span>
            <h3 className="sablon-title">Cetak Sablon Logo Brand Anda di Cup Plastik &amp; Paper Bowl</h3>
            <p className="sablon-desc">
              Tingkatkan nilai profesionalitas usaha F&amp;B Anda! Kami melayani jasa cetak logo sablon presisi tinggi dengan pengerjaan cepat, tinta food grade, dan harga grosir langsung dari suplier utama.
            </p>
            <div className="sablon-actions">
              <button 
                type="button" 
                className="btn-sablon-wa"
                onClick={() => window.open('https://wa.me/6282384442202?text=Halo%20Admin%20Alisan%20Plastik,%20saya%20ingin%20konsultasi%20cetak%20sablon%20logo%20brand%20kemasan.', '_blank')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.005 5.319 5.324.001 11.873.001c3.178.001 6.165 1.24 8.409 3.486 2.245 2.246 3.481 5.235 3.479 8.414-.005 6.557-5.322 11.875-11.872 11.875-2.001-.001-3.968-.507-5.717-1.472L0 24zm6.59-4.846c1.6.95 3.6 1.488 5.275 1.489 5.428 0 9.845-4.417 9.849-9.847.002-2.63-1.023-5.101-2.887-6.966a9.78 9.78 0 0 0-6.96-2.88c-5.428 0-9.849 4.42-9.853 9.85-.002 1.902.497 3.758 1.446 5.4L2.238 21.725l4.409-1.157zm11.215-7.617c-.3-.149-1.786-.881-2.067-.983-.281-.102-.485-.152-.689.153-.204.304-.787.983-.965 1.186-.178.203-.356.229-.656.079-.3-.15-1.266-.466-2.41-1.487-.89-.793-1.49-1.773-1.665-2.072-.175-.3-.019-.462.13-.611.135-.134.3-.349.45-.524.15-.175.2-.299.3-.499.1-.2.05-.375-.025-.524-.075-.15-.689-1.658-.944-2.272-.249-.598-.5-.517-.689-.527-.178-.009-.383-.01-.588-.01s-.538.077-.82.385c-.282.309-1.077 1.053-1.077 2.569 0 1.516 1.102 2.985 1.253 3.19.15.204 2.169 3.312 5.253 4.643.734.316 1.307.505 1.753.647.737.234 1.407.201 1.937.122.59-.088 1.786-.73 2.037-1.434.25-.704.25-1.307.175-1.434-.075-.127-.281-.203-.582-.352z" />
                </svg>
                Konsultasi Sablon via WA
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER ORIGINAL LENGKAP */}
      <footer className="catalog-footer">
        <div className="footer-cols">
          <div className="footer-col-about">
            <h4>ALISAN PLASTIK</h4>
            <p>Partner terpercaya penyedia kemasan makanan dan minuman higienis, berkualitas tinggi, serta harga grosir bersahabat.</p>
            <div className="footer-contacts">
              <span>WA: +62 823-8444-2202</span>
              <span>Alamat: Jln. Moh. Yamin No 45, Pekanbaru, Riau</span>
            </div>
          </div>
          <div className="footer-col-links">
            <h5>Layanan Toko</h5>
            <ul>
              <li>Order WhatsApp Instan</li>
              <li>Sablon Logo Brand</li>
              <li>Grosir &amp; Partai Besar</li>
              <li>Kemasan Bio Eco-Friendly</li>
              <li>Pengiriman Siap Kirim</li>
            </ul>
          </div>
          <div className="footer-col-newsletter">
            <h5>Berlangganan Info Promo</h5>
            <p>Dapatkan update stok barang baru dan diskon khusus grosir langsung ke email Anda.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Terima kasih sudah berlangganan info promo!'); }} className="newsletter-form">
              <input type="email" placeholder="Masukkan email Anda..." required className="newsletter-input" />
              <button type="submit" className="newsletter-btn">&rarr;</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ALISAN PLASTIK. All Rights Reserved. Designed for Professional Catalog.</p>
        </div>
      </footer>
    </main>
  </div>
  </div>
  );
}

export default CatalogView;