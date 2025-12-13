import React, { useEffect, useState } from 'react'
import useApi from '../hooks/useApi'
import { useNavigate } from 'react-router-dom'
import { MapPin, PhoneCall } from 'lucide-react'

const ChonRap = () => {
  const api = useApi()
  const [raps, setRaps] = useState([])
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRaps = async () => {
      try {
        const res = await api.get('/rap')
        setRaps(res.data.data)
      } catch (error) {
        console.log(error);
        setRaps([])
      }
    }
    fetchRaps()
  }, [])

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-16 lg:px-40 py-30 md:pt-40 '>
      {raps.map(rap => (
        <div onClick={() => { navigate(`/lich-chieu/${rap.maRap}`); scrollTo(0, 0) }}
          key={rap.maRap} className="p-4 border border-primary rounded-lg mb-4 md:mb-0 md:mr-4 flex-1 cursor-pointer">
          <img src={rap.hinhAnh} alt={rap.tenRap} className="w-full h-40 object-cover rounded-lg hover:translate-y-1 transition" />
          <h3 className="text-lg font-semibold my-2">{rap.tenRap}</h3>
          <div className='flex justify-between'>
            <div className='space-y-1'>
              <p className="text-sm text-gray-400"><MapPin className='inline-block mr-1 text-blue-500 size-4' />{rap.diaChi}</p>
              <p className="text-sm text-gray-400"><PhoneCall className='inline-block mr-1 text-red-500 size-4' />{rap.soDienThoai}</p>
            </div>
            <button className='border border-primary py-2 px-4 rounded-lg hover:bg-primary transition cursor-pointer'>Xem chi tiết</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChonRap
