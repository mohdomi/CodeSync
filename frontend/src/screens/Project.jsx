import { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../config/axios";
import { initializeSocket, receiveMessage, sendMessage, disconnectSocket } from "../config/socket";
import { UserContext } from "../context/user.context";
import Markdown from 'markdown-to-jsx';

const Project = () => {
    const location = useLocation();
    const project = location.state?.project;
    const { user } = useContext(UserContext);
    const messageBox = useRef(null);

    // State management
    const [isSidePanelOpen, setisSidePanelOpen] = useState(false);
    const [addUserModal, setAddUserModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState([]);
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [specifiedProject, setSpecifiedProject] = useState(project);
    const [messages, setMessages] = useState([]);
    const [fileTree, setFileTree] = useState({});
    const [currentFile, setCurrentFile] = useState(null);
    const [openFiles, setOpenFiles] = useState([]);
    const [error, setError] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);

    // Initialize socket and fetch data
    useEffect(() => {
        if (!project?._id) {
            setError("Project not found");
            return;
        }

        // Initialize socket
        const socket = initializeSocket(project._id);

        // Setup message listener
        receiveMessage('project-message', (data) => {
            try {
                // Only parse if data.message is a string
                const message = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
                
                if (message.fileTree) {
                    setFileTree(message.fileTree);
                }
                setMessages(prevMessages => [...prevMessages, data]);
            } catch (err) {
                console.error("Failed to parse message:", err);
                // Still add the raw message to prevent data loss
                setMessages(prevMessages => [...prevMessages, data]); 
            }
        });

        // Setup connection status listener
        receiveMessage('connect', () => {
            setSocketConnected(true);
        });

        receiveMessage('disconnect', () => {
            setSocketConnected(false);
        });

        // Fetch users
        axiosInstance.get('users/all', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            setUsers(response.data.allUsers);
        })
        .catch(err => {
            console.error("Failed to fetch users:", err);
            setError("Failed to load collaborators");
        });

        // Fetch project details
        axiosInstance.get(`/projects/get-project/${project._id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            setSpecifiedProject(response.data.projectDetails);
        })
        .catch(err => {
            console.error("Failed to fetch project details:", err);
            setError("Failed to load project details");
        });

        // Cleanup function
        return () => {
            disconnectSocket();
        };
    }, [project?._id]);

    const handleUserClick = (id) => {
        setSelectedUserId(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(id)) {
                newSelected.delete(id);
            } else {
                newSelected.add(id);
            }
            return Array.from(newSelected);
        });
    };

    const addCollaborators = () => {
        axiosInstance.put('projects/add-user', {
            projectId: project._id,
            users: Array.from(selectedUserId)
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            setSpecifiedProject(response.data.project);
            setAddUserModal(false);
            setSelectedUserId([]);
        })
        .catch(err => {
            console.error("Failed to add collaborators:", err);
            setError("Failed to add collaborators");
        });
    };

    const handleSendMessage = () => {
        if (!message.trim() || !socketConnected) return;

        try {
            sendMessage('project-message', {
                message,
                sender: user
            });

            setMessages(prev => [...prev, {
                sender: user,
                message
            }]);
            setMessage("");
        } catch (err) {
            console.error("Failed to send message:", err);
            setError("Failed to send message");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const renderMessage = (msg) => {
        const isCurrentUser = msg.sender._id === user._id.toString();
        const isAi = msg.sender._id === 'ai';

        return (
            <div 
                key={msg._id || Math.random()} 
                className={`${isAi ? 'max-w-80 overflow-x-auto overflow-y-visible whitespace-nowrap' : 'max-w-52'} 
                          ${isCurrentUser ? 'ml-auto' : ''} 
                          message flex flex-col p-3 
                          ${isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'} 
                          rounded-lg shadow-sm`}
            >
                <small className='opacity-75 text-xs mb-1'>{msg.sender.email}</small>
                <div className='text-sm'>
                    {isAi ? <Markdown>{msg.message}</Markdown> : msg.message}
                </div>
            </div>
        );
    };

    if (error) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <main className='h-screen w-screen flex bg-slate-50 dark:bg-gray-900'>
            {/* Left Section - Chat Panel */}
            <section className="left relative flex flex-col h-screen min-w-96 bg-white dark:bg-gray-800 shadow-lg">
                <header className='flex justify-between items-center p-4 w-full bg-white dark:bg-gray-800 border-b dark:border-gray-700 absolute z-10 top-0'>
                    <button 
                        className='flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors'
                        onClick={() => setAddUserModal(true)}
                        aria-label="Add collaborator"
                    >
                        <i className="ri-add-fill"></i>
                        <span className="font-medium">Add collaborator</span>
                    </button>
                    <button 
                        onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
                        className='p-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors'
                        aria-label={isSidePanelOpen ? "Close collaborators panel" : "Open collaborators panel"}
                    >
                        <i className="ri-group-fill text-xl"></i>
                    </button>
                </header>

                <div className="conversation-area pt-16 pb-16 flex-grow flex flex-col h-full relative">
                    <div 
                        ref={messageBox}
                        className="message-box p-4 flex-grow flex flex-col gap-3 overflow-auto max-h-full scrollbar-hide"
                    >
                        {messages.map(renderMessage)}
                    </div>

                    <div className="inputField w-full flex absolute bottom-0 bg-white dark:bg-gray-800 p-3 border-t dark:border-gray-700">
                        <input 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className='p-3 rounded-l-lg border-2 border-r-0 border-gray-200 dark:border-gray-700 
                                    outline-none flex-grow bg-white dark:bg-gray-900 dark:text-white
                                    focus:border-blue-500 dark:focus:border-blue-500 transition-colors' 
                            type="text" 
                            placeholder='Type your message...'
                            aria-label="Message input"
                        />
                        <button 
                            onClick={handleSendMessage}
                            className='px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors'
                            aria-label="Send message"
                        >
                            <i className="ri-send-plane-fill"></i>
                        </button>
                    </div>
                </div>

                {/* Side Panel for Collaborators */}
                <div 
                    className={`sidePanel w-full h-full flex flex-col gap-2 bg-white dark:bg-gray-800 absolute 
                            transition-all duration-300 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0`}
                    aria-hidden={!isSidePanelOpen}
                >
                    <header className='flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-900'>
                        <h1 className='font-semibold text-xl text-gray-900 dark:text-white'>Collaborators</h1>
                        <button 
                            onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
                            className='p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors'
                            aria-label="Close collaborators panel"
                        >
                            <i className="ri-close-fill text-xl"></i>
                        </button>
                    </header>
                    <div className="users flex flex-col p-4 overflow-y-auto">
                        {users.map(user => (
                            <div 
                                key={user._id}
                                className="user p-3 flex gap-4 items-center hover:bg-gray-100 dark:hover:bg-gray-700 
                                        rounded-lg transition-colors cursor-pointer"
                            >
                                <div className='aspect-square rounded-full w-12 h-12 flex items-center justify-center 
                                            bg-blue-600 text-white'>
                                    <i className="ri-user-fill text-xl"></i>
                                </div>
                                <h1 className='font-medium text-gray-900 dark:text-white'>{user.email}</h1>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Right Section - Code Editor */}
            <section className="right flex-grow h-full flex bg-gray-50 dark:bg-gray-900">
                <div className="explorer h-full w-64 py-2 bg-gray-100 dark:bg-gray-800 border-r dark:border-gray-700">
                    <div className="file-tree w-full flex flex-col p-2">
                        {Object.keys(fileTree).map((file, index) => (
                            <button 
                                key={index}
                                onClick={() => {
                                    setCurrentFile(file);
                                    setOpenFiles([...new Set([...openFiles, file])]);
                                }}
                                className="tree-element p-3 my-1 rounded-lg bg-white dark:bg-gray-700 
                                        hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                                        text-left shadow-sm"
                            >
                                <p className='text-gray-900 dark:text-white font-medium'>{file}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="code-editor flex flex-col flex-grow">
                    <div className="top border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="files flex p-2 gap-2">
                            {openFiles.map((file) => (
                                <button 
                                    key={file}
                                    onClick={() => setCurrentFile(file)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors
                                            ${currentFile === file 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                >
                                    {file}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bottom flex-grow p-4">
                        {fileTree[currentFile] && (
                            <textarea 
                                value={fileTree[currentFile].file.contents}
                                onChange={(e) => {
                                    setFileTree({
                                        ...fileTree,
                                        [currentFile]: {
                                            file: {
                                                contents: e.target.value
                                            }
                                        }
                                    });
                                }}
                                className='w-full h-full p-6 rounded-lg bg-white dark:bg-gray-800 
                                        text-gray-900 dark:text-white border dark:border-gray-700
                                        focus:outline-none focus:ring-2 focus:ring-blue-500
                                        font-mono text-sm'
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* Add User Modal */}
            {addUserModal && (
                <div className='fixed inset-0 z-50'>
                    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm'></div>
                    <div className='relative h-screen w-screen flex justify-center items-center'>
                        <div className="w-[500px] max-h-[600px] rounded-xl shadow-xl bg-white dark:bg-gray-800 flex flex-col">
                            <header className='p-6 flex justify-between items-center border-b dark:border-gray-700'>
                                <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Select Users</h2>
                                <button 
                                    onClick={() => setAddUserModal(false)}
                                    className='text-gray-500 hover:text-gray-700 dark:text-gray-400 
                                            dark:hover:text-white transition-colors'
                                    aria-label="Close modal"
                                >
                                    <i className="ri-close-fill text-2xl"></i>
                                </button>
                            </header>

                            <div className='flex-grow overflow-y-auto p-4'>
                                {users.map((user) => (
                                    <div 
                                        key={user._id}
                                        onClick={() => handleUserClick(user._id)}
                                        className={`p-4 rounded-lg mb-2 cursor-pointer transition-colors
                                                ${selectedUserId.includes(user._id) 
                                                    ? 'bg-blue-50 dark:bg-blue-900/30' 
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        <h1 className='font-medium text-gray-900 dark:text-white'>{user.email}</h1>
                                    </div>
                                ))}
                            </div>

                            <footer className='p-6 border-t dark:border-gray-700'>
                                <button 
                                    onClick={addCollaborators}
                                    className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white 
                                            font-medium rounded-lg transition-colors'
                                    disabled={selectedUserId.length === 0}
                                >
                                    Add Selected Collaborators
                                </button>
                            </footer>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Project;