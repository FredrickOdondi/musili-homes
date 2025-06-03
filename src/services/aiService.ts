
import { properties } from '@/data/properties';
import { agents } from '@/data/agents';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
    `).join('\n---\n');

    this.agentData = agents.map(agent => `
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

    // Analyze the user's question and generate appropriate response
    const response = this.analyzeAndRespond(userMessage.toLowerCase(), context);
    
    return response;
  }

  private analyzeAndRespond(message: string, context: string): string {
    // Price inquiries
    if (message.includes('price') || message.includes('cost') || message.includes('expensive') || message.includes('budget')) {
      const prices = properties.map(p => ({ title: p.title, price: p.price, location: p.location }));
      const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
      
      if (message.includes('average') || message.includes('typical')) {
        return `The average price of our luxury properties is KES ${avgPrice.toLocaleString()}. Our price range varies from KES ${Math.min(...prices.map(p => p.price)).toLocaleString()} to KES ${Math.max(...prices.map(p => p.price)).toLocaleString()}. Would you like to see properties within a specific budget range?`;
      }
      
      return `Our current property prices range from KES ${Math.min(...prices.map(p => p.price)).toLocaleString()} to KES ${Math.max(...prices.map(p => p.price)).toLocaleString()}. Here are some options:\n\n${prices.map(p => `• ${p.title} in ${p.location}: KES ${p.price.toLocaleString()}`).join('\n')}\n\nWould you like more details about any specific property?`;
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
      
      response += 'Which location interests you most? I can provide more detailed information about properties in specific areas.';
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
      ).join('\n')}\n\nHow many bedrooms are you looking for? I can help you find the perfect match.`;
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
      ).join('\n\n')}\n\nWould you like me to connect you with a specific agent or schedule a property viewing?`;
    }

    // General property inquiries
    if (message.includes('property') || message.includes('house') || message.includes('villa') || message.includes('estate')) {
      const featuredProps = properties.filter(p => p.featured);
      return `We currently have ${properties.length} luxury properties available. Here are our featured properties:\n\n${featuredProps.map(p => 
        `• ${p.title}\n  Location: ${p.location}\n  Price: KES ${p.price.toLocaleString()}\n  ${p.bedrooms} bed, ${p.bathrooms} bath, ${p.size.toLocaleString()} sq ft`
      ).join('\n\n')}\n\nWhat type of property are you most interested in? I can provide more specific recommendations.`;
    }

    // Investment inquiries
    if (message.includes('investment') || message.includes('roi') || message.includes('return')) {
      return `Our luxury properties offer excellent investment opportunities in Kenya's growing real estate market. Properties in areas like Karen and Westlands have shown consistent appreciation. The lakefront villa in Naivasha is particularly attractive for vacation rentals. Would you like detailed investment analysis for any specific property?`;
    }

    // Amenities inquiries
    if (message.includes('amenities') || message.includes('features') || message.includes('facilities')) {
      return `Our luxury properties feature premium amenities including:\n\n• Panoramic views (lakefront and city skyline)\n• Modern architectural design\n• Premium finishes throughout\n• Spacious layouts with high ceilings\n• Private gardens and outdoor spaces\n• Secure gated communities\n• Proximity to golf courses and country clubs\n\nWhich specific amenities are most important to you?`;
    }

    // Greeting or general inquiry
    if (message.includes('hello') || message.includes('hi') || message.includes('help') || message.length < 20) {
      return `Hello! I'm your AI Property Assistant. I can help you with information about our luxury properties, including prices, locations, sizes, and agent contacts. I have detailed knowledge of our ${properties.length} premium properties across Nairobi and Naivasha. What would you like to know?`;
    }

    // Default contextual response
    return `I'd be happy to help you with that! I have comprehensive information about our luxury properties including pricing, locations, features, and agent contacts. Could you be more specific about what you're looking for? For example:\n\n• Property prices and budget options\n• Specific locations (Karen, Westlands, Naivasha)\n• Number of bedrooms/size requirements\n• Agent contact information\n• Investment opportunities\n\nWhat interests you most?`;
  }
}

export const propertyAI = new PropertyAIService();
