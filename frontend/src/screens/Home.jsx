import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axiosInstance from '../config/axios.js'
import { useNavigate } from "react-router-dom";

const Home = () => {



    const { user } = useContext(UserContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState(null);
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    const [addNewProjectToggle , setAddNewProjectToggle] = useState(false);

    function createProject(e) {

        e.preventDefault();
        console.log(projectName);

        axiosInstance.post('/projects/create', {
            name: projectName
        }, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem('token')
            }
        }).then((res) => {
            console.log(res);
            setIsModalOpen(false);
        }).catch((err) => {
            console.log(err);
        })
    }

    useEffect(() => {

        axiosInstance.get('/projects/all', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).then((response) => {

            console.log(response.data.projects);
            setProjects(response.data.projects);

        }).catch((err) => {
            console.log(err);
        })

    }, [addNewProjectToggle]);



    return (
        <main className="p-4">

            <div className='flex flex-wrap flex-col'>
                <button onClick={() => setIsModalOpen(true)} className='p-4 border border-red-400 rounded-md cursor-pointer'>
                    New Project <i className="ri-link ml-1"></i>
                </button>

                <div className=''>
                    {projects.map((project) => {
                        return (<div onClick={()=>{
                            navigate(`/project`, {
                                state : {project}
                            })
                        }} className='m-3 p-4 bg-neutral-600 cursor-pointer border-1 rounded-lg'>

                            <h2 className='font-semibold text-lg'>{project.name}</h2>

                            <div className='w-fit p-2 bg-neutral-400 rounded-xl'>
                                {<i class="ri-user-3-line m-1">: </i>}{project.users.length}
                            </div>

                        </div>

                        )
                    })}
                </div>
            </div>






            {isModalOpen && (<div className="h-screen fixed inset-0 flex justify-center items-center">
                <div className='p-10 border-2  bg-amber-300 absolute drop-shadow-lg'>
                    <form onSubmit={createProject} className=' flex flex-col justify-center items-center' >
                        <div className='font-semibold text-xl'>Create New Project</div>
                        <span className='font-semibold my-3'>Project Name</span>
                        <input onChange={(e) => setProjectName(e.target.value)} className='w-60 border-2 bg-white' type="text" />
                        <div className='m-5 p-5 flex justify-between'>
                            <button onClick={()=>{
                                setIsModalOpen(false);
                            }} className='p-2 border-1 bg-red-400 mr-8'>Cancel</button>
                            <button onClick={()=>{
                                setAddNewProjectToggle(!addNewProjectToggle);
                            }} className='p-2 border-1 bg-green-400 ml-8'>Create</button>
                        </div>
                    </form>

                </div>
            </div>)}


        </main>
    )

}

export default Home;