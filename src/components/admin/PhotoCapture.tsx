import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, ImagePlus, X, RotateCcw, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

export interface CapturedPhoto {
    id: string;
    dataUrl: string;
    source: 'camera' | 'gallery';
    label: string;
}

interface PhotoCaptureProps {
    photos: CapturedPhoto[];
    onChange: (photos: CapturedPhoto[]) => void;
    maxPhotos?: number;
}

type CameraState = 'idle' | 'opening' | 'active' | 'error';

const PHOTO_LABELS = [
    'Front View',
    'Back View',
    'Top View',
    'Bottom View',
    'Left Side',
    'Right Side',
    'Damage Area',
    'Serial Number',
    'Other',
];

export default function PhotoCapture({ photos, onChange, maxPhotos = 8 }: PhotoCaptureProps) {
    const [cameraState, setCameraState] = useState<CameraState>('idle');
    const [cameraError, setCameraError] = useState('');
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [selectedLabel, setSelectedLabel] = useState(PHOTO_LABELS[0]);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cleanup stream on unmount
    useEffect(() => {
        return () => stopCamera();
    }, []);

    // Attach stream to video element AFTER React mounts it
    useEffect(() => {
        if (cameraState === 'active' && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => { });
        }
    }, [cameraState]);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraState('idle');
    };

    const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
        setCameraState('opening');
        setCameraError('');
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facing,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: false,
            });
            streamRef.current = stream;
            // Set state first so React mounts <video>; srcObject is attached in useEffect
            setCameraState('active');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Camera unavailable';
            setCameraError(msg.includes('NotAllowed') ? 'Camera permission denied. Please allow camera access.' : 'Could not open camera. Try uploading a photo instead.');
            setCameraState('error');
        }
    };

    const flipCamera = async () => {
        const next = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(next);
        await startCamera(next);
    };

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsCapturing(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // Mirror for selfie cam
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const newPhoto: CapturedPhoto = {
            id: `photo-${Date.now()}`,
            dataUrl,
            source: 'camera',
            label: selectedLabel,
        };
        onChange([...photos, newPhoto]);

        // Flash effect
        setTimeout(() => setIsCapturing(false), 300);

        // Auto-advance label
        const currentIdx = PHOTO_LABELS.indexOf(selectedLabel);
        if (currentIdx < PHOTO_LABELS.length - 1) {
            setSelectedLabel(PHOTO_LABELS[currentIdx + 1]);
        }
    }, [facingMode, photos, onChange, selectedLabel]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const remaining = maxPhotos - photos.length;
        const filesToProcess = files.slice(0, remaining);
        let currentLabel = selectedLabel;

        const newPhotos: CapturedPhoto[] = [];
        let loaded = 0;

        filesToProcess.forEach((file, i) => {
            const label = currentLabel;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;
                newPhotos.push({
                    id: `photo-${Date.now()}-${i}`,
                    dataUrl,
                    source: 'gallery',
                    label,
                });
                loaded++;
                if (loaded === filesToProcess.length) {
                    onChange([...photos, ...newPhotos]);
                }
            };
            reader.readAsDataURL(file);
            const labelIdx = PHOTO_LABELS.indexOf(currentLabel);
            if (labelIdx < PHOTO_LABELS.length - 1) {
                currentLabel = PHOTO_LABELS[labelIdx + 1];
            }
        });
        e.target.value = '';
    };


    const removePhoto = (id: string) => {
        onChange(photos.filter(p => p.id !== id));
        if (lightboxIndex !== null) setLightboxIndex(null);
    };

    const updateLabel = (id: string, label: string) => {
        onChange(photos.map(p => p.id === id ? { ...p, label } : p));
    };

    const canAddMore = photos.length < maxPhotos;

    return (
        <div className="space-y-4">
            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                capture={undefined}
                className="hidden"
                onChange={handleFileUpload}
            />

            {/* Camera Viewfinder */}
            {cameraState === 'active' && (
                <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl">
                    {/* Flash overlay */}
                    <div className={`absolute inset-0 bg-white z-20 pointer-events-none transition-opacity duration-200 ${isCapturing ? 'opacity-80' : 'opacity-0'}`} />

                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full min-h-[240px] max-h-[60vh] object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />

                    {/* Overlay controls */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                        {/* Top bar */}
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={stopCamera}
                                className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Label selector */}
                            <select
                                value={selectedLabel}
                                onChange={e => setSelectedLabel(e.target.value)}
                                className="bg-black/50 text-white text-xs rounded-full px-3 py-1.5 backdrop-blur-sm border border-white/20 focus:outline-none"
                            >
                                {PHOTO_LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>

                            <button
                                type="button"
                                onClick={flipCamera}
                                className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
                            >
                                <RotateCcw className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Bottom bar */}
                        <div className="flex items-center justify-between">
                            {/* Thumbnail strip */}
                            <div className="flex gap-2">
                                {photos.slice(-2).map(p => (
                                    <img key={p.id} src={p.dataUrl} className="h-12 w-12 rounded-lg object-cover border-2 border-white/50" />
                                ))}
                            </div>

                            {/* Shutter button */}
                            <button
                                type="button"
                                onClick={capturePhoto}
                                disabled={!canAddMore}
                                className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm disabled:opacity-40 active:scale-95 transition-transform"
                                aria-label="Take photo"
                            >
                                <div className="w-12 h-12 rounded-full bg-white" />
                            </button>

                            <div className="text-white/60 text-xs text-right">
                                {photos.length}/{maxPhotos}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Camera opening / error state */}
            {cameraState === 'opening' && (
                <div className="flex flex-col items-center justify-center h-48 bg-gray-900 rounded-2xl gap-3">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/70 text-sm">Starting camera…</p>
                </div>
            )}

            {cameraState === 'error' && (
                <div className="flex flex-col items-center justify-center gap-3 p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
                    <Camera className="h-8 w-8 text-red-400" />
                    <p className="text-sm text-red-700">{cameraError}</p>
                    <button type="button" onClick={() => setCameraState('idle')} className="text-xs text-red-600 underline">Dismiss</button>
                </div>
            )}

            {/* Action buttons (shown when camera is idle/error) */}
            {cameraState !== 'active' && cameraState !== 'opening' && (
                <div className={`grid gap-3 ${canAddMore ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {canAddMore && (
                        <button
                            type="button"
                            onClick={() => startCamera()}
                            className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100 active:scale-95 transition-all"
                        >
                            <Camera className="h-7 w-7" />
                            <span className="text-sm font-medium">Open Camera</span>
                        </button>
                    )}
                    {canAddMore && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                        >
                            <ImagePlus className="h-7 w-7" />
                            <span className="text-sm font-medium">Upload from Gallery</span>
                        </button>
                    )}
                    {!canAddMore && (
                        <div className="text-center text-sm text-gray-500 py-3">
                            Maximum {maxPhotos} photos reached. Remove a photo to add more.
                        </div>
                    )}
                </div>
            )}

            {/* Photo grid */}
            {photos.length > 0 && (
                <div>
                    <p className="text-xs text-gray-500 mb-2">{photos.length} photo{photos.length > 1 ? 's' : ''} added. Tap to view or relabel.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {photos.map((photo, idx) => (
                            <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square">
                                <img
                                    src={photo.dataUrl}
                                    alt={photo.label}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => setLightboxIndex(idx)}
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                                {/* Label at bottom */}
                                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
                                    <select
                                        value={photo.label}
                                        onClick={e => e.stopPropagation()}
                                        onChange={e => updateLabel(photo.id, e.target.value)}
                                        className="w-full text-xs bg-transparent text-white border-0 focus:outline-none cursor-pointer"
                                    >
                                        {PHOTO_LABELS.map(l => <option key={l} value={l} className="text-gray-900 bg-white">{l}</option>)}
                                    </select>
                                </div>

                                {/* Source badge */}
                                <div className="absolute top-1.5 left-1.5">
                                    <span className="text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                        {photo.source === 'camera' ? '📷' : '🖼️'}
                                    </span>
                                </div>

                                {/* Delete button */}
                                <button
                                    type="button"
                                    onClick={() => removePhoto(photo.id)}
                                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-md"
                                    aria-label="Remove photo"
                                >
                                    <X className="h-3 w-3" />
                                </button>

                                {/* Expand icon on hover */}
                                <button
                                    type="button"
                                    onClick={() => setLightboxIndex(idx)}
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="View photo"
                                >
                                    <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && photos[lightboxIndex] && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex flex-col"
                    onClick={() => setLightboxIndex(null)}
                >
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-4 py-3 text-white">
                        <span className="text-sm font-medium">{photos[lightboxIndex].label}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-white/50">{lightboxIndex + 1}/{photos.length}</span>
                            <button
                                type="button"
                                onClick={e => { e.stopPropagation(); removePhoto(photos[lightboxIndex].id); }}
                                className="text-red-400 hover:text-red-300 text-sm font-medium"
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                onClick={() => setLightboxIndex(null)}
                                className="bg-white/10 p-2 rounded-full"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="flex-1 flex items-center justify-center px-4" onClick={e => e.stopPropagation()}>
                        <img
                            src={photos[lightboxIndex].dataUrl}
                            alt={photos[lightboxIndex].label}
                            className="max-h-full max-w-full object-contain rounded-lg"
                        />
                    </div>

                    {/* Nav arrows */}
                    {lightboxIndex > 0 && (
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full backdrop-blur-sm"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    )}
                    {lightboxIndex < photos.length - 1 && (
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full backdrop-blur-sm"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    )}

                    {/* Bottom strip */}
                    {photos.length > 1 && (
                        <div className="flex gap-2 px-4 pb-4 pt-2 overflow-x-auto" onClick={e => e.stopPropagation()}>
                            {photos.map((p, i) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setLightboxIndex(i)}
                                    className={`flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition-all ${i === lightboxIndex ? 'border-white' : 'border-transparent opacity-50'}`}
                                >
                                    <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
