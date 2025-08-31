import { Plus } from 'lucide-react';

interface RecipeGridCardProps {
  id: string;
  title: string;
  image: string;
  price: string;
  onAdd: (id: string) => void;
}

export const RecipeGridCard = ({ id, title, image, price, onAdd }: RecipeGridCardProps) => {
  const truncateTitle = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="relative aspect-square">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400';
          }}
        />
        <button 
          onClick={() => onAdd(id)}
          className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="h-4 w-4 text-foreground" />
        </button>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm leading-tight text-foreground line-clamp-2 mb-2">
          {truncateTitle(title)}
        </h3>
        <p className="text-sm font-semibold text-foreground">
          {price}
        </p>
      </div>
    </div>
  );
};