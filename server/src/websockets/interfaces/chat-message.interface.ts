export interface ChatMessage {
  content: string;
  receiver: string;
  sender: Sender;
}

export interface Sender {
  id: number;
  username: string;
}
