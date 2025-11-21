import React from 'react'
import { X } from 'lucide-react'
import ReactPlayer from 'react-player'

const TrailerModal = ({ trailerUrl, onClose }) => {


  if (!trailerUrl) return null



  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
      <div className="relative w-[90%] md:w-[80%] lg:w-[70%] aspect-video bg-black rounded-xl overflow-hidden animate-slideUp">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 text-white rounded-full p-2 z-10 cursor-pointer"
        >
          <X size={22} />
        </button>

        {/* Trailer */}
        <ReactPlayer src={trailerUrl} controls={false}
          className='mx-auto max-w-full' width='100%' height='100%' />
      </div>
    </div>
  )
}

export default TrailerModal
