import { Link , useNavigate} from "react-router-dom";
import { useState , useContext } from "react";
import axiosInstance from "../config/axios.js";
import { UserContext } from "../context/user.context.jsx";
const Login = () => {

    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("");

    const {setUser} = useContext(UserContext);

    const navigate = useNavigate();

    async function submitHandler(e){

        try{
            e.preventDefault();
            const response = await axiosInstance.post('/users/login' , {
            email , password
        });

        if(response.status === 200){
            console.log(response.data)

            localStorage.setItem('token' , response.data.token);
            setUser(response.data.user);

            navigate('/');
        }

        
    }catch(err){
            console.log(err.response.data);
        }

    }


    return (<div>
        <div className='h-screen flex justify-center items-center'>

            <div className=' flex flex-col justify-center items-center border-3 p-10 py-20'>
                <div className='font-semibold'>Login</div>
                <form onSubmit={submitHandler} className='grid grid-col-1 w-100' action="">
                    <span>Email</span>
                    <input onChange={(e)=>{
                        setEmail(e.target.value)}} className='border-2' type="text" />
                    <span>Password</span>
                    <input onChange={(e)=>setPassword(e.target.value)} className='border-2' type="text" />
                    <button className='bg-red-700 my-3'>Login</button>
                </form>

                <div>Don't have an account {<Link className='underline text-blue-500' to='/register'>signup</Link>}</div>
            </div>
        </div>
    </div>

    )

}

export default Login;