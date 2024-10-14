import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ListView from './ListView';
import AddPostForm from './AddPostForm';
import Navbar from './Navbar';
import JobDetailView from './JobDetailView';
import ModeratorHome from './ModeratorHome';
import ModeratorJobDetailView from './ModeratorJobDetailView';
import EditPostForm from './EditPostForm';
import EditPostView from './EditPostView';
import MyPostsView from './MyPostsView';
import MyApplicationsView from './MyApplicationsView';
import EditProfileView from './EditProfileView';

function AppContent() {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const user = JSON.parse(localStorage.getItem('user'));
  let isModerator = false;
  if (user != null) {
    const userRoles = user?.roles?.map((role) => role.role);
    isModerator = userRoles?.includes("MODERATOR");
  }

  return (
    <>
      {!isAuthRoute && <Navbar />}
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/main" element={isModerator ? <ModeratorHome /> : <ListView />} />
          <Route path="/job-post/:id" element={isModerator ? <ModeratorJobDetailView /> : <JobDetailView />} />
          {!isModerator && (
            <>
              <Route path="/add-post" element={<AddPostForm />} />
              <Route path="/edit-post" element={<EditPostView />} />
              <Route path="/edit-job-post/:id" element={<EditPostForm />} />
              <Route path="/my-posts" element={<MyPostsView />} />
              <Route path="/my-applications" element={<MyApplicationsView />} />
              <Route path="/edit-profile" element={<EditProfileView />} /> {}
            </>
          )}
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
