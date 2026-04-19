"use client"
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'

function Header() {
    const path = usePathname();
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            router.push('/sign-in');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        console.log(path)
    }, [])

    return (
        <div className='flex p-4 items-center justify-between bg-white shadow-sm border-b border-gray-100'>
            <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xl leading-none">S</span>
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-gray-900">SENTIENCE</span>
            </Link>
            <ul className='hidden md:flex gap-8 items-center'>
                <Link href={"/dashboard"}>
                    <li className={`text-sm font-medium transition-colors hover:text-blue-600 cursor-pointer ${path == '/dashboard' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                        Dashboard
                    </li>
                </Link>
                <Link href={"/dashboard/questions"}>
                    <li className={`text-sm font-medium transition-colors hover:text-blue-600 cursor-pointer ${path == '/dashboard/questions' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                        Questions
                    </li>
                </Link>
                <Link href={"/dashboard/ats-checker"}>
                    <li className={`text-sm font-medium transition-colors hover:text-blue-600 cursor-pointer ${path == '/dashboard/ats-checker' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                        ATS Checker
                    </li>
                </Link>
                <Link href={"/dashboard/user-profile"}>
                    <li className={`text-sm font-medium transition-colors hover:text-blue-600 cursor-pointer ${path == '/dashboard/user-profile' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                        User Profile
                    </li>
                </Link>
                <Link href={"/#how-it-works"}>
                    <li className={`text-sm font-medium transition-colors hover:text-blue-600 cursor-pointer ${path == '/dashboard/how' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                        How it Works?
                    </li>
                </Link>
            </ul>
            <div className='relative'>
                <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className='flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-blue-100 outline-none'
                >
                    <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm'>
                        U
                    </div>
                    <span className='text-sm font-medium text-gray-700 hidden sm:block'>Menu</span>
                </button>
                
                {showMenu && (
                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10'>
                        <button
                            onClick={handleLogout}
                            className='w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 rounded-lg'
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Header