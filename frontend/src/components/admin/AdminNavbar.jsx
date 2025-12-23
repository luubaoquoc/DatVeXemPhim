import React from 'react'
import { Link } from 'react-router-dom'
import { MenuIcon } from 'lucide-react'

const AdminNavbar = ({ onToggleSidebar }) => {
  return (
    <div className="flex items-center justify-between px-4 md:px-10 h-16 border-b border-gray-300/30 sticky top-0 bg-gray-900 z-50">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* Icon menu (chỉ hiện mobile) */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-gray-300 hover:text-primary transition"
        >
          <MenuIcon size={26} />
        </button>

        <Link to="/admin">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#20B2AA] to-yellow-300/50 bg-clip-text text-transparent">
            Go Cinema
          </h1>
        </Link>
      </div>

    </div>
  )
}

export default AdminNavbar
