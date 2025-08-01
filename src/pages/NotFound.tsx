
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-ivory">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-deep-charcoal luxury-heading">404</h1>
        <p className="text-xl text-deep-charcoal mb-4 luxury-text">Oops! Page not found</p>
        <a href="/" className="text-gold-whisper hover:text-gold-whisper/80 underline font-medium">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
