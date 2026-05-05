import React, { useState, useEffect, ReactNode, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Button from '../common/Button';
import ProtectedRoute from '../common/ProtectedRoute';

interface MainLayoutProps {
  children: ReactNode;
}

// All possible nav pages - same as add-user.tsx pagesList
const ALL_NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  href: '/dashboard' },
  { id: 'sales',      label: 'Sales',      href: '/sales' },
  { id: 'customers',  label: 'Customers',  href: '/customers' },
  { id: 'products',   label: 'Products',   href: '/products' },
  { id: 'services',   label: 'Services',   href: '/services' },
  { id: 'reports',    label: 'Reports',    href: '/reports' },
];

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: boolean } | null>(null);
  const [loadingPerms, setLoadingPerms] = useState(true);

  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  // ── Online/offline ──────────────────────────────────────────────
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // ── Close profile dropdown on outside click ─────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Load permissions from Firestore ─────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;

    const loadPerms = async () => {
      setLoadingPerms(true);
      try {
        const isAdmin = user.email === 'admin@gmail.com';
        if (isAdmin) {
          // Admin ne badha pages accessible
          const allTrue: { [k: string]: boolean } = {};
          ALL_NAV_ITEMS.forEach(p => { allTrue[p.id] = true; });
          allTrue['addUser'] = true;
          setUserPermissions(allTrue);
          return;
        }

        // Firestore thi user document lo
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();

          if (data.permissions && Object.keys(data.permissions).length > 0) {
            // Individual user permissions
            setUserPermissions(data.permissions);
          } else {
            // Role-based permissions fallback
            const role = data.role || 'user';
            const roleDoc = await getDoc(doc(db, 'permissions', role));
            if (roleDoc.exists()) {
              setUserPermissions(roleDoc.data().pages || {});
            } else {
              // Default: sirf dashboard
              setUserPermissions({ dashboard: true });
            }
          }
        }
      } catch (err) {
        console.error('Permission load error:', err);
        setUserPermissions({ dashboard: true });
      } finally {
        setLoadingPerms(false);
      }
    };

    loadPerms();
  }, [user?.uid]);

  // ── Permission check helper ──────────────────────────────────────
  const canAccess = (pageId: string): boolean => {
    if (!userPermissions) return false;
    return userPermissions[pageId] === true;
  };

  const isAdmin = user?.email === 'admin@gmail.com';

  // ── Allowed nav items (filter by permission) ─────────────────────
  const allowedNavItems = ALL_NAV_ITEMS.filter(item => canAccess(item.id));

  // ── Route protection: redirect if no access ──────────────────────
  useEffect(() => {
    if (loadingPerms || !userPermissions) return;

    const currentPageId = ALL_NAV_ITEMS.find(
      item => router.pathname === item.href || router.pathname.startsWith(item.href + '/')
    )?.id;

    if (currentPageId && !canAccess(currentPageId)) {
      router.replace('/dashboard');
    }

    // add-user page: sirf admin access kari shake
    if (router.pathname === '/add-user' && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [router.pathname, userPermissions, loadingPerms]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // ── NavItem component ─────────────────────────────────────────────
  const NavItem = ({ href, children }: { href: string; children: ReactNode }) => {
    const isActive = router.pathname === href || router.pathname.startsWith(`${href}/`);
    return (
      <Link href={href} passHref legacyBehavior>
        <Button
          onClick={() => setIsMobileMenuOpen(false)}
          color={isActive ? 'blue' : 'gray'}
          className="w-full justify-center"
        >
          {children}
        </Button>
      </Link>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">

        <header className="bg-white shadow-md sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

            {/* Logo */}
            <Link href="/dashboard" className="text-xl md:text-2xl font-bold text-blue-800 flex items-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Umiya Tank Testing Plant
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2">
              <nav className="flex space-x-2">
                {loadingPerms ? (
                  // Loading skeleton for nav
                  <div className="flex space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  allowedNavItems.map(item => (
                    <NavItem key={item.id} href={item.href}>{item.label}</NavItem>
                  ))
                )}
              </nav>

              {/* Profile Dropdown */}
              <div className="relative ml-2" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    {/* Profile */}
                    <Link href="/profile" onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>

                    {/* Add User - sirf admin */}
                    {isAdmin && (
                      <Link href="/add-user" onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Add User
                      </Link>
                    )}

                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Hamburger */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t shadow-lg">
              <div className="px-4 py-3 space-y-2">

                {loadingPerms ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  allowedNavItems.map(item => (
                    <NavItem key={item.id} href={item.href}>{item.label}</NavItem>
                  ))
                )}

                <hr className="border-gray-200 my-2" />

                {/* Profile */}
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>

                {/* Add User - sirf admin */}
                {isAdmin && (
                  <Link href="/add-user" onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors font-medium">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Add User
                  </Link>
                )}

                <button onClick={handleLogout}
                  className="flex items-center justify-center w-full px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </header>

        <main className="max-w-7xl mx-auto py-4 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8 w-full flex-grow">
          {children}
        </main>

        <footer className="w-full bg-gray-800 text-white text-center p-3 md:p-4 text-xs mt-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <p>CNG Kit ERP - Warranty & Service Management System</p>
            <div className="mt-2 md:mt-0 flex items-center space-x-2">
              <span>Status:</span>
              <div className={`flex items-center ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-1 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs">{isOnline ? 'Connected' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </ProtectedRoute>
  );
};

export default MainLayout;