import { createContext , useState , useContext } from "react";

export const UserContext = createContext();


export const UserProvider = ({children})=>{

    const [user , setUser] = useState(null);

    return(
        <UserContext.Provider value={{user , setUser}}>
            {children}
        </UserContext.Provider>

    )

}

// basically i am creating a custom hook here 
