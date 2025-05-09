
import { Agent, Admin, User } from '@/types';

export const agents: Agent[] = [
  {
    id: 1,
    name: "Sarah Kimani",
    email: "sarah@musili.co.ke",
    password: "agent123", // In a real app, this would be hashed
    phone: "+254 712 345 678",
    photo: "/agent1.jpg",
    bio: "Sarah specializes in luxury residential properties in Nairobi and Naivasha.",
    properties: [1, 4],
    role: "agent"
  },
  {
    id: 2,
    name: "David Ochieng",
    email: "david@musili.co.ke",
    password: "agent123",
    phone: "+254 723 456 789",
    photo: "/agent2.jpg",
    bio: "David focuses on high-end apartments and penthouses in Nairobi's upmarket areas.",
    properties: [2, 5],
    role: "agent"
  },
  {
    id: 3,
    name: "Lisa Wanjiku",
    email: "lisa@musili.co.ke",
    password: "agent123",
    phone: "+254 734 567 890",
    photo: "/agent3.jpg",
    bio: "Lisa specializes in exclusive estates and vacation properties.",
    properties: [3, 6],
    role: "agent"
  }
];

export const admins: Admin[] = [
  {
    id: 1,
    name: "John Musili",
    email: "admin@musili.co.ke",
    password: "admin123",
    role: "admin"
  }
];

export const getAllUsers = (): User[] => {
  return [...agents, ...admins];
};

export const getUserByEmail = (email: string): User | undefined => {
  return getAllUsers().find(user => user.email === email);
};

export const authenticate = (email: string, password: string): User | null => {
  const user = getUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};
