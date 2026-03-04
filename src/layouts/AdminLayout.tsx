import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    MonitorPlay,
    UserCog
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'New Job', path: '/admin/new-job', icon: FileText },
        { name: 'Jobs & Customers', path: '/admin/customers', icon: Users },
    ];

    if (user?.role === 'admin') {
        navItems.push({ name: 'Staff', path: '/admin/staff', icon: UserCog });
        navItems.push({ name: 'Settings', path: '/admin/settings', icon: Settings });
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-800 bg-opacity-75 z-20 xl:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 bg-white w-64 border-r border-gray-200 z-30 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        xl:translate-x-0 xl:static xl:inset-auto
      `}>
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-gray-200 justify-between">
                        <Link to="/" className="flex items-center text-brand-600 font-bold text-xl">
                            <MonitorPlay className="h-6 w-6 mr-2" />
                            Admin Portal
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="xl:hidden text-gray-500 hover:text-gray-700">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                        <nav className="px-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`
                      flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                      ${isActive
                                                ? 'bg-brand-50 text-brand-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }
                    `}
                                    >
                                        <Icon className={`flex-shrink-0 h-5 w-5 mr-3 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* User profile section */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center mb-4">
                            <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="-ml-2 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="font-bold border-b-2 border-brand-500 text-gray-900">IT Junction Admin</div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
