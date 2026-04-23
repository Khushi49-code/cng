import type { NextPage } from 'next';
import MainLayout from '../components/layouts/MainLayout';
import AdminDashboard from '../components/modules/AdminDashboard';

const DashboardPage: NextPage = () => {
  return (
    <MainLayout>
      <AdminDashboard />
    </MainLayout>
  );
};

export default DashboardPage;