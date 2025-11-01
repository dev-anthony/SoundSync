import React, { useState } from 'react';
import { Github } from 'lucide-react';
import api from '../services/api';

const OnboardingPage = ({ setCurrentPage, user, showNotification, setRepos }) => {
  const [step, setStep] = useState(1);
  const [githubToken, setGithubToken] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [repoName, setRepoName] = useState('producer-backups');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnectGithub = async () => {
    setError('');
    
    if (!githubToken.trim()) {
      setError('Please enter a GitHub token');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/github/connect', { githubToken });
      setGithubUsername(response.data.githubUsername);
      showNotification('GitHub connected successfully!');
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to connect GitHub');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepo = async () => {
    setError('');
    
    if (!repoName.trim()) {
      setError('Please enter a repository name');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/github/create-repo', { 
        repoName,
        isPrivate: true 
      });

      console.log('Repo created:', response.data);

      // Fetch updated repos list
      const reposRes = await api.get('/github/repos');
      console.log('Repos fetched:', reposRes.data);
      
      setRepos(reposRes.data.repos || []);

      showNotification('Repository created successfully!');
      
      // Small delay to ensure state updates
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 500);
    } catch (error) {
      console.error('Create repo error:', error);
      setError(error.response?.data?.error || 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className={`flex items-center ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300'}`}>1</div>
              <span className="ml-2 font-medium">Connect GitHub</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-300">
              <div className={`h-full ${step >= 2 ? 'bg-purple-600' : ''} transition-all`}></div>
            </div>
            <div className={`flex items-center ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-300'}`}>2</div>
              <span className="ml-2 font-medium">Create Repository</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect Your GitHub Account</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 mb-2 font-medium">How to get your GitHub token:</p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to GitHub.com → Settings → Developer Settings</li>
                <li>Click "Personal Access Tokens" → "Tokens (classic)"</li>
                <li>Generate new token with 'repo' permissions</li>
                <li>Copy and paste it below</li>
              </ol>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Personal Access Token</label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                onClick={handleConnectGithub}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center disabled:opacity-50"
              >
                <Github className="w-5 h-5 mr-2" />
                {loading ? 'Connecting...' : 'Connect GitHub'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Backup Repository</h2>
            <p className="text-gray-600 mb-6">We'll create a private repository to store your backups</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repository Name</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Will be created as: {githubUsername}/{repoName}</p>
              </div>
              <div className="flex items-center">
                <input type="checkbox" checked disabled className="mr-2" />
                <label className="text-sm text-gray-700">Make repository private</label>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                onClick={handleCreateRepo}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Repository'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;