import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Format currency
export const formatCurrency = (amount: number | string, currency: string = 'GHS'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${currency} 0.00`;
  return `${currency} ${num.toFixed(2)}`;
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format for Ghana numbers
  if (cleaned.startsWith('233')) {
    const number = cleaned.slice(3);
    if (number.length === 9) {
      return `+233 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
    }
  }
  
  // Default format
  if (cleaned.length === 10) {
    return `+233 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
};

// Validate Ghana phone number
export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  // Ghana phone numbers: 10 digits or 233 + 9 digits
  return cleaned.length === 10 || (cleaned.startsWith('233') && cleaned.length === 12);
};

// Format date
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd MMM yyyy');
};

// Format time
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
};

// Format relative time
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Calculate distance between coordinates
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Format distance
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`;
  }
  return `${km.toFixed(1)}km away`;
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Parse crop names
export const parseCropNames = (input: string): string[] => {
  return input
    .split(',')
    .map(crop => crop.trim())
    .filter(Boolean)
    .map(crop => capitalize(crop));
};

// Validate email
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Get greeting based on time
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Get weather icon based on condition
export const getWeatherIcon = (condition: string): string => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return 'sunny';
  if (lowerCondition.includes('cloud')) return 'cloudy';
  if (lowerCondition.includes('rain')) return 'rainy';
  if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) return 'thunderstorm';
  if (lowerCondition.includes('snow')) return 'snow';
  if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return 'partly-sunny';
  return 'partly-sunny';
};

// Get crop emoji
export const getCropEmoji = (crop: string): string => {
  const cropEmojis: Record<string, string> = {
    maize: '🌽',
    corn: '🌽',
    rice: '🌾',
    wheat: '🌾',
    cassava: '🥔',
    yam: '🍠',
    potato: '🥔',
    tomato: '🍅',
    tomatoes: '🍅',
    pepper: '🌶️',
    onion: '🧅',
    carrot: '🥕',
    cabbage: '🥬',
    plantain: '🍌',
    banana: '🍌',
    mango: '🥭',
    orange: '🍊',
    pineapple: '🍍',
    cocoa: '🍫',
    coffee: '☕',
    groundnut: '🥜',
    peanut: '🥜',
  };
  
  return cropEmojis[crop.toLowerCase()] || '🌱';
};

// Calculate percentage change
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

// Format percentage
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Get trend indicator
export const getTrendIndicator = (change: number): 'up' | 'down' | 'stable' => {
  if (change > 0.5) return 'up';
  if (change < -0.5) return 'down';
  return 'stable';
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Check if development mode
export const isDev = (): boolean => {
  return __DEV__ || process.env.NODE_ENV === 'development';
};

// Safe JSON parse
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

// Group array by key
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const value = String(item[key]);
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Sort array by date
export const sortByDate = <T extends { date: Date | string }>(
  array: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] => {
  return [...array].sort((a, b) => {
    const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
    const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
    
    if (order === 'asc') {
      return dateA.getTime() - dateB.getTime();
    }
    return dateB.getTime() - dateA.getTime();
  });
};

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Check if object is empty
export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

export const ALL_CROPS = [
  'Maize',
  'Cassava',
  'Yam',
  'Plantain',
  'Cocoa',
  'Rice',
  'Tomatoes',
  'Pepper',
  'Okra',
  'Groundnut',
  'Millet',
  'Sorghum',
  'Cowpea',
  'Soybeans',
  'Cotton',
  'Cashew',
  'Oil Palm',
  'Mango',
  'Pineapple',
  'Orange'
];

export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Brong Ahafo',
  'Western North',
  'Ahafo',
  'Bono',
  'Bono East',
  'Oti',
  'North East',
  'Savannah'
];

export const PRODUCT_CATEGORIES = [
  'Grains',
  'Vegetables',
  'Fruits',
  'Tubers',
  'Legumes',
  'Cash Crops',
  'Livestock',
  'Poultry',
  'Fish',
  'Processed Foods'
];

export const UNITS = [
  'kg',
  'bags',
  'crates',
  'boxes',
  'pieces',
  'bunches',
  'tons',
  'liters'
];