export interface MenuItem {
  id: string
  name: string
  category: 'kfood' | 'steak' | 'pasta' | 'seafood' | 'salad' | 'dessert'
  price: number
  prepTime: number // seconds
  icon: string
  color: string
}

export interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
  color: string
}

export const menuItems: MenuItem[] = [
  // K-Food & Fusion
  {
    id: 'ramen',
    name: 'Ramen',
    category: 'kfood',
    price: 12,
    prepTime: 30,
    icon: '🍜',
    color: '#d4a574',
  },

  // Steak & Grill
  {
    id: 'ribeye',
    name: 'Ribeye Steak',
    category: 'steak',
    price: 28,
    prepTime: 45,
    icon: '🥩',
    color: '#8b4513',
  },
  {
    id: 'tomahawk',
    name: 'Tomahawk Steak',
    category: 'steak',
    price: 42,
    prepTime: 60,
    icon: '🥩',
    color: '#a0522d',
  },
  {
    id: 'chicken_steak',
    name: 'Chicken Steak',
    category: 'steak',
    price: 18,
    prepTime: 35,
    icon: '🍗',
    color: '#cd853f',
  },

  // Pasta & Hot
  {
    id: 'toomba_pasta',
    name: 'Toomba Pasta',
    category: 'pasta',
    price: 16,
    prepTime: 40,
    icon: '🍝',
    color: '#ff6347',
  },
  {
    id: 'carbonara',
    name: 'Carbonara',
    category: 'pasta',
    price: 14,
    prepTime: 38,
    icon: '🍝',
    color: '#daa520',
  },
  {
    id: 'tomato_pasta',
    name: 'Tomato Pasta',
    category: 'pasta',
    price: 13,
    prepTime: 35,
    icon: '🍝',
    color: '#ff4500',
  },
  {
    id: 'aglio_olio',
    name: 'Aglio e Olio',
    category: 'pasta',
    price: 12,
    prepTime: 32,
    icon: '🍝',
    color: '#ffd700',
  },
  {
    id: 'squid_ink_risotto',
    name: 'Squid Ink Risotto',
    category: 'pasta',
    price: 20,
    prepTime: 50,
    icon: '🍚',
    color: '#2f4f4f',
  },
  {
    id: 'gorgonzola_pizza',
    name: 'Gorgonzola Pizza',
    category: 'pasta',
    price: 15,
    prepTime: 42,
    icon: '🍕',
    color: '#d2691e',
  },
  {
    id: 'soup',
    name: 'Soup',
    category: 'pasta',
    price: 8,
    prepTime: 25,
    icon: '🍲',
    color: '#ff8c00',
  },
  {
    id: 'fish_chips',
    name: 'Fish & Chips',
    category: 'pasta',
    price: 15,
    prepTime: 38,
    icon: '🍟',
    color: '#daa520',
  },
  {
    id: 'taco',
    name: 'Taco',
    category: 'pasta',
    price: 10,
    prepTime: 28,
    icon: '🌮',
    color: '#ff6347',
  },

  // Sushi & Seafood
  {
    id: 'california_roll',
    name: 'California Roll',
    category: 'seafood',
    price: 12,
    prepTime: 30,
    icon: '🍣',
    color: '#2f4f4f',
  },
  {
    id: 'sushi',
    name: 'Sushi',
    category: 'seafood',
    price: 16,
    prepTime: 35,
    icon: '🍣',
    color: '#4169e1',
  },
  {
    id: 'salmon_sashimi',
    name: 'Salmon Sashimi',
    category: 'seafood',
    price: 18,
    prepTime: 25,
    icon: '🍣',
    color: '#ff7f50',
  },
  {
    id: 'flounder_sashimi',
    name: 'Flounder Sashimi',
    category: 'seafood',
    price: 20,
    prepTime: 20,
    icon: '🍣',
    color: '#f0f8ff',
  },
  {
    id: 'king_crab',
    name: 'King Crab',
    category: 'seafood',
    price: 35,
    prepTime: 55,
    icon: '🦀',
    color: '#cd5c5c',
  },
  {
    id: 'snow_crab',
    name: 'Snow Crab',
    category: 'seafood',
    price: 32,
    prepTime: 50,
    icon: '🦀',
    color: '#daa520',
  },
  {
    id: 'lobster',
    name: 'Lobster',
    category: 'seafood',
    price: 38,
    prepTime: 60,
    icon: '🦞',
    color: '#cd5c5c',
  },

  // Salad & Breakfast
  {
    id: 'chicken_salad',
    name: 'Chicken Breast Salad',
    category: 'salad',
    price: 11,
    prepTime: 22,
    icon: '🥗',
    color: '#90ee90',
  },
  {
    id: 'cheese',
    name: 'Cheese Platter',
    category: 'salad',
    price: 14,
    prepTime: 15,
    icon: '🧀',
    color: '#ffd700',
  },
  {
    id: 'bushman_bread',
    name: 'Bushman Bread',
    category: 'salad',
    price: 6,
    prepTime: 18,
    icon: '🥖',
    color: '#d2b48c',
  },
  {
    id: 'bacon',
    name: 'Bacon',
    category: 'salad',
    price: 8,
    prepTime: 12,
    icon: '🥓',
    color: '#8b4513',
  },
  {
    id: 'scrambled_egg',
    name: 'Scrambled Egg',
    category: 'salad',
    price: 5,
    prepTime: 10,
    icon: '🥚',
    color: '#ffd700',
  },
  {
    id: 'milk',
    name: 'Milk',
    category: 'salad',
    price: 3,
    prepTime: 5,
    icon: '🥛',
    color: '#f5f5f5',
  },
  {
    id: 'juice',
    name: 'Juice',
    category: 'salad',
    price: 4,
    prepTime: 8,
    icon: '🧃',
    color: '#ff69b4',
  },

  // Dessert & Beverage
  {
    id: 'cake',
    name: 'Cake',
    category: 'dessert',
    price: 9,
    prepTime: 20,
    icon: '🎂',
    color: '#ff1493',
  },
  {
    id: 'ice_cream',
    name: 'Ice Cream',
    category: 'dessert',
    price: 6,
    prepTime: 8,
    icon: '🍦',
    color: '#ffa500',
  },
  {
    id: 'coffee',
    name: 'Coffee',
    category: 'dessert',
    price: 5,
    prepTime: 12,
    icon: '☕',
    color: '#8b4513',
  },
]

export const menuCategories: MenuCategory[] = [
  {
    id: 'kfood',
    name: 'K-Food',
    items: menuItems.filter((item) => item.category === 'kfood'),
    color: '#ff6347',
  },
  {
    id: 'steak',
    name: 'Steak & Grill',
    items: menuItems.filter((item) => item.category === 'steak'),
    color: '#8b4513',
  },
  {
    id: 'pasta',
    name: 'Pasta & Hot',
    items: menuItems.filter((item) => item.category === 'pasta'),
    color: '#ffd700',
  },
  {
    id: 'seafood',
    name: 'Seafood',
    items: menuItems.filter((item) => item.category === 'seafood'),
    color: '#4169e1',
  },
  {
    id: 'salad',
    name: 'Salad & Breakfast',
    items: menuItems.filter((item) => item.category === 'salad'),
    color: '#90ee90',
  },
  {
    id: 'dessert',
    name: 'Dessert & Beverage',
    items: menuItems.filter((item) => item.category === 'dessert'),
    color: '#ff69b4',
  },
]
