import { setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { apiUrl } from "@/lib/api";


const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    // const [userProfile, setUserProfile] = useState(null);
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId || userId === "undefined" || userId === "null") return;
            try {
                const res = await axios.get(apiUrl(`/api/v1/user/${userId}/profile`), { withCredentials: true });
                if (res.data.success) { 
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchUserProfile();
    }, [userId]);
};
export default useGetUserProfile;
