export interface MessageType { 
    type: 'user' | 'botMessage' | 'botImage';
    message: string
  }
  
  

export const messagesToLLMFormat = (message: MessageType[]): { role: string, content: string }[] => {
    const formattedMessages = [];
    for (const m of message) {
      if (m.type === 'botMessage') {
        formattedMessages.push({ role: 'developer', content: m.message });
      }
      else if (m.type === 'botImage') {
        formattedMessages.push({ role: 'developer', content: "Here is a visualization shown to the user. For size reason, we aren't providing it here. The description of the visualization is in the following message." });
      }
      else {
        formattedMessages.push({ role: 'user', content: m.message });
      }
    }
    return formattedMessages;
  }