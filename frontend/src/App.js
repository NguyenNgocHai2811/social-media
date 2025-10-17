import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';



const NewsFeedPage = () => <h1> Trang bang tin</h1>
function App() {
  return (
    <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage/>}/>
           <Route path="/bang-tin" element={<NewsFeedPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    </Router>
  );
}

export default App;