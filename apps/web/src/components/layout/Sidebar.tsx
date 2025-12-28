import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Settings,
    Scale,
    LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';

const navItems = [
    {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
    },
    {
        name: 'Modelos',
        href: '/templates',
        icon: FileText,
    },
    {
        name: 'Casos',
        href: '/cases',
        icon: FolderOpen,
    },
    {
        name: 'Configurações',
        href: '/settings',
        icon: Settings,
    },
];

export function Sidebar() {
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <aside className="flex h-full w-64 flex-col border-r bg-card">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                    <Scale className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-primary">PetiChat</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const isActive =
                        item.href === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.href);

                    return (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="border-t p-4">
                <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 truncate">
                        <p className="text-sm font-medium">{user?.name || 'Usuário'}</p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user?.email || ''}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </div>
        </aside>
    );
}
