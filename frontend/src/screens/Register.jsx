import { useState , useContext } from "react";
import { Link , useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios";
import { UserContext } from "../context/user.context";

const Register = ()=>{

    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("");

    const {setUser} = useContext(UserContext)

    const navigate = useNavigate();

    async function submitHandler(e){

        try{
            e.preventDefault();
            const response = await axiosInstance.post('/users/register' , {
                email , password
            })

            if(response.status === 200){
                console.log(response.data);

                localStorage.setItem('token' , response.data.token);

                setUser(response.data.user);
                navigate('/')
            }
            

        }catch(err){

            console.log(err.response.data);

        }
    
    }

    return(
        <div>
        <div className='h-screen flex justify-center items-center'>

            <div className='flex flex-col justify-center items-center border-3 p-10 py-20'>
                <div className="font-semibold">Signup</div>
                <form onSubmit={submitHandler} className='grid grid-col-1 w-100' action="">
                    <span>Email</span>
                    <input onChange={(e)=>setEmail(e.target.value)} className='border-2' type="text" />
                    <span>Password</span>
                    <input onChange={(e)=>setPassword(e.target.value)} className='border-2' type="text" />
                    <button className='bg-red-700 my-3'>Signup</button>
                </form>

        <div>Already have an {<Link className='underline text-blue-500' to='/login'>login</Link>}</div>
            </div>
        </div>
        </div>
    )

}


export default Register;