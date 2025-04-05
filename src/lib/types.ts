
export type User = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  location: string;
  contactPhone: string;
  sellerId: string;
  sellerName: string;
  isSold: boolean;
  isPaid: boolean;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
};
