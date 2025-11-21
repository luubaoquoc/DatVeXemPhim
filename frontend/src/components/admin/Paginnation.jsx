import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5; // số nút hiển thị

    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-4 select-none">

      {/* First page */}
      <button
        onClick={() => onPageChange(1)}
        className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 cursor-pointer"
        disabled={currentPage === 1}
      >
        &laquo;
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`px-3 py-1 rounded cursor-pointer ${num === currentPage ? "bg-primary text-white" : "bg-gray-700"
            }`}
        >
          {num}
        </button>
      ))}

      {/* Last page */}
      <button
        onClick={() => onPageChange(totalPages)}
        className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 cursor-pointer"
        disabled={currentPage === totalPages}
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;
