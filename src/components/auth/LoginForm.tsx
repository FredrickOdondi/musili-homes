
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoginCredentials } from '@/types';

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    const credentials: LoginCredentials = {
      email: values.email,
      password: values.password,
    };
    
    const success = await login(credentials.email, credentials.password);
    
    if (success) {
      // Navigation is handled in the AuthContext after successful login
      console.log('Login successful');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-pure-white rounded-lg shadow-md border border-satin-silver">
      <h2 className="text-2xl font-bold text-deep-charcoal mb-6 text-center luxury-heading">Login to Your Account</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-deep-charcoal font-medium">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    className="bg-pure-white border-satin-silver text-deep-charcoal placeholder:text-deep-charcoal/50"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-soft-crimson" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-deep-charcoal font-medium">Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Enter your password" 
                    className="bg-pure-white border-satin-silver text-deep-charcoal placeholder:text-deep-charcoal/50"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-soft-crimson" />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full luxury-button-primary"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-4 text-sm text-center text-deep-charcoal/70 bg-soft-ivory p-3 rounded">
        <p className="font-medium text-deep-charcoal mb-1">Test Credentials:</p>
        <p><strong>Admin:</strong> admin@musili.co.ke / admin123</p>
        <p><strong>Agent:</strong> sarah@musili.co.ke / agent123</p>
      </div>
    </div>
  );
};

export default LoginForm;
