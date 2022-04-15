export interface Gig {
  partnerUserId: string,
  gigId: string,
  
  totalAmount: number,
  type: string,
  description: string,
  startTime: string,
  endTime: string,
  tips: number,
  expenses: number
};