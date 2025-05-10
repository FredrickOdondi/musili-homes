
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
  Plus, Calendar, ListChecks, MessageSquare, Upload
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
import MessagePanel from '@/components/messaging/MessagePanel';
import ThemeToggle from '@/components/ThemeToggle';

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
  images: z.array(z.string()).optional(),
});

const AdminDashboard: React.FC = () => {
  const { isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
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
      images: [],
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
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real application, we would upload these files to a server
    // For this demo, we'll create object URLs for the selected files
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setUploadedImages([...uploadedImages, ...newImages]);
    
    // Update the form with the new image URLs
    propertyForm.setValue('images', [...uploadedImages, ...newImages]);
    
    toast({
      title: "Images Uploaded",
      description: `${files.length} image(s) uploaded successfully.`,
    });
  };
  
  const handleCreateProperty = (values: z.infer<typeof propertySchema>) => {
    // In a real app, this would call an API
    const newProperty = {
      ...values,
      images: uploadedImages,
      id: properties.length + 1,
    };
    
    toast({
      title: "Property Created",
      description: `New property "${values.title}" has been created and assigned to ${agents.find(a => a.id === values.agentId)?.name}`,
    });
    
    // Reset form and uploaded images
    setPropertyDialogOpen(false);
    setUploadedImages([]);
    propertyForm.reset();
  };

  // Calculate dashboard statistics
  const totalProperties = properties.length;
  const totalAgents = agents.length;
  const totalSaleValue = properties.reduce((sum, property) => sum + property.price, 0);
  const averagePropertyValue = totalSaleValue / totalProperties;

  return (
    <div className="min-h-screen bg-offWhite dark:bg-gray-900">
      <div className="bg-navy py-6 dark:bg-gray-800">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
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
          <p className="text-gray-700 dark:text-gray-300">
            Here's an overview of your real estate portfolio and performance.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold text-navy hover:bg-gold/90 dark:text-gray-800">
                <Plus className="mr-2 h-4 w-4" />
                Assign New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle>Assign New Task to Agent</DialogTitle>
                <DialogDescription className="dark:text-gray-300">
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
                        <FormLabel className="dark:text-white">Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title..." {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
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
                        <FormLabel className="dark:text-white">Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter task description..." {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
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
                          <FormLabel className="dark:text-white">Priority</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="dark:bg-gray-800 dark:text-white">
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
                          <FormLabel className="dark:text-white">Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="dark:bg-gray-800 dark:text-white">
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
                          <FormLabel className="dark:text-white">Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
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
                          <FormLabel className="dark:text-white">Assign To</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                <SelectValue placeholder="Select agent" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="dark:bg-gray-800 dark:text-white">
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
                    <Button type="button" variant="outline" onClick={() => setTaskDialogOpen(false)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      Cancel
                    </Button>
                    <Button type="submit" className="dark:bg-blue-600 dark:text-white">Create Task</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-navy text-white hover:bg-navy/90 dark:bg-blue-600">
                <Home className="mr-2 h-4 w-4" />
                Add New Property
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
                <DialogDescription className="dark:text-gray-300">
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
                        <FormLabel className="dark:text-white">Property Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter property title..." {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
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
                        <FormLabel className="dark:text-white">Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter property description..." {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
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
                          <FormLabel className="dark:text-white">Price (KES)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
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
                          <FormLabel className="dark:text-white">Location</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Nairobi, Karen..." {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
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
                        <FormLabel className="dark:text-white">Full Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full address..." {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
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
                          <FormLabel className="dark:text-white">Bedrooms</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
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
                          <FormLabel className="dark:text-white">Bathrooms</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
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
                          <FormLabel className="dark:text-white">Size (sq ft)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Image Upload Section */}
                  <FormItem>
                    <FormLabel className="dark:text-white">Property Images</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="property-images" 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleImageUpload} 
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('property-images')?.click()}
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    {uploadedImages.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="relative w-16 h-16 border rounded overflow-hidden">
                            <img src={img} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={propertyForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-white">Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="dark:bg-gray-800 dark:text-white">
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
                          <FormLabel className="dark:text-white">Assign To</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                <SelectValue placeholder="Select agent" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="dark:bg-gray-800 dark:text-white">
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
                    <Button type="button" variant="outline" onClick={() => setPropertyDialogOpen(false)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      Cancel
                    </Button>
                    <Button type="submit" className="dark:bg-blue-600 dark:text-white">Create Property</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 dark:bg-gray-800 dark:text-white">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                <Home className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Properties</p>
                <h3 className="text-2xl font-bold">{totalProperties}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 dark:bg-gray-800 dark:text-white">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Agents</p>
                <h3 className="text-2xl font-bold">{totalAgents}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 dark:bg-gray-800 dark:text-white">
            <div className="flex items-center">
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalSaleValue)} KES</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 dark:bg-gray-800 dark:text-white">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
                <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Property Value</p>
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
            <TabsTrigger value="messages">
              <MessageSquare className="mr-1 h-4 w-4" /> Messages
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-4">Properties</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="py-3 px-4 text-left dark:text-white">Title</th>
                    <th className="py-3 px-4 text-left dark:text-white">Location</th>
                    <th className="py-3 px-4 text-left dark:text-white">Price (KES)</th>
                    <th className="py-3 px-4 text-left dark:text-white">Status</th>
                    <th className="py-3 px-4 text-left dark:text-white">Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.slice(0, 5).map((property) => {
                    const propertyAgent = agents.find(agent => agent.id === property.agentId);
                    return (
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
                        <td className="py-3 px-4 dark:text-white">{propertyAgent?.name || 'Unassigned'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="agents" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-4">Agents</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="py-3 px-4 text-left dark:text-white">Agent</th>
                    <th className="py-3 px-4 text-left dark:text-white">Email</th>
                    <th className="py-3 px-4 text-left dark:text-white">Phone</th>
                    <th className="py-3 px-4 text-left dark:text-white">Properties</th>
                    <th className="py-3 px-4 text-left dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id} className="border-b dark:border-gray-700">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <img 
                            src={agent.photo} 
                            alt={agent.name} 
                            className="w-8 h-8 rounded-full mr-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                            }}
                          />
                          <span className="dark:text-white">{agent.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 dark:text-white">{agent.email}</td>
                      <td className="py-3 px-4 dark:text-white">{agent.phone}</td>
                      <td className="py-3 px-4 dark:text-white">{agent.properties.length}</td>
                      <td className="py-3 px-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/30"
                          onClick={() => setSelectedAgent(agent.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" /> Message
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-4">Tasks</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="py-3 px-4 text-left dark:text-white">Title</th>
                    <th className="py-3 px-4 text-left dark:text-white">Priority</th>
                    <th className="py-3 px-4 text-left dark:text-white">Status</th>
                    <th className="py-3 px-4 text-left dark:text-white">Due Date</th>
                    <th className="py-3 px-4 text-left dark:text-white">Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const agent = agents.find(a => a.id === task.agentId);
                    return (
                      <tr key={task.id} className="border-b dark:border-gray-700">
                        <td className="py-3 px-4 dark:text-white">{task.title}</td>
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
                          {agent ? (
                            <div className="flex items-center">
                              <img 
                                src={agent.photo} 
                                alt={agent.name} 
                                className="w-6 h-6 rounded-full mr-2"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                                }}
                              />
                              <span className="dark:text-white">{agent.name}</span>
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
          
          <TabsContent value="messages" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-4">Messages</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Card className="p-4 dark:bg-gray-700">
                  <h4 className="font-bold text-lg mb-3 dark:text-white">Agents</h4>
                  {agents.map(agent => (
                    <div 
                      key={agent.id} 
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer mb-2 ${selectedAgent === agent.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500'}`}
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      <img 
                        src={agent.photo} 
                        alt={agent.name}
                        className="w-10 h-10 rounded-full" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                        }}
                      />
                      <div>
                        <p className="font-medium dark:text-white">{agent.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{agent.email}</p>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
              
              <div className="lg:col-span-3">
                {selectedAgent ? (
                  <MessagePanel 
                    currentUser={{ id: user.id, name: user.name, role: 'admin' }}
                    recipient={agents.find(a => a.id === selectedAgent) || { id: 0, name: '', role: 'agent' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">Select an agent to start messaging</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
