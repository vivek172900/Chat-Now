import React from 'react';
import { motion } from 'framer-motion';
import { 
    MessageCircle, 
    Github, 
    Twitter, 
    Linkedin, 
    Mail,
    Heart,
    ExternalLink
} from 'lucide-react';

export default function Footer() {
    const footerLinks = {
        product: [
            { name: 'Features', href: '#features' },
            { name: 'Security', href: '#security' },
            { name: 'Pricing', href: '#pricing' },
            { name: 'API', href: '#api' }
        ],
        company: [
            { name: 'About Us', href: '#about' },
            { name: 'Careers', href: '#careers' },
            { name: 'Blog', href: '#blog' },
            { name: 'Press', href: '#press' }
        ],
        support: [
            { name: 'Help Center', href: '#help' },
            { name: 'Contact Us', href: '#contact' },
            { name: 'Status', href: '#status' },
            { name: 'Community', href: '#community' }
        ],
        legal: [
            { name: 'Privacy Policy', href: '#privacy' },
            { name: 'Terms of Service', href: '#terms' },
            { name: 'Cookie Policy', href: '#cookies' },
            { name: 'GDPR', href: '#gdpr' }
        ]
    };

    const socialLinks = [
        { icon: <Github className="w-5 h-5" />, href: '#', label: 'GitHub' },
        { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
        { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
        { icon: <Mail className="w-5 h-5" />, href: '#', label: 'Email' }
    ];

    return (
        <footer className="relative bg-slate-900/80 backdrop-blur-sm border-t border-slate-800">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-50"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-2 rounded-xl">
                                    <MessageCircle className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                                    Chat Now
                                </span>
                            </div>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                Connecting people through seamless, secure, and feature-rich messaging. 
                                Built for the modern world of communication.
                            </p>
                            <div className="flex space-x-4">
                                {socialLinks.map((social, index) => (
                                    <motion.a
                                        key={index}
                                        href={social.href}
                                        className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors duration-300 group"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        aria-label={social.label}
                                    >
                                        <div className="text-gray-400 group-hover:text-cyan-400 transition-colors">
                                            {social.icon}
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Links Sections */}
                    {Object.entries(footerLinks).map(([category, links], index) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-white font-semibold mb-4 capitalize">
                                {category}
                            </h3>
                            <ul className="space-y-3">
                                {links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 flex items-center group"
                                        >
                                            {link.name}
                                            <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Newsletter Section */}
                <motion.div
                    className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-8 mb-12 border border-slate-700"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="max-w-2xl mx-auto text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Stay Updated
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Get the latest updates, features, and news delivered to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                            <motion.button
                                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Subscribe
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Bar */}
                <motion.div
                    className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="text-gray-400 mb-4 md:mb-0 flex items-center">
                        <span>© 2024 Chat Now. Made with </span>
                        <Heart className="w-4 h-4 text-red-500 mx-1" />
                        <span>for better communication.</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <span>Version 2.1.0</span>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>All systems operational</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}