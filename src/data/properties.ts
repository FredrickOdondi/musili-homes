
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
    images: ["/property1-main.jpg", "/property1-2.jpg", "/property1-3.jpg"],
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
    images: ["/property2-main.jpg", "/property2-2.jpg", "/property2-3.jpg"],
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
    images: ["/property3-main.jpg", "/property3-2.jpg", "/property3-3.jpg"],
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
