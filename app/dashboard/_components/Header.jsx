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
        <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
            <Link href="/dashboard">
                <Image src={'/logo.svg'} width={160} height={100} alt='logo' className='cursor-pointer' />
            </Link>
            <ul className='hidden md:flex gap-6'>
                <Link href={"/dashboard"}>
                    <li className={`hover:text-primary hover:font-bold transition-all
                    cursor-pointer
                    ${path == '/dashboard' && 'text-primary font-bold'}
                    `}
                    >Dashboard</li>
                </Link>
                <Link href={"/dashboard/questions"}>
                    <li className={`hover:text-primary hover:font-bold transition-all
                    cursor-pointer
                    ${path == '/dashboard/questions' && 'text-primary font-bold'}
                    `}>Questions</li>
                </Link>
                <Link href={"/dashboard/upgrade"}>
                    <li className={`hover:text-primary hover:font-bold transition-all
                    cursor-pointer
                    ${path == '/dashboard/upgrade' && 'text-primary font-bold'}
                    `}>Upgrade</li>
                </Link>
                <li className={`hover:text-primary hover:font-bold transition-all
                cursor-pointer
                ${path == '/dashboard/how' && 'text-primary font-bold'}
                `}>How it Works?</li>
            </ul>
            <div className='relative'>
                <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className='flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50'
                >
                    <div className='w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500'></div>
                    <span className='text-sm font-medium'>Menu</span>
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