export interface User {
  id: string;
  username: string;
  email: string;
  profile_pic: string;
  bio: string;
  travel_style: string;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  companions: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  trip_id: string;
  country: string;
  city: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  facts: string;
  food: string;
  visit_date: string | null;
  created_at: string;
}

export interface Media {
  id: string;
  trip_id: string;
  user_id: string;
  file_url: string;
  file_type: string;
  caption: string;
  upload_date: string;
  likes_count: number;
}

export interface Comment {
  id: string;
  media_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  country: string;
  city: string;
  notes: string;
  priority: number;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  trip_id: string;
  user_id: string;
  entry_date: string;
  title: string;
  content: string;
  mood: string;
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  user_id: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  expense_date: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserStats {
  trips_count: number;
  countries_visited: number;
  followers_count: number;
  following_count: number;
}
