import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-black text-primary mb-2">404</p>
        <h1 className="mb-3 text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or may have moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/category">
              <Search className="w-4 h-4" /> Browse Products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
