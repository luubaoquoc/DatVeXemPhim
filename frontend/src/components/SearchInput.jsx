import { SearchIcon } from 'lucide-react';
import React from 'react'

const SearchInput = ({ search, onSearch, item = "item" }) => {
  return (
    <div className="mb-4 border border-primary/70 p-1 w-74 flex items-center bg-black">
      <input
        type="text"
        placeholder={`Tìm kiếm theo ${item}...`}
        className="p-2 rounded border-none text-white w-64 outline-none"
        value={search}
        onChange={(e) => {
          onSearch(e.target.value);
        }}
      />
      <SearchIcon className="inline ml-2 text-gray-400" size={18} />
    </div>
  )
}

export default SearchInput
