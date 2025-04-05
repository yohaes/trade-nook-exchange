
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockUsers, mockProducts, getCurrentUser, banUser, unbanUser, deleteProduct } from "@/lib/data";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Ban, Trash2, CheckCircle, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Product } from "@/lib/types";

const Admin = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    // Load data
    setUsers(mockUsers);
    setProducts(mockProducts);
  }, [currentUser, navigate]);

  const handleToggleUserBan = (userId: string, currentBanStatus: boolean) => {
    const success = currentBanStatus ? unbanUser(userId) : banUser(userId);
    
    if (success) {
      // Update the local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isBanned: !currentBanStatus } : user
        )
      );
      
      toast.success(
        currentBanStatus
          ? "User has been unbanned"
          : "User has been banned"
      );
    } else {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteProduct = (id: string) => {
    const success = deleteProduct(id);
    
    if (success) {
      // Update the local state
      setProducts(products.filter((product) => product.id !== id));
      toast.success("Listing deleted successfully");
    } else {
      toast.error("Failed to delete listing");
    }
  };

  if (!currentUser || !currentUser.isAdmin) {
    return null; // This will redirect in the useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">
            Manage users and listings on the platform
          </p>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell className="font-medium">
                            {user.username}
                            {user.isAdmin && (
                              <Badge className="ml-2 bg-secondary">Admin</Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {user.email}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.isBanned ? "destructive" : "outline"}
                            >
                              {user.isBanned ? "Banned" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!user.isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleToggleUserBan(user.id, user.isBanned)
                                }
                                title={
                                  user.isBanned ? "Unban user" : "Ban user"
                                }
                              >
                                {user.isBanned ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Ban className="h-4 w-4 text-red-500" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Listing Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Seller
                        </TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Created
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.id}</TableCell>
                          <TableCell className="font-medium">
                            {product.title}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {product.sellerName}
                          </TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant={product.isSold ? "destructive" : "outline"}
                              >
                                {product.isSold ? "Sold" : "Active"}
                              </Badge>
                              {!product.isPaid && (
                                <Badge variant="secondary">Unpaid</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete listing"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Listing
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this listing?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
