import { useState } from 'react';

function PasscodeModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  
  // Kamu bisa mengubah kata sandi PIN admin di bawah ini:
  const CORRECT_PIN = 'alisanadmin'; 

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setError('');
      setPin('');
      onSuccess(); // Panggil fungsi sukses jika PIN benar
    } else {
      setError('PIN Admin salah! Silakan coba lagi.');
      setPin('');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Akses Khusus Admin</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <p className="modal-text">Masukkan PIN keamanan Anda untuk membuka halaman kelola barang.</p>
        
        {error && <div className="modal-error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <input 
              type="password" 
              placeholder="Masukkan PIN Admin..." 
              className="form-input text-center"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-submit-pin">Buka Kunci</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasscodeModal;