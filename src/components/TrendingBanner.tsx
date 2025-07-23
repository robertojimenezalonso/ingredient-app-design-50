import { Card } from '@/components/ui/card';

interface TrendingOption {
  id: string;
  title: string;
  image: string;
}

const trendingOptions: TrendingOption[] = [
  {
    id: 'pre-workout',
    title: 'Pre-workout',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'
  },
  {
    id: 'post-workout',
    title: 'Post-workout',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  },
  {
    id: 'healthy',
    title: 'Saludable',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'
  }
];

export const TrendingBanner = () => {
  return (
    <div className="mb-6">
      <div className="px-4">
        <h2 className="text-lg font-semibold pt-6">Lo que está de moda</h2>
      </div>
      
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
        {trendingOptions.map(option => (
          <Card 
            key={option.id}
            className="w-60 flex-shrink-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <img 
                src={option.image} 
                alt={option.title}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-end">
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg">
                    {option.title}
                  </h3>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};