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
  preferredTime?: string;
  agentId: number;
}

interface ConversationState {
  currentProperty?: any;
  viewingInterest?: boolean;
  clientDetails?: {
    name?: string;
    phone?: string;
    email?: string;
    preferredDate?: string;
    preferredTime?: string;
  };
  awaitingConfirmation?: boolean;
}

export class PropertyAIService {
  private propertyData: string;
  private agentData: string;
  private conversationStates: Map<string, ConversationState> = new Map();

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
    const sessionKey = 'current_session'; // In a real app, this would be unique per user
    const state = this.conversationStates.get(sessionKey) || {};
    
    const context = conversationHistory.slice(-5).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const response = this.analyzeAndRespond(userMessage.toLowerCase(), context, state);
    
    // Update conversation state
    this.conversationStates.set(sessionKey, response.newState);
    
    // Check if we should notify agent
    if (response.shouldNotifyAgent && response.viewingRequest) {
      await this.notifyAgent(response.viewingRequest, userMessage);
    }
    
    return response.message;
  }

  private analyzeAndRespond(message: string, context: string, state: ConversationState): {
    message: string;
    newState: ConversationState;
    shouldNotifyAgent: boolean;
    viewingRequest?: ViewingRequest;
  } {
    const lowerMessage = message.toLowerCase();
    const contextLower = context.toLowerCase();

    // Handle viewing confirmation flow
    if (state.awaitingConfirmation && (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || lowerMessage.includes('book'))) {
      if (state.currentProperty && state.clientDetails?.preferredDate && state.clientDetails?.preferredTime) {
        const viewingRequest: ViewingRequest = {
          propertyId: state.currentProperty.id,
          propertyTitle: state.currentProperty.title,
          clientName: state.clientDetails.name,
          clientPhone: state.clientDetails.phone,
          clientEmail: state.clientDetails.email,
          preferredDate: state.clientDetails.preferredDate,
          preferredTime: state.clientDetails.preferredTime,
          agentId: state.currentProperty.agentId
        };

        return {
          message: `Perfect! I've successfully booked your viewing for **${state.currentProperty.title}** on ${state.clientDetails.preferredDate} at ${state.clientDetails.preferredTime}.\n\n**Viewing Confirmed:**\n• Property: ${state.currentProperty.title}\n• Date: ${state.clientDetails.preferredDate}\n• Time: ${state.clientDetails.preferredTime}\n• Location: ${state.currentProperty.address}\n\nThe property agent has been notified and will contact you shortly to confirm the details. You'll receive a call or message before the viewing date.\n\nIs there anything else you'd like to know about this property or would you like to explore other options?`,
          newState: { ...state, awaitingConfirmation: false },
          shouldNotifyAgent: true,
          viewingRequest
        };
      }
    }

    // Handle date/time collection for viewing
    if (state.viewingInterest && state.currentProperty) {
      // Check if user is providing contact info
      if (lowerMessage.includes('name') || (!state.clientDetails?.name && this.extractClientName(message, context))) {
        const name = this.extractClientName(message, context);
        return {
          message: `Thank you${name ? `, ${name}` : ''}! Now, what date would work best for you to view **${state.currentProperty.title}**? Please let me know your preferred date and time (e.g., "Monday at 2 PM" or "December 15th at 10 AM").`,
          newState: { 
            ...state, 
            clientDetails: { ...state.clientDetails, name }
          },
          shouldNotifyAgent: false
        };
      }

      // Check if user is providing phone
      if (this.extractPhone(message, context)) {
        const phone = this.extractPhone(message, context);
        return {
          message: `Great! I have your phone number. What date and time would work best for you to view **${state.currentProperty.title}**? You can say something like "This Saturday at 3 PM" or "Next Tuesday morning".`,
          newState: { 
            ...state, 
            clientDetails: { ...state.clientDetails, phone }
          },
          shouldNotifyAgent: false
        };
      }

      // Check if user is providing email
      if (this.extractEmail(message, context)) {
        const email = this.extractEmail(message, context);
        return {
          message: `Perfect! I have your email address. When would you like to schedule the viewing for **${state.currentProperty.title}**? Please provide your preferred date and time.`,
          newState: { 
            ...state, 
            clientDetails: { ...state.clientDetails, email }
          },
          shouldNotifyAgent: false
        };
      }

      // Check if user is providing date/time
      const dateInfo = this.extractDateTime(message, context);
      if (dateInfo.date || dateInfo.time) {
        const newDetails = {
          ...state.clientDetails,
          preferredDate: dateInfo.date || state.clientDetails?.preferredDate,
          preferredTime: dateInfo.time || state.clientDetails?.preferredTime
        };

        if (newDetails.preferredDate && newDetails.preferredTime) {
          return {
            message: `Excellent! Let me confirm your viewing details:\n\n**Property:** ${state.currentProperty.title}\n**Date:** ${newDetails.preferredDate}\n**Time:** ${newDetails.preferredTime}\n**Location:** ${state.currentProperty.address}\n\nShould I go ahead and book this viewing for you? Please confirm by saying "yes" or "confirm booking".`,
            newState: { 
              ...state, 
              clientDetails: newDetails,
              awaitingConfirmation: true
            },
            shouldNotifyAgent: false
          };
        } else if (newDetails.preferredDate && !newDetails.preferredTime) {
          return {
            message: `Great! I have ${newDetails.preferredDate} noted. What time would work best for you on that day? (e.g., "10 AM", "2:30 PM", "afternoon")`,
            newState: { 
              ...state, 
              clientDetails: newDetails
            },
            shouldNotifyAgent: false
          };
        } else if (newDetails.preferredTime && !newDetails.preferredDate) {
          return {
            message: `Perfect! I have ${newDetails.preferredTime} as your preferred time. Which day would work best for you? (e.g., "Monday", "this weekend", "December 15th")`,
            newState: { 
              ...state, 
              clientDetails: newDetails
            },
            shouldNotifyAgent: false
          };
        }
      }

      // If no specific details provided, ask for them
      if (!state.clientDetails?.name && !state.clientDetails?.phone) {
        return {
          message: `Great! To schedule your viewing for **${state.currentProperty.title}**, I'll need a few details. Could you please provide your name and phone number? For example: "My name is John and my phone is 0712345678"`,
          newState: state,
          shouldNotifyAgent: false
        };
      }
    }

    // Check if user is interested in viewing after property info
    if ((lowerMessage.includes('interested') || lowerMessage.includes('view') || lowerMessage.includes('visit') || 
         lowerMessage.includes('see') || lowerMessage.includes('schedule') || lowerMessage.includes('book')) && 
         state.currentProperty) {
      return {
        message: `Wonderful! I'd be happy to help you schedule a viewing for **${state.currentProperty.title}**. This is a fantastic property and I'm sure you'll love seeing it in person.\n\nTo arrange the viewing, I'll need some basic information from you. Could you please share:\n• Your name\n• Your phone number\n• Your preferred date and time for the viewing\n\nYou can provide this all at once, like: "My name is Sarah, phone 0701234567, and I'd like to visit this Saturday at 2 PM"`,
        newState: { ...state, viewingInterest: true },
        shouldNotifyAgent: false
      };
    }

    // Property search and information
    return this.handlePropertyInquiry(lowerMessage, context, state);
  }

  private handlePropertyInquiry(message: string, context: string, state: ConversationState): {
    message: string;
    newState: ConversationState;
    shouldNotifyAgent: boolean;
  } {
    // Specific property search
    for (const property of properties) {
      if (message.includes(property.title.toLowerCase()) || 
          message.includes(property.location.toLowerCase()) ||
          message.includes(property.address.toLowerCase())) {
        
        const agent = agents.find(a => a.id === property.agentId);
        
        return {
          message: `Here's detailed information about **${property.title}**:\n\n**Location:** ${property.location}\n**Address:** ${property.address}\n**Price:** KES ${property.price.toLocaleString()}\n**Bedrooms:** ${property.bedrooms}\n**Bathrooms:** ${property.bathrooms}\n**Size:** ${property.size.toLocaleString()} sq ft\n**Status:** ${property.status}\n\n**Description:**\n${property.description}\n\n**Property Agent:** ${agent?.name || 'Available'}\n**Contact:** ${agent?.phone || 'Available'}\n\nThis property offers excellent value in a prime location. Would you like to schedule a viewing to see it in person? I can arrange a convenient time for you to visit!`,
          newState: { ...state, currentProperty: property },
          shouldNotifyAgent: false
        };
      }
    }

    // General inquiries - keep existing logic
    if (message.includes('price') || message.includes('cost') || message.includes('expensive') || message.includes('budget')) {
      const prices = properties.map(p => ({ title: p.title, price: p.price, location: p.location }));
      const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
      
      if (message.includes('average') || message.includes('typical')) {
        return {
          message: `The average price of our luxury properties is KES ${avgPrice.toLocaleString()}. Our price range varies from KES ${Math.min(...prices.map(p => p.price)).toLocaleString()} to KES ${Math.max(...prices.map(p => p.price)).toLocaleString()}. Would you like to see properties within a specific budget range?`,
          newState: state,
          shouldNotifyAgent: false
        };
      }
      
      return {
        message: `Our current property prices range from KES ${Math.min(...prices.map(p => p.price)).toLocaleString()} to KES ${Math.max(...prices.map(p => p.price)).toLocaleString()}. Here are some options:\n\n${prices.map(p => `• ${p.title} in ${p.location}: KES ${p.price.toLocaleString()}`).join('\n')}\n\nWould you like more details about any specific property? Just mention the property name and I'll provide full details!`,
        newState: state,
        shouldNotifyAgent: false
      };
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
      
      response += 'Which property would you like to know more about? Just mention the property name and I\'ll provide complete details including description, features, and agent contact information!';
      
      return {
        message: response,
        newState: state,
        shouldNotifyAgent: false
      };
    }

    // Default response
    return {
      message: `I'd be happy to help you with that! I have comprehensive information about our luxury properties including pricing, locations, features, and agent contacts. I can also help you schedule viewings for any properties that interest you. Could you be more specific about what you're looking for? For example:\n\n• Property prices and budget options\n• Specific locations (Karen, Westlands, Naivasha)\n• Number of bedrooms/size requirements\n• Agent contact information\n• Investment opportunities\n• Schedule property viewings\n\nWhat interests you most?`,
      newState: state,
      shouldNotifyAgent: false
    };
  }

  private extractDateTime(message: string, context: string): { date?: string; time?: string } {
    const fullText = message + ' ' + context;
    
    // Time patterns
    const timePatterns = [
      /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i,
      /(\d{1,2}\s*(?:AM|PM|am|pm))/i,
      /(morning|afternoon|evening|noon)/i
    ];
    
    // Date patterns
    const datePatterns = [
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(tomorrow|next\s+week|this\s+week|this\s+weekend|next\s+weekend)/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*)/i,
      /(december\s+\d{1,2}|january\s+\d{1,2})/i
    ];
    
    let time;
    let date;
    
    for (const pattern of timePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        time = match[1];
        break;
      }
    }
    
    for (const pattern of datePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        date = match[1];
        break;
      }
    }
    
    return { date, time };
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

  private async notifyAgent(viewingRequest: ViewingRequest, originalMessage: string): Promise<void> {
    const agent = agents.find(a => a.id === viewingRequest.agentId);
    if (!agent) return;

    const notificationContent = `🏠 **New Viewing Request from AI Assistant**

**Property:** ${viewingRequest.propertyTitle}
**Scheduled Date:** ${viewingRequest.preferredDate}
**Scheduled Time:** ${viewingRequest.preferredTime}

**Client Details:**
${viewingRequest.clientName ? `• Name: ${viewingRequest.clientName}` : ''}
${viewingRequest.clientPhone ? `• Phone: ${viewingRequest.clientPhone}` : ''}
${viewingRequest.clientEmail ? `• Email: ${viewingRequest.clientEmail}` : ''}

**Original Request:** "${originalMessage}"

The client has confirmed their interest and booked this viewing through our AI assistant. Please contact them to confirm the appointment and provide any additional property details.`;

    const notificationMessage = {
      id: `ai-notification-${Date.now()}`,
      senderId: -1,
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
        message: originalMessage,
        preferredDate: viewingRequest.preferredDate,
        preferredTime: viewingRequest.preferredTime
      }
    };

    globalMessages.push(notificationMessage);
    console.log('Agent notification sent:', notificationMessage);
  }
}

export const propertyAI = new PropertyAIService();
