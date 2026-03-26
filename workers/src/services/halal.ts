const HARAM_INGREDIENTS = [
  'pork', 'lard', 'gelatin', 'alcohol', 'wine', 'beer', 'ethanol',
  'pepsin', 'rennet', 'carmine', 'cochineal', 'e120', 'e441',
  'خنزير', 'جيلاتين', 'كحول', 'خمر', 'دهن الخنزير'
];

const DOUBTFUL_INGREDIENTS = [
  'e471', 'e472', 'e473', 'e474', 'e475', 'vanilla extract',
  'natural flavors', 'mono glycerides', 'نكهات طبيعية'
];

export interface HalalVerdictResult {
  found: boolean;
  name?: string;
  verdict?: 'haram' | 'doubtful' | 'likely_halal';
  haram_ingredients?: string[];
  doubtful_ingredients?: string[];
  ingredients_raw?: string;
  disclaimer?: string;
}

export function computeHalalVerdict(productName: string, ingredientsText: string): HalalVerdictResult {
  const ingredients = ingredientsText.toLowerCase();
  const haramFound = HARAM_INGREDIENTS.filter((item) => ingredients.includes(item.toLowerCase()));
  const doubtfulFound = DOUBTFUL_INGREDIENTS.filter((item) => ingredients.includes(item.toLowerCase()));

  return {
    found: true,
    name: productName,
    verdict: haramFound.length > 0 ? 'haram' : doubtfulFound.length > 0 ? 'doubtful' : 'likely_halal',
    haram_ingredients: haramFound,
    doubtful_ingredients: doubtfulFound,
    ingredients_raw: ingredientsText,
    disclaimer: 'هذا تحليل آلي للمساعدة فقط. تحقق من الشهادات الرسمية للتأكيد.',
  };
}
