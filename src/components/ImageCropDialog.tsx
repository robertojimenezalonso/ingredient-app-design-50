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
      className="fixed inset-0 bg-background flex flex-col"
      style={{
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        touchAction: 'none'
      }}
    >
      {/* Crop area */}
      <div 
        className="flex-1 relative"
        style={{
          position: 'relative',
          touchAction: 'none'
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

      {/* Bottom button - Separado para asegurar que capture eventos */}
      <div 
        className="flex-shrink-0 p-4 bg-background" 
        style={{
          paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 16px))',
          position: 'relative',
          zIndex: 100000,
          touchAction: 'auto',
          pointerEvents: 'auto'
        }}
      >
        <button
          onClick={(e) => {
            console.log('=== BUTTON CLICKED ===');
            e.preventDefault();
            e.stopPropagation();
            handleSetImage();
          }}
          onTouchEnd={(e) => {
            console.log('=== BUTTON TOUCH END ===');
            e.preventDefault();
            e.stopPropagation();
            handleSetImage();
          }}
          type="button"
          className="w-full h-14 text-lg font-medium rounded-full active:opacity-80"
          style={{
            backgroundColor: '#020817',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 100001,
            pointerEvents: 'auto',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          Establecer
        </button>
      </div>
    </div>,
    document.body
  );
};
