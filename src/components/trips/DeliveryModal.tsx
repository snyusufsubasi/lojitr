import React, { useRef, useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MapPin, PenTool, Check, RotateCcw } from 'lucide-react';

export interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    receiverName: string;
    signatureSvg?: string;
    deliveryCoord?: string;
    deliveryNote?: string;
  }) => Promise<void>;
  tripOrigin: string;
  tripDestination: string;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tripOrigin,
  tripDestination,
}) => {
  const [receiverName, setReceiverName] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [coords, setCoords] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Request GPS coordinate on open
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        },
        () => {
          setCoords('39.925533, 32.866287'); // Fallback default
        }
      );
    }
  }, [isOpen]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#312e81';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName.trim()) return;

    setLoading(true);
    try {
      let signatureSvg = undefined;
      const canvas = canvasRef.current;
      if (canvas && hasSignature) {
        signatureSvg = canvas.toDataURL('image/png');
      }

      await onConfirm({
        receiverName,
        signatureSvg,
        deliveryCoord: coords,
        deliveryNote,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Teslimatı Kapat & e-İmza Al"
      description={`${tripOrigin} → ${tripDestination} seferini tamamlayın.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Teslim Alan Yetkili / Şoför Adı Soyadı *"
          value={receiverName}
          onChange={(e) => setReceiverName(e.target.value)}
          placeholder="Örn: Selim Çelik (Depo Şefi)"
          required
        />

        {/* GPS location pill */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Teslimat Konumu: <strong className="font-mono text-slate-700 dark:text-slate-300">{coords || 'Alınıyor...'}</strong></span>
        </div>

        {/* Signature Pad */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-brand-500" />
              Alıcı Dijital İmzası (Dokunmatik)
            </label>
            <button
              type="button"
              onClick={clearSignature}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Temizle
            </button>
          </div>
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={140}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              className="w-full h-36 cursor-crosshair touch-none"
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 dark:text-slate-700 text-xs font-medium">
                Parmağınızla veya fareyle buraya imza atın
              </div>
            )}
          </div>
        </div>

        <Input
          label="Teslimat Notu / Hasarsızlık Beyanı"
          value={deliveryNote}
          onChange={(e) => setDeliveryNote(e.target.value)}
          placeholder="Eksiksiz ve hasarsız teslim alındı."
        />

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button type="submit" variant="success" loading={loading} disabled={!receiverName.trim()}>
            <Check className="w-4 h-4" />
            Teslimatı Onayla
          </Button>
        </div>
      </form>
    </Modal>
  );
};
