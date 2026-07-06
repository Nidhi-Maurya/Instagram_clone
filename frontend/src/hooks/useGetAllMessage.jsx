import { setMessages } from "@/redux/chatSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiUrl, getUserId } from "@/lib/api";

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const {selectedUser} = useSelector(store=>store.auth);
    const selectedUserId = getUserId(selectedUser);
    useEffect(() => {
        const fetchAllMessage = async () => {
            if (!selectedUserId) return;
            try {
                const res = await axios.get(apiUrl(`/api/v1/message/all/${selectedUserId}`), { withCredentials: true });
                if (res.data.success) {  
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllMessage();
    }, [selectedUserId, dispatch]);
};
export default useGetAllMessage;
