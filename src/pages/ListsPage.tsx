import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

const ListsPage = () => {
  const navigate = useNavigate();
  const { cart } = useCart();

  // Calculate total days and servings from cart
  const totalDays = 0; // This could be calculated from your cart data
  const servingsPerRecipe = cart.length > 0 ? cart[0].servings : 1;
  const totalPrice = 64.76; // This should be calculated from actual ingredients

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
        <div>
          <h1 className="text-lg font-semibold">Mi lista de la compra</h1>
          <p className="text-sm text-muted-foreground">
            {totalDays} Días · {servingsPerRecipe} Raciones por receta
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 py-6">
        {/* Empty state - you can add your shopping list content here */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-muted-foreground">
            Tu lista de compra está vacía
          </p>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button 
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => {/* Navigate to ingredients */}}
        >
          <Search className="h-5 w-5 mr-2" />
          Ingredientes desde {totalPrice.toFixed(2)} €
        </Button>
      </div>
    </div>
  );
};

export default ListsPage;