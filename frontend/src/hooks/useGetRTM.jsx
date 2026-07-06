import { setMessages } from "@/redux/chatSlice";
import { getUserId } from "@/lib/api";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetRTM = () => {
    const dispatch = useDispatch();
    const { socket } = useSelector(store => store.socketio);
    const { messages } = useSelector(store => store.chat);
    const { selectedUser } = useSelector(store => store.auth);
    const selectedUserId = getUserId(selectedUser);
    useEffect(() => {
        if(!socket) return;
        socket?.on('newMessage', (newMessage) => {
            const belongsToOpenChat = selectedUserId
                && (newMessage.senderId === selectedUserId || newMessage.receiverId === selectedUserId);
            if (belongsToOpenChat) {
                dispatch(setMessages([...messages, newMessage]));
            }
        })

        return () => {
            socket?.off('newMessage');
        }
    }, [socket, messages, selectedUserId, dispatch]);
};
export default useGetRTM;
