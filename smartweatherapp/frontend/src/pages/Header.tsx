import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { getOrCreateUserConfig, storeUserConfig, useUserConfig, type UserConfig } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import '../styles/App.css';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const { config: userConfig, updateUserConfig } = useUserConfig();
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const currentConfig = useRef<UserConfig | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    if (currentConfig.current?.preferredLanguage == userConfig?.preferredLanguage) return;
    if (currentConfig.current?.preferredUnits == userConfig?.preferredUnits) return;

    const loadUserConfig = async () => {
      try {
        currentConfig.current = await getOrCreateUserConfig(currentUser?.email!);
        updateUserConfig(currentConfig.current);
      } catch (err) {
        console.error('Failed to load user config', err);
      }
    };
  
    loadUserConfig();
  }, [currentUser]);

  const onLanguageChange = async () => {
    if (!userConfig) return;
    try {
      const newLanguage = userConfig.preferredLanguage === 'en' ? 'id' : 'en';
      let updatedConfig = { ...userConfig, preferredLanguage: newLanguage };
      updateUserConfig(updatedConfig);
      await storeUserConfig(currentUser!.email!, updatedConfig);
    } catch (err) {
      console.error('Failed to update language preference', err);
    }
  }
  

  const handleUserContext = () => {
    setUserMenuOpen(!isUserMenuOpen);
  }

  return (
    <header className="app-header">
      <div className="header-left" onClick={() => navigate('/')}>
        <h1>ForePlan</h1>
      </div>
      
      <div className="header-right">
        
        {userConfig ? (
          <button className="app-toggle-button" onClick={onLanguageChange}>
              <span className="user-config">
                  {userConfig.preferredLanguage.toUpperCase()}
              </span>
          </button>
        ) : (null)}

        <button 
            className="app-toggle-button" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
            {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            )}
        </button>

        <button className="app-button">
            {currentUser ? (
                <span onClick={handleUserContext} title="Sign Out">
                {currentUser.displayName}
            </span>
            ) : (
                <span className="sign-in-button" title="Sign In">
                Sign In
            </span>
            )}
        </button>
        </div>
    </header>
  );
};

export default Header;