import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Agent, Task } from '@/types';
import { properties } from '@/data/properties';
import { Property } from '@/types';
import { getTasksByAgentId, updateTaskStatus } from '@/data/tasks';
import { Card } from '@/components/ui/card';
import { Home, DollarSign, Users, LogOut, CheckCircle, MessageSquare } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import MessagePanel from '@/components/messaging/MessagePanel';
import ClientList from '@/components/messaging/ClientList';

const AgentDashboard: React.FC = () => {
  const { isAgent, user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [agentTasks, setAgentTasks] = useState<Task[]>([]);
  const [activeContact, setActiveContact] = useState<{id: number; name: string; role: 'admin' | 'client'}>({
    id: 1, 
    name: "John Musili", 
    role: "admin"
  });
  
  // Redirect if not agent
  useEffect(() => {
    if (!isAgent) {
      navigate('/login');
    } else {
      // Get properties and tasks assigned to this agent
      const agent = user as Agent;
      const assignedProperties = properties.filter(p => agent.properties.includes(p.id));
      setAgentProperties(assignedProperties);
      
      // Fetch tasks for this agent
      const fetchTasks = async () => {
        const tasks = await getTasksByAgentId(agent.id);
        setAgentTasks(tasks);
      };
      fetchTasks();
    }
  }, [isAgent, navigate, user]);
  
  if (!isAgent || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleCompleteTask = async (taskId: number) => {
    const updatedTask = await updateTaskStatus(taskId, 'Completed');
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

  const handleSelectClient = (clientId: number, clientName: string) => {
    setActiveContact({
      id: clientId,
      name: clientName,
      role: "client"
    });
  };

  const handleSelectAdmin = () => {
    setActiveContact({
      id: 1,
      name: "John Musili",
      role: "admin"
    });
  };

  // Calculate dashboard statistics
  const totalProperties = agentProperties.length;
  const totalValue = agentProperties.reduce((sum, property) => sum + property.price, 0);
  const totalInquiries = Math.floor(Math.random() * 15) + 5; // Simulated data
  const pendingTasks = agentTasks.filter(t => t.status !== 'Completed').length;
  
  return (
    <div className="min-h-screen bg-soft-ivory">
      <div className="bg-deep-charcoal py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-pure-white">Agent Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-pure-white text-pure-white hover:bg-pure-white hover:text-deep-charcoal transition-colors"
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
          <h2 className="text-xl font-bold text-deep-charcoal mb-4">Welcome back, {user?.name}!</h2>
          <p className="text-deep-charcoal/80">
            Manage your property listings and client inquiries from your personal dashboard.
          </p>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 luxury-card">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-deep-charcoal/70">My Properties</p>
                <h3 className="text-2xl font-bold text-deep-charcoal">{totalProperties}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 luxury-card">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-deep-charcoal/70">Total Value</p>
                <h3 className="text-2xl font-bold text-deep-charcoal">{formatCurrency(totalValue)} KES</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 luxury-card">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-deep-charcoal/70">Client Inquiries</p>
                <h3 className="text-2xl font-bold text-deep-charcoal">{totalInquiries}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 luxury-card">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-deep-charcoal/70">Pending Tasks</p>
                <h3 className="text-2xl font-bold text-deep-charcoal">{pendingTasks}</h3>
              </div>
            </div>
          </Card>
        </div>
        
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-4 bg-pure-white border border-satin-silver">
            <TabsTrigger value="properties" className="text-deep-charcoal data-[state=active]:bg-gold-whisper data-[state=active]:text-pure-white">Properties</TabsTrigger>
            <TabsTrigger value="tasks" className="text-deep-charcoal data-[state=active]:bg-gold-whisper data-[state=active]:text-pure-white">My Tasks</TabsTrigger>
            <TabsTrigger value="messages" className="text-deep-charcoal data-[state=active]:bg-gold-whisper data-[state=active]:text-pure-white">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="luxury-card rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-deep-charcoal mb-4">My Properties</h3>
            
            {agentProperties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-soft-ivory">
                      <th className="py-3 px-4 text-left text-deep-charcoal font-semibold">Title</th>
                      <th className="py-3 px-4 text-left text-deep-charcoal font-semibold">Location</th>
                      <th className="py-3 px-4 text-left text-deep-charcoal font-semibold">Price (KES)</th>
                      <th className="py-3 px-4 text-left text-deep-charcoal font-semibold">Status</th>
                      <th className="py-3 px-4 text-left text-deep-charcoal font-semibold">Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentProperties.map((property) => (
                      <tr key={property.id} className="border-b border-satin-silver">
                        <td className="py-3 px-4 text-deep-charcoal">{property.title}</td>
                        <td className="py-3 px-4 text-deep-charcoal">{property.location}</td>
                        <td className="py-3 px-4 text-deep-charcoal font-medium">{formatCurrency(property.price)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            property.status === 'For Sale' ? 'bg-green-100 text-green-800' : 
                            property.status === 'For Rent' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {property.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-deep-charcoal">{property.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-deep-charcoal/70">No properties assigned to you yet.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tasks" className="luxury-card rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-deep-charcoal mb-4">My Tasks</h3>
            
            {agentTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-soft-ivory">
                      <th className="py-3 px-4 text-left text-deep-charcoal font-semibold">Title</th>
                      <th className="py-3 px-4 text-left text-deep-charcoal font-semibold">Description</th>
                      <th className="py-3 px-4 text-left text-deep-charcoal font-semibold">Priority</th>
                      <th className="py-3 px-4 text-left text-deep-charcoal font-semibold">Status</th>
                      <th className="py-3 px-4 text-left text-deep-charcoal font-semibold">Due Date</th>
                      <th className="py-3 px-4 text-left text-deep-charcoal font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentTasks.map((task) => (
                      <tr key={task.id} className="border-b border-satin-silver">
                        <td className="py-3 px-4 text-deep-charcoal font-medium">{task.title}</td>
                        <td className="py-3 px-4 text-deep-charcoal">{task.description}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                            task.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-deep-charcoal">{task.dueDate}</td>
                        <td className="py-3 px-4">
                          {task.status !== 'Completed' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 font-medium"
                              onClick={() => handleCompleteTask(task.id)}
                            >
                              Mark Complete
                            </Button>
                          ) : (
                            <span className="text-green-600 font-medium">✓ Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-deep-charcoal/70">No tasks assigned to you yet.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="messages" className="luxury-card rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-deep-charcoal mb-4">Messages</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                {/* Admin contact */}
                <div 
                  className={`flex items-center gap-3 p-2 ${
                    activeContact.role === 'admin' 
                    ? 'bg-blue-100' 
                    : 'bg-soft-ivory'
                  } rounded-lg cursor-pointer transition-colors`}
                  onClick={handleSelectAdmin}
                >
                  <div className="bg-blue-100 p-2 rounded-full">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-deep-charcoal">Admin</p>
                    <p className="text-xs text-deep-charcoal/70">John Musili</p>
                  </div>
                </div>
                
                {/* Client list */}
                <ClientList 
                  agentId={user.id} 
                  onSelectClient={handleSelectClient} 
                />
              </div>
              
              <div className="lg:col-span-3">
                <MessagePanel 
                  currentUser={{ id: user.id, name: user.name, role: 'agent' }}
                  recipient={
                    activeContact.role === 'admin'
                      ? { id: activeContact.id, name: activeContact.name, role: 'admin' }
                      : { id: activeContact.id, name: activeContact.name, role: 'agent' }
                  }
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
