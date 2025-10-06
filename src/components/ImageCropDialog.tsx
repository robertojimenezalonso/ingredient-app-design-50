import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';

interface ImageCropDialogProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => void;
}

export const ImageCropDialog = ({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete
}: ImageCropDialogProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteCallback = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    const image = new Image();
    image.src = imageSrc;
    
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSetImage = async () => {
    console.log('=== handleSetImage CALLED ===');
    console.log('croppedAreaPixels:', croppedAreaPixels);
    
    try {
      const croppedBlob = await createCroppedImage();
      console.log('croppedBlob created:', croppedBlob);
      
      if (croppedBlob) {
        console.log('Calling onCropComplete with blob');
        onCropComplete(croppedBlob);
      } else {
        console.log('ERROR: No croppedBlob created');
      }
    } catch (error) {
      console.error('Error in handleSetImage:', error);
    }
  };

  console.log('ImageCropDialog render - isOpen:', isOpen, 'imageSrc:', !!imageSrc);
  
  if (!isOpen) return null;

  // Usar portal para renderizar fuera del árbol DOM del drawer
  return createPortal(
    <div 
      className="fixed inset-0 bg-background"
      style={{
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Crop area */}
      <div 
        className="relative w-full"
        style={{
          height: 'calc(100vh - 100px)',
          position: 'relative'
        }}
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteCallback}
          style={{
            containerStyle: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }
          }}
        />
      </div>

      {/* Bottom button */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-4 bg-background" 
        style={{
          paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 16px))',
          zIndex: 100000,
          position: 'fixed'
        }}
        onClick={(e) => {
          console.log('Button container clicked');
          e.stopPropagation();
        }}
      >
        <button
          onClick={(e) => {
            console.log('=== BUTTON CLICKED ===');
            e.preventDefault();
            e.stopPropagation();
            handleSetImage();
          }}
          onTouchStart={(e) => {
            console.log('=== BUTTON TOUCH START ===');
          }}
          type="button"
          className="w-full h-14 text-lg font-medium rounded-full"
          style={{
            backgroundColor: '#020817',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 100001,
            pointerEvents: 'auto',
            touchAction: 'manipulation'
          }}
        >
          Establecer
        </button>
      </div>
    </div>,
    document.body
  );
};
