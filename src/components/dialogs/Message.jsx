import { useEffect, useState } from "react";

function Message({ text, duration = 1500, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (!visible && onClose) {
      onClose();
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-background rounded-lg border-border border-3 popup-fade max-w-full max-h-full overflow-auto p-5">
            {text}
        </div>
    </div>
  );
}

export default Message;