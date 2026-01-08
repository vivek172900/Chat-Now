import React from 'react';
import { motion } from 'framer-motion';
import { 
    MessageSquare, 
    Video, 
    Lock, 
    Users, 
    FileText, 
    Bell,
    Smartphone,
    Globe,
    Heart
} from 'lucide-react';

export default function FeaturesSection() {
    const features = [
        {
            icon: <MessageSquare className="w-8 h-8" />,
            title: "Real-time Messaging",
            description: "Instant message delivery with read receipts and typing indicators",
            color: "from-cyan-400 to-blue-500"
        },
        {
            icon: <Video className="w-8 h-8" />,
            title: "Video & Voice Calls",
            description: "High-quality video and voice calls with screen sharing capabilities",
            color: "from-blue-500 to-purple-500"
        },
        {
            icon: <Lock className="w-8 h-8" />,
            title: "End-to-End Encryption",
            description: "Your conversations are secured with military-grade encryption",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Group Conversations",
            description: "Create groups, manage members, and organize team discussions",
            color: "from-pink-500 to-red-500"
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "File Sharing",
            description: "Share documents, images, and files up to 100MB instantly",
            color: "from-red-500 to-orange-500"
        },
        {
            icon: <Bell className="w-8 h-8" />,
            title: "Smart Notifications",
            description: "Customizable notifications that keep you connected without overwhelming",
            color: "from-orange-500 to-yellow-500"
        },
        {
            icon: <Smartphone className="w-8 h-8" />,
            title: "Cross-Platform",
            description: "Access your chats from any device - web, mobile, or desktop",
            color: "from-yellow-500 to-green-500"
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Global Reach",
            description: "Connect with people worldwide with multi-language support",
            color: "from-green-500 to-teal-500"
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: "Favorite Chats",
            description: "Pin important conversations and organize your chat list",
            color: "from-teal-500 to-cyan-500"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="py-20 px-6 relative">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div 
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-5xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                            Powerful Features
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Everything you need for modern communication, built with cutting-edge technology
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group relative"
                        >
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 h-full transition-all duration-300 hover:border-slate-600 hover:bg-slate-800/70">
                                {/* Icon */}
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                                    <div className="text-white">
                                        {feature.icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Hover Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Call to Action */}
                <motion.div 
                    className="text-center mt-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                >
                    <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-8 max-w-4xl mx-auto">
                        <h3 className="text-3xl font-bold text-white mb-4">
                            Ready to start chatting?
                        </h3>
                        <p className="text-gray-400 mb-6 text-lg">
                            Join thousands of users who trust Chat Now for their daily communication needs
                        </p>
                        <motion.button
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Start Chatting Now
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}