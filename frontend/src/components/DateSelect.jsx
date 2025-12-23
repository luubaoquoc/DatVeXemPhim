import React, { useState, useEffect } from 'react'
import BlurCircle from './BlurCircle'
import { ChevronLeftIcon, ChevronRightIcon, Type } from 'lucide-react'


const DateSelect = ({ selected: selectedProp, onSelect }) => {




  const [internalSelected, setInternalSelected] = useState(null)
  const selected = selectedProp ?? internalSelected



  // default select today (even if no shows) when uncontrolled
  useEffect(() => {
    if (selectedProp) return
    const today = formatLocalDate(new Date())
    setInternalSelected(today)
  }, [selectedProp])

  const formatLocalDate = (d) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  // build array: today and next 4 days (local)
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const dt = new Date()
    dt.setDate(dt.getDate() + i)
    return formatLocalDate(dt)
  })



  return (
    <div id='dateSelect' className='pt-20'>
      <BlurCircle bottom='100px' left='100px' />
      <BlurCircle bottom='100px' right='400px' />
      <div className='flex flex-col md:flex-row items-center gap-10 relative p-4 bg-primary/10
      border border-primary/20 rounded-lg'>

        <div className='w-full'>
          <p className='text-lg font-semibold'>Lịch chiếu</p>
          <div className='flex items-center justify-center gap-6 text-sm mt-5'>
            <ChevronLeftIcon width={28} className='cursor-pointer hover:text-gray-400' />
            <span className='grid grid-cols-3 md:flex flex-wrap justify-center  gap-4'>
              {dates.map((date) => {
                // const shows = dateTime?.[date] || []
                // const hasShows = Array.isArray(shows) && shows.length > 0
                // Dates are always selectable; if no shows, show muted style
                return (
                  <button
                    key={date}
                    onClick={() => {
                      if (onSelect) onSelect(date)
                      else setInternalSelected(date)
                    }}
                    className={`relative flex flex-col items-center justify-center h-18 w-18 
                aspect-square rounded cursor-pointer ${selected === date ? 'bg-primary text-white' : 'border border-primary/70'} `}>
                    <span className='text-lg'>{new Date(date).getDate()}</span>
                    <span className='text-xs'>{new Date(date).toLocaleDateString('vi-VN', { month: 'short' })}</span>
                    {/* optional badge for counts
                    {hasShows && (
                      <span className='absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1'>
                        {shows.length}
                      </span>
                    )} */}
                  </button>
                )
              })}
            </span>
            <ChevronRightIcon width={28} className='cursor-pointer hover:text-gray-400' />
          </div>
        </div>

      </div>
      {/* SuatChieu is rendered by the parent so it can share selected state with other components */}
    </div>
  )
}

export default DateSelect
