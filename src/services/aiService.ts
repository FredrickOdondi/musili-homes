import { properties } from '@/data/properties';
import { agents } from '@/data/agents';
import { globalMessages } from '@/components/properties/ContactAgentForm';
import { nlpService } from './nlpService';
import { responseGenerator } from './responseGenerator';

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
  userPreferences?: Record<string, any>;
  conversationContext?: string;
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
    
    // Build conversation context
    const context = conversationHistory.slice(-3).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    // Analyze user intent using NLP
    const intent = nlpService.analyzeIntent(userMessage, context);
    const sentiment = nlpService.generateSentiment(userMessage);
    
    console.log('AI Analysis:', { intent, sentiment, entities: intent.entities });

    // Handle ongoing viewing process first
    if (this.isInViewingProcess(state, userMessage)) {
      return this.handleViewingProcess(userMessage, context, state, intent);
    }

    // Generate intelligent response based on intent
    const response = this.generateIntelligentResponse(userMessage, intent, context, state);
    
    // Update conversation state with new information
    this.updateConversationState(sessionKey, state, intent, response);
    
    return response.message;
  }

  private isInViewingProcess(state: ConversationState, message: string): boolean {
    return !!(state.awaitingConfirmation || 
             (state.viewingInterest && state.currentProperty) ||
             (state.viewingInterest && !this.hasCompleteClientDetails(state)));
  }

  private generateIntelligentResponse(
    userMessage: string, 
    intent: any, 
    context: string, 
    state: ConversationState
  ): { message: string; newState: ConversationState; shouldNotifyAgent?: boolean; viewingRequest?: ViewingRequest } {
    
    // Use the response generator for intelligent responses
    const responseContext = {
      intent,
      userMessage,
      conversationHistory: [],
      userPreferences: state.userPreferences
    };

    let message = responseGenerator.generateDynamicResponse(responseContext);
    let newState = { ...state };
    
    // Handle property-specific actions
    if (intent.type === 'property_info' && intent.entities.property_name) {
      const property = this.findPropertyByName(intent.entities.property_name);
      if (property) {
        newState.currentProperty = property;
        // Update preferences based on viewed property
        newState.userPreferences = {
          ...newState.userPreferences,
          lastViewedProperty: property.id,
          preferredLocation: property.location,
          priceRange: property.price
        };
      }
    }

    // Handle viewing interest
    if (intent.type === 'viewing_request' && newState.currentProperty) {
      message += `\n\nTo proceed with scheduling your viewing, I'll need:\n• Your full name\n• Contact phone number\n• Preferred date and time\n\nYou can provide all details at once, like: "My name is John Smith, phone 0712345678, I'd like to visit this Saturday at 2 PM"`;
      newState.viewingInterest = true;
    }

    // Extract and store client details from entities
    if (intent.entities.name || intent.entities.phone || intent.entities.email) {
      newState.clientDetails = {
        ...newState.clientDetails,
        ...intent.entities
      };
    }

    return { message, newState };
  }

  private handleViewingProcess(
    userMessage: string, 
    context: string, 
    state: ConversationState, 
    intent: any
  ): { message: string; newState: ConversationState; shouldNotifyAgent?: boolean; viewingRequest?: ViewingRequest } {
    
    // Handle confirmation
    if (state.awaitingConfirmation && this.isConfirmation(userMessage)) {
      return this.processViewingConfirmation(state, userMessage);
    }

    // Collect missing client details
    const updatedDetails = {
      ...state.clientDetails,
      ...intent.entities
    };

    // Extract date/time if provided
    if (intent.entities.date || intent.entities.time) {
      updatedDetails.preferredDate = intent.entities.date || updatedDetails.preferredDate;
      updatedDetails.preferredTime = intent.entities.time || updatedDetails.preferredTime;
    }

    const newState = { ...state, clientDetails: updatedDetails };

    // Check if we have all required information
    if (this.hasCompleteClientDetails(newState) && newState.currentProperty) {
      return {
        message: this.generateConfirmationMessage(newState),
        newState: { ...newState, awaitingConfirmation: true },
        shouldNotifyAgent: false
      };
    }

    // Request missing information
    return {
      message: this.generateMissingInfoRequest(newState),
      newState,
      shouldNotifyAgent: false
    };
  }

  private generateConfirmationMessage(state: ConversationState): string {
    const { currentProperty, clientDetails } = state;
    return `Perfect! Let me confirm your viewing details:\n\n**Viewing Summary:**\n• **Property:** ${currentProperty?.title}\n• **Date:** ${clientDetails?.preferredDate}\n• **Time:** ${clientDetails?.preferredTime}\n• **Location:** ${currentProperty?.address}\n• **Contact:** ${clientDetails?.name} (${clientDetails?.phone})\n\n**About this property:**\n• Price: KES ${currentProperty?.price.toLocaleString()}\n• ${currentProperty?.bedrooms} bedrooms, ${currentProperty?.bathrooms} bathrooms\n• ${currentProperty?.size.toLocaleString()} sq ft\n\nShould I confirm this viewing? Our property specialist will contact you within 24 hours to finalize the arrangements. Please reply with "yes" or "confirm" to proceed.`;
  }

  private generateMissingInfoRequest(state: ConversationState): string {
    const missing = [];
    
    if (!state.clientDetails?.name) missing.push('your name');
    if (!state.clientDetails?.phone) missing.push('phone number');
    if (!state.clientDetails?.preferredDate) missing.push('preferred date');
    if (!state.clientDetails?.preferredTime) missing.push('preferred time');

    if (missing.length > 0) {
      return `Great! To complete your viewing booking for **${state.currentProperty?.title}**, I still need ${missing.join(' and ')}.\n\nYou can provide everything at once, for example: "My name is Sarah Johnson, phone 0701234567, I'd like to visit this Friday at 3 PM"`;
    }

    return "I have all your details! Let me prepare the confirmation.";
  }

  private processViewingConfirmation(state: ConversationState, originalMessage: string): any {
    if (!state.currentProperty || !this.hasCompleteClientDetails(state)) {
      return {
        message: "I'm sorry, but there seems to be missing information. Please provide your viewing details again.",
        newState: { ...state, awaitingConfirmation: false },
        shouldNotifyAgent: false
      };
    }

    const viewingRequest: ViewingRequest = {
      propertyId: state.currentProperty.id,
      propertyTitle: state.currentProperty.title,
      clientName: state.clientDetails?.name,
      clientPhone: state.clientDetails?.phone,
      clientEmail: state.clientDetails?.email,
      preferredDate: state.clientDetails?.preferredDate,
      preferredTime: state.clientDetails?.preferredTime,
      agentId: state.currentProperty.agentId
    };

    return {
      message: `🎉 **Viewing Confirmed!**\n\nYour viewing for **${state.currentProperty.title}** has been successfully booked!\n\n**Confirmation Details:**\n• **Date & Time:** ${state.clientDetails?.preferredDate} at ${state.clientDetails?.preferredTime}\n• **Location:** ${state.currentProperty.address}\n• **Contact Person:** ${state.clientDetails?.name}\n• **Phone:** ${state.clientDetails?.phone}\n\n**What happens next:**\n✅ Our property specialist has been notified\n✅ You'll receive a confirmation call within 24 hours\n✅ Detailed directions will be provided before your visit\n✅ A property expert will give you a complete tour\n\n**Property Highlights:**\n• ${state.currentProperty.bedrooms} bedrooms, ${state.currentProperty.bathrooms} bathrooms\n• ${state.currentProperty.size.toLocaleString()} sq ft of luxury living space\n• Premium location in ${state.currentProperty.location}\n\nIs there anything else you'd like to know about this property or would you like to explore other properties in our portfolio?`,
      newState: { 
        ...state, 
        awaitingConfirmation: false,
        viewingInterest: false,
        userPreferences: {
          ...state.userPreferences,
          hasBookedViewing: true,
          lastBookedProperty: state.currentProperty.id
        }
      },
      shouldNotifyAgent: true,
      viewingRequest
    };
  }

  private findPropertyByName(name: string) {
    return properties.find(p => 
      p.title.toLowerCase().includes(name.toLowerCase()) ||
      this.fuzzyMatch(p.title.toLowerCase(), name.toLowerCase(), 0.6)
    );
  }

  private fuzzyMatch(text: string, target: string, threshold: number): boolean {
    const words = target.split(' ');
    const matchedWords = words.filter(word => text.includes(word));
    return (matchedWords.length / words.length) >= threshold;
  }

  private isConfirmation(message: string): boolean {
    const confirmWords = ['yes', 'confirm', 'book', 'proceed', 'go ahead', 'sure', 'okay', 'ok'];
    return confirmWords.some(word => message.toLowerCase().includes(word));
  }

  private hasCompleteClientDetails(state: ConversationState): boolean {
    const details = state.clientDetails;
    return !!(details?.name && details?.phone && details?.preferredDate && details?.preferredTime);
  }

  private updateConversationState(
    sessionKey: string, 
    currentState: ConversationState, 
    intent: any, 
    response: any
  ): void {
    const updatedState = {
      ...currentState,
      ...response.newState,
      conversationContext: intent.type
    };

    this.conversationStates.set(sessionKey, updatedState);
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
