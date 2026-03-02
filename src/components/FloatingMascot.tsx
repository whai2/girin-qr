import { useState } from 'react';

const MASCOT_HIDDEN_KEY = 'wtl_mascot_hidden_until';
const HIDE_DURATION = 60 * 60 * 1000; // 1시간

function isMascotHidden(): boolean {
  const hiddenUntil = localStorage.getItem(MASCOT_HIDDEN_KEY);
  if (!hiddenUntil) return false;
  return Date.now() < Number(hiddenUntil);
}

export default function FloatingMascot() {
  const [visible, setVisible] = useState(!isMascotHidden());

  if (!visible) return null;

  const handleClose = () => {
    localStorage.setItem(MASCOT_HIDDEN_KEY, String(Date.now() + HIDE_DURATION));
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
      <button
        onClick={handleClose}
        className="mb-1 hover:opacity-70 transition-opacity"
      >
        <img src="/wtl-close-button.png" alt="닫기" className="h-6 w-6" />
      </button>
      <img
        src="/wtl-mascot.png"
        alt="기린 마스코트"
        className="h-60 md:h-72"
      />
    </div>
  );
}
