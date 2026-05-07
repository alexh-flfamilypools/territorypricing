import { useState } from 'react';
import { Lock } from 'lucide-react';

const EDITOR_PIN = import.meta.env.VITE_EDITOR_PIN;

export default function PinPrompt({ onSuccess, onClose }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (pin === EDITOR_PIN) {
      onSuccess();
    } else {
      setError('Incorrect PIN — try again.');
      setPin('');
    }
  }

  return (
    <div className="fp-pin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fp-pin-card">
        <div className="fp-pin-icon"><Lock /></div>
        <div className="fp-pin-title">Editor access</div>
        <div className="fp-pin-body">Enter the PIN to unlock editing.</div>
        <input
          className="fp-key-input fp-pin-input"
          type="password"
          inputMode="numeric"
          placeholder="••••"
          value={pin}
          onChange={e => { setPin(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          autoFocus
        />
        {error && <div className="fp-pin-error">{error}</div>}
        <div className="fp-pin-actions">
          <button className="fp-btn fp-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="fp-btn fp-btn-primary" onClick={submit} disabled={!pin}>Unlock</button>
        </div>
      </div>
    </div>
  );
}
