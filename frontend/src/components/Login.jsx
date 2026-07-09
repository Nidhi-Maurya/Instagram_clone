import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import { apiUrl, getUserId } from '@/lib/api';
import { FaInstagram } from 'react-icons/fa';
import { isSessionExpired } from '@/lib/session';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(apiUrl('/api/v1/user/login'), input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setInput({
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(getUserId(user) && !isSessionExpired(user)){
            navigate("/");
        }
    },[navigate, user])
    return (
        <div className='flex min-h-dvh w-full items-center justify-center bg-[#fafafa] px-4 py-8 text-[#262626]'>
            <div className='grid w-full max-w-[875px] items-center gap-8 md:grid-cols-[minmax(320px,430px)_350px]'>
                <div className='relative hidden h-[620px] md:block'>
                    <div className='absolute left-14 top-4 h-[560px] w-[280px] rounded-[38px] border-[10px] border-black bg-black shadow-2xl'>
                        <div className='h-full overflow-hidden rounded-[28px] bg-white'>
                            <div className='flex h-12 items-center justify-between border-b px-4'>
                                <span className='font-semibold'>Instagram</span>
                                <FaInstagram className='h-5 w-5' />
                            </div>
                            <div className='space-y-3 p-3'>
                                <div className='flex gap-3 overflow-hidden'>
                                    {[1, 2, 3, 4].map((item) => (
                                        <div key={item} className='h-14 w-14 shrink-0 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] p-0.5'>
                                            <div className='h-full w-full rounded-full border-2 border-white bg-gray-100' />
                                        </div>
                                    ))}
                                </div>
                                <div className='rounded-sm border bg-white'>
                                    <div className='flex items-center gap-2 p-2'>
                                        <div className='h-7 w-7 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]' />
                                        <div className='h-2 w-24 rounded bg-gray-200' />
                                    </div>
                                    <div className='aspect-square bg-gradient-to-br from-pink-100 via-orange-100 to-blue-100' />
                                    <div className='space-y-2 p-3'>
                                        <div className='h-2 w-28 rounded bg-gray-200' />
                                        <div className='h-2 w-44 rounded bg-gray-100' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='absolute left-0 top-14 h-[560px] w-[280px] rounded-[38px] border-[10px] border-black bg-black shadow-xl'>
                        <div className='h-full overflow-hidden rounded-[28px] bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] p-5'>
                            <div className='mt-20 rounded-2xl bg-white/90 p-4 shadow-lg'>
                                <div className='mb-3 h-24 rounded-xl bg-gray-100' />
                                <div className='h-3 w-36 rounded bg-gray-200' />
                                <div className='mt-2 h-3 w-24 rounded bg-gray-200' />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mx-auto flex w-full max-w-[350px] flex-col gap-3'>
                    <form onSubmit={signupHandler} className='relative flex w-full flex-col overflow-hidden border border-gray-200 bg-white px-8 py-9 shadow-sm sm:border-gray-300'>
                        <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5]' />
                        <div className='mb-8 flex flex-col items-center text-center'>
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
                            <p className='text-sm font-semibold leading-5 text-gray-500'>Login to see photos and videos from your friends.</p>
                        </div>

                        <div className='space-y-2.5'>
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

                        {loading ? (
                            <Button className='mt-4 h-9 rounded-lg bg-[#0095F6] text-sm font-semibold hover:bg-[#1877F2]'>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please wait
                            </Button>
                        ) : (
                            <Button type='submit' className='mt-4 h-9 rounded-lg bg-[#0095F6] text-sm font-semibold hover:bg-[#1877F2]'>Log in</Button>
                        )}

                    
                        <button type='button' className='mt-4 text-sm font-semibold text-[#385185]'>Forgot password?</button>
                    </form>

                    <div className='border border-gray-200 bg-white px-6 py-5 text-center text-sm shadow-sm sm:border-gray-300'>
                        Do not have an account? <Link to="/signup" className='font-semibold text-[#0095F6]'>Sign up</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
