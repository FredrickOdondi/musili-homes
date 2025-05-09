
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { properties } from '@/data/properties';
import { agents } from '@/data/agents';
import { tasks, addTask } from '@/data/tasks';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home, Users, DollarSign, PieChart, LogOut, 
  Plus, Calendar, ListChecks 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Task, Property } from "@/types";
import { useToast } from '@/hooks/use-toast';

const taskSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Pending", "In Progress", "Completed"]),
  dueDate: z.string(),
  agentId: z.number(),
});

const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1000000, "Price must be at least 1,000,000"),
  location: z.string().min(2, "Location is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  bedrooms: z.coerce.number().min(1, "Must have at least 1 bedroom"),
  bathrooms: z.coerce.number().min(1, "Must have at least 1 bathroom"),
  size: z.coerce.number().min(100, "Size must be at least 100 sq ft"),
  status: z.enum(["For Sale", "For Rent", "Sold", "Rented"]),
  agentId: z.number(),
});

const AdminDashboard: React.FC = () => {
  const { isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  
  const taskForm = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: "Pending",
      dueDate: new Date().toISOString().split('T')[0],
      agentId: agents[0]?.id,
    },
  });
  
  const propertyForm = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      location: "",
      address: "",
      bedrooms: 1,
      bathrooms: 1,
      size: 0,
      status: "For Sale",
      agentId: agents[0]?.id,
    },
  });
  
  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);
  
  if (!isAdmin) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleCreateTask = (values: z.infer<typeof taskSchema>) => {
    const newTask = addTask({
      title: values.title,
      description: values.description,
      priority: values.priority as Task["priority"],
      status: values.status as Task["status"],
      dueDate: values.dueDate,
      agentId: values.agentId,
    });
    
    toast({
      title: "Task Created",
      description: `Task "${newTask.title}" has been assigned to ${agents.find(a => a.id === newTask.agentId)?.name}`,
    });
    
    setTaskDialogOpen(false);
    taskForm.reset();
  };
  
  const handleCreateProperty = (values: z.infer<typeof propertySchema>) => {
    // In a real app, this would call an API
    // For now, we'll just show a toast
    toast({
      title: "Property Created",
      description: `New property "${values.title}" has been created and assigned to ${agents.find(a => a.id === values.agentId)?.name}`,
    });
    
    setPropertyDialogOpen(false);
    propertyForm.reset();
  };

  // Calculate dashboard statistics
  const totalProperties = properties.length;
  const totalAgents = agents.length;
  const totalSaleValue = properties.reduce((sum, property) => sum + property.price, 0);
  const averagePropertyValue = totalSaleValue / totalProperties;

  return (
    <div className="min-h-screen bg-offWhite">
      <div className="bg-navy py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
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
            Here's an overview of your real estate portfolio and performance.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold text-navy hover:bg-gold/90">
                <Plus className="mr-2 h-4 w-4" />
                Assign New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Assign New Task to Agent</DialogTitle>
                <DialogDescription>
                  Create a new task and assign it to one of your agents.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...taskForm}>
                <form onSubmit={taskForm.handleSubmit(handleCreateTask)} className="space-y-4 pt-4">
                  <FormField
                    control={taskForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={taskForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter task description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={taskForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={taskForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={taskForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={taskForm.control}
                      name="agentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign To</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select agent" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {agents.map(agent => (
                                <SelectItem key={agent.id} value={agent.id.toString()}>
                                  {agent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setTaskDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Task</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-navy text-white hover:bg-navy/90">
                <Home className="mr-2 h-4 w-4" />
                Add New Property
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
                <DialogDescription>
                  Create a new property listing and assign it to an agent.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...propertyForm}>
                <form onSubmit={propertyForm.handleSubmit(handleCreateProperty)} className="space-y-4 pt-4">
                  <FormField
                    control={propertyForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter property title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={propertyForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter property description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={propertyForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (KES)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={propertyForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Nairobi, Karen..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={propertyForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full address..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={propertyForm.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={propertyForm.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={propertyForm.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size (sq ft)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={propertyForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="For Sale">For Sale</SelectItem>
                              <SelectItem value="For Rent">For Rent</SelectItem>
                              <SelectItem value="Sold">Sold</SelectItem>
                              <SelectItem value="Rented">Rented</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={propertyForm.control}
                      name="agentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign To</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select agent" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {agents.map(agent => (
                                <SelectItem key={agent.id} value={agent.id.toString()}>
                                  {agent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setPropertyDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Property</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
        
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="properties">
              <Home className="mr-1 h-4 w-4" /> Properties
            </TabsTrigger>
            <TabsTrigger value="agents">
              <Users className="mr-1 h-4 w-4" /> Agents
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ListChecks className="mr-1 h-4 w-4" /> Tasks
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy mb-4">Properties</h3>
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
          </TabsContent>
          
          <TabsContent value="agents" className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy mb-4">Agents</h3>
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
          </TabsContent>
          
          <TabsContent value="tasks" className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy mb-4">Tasks</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Priority</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Due Date</th>
                    <th className="py-3 px-4 text-left">Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const agent = agents.find(a => a.id === task.agentId);
                    return (
                      <tr key={task.id} className="border-b">
                        <td className="py-3 px-4">{task.title}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                            task.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{task.dueDate}</td>
                        <td className="py-3 px-4">
                          {agent ? (
                            <div className="flex items-center">
                              <img 
                                src={agent.photo} 
                                alt={agent.name} 
                                className="w-6 h-6 rounded-full mr-2"
                              />
                              {agent.name}
                            </div>
                          ) : 'Unassigned'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
