import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

interface AvatarOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseFromGallery: () => void;
  onDelete?: () => void;
  hasAvatar: boolean;
}

export const AvatarOptionsSheet = ({
  isOpen,
  onClose,
  onTakePhoto,
  onChooseFromGallery,
  onDelete,
  hasAvatar
}: AvatarOptionsSheetProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="pb-safe">
        <div className="flex flex-col w-full">
          {/* Camera option */}
          <button
            onClick={() => {
              onTakePhoto();
              onClose();
            }}
            className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <span className="text-base font-medium">Hacer una foto</span>
          </button>

          {/* Gallery option */}
          <button
            onClick={() => {
              onChooseFromGallery();
              onClose();
            }}
            className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-base font-medium text-blue-500">Elegir de la galería</span>
          </button>

          {/* Delete option - only show if avatar exists */}
          {hasAvatar && onDelete && (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-base font-medium text-red-500">Eliminar</span>
            </button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
