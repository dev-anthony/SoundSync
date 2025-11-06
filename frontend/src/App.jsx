import React, { useState, useEffect } from 'react';
import api from './services/api';

// Import pages
import WelcomePage from './pages/WelcomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import Dashboard from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import CollaborationPage from './pages/CollaborationPage';

// Import components
import Notification from './components/Notification';

const App = () => {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [repos, setRepos] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      setUser({ username });
      loadUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserData = async () => {
    try {
      const [projectsRes, reposRes, settingsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/github/repos'),
        api.get('/settings')
      ]);
      
      setProjects(projectsRes.data.projects || []);
      setRepos(reposRes.data.repos || []);
      
      if (settingsRes.data.settings.githubConnected) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('onboarding');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    setProjects([]);
    setRepos([]);
    setCurrentPage('welcome');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {notification && <Notification message={notification.message} type={notification.type} />}
      
      {currentPage === 'welcome' && (
        <WelcomePage 
          setCurrentPage={setCurrentPage}
        />
      )}
      
      {currentPage === 'signup' && (
        <SignupPage 
          setCurrentPage={setCurrentPage}
          setUser={setUser}
          showNotification={showNotification}
        />
      )}
      
      {currentPage === 'login' && (
        <LoginPage 
          setCurrentPage={setCurrentPage}
          setUser={setUser}
          showNotification={showNotification}
        />
      )}
      
      {currentPage === 'onboarding' && (
        <OnboardingPage 
          setCurrentPage={setCurrentPage}
          user={user}
          handleLogout={handleLogout}
          showNotification={showNotification}
          setRepos={setRepos}
        />
      )}
      
      {currentPage === 'dashboard' && (
        <Dashboard 
          setCurrentPage={setCurrentPage}
          user={user}
          projects={projects}
          setProjects={setProjects}
          repos={repos}
          setRepos={setRepos}
          handleLogout={handleLogout}
          showNotification={showNotification}
        />
      )}
      
      {currentPage === 'settings' && (
        <SettingsPage 
          setCurrentPage={setCurrentPage}
          user={user}
          handleLogout={handleLogout}
          showNotification={showNotification}
        />
      )}
      
      {currentPage === 'collaboration' && (
        <CollaborationPage 
          setCurrentPage={setCurrentPage}
          user={user}
          handleLogout={handleLogout}
          showNotification={showNotification}
        />
      )}
    </div>
  );
};

export default App;