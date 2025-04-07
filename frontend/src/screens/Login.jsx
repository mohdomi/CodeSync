import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axiosInstance from "../config/axios.js";
import { UserContext } from "../context/user.context.jsx";
import Navbar from "../components/Navbar";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axiosInstance.post('/users/login', {
                email,
                password
            });

            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                setUser(response.data.user);
                navigate('/');
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.response?.data?.message || "Failed to login. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">
            <Navbar />
            <div className="flex items-center justify-center p-4 pt-20">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center">
                            <i className="ri-user-fill text-2xl text-blue-600 dark:text-blue-400"></i>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Please sign in to continue</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8">
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 
                                            outline-none bg-white dark:bg-slate-800 dark:text-white
                                            focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 
                                            outline-none bg-white dark:bg-slate-800 dark:text-white
                                            focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                                    placeholder="Enter your password"
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link 
                                to="/register" 
                                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;