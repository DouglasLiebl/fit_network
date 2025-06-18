export interface Post {
  id: string;
  userId: string;
  username: string;
  description: string;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  createdAt: Date;
}