
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import AboutSection from '@/components/home/AboutSection';
import ContactCTA from '@/components/home/ContactCTA';
import Scene3D from '@/components/ui/Scene3D';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedProperties />
      
      <div className="py-20 bg-navy text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Virtual Property Preview</h2>
            <div className="w-24 h-1 bg-gold mx-auto mb-4"></div>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Experience our properties in 3D before scheduling a viewing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Interactive Exploration</h3>
              <p className="text-lg text-white/80 mb-4">
                Our advanced 3D models allow you to explore properties from every angle. 
                Rotate, zoom, and examine architectural details before your visit.
              </p>
              <p className="text-lg text-white/80">
                This technology helps our clients make informed decisions and 
                saves valuable time in the property search process.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg">
              <Scene3D className="h-[400px] rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      
      <AboutSection />
      <ContactCTA />
    </div>
  );
};

export default Index;
