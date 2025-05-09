
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl font-bold text-navy mb-4">About Musili Homes</h2>
            <div className="w-20 h-1 bg-gold mb-6"></div>
            <p className="text-lg text-charcoal/80 mb-6">
              At Musili Homes, we are dedicated to providing an exceptional real estate experience for our clients. 
              Our mission is to connect discerning buyers with Kenya's most prestigious properties.
            </p>
            <p className="text-lg text-charcoal/80 mb-6">
              With decades of combined experience in the luxury real estate market, our team of professionals 
              understands the unique requirements of high-net-worth individuals seeking exceptional properties.
            </p>
            <p className="text-lg text-charcoal/80 mb-8">
              Whether you're looking to buy, sell, or invest in premium real estate across Kenya, 
              Musili Homes offers unparalleled expertise and personalized service.
            </p>
            <Link to="/contact">
              <Button className="bg-navy text-white hover:bg-navy/90">
                Contact Our Team
              </Button>
            </Link>
          </div>
          
          <div className="order-1 lg:order-2 relative">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80" 
                alt="Musili Homes Team" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-gold text-navy p-6 rounded-lg shadow-xl">
              <p className="text-4xl font-bold">15+</p>
              <p className="text-xl">Years of Excellence</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
