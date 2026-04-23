import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

const HomePage: NextPage = () => {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  
  return null;
};

export default HomePage;