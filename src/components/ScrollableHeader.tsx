import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { MealTypesCarousel } from '@/components/MealTypesCarousel';
import { DietsCarousel } from '@/components/DietsCarousel';

interface ScrollableHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  onProfileClick: () => void;
  selectedMealType: string | null;
  onMealTypeSelect: (mealType: string | null) => void;
  selectedDiet: string | null;
  onDietSelect: (diet: string | null) => void;
}

export const ScrollableHeader = ({
  searchValue,
  onSearchChange,
  onFilterClick,
  onProfileClick,
  selectedMealType,
  onMealTypeSelect,
  selectedDiet,
  onDietSelect
}: ScrollableHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-background transition-all duration-300 ${
      isScrolled ? 'shadow-sm' : ''
    }`}>
      <SearchBar
        value={searchValue}
        onChange={onSearchChange}
        onFilter={onFilterClick}
        onProfileClick={onProfileClick}
      />
      
      {!isScrolled && (
        <div className="animate-fade-in">
          <MealTypesCarousel
            selectedMealType={selectedMealType}
            onMealTypeSelect={onMealTypeSelect}
          />
          <DietsCarousel
            selectedDiet={selectedDiet}
            onDietSelect={onDietSelect}
          />
        </div>
      )}
    </div>
  );
};