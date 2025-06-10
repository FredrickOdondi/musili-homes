
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { isAuthenticated, isAdmin, isAgent } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else if (isAgent) {
        navigate('/agent/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isAgent, navigate]);
  
  return (
    <div className="min-h-screen bg-soft-ivory flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-thin text-deep-charcoal luxury-heading">Sign in to your account</h2>
          <p className="mt-2 text-sm text-deep-charcoal/70 luxury-text">
            Access your admin or agent dashboard
          </p>
        </div>
        <div className="bg-pure-white p-8 shadow-md rounded-lg border border-satin-silver">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
