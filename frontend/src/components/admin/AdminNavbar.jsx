import React from 'react'
import { Link } from 'react-router-dom'

const AdminNavbar = () => {
  return (
    <div className='flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30 sticky top-0 bg-gray-900 z-50'>
      <Link to='/admin'>
        <h1 className='text-4xl font-bold bg-gradient-to-r from-[#20B2AA] to-yellow-300/50 bg-clip-text text-transparent'>
          Go Cinema
        </h1>
      </Link>
    </div>
  )
}

export default AdminNavbar
