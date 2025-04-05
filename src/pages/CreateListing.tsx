
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductForm from "@/components/ProductForm";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/data";
import { useEffect } from "react";
import { toast } from "sonner";

const CreateListing = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please login to create a listing");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleSuccess = () => {
    navigate("/dashboard");
  };

  if (!currentUser) {
    return null; // This will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>
        <Card>
          <CardHeader>
            <CardTitle>What are you selling?</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateListing;
