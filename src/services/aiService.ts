
import { properties } from '@/data/properties';
import { Property } from '@/types';
import { nlpService } from './nlpService';
import { responseGenerator } from './responseGenerator';

// Define types for entities and conversation state
interface Entities {
  location?: string;
  bedrooms?: number;
  priceRange?: { min?: number; max?: number };
  date?: string;
  time?: string;
  name?: string;
  contact?: string;
  propertyType?: string;
}

interface ConversationState {
  currentStep: 'greeting' | 'property_inquiry' | 'collecting_details' | 'confirming_booking' | 'general_chat';
  propertyContext?: Property;
  viewingDetails?: {
    name?: string;
    contact?: string;
    date?: string;
    time?: string;
  };
  userPreferences?: {
    location?: string;
    priceRange?: string;
    bedrooms?: number;
    propertyType?: string;
  };
}

interface ViewingRequest {
  propertyId: string;
  clientName: string;
  clientContact: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

interface AIResponse {
  message: string;
  newState: ConversationState;
  shouldNotifyAgent?: boolean;
  viewingRequest?: ViewingRequest;
}

// Initialize conversation state
let conversationState: ConversationState = {
  currentStep: 'greeting'
};

export const processUserMessage = async (message: string): Promise<AIResponse> => {
  try {
    const intent = nlpService.analyzeIntent(message);
    const entities = intent.entities;
    
    // Handle greeting
    if (intent.type === 'greeting' || conversationState.currentStep === 'greeting') {
      const response = responseGenerator.generateDynamicResponse({
        intent,
        userMessage: message,
        conversationHistory: []
      });
      return {
        message: response,
        newState: { ...conversationState, currentStep: 'general_chat' }
      };
    }

    // Handle property inquiries
    if (intent.type === 'property_search' || intent.type === 'property_info') {
      const matchedProperties = findMatchingProperties(entities);
      
      if (matchedProperties.length > 0) {
        const response = responseGenerator.generateDynamicResponse({
          intent: { ...intent, entities: { ...entities, properties: matchedProperties } },
          userMessage: message,
          conversationHistory: []
        });
        return {
          message: response,
          newState: { 
            ...conversationState, 
            currentStep: 'property_inquiry',
            propertyContext: matchedProperties[0]
          }
        };
      } else {
        const response = responseGenerator.generateDynamicResponse({
          intent: { ...intent, type: 'general_inquiry' },
          userMessage: message,
          conversationHistory: []
        });
        return {
          message: response,
          newState: { ...conversationState, currentStep: 'general_chat' }
        };
      }
    }

    // Handle viewing requests
    if (intent.type === 'viewing_request' || conversationState.currentStep === 'collecting_details') {
      return handleViewingRequest(message, entities);
    }

    // Handle general inquiries
    const response = responseGenerator.generateDynamicResponse({
      intent,
      userMessage: message,
      conversationHistory: []
    });
    return {
      message: response,
      newState: conversationState
    };

  } catch (error) {
    console.error('Error processing message:', error);
    return {
      message: "I apologize, but I'm experiencing some technical difficulties. Please try again or contact our team directly.",
      newState: conversationState
    };
  }
};

const findMatchingProperties = (entities: any): Property[] => {
  return properties.filter(property => {
    if (entities.location && !property.location.toLowerCase().includes(entities.location.toLowerCase())) {
      return false;
    }
    if (entities.bedrooms && property.bedrooms !== entities.bedrooms) {
      return false;
    }
    if (entities.price_range) {
      const priceRange = entities.price_range;
      if (property.price > priceRange * 1.2 || property.price < priceRange * 0.8) {
        return false;
      }
    }
    return true;
  });
};

const handleViewingRequest = (message: string, entities: any): AIResponse => {
  const currentDetails = conversationState.viewingDetails || {};
  
  // Extract viewing details from the message
  if (!currentDetails.name && entities.name) {
    currentDetails.name = entities.name;
  }
  if (!currentDetails.contact && (entities.phone || entities.email)) {
    currentDetails.contact = entities.phone || entities.email;
  }
  if (!currentDetails.date && entities.date) {
    currentDetails.date = entities.date;
  }
  if (!currentDetails.time && entities.time) {
    currentDetails.time = entities.time;
  }

  const newState = {
    ...conversationState,
    currentStep: 'collecting_details' as const,
    viewingDetails: currentDetails
  };

  // Check if we have all required details
  if (currentDetails.name && currentDetails.contact && currentDetails.date && currentDetails.time) {
    // All details collected, ask for confirmation
    const response = `Perfect! I have all the details for your viewing:\n\n**Viewing Summary:**\n• **Property:** ${conversationState.propertyContext?.title}\n• **Name:** ${currentDetails.name}\n• **Contact:** ${currentDetails.contact}\n• **Date:** ${currentDetails.date}\n• **Time:** ${currentDetails.time}\n\nWould you like me to confirm this booking? Please reply with "Yes" to confirm or "No" to cancel.`;
    
    return {
      message: response,
      newState: { ...newState, currentStep: 'confirming_booking' }
    };
  } else {
    // Still need more details
    const missingDetails = [];
    if (!currentDetails.name) missingDetails.push("your name");
    if (!currentDetails.contact) missingDetails.push("your contact information");
    if (!currentDetails.date) missingDetails.push("your preferred date");
    if (!currentDetails.time) missingDetails.push("your preferred time");
    
    const response = `To schedule your viewing for **${conversationState.propertyContext?.title || 'this property'}**, I still need ${missingDetails.join(', ')}.\n\nPlease provide the missing information so I can arrange everything for you.`;
    
    return {
      message: response,
      newState
    };
  }
};

export const confirmViewingBooking = (): AIResponse => {
  const details = conversationState.viewingDetails;
  const property = conversationState.propertyContext;
  
  if (!details?.name || !details?.contact || !details?.date || !details?.time || !property) {
    return {
      message: "I'm sorry, but I don't have all the necessary details for the booking. Let's start over.",
      newState: { currentStep: 'general_chat' }
    };
  }

  const viewingRequest: ViewingRequest = {
    propertyId: property.id.toString(),
    clientName: details.name,
    clientContact: details.contact,
    preferredDate: details.date,
    preferredTime: details.time,
    message: `Viewing request for ${property.title} in ${property.location}`
  };

  const response = `Excellent! Your viewing has been confirmed.\n\n**Booking Confirmed:**\n• **Property:** ${property.title}\n• **Date & Time:** ${details.date} at ${details.time}\n• **Contact:** ${details.contact}\n\nOur property specialist will contact you shortly to finalize the arrangements. Thank you for choosing our services!`;

  return {
    message: response,
    newState: { currentStep: 'general_chat' },
    shouldNotifyAgent: true,
    viewingRequest
  };
};

export const cancelViewingBooking = (): AIResponse => {
  const response = "No problem! Your viewing request has been cancelled. Feel free to ask me about other properties or schedule a different viewing whenever you're ready.";
  
  return {
    message: response,
    newState: { currentStep: 'general_chat' }
  };
};

export const updateConversationState = (newState: ConversationState) => {
  conversationState = newState;
};

// Create a propertyAI object to maintain compatibility with ChatInterface
export const propertyAI = {
  generateResponse: async (message: string, conversationHistory: any[] = []): Promise<string> => {
    const response = await processUserMessage(message);
    updateConversationState(response.newState);
    return response.message;
  }
};
