
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { mockCategories, createProduct, markProductAsPaid } from "@/lib/data";
import { getCurrentUser } from "@/lib/data";
import { toast } from "sonner";
import { Upload, ImageIcon, X } from "lucide-react";

type ProductFormProps = {
  onSuccess?: () => void;
};

const ProductForm = ({ onSuccess }: ProductFormProps) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    condition: "",
    location: "",
    contactPhone: "",
    showPaymentForm: false,
    isSubmitting: false,
    paymentProcessing: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isFormValid = () => {
    return (
      formData.title &&
      formData.description &&
      formData.price &&
      (imageFile || formData.imageUrl) &&
      formData.category &&
      formData.condition &&
      formData.location &&
      formData.contactPhone
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("You must be logged in to create a listing");
      navigate("/login");
      return;
    }

    if (!isFormValid()) {
      toast.error("Please fill out all fields");
      return;
    }

    setFormData((prev) => ({ ...prev, isSubmitting: true }));

    // For demo purposes, we're just showing the payment form
    setFormData((prev) => ({
      ...prev,
      isSubmitting: false,
      showPaymentForm: true,
    }));
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData((prev) => ({ ...prev, paymentProcessing: true }));

    // In a real implementation, we would upload the image to the server here
    // For now, we'll just use the preview URL or the entered URL
    const finalImageUrl = imagePreview || formData.imageUrl;

    // Simulate payment processing
    setTimeout(() => {
      try {
        // Create the product
        const newProduct = createProduct({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          imageUrl: finalImageUrl,
          category: formData.category,
          condition: formData.condition as any,
          location: formData.location,
          contactPhone: formData.contactPhone,
        });

        if (newProduct) {
          // Mark as paid
          markProductAsPaid(newProduct.id);
          
          toast.success("Your listing has been created successfully!");
          
          if (onSuccess) {
            onSuccess();
          } else {
            navigate(`/product/${newProduct.id}`);
          }
        } else {
          toast.error("Failed to create listing");
        }
      } catch (error) {
        console.error("Error creating product:", error);
        toast.error("An error occurred while creating your listing");
      } finally {
        setFormData((prev) => ({ ...prev, paymentProcessing: false }));
      }
    }, 1500);
  };

  // If showing payment form
  if (formData.showPaymentForm) {
    return (
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-6">Payment for Listing Fee</h2>
          <p className="mb-4 text-gray-600">
            A $5.00 fee is required to post your listing.
          </p>
          
          <form onSubmit={handlePaymentSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  placeholder="John Smith"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiration Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={formData.paymentProcessing}
              >
                {formData.paymentProcessing ? "Processing..." : "Pay $5.00 & Post Listing"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Main form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What are you selling?"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your item in detail..."
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="price">Price ($)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Product Image</Label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        {!imagePreview ? (
          <div className="grid grid-cols-1 gap-4">
            <div
              onClick={triggerFileInput}
              className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary"
            >
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to upload an image</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF up to 5MB</p>
            </div>
            
            <div>
              <Label htmlFor="imageUrl">Or provide an image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Product preview"
              className="w-full h-64 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={handleSelectChange("category")}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {mockCategories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="condition">Condition</Label>
          <Select
            value={formData.condition}
            onValueChange={handleSelectChange("condition")}
          >
            <SelectTrigger id="condition">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Like New">Like New</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Neighborhood or area"
          required
        />
      </div>

      <div>
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <Input
          id="contactPhone"
          name="contactPhone"
          value={formData.contactPhone}
          onChange={handleChange}
          placeholder="555-123-4567"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={formData.isSubmitting}
      >
        {formData.isSubmitting ? "Submitting..." : "Continue to Payment"}
      </Button>
    </form>
  );
};

export default ProductForm;
