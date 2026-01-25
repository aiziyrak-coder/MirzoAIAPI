


export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DOC_GENERATOR = 'DOC_GENERATOR',
  PROFILE = 'PROFILE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  PENDING_SUBSCRIPTION = 'PENDING_SUBSCRIPTION',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}

export enum Sector {
  HOKIMYAT = 'Davlat Boshqaruvi va Hokimiyat',
  SOLIQ = 'Soliq va Moliya',
  IQTISOD = 'Iqtisodiyot va Biznes',
  TAOLIM = 'Ta\'lim va Fan',
  TIBBIYOT = 'Sog\'liqni Saqlash',
  YURIST = 'Huquq va Sud',
  QURILISH = 'Qurilish va Arxitektura',
  IT = 'Axborot Texnologiyalari',
  BOSHQA = 'Boshqa soha'
}

export enum DocumentType {
  HISOBOT = 'Hisobot (Tahliliy)',
  AHBOROTNOMA = 'Axborotnoma (Newsletter)',
  MAORUZA = 'Ma\'ruza (Rasmiy)',
  NUTQ = 'Nutq (Tantanali/Ilhomlantiruvchi)',
  TABRIK = 'Tabrik Matni',
  BUYRUQ = 'Buyruq / Qaror loyihasi',
  ARIZA = 'Ariza / Tushuntirish xati',
  STRATEGIYA = 'Rivojlanish Strategiyasi',
  MATBUOT = 'Matbuot xabari (Press Release)'
}

export interface UploadedFile {
  name: string;
  type: string;
  data: string; // Base64
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sources?: Array<{ uri: string; title: string }>;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export type SubscriptionStatus = 'NONE' | 'PENDING' | 'ACTIVE';

export interface SavedDocument {
    id: string;
    title: string;
    type: DocumentType;
    date: string;
    content: string; // HTML content
}

export interface User {
    id: string;
    fullName: string;
    phoneNumber: string; // Changed from email
    password: string; 
    organization: string;
    subscriptionStatus: SubscriptionStatus;
    subscriptionExpiry?: string;
    history: SavedDocument[];
    isAdmin?: boolean; // New flag for super admin
    receiptFileName?: string; // Receipt file name for pending subscriptions
}

export interface Tool {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  promptTemplate: string;
}
