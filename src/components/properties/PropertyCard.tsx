
import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Bed, Bath, Maximize2, MapPin } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <Link 
      to={`/property/${property.id}`}
      className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 property-card"
    >
      <div className="relative h-64">
        <img 
          src={property.images[0]} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-gold text-navy px-3 py-1 rounded">
          {property.status}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-navy mb-1 font-playfair">{property.title}</h3>
        
        <div className="flex items-center text-gray-500 mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>
        
        <p className="text-xl font-bold text-gold mb-4">
          {formatCurrency(property.price)} KES
        </p>
        
        <div className="border-t pt-4">
          <div className="flex justify-between text-charcoal/70">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center">
              <Maximize2 className="h-4 w-4 mr-1" />
              <span>{property.size} sqft</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
