import React from 'react';
import { Navigate, Link, Outlet } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const AdminLayout = () => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // If not logged in, redirect to the admin login page
    return <Navigate to="/admin" />;
  }

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">IEI Admin</h1>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <Link to="/admin/dashboard/events" className="block px-4 py-2 rounded hover:bg-gray-700">
            Manage Events
          </Link>
          {/* Add links to other features here later */}
          {/* <Link to="/admin/dashboard/notices" className="block px-4 py-2 rounded hover:bg-gray-700">Manage Notices</Link> */}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm">{user.email}</p>
          <button
            onClick={handleLogout}
            className="w-full mt-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Outlet will render the nested route's component (e.g., ManageEvents) */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;