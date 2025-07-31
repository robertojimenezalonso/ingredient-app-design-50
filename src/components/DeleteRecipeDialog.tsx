import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/RecipeCard';
import { Recipe } from '@/types/recipe';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DeleteRecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipe: Recipe | null;
  dateStr: string;
  mealType: string;
}

export const DeleteRecipeDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  recipe, 
  dateStr, 
  mealType 
}: DeleteRecipeDialogProps) => {
  if (!recipe) return null;

  const date = new Date(dateStr + 'T12:00:00');
  const formattedDate = format(date, "EEEE d 'de' MMMM", { locale: es });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-4 max-w-sm">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-neutral-950">
              Eliminar de mi plan
            </h2>
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que quieres eliminar este {mealType.toLowerCase()} de tu plan para el día {formattedDate}?
            </p>
          </div>

          {/* Recipe card preview (non-clickable) */}
          <div className="pointer-events-none opacity-80">
            <RecipeCard
              recipe={recipe}
              onAdd={() => {}}
              onClick={() => {}}
              mealType={mealType}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};