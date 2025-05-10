
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const AIAssistantSection: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great question about our properties! I recommend checking our listings in the Nairobi area.",
        "Based on your requirements, our luxury villas in Karen might be perfect for you.",
        "We have several properties that match those criteria. Would you like me to arrange a viewing?",
        "Our agents specialize in high-end properties in that location. I'll connect you with one of them.",
        "The average price for properties in that area is around 200-250 million KES."
      ];
      
      const aiResponse = responses[Math.floor(Math.random() * responses.length)];
      setResponse(aiResponse);
      setIsLoading(false);
      
      toast({
        title: "AI Assistant",
        description: "Response generated successfully.",
      });
    }, 1500);
  };
  
  return (
    <div id="ai-assistant" className="py-20 bg-navy text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2 text-white">AI Property Assistant</h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-4"></div>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Get instant answers about our properties, locations, and services.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 bg-white/5 backdrop-blur-sm rounded-lg shadow-lg">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-gold p-3 rounded-full">
                <Bot className="h-6 w-6 text-gray-900" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">Property Assistant</h3>
                <p className="text-white/80">Ask me anything about our properties</p>
              </div>
            </div>
            
            {response && (
              <div className="mb-6 p-4 rounded-lg bg-white/10">
                <p className="text-white">{response}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about properties, locations, or prices..."
                className="flex-grow bg-white/20 border-white/20 text-white placeholder:text-white/50"
              />
              <Button 
                type="submit" 
                className="bg-gold text-gray-900 hover:bg-gold/90"
                disabled={isLoading}
              >
                {isLoading ? "Thinking..." : "Ask"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantSection;
