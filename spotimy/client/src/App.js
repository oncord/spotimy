import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TopTracks from './pages/TopTracks';
import TopArtists from './pages/TopArtists';
import TopGenres from './pages/TopGenres';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Compare from './pages/Compare';
import MoodAnalysis from './pages/MoodAnalysis';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/mood"
            element={
              <PrivateRoute>
                <MoodAnalysis />
              </PrivateRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <PrivateRoute>
                <Compare />
              </PrivateRoute>
            }
          />
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
          <Route
            path="/top-genres"
            element={
              <PrivateRoute>
                <TopGenres />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
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