import React from 'react';

function Sidebar({ currentView, onViewChange, isAdmin, onLockAdmin, onUnlockAdminClick }) {
  return (
    <aside className="sidebar">
      <div className="logo-section">
        <span className="logo-title">ALISAN</span>
        <span className="logo-subtitle">PLASTIK</span>
        <div className="logo-line"></div>
      </div>

      <nav className="nav-menu">
        <button 
          className={`nav-item ${currentView === 'catalog' ? 'active' : ''}`}
          onClick={() => onViewChange('catalog')}
        >
          {/* Icon Grid Katalog */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
          Katalog Produk
        </button>
      </nav>

      <div className="sidebar-footer">
        {isAdmin ? (
          <div className="admin-status-area">
            <button 
              className={`admin-nav-item ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => onViewChange('admin')}
            >
              {/* Icon Pencil Admin */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Kelola Barang
            </button>
            <button className="btn-lock" onClick={onLockAdmin} title="Keluar dari sesi Admin">
              {/* Icon Lock */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Kunci Panel Admin
            </button>
          </div>
        ) : (
          <button 
            className="admin-nav-item locked"
            onClick={onUnlockAdminClick}
          >
            {/* Icon Gembok Terkunci */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
            Admin Panel (Terkunci)
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;