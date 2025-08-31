import { useNavigate } from 'react-router-dom';

interface Supermarket {
  id: string;
  name: string;
  logo: string;
}

const supermarkets: Supermarket[] = [
  {
    id: 'carrefour',
    name: 'Carrefour',
    logo: '/lovable-uploads/190fc1f3-4981-4c81-baa7-bef57932b8e5.png'
  },
  {
    id: 'mercadona',
    name: 'Mercadona',
    logo: '/lovable-uploads/1a119c40-7aac-4ada-b1c9-1a0c5f3492fd.png'
  },
  {
    id: 'dia',
    name: 'DIA',
    logo: '/lovable-uploads/26934026-f2f8-4901-a7ba-e4e0c8ac36e1.png'
  },
  {
    id: 'lidl',
    name: 'Lidl',
    logo: '/lovable-uploads/2f62f477-2662-4cc5-adcc-6ddfaa085c50.png'
  },
  {
    id: 'aldi',
    name: 'Aldi',
    logo: '/lovable-uploads/4d196b4e-7430-45d5-9ea8-3c41447ec14c.png'
  },
  {
    id: 'hipercor',
    name: 'Hipercor',
    logo: '/lovable-uploads/62545d3b-2a8b-4a13-a64c-d485492f24c1.png'
  },
  {
    id: 'alcampo',
    name: 'Alcampo',
    logo: '/lovable-uploads/71eecaf2-ff51-47ff-beef-72570cb4f960.png'
  },
  {
    id: 'eroski',
    name: 'Eroski',
    logo: '/lovable-uploads/7825fcc8-c2a8-4678-9edd-23e6a72bf209.png'
  }
];

const SupermarketSelectionPage = () => {
  const navigate = useNavigate();

  const handleSupermarketSelect = (supermarket: Supermarket) => {
    // Navigate to welcome page with supermarket info
    navigate(`/welcome?supermarket=${encodeURIComponent(supermarket.name)}`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 text-foreground">
          Supermercados populares
        </h1>
        
        <div className="grid grid-cols-4 gap-4">
          {supermarkets.map((supermarket) => (
            <button
              key={supermarket.id}
              onClick={() => handleSupermarketSelect(supermarket)}
              className="flex flex-col items-center p-4 bg-card rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="w-12 h-12 mb-2 flex items-center justify-center">
                <img
                  src={supermarket.logo}
                  alt={supermarket.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <span className="text-xs text-center font-medium">
                {supermarket.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupermarketSelectionPage;