
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your admin or agent dashboard
          </p>
        </div>
        <div className="bg-white p-8 shadow-md rounded-lg">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
