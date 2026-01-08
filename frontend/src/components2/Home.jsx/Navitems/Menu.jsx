import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, MessageCircle, Shield, Users, HelpCircle } from "lucide-react";

export default function Menu({ isVisible, onClose }) {
  const navigate = useNavigate();

  const menuVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const menuItems = [
    { name: 'Features', href: '#features', icon: <MessageCircle className="w-5 h-5" /> },
    { name: 'Security', href: '#security', icon: <Shield className="w-5 h-5" /> },
    { name: 'About', href: '#about', icon: <Users className="w-5 h-5" /> },
    { name: 'Help', href: '#help', icon: <HelpCircle className="w-5 h-5" /> }
  ];

  const handleSignIn = () => {
    navigate('/login');
    onClose();
  };

  const handleGetStarted = () => {
    navigate('/signup');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 ${isVisible ? 'block' : 'hidden'}`}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={overlayVariants}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />

      {/* Menu */}
      <motion.div
        className="fixed top-0 right-0 h-full w-80 bg-slate-900/95 backdrop-blur-md border-l border-slate-800 text-white flex flex-col z-50"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={menuVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-2 rounded-xl">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Chat Now
            </span>
          </div>
          <motion.button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-6">
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                className="flex items-center space-x-3 p-4 rounded-xl hover:bg-slate-800/50 transition-colors group"
                whileHover={{ x: 5 }}
                onClick={onClose}
              >
                <div className="text-gray-400 group-hover:text-cyan-400 transition-colors">
                  {item.icon}
                </div>
                <span className="text-lg font-medium group-hover:text-cyan-400 transition-colors">
                  {item.name}
                </span>
              </motion.a>
            ))}
          </nav>
        </div>

        {/* Auth Buttons */}
        <div className="p-6 border-t border-slate-800 space-y-4">
          <motion.button
            onClick={handleSignIn}
            className="w-full text-left p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-lg font-medium">Sign In</span>
          </motion.button>
          <motion.button
            onClick={handleGetStarted}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
