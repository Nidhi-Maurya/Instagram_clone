import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { setAuthUser, setUserProfile } from '@/redux/authSlice';
import { apiUrl, getUserId } from '@/lib/api';

const EditProfile = () => {
    const imageRef = useRef();
    const { user } = useSelector(store => store.auth);
    const userId = getUserId(user);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(user?.profilePicture || "");
    const [input, setInput] = useState({
        username: user?.username || "",
        bio: user?.bio || "",
        gender: user?.gender || "other"
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }

    const selectChangeHandler = (value) => {
        setInput({ ...input, gender: value });
    }


    const editProfileHandler = async () => {
        if (!input.username.trim()) {
            toast.error("Username is required");
            return;
        }
        const formData = new FormData();
        formData.append("username", input.username.trim());
        formData.append("bio", input.bio || "");
        formData.append("gender", input.gender || "other");
        if(selectedFile){
            formData.append("profilePhoto", selectedFile);
        }
        try {
            setLoading(true);
            const res = await axios.post(apiUrl('/api/v1/user/profile/edit'), formData,{
                headers:{
                    'Content-Type':'multipart/form-data'
                },
                withCredentials:true
            });
            if(res.data.success){
                const updatedUserData = {
                    ...user,
                    _id: res.data.user?._id || userId,
                    username: res.data.user?.username,
                    bio:res.data.user?.bio,
                    profilePicture:res.data.user?.profilePicture,
                    gender:res.data.user.gender
                };
                dispatch(setAuthUser(updatedUserData));
                dispatch(setUserProfile(res.data.user));
                navigate(userId ? `/profile/${userId}` : "/");
                toast.success(res.data.message);
            }

        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Profile update failed");
        } finally{
            setLoading(false);
        }
    }
    return (
        <div className='mx-auto flex w-full max-w-2xl px-4 sm:px-6 lg:px-8'>
            <section className='my-6 flex w-full flex-col gap-6 sm:my-8'>
                <h1 className='font-bold text-xl'>Edit Profile</h1>
                <div className='flex flex-col gap-4 rounded-lg bg-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex min-w-0 items-center gap-3'>
                        <Avatar className='shrink-0'>
                            <AvatarImage src={imagePreview} alt="post_image" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className='min-w-0'>
                            <h1 className='truncate text-sm font-bold'>{user?.username}</h1>
                            {user?.bio?.trim() && (
                                <span className='block truncate text-gray-600'>{user.bio}</span>
                            )}
                        </div>
                    </div>
                    <input ref={imageRef} onChange={fileChangeHandler} type='file' accept='image/*' className='hidden' />
                    <Button onClick={() => imageRef?.current.click()} className='h-8 w-full bg-[#0095F6] hover:bg-[#318bc7] sm:w-fit'>Change photo</Button>
                </div>
                <div>
                    <h1 className='font-bold text-xl mb-2'>Username</h1>
                    <input
                        value={input.username}
                        onChange={(e) => setInput({ ...input, username: e.target.value })}
                        className='h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-500'
                        placeholder='Username'
                    />
                </div>
                <div>
                    <h1 className='font-bold text-xl mb-2'>Bio</h1>
                    <Textarea value={input.bio} onChange={(e) => setInput({ ...input, bio: e.target.value })} name='bio' className="focus-visible:ring-transparent" />
                </div>
                <div>
                    <h1 className='font-bold mb-2'>Gender</h1>
                    <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex justify-end'>
                    {
                        loading ? (
                            <Button className='w-full bg-[#0095F6] hover:bg-[#2a8ccd] sm:w-fit'>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please wait
                            </Button>
                        ) : (
                            <Button onClick={editProfileHandler} className='w-full bg-[#0095F6] hover:bg-[#2a8ccd] sm:w-fit'>Submit</Button>
                        )
                    }
                </div>
            </section>
        </div>
    )
}

export default EditProfile
