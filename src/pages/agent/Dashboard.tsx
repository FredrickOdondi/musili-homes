
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Agent } from '@/types';
import { properties } from '@/data/properties';
import { Property } from '@/types';
import { tasks, getTasksByAgentId, updateTaskStatus } from '@/data/tasks';
import { Card } from '@/components/ui/card';
import { Home, DollarSign, Users, LogOut, CheckCircle, MessageSquare } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import MessagePanel from '@/components/messaging/MessagePanel';
import ThemeToggle from '@/components/ThemeToggle';

const AgentDashboard: React.FC = () => {
  const { isAgent, user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agentProperties, setAgentProperties] = React.useState<Property[]>([]);
  const [agentTasks, setAgentTasks] = React.useState<typeof tasks>([]);
  
  // Redirect if not agent
  React.useEffect(() => {
    if (!isAgent) {
      navigate('/login');
    } else {
      // Get properties and tasks assigned to this agent
      const agent = user as Agent;
      const assignedProperties = properties.filter(p => agent.properties.includes(p.id));
      setAgentProperties(assignedProperties);
      
      const assignedTasks = getTasksByAgentId(agent.id);
      setAgentTasks(assignedTasks);
    }
  }, [isAgent, navigate, user]);
  
  if (!isAgent || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleCompleteTask = (taskId: number) => {
    const updatedTask = updateTaskStatus(taskId, 'Completed');
    if (updatedTask) {
      setAgentTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t)
      );
      toast({
        title: "Task Updated",
        description: `Task "${updatedTask.title}" has been marked as completed.`,
      });
    }
  };

  // Calculate dashboard statistics
  const totalProperties = agentProperties.length;
  const totalValue = agentProperties.reduce((sum, property) => sum + property.price, 0);
  const totalInquiries = Math.floor(Math.random() * 15) + 5; // Simulated data
  const pendingTasks = agentTasks.filter(t => t.status !== 'Completed').length;
  
  // Admin user for messaging
  const adminUser = {
    id: 1,
    name: "John Musili",
    role: "admin" as const
  };

  return (
    <div className="min-h-screen bg-offWhite dark:bg-gray-900">
      <div className="bg-navy py-6 dark:bg-gray-800">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Agent Dashboard</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
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
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-navy dark:text-white mb-4">Welcome back, {user?.name}!</h2>
          <p className="text-charcoal/80 dark:text-gray-300">
            Manage your property listings and client inquiries from your personal dashboard.
          </p>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 dark:bg-gray-800 dark:text-white">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                <Home className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">My Properties</p>
                <h3 className="text-2xl font-bold">{totalProperties}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 dark:bg-gray-800 dark:text-white">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalValue)} KES</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 dark:bg-gray-800 dark:text-white">
            <div className="flex items-center">
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Client Inquiries</p>
                <h3 className="text-2xl font-bold">{totalInquiries}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 dark:bg-gray-800 dark:text-white">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Tasks</p>
                <h3 className="text-2xl font-bold">{pendingTasks}</h3>
              </div>
            </div>
          </Card>
        </div>
        
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-4">My Properties</h3>
            
            {agentProperties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="py-3 px-4 text-left dark:text-white">Title</th>
                      <th className="py-3 px-4 text-left dark:text-white">Location</th>
                      <th className="py-3 px-4 text-left dark:text-white">Price (KES)</th>
                      <th className="py-3 px-4 text-left dark:text-white">Status</th>
                      <th className="py-3 px-4 text-left dark:text-white">Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentProperties.map((property) => (
                      <tr key={property.id} className="border-b dark:border-gray-700">
                        <td className="py-3 px-4 dark:text-white">{property.title}</td>
                        <td className="py-3 px-4 dark:text-white">{property.location}</td>
                        <td className="py-3 px-4 dark:text-white">{formatCurrency(property.price)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            property.status === 'For Sale' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                            property.status === 'For Rent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {property.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 dark:text-white">{property.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No properties assigned to you yet.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tasks" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-4">My Tasks</h3>
            
            {agentTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="py-3 px-4 text-left dark:text-white">Title</th>
                      <th className="py-3 px-4 text-left dark:text-white">Description</th>
                      <th className="py-3 px-4 text-left dark:text-white">Priority</th>
                      <th className="py-3 px-4 text-left dark:text-white">Status</th>
                      <th className="py-3 px-4 text-left dark:text-white">Due Date</th>
                      <th className="py-3 px-4 text-left dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentTasks.map((task) => (
                      <tr key={task.id} className="border-b dark:border-gray-700">
                        <td className="py-3 px-4 dark:text-white">{task.title}</td>
                        <td className="py-3 px-4 dark:text-white">{task.description}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            task.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                            task.priority === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 dark:text-white">{task.dueDate}</td>
                        <td className="py-3 px-4">
                          {task.status !== 'Completed' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/30"
                              onClick={() => handleCompleteTask(task.id)}
                            >
                              Mark Complete
                            </Button>
                          ) : (
                            <span className="text-green-600 dark:text-green-400 font-medium">✓ Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No tasks assigned to you yet.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="messages" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-4">Messages</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Card className="p-4 dark:bg-gray-700">
                  <h4 className="font-bold text-lg mb-3 dark:text-white">Contacts</h4>
                  <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-600 rounded-lg cursor-pointer">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">Admin</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">John Musili</p>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="lg:col-span-3">
                <MessagePanel 
                  currentUser={{ id: user.id, name: user.name, role: 'agent' }}
                  recipient={adminUser}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentDashboard;
