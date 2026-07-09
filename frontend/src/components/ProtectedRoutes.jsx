import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom';
import { getUserId } from '@/lib/api';
import { isSessionExpired } from '@/lib/session';
import { setAuthUser } from '@/redux/authSlice';

const ProtectedRoutes = ({children}) => {
    const {user} = useSelector(store=>store.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    const expired = isSessionExpired(user);

    useEffect(() => {
        if (expired) dispatch(setAuthUser(null));
    }, [dispatch, expired]);

    if(!getUserId(user) || expired){
        return <Navigate to="/login" replace state={{ from: location }} />
    }
  return <>{children}</>
}

export default ProtectedRoutes;
