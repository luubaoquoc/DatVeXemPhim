import React, { useEffect } from "react";
import BlurCircle from "../components/BlurCircle";
import { fetchPhims } from "../redux/features/phimSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MoviesCard from "../components/MoviesCard";
import { ChevronRight, Mail, Phone, PhoneCall } from "lucide-react";

const ChinhSachBaoMat = () => {

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
            Chính Sách Bảo Mật
          </h1>

          <p className="mt-4 text-lg text-gray-400">
            <span className="text-primary">Go Cinema</span> cam kết bảo mật thông tin cá nhân của khách hàng và đảm bảo rằng mọi dữ liệu bạn cung cấp
            đều được xử lý một cách an toàn, minh bạch và tuân thủ theo quy định của pháp luật Việt Nam.
          </p>

          {/* 1. Thông tin thu thập */}
          <h2 className="text-2xl font-semibold mt-10 text-white">
            1. Thông tin chúng tôi thu thập
          </h2>
          <p className="mt-4 leading-relaxed text-gray-400">
            Khi bạn sử dụng dịch vụ của <span className="text-primary">Go Cinema</span>, chúng tôi có thể thu thập các thông tin sau:
          </p>
          <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-400">
            <li>Họ tên, số điện thoại, email.</li>
            <li>Thông tin tài khoản khi đăng ký/đăng nhập.</li>
            <li>Dữ liệu đặt vé như suất chiếu, ghế ngồi, lịch sử giao dịch.</li>
            <li>Thông tin thiết bị và trình duyệt (IP, cookie,...).</li>
          </ul>

          {/* 2. Mục đích thu thập */}
          <h2 className="text-2xl font-semibold mt-10 text-white">
            2. Mục đích sử dụng thông tin
          </h2>
          <p className="mt-4 text-gray-300">
            Chúng tôi sử dụng thông tin khách hàng nhằm:
          </p>
          <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-400">
            <li>Cung cấp dịch vụ đặt vé và quản lý tài khoản người dùng.</li>
            <li>Gửi thông báo về lịch chiếu, giao dịch và khuyến mãi.</li>
            <li>Nâng cao trải nghiệm sử dụng website và ứng dụng.</li>
            <li>Ngăn chặn gian lận và bảo vệ an toàn hệ thống.</li>
          </ul>

          {/* 3. Lưu trữ thông tin */}
          <h2 className="text-2xl font-semibold mt-10 text-white">
            3. Thời gian lưu trữ thông tin
          </h2>
          <p className="mt-4 text-gray-300">
            Thông tin cá nhân của khách hàng sẽ được lưu trữ trong hệ thống GoCinema cho đến khi:
          </p>
          <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-400">
            <li>Bạn yêu cầu xoá tài khoản.</li>
            <li>GoCinema không còn cần sử dụng thông tin cho mục đích cung cấp dịch vụ.</li>
          </ul>

          {/* 4. Bảo vệ thông tin */}
          <h2 className="text-2xl font-semibold mt-10 text-white">
            4. Bảo vệ thông tin cá nhân
          </h2>
          <p className="mt-4 text-gray-300 leading-relaxed">
            GoCinema sử dụng nhiều biện pháp kỹ thuật để bảo vệ thông tin người dùng như:
          </p>
          <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-400">
            <li>Mã hoá dữ liệu quan trọng.</li>
            <li>Kiểm soát truy cập và giới hạn quyền đối với dữ liệu.</li>
            <li>Hệ thống tường lửa và phát hiện xâm nhập.</li>
          </ul>

          {/* 5. Chia sẻ thông tin */}
          <h2 className="text-2xl font-semibold mt-10 text-white">
            5. Chia sẻ thông tin với bên thứ ba
          </h2>
          <p className="mt-4 text-gray-300">
            GoCinema chỉ chia sẻ thông tin cá nhân trong các trường hợp sau:
          </p>
          <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-400">
            <li>Khi có sự đồng ý của bạn.</li>
            <li>Theo yêu cầu của cơ quan nhà nước có thẩm quyền.</li>
            <li>Với đối tác vận hành dịch vụ thanh toán, bảo mật,…</li>
          </ul>

          {/* 6. Quyền của người dùng */}
          <h2 className="text-2xl font-semibold mt-10 text-white">
            6. Quyền của khách hàng
          </h2>
          <p className="mt-4 text-gray-300">
            Bạn có quyền:
          </p>
          <ul className="list-disc ml-6 mt-3 space-y-2 text-gray-400">
            <li>Yêu cầu xem, chỉnh sửa hoặc xoá thông tin cá nhân.</li>
            <li>Yêu cầu ngừng nhận email quảng cáo hoặc thông báo.</li>
            <li>Gửi khiếu nại liên quan đến việc bảo mật dữ liệu.</li>
          </ul>

          {/* 7. Liên hệ */}
          <h2 className="text-2xl font-semibold mt-10 text-white">
            7. Liên hệ
          </h2>
          <p className="mt-4 text-gray-300 leading-relaxed">
            Nếu bạn có bất kỳ câu hỏi nào liên quan đến chính sách bảo mật, vui lòng liên hệ:
          </p>
          <p className="mt-2 text-gray-400">
            <Mail className="inline-block mr-2  size-5" />
            Email: gocinema.@gmail.com
            <br />
            <PhoneCall className="inline-block mr-2 text-red-400 size-5" />
            Hotline: 0939 779 138
          </p>

          <p className="mt-10 text-2xl text-gray-200 font-semibold">
            <span className="text-primary">Go Cinema</span> cam kết luôn bảo vệ quyền riêng tư của khách hàng.
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
              className=' flex px-10 py-3 border border-primary bg-primary-dull hover:bg-primary transition rounded-md
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

export default ChinhSachBaoMat;
