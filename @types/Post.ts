export interface Post {
  id: string;
  userId: string;
  username: string;
  userProfileImage?: string | null;
  description: string;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  createdAt: Date;
  updatedAt?: Date | null;
  likes?: number;
  likedBy?: string[];
}