'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, LogOut, Moon, Sun, Plus, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { User } from '@/types';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // ignore
      }
    }

    // Check system/stored preference
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Car className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">CarVault</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
          </Button>

          <Button size="sm" asChild>
            <Link href="/create-car" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">Add Car</span>
            </Link>
          </Button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* User info */}
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium leading-none">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
