import React from 'react'
import { Route, BrowserRouter,Routes} from 'react-router-dom'
import Login from '../screens/login'
import Register from '../screens/register'
import Home from '../screens/home'
import Project from '../screens/project'
import UserAuth from '../Auth/UserAuth'

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<UserAuth><Home /></UserAuth>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register />} />
            <Route path="/project" element={<UserAuth><Project /></UserAuth>} /> 
        </Routes>    
    </BrowserRouter>
  )
}

export default AppRoutes
