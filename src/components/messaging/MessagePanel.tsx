
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  read: boolean;
}

interface User {
  id: number;
  name: string;
  photo?: string;
  role: 'agent' | 'admin';
}

interface MessagePanelProps {
  currentUser: User;
  recipient: User;
}

// Sample messages for demo purposes
const sampleMessages: Message[] = [
  {
    id: 1,
    senderId: 1, // Admin
    receiverId: 2, // Agent
    content: "Hi Sarah, I've assigned a new property to you for showing this weekend.",
    timestamp: "2024-05-09T10:30:00",
    read: true
  },
  {
    id: 2,
    senderId: 2, // Agent
    receiverId: 1, // Admin
    content: "Thanks, I'll review the details and prepare for the showing.",
    timestamp: "2024-05-09T10:35:00",
    read: true
  },
  {
    id: 3,
    senderId: 1, // Admin
    receiverId: 2, // Agent
    content: "Great! The client is very interested in lakefront properties.",
    timestamp: "2024-05-09T10:37:00",
    read: true
  }
];

const MessagePanel: React.FC<MessagePanelProps> = ({ currentUser, recipient }) => {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Create new message
    const message: Message = {
      id: messages.length + 1,
      senderId: currentUser.id,
      receiverId: recipient.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    };

    setMessages([...messages, message]);
    setNewMessage('');

    toast({
      title: "Message Sent",
      description: `Message sent to ${recipient.name}`
    });
  };

  return (
    <Card className="flex flex-col h-[500px] dark:bg-gray-800 dark:text-white">
      <div className="p-4 border-b dark:border-gray-600 flex items-center gap-3">
        <Avatar>
          <img src={recipient.photo || 'https://via.placeholder.com/40'} alt={recipient.name} />
        </Avatar>
        <div>
          <h3 className="font-bold">{recipient.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{recipient.role === 'admin' ? 'Administrator' : 'Agent'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(msg => 
          (msg.senderId === currentUser.id && msg.receiverId === recipient.id) || 
          (msg.receiverId === currentUser.id && msg.senderId === recipient.id)
        ).map(message => (
          <div 
            key={message.id} 
            className={`max-w-[80%] ${message.senderId === currentUser.id ? 
              'ml-auto bg-blue-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' : 
              'mr-auto bg-gray-200 dark:bg-gray-700 dark:text-white rounded-tl-lg rounded-tr-lg rounded-br-lg'} p-3`}
          >
            <p>{message.content}</p>
            <span className="text-xs opacity-70 block text-right">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-600 flex gap-2">
        <Input 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Type your message..."
          className="flex-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <Button type="submit">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

export default MessagePanel;
