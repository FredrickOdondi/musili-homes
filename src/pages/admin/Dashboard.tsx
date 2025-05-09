
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { properties } from '@/data/properties';
import { agents } from '@/data/agents';
import { Card } from '@/components/ui/card';
import { Home, Users, DollarSign, PieChart } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);
  
  if (!isAdmin) {
    return null;
  }

  // Calculate dashboard statistics
  const totalProperties = properties.length;
  const totalAgents = agents.length;
  const totalSaleValue = properties.reduce((sum, property) => sum + property.price, 0);
  const averagePropertyValue = totalSaleValue / totalProperties;

  return (
    <div className="min-h-screen bg-offWhite">
      <div className="bg-navy py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-navy mb-4">Welcome back, {user?.name}!</h2>
          <p className="text-charcoal/80">
            Here's an overview of your real estate portfolio and performance.
          </p>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <h3 className="text-2xl font-bold">{totalProperties}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Agents</p>
                <h3 className="text-2xl font-bold">{totalAgents}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Portfolio Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalSaleValue)} KES</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Property Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(averagePropertyValue)} KES</h3>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-navy mb-4">Recent Properties</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Location</th>
                  <th className="py-3 px-4 text-left">Price (KES)</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Agent</th>
                </tr>
              </thead>
              <tbody>
                {properties.slice(0, 5).map((property) => {
                  const propertyAgent = agents.find(agent => agent.id === property.agentId);
                  return (
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
                      <td className="py-3 px-4">{propertyAgent?.name || 'Unassigned'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Agent List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-navy mb-4">Agent Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left">Agent</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Phone</th>
                  <th className="py-3 px-4 text-left">Properties</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <img 
                          src={agent.photo} 
                          alt={agent.name} 
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        {agent.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">{agent.email}</td>
                    <td className="py-3 px-4">{agent.phone}</td>
                    <td className="py-3 px-4">{agent.properties.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
