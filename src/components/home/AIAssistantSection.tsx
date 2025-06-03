
import React from 'react';
import { Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import ChatInterface from './ChatInterface';

const AIAssistantSection: React.FC = () => {
  return (
    <div id="ai-assistant" className="py-20 bg-navy text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2 text-white">AI Property Assistant</h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-4"></div>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Get intelligent, personalized answers about our properties, locations, pricing, and services.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center gap-4 p-6 border-b border-white/20">
              <div className="bg-gold p-3 rounded-full">
                <Bot className="h-6 w-6 text-gray-900" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">Smart Property Assistant</h3>
                <p className="text-white/80">Ask me anything about our luxury properties</p>
              </div>
            </div>
            
            <div className="h-[500px]">
              <ChatInterface />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantSection;
