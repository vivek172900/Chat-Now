import React, { useState, } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [rememberMe, setRememberMe] = useState(false);

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
        if (!formData.email || !formData.password) {
            setErrorMessage("Email and password are required");
            setIsLoading(false);
            return;
        }

        try {
            const result = await authAPI.login(formData);
            
            if (result.success && result.data.token && result.data.user) {
                // Store user data and token
                localStorage.setItem("Email", result.data.user.email);
                localStorage.setItem("Fullname", result.data.user.Fullname);
                localStorage.setItem("Username", result.data.user.Username);
                localStorage.setItem("UserId", result.data.user.id);
                localStorage.setItem("authToken", result.data.token);
                
                // Clear error and navigate
                setErrorMessage("");
                navigate("/chat");
            } else {
                // Handle login errors
                setErrorMessage(result.error || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage("Network error. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center" style={{
            backgroundImage: "url(https://m.media-amazon.com/images/I/61gRT29sSSL.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }} >
            <div className='min-h-screen w-full bg-gradient-to-r from-gray-950 to-gray-800/60 flex flex-col lg:flex-row justify-center lg:justify-around items-center py-8 lg:py-0'>
                <div className="w-full h-fit max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl space-y-6 sm:space-y-8 bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-xl backdrop-blur-lg mx-4 lg:mx-0">
                    {/* Logo and Header */}
                    <div className="flex items-center space-x-2 mb-6 sm:mb-8">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full"></div>
                        <span className="text-white text-lg sm:text-xl">XENEFER</span>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <p className="text-gray-400 text-xs sm:text-sm">WELCOME BACK</p>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2 leading-tight">
                                Login to your account<span className="text-blue-500">.</span>
                            </h1>
                            <p className="text-gray-400 mt-3 sm:mt-4 text-sm sm:text-base">
                                New Here?{' '}
                                <a href="/" onClick={(e) => { e.preventDefault(); navigate("/signup") }} className="text-blue-500 hover:text-blue-400">
                                    Create an Account
                                </a>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                            <div className='text-red-500 text-center text-sm sm:text-base'>
                                {ErrorMessage}
                            </div>
                            {/* Email Field */}
                            <div className="space-y-1">
                                <label htmlFor="email" className="text-xs sm:text-sm text-gray-300">Email address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                    placeholder="Enter your email"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <label htmlFor="password" className="text-xs sm:text-sm text-gray-300">Password</label>
                                    <a href="/" className="text-xs sm:text-sm text-blue-500 hover:text-blue-400">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 sm:right-3 top-2.5 sm:top-3 text-gray-400"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me Checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700"
                                />
                                <label htmlFor="remember" className="ml-2 text-xs sm:text-sm text-gray-300">
                                    Remember me
                                </label>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mt-4 sm:mt-6 text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Logging in..." : "Log in"}
                            </button>

                            {/* Social Login */}
                            <div className="mt-4 sm:mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-600"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs sm:text-sm">
                                        <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                                    </div>
                                </div>

                                <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                                    <button
                                        type="button"
                                        className="w-full px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                                    >
                                        <span>Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="w-full px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                                    >
                                        <span>GitHub</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Welcome Section - Hidden on mobile, visible on larger screens */}
                <div className='hidden lg:flex items-center justify-center'>
                    <div className='w-fit h-fit bg-black rounded-lg p-3'>
                        <div className="text-4xl sm:text-6xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center"
                            style={{
                                backgroundImage: "url(https://i.pinimg.com/736x/c9/01/d6/c901d66c7e1ddcc4293df9c03949decb.jpg)",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                backgroundSize: "cover"
                            }}>
                            Welcome!!
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;