
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, mockProducts, markProductAsSold, deleteProduct } from "@/lib/data";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Plus, Edit, CheckCircle, Trash2 } from "lucide-react";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [myListings, setMyListings] = useState([]);
  
  useEffect(() => {
    if (!currentUser) {
      toast.error("Please login to view your dashboard");
      navigate("/login");
      return;
    }
    
    // Filter products by current user
    const userListings = mockProducts.filter(
      (product) => product.sellerId === currentUser.id
    );
    setMyListings(userListings);
  }, [currentUser, navigate]);

  const handleMarkAsSold = (id: string) => {
    const success = markProductAsSold(id);
    if (success) {
      // Update the local state
      setMyListings(
        myListings.map((listing) =>
          listing.id === id ? { ...listing, isSold: true } : listing
        )
      );
      toast.success("Listing marked as sold");
    } else {
      toast.error("Failed to mark listing as sold");
    }
  };

  const handleDeleteListing = (id: string) => {
    const success = deleteProduct(id);
    if (success) {
      // Update the local state
      setMyListings(myListings.filter((listing) => listing.id !== id));
      toast.success("Listing deleted successfully");
    } else {
      toast.error("Failed to delete listing");
    }
  };

  if (!currentUser) {
    return null; // This will redirect in the useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">My Dashboard</h1>
          <Link to="/create-listing">
            <Button className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <span>Create New Listing</span>
            </Button>
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="font-medium">{currentUser.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="font-medium">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Account Created
                </p>
                <p className="font-medium">
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Account Type</p>
                <p className="font-medium">
                  {currentUser.isAdmin ? "Administrator" : "Standard User"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {myListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  You don't have any listings yet
                </p>
                <Link to="/create-listing">
                  <Button>Create Your First Listing</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Created
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/product/${listing.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {listing.title}
                          </Link>
                        </TableCell>
                        <TableCell>${listing.price.toFixed(2)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {listing.category}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={listing.isSold ? "destructive" : "outline"}
                          >
                            {listing.isSold ? "Sold" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link to={`/edit-listing/${listing.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit listing"
                                disabled={listing.isSold}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            
                            {!listing.isSold && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Mark as sold"
                                onClick={() => handleMarkAsSold(listing.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
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
                                      handleDeleteListing(listing.id)
                                    }
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
