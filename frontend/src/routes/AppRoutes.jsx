import React from "react";
import { Route , Routes , BrowserRouter } from "react-router-dom";
import Login from "../screens/Login";
import Register from "../screens/Register";
import Home from "../screens/Home";
import Project from "../screens/Project";
import UserAuth from "../auth/user.auth";

const AppRoutes = ()=>{

    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UserAuth><Home /></UserAuth>}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/register" element={<Register />}></Route>
                <Route path="/project" element={<UserAuth><Project /></UserAuth>}></Route>

            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;