
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import AuthService from "../api/services/AuthService";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const isAuthenticated = AuthService.isAuthenticated();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-6xl font-bold mb-4 text-pharmacy-600">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        {isAuthenticated ? (
          <Button asChild className="bg-pharmacy-500 hover:bg-pharmacy-600">
            <Link to="/">Return to Dashboard</Link>
          </Button>
        ) : (
          <Button asChild className="bg-pharmacy-500 hover:bg-pharmacy-600">
            <Link to="/login">Return to Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotFound;
