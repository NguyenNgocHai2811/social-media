import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import NewsFeed from './pages/NewsFeedPage/NewsFeed';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import FriendRequestsPage from './pages/FriendRequestPage/FriendRequestPage';
import FriendsPage from './pages/FriendsPage/FriendsPage';


// A simple check for authencation
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
}

// A wrapper for protected routes
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to='/login' />;
}
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route
          path='/newsfeed'
          element={
            <PrivateRoute>
              <NewsFeed />
            </PrivateRoute>
          }
        />
        <Route
          path='/friend-requests'
          element={
            <PrivateRoute>
              <FriendRequestsPage />
            </PrivateRoute>
          }
        />
        <Route
          path='/friends'
          element={
            <PrivateRoute>
              <FriendsPage />
            </PrivateRoute>
          }
        />
        <Route
          path='/profile/:userId'
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route path='/' element={<Navigate to='/newsfeed' />} />
      </Routes>
    </Router>
  );
}

export default App;
