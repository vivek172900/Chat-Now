import React, { useState } from 'react';
import { Eye, EyeOff, Copy } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { authAPI } from '../../utils/api';

const MainCompo = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [ErrorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Fullname: '',
    Username: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (ErrorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    // Basic validation
    if (!formData.Fullname || !formData.Username || !formData.email || !formData.password) {
      setErrorMessage("All fields are required");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const result = await authAPI.register(formData);
      
      if (result.success) {
        // Registration successful
        setErrorMessage("");
        alert("Registration successful! Please login to continue.");
        navigate("/login");
      } else {
        // Handle registration errors
        setErrorMessage(result.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center " style={{
      backgroundImage: "url(https://m.media-amazon.com/images/I/61gRT29sSSL.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }} >
      <div className='min-h-screen w-full bg-gradient-to-r from-gray-950 to-gray-800/60 flex flex-col lg:flex-row justify-center lg:justify-around items-center py-8 lg:py-0'>

        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl space-y-6 sm:space-y-8 h-fit bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-xl mx-4 lg:mx-0">
          {/* Logo and Header */}
          <div className="flex items-center space-x-2 mb-6 sm:mb-8">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full"></div>
            <span className="text-white text-lg sm:text-xl">XENEFER</span>
          </div>

          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2 leading-tight">
                Create new account<span className="text-blue-500">.</span>
              </h1>
              <p className="text-gray-400 mt-3 sm:mt-4 text-sm sm:text-base">
                Already A Member?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }} className="text-blue-500 hover:text-blue-400">
                  Login
                </a>
              </p>
            </div>
            
            <div className='text-red-500 flex justify-center text-sm sm:text-base'>
              {ErrorMessage}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Name Fields */}
              <div className="gap-4">
                <div className="relative">
                  <input
                    type="text"
                    name="Fullname"
                    value={formData.Fullname}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    className="w-full bg-gray-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  <Copy className="absolute right-2 sm:right-3 top-2.5 sm:top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div className="gap-4">
                <div className="relative">
                  <input
                    type="text"
                    name="Username"
                    value={formData.Username}
                    onChange={handleInputChange}
                    placeholder="User name"
                    className="w-full bg-gray-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  <Copy className="absolute right-2 sm:right-3 top-2.5 sm:top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full bg-gray-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <Copy className="absolute right-2 sm:right-3 top-2.5 sm:top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full bg-gray-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-2.5 sm:top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>

              <div className="flex space-x-4 mt-6 sm:mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-1 text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainCompo;