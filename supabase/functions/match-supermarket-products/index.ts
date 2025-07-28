import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface SupermarketProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  originalIngredient: string;
  matchScore: number;
}

// Mapping de ingredientes comunes a términos de búsqueda en supermercados
const ingredientMapping: Record<string, string[]> = {
  // Carnes y proteínas
  'pechuga de pollo': ['pollo', 'pechuga', 'chicken'],
  'pollo': ['pollo', 'chicken', 'pechuga'],
  'carne': ['carne', 'ternera', 'beef'],
  'pescado': ['pescado', 'fish', 'merluza', 'salmón'],
  'salmón': ['salmón', 'salmon'],
  
  // Lácteos
  'leche': ['leche', 'milk'],
  'leche descremada': ['leche desnatada', 'leche 0%', 'leche sin grasa'],
  'queso feta': ['queso feta', 'feta', 'queso griego'],
  'queso': ['queso', 'cheese'],
  'yogur': ['yogur', 'yogurt'],
  
  // Cereales y granos
  'avena': ['avena', 'oats', 'cereales'],
  'avena rápida': ['avena', 'copos de avena'],
  'quinoa': ['quinoa', 'grano quinoa'],
  'arroz': ['arroz', 'rice'],
  
  // Frutas
  'manzana': ['manzana', 'apple'],
  'manzana roja': ['manzana roja', 'manzana royal gala'],
  'tomate': ['tomate', 'tomato'],
  'tomate cherry': ['tomate cherry', 'tomates cherry'],
  'aguacate': ['aguacate', 'avocado'],
  
  // Verduras
  'espinaca': ['espinaca', 'espinacas', 'spinach'],
  'pepino': ['pepino', 'cucumber'],
  'aceitunas': ['aceitunas', 'olivas'],
  'aceitunas negras': ['aceitunas negras', 'olivas negras'],
  
  // Aceites y condimentos
  'aceite de oliva': ['aceite oliva', 'aceite de oliva virgen'],
  'aceite de oliva virgen extra': ['aceite oliva virgen extra', 'aove'],
  'sal': ['sal', 'salt'],
  'pimienta': ['pimienta', 'pepper'],
  'canela': ['canela', 'cinnamon'],
  'miel': ['miel', 'honey'],
  
  // Frutos secos
  'nueces': ['nueces', 'nuts', 'walnut'],
  'almendras': ['almendras', 'almonds'],
  
  // Huevos
  'huevo': ['huevo', 'huevos', 'egg'],
  'huevos': ['huevos', 'egg']
};

// Función para calcular la similitud entre strings
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Coincidencia exacta
  if (s1 === s2) return 1.0;
  
  // Contiene la palabra completa
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  // Similitud de palabras individuales
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  let matchingWords = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        matchingWords++;
        break;
      }
    }
  }
  
  const maxWords = Math.max(words1.length, words2.length);
  return matchingWords / maxWords;
}

// Función para encontrar el mejor match para un ingrediente
function findBestMatch(ingredient: Ingredient, products: any[]): SupermarketProduct | null {
  const ingredientName = ingredient.name.toLowerCase();
  let bestMatch: SupermarketProduct | null = null;
  let bestScore = 0;
  
  // Obtener términos de búsqueda para este ingrediente
  const searchTerms = ingredientMapping[ingredientName] || [ingredientName];
  
  for (const product of products) {
    if (!product.nombre && !product.name) continue;
    
    const productName = (product.nombre || product.name || '').toLowerCase();
    if (!productName) continue;
    
    // Calcular score contra todos los términos de búsqueda
    let maxScore = 0;
    for (const term of searchTerms) {
      const score = calculateSimilarity(term, productName);
      maxScore = Math.max(maxScore, score);
    }
    
    // También probar coincidencia directa con el nombre original
    const directScore = calculateSimilarity(ingredientName, productName);
    maxScore = Math.max(maxScore, directScore);
    
    if (maxScore > bestScore && maxScore > 0.3) { // Umbral mínimo de similitud
      bestScore = maxScore;
      bestMatch = {
        id: `${Date.now()}-${Math.random()}`,
        name: product.nombre || product.name || 'Producto sin nombre',
        price: product.precio || product.price || 'Precio no disponible',
        image: product.imagen || product.image || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=150&h=150&fit=crop',
        originalIngredient: ingredient.name,
        matchScore: maxScore
      };
    }
  }
  
  return bestMatch;
}

// Datos de ejemplo para supermercados (esto se reemplazaría con scraping real)
const mockSupermarketData: Record<string, any[]> = {
  carrefour: [
    { nombre: 'Pechuga de Pollo Fileteada Carrefour 400g', precio: '€4.99', imagen: 'https://static.carrefour.es/hd_350x_/img_pim_food/476943_00_1.jpg' },
    { nombre: 'Leche Desnatada Carrefour 1L', precio: '€0.85', imagen: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop' },
    { nombre: 'Avena Integral Copos Carrefour 500g', precio: '€1.45', imagen: 'https://images.unsplash.com/photo-1571197238394-0090f3fde7df?w=150&h=150&fit=crop' },
    { nombre: 'Manzana Roja Premium 1kg', precio: '€2.99', imagen: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150&h=150&fit=crop' },
    { nombre: 'Espinacas Frescas Carrefour 200g', precio: '€1.29', imagen: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150&h=150&fit=crop' },
    { nombre: 'Queso Feta Griego Carrefour 200g', precio: '€2.79', imagen: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=150&h=150&fit=crop' },
    { nombre: 'Tomates Cherry Carrefour 250g', precio: '€1.59', imagen: 'https://images.unsplash.com/photo-1592841200221-76e6df769d3f?w=150&h=150&fit=crop' },
    { nombre: 'Aceite Oliva Virgen Extra 500ml', precio: '€3.49', imagen: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&h=150&fit=crop' },
    { nombre: 'Huevos Camperos L Carrefour x12', precio: '€2.89', imagen: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=150&h=150&fit=crop' },
    { nombre: 'Nueces Sin Cáscara Carrefour 200g', precio: '€4.29', imagen: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=150&h=150&fit=crop' },
    { nombre: 'Miel Natural Carrefour 500g', precio: '€3.99', imagen: 'https://images.unsplash.com/photo-1587049016823-b0dc9c8a8c8f?w=150&h=150&fit=crop' },
    { nombre: 'Canela Molida Carrefour 40g', precio: '€1.19', imagen: 'https://images.unsplash.com/photo-1557090495-fc4315662c5b?w=150&h=150&fit=crop' },
    { nombre: 'Aguacate Extra Carrefour 2ud', precio: '€2.49', imagen: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=150&h=150&fit=crop' },
    { nombre: 'Quinoa Real Carrefour 400g', precio: '€3.79', imagen: 'https://images.unsplash.com/photo-1505576633757-0ac1084af824?w=150&h=150&fit=crop' },
    { nombre: 'Aceitunas Negras Sin Hueso 150g', precio: '€1.99', imagen: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=150&h=150&fit=crop' }
  ],
  lidl: [
    { nombre: 'Pechuga Pollo Fresca Lidl 500g', precio: '€3.79', imagen: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=150&h=150&fit=crop' },
    { nombre: 'Leche Sin Lactosa Milbona 1L', precio: '€0.75', imagen: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&h=150&fit=crop' },
    { nombre: 'Copos Avena Vitalis 500g', precio: '€1.29', imagen: 'https://images.unsplash.com/photo-1571197238394-0090f3fde7df?w=150&h=150&fit=crop' },
    { nombre: 'Manzanas Rojas Dulces 1kg', precio: '€1.99', imagen: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=150&h=150&fit=crop' },
    { nombre: 'Espinacas Baby Lidl 125g', precio: '€0.99', imagen: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150&h=150&fit=crop' },
    { nombre: 'Queso Feta Lidl 150g', precio: '€1.99', imagen: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=150&h=150&fit=crop' },
    { nombre: 'Tomates Cherry Dulces 300g', precio: '€1.39', imagen: 'https://images.unsplash.com/photo-1592841200221-76e6df769d3f?w=150&h=150&fit=crop' },
    { nombre: 'Aceite Oliva Primadonna 750ml', precio: '€2.99', imagen: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&h=150&fit=crop' },
    { nombre: 'Huevos Frescos Lidl x10', precio: '€1.89', imagen: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=150&h=150&fit=crop' },
    { nombre: 'Nueces Partidas 200g', precio: '€2.99', imagen: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=150&h=150&fit=crop' },
    { nombre: 'Miel Flor Lidl 350g', precio: '€2.49', imagen: 'https://images.unsplash.com/photo-1587049016823-b0dc9c8a8c8f?w=150&h=150&fit=crop' },
    { nombre: 'Canela Polvo Vitania 50g', precio: '€0.89', imagen: 'https://images.unsplash.com/photo-1557090495-fc4315662c5b?w=150&h=150&fit=crop' },
    { nombre: 'Aguacates Maduros x2', precio: '€1.89', imagen: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=150&h=150&fit=crop' },
    { nombre: 'Quinoa Bio Lidl 250g', precio: '€2.99', imagen: 'https://images.unsplash.com/photo-1505576633757-0ac1084af824?w=150&h=150&fit=crop' },
    { nombre: 'Aceitunas Negras Premium 200g', precio: '€1.49', imagen: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=150&h=150&fit=crop' }
  ]
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { supermarket, ingredients } = await req.json();
    
    console.log('Processing request for supermarket:', supermarket);
    console.log('Ingredients to match:', ingredients);

    if (!supermarket || !ingredients || !Array.isArray(ingredients)) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Por ahora usar datos mock, pero esto se puede reemplazar con scraping real
    const supermarketProducts = mockSupermarketData[supermarket.toLowerCase()] || [];
    
    if (supermarketProducts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Supermarket not supported or no products found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Hacer matching de cada ingrediente
    const matchedProducts: SupermarketProduct[] = [];
    const processedIngredients = new Set<string>();

    for (const ingredient of ingredients) {
      // Evitar duplicados basados en el nombre del ingrediente
      const ingredientKey = ingredient.name.toLowerCase().trim();
      if (processedIngredients.has(ingredientKey)) {
        continue;
      }
      processedIngredients.add(ingredientKey);

      const match = findBestMatch(ingredient, supermarketProducts);
      if (match) {
        matchedProducts.push(match);
      } else {
        // Si no hay match, crear un producto genérico
        matchedProducts.push({
          id: `no-match-${Date.now()}-${Math.random()}`,
          name: `${ingredient.name} (producto genérico)`,
          price: 'Precio no disponible',
          image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=150&h=150&fit=crop',
          originalIngredient: ingredient.name,
          matchScore: 0.1
        });
      }
    }

    // Ordenar por score de matching (mejores primero)
    matchedProducts.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`Successfully matched ${matchedProducts.length} products for ${supermarket}`);

    return new Response(
      JSON.stringify({ products: matchedProducts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in match-supermarket-products function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});