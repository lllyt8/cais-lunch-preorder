'use client'

import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-48 md:h-64 overflow-hidden"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80')`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            CAIS × My Cup of Tea
          </h1>
          <p className="text-white/80 text-lg">
            Fresh, Healthy Kids&apos; Meals
          </p>
        </motion.div>
      </div>

      {/* Decorative Badge */}
      <div className="absolute top-4 right-4">
        <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          Order Now
        </div>
      </div>
    </motion.div>
  )
}
