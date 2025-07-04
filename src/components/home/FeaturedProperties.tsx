
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProperties } from '@/data/properties';
import PropertyCard from '@/components/properties/PropertyCard';
import { Property } from '@/types';

const FeaturedProperties: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      setLoading(true);
      const properties = await getFeaturedProperties();
      setFeaturedProperties(properties);
      setLoading(false);
    };

    fetchFeaturedProperties();
  }, []);

  if (loading) {
    return (
      <section className="py-32 bg-pure-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="text-deep-charcoal">Loading featured properties...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 bg-pure-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-thin luxury-heading mb-6 tracking-wide">Featured Collection</h2>
          <div className="w-24 h-px bg-gold-whisper mx-auto mb-8"></div>
          <p className="text-xl luxury-text max-w-2xl mx-auto leading-relaxed">
            Handpicked selections from Kenya's most exceptional properties
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        
        <div className="text-center mt-20">
          <Link 
            to="/properties"
            className="inline-block luxury-button-secondary px-12 py-4 font-light tracking-wide"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
