import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { apiUrl, getUserId } from '@/lib/api';
import { FaInstagram } from 'react-icons/fa';

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(apiUrl('/api/v1/user/register'), input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
                setInput({
                    username: "",
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(getUserId(user)){
            navigate("/");
        }
    },[navigate, user])
    return (
        <div className='flex min-h-dvh w-full items-center justify-center bg-[#fafafa] px-4 py-8 text-[#262626]'>
            <div className='mx-auto flex w-full max-w-[350px] flex-col gap-3'>
                <form onSubmit={signupHandler} className='relative flex w-full flex-col overflow-hidden border border-gray-200 bg-white px-8 py-8 shadow-sm sm:border-gray-300'>
                    <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5]' />
                    <div className='mb-5 flex flex-col items-center text-center'>
                        <div className='mb-3 flex items-center gap-2'>
                            <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white'>
                                <FaInstagram className='h-7 w-7' />
                            </span>
                            <h1
                                className='bg-gradient-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5] bg-clip-text text-[36px] font-semibold leading-none text-transparent'
                                style={{ fontFamily: '"Segoe Script", "Brush Script MT", cursive' }}
                            >
                                Instagram
                            </h1>
                        </div>
                        <p className='text-base font-semibold leading-5 text-gray-500'>Sign up to see photos and videos from your friends.</p>
                    </div>

                    <div className='space-y-2.5'>
                        <Input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={input.username}
                            onChange={changeEventHandler}
                            className="h-11 rounded-md border-gray-300 bg-[#fafafa] px-3 text-sm focus-visible:border-gray-500 focus-visible:ring-transparent"
                        />
                        <Input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={input.email}
                            onChange={changeEventHandler}
                            className="h-11 rounded-md border-gray-300 bg-[#fafafa] px-3 text-sm focus-visible:border-gray-500 focus-visible:ring-transparent"
                        />
                        <div className='relative'>
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={input.password}
                                onChange={changeEventHandler}
                                className="h-11 rounded-md border-gray-300 bg-[#fafafa] px-3 pr-11 text-sm focus-visible:border-gray-500 focus-visible:ring-transparent"
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword((value) => !value)}
                                className='absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100'
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                            </button>
                        </div>
                    </div>

                    <p className='my-4 text-center text-xs leading-4 text-gray-500'>
                        People who use our service may have uploaded your contact information to Instagram.
                    </p>

                    {loading ? (
                        <Button className='h-9 rounded-lg bg-[#0095F6] text-sm font-semibold hover:bg-[#1877F2]'>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please wait
                        </Button>
                    ) : (
                        <Button type='submit' className='h-9 rounded-lg bg-[#0095F6] text-sm font-semibold hover:bg-[#1877F2]'>Sign up</Button>
                    )}
                </form>

                <div className='border border-gray-200 bg-white px-6 py-5 text-center text-sm shadow-sm sm:border-gray-300'>
                    Already have an account? <Link to="/login" className='font-semibold text-[#0095F6]'>Log in</Link>
                </div>
            </div>
        </div>
    )
}

export default Signup
