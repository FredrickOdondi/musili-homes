
import { Property } from '@/types';

export const properties: Property[] = [
  {
    id: 1,
    title: "Luxurious Lakefront Villa",
    description: "Experience unparalleled luxury in this stunning lakefront villa with panoramic views of Lake Naivasha. This architectural masterpiece features soaring ceilings, floor-to-ceiling windows, and exquisite finishes throughout.",
    price: 250000000, // 250 million KES
    location: "Naivasha",
    address: "Lake View Estate, Moi South Lake Road, Naivasha",
    bedrooms: 6,
    bathrooms: 7,
    size: 8500,
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80", 
             "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80", 
             "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80"],
    featured: true,
    status: "For Sale",
    createdAt: "2024-02-15",
    agentId: 1
  },
  {
    id: 2,
    title: "Modern Penthouse in Westlands",
    description: "Elevate your lifestyle with this sophisticated penthouse featuring breathtaking views of the Nairobi skyline.",
    price: 120000000, // 120 million KES
    location: "Nairobi",
    address: "Westlands Towers, Waiyaki Way, Westlands",
    bedrooms: 4,
    bathrooms: 4.5,
    size: 3800,
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80", 
             "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80", 
             "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80"],
    featured: true,
    status: "For Sale",
    createdAt: "2024-03-05",
    agentId: 2
  },
  {
    id: 3,
    title: "Elegant Colonial Estate in Karen",
    description: "This magnificent colonial estate sits on 2.5 acres of prime land in Karen.",
    price: 350000000, // 350 million KES
    location: "Nairobi",
    address: "Karen Country Club Road, Karen",
    bedrooms: 7,
    bathrooms: 8,
    size: 12000,
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80", 
             "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80", 
             "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80"],
    featured: true,
    status: "For Sale",
    createdAt: "2024-01-20",
    agentId: 3
  }
];

export const getPropertyById = (id: number) => {
  return properties.find(property => property.id === id);
};

export const getFeaturedProperties = () => {
  return properties.filter(property => property.featured);
};
