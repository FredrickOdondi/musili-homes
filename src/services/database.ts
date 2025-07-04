
import { supabase } from '@/integrations/supabase/client';
import { Property, Agent, Admin, User, Task } from '@/types';

// Properties
export const getProperties = async (): Promise<Property[]> => {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (image_url)
    `);
  
  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
  
  return data?.map(property => ({
    ...property,
    images: property.property_images?.map((img: any) => img.image_url) || [],
    createdAt: property.created_at
  })) || [];
};

export const getPropertyById = async (id: number): Promise<Property | null> => {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (image_url)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching property:', error);
    return null;
  }
  
  return data ? {
    ...data,
    images: data.property_images?.map((img: any) => img.image_url) || [],
    createdAt: data.created_at
  } : null;
};

export const getFeaturedProperties = async (): Promise<Property[]> => {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (image_url)
    `)
    .eq('featured', true);
  
  if (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }
  
  return data?.map(property => ({
    ...property,
    images: property.property_images?.map((img: any) => img.image_url) || [],
    createdAt: property.created_at
  })) || [];
};

// Agents
export const getAgents = async (): Promise<Agent[]> => {
  const { data, error } = await supabase
    .from('agents')
    .select(`
      *,
      users (id, name, email, phone, photo, role)
    `);
  
  if (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
  
  return data?.map(agent => ({
    id: agent.id,
    name: agent.users.name,
    email: agent.users.email,
    password: '', // Don't expose passwords
    phone: agent.users.phone || '',
    photo: agent.users.photo || '',
    bio: agent.bio || '',
    properties: [], // Will be populated separately if needed
    role: 'agent' as const
  })) || [];
};

export const getAgentById = async (id: number): Promise<Agent | null> => {
  const { data, error } = await supabase
    .from('agents')
    .select(`
      *,
      users (id, name, email, phone, photo, role)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching agent:', error);
    return null;
  }
  
  return data ? {
    id: data.id,
    name: data.users.name,
    email: data.users.email,
    password: '', // Don't expose passwords
    phone: data.users.phone || '',
    photo: data.users.photo || '',
    bio: data.bio || '',
    properties: [], // Will be populated separately if needed
    role: 'agent' as const
  } : null;
};

// Users and Authentication
export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  
  return data?.map(user => ({
    ...user,
    password: '' // Don't expose passwords
  })) || [];
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return data ? {
    ...data,
    password: '' // Don't expose passwords
  } : null;
};

export const authenticate = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password) // Note: In production, use proper hashing
    .single();
  
  if (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
  
  return data ? {
    ...data,
    password: '' // Don't expose passwords
  } : null;
};

// Tasks
export const getTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*');
  
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  
  return data?.map(task => ({
    ...task,
    dueDate: task.due_date,
    agentId: task.agent_id,
    createdAt: task.created_at
  })) || [];
};

export const getTasksByAgentId = async (agentId: number): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('agent_id', agentId);
  
  if (error) {
    console.error('Error fetching tasks for agent:', error);
    return [];
  }
  
  return data?.map(task => ({
    ...task,
    dueDate: task.due_date,
    agentId: task.agent_id,
    createdAt: task.created_at
  })) || [];
};

export const addTask = async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      due_date: task.dueDate,
      agent_id: task.agentId
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding task:', error);
    return null;
  }
  
  return data ? {
    ...data,
    dueDate: data.due_date,
    agentId: data.agent_id,
    createdAt: data.created_at
  } : null;
};

export const updateTaskStatus = async (taskId: number, status: Task['status']): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task status:', error);
    return null;
  }
  
  return data ? {
    ...data,
    dueDate: data.due_date,
    agentId: data.agent_id,
    createdAt: data.created_at
  } : null;
};
