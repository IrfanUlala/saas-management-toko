'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Barcode, RefreshCw, X } from 'lucide-react';
import { Button } from './ui/button';

interface CameraBarcodeInterface {
  onChange: (value: string) => void;
}

type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};
type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;
type BarcodeWindow = Window & { BarcodeDetector?: BarcodeDetectorConstructor };

const FORMATS = ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'itf', 'codabar'];

/**
 * Ambil BarcodeDetector: pakai API native kalau ada,
 * kalau tidak fallback ke polyfill `barcode-detector`.
 */
async function resolveDetector(): Promise<BarcodeDetectorConstructor | null> {
  const Native = (window as BarcodeWindow).BarcodeDetector;
  if (Native) return Native;
  try {
    const { BarcodeDetector } = await import('barcode-detector/ponyfill');
    return BarcodeDetector as unknown as BarcodeDetectorConstructor;
  } catch {
    return null;
  }
}

export default function CameraBarcode({ onChange }: CameraBarcodeInterface) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    let frameId = 0;
    let detector: BarcodeDetectorInstance | null = null;

    const stopStream = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const scan = async () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (!detector || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        frameId = requestAnimationFrame(scan);
        return;
      }
      try {
        const results = await detector.detect(video);
        const value = results[0]?.rawValue;
        if (value) {
          console.log('Hasil scan barcode:', value);
          onChangeRef.current(value);
          setIsOpen(false);
          return;
        }
      } catch {
        // frame belum stabil, abaikan
      }
      if (!cancelled) frameId = requestAnimationFrame(scan);
    };

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Akses kamera butuh koneksi aman (HTTPS) dan browser yang mendukung.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();
        if (cancelled) return;

        setIsCameraReady(true);

        // Selesaikan detector SETELAH kamera aktif, biar izin kamera tidak tertunda.
        const Detector = await resolveDetector();
        if (!Detector) {
          setError('Pemindaian otomatis tidak tersedia. Masukkan kode secara manual.');
          return;
        }

        detector = new Detector({ formats: FORMATS });
        frameId = requestAnimationFrame(scan);
      } catch (err) {
        const name = (err as DOMException)?.name;
        if (name === 'NotAllowedError' || name === 'SecurityError') {
          setError('Izin kamera ditolak. Aktifkan izin kamera di browser lalu tekan "Coba lagi".');
        } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
          setError('Kamera tidak ditemukan pada perangkat ini.');
        } else {
          setError('Kamera tidak dapat dibuka. Pastikan tidak sedang dipakai aplikasi lain, lalu coba lagi.');
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      stopStream();
      setIsCameraReady(false);
    };
  }, [isOpen, retryKey]);

  const closeCamera = useCallback(() => {
    setIsOpen(false);
    setIsCameraReady(false);
    setError('');
  }, []);

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          setError('');
          setIsOpen(true);
        }}
        aria-label="Buka pemindai barcode"
      >
        <Barcode size={22} aria-hidden="true" />
      </Button>

      {isOpen && (
        <div className="fixed inset-x-0 top-0 z-50" role="region" aria-label="Pemindai barcode">
          <div className="relative w-full overflow-hidden bg-black">
            {/* Tinggi video diperkecil: 128px di mobile, 160px di layar lebih besar */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-32 w-full object-cover sm:h-40"
            />

            {isCameraReady ? (
              <>
                <div className="pointer-events-none absolute inset-x-10 top-1/2 h-12 -translate-y-1/2 rounded-lg border-2 border-emerald-400/90" />
                <p className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-[11px] font-medium text-white drop-shadow">
                  Arahkan kamera ke barcode
                </p>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black px-6 text-center">
                <p className="text-sm text-white/90">{error || 'Menyalakan kamera…'}</p>
                {error && (
                  <Button
                    type="button"
                    onClick={() => setRetryKey((key) => key + 1)}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-200"
                  >
                    <RefreshCw size={16} aria-hidden="true" />
                    Coba lagi
                  </Button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={closeCamera}
              aria-label="Tutup kamera"
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
            >
              <X size={18} />
            </button>
          </div>

          {error && isCameraReady && (
            <p role="status" className="bg-amber-500 px-4 py-1.5 text-center text-xs font-medium text-white">
              {error}
            </p>
          )}
        </div>
      )}
    </>
  );
}