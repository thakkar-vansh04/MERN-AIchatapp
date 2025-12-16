import React, { useContext, useEffect } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate } from "react-router-dom";

const UserAuth = ({ children }) => {
  const { user, isLoading } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until context has finished loading from storage
    if (isLoading) return;

    // Check for token in both storages
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    // If no user or no token after loading, redirect to login
    if (!user || !token) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Show loading spinner while context is initializing
  if (isLoading) {
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

  // Check for token in both storages
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // If we have both user and token, render the protected content
  if (user && token) {
    return <>{children}</>;
  }

  // Fallback - show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg font-semibold">Redirecting...</p>
      </div>
    </div>
  );
};

export default UserAuth;
