// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-white text-xl font-bold">LUKA</Link>
        
        {user && (
          <div className="hidden md:flex space-x-4">
            <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link to="/new-assessment" className="text-gray-300 hover:text-white">New Assessment</Link>
            <Link to="/groups" className="text-gray-300 hover:text-white">Manage Groups</Link>
          </div>
        )}

        <div>
          {user ? (
            <button onClick={handleLogout} className="bg-red-500 text-white text-sm py-1 px-3 rounded-md hover:bg-red-600">
              Logout ({user.email})
            </button>
          ) : (
            <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
