import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import BlurCircle from '../components/BlurCircle';

const Rap = () => {

  const { maRap } = useParams();
  const publicApi = useApi();

  const [rap, setRap] = useState(null);

  useEffect(() => {
    const fetchRap = async () => {
      try {
        const res = await publicApi.get(`/rap/${maRap}`);
        setRap(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchRap();
  }, [maRap]);

  console.log(rap);

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-40">
      <BlurCircle top='100px' left='100px' />
      <BlurCircle bottom='100px' right='100px' />
      <BlurCircle bottom='-300px' left='100px' />
      <div className="flex flex-col lg:flex-row justify-between gap-10 max-w-7xl mx-auto">
        <div className='space-y-3 flex-1'>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#20B2AA] to-yellow-300/50 bg-clip-text text-transparent">{rap?.tenRap}</h2>
          <p className="mb-2"><strong>Địa chỉ:</strong> {rap?.diaChi}</p>
          <p className="mb-2"><strong>Số điện thoại:</strong> {rap?.soDienThoai}</p>
        </div>

        <img src={rap?.hinhAnh} alt={rap?.tenRap} className='flex-1 w-full' />
      </div>
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto mt-10 mb-40">
        <div className="flex-1">
          <h3 className="text-2xl font-medium mt-10 mb-4 border-l-3 border-primary pl-4">
            Giá vé
          </h3>

          <div className="border border-gray-800">
            {/* Header */}
            <div className="bg-[#4FA7A7] text-white text-center py-4 text-xl font-semibold">
              <p>Bảng giá vé xem phim</p>
              <p className="tracking-widest">GO CIMANE</p>
            </div>

            {/* Content */}
            <div className="grid grid-cols-2 border-t border-gray-800 text-sm">
              {/* Left */}
              <div className="border-r border-gray-800">
                <div className="p-2 border-b border-gray-800">
                  <p className="text-lg font-medium">Ngày tri ân</p>
                  <p className="text-sm text-gray-600">Thứ 2 đầu tiên của tháng</p>
                </div>

                <div className="p-2 border-b border-gray-800">
                  <p className="text-lg font-medium">HAPPY DAY</p>
                  <p className="text-sm text-gray-600">Thứ 3 hàng tuần</p>
                </div>

                <div className="p-2 border-b border-gray-800 text-lg">
                  Thứ 2, 4, 5
                </div>

                <div className="p-2 border-b border-gray-800 text-lg">
                  Thứ 6, 7, CN
                </div>

                <div className="p-2 text-lg">
                  Ngày lễ
                </div>
              </div>

              {/* Right */}
              <div className="text-center">
                <div className="flex items-center justify-center h-[129px] border-b border-gray-800 text-3xl font-semibold">
                  50.000
                </div>

                <div className="flex items-center justify-center h-[45px] border-b border-gray-800 text-3xl font-semibold">
                  60.000
                </div>

                <div className="flex items-center justify-center h-[45px] border-b border-gray-800 text-3xl font-semibold">
                  70.000
                </div>

                <div className="flex items-center justify-center h-[45px] text-3xl font-semibold">
                  75.000
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex-1'>
          <h3 className="text-2xl font-medium mt-10 mb-4 border-l-3 border-primary pl-4">Vị trí rạp</h3>
          <iframe
            title="Google Map"
            className="w-full h-88 overflow-hidden"
            src={rap?.srcMap}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  )
}

export default Rap
