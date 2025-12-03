import { SearchIcon } from 'lucide-react';
import React from 'react'

const SearchInput = ({ search, setSearch, setCurrentPage, item = "item" }) => {
  return (
    <div className="mb-4 border border-primary/30 p-1 w-74 rounded flex items-center">
      <input
        type="text"
        placeholder={`Tìm kiếm theo ${item}...`}
        className="p-2 rounded bg-black/20 border-none text-white w-64 outline-none"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1); // reset về trang đầu
        }}
      />
      <SearchIcon className="inline ml-2 text-gray-400" size={18} />
    </div>
  )
}

export default SearchInput
