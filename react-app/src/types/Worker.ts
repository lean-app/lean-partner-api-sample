export interface Worker { 
  id: string, 
  updatedAt: string,
  [key: string]: any
};

export interface WorkerUI {
  id: string,
  refreshing: boolean
}