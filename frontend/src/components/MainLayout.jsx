import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'

const MainLayout = () => {
  return (
    <div className='min-h-dvh overflow-x-hidden bg-white text-slate-950'>
        <LeftSidebar/>
        <main className='min-h-dvh min-w-0 pb-20 pt-14 lg:ml-64 lg:pb-0 lg:pt-0'>
            <Outlet/>
        </main>
    </div>
  )
}

export default MainLayout
