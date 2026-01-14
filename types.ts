
export enum AgentRole {
  COORDINATOR = 'Coordinator',
  LEGAL = 'Legal Assistant',
  LOAN_OFFICER = 'Mortgage Specialist',
  APPRAISER = 'Valuation Expert',
  GENERAL = 'General AI'
}

export enum TransactionStage {
  PROSPECT = 'Prospect',
  LISTED = 'Listed',
  OFFER = 'Offer Accepted',
  INSPECTION = 'Inspection/Due Diligence',
  FUNDING = 'Funding',
  CLOSED = 'Closed'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  senderName?: string;
  timestamp: number;
  isConsensus?: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  priceRange: string;
  imageUrl: string;
  location: string;
  specialization: string[];
  referralFee?: number;
}

export interface TransactionTask {
  id: string;
  transactionId: string;
  address?: string;
  title: string;
  status: 'pending' | 'completed' | 'blocked';
  assignedTo: AgentRole | 'User';
  dueDate: string;
  reminderSent?: boolean;
}

export interface TransactionDocument {
  id: string;
  name: string;
  status: 'missing' | 'draft' | 'signed' | 'approved';
  type: string;
  legalReview?: string;
  uploadDate?: string;
}

export interface FundingInfo {
  loanAmount: number;
  interestRate: number;
  ltv: number;
  dti: number;
  earnestMoneyStatus: 'pending' | 'received' | 'verified';
  underwritingStatus: 'in-progress' | 'conditional' | 'clear-to-close';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'status' | 'document';
  timestamp: number;
  read: boolean;
  transactionId?: string;
  actionRequired?: boolean;
}

export interface Transaction {
  id: string;
  address: string;
  price: number;
  clientName: string;
  stage: TransactionStage;
  progress: number;
  lastUpdate: string;
  tasks: TransactionTask[];
  documents: TransactionDocument[];
  funding?: FundingInfo;
  linkedVendors?: string[];
  listingDate?: string;
  offerDate?: string;
  inspectionDeadline?: string;
  financingDeadline?: string;
  closingDate?: string;
}

export interface PlatformMetrics {
  totalReferralFees: number;
  mrr: number;
  activeUsers: number;
}
