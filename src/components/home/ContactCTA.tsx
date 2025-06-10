
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ContactCTA: React.FC = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1537726235470-8504e3beef77?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-thin text-white mb-8 tracking-wide">Begin Your Journey</h2>
          <div className="w-32 h-px bg-gold mx-auto mb-12"></div>
          <p className="text-2xl text-white/90 font-light mb-16 leading-relaxed">
            Connect with our team of luxury property experts to discover your perfect Kenyan property.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-8">
            <Link to="/contact">
              <Button className="bg-gold text-black hover:bg-gold/90 px-12 py-4 font-light tracking-wide transition-all duration-300 hover:scale-105">
                Contact Us
              </Button>
            </Link>
            <Link to="/properties">
              <Button variant="outline" className="border-white border-2 text-white hover:bg-white hover:text-black px-12 py-4 font-light tracking-wide transition-all duration-300">
                Browse Collection
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
