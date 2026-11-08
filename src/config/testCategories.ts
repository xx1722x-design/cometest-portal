// Ktestone-style test categories - Horror, Mystery, Occult, Dark Psychology
export interface TestCategory {
  id: string;
  icon: string;
  name: string;
  color: string;
  bgGradient: string;
}

export const TEST_CATEGORIES: TestCategory[] = [
  {
    id: 'horror',
    icon: '👻',
    name: 'Horror',
    color: '#E74C3C',
    bgGradient: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'
  },
  {
    id: 'mystery',
    icon: '🔎',
    name: 'Mystery',
    color: '#34495E',
    bgGradient: 'linear-gradient(135deg, #34495E 0%, #2C3E50 100%)'
  },
  {
    id: 'occult',
    icon: '🔮',
    name: 'Occult',
    color: '#8E44AD',
    bgGradient: 'linear-gradient(135deg, #8E44AD 0%, #6C3483 100%)'
  },
  {
    id: 'dark_psychology',
    icon: '🧠',
    name: 'Dark Psychology',
    color: '#1A1A2E',
    bgGradient: 'linear-gradient(135deg, #1A1A2E 0%, #0F0F1E 100%)'
  },
];
