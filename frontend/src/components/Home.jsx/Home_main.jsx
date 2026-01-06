import React from 'react'
import Navbar from './Navitems/Navbar'
import { motion } from 'framer-motion'
import Home_middle from './Home_middle'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import Footer from './Footer'

export default function Home_main() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <Footer />
        </div>
    )
}
