import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import useApi from '../hooks/useApi';
import MoviesCard from '../components/MoviesCard';

const GoiYPhim = () => {
  const api = useApi(true);
  const [movies, setMovies] = useState([]);
  const [type, setType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("ai/de-xuat-phim");
        setMovies(res.data.movies);
        setType(res.data.type);
      } catch (err) {
        console.log("Guest user fallback", err);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="my-20 mb-20 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <h2 className="p-2 text-2xl mt-10 font-semibold text-white border-l-2 border-primary">
        {type === "personalized"
          ? " Phim dành cho bạn"
          : " Phim nổi bật"}
      </h2>

      <div className="flex flex-wrap max-md:justify-center gap-8 mt-8">
        {movies.map(movie => (
          <MoviesCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default GoiYPhim
