import { Property } from '@/types';
import { getProperties, getPropertyById, getFeaturedProperties } from '@/services/database';

// Export async functions that fetch from database
export const properties = await getProperties();

export const getPropertyById_new = getPropertyById;

export const getFeaturedProperties_new = getFeaturedProperties;

// Keep the original function names for backward compatibility
export { getPropertyById, getFeaturedProperties };
