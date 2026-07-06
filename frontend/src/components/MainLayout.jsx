import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'

const MainLayout = () => {
  return (
    <div className='min-h-dvh bg-white text-slate-950'>
        <LeftSidebar/>
        <main className='min-h-dvh pb-20 lg:ml-64 lg:pb-0'>
            <Outlet/>
        </main>
    </div>
  )
}

export default MainLayout
