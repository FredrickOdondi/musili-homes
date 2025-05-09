
export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size: number; // in sq ft
  images: string[];
  featured: boolean;
  status: 'For Sale' | 'For Rent' | 'Sold' | 'Rented';
  createdAt: string;
  agentId: number;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  password: string; // In a real app, this would never be exposed to the frontend
  phone: string;
  photo: string;
  bio: string;
  properties: number[]; // Property IDs assigned to this agent
  role: 'agent';
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  password: string; // In a real app, this would never be exposed to the frontend
  role: 'admin';
}

export type User = Agent | Admin;

export interface LoginCredentials {
  email: string;
  password: string;
}
