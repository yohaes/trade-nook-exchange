
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone } from "lucide-react";
import { Product } from "@/lib/types";

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const {
    id,
    title,
    price,
    imageUrl,
    location,
    contactPhone,
    condition,
    isSold,
  } = product;

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <Link to={`/product/${id}`}>
          <div className="aspect-square overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          {isSold && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge className="text-lg bg-red-600 px-3 py-2">SOLD</Badge>
            </div>
          )}
        </Link>
      </div>
      <CardContent className="flex-grow p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-xl font-bold mb-2">${price.toFixed(2)}</p>
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-4 w-4 mr-1" />
          <span>{contactPhone}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Badge variant="outline">{condition}</Badge>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
