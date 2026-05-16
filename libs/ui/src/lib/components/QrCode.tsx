import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QrCode({ value, size = 200, className = '' }: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, { width: size, margin: 1, color: { dark: '#111827', light: '#ffffff' } });
  }, [value, size]);

  return <canvas ref={canvasRef} className={className} />;
}
