import React, { useState } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  const [openSidebar, setOpenSidebar] = useState(false)

  return (
    <>
      <AdminNavbar onToggleSidebar={() => setOpenSidebar(!openSidebar)} />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar desktop */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Sidebar mobile */}
        {openSidebar && (
          <div
            className="lg:hidden "
            onClick={() => setOpenSidebar(false)}
          >
            <div
              className="h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <AdminSidebar onClose={() => setOpenSidebar(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 md:px-10">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default Layout
