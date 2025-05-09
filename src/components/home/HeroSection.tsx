
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: `url('/hero-bg.jpg')`,
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-navy/70"></div>
      </div>
      
      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 text-shadow">
            Luxury Living in <span className="text-gold">Kenya</span>
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Discover exceptional properties in Kenya's most prestigious locations.
            Experience luxury living at its finest.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/properties">
              <Button className="bg-gold text-navy hover:bg-gold/90 text-lg px-8 py-6">
                Explore Properties
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
