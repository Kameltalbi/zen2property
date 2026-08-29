export type Occupancy = 'rented' | 'vacant' | 'personal';
export type PropertyType = 'apartment' | 'house' | 'studio' | 'other';
export type Usage = 'rental' | 'personal' | 'mixed';
export type PeriodKey = 'month' | '3m' | '6m' | 'year';

export type WorkspaceProperty = {
  id: string;
  name: string;
  photo: string;
  address: string;
  city: string;
  type: PropertyType;
  usage: Usage;
  occupancy: Occupancy;
  surface: number;
  rooms: number;
  bedrooms: number;
  yearBuilt: number;
  estimatedValue: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  nextDue: string;
  nextDueLabel: string;
  alert?: string;
  archived?: boolean;
};

export type FinanceOp = {
  id: string;
  propertyId: string;
  date: string;
  kind: 'income' | 'expense';
  category: string;
  label: string;
  amount: number;
};

export type WorkspaceDocument = {
  id: string;
  propertyId: string;
  title: string;
  category: string;
  status: 'valid' | 'expiring' | 'expired';
  addedAt: string;
  expiresAt: string | null;
};

export type MaintenanceJob = {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  vendor: string;
  due: string;
  estimate: number;
  actual: number | null;
  status: 'todo' | 'planned' | 'progress' | 'done';
};

export type CalendarEvent = {
  id: string;
  propertyId: string | null;
  date: string;
  title: string;
  kind: string;
};

export type WorkspaceContact = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  propertyIds: string[];
};

export type Activity = {
  id: string;
  at: string;
  text: string;
};
