import { useState, useEffect, useContext, useRef, createRef } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../config/axios";
import { intializeSocket, recieveMessage, sendMessage } from "../config/socket";
import { UserContext } from "../context/user.context";
import { getWebContainer } from "../config/webcontainer";

import Markdown from 'markdown-to-jsx';


const Project = () => {
    const location = useLocation();
    const project = location.state?.project;



    const [isSidePanelOpen, setisSidePanelOpen] = useState(false)
    const [addUserModal, setAddUserModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState([])
    const [message, setMessage] = useState(null);

    const [users, setUsers] = useState([]);
    const [specifiedProject, setSpecifiedProject] = useState(project);

    const { user } = useContext(UserContext);

    const [messages, setMessages] = useState([]);


    const [fileTree, setFileTree] = useState({});

    const [currentFile, setCurrentFile] = useState(null)
    const [openFiles, setOpenFiles] = useState([]);

    const [webContainer, setWebContainer] = useState(null);


    const messageBox = createRef();


    useEffect(() => {

        intializeSocket(project._id);


        if (!webContainer) {
            getWebContainer().then(container => {
                setWebContainer(container);
                console.log("container started")
            }).catch(err => {
                console.log(err);
            })
        }


        recieveMessage('project-message', data => {

            console.log(JSON.parse(data.message));

            const message = JSON.parse(data.message);


            if (message.fileTree) {
                setFileTree(message.fileTree);

                console.log(message.fileTree);

                webContainer?.mount(message.fileTree);
            }

            setMessages(prevMessages => [...prevMessages, data]);
        })

        axiosInstance.get('users/all', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).then((response) => {

            console.log(response.data.allUsers);

            setUsers(response.data.allUsers);

        }).catch((error) => {
            console.log(error.response.message);
        })


        axiosInstance.get(`/projects/get-project/${project._id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).then((response) => {

            setSpecifiedProject(response.data.projectDetails);
            console.log('User data : ', response.data.projectDetails);

        }).catch((err) => {
            console.log(err);
        })




    }, []);

    const handleUserClick = (id) => {
        console.log(selectedUserId);
        setSelectedUserId(prevSelectedUserId => {
            const newSelectedUserId = new Set(prevSelectedUserId);
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id);
            } else {
                newSelectedUserId.add(id);
            }
            return Array.from(newSelectedUserId)
        });
    }


    const addCollaborators = () => {

        axiosInstance.put('projects/add-user', {
            projectId: project._id,
            users: Array.from(selectedUserId)
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).then((response) => {

            const newProjectDetails = response.data.project;
            console.log(newProjectDetails)
            setAddUserModal(false);

        }).catch((err) => {

            console.log(err);
            setAddUserModal(false);

        })

    }

    const send = () => {

        console.log('sending message');

        sendMessage('project-message', {
            message,
            sender: user
        })

        setMessages(prevMessages => [...prevMessages, {
            sender: user, message
        }])

        setMessage("");

    }


    function appendIncomingMessage(messageObject) {

        const messageBox = document.querySelector('.message-box');

        const message = document.createElement('div');
        message.classList.add('message', 'max-w-56', 'flex', 'flex-col', 'p-2', 'bg-slate-500')

        if (messageObject.sender._id === 'ai') {

            const markDown = (<Markdown>{messageObject.message}</Markdown>)

            message.innerHTML = `
                <small className='opacity-65text-xs'>${messageObject.sender.email}</small>
                <p className='text-sm'>${markDown}</p>
            `

        } else {
            message.innerHTML = `
                <small class='opacity-65 text-xs'>${messageObject.sender.email}</small>
                <p class='text-sm'>${messageObject.message}</p>
            `
        }
        messageBox.appendChild(message);

        scrollToBottom();
    }



    function appendOutgoingMessage(message) {

        const messageBox = document.querySelector('.message-box');

        const newMessage = document.createElement('div');
        newMessage.classList.add('ml-auto', 'max-w-56', 'message', 'flex', 'flex-col', 'p-2', 'bg-slate-500')

        newMessage.innerHTML = `
            <small class='opacity-65 text-xs'>${user.email}</small>
            <p class='text-sm'>${message}</p>

            
        `
        messageBox.appendChild(newMessage);
        scrollToBottom();
    }


    function scrollToBottom() {
        messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }

    function writeAiMessage(message) {

        const messageObject = JSON.parse(message);

        return (
            <div
                className='overflow-auto bg-slate-800 text-white rounded-xl p-2'
            >

                <Markdown>{messageObject.text}</Markdown>
            </div>
        )

    }



    return (

        <main className='h-screen w-screen flex'>

            <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
                <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0'>
                    <button className='flex gap-2' onClick={() => setAddUserModal(true)}>
                        <i className="ri-add-fill mr-1"></i>
                        <p>Add collaborator</p>
                    </button>
                    <button onClick={() => setisSidePanelOpen(!isSidePanelOpen)} className='p-2'>
                        <i className="ri-group-fill"></i>
                    </button>
                </header>
                <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">

                    <div
                        ref={messageBox}
                        className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide">
                        {
                            messages.map((msg, index) => (

                                <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-52'} ${msg.sender._id === user._id.toString() && 'ml-auto'} message flex flex-col p-2 bg-slate-500 w-fit rounded-md`}>
                                    <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                                    <p className='text-sm'>{msg.sender._id === 'ai' ?

                                        // ai code here 
                                        <>{writeAiMessage(msg.message)}</> : <>{msg.message}</>}</p>

                                </div>

                            ))
                        }

                    </div>

                    <div className="inputField w-full flex absolute bottom-0">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className='p-2 px-4 border-none outline-none flex-grow' type="text" placeholder='Enter message' />
                        <button
                            onClick={send}
                            className='px-5 bg-slate-950 text-white'><i className="ri-send-plane-fill"></i></button>
                    </div>
                </div>
                <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0`}>
                    <header className='flex justify-between items-center px-4 p-2 bg-slate-200'>

                        <h1
                            className='font-semibold text-lg'
                        >Collaborators</h1>

                        <button onClick={() => setisSidePanelOpen(!isSidePanelOpen)} className='p-2'>
                            <i className="ri-close-fill"></i>
                        </button>
                    </header>
                    <div className="users flex flex-col gap-2">
                        {/* need a fix here */}
                        {users && users.map(user => {


                            return (
                                <div className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
                                    <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>
                            )


                        })}
                    </div>
                </div>
            </section>


            <section className="right bg-red-100 flex-grow h-full flex">

                <div className="explorer h-full max-w-64 min-w-52 py-2 bg-slate-200">

                    <div className="file-tree w-full flex flex-col">

                        {Object.keys(fileTree).map((file, index) => {
                            return (
                                <button onClick={() => {
                                    setCurrentFile(file);
                                    setOpenFiles([... new Set([...openFiles, file])])
                                }} className="tree-element p-2 m-2 px-4 items-center gap-2 bg-slate-300 cursor-pointer">
                                    <p className='text-lg font-semibold'>{file}</p>
                                </button>
                            )
                        })}

                    </div>

                </div>


                <div className="code-editor flex flex-col flex-grow h-full w-80">


                    <div className="top flex overflow-y-auto ">

                        <div className="files flex justify-between w-full">

                            {
                                openFiles.map((file) => {

                                    return (
                                        <button
                                            onClick={() => {
                                                setCurrentFile(file);
                                            }}
                                            className='font-semibold text-lg bg-slate-300 m-2 p-2 cursor-pointer'
                                        >
                                            {file}
                                        </button>
                                    )

                                })
                            }

                        </div>


                           <div className="actions flex gap-2">
                            <button

                                onClick={
                                    async ()=>{
                                        const lsProcess = await webContainer?.spawn('ls');

                                        lsProcess.output.pipeTo(new WritableStream({
                                            write(chunk) {
                                                console.log((chunk));
                                            }
                                        }))
                                    }
                                }
                            
                            >
                                ls
                            </button>
                            </div> 

                    </div>

                    <div className="bottom flex flex-grow h-full ">

                        {
                            fileTree[currentFile] && (


                                <textarea value={fileTree[currentFile].file.contents}

                                    onChange={(e) => {
                                        console.log(fileTree[currentFile])

                                        setFileTree({
                                            ...fileTree, [
                                                currentFile
                                            ]: {
                                                file: {
                                                    contents: e.target.value
                                                }
                                            }
                                        })

                                    }}

                                    className='w-full h-full p-4 bg-slate-200'

                                ></textarea>

                            )
                        }

                    </div>



                </div>
            </section>



            {addUserModal && (


                <div className='fixed inset-0 h-screen w-screen '>

                    <div className='fixed inset-0 bg-black opacity-50 backdrop-blur-xl'></div>

                    <div className='relative h-screen w-screen flex justify-center items-center'>
                        <div className="absolute w-100 h-fit max-h-100 min-h-100 border-2 flex flex-col z-50 bg-slate-100">

                            <header className='p-3 flex justify-between'>
                                <h2 className='text-xl font-semibold p-2 px-4 m-1 '>Select User</h2>
                                <button onClick={() => {
                                    setAddUserModal(!addUserModal)
                                }} className='p-2 px-4 m-1 cursor-pointer'>X</button>
                            </header>


                            {/* Important here */}


                            <div className='size-full overflow-y-auto'>

                                {users.map((user) => {
                                    return (<div key={user._id} onClick={() => {
                                        return handleUserClick(user._id);
                                    }} className={`p-4 m-2 hover:bg-slate-300 ${(Array.from(selectedUserId).indexOf(user._id) === -1) ? '' : 'bg-slate-300'}  overflow-x-hidden text-ellipsis whitespace-nowrap cursor-pointer`}>

                                        <h1 className='font-semibold'>{user.email}</h1>

                                    </div>
                                    )
                                })}

                            </div>

                            <footer className='flex justify-center w-full'>
                                <button onClick={() => {
                                    addCollaborators();
                                }} className='m-1 p-1 border-2 bg-slate-700 text-slate-50'>
                                    Add Collaborators
                                </button>
                            </footer>



                        </div>
                    </div>

                </div>)}


        </main>

    )

}


export default Project;