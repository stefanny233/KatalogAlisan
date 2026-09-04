import { useState, useEffect } from 'react';

function PasscodeModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  
  // Kata sandi PIN admin
  const CORRECT_PIN = 'alisanadmin'; 

  useEffect(() => {
    let timer;
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;

    if (pin.trim().toLowerCase() === CORRECT_PIN.toLowerCase()) {
      setError('');
      setPin('');
      setWrongAttempts(0);
      setCooldownSeconds(0);
      onSuccess(); // Panggil fungsi sukses jika PIN benar
    } else {
      const nextAttempts = wrongAttempts + 1;
      setWrongAttempts(nextAttempts);
      setPin('');

      if (nextAttempts % 3 === 0) {
        setCooldownSeconds(5);
        setError('⚠️ Terlalu banyak percobaan salah! Silakan tunggu 5 detik.');
      } else {
        const remaining = 3 - (nextAttempts % 3);
        setError(`PIN Admin salah! Silakan coba lagi (${remaining}x percobaan tersisa).`);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Akses Khusus Admin</h3>
          <button className="modal-close-btn" onClick={onClose} disabled={cooldownSeconds > 0}>&times;</button>
        </div>
        <p className="modal-text">Masukkan PIN keamanan Anda untuk membuka halaman kelola barang.</p>
        
        {cooldownSeconds > 0 ? (
          <div className="modal-error-alert" style={{ backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>
            ⏳ Terlalu banyak percobaan salah. Silakan tunggu <strong>{cooldownSeconds} detik</strong> sebelum mencoba lagi.
          </div>
        ) : (
          error && <div className="modal-error-alert">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <input 
              type="password" 
              placeholder={cooldownSeconds > 0 ? `Tunggu ${cooldownSeconds} detik...` : "Masukkan PIN Admin..."} 
              className="form-input text-center"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              disabled={cooldownSeconds > 0}
              autoFocus
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={cooldownSeconds > 0}>Batal</button>
            <button type="submit" className="btn-submit-pin" disabled={cooldownSeconds > 0}>
              {cooldownSeconds > 0 ? `Tunggu (${cooldownSeconds}s)` : 'Buka Kunci'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasscodeModal;