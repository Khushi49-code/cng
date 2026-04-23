import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../common/Button';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const router = useRouter();
  
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const NavItem = ({ href, children }: { href: string; children: ReactNode }) => {
    const isActive = router.pathname === href || router.pathname.startsWith(`${href}/`);
    
    return (
      <Link href={href} passHref legacyBehavior>
        <Button 
          onClick={() => setIsMobileMenuOpen(false)} 
          color={isActive ? 'blue' : 'gray'}
          className="w-full md:w-auto justify-center"
        >
          {children}
        </Button>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl md:text-2xl font-bold text-blue-800 flex items-center">
            <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Umiya Tank Testing Plant
          </Link>
          
          <div className="hidden md:flex items-center mr-4">
            <div className={`flex items-center ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-2">
            <NavItem href="/dashboard">Dashboard</NavItem>
            <NavItem href="/sales">Sales</NavItem>
            <NavItem href="/customers">Customers</NavItem>
            <NavItem href="/products">Products</NavItem>
            <NavItem href="/services">Services</NavItem>
            <NavItem href="/reports">Reports</NavItem>
          </nav>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 relative"
          >
            {!isOnline && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
            )}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-3">
              <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium">
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <NavItem href="/dashboard">Dashboard</NavItem>
                <NavItem href="/sales">Sales</NavItem>
                <NavItem href="/customers">Customers</NavItem>
                <NavItem href="/products">Products</NavItem>
                <NavItem href="/services">Services</NavItem>
                <NavItem href="/reports">Reports</NavItem>
              </div>
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
              <div className={`w-2 h-2 rounded-full mr-1 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs">
                {isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
// ✅ IMPORTANT - THIS LINE WAS MISSING! ADD IT NOW!
// ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️

export default MainLayout;