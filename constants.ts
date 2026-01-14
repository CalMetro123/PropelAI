
import { AgentRole, Transaction, TransactionStage, Vendor } from './types';

export const AGENT_PERSONAS: Record<AgentRole, string> = {
  [AgentRole.GENERAL]: "You are a helpful Real Estate Assistant.",
  [AgentRole.COORDINATOR]: "You are a Senior Transaction Coordinator. Your job is to organize documents, manage timelines, and ensure the deal moves from contract to close smoothly. Be precise, organized, and proactive.",
  [AgentRole.LEGAL]: "You are a Real Estate Legal Assistant. Focus on contract clauses, contingencies, title issues, and compliance. Warn about risks. Do not give binding legal advice, but provide legal context.",
  [AgentRole.LOAN_OFFICER]: "You are a Mortgage Broker Assistant. Explain rates, LTV, DTI, underwriting conditions, and pre-approval steps. Focus on the financial aspect of the transaction.",
  [AgentRole.APPRAISER]: "You are a Property Valuation Expert. Analyze market data, comps, and property condition impacts on value. Be objective and data-driven."
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-101',
    address: '124 Maple Avenue, Springfield',
    price: 450000,
    clientName: 'Sarah Jenkins (Buyer)',
    stage: TransactionStage.INSPECTION,
    progress: 45,
    lastUpdate: 'Home Inspection Report Received',
    listingDate: '2025-10-15',
    offerDate: '2025-11-05',
    inspectionDeadline: '2025-12-01',
    financingDeadline: '2025-12-15',
    closingDate: '2025-12-30',
    tasks: [
      { id: 't1', title: 'Review Inspection Report', status: 'pending', assignedTo: AgentRole.COORDINATOR, dueDate: '2025-12-01' },
      { id: 't2', title: 'Negotiate Repairs', status: 'blocked', assignedTo: AgentRole.GENERAL, dueDate: '2025-12-02' },
      { id: 't3', title: 'Verify Earnest Money', status: 'completed', assignedTo: AgentRole.LEGAL, dueDate: '2025-11-01' }
    ],
    documents: [
      { id: 'd1', name: 'Purchase Agreement', status: 'signed', type: 'Contract' },
      { id: 'd2', name: 'Property Disclosure', status: 'signed', type: 'Disclosure' },
      { id: 'd3', name: 'Inspection Addendum', status: 'draft', type: 'Addendum' }
    ]
  },
  {
    id: 'TX-102',
    address: '880 Ocean Drive, Miami',
    price: 1250000,
    clientName: 'Marcus Roth (Investor)',
    stage: TransactionStage.FUNDING,
    progress: 85,
    lastUpdate: 'Clear to Close issued by Lender',
    listingDate: '2025-09-01',
    offerDate: '2025-10-10',
    inspectionDeadline: '2025-10-25',
    financingDeadline: '2025-11-20',
    closingDate: '2025-12-15',
    tasks: [
      { id: 't4', title: 'Final Walkthrough', status: 'pending', assignedTo: AgentRole.COORDINATOR, dueDate: '2025-12-10' },
      { id: 't5', title: 'Wire Instructions Sent', status: 'completed', assignedTo: AgentRole.LEGAL, dueDate: '2025-11-18' }
    ],
    documents: [
      { id: 'd4', name: 'Closing Disclosure (CD)', status: 'approved', type: 'Financial' },
      { id: 'd5', name: 'Title Insurance Policy', status: 'signed', type: 'Legal' }
    ]
  }
];

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'V-1',
    name: 'SafeHome Inspections',
    category: 'Inspection',
    rating: 4.9,
    priceRange: '$$',
    imageUrl: 'https://picsum.photos/100/100?random=1',
    location: 'Springfield',
    specialization: ['Mold', 'Radon', 'Residential']
  },
  {
    id: 'V-2',
    name: 'Apex Title & Escrow',
    category: 'Title Company',
    rating: 4.8,
    priceRange: '$$$',
    imageUrl: 'https://picsum.photos/100/100?random=2',
    location: 'Miami',
    specialization: ['Commercial', 'Escrow Services']
  },
  {
    id: 'V-3',
    name: 'Reliable Renovations',
    category: 'General Contractor',
    rating: 4.6,
    priceRange: '$$$$',
    imageUrl: 'https://picsum.photos/100/100?random=3',
    location: 'Austin',
    specialization: ['Kitchen', 'Bath', 'Roofing']
  },
  {
    id: 'V-4',
    name: 'Citywide Appraisals',
    category: 'Appraisal',
    rating: 4.7,
    priceRange: '$$',
    imageUrl: 'https://picsum.photos/100/100?random=4',
    location: 'Austin',
    specialization: ['Luxury', 'Multi-Family']
  }
];
