
import { User, Product, Category } from './types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'johndoe',
    email: 'john@example.com',
    isAdmin: false,
    isBanned: false,
    createdAt: '2023-01-15T12:00:00Z',
  },
  {
    id: '2',
    username: 'janedoe',
    email: 'jane@example.com',
    isAdmin: false,
    isBanned: false,
    createdAt: '2023-02-20T14:30:00Z',
  },
  {
    id: '3',
    username: 'admin',
    email: 'admin@example.com',
    isAdmin: true,
    isBanned: false,
    createdAt: '2022-12-01T09:15:00Z',
  },
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Furniture' },
  { id: '3', name: 'Clothing' },
  { id: '4', name: 'Vehicles' },
  { id: '5', name: 'Sports Equipment' },
  { id: '6', name: 'Toys & Games' },
  { id: '7', name: 'Books' },
  { id: '8', name: 'Home & Garden' },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'iPhone 13 Pro',
    description: 'Barely used iPhone 13 Pro, 256GB, Sierra Blue color. Comes with original box and accessories.',
    price: 799.99,
    imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=1000',
    category: 'Electronics',
    condition: 'Like New',
    location: 'Downtown',
    contactPhone: '555-123-4567',
    sellerId: '1',
    sellerName: 'johndoe',
    isSold: false,
    isPaid: true,
    createdAt: '2023-03-10T11:45:00Z',
  },
  {
    id: '2',
    title: 'Leather Sofa',
    description: 'Brown leather sofa in excellent condition. Pet-free and smoke-free home.',
    price: 450,
    imageUrl: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?q=80&w=1000',
    category: 'Furniture',
    condition: 'Good',
    location: 'Westside',
    contactPhone: '555-987-6543',
    sellerId: '2',
    sellerName: 'janedoe',
    isSold: false,
    isPaid: true,
    createdAt: '2023-02-28T15:20:00Z',
  },
  {
    id: '3',
    title: 'Mountain Bike',
    description: 'Trek mountain bike, 21-speed, 26" wheels. Recently tuned up and ready to ride.',
    price: 350,
    imageUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=1000',
    category: 'Sports Equipment',
    condition: 'Good',
    location: 'Northside',
    contactPhone: '555-456-7890',
    sellerId: '1',
    sellerName: 'johndoe',
    isSold: true,
    isPaid: true,
    createdAt: '2023-01-05T09:30:00Z',
  },
  {
    id: '4',
    title: 'Dining Table with Chairs',
    description: 'Wooden dining table with 4 chairs. Table is 60" x 36". Minor scratches on legs.',
    price: 275,
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1000',
    category: 'Furniture',
    condition: 'Fair',
    location: 'Eastside',
    contactPhone: '555-321-7654',
    sellerId: '2',
    sellerName: 'janedoe',
    isSold: false,
    isPaid: true,
    createdAt: '2023-02-15T14:10:00Z',
  },
  {
    id: '5',
    title: 'PlayStation 5',
    description: 'PS5 Digital Edition, includes controller and 3 games. Still under warranty.',
    price: 425,
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1000',
    category: 'Electronics',
    condition: 'Like New',
    location: 'Downtown',
    contactPhone: '555-789-0123',
    sellerId: '1',
    sellerName: 'johndoe',
    isSold: false,
    isPaid: true,
    createdAt: '2023-03-20T16:40:00Z',
  },
  {
    id: '6',
    title: 'Winter Jacket',
    description: 'North Face winter jacket, men\'s size L. Very warm, waterproof outer shell.',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1000',
    category: 'Clothing',
    condition: 'Good',
    location: 'Southside',
    contactPhone: '555-234-5678',
    sellerId: '2',
    sellerName: 'janedoe',
    isSold: false,
    isPaid: true,
    createdAt: '2023-01-25T10:15:00Z',
  },
];

// Simulated authentication (this would be replaced with real auth)
let currentUser: User | null = null;

export const loginUser = (email: string, password: string): User | null => {
  // Simple mock authentication - in a real app, we would validate with backend
  const user = mockUsers.find(u => u.email === email);
  if (user && !user.isBanned) {
    currentUser = user;
    return user;
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const logoutUser = (): void => {
  currentUser = null;
};

export const registerUser = (username: string, email: string, password: string): User | null => {
  // In a real app, we would validate and send to backend
  const newUser: User = {
    id: `${mockUsers.length + 1}`,
    username,
    email,
    isAdmin: false,
    isBanned: false,
    createdAt: new Date().toISOString(),
  };
  
  mockUsers.push(newUser);
  currentUser = newUser;
  return newUser;
};

export const getProducts = (category?: string, query?: string): Product[] => {
  let filtered = [...mockProducts];
  
  if (category && category !== 'All') {
    filtered = filtered.filter(product => product.category === category);
  }
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(product => 
      product.title.toLowerCase().includes(lowerQuery) || 
      product.description.toLowerCase().includes(lowerQuery)
    );
  }
  
  return filtered;
};

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const createProduct = (product: Omit<Product, 'id' | 'createdAt' | 'isPaid' | 'isSold' | 'sellerId' | 'sellerName'>): Product | null => {
  if (!currentUser) return null;
  
  const newProduct: Product = {
    ...product,
    id: `${mockProducts.length + 1}`,
    sellerId: currentUser.id,
    sellerName: currentUser.username,
    isPaid: false, // Initially false until payment is processed
    isSold: false,
    createdAt: new Date().toISOString(),
  };
  
  mockProducts.push(newProduct);
  return newProduct;
};

export const markProductAsPaid = (id: string): boolean => {
  const product = mockProducts.find(p => p.id === id);
  if (product) {
    product.isPaid = true;
    return true;
  }
  return false;
};

export const markProductAsSold = (id: string): boolean => {
  const product = mockProducts.find(p => p.id === id);
  if (product && currentUser && (product.sellerId === currentUser.id || currentUser.isAdmin)) {
    product.isSold = true;
    return true;
  }
  return false;
};

export const deleteProduct = (id: string): boolean => {
  const index = mockProducts.findIndex(p => p.id === id);
  if (index !== -1 && currentUser && (mockProducts[index].sellerId === currentUser.id || currentUser.isAdmin)) {
    mockProducts.splice(index, 1);
    return true;
  }
  return false;
};

export const banUser = (id: string): boolean => {
  if (!currentUser || !currentUser.isAdmin) return false;
  
  const user = mockUsers.find(u => u.id === id);
  if (user) {
    user.isBanned = true;
    return true;
  }
  return false;
};

export const unbanUser = (id: string): boolean => {
  if (!currentUser || !currentUser.isAdmin) return false;
  
  const user = mockUsers.find(u => u.id === id);
  if (user) {
    user.isBanned = false;
    return true;
  }
  return false;
};
