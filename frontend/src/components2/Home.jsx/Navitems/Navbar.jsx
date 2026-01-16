import React, { useState } from "react";
import Menu from "./Menu";
import { motion } from "framer-motion";
import { MessageCircle, Menu as MenuIcon, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export default function Navbar() {
    const [showOptions, setShowOptions] = useState(false);
    const navigate = useNavigate();
    const { isSignedIn, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const toggleMenu = () => {
        setShowOptions((prev) => !prev);
    };

    const navItems = [
        { name: 'Features', href: '#features' },
        { name: 'Security', href: '#security' },
        { name: 'About', href: '#about' },
        { name: 'Help', href: '#help' }
    ];

    return (
        <motion.nav 
            className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <motion.div 
                        className="flex items-center space-x-3"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-2 rounded-xl">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                            Chat Now
                        </span>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item, index) => (
                            <motion.a
                                key={index}
                                href={item.href}
                                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium"
                                whileHover={{ y: -2 }}
                            >
                                {item.name}
                            </motion.a>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {!isSignedIn ? (
                            <>
                                <motion.button
                                    onClick={() => navigate('/login')}
                                    className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Sign In
                                </motion.button>
                                <motion.button
                                    onClick={() => navigate('/signup')}
                                    className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Get Started
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <motion.button
                                    onClick={() => navigate('/chat')}
                                    className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Dashboard
                                </motion.button>
                                <motion.button
                                    onClick={handleLogout}
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <LogOut size={18} />
                                    Logout
                                </motion.button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        className="md:hidden text-white p-2"
                        onClick={toggleMenu}
                        whileTap={{ scale: 0.95 }}
                    >
                        {showOptions ? <X size={24} /> : <MenuIcon size={24} />}
                    </motion.button>
                </div>
            </div>

            {/* Mobile Menu */}
            <Menu isVisible={showOptions} onClose={() => setShowOptions(false)} />
        </motion.nav>
    );
}
