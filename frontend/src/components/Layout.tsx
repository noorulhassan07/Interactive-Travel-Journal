import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#f1faee]">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        {children}
      </div>
    </div>
  );
};

export default Layout;
