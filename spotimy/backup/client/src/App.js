// importing from dependencies
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

// pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TopTracks from './pages/TopTracks';
import NotFound from './pages/NotFound';

function App() {
	  return (
		      <AuthProvider>
		        <Router>
		          <Routes>
		            <Route path="/" element={<Login />} />
		            <Route 
		              path="/dashboard" 
		              element={
				                    <PrivateRoute>
				                      <Dashboard />
				                    </PrivateRoute>
				                  } 
		            />
		            <Route 
		              path="/top-tracks" 
		              element={
				                    <PrivateRoute>
				                      <TopTracks />
				                    </PrivateRoute>
				                  } 
		            />
		            <Route 
		              path="/top-artists" 
		              element={
				                    <PrivateRoute>
				                      <TopArtists />
				                    </PrivateRoute>
				                  } 
		            />
		            <Route path="*" element={<NotFound />} />
		          </Routes>
		        </Router>
		      </AuthProvider>
	  );
}

export default App;
