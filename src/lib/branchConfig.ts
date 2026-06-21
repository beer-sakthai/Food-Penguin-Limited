import { MS_PRODUCTS, TESCO_PRODUCTS } from '../components/SellTab';
import type { ProductionTask, Recipe } from '../types';

export type UserRole = 'Admin' | 'Manager' | 'Staff';
export type BranchName = 'Marks & Spencer - Cork City' | 'Tesco - Cork City' | 'Tesco - Mahon Point';

type ProductCatalogItem = (typeof MS_PRODUCTS)[number];

export const BRANCHES: BranchName[] = [
  'Marks & Spencer - Cork City',
  'Tesco - Cork City',
  'Tesco - Mahon Point',
];

export const rolePermissions: Record<UserRole, string[]> = {
  Admin: ['Overview', 'Sell', 'Target', 'Production', 'Waste', 'Hours', 'Supplier', 'Planning', 'Studio'],
  Manager: ['Overview', 'Target', 'Production', 'Waste', 'Hours', 'Supplier', 'Planning', 'Studio'],
  Staff: ['Overview', 'Sell', 'Production', 'Waste', 'Supplier'],
};

export function getProductsForBranch(branch: BranchName): ProductCatalogItem[] {
  return branch === 'Marks & Spencer - Cork City' ? MS_PRODUCTS : TESCO_PRODUCTS;
}

function getIngredients(category: string, name: string): string[] {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('salmon')) {
    return ['Atlantic Salmon Fillet', 'Fresh Wasabi Paste', 'Premium Sushi Rice', 'Grated Daikon Radish', 'Soy Sauce'];
  }
  if (lowerName.includes('chicken')) {
    return ['Free-range Chicken Fillet', 'Katsu Curry Sauce', 'Panko Breadcrumbs', 'Seasoned Jasmine Rice', 'Spring Onions'];
  }
  if (lowerName.includes('tofu') || lowerName.includes('veggie') || lowerName.includes('plant')) {
    return ['Pressed Silken Tofu', 'Fresh Avocado', 'Cucumber ribbon', 'Mixed Sesame seeds', 'Sweet Glaze Drizzle'];
  }
  if (category === 'Sushi Rolls' || category === 'Maki Rolls' || category === 'Nigiri Duos') {
    return ['Seasoned Hinohikari Rice', 'Premium Toasted Nori Sheets', 'Crispy Cucumber', 'Kyoto Japanese Mayo', 'Soy Glaze'];
  }
  if (category === 'Noodles & Sides' || lowerName.includes('noodles')) {
    return ['Fresh Udon Grains', 'Julienned Sweet Peppers', 'Savory Soy Brew sauce', 'Crushed Peanuts', 'Chili Flakes'];
  }
  if (category === 'Desserts & Sweets' || lowerName.includes('mochi')) {
    return ['Sweetened Rice Flour Paste', 'Artisanal Ice Cream Core', 'Powdered Starch coating', 'Natural Strawberry syrup'];
  }

  return ['Hand-picked Nori', 'Select Sushi Rice', 'Signature Dipping Sauce', 'Crisp Cucumber slice'];
}

function getAllergens(category: string, name: string): string[] {
  const lowerName = name.toLowerCase();
  const allergens: string[] = [];

  if (lowerName.includes('salmon') || lowerName.includes('fish')) allergens.push('Fish');
  if (lowerName.includes('chicken')) allergens.push('Gluten');
  if (lowerName.includes('tofu') || lowerName.includes('veggie')) allergens.push('Soya');
  if (lowerName.includes('noodles') || lowerName.includes('gyoza') || lowerName.includes('katsu')) {
    if (!allergens.includes('Gluten')) allergens.push('Gluten');
  }
  if (lowerName.includes('mochi')) allergens.push('Milk');
  if (category.toLowerCase().includes('roll')) allergens.push('Sesame');
  if (allergens.length === 0) allergens.push('Soya');

  return allergens;
}

export function buildRecipesForBranch(branch: BranchName): Recipe[] {
  const activeProducts = getProductsForBranch(branch);
  const recipePrefix = branch === 'Marks & Spencer - Cork City' ? 'R-MS' : 'R-T';

  return activeProducts.map((product, index) => ({
    id: `${recipePrefix}-${index + 1}`,
    name: product.name,
    category: product.category,
    status: 'active',
    prepTime: Math.min(15, Math.max(3, Math.round(product.price * 1.2))),
    ingredients: getIngredients(product.category, product.name),
    allergens: getAllergens(product.category, product.name),
  }));
}

export function buildTasksForBranch(branch: BranchName): ProductionTask[] {
  const products = getProductsForBranch(branch);

  if (products.length < 4) {
    return [];
  }

  return [
    { id: 'PT-301', itemName: products[0].name, assignedTo: 'Chef Skipper', status: 'Cooking', quantity: 2, priority: 'high' },
    { id: 'PT-302', itemName: products[1].name, assignedTo: 'Chef Private', status: 'Cooking', quantity: 1, priority: 'medium' },
    { id: 'PT-303', itemName: products[2].name, assignedTo: 'Kitchen Aide Rico', status: 'In Queue', quantity: 3, priority: 'low' },
    { id: 'PT-304', itemName: products[3].name, assignedTo: 'Chef Kowalski', status: 'Prepared', quantity: 4, priority: 'high' },
  ];
}

export function formatBranchLabel(branch: BranchName): string {
  return branch.replace('Marks & Spencer', 'M&S').replace(' - Cork City', ' Cork').replace(' - Mahon Point', ' Mahon');
}

export function formatBranchOptionLabel(branch: BranchName): string {
  return branch.replace(' - ', ' ');
}
