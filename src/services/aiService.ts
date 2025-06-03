
import { properties } from '@/data/properties';
import { agents } from '@/data/agents';
import { globalMessages } from '@/components/properties/ContactAgentForm';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ViewingRequest {
  propertyId: number;
  propertyTitle: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  preferredDate?: string;
  agentId: number;
}

export class PropertyAIService {
  private propertyData: string;
  private agentData: string;

  constructor() {
    // Prepare property data for AI context
    this.propertyData = properties.map(property => `
      Property ID: ${property.id}
      Title: ${property.title}
      Location: ${property.location}
      Address: ${property.address}
      Price: KES ${property.price.toLocaleString()}
      Bedrooms: ${property.bedrooms}
      Bathrooms: ${property.bathrooms}
      Size: ${property.size} sq ft
      Description: ${property.description}
      Status: ${property.status}
      Agent ID: ${property.agentId}
    `).join('\n---\n');

    this.agentData = agents.map(agent => `
      Agent ID: ${agent.id}
      Agent: ${agent.name}
      Email: ${agent.email}
      Phone: ${agent.phone}
      Bio: ${agent.bio}
      Properties: ${agent.properties.join(', ')}
    `).join('\n---\n');
  }

  async generateResponse(userMessage: string, conversationHistory: ChatMessage[]): Promise<string> {
    // Create context from conversation history
    const context = conversationHistory.slice(-5).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    // Check if this is a viewing request
    const viewingRequest = this.detectViewingRequest(userMessage, context);
    
    if (viewingRequest) {
      await this.notifyAgent(viewingRequest, userMessage);
    }

    // Analyze the user's question and generate appropriate response
    const response = this.analyzeAndRespond(userMessage.toLowerCase(), context);
    
    return response;
  }

  private detectViewingRequest(message: string, context: string): ViewingRequest | null {
    const lowerMessage = message.toLowerCase();
    const contextLower = context.toLowerCase();
    
    // Keywords that indicate viewing interest
    const viewingKeywords = [
      'viewing', 'view', 'visit', 'see the property', 'schedule', 
      'appointment', 'tour', 'interested in', 'would like to see',
      'book a visit', 'arrange', 'meet', 'show me'
    ];
    
    const hasViewingKeyword = viewingKeywords.some(keyword => 
      lowerMessage.includes(keyword) || contextLower.includes(keyword)
    );
    
    if (!hasViewingKeyword) return null;
    
    // Try to extract property information from context
    let propertyId: number | null = null;
    let propertyTitle = '';
    let agentId: number | null = null;
    
    // Look for property mentions in the conversation
    for (const property of properties) {
      if (lowerMessage.includes(property.title.toLowerCase()) || 
          contextLower.includes(property.title.toLowerCase()) ||
          lowerMessage.includes(property.location.toLowerCase()) ||
          contextLower.includes(property.location.toLowerCase())) {
        propertyId = property.id;
        propertyTitle = property.title;
        agentId = property.agentId;
        break;
      }
    }
    
    // If no specific property found, try to infer from recent context
    if (!propertyId) {
      const recentMessages = context.split('\n').slice(-10).join(' ').toLowerCase();
      for (const property of properties) {
        if (recentMessages.includes(property.title.toLowerCase()) || 
            recentMessages.includes(property.location.toLowerCase())) {
          propertyId = property.id;
          propertyTitle = property.title;
          agentId = property.agentId;
          break;
        }
      }
    }
    
    if (propertyId && agentId) {
      return {
        propertyId,
        propertyTitle,
        agentId,
        clientName: this.extractClientName(message, context),
        clientPhone: this.extractPhone(message, context),
        clientEmail: this.extractEmail(message, context),
        preferredDate: this.extractDate(message, context)
      };
    }
    
    return null;
  }

  private extractClientName(message: string, context: string): string | undefined {
    const namePattern = /(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/i;
    const match = (message + ' ' + context).match(namePattern);
    return match ? match[1].trim() : undefined;
  }

  private extractPhone(message: string, context: string): string | undefined {
    const phonePattern = /(?:phone|number|call me at|reach me at)\s*(?:is\s*)?([+]?[\d\s\-()]{10,})/i;
    const match = (message + ' ' + context).match(phonePattern);
    return match ? match[1].trim() : undefined;
  }

  private extractEmail(message: string, context: string): string | undefined {
    const emailPattern = /(?:email|mail)\s*(?:is\s*)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = (message + ' ' + context).match(emailPattern);
    return match ? match[1].trim() : undefined;
  }

  private extractDate(message: string, context: string): string | undefined {
    const datePatterns = [
      /(?:on|at)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(?:tomorrow|next\s+week|this\s+week)/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*)/i
    ];
    
    for (const pattern of datePatterns) {
      const match = (message + ' ' + context).match(pattern);
      if (match) return match[1] || match[0];
    }
    
    return undefined;
  }

  private async notifyAgent(viewingRequest: ViewingRequest, originalMessage: string): Promise<void> {
    const agent = agents.find(a => a.id === viewingRequest.agentId);
    if (!agent) return;

    // Create a notification message for the agent
    const notificationContent = `🏠 **New Viewing Request from AI Assistant**

**Property:** ${viewingRequest.propertyTitle}
**Client Interest:** A potential client has expressed interest in viewing this property through our AI assistant.

**Client Details:**
${viewingRequest.clientName ? `• Name: ${viewingRequest.clientName}` : ''}
${viewingRequest.clientPhone ? `• Phone: ${viewingRequest.clientPhone}` : ''}
${viewingRequest.clientEmail ? `• Email: ${viewingRequest.clientEmail}` : ''}
${viewingRequest.preferredDate ? `• Preferred Date: ${viewingRequest.preferredDate}` : ''}

**Original Message:** "${originalMessage}"

Please reach out to the client to schedule the viewing and provide them with property details.`;

    const notificationMessage = {
      id: `ai-notification-${Date.now()}`,
      senderId: -1, // AI system ID
      receiverId: viewingRequest.agentId,
      senderName: 'AI Property Assistant',
      content: notificationContent,
      timestamp: new Date().toISOString(),
      read: false,
      propertyId: viewingRequest.propertyId,
      clientInfo: {
        name: viewingRequest.clientName || 'Potential Client',
        email: viewingRequest.clientEmail || 'Not provided',
        phone: viewingRequest.clientPhone || 'Not provided',
        message: originalMessage
      }
    };

    globalMessages.push(notificationMessage);
    console.log('Agent notification sent:', notificationMessage);
  }

  private analyzeAndRespond(message: string, context: string): string {
    // Check if this is a viewing-related response
    if (this.detectViewingRequest(message, context)) {
      return this.generateViewingResponse(message, context);
    }

    // Price inquiries
    if (message.includes('price') || message.includes('cost') || message.includes('expensive') || message.includes('budget')) {
      const prices = properties.map(p => ({ title: p.title, price: p.price, location: p.location }));
      const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
      
      if (message.includes('average') || message.includes('typical')) {
        return `The average price of our luxury properties is KES ${avgPrice.toLocaleString()}. Our price range varies from KES ${Math.min(...prices.map(p => p.price)).toLocaleString()} to KES ${Math.max(...prices.map(p => p.price)).toLocaleString()}. Would you like to see properties within a specific budget range?`;
      }
      
      return `Our current property prices range from KES ${Math.min(...prices.map(p => p.price)).toLocaleString()} to KES ${Math.max(...prices.map(p => p.price)).toLocaleString()}. Here are some options:\n\n${prices.map(p => `• ${p.title} in ${p.location}: KES ${p.price.toLocaleString()}`).join('\n')}\n\nWould you like more details about any specific property or schedule a viewing?`;
    }

    // Location inquiries
    if (message.includes('location') || message.includes('area') || message.includes('nairobi') || message.includes('karen') || message.includes('westlands') || message.includes('naivasha')) {
      const locations = [...new Set(properties.map(p => p.location))];
      const locationProperties = locations.map(loc => ({
        location: loc,
        properties: properties.filter(p => p.location === loc)
      }));

      let response = `We have luxury properties in the following prime locations:\n\n`;
      locationProperties.forEach(loc => {
        response += `**${loc.location}:**\n`;
        loc.properties.forEach(prop => {
          response += `• ${prop.title} - ${prop.bedrooms} bed, KES ${prop.price.toLocaleString()}\n`;
        });
        response += '\n';
      });
      
      response += 'Which location interests you most? I can provide more details and even help you schedule a viewing for any property that catches your eye!';
      return response;
    }

    // Size/bedroom inquiries
    if (message.includes('bedroom') || message.includes('bed') || message.includes('room') || message.includes('size') || message.includes('space')) {
      const sizeInfo = properties.map(p => ({
        title: p.title,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        size: p.size,
        location: p.location
      }));

      return `Here's the size information for our properties:\n\n${sizeInfo.map(p => 
        `• ${p.title} (${p.location}): ${p.bedrooms} bedrooms, ${p.bathrooms} bathrooms, ${p.size.toLocaleString()} sq ft`
      ).join('\n')}\n\nHow many bedrooms are you looking for? I can help you find the perfect match and arrange a viewing once you find something you like!`;
    }

    // Agent inquiries
    if (message.includes('agent') || message.includes('contact') || message.includes('viewing') || message.includes('show')) {
      const agentInfo = agents.map(agent => ({
        name: agent.name,
        phone: agent.phone,
        bio: agent.bio,
        propertyCount: agent.properties.length
      }));

      return `Our experienced agents are ready to assist you:\n\n${agentInfo.map(agent => 
        `• ${agent.name}: ${agent.bio}\n  Phone: ${agent.phone} | Manages ${agent.propertyCount} properties`
      ).join('\n\n')}\n\nI can connect you with the right agent for any property you're interested in, or if you'd like, I can help you schedule a viewing directly. Just let me know which property interests you!`;
    }

    // General property inquiries
    if (message.includes('property') || message.includes('house') || message.includes('villa') || message.includes('estate')) {
      const featuredProps = properties.filter(p => p.featured);
      return `We currently have ${properties.length} luxury properties available. Here are our featured properties:\n\n${featuredProps.map(p => 
        `• ${p.title}\n  Location: ${p.location}\n  Price: KES ${p.price.toLocaleString()}\n  ${p.bedrooms} bed, ${p.bathrooms} bath, ${p.size.toLocaleString()} sq ft`
      ).join('\n\n')}\n\nWhat type of property are you most interested in? I can provide more specific recommendations and help you schedule viewings for properties that match your preferences!`;
    }

    // Investment inquiries
    if (message.includes('investment') || message.includes('roi') || message.includes('return')) {
      return `Our luxury properties offer excellent investment opportunities in Kenya's growing real estate market. Properties in areas like Karen and Westlands have shown consistent appreciation. The lakefront villa in Naivasha is particularly attractive for vacation rentals. Would you like detailed investment analysis for any specific property, or perhaps schedule a viewing to see the investment potential firsthand?`;
    }

    // Amenities inquiries
    if (message.includes('amenities') || message.includes('features') || message.includes('facilities')) {
      return `Our luxury properties feature premium amenities including:\n\n• Panoramic views (lakefront and city skyline)\n• Modern architectural design\n• Premium finishes throughout\n• Spacious layouts with high ceilings\n• Private gardens and outdoor spaces\n• Secure gated communities\n• Proximity to golf courses and country clubs\n\nWhich specific amenities are most important to you? I can help you find properties that match your requirements and arrange viewings for the ones that interest you most!`;
    }

    // Greeting or general inquiry
    if (message.includes('hello') || message.includes('hi') || message.includes('help') || message.length < 20) {
      return `Hello! I'm your AI Property Assistant. I can help you with information about our luxury properties, including prices, locations, sizes, and agent contacts. I have detailed knowledge of our ${properties.length} premium properties across Nairobi and Naivasha. I can also help you schedule property viewings when you find something you like. What would you like to know?`;
    }

    // Default contextual response
    return `I'd be happy to help you with that! I have comprehensive information about our luxury properties including pricing, locations, features, and agent contacts. I can also help you schedule viewings for any properties that interest you. Could you be more specific about what you're looking for? For example:\n\n• Property prices and budget options\n• Specific locations (Karen, Westlands, Naivasha)\n• Number of bedrooms/size requirements\n• Agent contact information\n• Investment opportunities\n• Schedule property viewings\n\nWhat interests you most?`;
  }

  private generateViewingResponse(message: string, context: string): string {
    const viewingRequest = this.detectViewingRequest(message, context);
    
    if (viewingRequest) {
      const agent = agents.find(a => a.id === viewingRequest.agentId);
      
      return `Excellent! I've noted your interest in viewing **${viewingRequest.propertyTitle}**. I've automatically notified ${agent?.name || 'the assigned agent'} about your viewing request.\n\n**Next Steps:**\n• The agent will contact you shortly to confirm the viewing\n• Please have your contact details ready\n• Feel free to prepare any questions about the property\n\n**Agent Contact:** ${agent?.name || 'Agent'} - ${agent?.phone || 'Contact available'}\n\nIs there anything specific about the property you'd like me to tell the agent beforehand? I can also help you with information about other properties while you wait for the agent to reach out!`;
    }
    
    return `I'd be happy to help you schedule a viewing! Could you please tell me:\n\n• Which property you're interested in viewing\n• Your preferred date/time\n• Your contact information (name, phone, email)\n\nOnce I have this information, I'll connect you with the right agent immediately!`;
  }
}

export const propertyAI = new PropertyAIService();
