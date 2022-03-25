export interface Gig {
  partnerUserId: string,
  gigId: string,
  
  totalAmount: number,
  type: string,
  description: string,
  startTime: Date,
  endTime: Date,
  tips: number,
  expenses: number
};