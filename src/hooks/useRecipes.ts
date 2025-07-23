import { useState, useEffect } from 'react';
import { Recipe, CategoryType } from '@/types/recipe';

// Mock data for demonstration
const mockRecipes: Recipe[] = [
  // Desayuno (4 recetas)
  {
    id: '1',
    title: 'Tostadas de Aguacate',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
    calories: 320,
    time: 10,
    category: 'breakfast',
    servings: 2,
    macros: { carbs: 45, protein: 15, fat: 40 },
    ingredients: [
      { id: '1', name: 'Pan integral', amount: '4', unit: 'rebanadas', selected: true },
      { id: '2', name: 'Aguacate', amount: '2', unit: 'unidades', selected: true },
      { id: '3', name: 'Tomate cherry', amount: '8', unit: 'unidades', selected: true },
      { id: '4', name: 'Sal marina', amount: '1', unit: 'pizca', selected: true }
    ],
    instructions: [
      'Tostar el pan hasta que esté dorado',
      'Cortar el aguacate por la mitad y retirar el hueso',
      'Aplastar el aguacate con un tenedor',
      'Untar el aguacate sobre el pan tostado',
      'Cortar los tomates cherry y distribuir sobre las tostadas',
      'Añadir sal marina al gusto'
    ],
    nutrition: { calories: 320, protein: 8, carbs: 30, fat: 18, fiber: 12, sugar: 6 }
  },
  {
    id: '4',
    title: 'Muffins de batata',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
    calories: 292,
    time: 35,
    category: 'breakfast',
    servings: 6,
    macros: { carbs: 60, protein: 12, fat: 28 },
    ingredients: [
      { id: '13', name: 'Batata', amount: '300', unit: 'g', selected: true },
      { id: '14', name: 'Harina integral', amount: '200', unit: 'g', selected: true },
      { id: '15', name: 'Huevos', amount: '2', unit: 'unidades', selected: true },
      { id: '16', name: 'Aceite de coco', amount: '3', unit: 'cucharadas', selected: true }
    ],
    instructions: [
      'Precalentar el horno a 180°C',
      'Hornear la batata hasta que esté tierna',
      'Hacer puré con la batata',
      'Mezclar todos los ingredientes secos',
      'Incorporar los huevos y el aceite',
      'Hornear por 25 minutos'
    ],
    nutrition: { calories: 292, protein: 7, carbs: 45, fat: 12, fiber: 8, sugar: 15 }
  },
  {
    id: '5',
    title: 'Pan de avena para el desayuno',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    calories: 151,
    time: 45,
    category: 'breakfast',
    servings: 8,
    macros: { carbs: 65, protein: 15, fat: 20 },
    ingredients: [
      { id: '17', name: 'Avena', amount: '300', unit: 'g', selected: true },
      { id: '18', name: 'Semillas de chía', amount: '2', unit: 'cucharadas', selected: true },
      { id: '19', name: 'Miel', amount: '3', unit: 'cucharadas', selected: true },
      { id: '20', name: 'Aceite de oliva', amount: '50', unit: 'ml', selected: true }
    ],
    instructions: [
      'Mezclar la avena con las semillas',
      'Añadir la miel y el aceite',
      'Formar una masa homogénea',
      'Hornear a 170°C por 40 minutos',
      'Dejar enfriar antes de cortar'
    ],
    nutrition: { calories: 151, protein: 5, carbs: 28, fat: 4, fiber: 6, sugar: 8 }
  },
  {
    id: '6',
    title: 'Cheesecake con avena de la noche a la mañana',
    image: 'https://images.unsplash.com/photo-1571197119282-621c1ece75ac?w=400',
    calories: 373,
    time: 10,
    category: 'breakfast',
    servings: 1,
    macros: { carbs: 43, protein: 36, fat: 21 },
    ingredients: [
      { id: '21', name: 'Avena en hojuelas', amount: '1.5', unit: 'taza', selected: true },
      { id: '22', name: 'Semillas de chía', amount: '4', unit: 'cucharadas', selected: true },
      { id: '23', name: 'Leche vegetal', amount: '2', unit: 'tazas', selected: true },
      { id: '24', name: 'Proteína en polvo vainilla', amount: '2', unit: 'porciones', selected: true }
    ],
    instructions: [
      'En un bol, mezclar bien los copos de avena, las semillas de chía, la leche vegetal, la sal y la proteína de vainilla en polvo',
      'Añada la ralladura de limón y el zumo de limón. Si lo desea, añada miel o sirope de arce para endulzar la mezcla al gusto',
      'Cubrir el bol o repartir la mezcla en tarros o recipientes individuales con tapa. Dejar reposar la mezcla toda la noche (o al menos 4 horas)',
      'Mezclar el yogur griego y 1 cacito de proteína en polvo y cubrir las gachas con la mezcla y los cítricos antes de servir'
    ],
    nutrition: { calories: 373, protein: 31, carbs: 38, fat: 8, fiber: 9, sugar: 10 }
  },

  // Almuerzo (4 recetas)
  {
    id: '2', 
    title: 'Ensalada César',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    calories: 450,
    time: 15,
    category: 'lunch',
    servings: 3,
    macros: { carbs: 20, protein: 35, fat: 45 },
    ingredients: [
      { id: '5', name: 'Lechuga romana', amount: '1', unit: 'unidad', selected: true },
      { id: '6', name: 'Pollo a la plancha', amount: '200', unit: 'g', selected: true },
      { id: '7', name: 'Queso parmesano', amount: '50', unit: 'g', selected: true },
      { id: '8', name: 'Pan rallado', amount: '2', unit: 'cucharadas', selected: true }
    ],
    instructions: [
      'Lavar y cortar la lechuga en trozos',
      'Cocinar el pollo a la plancha hasta dorar',
      'Cortar el pollo en tiras',
      'Mezclar todos los ingredientes en un bowl',
      'Añadir el aderezo césar y mezclar bien'
    ],
    nutrition: { calories: 450, protein: 35, carbs: 15, fat: 28, fiber: 4, sugar: 3 }
  },
  {
    id: '7',
    title: 'Ensalada mediterránea de salmón',
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400',
    calories: 661,
    time: 20,
    category: 'lunch',
    servings: 2,
    macros: { carbs: 25, protein: 40, fat: 35 },
    ingredients: [
      { id: '25', name: 'Salmón fresco', amount: '300', unit: 'g', selected: true },
      { id: '26', name: 'Tomates cherry', amount: '200', unit: 'g', selected: true },
      { id: '27', name: 'Pepino', amount: '1', unit: 'unidad', selected: true },
      { id: '28', name: 'Aceitunas', amount: '50', unit: 'g', selected: true }
    ],
    instructions: [
      'Cortar el salmón en dados',
      'Picar los vegetales',
      'Mezclar en un bowl',
      'Aliñar con aceite de oliva y limón',
      'Servir fresco'
    ],
    nutrition: { calories: 661, protein: 45, carbs: 15, fat: 35, fiber: 6, sugar: 8 }
  },
  {
    id: '8',
    title: 'Bolitas de papa cocinadas en una waflera con queso',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400',
    calories: 714,
    time: 30,
    category: 'lunch',
    servings: 4,
    macros: { carbs: 50, protein: 25, fat: 25 },
    ingredients: [
      { id: '29', name: 'Papas', amount: '500', unit: 'g', selected: true },
      { id: '30', name: 'Queso cheddar', amount: '150', unit: 'g', selected: true },
      { id: '31', name: 'Huevos', amount: '2', unit: 'unidades', selected: true },
      { id: '32', name: 'Cebollino', amount: '2', unit: 'cucharadas', selected: true }
    ],
    instructions: [
      'Hervir las papas hasta que estén tiernas',
      'Hacer puré y dejar enfriar',
      'Añadir queso, huevos y cebollino',
      'Formar bolitas y cocinar en waflera',
      'Servir caliente'
    ],
    nutrition: { calories: 714, protein: 25, carbs: 60, fat: 28, fiber: 5, sugar: 3 }
  },
  {
    id: '9',
    title: 'Bowl de quinoa y vegetales',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    calories: 485,
    time: 25,
    category: 'lunch',
    servings: 2,
    macros: { carbs: 55, protein: 20, fat: 25 },
    ingredients: [
      { id: '33', name: 'Quinoa', amount: '200', unit: 'g', selected: true },
      { id: '34', name: 'Brócoli', amount: '150', unit: 'g', selected: true },
      { id: '35', name: 'Zanahoria', amount: '100', unit: 'g', selected: true },
      { id: '36', name: 'Aguacate', amount: '1', unit: 'unidad', selected: true }
    ],
    instructions: [
      'Cocinar la quinoa en agua hirviendo',
      'Cocinar al vapor los vegetales',
      'Cortar el aguacate en rebanadas',
      'Servir todo en un bowl',
      'Aliñar con aceite y limón'
    ],
    nutrition: { calories: 485, protein: 18, carbs: 52, fat: 22, fiber: 12, sugar: 6 }
  },

  // Cena (4 recetas)
  {
    id: '3',
    title: 'Pasta Carbonara',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
    calories: 680,
    time: 25,
    category: 'dinner',
    servings: 4,
    macros: { carbs: 55, protein: 25, fat: 20 },
    ingredients: [
      { id: '9', name: 'Pasta espagueti', amount: '400', unit: 'g', selected: true },
      { id: '10', name: 'Huevos', amount: '3', unit: 'unidades', selected: true },
      { id: '11', name: 'Panceta', amount: '150', unit: 'g', selected: true },
      { id: '12', name: 'Queso parmesano', amount: '100', unit: 'g', selected: true }
    ],
    instructions: [
      'Hervir agua con sal para la pasta',
      'Cocinar la pasta según las instrucciones del paquete',
      'Freír la panceta hasta que esté crujiente',
      'Batir los huevos con el queso parmesano',
      'Mezclar la pasta caliente con los huevos y panceta',
      'Servir inmediatamente'
    ],
    nutrition: { calories: 680, protein: 28, carbs: 65, fat: 32, fiber: 3, sugar: 2 }
  },
  {
    id: '10',
    title: 'Salmón al horno con verduras',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    calories: 420,
    time: 35,
    category: 'dinner',
    servings: 2,
    macros: { carbs: 20, protein: 50, fat: 30 },
    ingredients: [
      { id: '37', name: 'Salmón', amount: '400', unit: 'g', selected: true },
      { id: '38', name: 'Espárragos', amount: '200', unit: 'g', selected: true },
      { id: '39', name: 'Calabacín', amount: '1', unit: 'unidad', selected: true },
      { id: '40', name: 'Limón', amount: '1', unit: 'unidad', selected: true }
    ],
    instructions: [
      'Precalentar el horno a 200°C',
      'Cortar las verduras en trozos',
      'Colocar todo en una bandeja',
      'Hornear por 25 minutos',
      'Servir con rodajas de limón'
    ],
    nutrition: { calories: 420, protein: 42, carbs: 12, fat: 22, fiber: 8, sugar: 6 }
  },
  {
    id: '11',
    title: 'Pollo al curry con arroz basmati',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    calories: 550,
    time: 40,
    category: 'dinner',
    servings: 3,
    macros: { carbs: 45, protein: 35, fat: 20 },
    ingredients: [
      { id: '41', name: 'Pollo', amount: '500', unit: 'g', selected: true },
      { id: '42', name: 'Arroz basmati', amount: '200', unit: 'g', selected: true },
      { id: '43', name: 'Leche de coco', amount: '400', unit: 'ml', selected: true },
      { id: '44', name: 'Curry en polvo', amount: '2', unit: 'cucharadas', selected: true }
    ],
    instructions: [
      'Cortar el pollo en trozos',
      'Dorar el pollo en una sartén',
      'Añadir el curry y la leche de coco',
      'Cocinar a fuego lento 20 minutos',
      'Servir con arroz basmati'
    ],
    nutrition: { calories: 550, protein: 38, carbs: 42, fat: 24, fiber: 2, sugar: 4 }
  },
  {
    id: '12',
    title: 'Lasaña de vegetales',
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400',
    calories: 380,
    time: 60,
    category: 'dinner',
    servings: 6,
    macros: { carbs: 35, protein: 25, fat: 40 },
    ingredients: [
      { id: '45', name: 'Láminas de lasaña', amount: '12', unit: 'unidades', selected: true },
      { id: '46', name: 'Berenjena', amount: '2', unit: 'unidades', selected: true },
      { id: '47', name: 'Calabacín', amount: '2', unit: 'unidades', selected: true },
      { id: '48', name: 'Queso ricotta', amount: '300', unit: 'g', selected: true }
    ],
    instructions: [
      'Cortar las verduras en láminas',
      'Cocinar las láminas de lasaña',
      'Alternar capas de pasta, verduras y queso',
      'Hornear a 180°C por 45 minutos',
      'Dejar reposar antes de servir'
    ],
    nutrition: { calories: 380, protein: 18, carbs: 32, fat: 20, fiber: 8, sugar: 12 }
  },

  // Aperitivo (4 recetas)
  {
    id: '13',
    title: 'Hummus con vegetales',
    image: 'https://images.unsplash.com/photo-1601409087470-86d3caa6c87b?w=400',
    calories: 180,
    time: 15,
    category: 'appetizer',
    servings: 4,
    macros: { carbs: 45, protein: 25, fat: 30 },
    ingredients: [
      { id: '49', name: 'Garbanzos', amount: '400', unit: 'g', selected: true },
      { id: '50', name: 'Tahini', amount: '3', unit: 'cucharadas', selected: true },
      { id: '51', name: 'Limón', amount: '1', unit: 'unidad', selected: true },
      { id: '52', name: 'Apio', amount: '3', unit: 'tallos', selected: true }
    ],
    instructions: [
      'Escurrir y enjuagar los garbanzos',
      'Triturar con tahini y jugo de limón',
      'Cortar el apio en bastones',
      'Servir el hummus con los vegetales',
      'Decorar con aceite de oliva'
    ],
    nutrition: { calories: 180, protein: 8, carbs: 22, fat: 8, fiber: 6, sugar: 4 }
  },
  {
    id: '14',
    title: 'Bruschetta de tomate',
    image: 'https://images.unsplash.com/photo-1506280754576-f6fa8a873550?w=400',
    calories: 220,
    time: 10,
    category: 'appetizer',
    servings: 6,
    macros: { carbs: 60, protein: 15, fat: 25 },
    ingredients: [
      { id: '53', name: 'Pan baguette', amount: '1', unit: 'unidad', selected: true },
      { id: '54', name: 'Tomates', amount: '4', unit: 'unidades', selected: true },
      { id: '55', name: 'Albahaca', amount: '10', unit: 'hojas', selected: true },
      { id: '56', name: 'Ajo', amount: '2', unit: 'dientes', selected: true }
    ],
    instructions: [
      'Cortar el pan en rebanadas',
      'Tostar las rebanadas',
      'Frotar con ajo',
      'Picar tomates y albahaca',
      'Colocar la mezcla sobre el pan'
    ],
    nutrition: { calories: 220, protein: 6, carbs: 35, fat: 7, fiber: 3, sugar: 8 }
  },
  {
    id: '15',
    title: 'Rollitos de salmón y queso crema',
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400',
    calories: 320,
    time: 20,
    category: 'appetizer',
    servings: 8,
    macros: { carbs: 10, protein: 40, fat: 50 },
    ingredients: [
      { id: '57', name: 'Salmón ahumado', amount: '200', unit: 'g', selected: true },
      { id: '58', name: 'Queso crema', amount: '150', unit: 'g', selected: true },
      { id: '59', name: 'Pepino', amount: '1', unit: 'unidad', selected: true },
      { id: '60', name: 'Eneldo', amount: '2', unit: 'cucharadas', selected: true }
    ],
    instructions: [
      'Extender el queso crema sobre el salmón',
      'Cortar el pepino en bastones',
      'Colocar pepino y eneldo sobre el salmón',
      'Enrollar cuidadosamente',
      'Cortar en porciones'
    ],
    nutrition: { calories: 320, protein: 22, carbs: 3, fat: 26, fiber: 1, sugar: 2 }
  },
  {
    id: '16',
    title: 'Croquetas de jamón',
    image: 'https://images.unsplash.com/photo-1571197119282-621c1ece75ac?w=400',
    calories: 280,
    time: 45,
    category: 'appetizer',
    servings: 12,
    macros: { carbs: 30, protein: 35, fat: 35 },
    ingredients: [
      { id: '61', name: 'Jamón serrano', amount: '200', unit: 'g', selected: true },
      { id: '62', name: 'Harina', amount: '100', unit: 'g', selected: true },
      { id: '63', name: 'Leche', amount: '500', unit: 'ml', selected: true },
      { id: '64', name: 'Pan rallado', amount: '100', unit: 'g', selected: true }
    ],
    instructions: [
      'Picar el jamón finamente',
      'Hacer una bechamel espesa',
      'Mezclar jamón con la bechamel',
      'Formar croquetas y empanizar',
      'Freír hasta dorar'
    ],
    nutrition: { calories: 280, protein: 15, carbs: 18, fat: 18, fiber: 1, sugar: 6 }
  },

  // Tentempié (4 recetas)
  {
    id: '17',
    title: 'Mix de frutos secos',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
    calories: 420,
    time: 5,
    category: 'snacks',
    servings: 4,
    macros: { carbs: 20, protein: 15, fat: 65 },
    ingredients: [
      { id: '65', name: 'Almendras', amount: '50', unit: 'g', selected: true },
      { id: '66', name: 'Nueces', amount: '50', unit: 'g', selected: true },
      { id: '67', name: 'Pasas', amount: '30', unit: 'g', selected: true },
      { id: '68', name: 'Pistachos', amount: '30', unit: 'g', selected: true }
    ],
    instructions: [
      'Mezclar todos los frutos secos',
      'Tostar ligeramente en una sartén',
      'Dejar enfriar',
      'Conservar en recipiente hermético',
      'Servir en porciones pequeñas'
    ],
    nutrition: { calories: 420, protein: 12, carbs: 18, fat: 36, fiber: 8, sugar: 12 }
  },
  {
    id: '18',
    title: 'Batido de proteínas',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
    calories: 280,
    time: 5,
    category: 'snacks',
    servings: 1,
    macros: { carbs: 30, protein: 50, fat: 20 },
    ingredients: [
      { id: '69', name: 'Proteína en polvo', amount: '30', unit: 'g', selected: true },
      { id: '70', name: 'Plátano', amount: '1', unit: 'unidad', selected: true },
      { id: '71', name: 'Leche de almendras', amount: '250', unit: 'ml', selected: true },
      { id: '72', name: 'Mantequilla de maní', amount: '1', unit: 'cucharada', selected: true }
    ],
    instructions: [
      'Pelar y cortar el plátano',
      'Añadir todos los ingredientes a la licuadora',
      'Batir hasta obtener consistencia suave',
      'Servir inmediatamente',
      'Decorar con rodajas de plátano'
    ],
    nutrition: { calories: 280, protein: 25, carbs: 22, fat: 8, fiber: 4, sugar: 15 }
  },
  {
    id: '19',
    title: 'Yogur con granola',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    calories: 320,
    time: 5,
    category: 'snacks',
    servings: 1,
    macros: { carbs: 45, protein: 25, fat: 30 },
    ingredients: [
      { id: '73', name: 'Yogur griego', amount: '200', unit: 'g', selected: true },
      { id: '74', name: 'Granola', amount: '50', unit: 'g', selected: true },
      { id: '75', name: 'Miel', amount: '1', unit: 'cucharada', selected: true },
      { id: '76', name: 'Arándanos', amount: '50', unit: 'g', selected: true }
    ],
    instructions: [
      'Servir el yogur en un bowl',
      'Añadir la granola por encima',
      'Agregar los arándanos',
      'Rociar con miel',
      'Servir inmediatamente'
    ],
    nutrition: { calories: 320, protein: 18, carbs: 35, fat: 12, fiber: 6, sugar: 28 }
  },
  {
    id: '20',
    title: 'Chips de boniato al horno',
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400',
    calories: 160,
    time: 25,
    category: 'snacks',
    servings: 2,
    macros: { carbs: 75, protein: 10, fat: 15 },
    ingredients: [
      { id: '77', name: 'Boniato', amount: '1', unit: 'unidad grande', selected: true },
      { id: '78', name: 'Aceite de oliva', amount: '1', unit: 'cucharada', selected: true },
      { id: '79', name: 'Sal', amount: '1', unit: 'pizca', selected: true },
      { id: '80', name: 'Pimentón', amount: '1', unit: 'pizca', selected: true }
    ],
    instructions: [
      'Lavar y cortar el boniato en rodajas finas',
      'Rociar con aceite de oliva',
      'Sazonar con sal y pimentón',
      'Hornear a 200°C por 20 minutos',
      'Voltear a mitad de cocción'
    ],
    nutrition: { calories: 160, protein: 3, carbs: 32, fat: 4, fiber: 5, sugar: 8 }
  },

  // Postres (4 recetas)
  {
    id: '21',
    title: 'Tarta de chocolate sin azúcar',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    calories: 380,
    time: 60,
    category: 'desserts',
    servings: 8,
    macros: { carbs: 35, protein: 15, fat: 50 },
    ingredients: [
      { id: '81', name: 'Cacao en polvo', amount: '100', unit: 'g', selected: true },
      { id: '82', name: 'Aguacate', amount: '2', unit: 'unidades', selected: true },
      { id: '83', name: 'Dátiles', amount: '200', unit: 'g', selected: true },
      { id: '84', name: 'Almendras', amount: '150', unit: 'g', selected: true }
    ],
    instructions: [
      'Remojar los dátiles en agua tibia',
      'Triturar las almendras',
      'Mezclar aguacate con cacao',
      'Incorporar dátiles triturados',
      'Refrigerar por 4 horas'
    ],
    nutrition: { calories: 380, protein: 8, carbs: 28, fat: 28, fiber: 12, sugar: 22 }
  },
  {
    id: '22',
    title: 'Helado de plátano y fresa',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    calories: 120,
    time: 10,
    category: 'desserts',
    servings: 2,
    macros: { carbs: 80, protein: 10, fat: 10 },
    ingredients: [
      { id: '85', name: 'Plátanos congelados', amount: '3', unit: 'unidades', selected: true },
      { id: '86', name: 'Fresas congeladas', amount: '150', unit: 'g', selected: true },
      { id: '87', name: 'Leche de coco', amount: '50', unit: 'ml', selected: true },
      { id: '88', name: 'Vainilla', amount: '1', unit: 'cucharadita', selected: true }
    ],
    instructions: [
      'Cortar los plátanos en rodajas',
      'Triturar frutas congeladas',
      'Añadir leche de coco gradualmente',
      'Incorporar la vainilla',
      'Servir inmediatamente o congelar'
    ],
    nutrition: { calories: 120, protein: 2, carbs: 28, fat: 2, fiber: 4, sugar: 20 }
  },
  {
    id: '23',
    title: 'Muffins de arándanos',
    image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400',
    calories: 250,
    time: 35,
    category: 'desserts',
    servings: 12,
    macros: { carbs: 55, protein: 15, fat: 30 },
    ingredients: [
      { id: '89', name: 'Harina integral', amount: '200', unit: 'g', selected: true },
      { id: '90', name: 'Arándanos', amount: '150', unit: 'g', selected: true },
      { id: '91', name: 'Huevos', amount: '2', unit: 'unidades', selected: true },
      { id: '92', name: 'Aceite de coco', amount: '80', unit: 'ml', selected: true }
    ],
    instructions: [
      'Mezclar ingredientes secos',
      'Batir huevos con aceite',
      'Combinar ambas mezclas',
      'Agregar arándanos',
      'Hornear a 180°C por 25 minutos'
    ],
    nutrition: { calories: 250, protein: 6, carbs: 32, fat: 12, fiber: 5, sugar: 18 }
  },
  {
    id: '24',
    title: 'Pannacotta de vainilla',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    calories: 200,
    time: 240,
    category: 'desserts',
    servings: 6,
    macros: { carbs: 40, protein: 20, fat: 40 },
    ingredients: [
      { id: '93', name: 'Nata para montar', amount: '400', unit: 'ml', selected: true },
      { id: '94', name: 'Azúcar', amount: '80', unit: 'g', selected: true },
      { id: '95', name: 'Gelatina', amount: '7', unit: 'g', selected: true },
      { id: '96', name: 'Esencia de vainilla', amount: '1', unit: 'cucharadita', selected: true }
    ],
    instructions: [
      'Hidratar la gelatina en agua fría',
      'Calentar parte de la nata con azúcar',
      'Disolver la gelatina en la nata caliente',
      'Añadir el resto de nata y vainilla',
      'Refrigerar 4 horas hasta cuajar'
    ],
    nutrition: { calories: 200, protein: 4, carbs: 18, fat: 18, fiber: 0, sugar: 18 }
  }
];

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('recipe-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (recipeId: string) => {
    const newFavorites = favorites.includes(recipeId)
      ? favorites.filter(id => id !== recipeId)
      : [...favorites, recipeId];
    
    setFavorites(newFavorites);
    localStorage.setItem('recipe-favorites', JSON.stringify(newFavorites));
  };

  const getRecipesByCategory = (category: CategoryType, limit?: number) => {
    if (category === 'favorites') {
      return recipes.filter(recipe => favorites.includes(recipe.id));
    }
    if (category === 'trending') {
      return []; // Trending no muestra recetas individuales
    }
    
    const filteredRecipes = recipes.filter(recipe => recipe.category === category);
    
    if (limit) {
      return filteredRecipes.slice(0, limit);
    }
    
    return filteredRecipes;
  };

  const getRecipeById = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };

  return {
    recipes,
    favorites,
    toggleFavorite,
    getRecipesByCategory,
    getRecipeById
  };
};