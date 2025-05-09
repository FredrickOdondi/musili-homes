
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We will respond to you shortly.",
      });
      
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-offWhite">
      <div className="bg-navy py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Contact Us</h1>
            <p className="text-xl text-white/80">Get in touch with our luxury real estate experts</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold text-navy mb-4">Get In Touch</h2>
            <p className="text-lg text-charcoal/80 mb-8">
              Have questions about our properties or services? Our team is here to help you
              find your perfect luxury home in Kenya.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <div className="bg-gold rounded-full p-3 mr-4">
                  <MapPin className="h-6 w-6 text-navy" />
                </div>
                <div>
                  <h3 className="font-bold text-navy mb-1">Our Location</h3>
                  <p className="text-charcoal/80">
                    Westlands Business Park<br />
                    Nairobi, Kenya
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gold rounded-full p-3 mr-4">
                  <Phone className="h-6 w-6 text-navy" />
                </div>
                <div>
                  <h3 className="font-bold text-navy mb-1">Phone Number</h3>
                  <p className="text-charcoal/80">+254 712 345 678</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gold rounded-full p-3 mr-4">
                  <Mail className="h-6 w-6 text-navy" />
                </div>
                <div>
                  <h3 className="font-bold text-navy mb-1">Email Address</h3>
                  <p className="text-charcoal/80">info@musili.co.ke</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gold rounded-full p-3 mr-4">
                  <Clock className="h-6 w-6 text-navy" />
                </div>
                <div>
                  <h3 className="font-bold text-navy mb-1">Office Hours</h3>
                  <p className="text-charcoal/80">
                    Monday - Friday: 8:00 AM - 6:00 PM<br />
                    Saturday: 9:00 AM - 1:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-navy mb-6">Send Us A Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="What can we help you with?"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                ></textarea>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gold text-navy hover:bg-gold/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63821.67512747117!2d36.776786767475216!3d-1.2682364393898622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173c0a1d9195%3A0xd61b5a9cca94df77!2sWestlands%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1619602591539!5m2!1sen!2ske" 
          width="100%" 
          height="450" 
          loading="lazy"
          title="Musili Homes Office Location"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;
