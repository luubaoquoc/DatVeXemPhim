import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const banners = [
  {
    id: 1,
    image: '/cuc-vang-cua-ngoai.jpg',

  },
  {
    id: 2,
    image: '/teeyod.jpg',

  },
  {
    id: 3,
    image: '/nha-ma-xo.jpg',

  },
]

const HeroSection = () => {
  const [current, setCurrent] = useState(0)

  // Tự động chuyển slide mỗi 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
  }, [])

  const active = banners[current]

  return (
    <div className="relative h-[70%] w-full mt-[7rem] overflow-hidden">
      <img
        src={active.image}
        className="w-full h-full object-contain transition-all duration-500"
        alt="banner"
      />

      {/* Nút điều hướng */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-20 cursor-pointer"
      >
        <ChevronLeft className="w-10 h-10" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-20 cursor-pointer"
      >
        <ChevronRight className="w-10 h-10" />
      </button>

      {/* Dấu chấm điều hướng */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {banners.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition ${index === current
              ? 'bg-primary scale-125'
              : 'bg-white/50 hover:bg-white/80'
              }`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroSection
