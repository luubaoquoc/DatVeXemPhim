import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPhims } from "../redux/features/phimSlice";
import { useNavigate } from "react-router-dom";
import MoviesCard from "../components/MoviesCard";
import { ChevronRight } from "lucide-react";
import BlurCircle from "../components/BlurCircle";

const GioiThieu = () => {

  const dispatch = useDispatch()
  const allMovies = useSelector(state => state.phim.items || [])
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchPhims())
  }, [])

  const otherMovies = (Array.isArray(allMovies) ? allMovies : [])
    .slice(0, 3)
  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-40">
      <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto">
        <BlurCircle top='100px' left='100px' />
        <BlurCircle bottom='0px' right='100px' />
        <div className="flex-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#20B2AA] to-yellow-300/50 bg-clip-text text-transparent">
            Giới thiệu về GoCinema
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-gray-400">
            <span className="text-primary">Go Cinema</span> là hệ thống rạp chiếu phim hiện đại với mục tiêu
            mang đến cho khách hàng trải nghiệm điện ảnh đỉnh cao – từ những bộ phim bom tấn quốc tế
            đến các tác phẩm điện ảnh Việt Nam chất lượng. Chúng tôi hướng đến việc xây dựng một không gian
            giải trí dành cho mọi lứa tuổi với sự tiện lợi, thân thiện và chuyên nghiệp.
          </p>

          <h2 className="text-2xl font-semibold mt-10 text-white">Sứ mệnh của <span className="text-primary">Go Cinema</span></h2>
          <p className="mt-4 leading-relaxed text-gray-400">
            <span className="text-primary">Go Cinema</span> mong muốn trở thành lựa chọn hàng đầu của khán giả yêu thích phim ảnh.
            Chúng tôi không chỉ cung cấp rạp chiếu phim chất lượng cao mà còn là điểm đến để
            mọi người tận hưởng thời gian thư giãn bên gia đình, bạn bè và người thân.
          </p>

          <h2 className="text-2xl font-semibold mt-10 text-white">Trải nghiệm vượt trội</h2>
          <ul className="list-disc mt-4 ml-6 space-y-2 text-gray-400">
            <li>Hệ thống phòng chiếu đạt chuẩn quốc tế, âm thanh vòm sống động.</li>
            <li>Màn hình lớn sắc nét, công nghệ chiếu phim tiên tiến.</li>
            <li>Ghế ngồi êm ái, bố trí khoa học mang lại sự thoải mái.</li>
            <li>Đặt vé nhanh chóng qua website và ứng dụng <span className="text-primary">Go Cinema</span>.</li>
            <li>Liên tục cập nhật phim mới, đa dạng thể loại.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 text-white">Tại sao nên chọn <span className="text-primary">Go Cinema</span>?</h2>
          <p className="mt-4 leading-relaxed text-gray-400">
            <span className="text-primary">Go Cinema</span> luôn đặt khách hàng làm trung tâm. Chúng tôi cam kết mang đến:
          </p>
          <ul className="list-disc mt-3 ml-6 space-y-2 text-gray-400">
            <li>Dịch vụ chuyên nghiệp và thân thiện.</li>
            <li>Giá vé hợp lý cùng nhiều ưu đãi hấp dẫn.</li>
            <li>Không gian sạch sẽ, an toàn và thoải mái.</li>
            <li>Thanh toán linh hoạt, bảo mật thông tin khách hàng.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 text-white">Tầm nhìn</h2>
          <p className="mt-4 leading-relaxed text-gray-400">
            Trong tương lai, <span className="text-primary">Go Cinema</span> hướng đến mở rộng mạng lưới rạp chiếu trên toàn quốc,
            kết hợp công nghệ tiên tiến để mang đến trải nghiệm xem phim tốt nhất cho mọi người.
          </p>

          <p className="mt-10 text-2xl text-gray-200 font-semibold">
            <span className="text-primary">Go Cinema</span> – Nơi trải nghiệm điện ảnh thăng hoa!
          </p>
        </div>


        {/* ==== CỘT PHẢI: PHIM ĐANG CHIẾU ==== */}
        <div className="w-full lg:w-1/4">
          <h3 className="text-xl font-medium mb-4 border-l-3 pl-2 border-primary">
            Phim đang chiếu
          </h3>
          <div className="flex flex-row flex-wrap lg:flex-col gap-6">
            {otherMovies.length > 0
              ? otherMovies.map((m, idx) => (
                <MoviesCard key={idx} movie={m} />
              ))
              : (
                <p className="text-gray-400 text-sm">Hiện chưa có phim khác</p>
              )}
          </div>
          <div className='flex justify-center mt-5'>
            <button onClick={() => { navigate('/phims'); scrollTo(0, 0) }}
              className=' flex px-10 py-3 border border-primary hover:bg-primary-dull transition rounded-md
          font-medium cursor-pointer'>
              Xem thêm
              <ChevronRight />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GioiThieu;
