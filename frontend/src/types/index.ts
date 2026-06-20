export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Activity {
  _id?: string;
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
}

export interface ItineraryDay {
  _id?: string;
  dayNumber: number;
  theme: string;
  activities: Activity[];
}

export interface Hotel {
  _id?: string;
  name: string;
  tier: 'Budget' | 'Mid-Range' | 'Luxury';
  estimatedCostNightUSD: number;
  rating: string;
  highlights: string;
  location: string;
}

export interface PackingItem {
  _id?: string;
  item: string;
  category: 'Documents' | 'Clothing' | 'Gear' | 'Toiletries' | 'Other';
  isPacked: boolean;
  essential: boolean;
}

export interface EstimatedBudget {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  miscellaneous: number;
  total: number;
}

export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  startDate?: string;
  itinerary: ItineraryDay[];
  hotels: Hotel[];
  estimatedBudget: EstimatedBudget;
  packingList: PackingItem[];
  travelTips: string[];
  weatherSummary: string;
  status: 'generating' | 'ready' | 'error';
  createdAt: string;
}

export interface TripSummary {
  _id: string;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  estimatedBudget: EstimatedBudget;
  status: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
