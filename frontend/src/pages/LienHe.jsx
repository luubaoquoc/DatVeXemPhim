import React from "react";
import BlurCircle from "../components/BlurCircle";

const LienHe = () => {
  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-40">
      <BlurCircle top='100px' left='100px' />
      <BlurCircle bottom='0px' right='100px' />
      {/* Tiêu đề */}
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#20B2AA] to-yellow-300/50 bg-clip-text text-transparent">
        Liên hệ GoCinema
      </h1>

      <p className="mt-4 text-lg text-gray-300">
        Nếu bạn có bất kỳ câu hỏi, góp ý hoặc yêu cầu hỗ trợ nào, vui lòng liên hệ với chúng tôi
        qua thông tin dưới đây hoặc gửi tin nhắn trực tiếp bằng biểu mẫu.
      </p>

      {/* Thông tin liên hệ */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Thông tin liên hệ</h2>

          <div className="space-y-3 text-gray-300">
            <p>📍 <strong>Địa chỉ:</strong> 48 Cao Thắng, Quận Hải Châu, TP. Đà Nẵng</p>
            <p>📞 <strong>Hotline:</strong> 0939 779 138</p>
            <p>📧 <strong>Email:</strong> gocinema.@gmail.com</p>
            <p>🕒 <strong>Thời gian làm việc:</strong> 8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">Kết nối với chúng tôi</h2>
          <div className="flex items-center gap-4 text-gray-300">
            <a href="#" className="hover:text-white">🌐 Facebook</a>
            <a href="#" className="hover:text-white">🌐 Instagram</a>
            <a href="#" className="hover:text-white">🌐 YouTube</a>
          </div>
        </div>

        {/* Form liên hệ */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Gửi tin nhắn</h2>

          <form className="space-y-5">
            <div>
              <label className="block mb-1 text-sm">Họ và tên</label>
              <input
                type="text"
                className="w-full p-3 rounded bg-black border border-primary focus:border-[#20B2AA] outline-none"
                placeholder="Nhập họ tên của bạn"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Email</label>
              <input
                type="email"
                className="w-full p-3 rounded bg-black border border-primary focus:border-[#20B2AA] outline-none"
                placeholder="Nhập email"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Tin nhắn</label>
              <textarea
                rows="4"
                className="w-full p-3 rounded bg-black border border-primary focus:border-[#20B2AA] outline-none"
                placeholder="Nội dung cần hỗ trợ..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#20B2AA] hover:bg-[#1a908b] transition rounded font-semibold text-white cursor-pointer"
            >
              Gửi liên hệ
            </button>
          </form>
        </div>
      </div>

      {/* Google map (tuỳ chọn) */}
      <div className="mt-14">
        <h2 className="text-2xl font-semibold text-white mb-4">Vị trí của chúng tôi</h2>
        <div className="w-full h-72 rounded-lg overflow-hidden">
          <iframe
            title="Google Map"
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2712.2870129784346!2d108.24751969129329!3d15.974266069277872!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421168cbea003d%3A0xabbc1bca6654719f!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBTxrAgcGjhuqFtIEvhu7kgdGh14bqtdCwgxJDhuqFpIGjhu41jIMSQw6AgTuG6tW5nIC0gQ8ahIHPhu58gMg!5e0!3m2!1svi!2s!4v1765550166451!5m2!1svi!2s"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default LienHe;
