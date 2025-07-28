import { cn } from '@/lib/utils';

interface RecipeSkeletonProps {
  className?: string;
}

export const RecipeSkeleton = ({ className }: RecipeSkeletonProps) => {
  return (
    <div className={cn("min-h-screen bg-background pb-24 animate-fade-in", className)}>
      {/* Header skeleton */}
      <div className="relative">
        <div className="w-full h-64 bg-muted animate-pulse" />
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* Title skeleton */}
        <div className="mb-4">
          <div className="h-8 bg-muted rounded-lg mb-2 animate-pulse" />
          <div className="h-6 bg-muted rounded-lg w-3/4 animate-pulse" />
        </div>

        {/* Servings and stats skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-6">
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="w-full h-2 bg-muted/50" />

      {/* Tabs skeleton */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="h-10 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
          
          {/* Ingredients skeleton */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </div>
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2">
        <div className="bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Cargando receta...</span>
        </div>
      </div>
    </div>
  );
};