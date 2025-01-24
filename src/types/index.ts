export interface APIResponse {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface NotificationMessage {
  title: string;
  description: string;
  timestamp: Date;
}
