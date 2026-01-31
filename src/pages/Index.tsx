import RoleSelection from '@/components/RoleSelection';
import { useRole } from '@/lib/roleContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { role } = useRole();

  // If already logged in, redirect to home
  if (role) {
    return <Navigate to="/home" replace />;
  }

  return <RoleSelection />;
};

export default Index;
