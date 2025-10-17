import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import NewsFeed from './pages/NewsFeedPage/NewsFeed'

// A simple check for authencation
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
}

// A wrapper for protected routes
const PrivateRoute = ({ children}) => {
  return isAuthenticated() ? children : <Navigate to='/login'/>;
}
function App() {
  return (
    <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage/>}/>
          <Route 
            path='/newsfeed'
            element= {
              <PrivateRoute>
                <NewsFeed/>
              </PrivateRoute>
            }
          />
          <Route path='/'element = {<Navigate to = '/newsfeed'/>}/>
        </Routes>
    </Router>
  );
}

export default App;