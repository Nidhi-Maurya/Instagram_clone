import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom';
import { getUserId } from '@/lib/api';

const ProtectedRoutes = ({children}) => {
    const {user} = useSelector(store=>store.auth);
    const location = useLocation();
    if(!getUserId(user)){
        return <Navigate to="/login" replace state={{ from: location }} />
    }
  return <>{children}</>
}

export default ProtectedRoutes;
