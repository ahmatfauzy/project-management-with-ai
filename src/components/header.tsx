'use client'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { useScroll } from 'motion/react'
import { authClient } from '@/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

// Extended user type with custom fields
interface SessionUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
    status?: string;
    department?: string;
}

const menuItems = [
    { name: 'Fitur', href: '#features' },
    { name: 'FAQ', href: '#faq' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [scrolled, setScrolled] = React.useState(false)
    const router = useRouter()

    // Use Better Auth session hook
    const { data: session, isPending } = authClient.useSession()

    const { scrollYProgress } = useScroll()

    React.useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            setScrolled(latest > 0.05)
        })
        return () => unsubscribe()
    }, [scrollYProgress])

    const handleSignOut = async () => {
        await authClient.signOut()
        router.push('/')
        router.refresh()
    }

    // Get dashboard path based on role
    const getDashboardPath = () => {
        if (!session?.user) return '/dashboard'
        const user = session.user as SessionUser
        const role = user.role || 'employee'
        if (role === 'hr') return '/dashboard/hr'
        if (role === 'pm') return '/dashboard/pm'
        return '/dashboard/employee'
    }

    // Get user role safely
    const getUserRole = () => {
        if (!session?.user) return 'employee'
        const user = session.user as SessionUser
        return user.role || 'employee'
    }

    // Get user initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className={cn('fixed z-20 w-full border-b transition-colors duration-150', scrolled && 'bg-background/50 backdrop-blur-3xl')}>
                <div className="mx-auto max-w-5xl px-6 transition-all duration-300">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <span className="text-xl font-bold tracking-tight">QUAVITY</span>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>

                            <div className="hidden lg:block">
                                <ul className="flex gap-8 text-sm">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                {/* Show loading skeleton while checking session */}
                                {isPending ? (
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                ) : session?.user ? (
                                    /* User is logged in - show avatar with dropdown */
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                                                <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/50 transition-colors">
                                                    <AvatarImage 
                                                        src={session.user.image || ''} 
                                                        alt={session.user.name || 'User'} 
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                                        {getInitials(session.user.name || 'U')}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56" align="end" forceMount>
                                            <DropdownMenuLabel className="font-normal">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {session.user.name}
                                                    </p>
                                                    <p className="text-xs leading-none text-muted-foreground">
                                                        {session.user.email}
                                                    </p>
                                                    <p className="text-xs leading-none text-primary capitalize mt-1">
                                                        {getUserRole()}
                                                    </p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href={getDashboardPath()} className="cursor-pointer">
                                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                                    <span>Dashboard</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                onClick={handleSignOut}
                                                className="cursor-pointer text-destructive focus:text-destructive"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Sign Out</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    /* User is not logged in - show Sign Up button */
                                    <Button asChild size="sm">
                                        <Link href="/auth/login">
                                            <span>Sign Up</span>
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

