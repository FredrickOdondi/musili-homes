
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <span className="text-2xl font-thin tracking-wider text-black">
            MUSILI <span className="text-gold">HOMES</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-12">
          <Link to="/" className="text-black hover:text-gold transition-colors font-light tracking-wide">Home</Link>
          <Link to="/properties" className="text-black hover:text-gold transition-colors font-light tracking-wide">Properties</Link>
          <Link to="/contact" className="text-black hover:text-gold transition-colors font-light tracking-wide">Contact</Link>
          
          <div className="flex items-center space-x-6">
            <ThemeToggle />
            
            <Link to="/login">
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white font-light tracking-wide transition-all duration-300">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle />
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black hover:text-gold"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="container mx-auto px-6 py-6 flex flex-col space-y-6">
            <Link 
              to="/" 
              className="text-black hover:text-gold transition-colors font-light tracking-wide"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/properties" 
              className="text-black hover:text-gold transition-colors font-light tracking-wide"
              onClick={() => setIsMenuOpen(false)}
            >
              Properties
            </Link>
            <Link 
              to="/contact" 
              className="text-black hover:text-gold transition-colors font-light tracking-wide"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            <Link 
              to="/login"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button variant="outline" className="w-full border-black text-black hover:bg-black hover:text-white font-light tracking-wide">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
