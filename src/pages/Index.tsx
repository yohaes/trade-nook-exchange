
import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProductGrid from "@/components/ProductGrid";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={handleSearch} />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-primary to-secondary text-white py-12 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              Buy and Sell in Your Local Community
            </h1>
            <p className="text-xl max-w-2xl mx-auto">
              Find great deals nearby or sell your items to people in your area.
              TradeNook makes local commerce easy.
            </p>
          </div>
        </div>
        <ProductGrid searchQuery={searchQuery} />
      </main>
      <footer className="bg-gray-100 py-6 px-4">
        <div className="container mx-auto text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} TradeNook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
