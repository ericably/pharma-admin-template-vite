import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../api/services/AuthService";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if authenticated, otherwise to login
    if (AuthService.isAuthenticated()) {
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pharmacy-600"></div>
    </div>
  );
};

export default Index;
