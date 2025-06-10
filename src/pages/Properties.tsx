
import React, { useState, useEffect } from 'react';
import PropertyGrid from '@/components/properties/PropertyGrid';
import PropertySearch from '@/components/properties/PropertySearch';
import { properties } from '@/data/properties';
import { Property } from '@/types';

const Properties: React.FC = () => {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [searchParams, setSearchParams] = useState({
    location: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    bedrooms: undefined as number | undefined
  });
  
  const handleSearch = (params: any) => {
    setSearchParams(params);
  };
  
  useEffect(() => {
    // Filter properties based on search parameters
    const filtered = properties.filter(property => {
      // Filter by location
      if (searchParams.location && !property.location.toLowerCase().includes(searchParams.location.toLowerCase())) {
        return false;
      }
      
      // Filter by min price
      if (searchParams.minPrice && property.price < searchParams.minPrice) {
        return false;
      }
      
      // Filter by max price
      if (searchParams.maxPrice && property.price > searchParams.maxPrice) {
        return false;
      }
      
      // Filter by bedrooms
      if (searchParams.bedrooms && property.bedrooms < searchParams.bedrooms) {
        return false;
      }
      
      return true;
    });
    
    setFilteredProperties(filtered);
  }, [searchParams]);
  
  return (
    <div className="min-h-screen bg-pure-white">
      <div className="bg-deep-charcoal py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-thin text-pure-white mb-2 luxury-heading">Luxury Properties</h1>
            <p className="text-xl text-pure-white/80 font-light">Discover Kenya's finest real estate offerings</p>
          </div>
          <PropertySearch onSearch={handleSearch} />
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-thin text-deep-charcoal luxury-heading">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
          </h2>
        </div>
        
        {filteredProperties.length > 0 ? (
          <PropertyGrid properties={filteredProperties} />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-light text-deep-charcoal">No properties match your search criteria.</h3>
            <p className="mt-2 text-deep-charcoal/70">Try adjusting your filters for more results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
