import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import NewsFeed from './pages/NewsFeedPage/NewsFeed';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import FriendRequestsPage from './pages/FriendRequestPage/FriendRequestPage';
import FriendsPage from './pages/FriendsPage/FriendsPage';
import LayoutAdmin from './components/layout/layoutAdmin';
import DashboardPage from './pages/DashBoardPage/dashboardpage';
import ListUserPage from './pages/ListUserPage/listuserpage';
import EditUser from './pages/EditUser/EditUser';
import ListPost from './pages/managerPost/ListPost';


import SearchResults from './pages/SearchFriendPage/SearchFriendPage';
import ChatPage from './pages/ChatPage/ChatPage';
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

        {/* page admin */}
        <Route path='admin' element={ <LayoutAdmin /> }>
            {/* page dashboard */}
            <Route path = 'dashboard' 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
                    }>
            </Route>
             {/* page listuser */}
            <Route path = 'users' element={
                <PrivateRoute>
                  <ListUserPage />
                </PrivateRoute>
              }>
            </Route>

            {/* page edituser */}
              <Route path = 'users/edit/:userId' element={
                  <PrivateRoute>
                    <EditUser />
                  </PrivateRoute>
                }>
            </Route>

            {/* page posts */}
            <Route path = 'posts' element={
                <PrivateRoute>
                  <ListPost />
                </PrivateRoute>
              }>
            </Route>


        </Route>


        <Route path='/' element={<Navigate to='/newsfeed' />} />
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <SearchResults />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
