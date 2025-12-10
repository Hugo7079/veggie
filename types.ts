export type AppMode = 'LANDING' | 'ASSESSMENT' | 'RESULT' | 'PASSPORT_UPLOAD' | 'PASSPORT';

export type VeggieType = 
  | 'VEGAN' 
  | 'LACTO_OVO' 
  | 'LACTO' 
  | 'OVO' 
  | 'PESCATARIAN' 
  | 'FLEXITARIAN' 
  | 'FIVE_PUNGENT';

export interface AgentProfile {
  id: VeggieType;
  name: string;
  title: string;
  description: string;
  color: string;
  textColor: string;
  quote: string;
  soulFood: string[];
  advice: string;
  tags: string[];
  iconName: string;
  // New fields for Image Generation
  visualDescription: string;
  colorDescription: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface UserPassportData {
  userName: string;
  userPhoto: string | null; // Base64
  assignedAgent: VeggieType;
  generatedDate: string;
}