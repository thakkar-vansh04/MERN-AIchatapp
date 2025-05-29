import React from 'react'
import { Route, BrowserRouter,Routes} from 'react-router-dom'

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/login" element={<div>Home Page</div>} />
            <Route path="/register" element={<div>Home Page</div>} />
        </Routes>    
    </BrowserRouter>
  )
}

export default AppRoutes
