import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Shield, Zap } from 'lucide-react';
import Star_button from './Star_button';

export default function HeroSection() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/login");
    };

    const handleSignup = () => {
        navigate("/signup");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <motion.div 
                className="relative z-10 text-center px-6 max-w-6xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Main Heading */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-6xl md:text-8xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                            Chat Now
                        </span>
                    </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.div variants={itemVariants}>
                    <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
                        Connect instantly with friends and family
                    </p>
                </motion.div>

                {/* Description */}
                <motion.div variants={itemVariants}>
                    <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Experience seamless real-time messaging with advanced features like video calls, 
                        file sharing, and secure conversations. Built for modern communication needs.
                    </p>
                </motion.div>

                {/* Feature Icons */}
                <motion.div 
                    variants={itemVariants}
                    className="flex justify-center space-x-8 mb-12"
                >
                    <div className="flex flex-col items-center text-cyan-400">
                        <MessageCircle size={32} className="mb-2" />
                        <span className="text-sm">Real-time Chat</span>
                    </div>
                    <div className="flex flex-col items-center text-blue-400">
                        <Users size={32} className="mb-2" />
                        <span className="text-sm">Group Chats</span>
                    </div>
                    <div className="flex flex-col items-center text-purple-400">
                        <Shield size={32} className="mb-2" />
                        <span className="text-sm">Secure</span>
                    </div>
                    <div className="flex flex-col items-center text-pink-400">
                        <Zap size={32} className="mb-2" />
                        <span className="text-sm">Fast</span>
                    </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div 
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row justify-center gap-6"
                >
                    <Star_button 
                        b_name="Get Started" 
                        handleOnclick={handleSignup}
                        classname="text-lg"
                    />
                    <button
                        onClick={handleLogin}
                        className="bg-transparent border-2 border-gray-600 text-white font-semibold px-8 py-4 rounded-xl hover:border-cyan-400 hover:text-cyan-400 transition-colors duration-300 text-lg"
                    >
                        Sign In
                    </button>
                </motion.div>

                {/* Stats */}
                <motion.div 
                    variants={itemVariants}
                    className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                >
                    <div className="text-center">
                        <div className="text-3xl font-bold text-cyan-400">10K+</div>
                        <div className="text-gray-400">Active Users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400">99.9%</div>
                        <div className="text-gray-400">Uptime</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400">24/7</div>
                        <div className="text-gray-400">Support</div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
                </div>
            </motion.div>
        </div>
    );
}