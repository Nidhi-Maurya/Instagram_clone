import React from 'react'
import Feed from './Feed'
import { Outlet } from 'react-router-dom'
import RightSidebar from './RightSidebar'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'

const Home = () => {
    useGetAllPost();
    useGetSuggestedUsers();
    return (
        <div className='mx-auto flex w-full max-w-6xl gap-8 px-3 sm:px-6 lg:px-8'>
            <div className='min-w-0 flex-1'>
                <Feed />
                <Outlet />
            </div>
            <RightSidebar />
        </div>
    )
}

export default Home
