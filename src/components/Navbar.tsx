
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, User, ShoppingBag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser, logoutUser } from "@/lib/data";
import { useNavigate } from "react-router-dom";

type NavbarProps = {
  onSearch?: (query: string) => void;
};

const Navbar = ({ onSearch }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
    window.location.reload(); // Simple way to refresh state in this demo
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold text-secondary">TradeNook</span>
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search listings..."
                className="w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="flex items-center">
                    <User className="h-5 w-5 mr-1" />
                    <span>{currentUser.username}</span>
                  </Button>
                </Link>
                <Link to="/create-listing">
                  <Button>Post Listing</Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
                {currentUser.isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline">Admin</Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-secondary" />
            ) : (
              <Menu className="h-6 w-6 text-secondary" />
            )}
          </button>
        </div>

        {/* Mobile search - visible only on mobile */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search listings..."
              className="w-full pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Search className="h-5 w-5 text-gray-400" />
            </button>
          </form>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {currentUser ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block py-2 px-4 text-sm hover:bg-gray-100 rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/create-listing"
                    className="block py-2 px-4 text-sm text-white bg-primary hover:bg-primary-hover rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Post Listing
                  </Link>
                  <button
                    className="block w-full text-left py-2 px-4 text-sm hover:bg-gray-100 rounded"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                  {currentUser.isAdmin && (
                    <Link
                      to="/admin"
                      className="block py-2 px-4 text-sm border border-gray-300 rounded hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 px-4 text-sm hover:bg-gray-100 rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 px-4 text-sm text-white bg-primary hover:bg-primary-hover rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
