import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/user.context';

const Navbar = () => {
    const { user, setUser } = useContext(UserContext);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <nav className="bg-white dark:bg-black border-b dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-4xl font-bold text-gray-900 dark:text-white">
                            CodeSync
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {user.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 
                                            dark:hover:text-white transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 
                                            dark:hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                                            transition-colors"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 