
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProductById, getCurrentUser, markProductAsSold } from "@/lib/data";
import { Product } from "@/lib/types";
import { toast } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { MapPin, Phone, Calendar, CheckCircle, AlertTriangle } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (id) {
      const fetchedProduct = getProductById(id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
      } else {
        toast.error("Product not found");
        navigate("/");
      }
    }
    setLoading(false);
  }, [id, navigate]);

  const handleMarkAsSold = () => {
    if (id && product) {
      const success = markProductAsSold(id);
      if (success) {
        setProduct({ ...product, isSold: true });
        toast.success("Listing marked as sold");
      } else {
        toast.error("Failed to mark listing as sold");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Card className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-gray-500 mb-4">
              The product you are looking for does not exist or has been removed.
            </p>
            <Link to="/">
              <Button>Go back to Home</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.id === product.sellerId;
  const canEdit = isOwner && !product.isSold;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="text-primary hover:underline">
            &larr; Back to listings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Product Image - Takes up 3/5 columns on large screens */}
          <div className="lg:col-span-3">
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Product Info - Takes up 2/5 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-3xl font-bold">{product.title}</h1>
                {product.isSold && (
                  <Badge variant="destructive" className="text-base px-3 py-1">
                    SOLD
                  </Badge>
                )}
              </div>

              <div className="text-3xl font-bold text-primary mb-6">
                ${product.price.toFixed(2)}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{product.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>{product.contactPhone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>
                    Posted {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="font-medium mr-2">Condition:</span>
                  <Badge variant="outline">{product.condition}</Badge>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Category:</span>
                  <span>{product.category}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="mb-6">
                <h2 className="font-semibold text-lg mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="font-semibold text-lg mb-2">Seller</h2>
                <p>{product.sellerName}</p>
              </div>

              {/* Admin/Owner Actions */}
              {(isOwner || (currentUser && currentUser.isAdmin)) && (
                <div className="space-y-3">
                  {canEdit && (
                    <Link to={`/edit-listing/${product.id}`}>
                      <Button className="w-full">Edit Listing</Button>
                    </Link>
                  )}
                  {isOwner && !product.isSold && (
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      onClick={handleMarkAsSold}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Sold
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
