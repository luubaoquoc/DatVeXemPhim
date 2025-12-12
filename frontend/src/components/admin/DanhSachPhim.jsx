import { Star } from "lucide-react";
import React, { useState } from "react";
import SuatChieuPOS from "./SuatChieuPOS";

const DanhSachPhim = ({ movies, onSelectShow }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Danh sách phim */}
      <div className="border-r border-gray-700 p-2 max-h-[75vh] ">
        <h2 className="text-lg font-medium bg-primary-dull p-2 border-b">Danh Sách Phim</h2>
        <div className="overflow-y-auto h-[65vh] no-scrollbar">
          {movies.map((movie) => (
            <div
              key={movie.maPhim}
              onClick={() => setSelectedMovie(movie)}
              className={`flex h-[6rem] bg-black-800 p-4 border-b cursor-pointer ${selectedMovie?.maPhim === movie.maPhim ? "bg-primary/20" : ""}`}
            >
              <img
                src={movie.poster}
                alt={movie.tenPhim}
                className="w-12 h-16 object-cover"
              />

              <div className="ml-4">
                <h3 className="text-xl font-semibold">{movie.tenPhim}</h3>
                <p>{movie.theLoais?.map((tl) => tl.tenTheLoai).join(", ")}</p>

                <p className="flex items-center">
                  <Star className="size-4 text-primary mr-1" />
                  {movie.rating}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suất chiếu */}
      <div className="p-2">
        {selectedMovie ? (
          <SuatChieuPOS
            maPhim={selectedMovie.maPhim}
            date={new Date().toISOString().split("T")[0]}
            onSelectShow={onSelectShow}   // ✔ FIX LỖI
          />
        ) : (
          <div className="text-gray-400 text-center mt-10">
            Chọn phim để xem suất chiếu
          </div>
        )}
      </div>
    </div>
  );
};

export default DanhSachPhim;
