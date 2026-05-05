// src/components/common/ProtectedRoute.tsx
import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import Card from './Card';

interface ProtectedRouteProps {
  children: ReactNode;
  pageName?: string; // Make pageName optional for routes that don't need permission checks
  requiredPermissions?: string[]; // Alternative: multiple permissions
}

export default function ProtectedRoute({ 
  children, 
  pageName,
  requiredPermissions 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No user, redirect to login
        router.replace('/login');
        setLoading(false);
        return;
      }

      // If no page-specific permissions required, allow access
      if (!pageName && (!requiredPermissions || requiredPermissions.length === 0)) {
        setIsAuthorized(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch user document from Firestore to check permissions
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userPermissions = userData.pageAccess || [];
          const userRole = userData.role || 'user';

          // Admin has access to everything
          if (userRole === 'admin') {
            setIsAuthorized(true);
            setLoading(false);
            return;
          }

          // Check page-specific permission
          if (pageName) {
            const hasAccess = userPermissions.includes(pageName);
            
            if (!hasAccess) {
              setIsAuthorized(false);
              setLoading(false);
              return;
            }
          }

          // Check multiple permissions if specified
          if (requiredPermissions && requiredPermissions.length > 0) {
            const hasAllPermissions = requiredPermissions.every(perm => 
              userPermissions.includes(perm)
            );
            
            if (!hasAllPermissions) {
              setIsAuthorized(false);
              setLoading(false);
              return;
            }
          }

          setIsAuthorized(true);
        } else {
          // User document doesn't exist
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, pageName, requiredPermissions]);

  // Show loading spinner while checking auth/permissions
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show access denied page if not authorized
  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}