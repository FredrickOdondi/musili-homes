import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPropertyById, getAgentById } from '@/services/database';
import { formatCurrency } from '@/lib/utils';
import { Property, Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Maximize2, MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ContactAgentForm from '@/components/properties/ContactAgentForm';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setLoading(true);
        const propertyData = await getPropertyById(parseInt(id, 10));
        if (propertyData) {
          setProperty(propertyData);
          setActiveImage(propertyData.images[0]);
          
          // Find agent
          const propertyAgent = await getAgentById(propertyData.agentId);
          if (propertyAgent) {
            setAgent(propertyAgent);
          }
        }
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-deep-charcoal">Loading property details...</div>
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
        <p className="mb-8">The property you're looking for doesn't exist or has been removed.</p>
        <Link to="/properties">
          <Button>Back to Properties</Button>
        </Link>
      </div>
    );
  }
  
  const handleContactAgent = () => {
    setShowContactForm(true);
  };

  const handleRequestViewing = () => {
    setShowContactForm(true);
  };

  return (
    <div className="min-h-screen bg-offWhite dark:bg-gray-900 pb-12">
      <div className="bg-navy py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{property.title}</h1>
              <div className="flex items-center text-white/80">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.address}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="block text-2xl font-bold text-gold">{formatCurrency(property.price)} KES</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Main image */}
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md mb-4">
              <div className="aspect-video rounded overflow-hidden">
                <img 
                  src={activeImage} 
                  alt={property.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Thumbnail gallery */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {property.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`aspect-video rounded overflow-hidden cursor-pointer border-2 ${
                    activeImage === image ? 'border-gold' : 'border-transparent'
                  }`}
                  onClick={() => setActiveImage(image)}
                >
                  <img 
                    src={image} 
                    alt={`${property.title} - View ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            {/* Property details */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold text-navy mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col items-center p-4 bg-offWhite dark:bg-gray-700 rounded-lg">
                  <Bed className="h-6 w-6 text-gold mb-2" />
                  <span className="text-sm text-charcoal/70 dark:text-gray-300">Bedrooms</span>
                  <span className="text-xl font-bold text-navy">{property.bedrooms}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-offWhite dark:bg-gray-700 rounded-lg">
                  <Bath className="h-6 w-6 text-gold mb-2" />
                  <span className="text-sm text-charcoal/70 dark:text-gray-300">Bathrooms</span>
                  <span className="text-xl font-bold text-navy">{property.bathrooms}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-offWhite dark:bg-gray-700 rounded-lg">
                  <Maximize2 className="h-6 w-6 text-gold mb-2" />
                  <span className="text-sm text-charcoal/70 dark:text-gray-300">Area</span>
                  <span className="text-xl font-bold text-navy">{property.size} sqft</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-offWhite dark:bg-gray-700 rounded-lg">
                  <MapPin className="h-6 w-6 text-gold mb-2" />
                  <span className="text-sm text-charcoal/70 dark:text-gray-300">Location</span>
                  <span className="text-xl font-bold text-navy">{property.location}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-navy mb-2">Description</h3>
              <p className="text-charcoal/80 dark:text-gray-300 mb-6">
                {property.description}
              </p>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Agent info */}
            {agent && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-bold text-navy mb-4">Property Agent</h3>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 text-xl font-bold overflow-hidden mr-4">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy dark:text-white">{agent.name}</h4>
                    <p className="text-sm text-charcoal/70 dark:text-gray-300">Luxury Property Specialist</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gold" />
                    <span className="text-sm dark:text-gray-300">{agent.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gold" />
                    <span className="text-sm dark:text-gray-300">{agent.email}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleContactAgent}
                  className="w-full bg-gold text-navy hover:bg-gold/90"
                >
                  Contact Agent
                </Button>
              </div>
            )}
            
            {/* Request viewing */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-navy dark:text-white mb-4">Schedule a Viewing</h3>
              <p className="text-charcoal/80 dark:text-gray-300 mb-4">
                Interested in this property? Schedule a viewing at your convenience.
              </p>
              <Button 
                onClick={handleRequestViewing}
                className="w-full bg-navy text-white hover:bg-navy/90"
              >
                Request Viewing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Agent Form Dialog */}
      {property && (
        <ContactAgentForm
          agent={agent}
          property={property}
          isOpen={showContactForm}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  );
};

export default PropertyDetail;
