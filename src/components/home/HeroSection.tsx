
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 scale-105" 
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>
      </div>
      
      <div className="container mx-auto px-6 z-10 relative text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-thin text-white mb-8 tracking-wider">
            Luxury Living
          </h1>
          <div className="w-32 h-px bg-gold mx-auto mb-8"></div>
          <p className="text-xl md:text-2xl text-white/90 mb-12 font-light leading-relaxed max-w-2xl mx-auto">
            Discover exceptional properties in Kenya's most prestigious locations
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/properties">
              <Button className="bg-white text-black hover:bg-white/90 text-lg px-12 py-4 font-light tracking-wide transition-all duration-300 hover:scale-105">
                Explore Collection
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-white border-2 text-white hover:bg-white hover:text-black text-lg px-12 py-4 font-light tracking-wide transition-all duration-300">
                Contact
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="w-px h-16 bg-white/50 animate-pulse"></div>
      </div>
    </section>
  );
};

export default HeroSection;
