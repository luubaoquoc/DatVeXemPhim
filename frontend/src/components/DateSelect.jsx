import React, { useState, useEffect } from 'react'
import BlurCircle from './BlurCircle'
import { ChevronLeftIcon, ChevronRightIcon, Type } from 'lucide-react'
import useApi from '../hooks/useApi'


const DateSelect = ({ selected: selectedProp, onSelect, selectRap, onSelectRap, all }) => {

  const api = useApi()
  const [internalSelected, setInternalSelected] = useState(null)
  const selected = selectedProp ?? internalSelected
  const [raps, setRaps] = useState([])


  useEffect(() => {
    const fetchRaps = async () => {
      try {
        const response = await api.get('/rap')
        setRaps(response.data.data || []);
      } catch (error) {
        console.error('Lấy danh sách rạp thất bại:', error);
      }
    };

    fetchRaps();
  }, []);

 const formatLocalDate = (d) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  // default select today (even if no shows) when uncontrolled
  useEffect(() => {
    if (selectedProp) return
    const today = formatLocalDate(new Date())
    setInternalSelected(today)
  }, [selectedProp])

 

  // build array: today and next 5 days (local)
  const dates = Array.from({ length: 6 }).map((_, i) => {
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
          <div className='flex flex-wrap justify-between items-center'>
            <div className='flex items-center justify-center gap-6 text-sm mt-5 '>
              <ChevronLeftIcon width={28} className='cursor-pointer hover:text-gray-400' />
              <span className='grid grid-cols-2 md:flex gap-4 '>
                {dates.map((date) => {
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
                    </button>
                  )
                })}
              </span>
              <ChevronRightIcon width={28} className='cursor-pointer hover:text-gray-400' />
            </div>
            <div>
              <select
                value={selectRap || 'all'}
                onChange={(e) => onSelectRap(e.target.value)}
                className="bg-black border border-primary rounded px-3 py-2 text-sm"
              >
                {all && <option value="all">Tất cả rạp</option>}
                {raps?.map((rap) => (
                  <option key={rap.maRap} value={rap.maRap}>
                    {rap.tenRap}
                  </option>
                ))}
              </select>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default DateSelect
