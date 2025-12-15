import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/user.context.jsx";
import axios from "../config/axios";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, logout: contextLogout } = useContext(UserContext);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Call backend logout endpoint
      await axios.post("/logout");
      
      // Clear user context and local storage
      contextLogout();
      
      // Show success message briefly
      setTimeout(() => {
        setLoggingOut(false);
        navigate("/login"); // redirect to login page
      }, 1500);
      
    } catch (error) {
      console.error("Logout failed:", error);
      
      // Even if backend fails, clear local data and redirect
      contextLogout();
      setLoggingOut(false);
      navigate("/login");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/20 backdrop-blur-lg border-b border-white/30 shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="text-2xl font-extrabold bg-gradient-to-r from-violet-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent cursor-pointer animate-gradient"
        >
          🚀 ChatApp with Gemini
        </div>

        {/* Nav Links */}
        <ul className="hidden md:flex space-x-6 font-medium">
          <li>
            <button
              onClick={() => navigate("/")}
              className="relative text-gray-700 hover:text-violet-600 transition-colors group"
            >
              Home
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-violet-500 transition-all group-hover:w-full"></span>
            </button>
          </li>
        </ul>

        {/* User Info and Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <span>Welcome, {user.name || user.email?.split('@')[0] || 'User'}</span>
            </div>
          )}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl shadow hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Logging Out Message */}
      {loggingOut && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800">
              Logging out...
            </p>
            <p className="text-sm text-gray-500 mt-2">Please wait</p>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        .animate-gradient {
          background-size: 300%;
          animation: gradient-shift 5s ease infinite;
        }
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
