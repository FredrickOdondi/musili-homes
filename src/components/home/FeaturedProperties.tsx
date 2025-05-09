
import React from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProperties } from '@/data/properties';
import PropertyCard from '@/components/properties/PropertyCard';

const FeaturedProperties: React.FC = () => {
  const featuredProperties = getFeaturedProperties();

  return (
    <section className="py-20 bg-offWhite">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-navy mb-2">Featured Properties</h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-4"></div>
          <p className="text-lg text-charcoal/70 max-w-2xl mx-auto">
            Discover our handpicked selection of Kenya's most exceptional properties.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            to="/properties"
            className="inline-block border-2 border-gold text-navy hover:bg-gold hover:text-white transition-colors px-8 py-3 font-medium"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
