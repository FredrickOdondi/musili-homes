
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Agent } from '@/types';
import { properties } from '@/data/properties';
import { Property } from '@/types';
import { Card } from '@/components/ui/card';
import { Home, DollarSign, Users, LogOut } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const AgentDashboard: React.FC = () => {
  const { isAgent, user, logout } = useAuth();
  const navigate = useNavigate();
  const [agentProperties, setAgentProperties] = React.useState<Property[]>([]);
  
  // Redirect if not agent
  React.useEffect(() => {
    if (!isAgent) {
      navigate('/login');
    } else {
      // Get properties assigned to this agent
      const agent = user as Agent;
      const assignedProperties = properties.filter(p => agent.properties.includes(p.id));
      setAgentProperties(assignedProperties);
    }
  }, [isAgent, navigate, user]);
  
  if (!isAgent) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Calculate dashboard statistics
  const totalProperties = agentProperties.length;
  const totalValue = agentProperties.reduce((sum, property) => sum + property.price, 0);
  const totalInquiries = Math.floor(Math.random() * 15) + 5; // Simulated data

  return (
    <div className="min-h-screen bg-offWhite">
      <div className="bg-navy py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Agent Dashboard</h1>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-navy mb-4">Welcome back, {user?.name}!</h2>
          <p className="text-charcoal/80">
            Manage your property listings and client inquiries from your personal dashboard.
          </p>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">My Properties</p>
                <h3 className="text-2xl font-bold">{totalProperties}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalValue)} KES</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Client Inquiries</p>
                <h3 className="text-2xl font-bold">{totalInquiries}</h3>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Agent Properties */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-navy mb-4">My Properties</h3>
          
          {agentProperties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Location</th>
                    <th className="py-3 px-4 text-left">Price (KES)</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {agentProperties.map((property) => (
                    <tr key={property.id} className="border-b">
                      <td className="py-3 px-4">{property.title}</td>
                      <td className="py-3 px-4">{property.location}</td>
                      <td className="py-3 px-4">{formatCurrency(property.price)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          property.status === 'For Sale' ? 'bg-green-100 text-green-800' : 
                          property.status === 'For Rent' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{property.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No properties assigned to you yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
