import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useApi from '../hooks/useApi'
import Loading from './Loading'

const HeroSection = () => {
  const api = useApi()
  const [current, setCurrent] = useState(0)
  const [banners, setBanners] = useState([])

  // Fetch banner
  const fetchBanners = async () => {
    try {
      const response = await api.get('/anhbanner')
      setBanners(response.data || [])
    } catch (error) {
      console.error('Lỗi tải ảnh banner:', error)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  // Auto slide — CHỈ chạy khi có banner
  useEffect(() => {
    if (banners.length === 0) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [banners.length])

  const nextSlide = () => {
    if (banners.length > 0) {
      setCurrent((prev) => (prev + 1) % banners.length)
    }
  }

  const prevSlide = () => {
    if (banners.length > 0) {
      setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
    }
  }


  if (banners.length === 0) {
    return <Loading />
  }

  const active = banners[current]

  return (
    <div className="relative h-[70%] w-full mt-[7rem] overflow-hidden">
      <img
        src={active?.anh}
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

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {banners.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition ${index === current ? 'bg-primary scale-125' : 'bg-white/50'
              }`}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default HeroSection
