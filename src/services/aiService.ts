import { properties } from '@/data/properties';
import { Property } from '@/types';
import { detectIntent, extractEntities } from './nlpService';
import { generateResponse } from './responseGenerator';

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
    const intent = detectIntent(message);
    const entities = extractEntities(message);
    
    // Handle greeting
    if (intent === 'greeting' || conversationState.currentStep === 'greeting') {
      const response = generateResponse('greeting', {}, conversationState);
      return {
        message: response,
        newState: { ...conversationState, currentStep: 'general_chat' }
      };
    }

    // Handle property inquiries
    if (intent === 'property_inquiry') {
      const matchedProperties = findMatchingProperties(entities);
      
      if (matchedProperties.length > 0) {
        const response = generateResponse('property_info', { properties: matchedProperties }, conversationState);
        return {
          message: response,
          newState: { 
            ...conversationState, 
            currentStep: 'property_inquiry',
            propertyContext: matchedProperties[0]
          }
        };
      } else {
        const response = generateResponse('no_properties_found', { entities }, conversationState);
        return {
          message: response,
          newState: { ...conversationState, currentStep: 'general_chat' }
        };
      }
    }

    // Handle viewing requests
    if (intent === 'viewing_request' || conversationState.currentStep === 'collecting_details') {
      return handleViewingRequest(message, entities);
    }

    // Handle general inquiries
    const response = generateResponse('general_inquiry', { message, entities }, conversationState);
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

// Helper function to extract price range from entities
const extractPriceRange = (priceRange: string) => {
  const [min, max] = priceRange.split('-').map(Number);
  return { min, max };
};

const findMatchingProperties = (entities: any): Property[] => {
  return properties.filter(property => {
    if (entities.location && !property.location.toLowerCase().includes(entities.location.toLowerCase())) {
      return false;
    }
    if (entities.bedrooms && property.bedrooms !== entities.bedrooms) {
      return false;
    }
    if (entities.priceRange) {
      const { min, max } = entities.priceRange;
      if ((min && property.price < min) || (max && property.price > max)) {
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
  if (!currentDetails.contact && entities.contact) {
    currentDetails.contact = entities.contact;
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
    const response = generateResponse('confirm_viewing', { 
      details: currentDetails, 
      property: conversationState.propertyContext 
    }, newState);
    
    return {
      message: response,
      newState: { ...newState, currentStep: 'confirming_booking' }
    };
  } else {
    // Still need more details
    const response = generateResponse('collect_viewing_details', { 
      currentDetails, 
      property: conversationState.propertyContext 
    }, newState);
    
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
    propertyId: property.id,
    clientName: details.name,
    clientContact: details.contact,
    preferredDate: details.date,
    preferredTime: details.time,
    message: `Viewing request for ${property.title} in ${property.location}`
  };

  const response = generateResponse('booking_confirmed', { 
    details, 
    property 
  }, conversationState);

  return {
    message: response,
    newState: { currentStep: 'general_chat' },
    shouldNotifyAgent: true,
    viewingRequest
  };
};

export const cancelViewingBooking = (): AIResponse => {
  const response = generateResponse('booking_cancelled', {}, conversationState);
  
  return {
    message: response,
    newState: { currentStep: 'general_chat' }
  };
};

export const updateConversationState = (newState: ConversationState) => {
  conversationState = newState;
};
