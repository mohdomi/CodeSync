import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axiosInstance from '../config/axios.js'
import { useNavigate } from "react-router-dom";

const Home = () => {
    const { user } = useContext(UserContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const createProject = async (e) => {
        e.preventDefault();
        if (!projectName.trim()) {
            setError("Project name cannot be empty");
            return;
        }

        try {
            await axiosInstance.post('/projects/create', {
                name: projectName
            }, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token')
                }
            });
            setIsModalOpen(false);
            setProjectName("");
            fetchProjects();
        } catch (err) {
            console.error("Failed to create project:", err);
            setError("Failed to create project");
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await axiosInstance.get('/projects/all', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setProjects(response.data.projects);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            setError("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading projects...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                    <button 
                        onClick={() => setError(null)}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Projects</h1>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <i className="ri-add-fill"></i>
                        <span>New Project</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div 
                            key={project._id}
                            onClick={() => navigate('/project', { state: { project } })}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {project.name}
                                </h2>
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                                    <i className="ri-user-3-line text-blue-600 dark:text-blue-400"></i>
                                    <span className="text-sm text-blue-600 dark:text-blue-400">
                                        {project.users.length}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <i className="ri-time-line"></i>
                                <span>Last updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {projects.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                            <i className="ri-folder-add-line text-2xl text-blue-600 dark:text-blue-400"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No projects yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Create your first project to get started
                        </p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Create Project
                        </button>
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
                    <div className="relative h-screen w-screen flex justify-center items-center">
                        <div className="w-[500px] rounded-xl shadow-xl bg-white dark:bg-gray-800">
                            <header className="p-6 flex justify-between items-center border-b dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Create New Project
                                </h2>
                                <button 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setProjectName("");
                                        setError(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                                    aria-label="Close modal"
                                >
                                    <i className="ri-close-fill text-2xl"></i>
                                </button>
                            </header>

                            <form onSubmit={createProject} className="p-6">
                                <div className="mb-4">
                                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Name
                                    </label>
                                    <input
                                        id="projectName"
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 
                                                outline-none bg-white dark:bg-gray-900 dark:text-white
                                                focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                                        placeholder="Enter project name"
                                    />
                                    {error && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setProjectName("");
                                            setError(null);
                                        }}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 
                                                dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                                                transition-colors"
                                        disabled={!projectName.trim()}
                                    >
                                        Create Project
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Home;