import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar.jsx';

export default function AdminLayout() {
  return (
    <div className="admin">
      <Sidebar />
      <main className="admin__main"><Outlet /></main>
    </div>
  );
}
