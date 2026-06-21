import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area - padded left to account for fixed 64 (256px) sidebar, and top for mobile topbar */}
      <div className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen w-full overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
