import { Search, SlidersHorizontal, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilter?: () => void;
  onProfileClick?: () => void;
}

export const SearchBar = ({ value, onChange, onFilter, onProfileClick }: SearchBarProps) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-background border-b">
      <Button
        variant="ghost"
        size="icon"
        onClick={onProfileClick}
        className="rounded-xl"
      >
        <User className="h-5 w-5" />
      </Button>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar recetas..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 rounded-xl border-0 bg-muted/50"
        />
      </div>
      {onFilter && (
        <Button
          variant="outline" 
          size="icon"
          onClick={onFilter}
          className="rounded-xl border-0 bg-muted/50"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};