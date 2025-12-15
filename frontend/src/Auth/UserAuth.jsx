import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate } from "react-router-dom";

const UserAuth = ({ children }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Check if both user and token exist
    if (user && token) {
      setLoading(false);
    } else if (!token) {
      // No token, redirect to login
      navigate("/login");
    } else if (!user) {
      // Token exists but no user, redirect to login
      navigate("/login");
    }
  }, [user, navigate]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading...</p>
          <p className="text-gray-400 text-sm">Please wait while we verify your session</p>
        </div>
      </div>
    );
  }

  // If we have both user and token, render the protected content
  if (user && localStorage.getItem("token")) {
    return <>{children}</>;
  }

  // Fallback - shouldn't reach here but just in case
  return null;
};

export default UserAuth;
