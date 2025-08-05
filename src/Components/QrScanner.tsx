import { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";

interface QRScannerProps {
    open: boolean;
    onResult: (data: string) => void;
    onError?: (err: any) => void;
    onClose: () => void;
}

export default function QRScanner({
    open,
    onResult,
    onError,
    onClose
}: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const scannerRef = useRef<QrScanner | null>(null);

    useEffect(() => {
        if (open && videoRef.current) {
            scannerRef.current = new QrScanner(
                videoRef.current,
                async (result) => {
                    if (result.data) {
                        console.log('data from qr is ',result.data)
                        onResult(result.data);
                        scannerRef.current?.stop();
                        scannerRef.current?.destroy();
                        scannerRef.current = null;
                    }
                },
                { returnDetailedScanResult: true }
            );

            scannerRef.current.start().catch((err) => {
                onError?.(err);
            });
        }

        return () => {
            scannerRef.current?.stop();
            scannerRef.current?.destroy();
            scannerRef.current = null;
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="videoOverlay">
            <div className="videoRef">
                <video width="100%" ref={videoRef}></video>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}
