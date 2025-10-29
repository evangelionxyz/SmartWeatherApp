import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import '../styles/Header.css';
import { useEffect, useState } from 'react';
import { getOrCreateUserConfig, useUserConfig } from '../context/UserContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const { config: userConfig, updateUserConfig } = useUserConfig();

  const onLanguageChange = async () => {
    if (!userConfig) return;
    try {
      const newLanguage = userConfig.preferedLanguage === 'en' ? 'id' : 'en';
      await updateUserConfig({ preferedLanguage: newLanguage });
      console.log(userConfig);
    } catch (err) {
      console.error('Failed to update language preference', err);
    }
  }

  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;

    const loadUserConfig = async () => {
      try {
        const c = await getOrCreateUserConfig(currentUser.email!);
        if (mounted && c) updateUserConfig(c);
      } catch (err) {
        console.error('Failed to load user config', err);
      }
    };

    loadUserConfig();

    return () => {
      mounted = false;
    };
  }, [currentUser, updateUserConfig]);

  const handleUserContext = () => {
    setUserMenuOpen(!isUserMenuOpen);
  }

  return (
    <header className="app-header">
      <div className="header-left" onClick={() => window.location.href = '/'}>
        <h1>ForePlan</h1>
      </div>
      
      <div className="header-right">
        
        {userConfig ? (
          <>
          <button className="toggle-button" onClick={onLanguageChange}>
              <span className="user-config">
                  {userConfig.preferedLanguage.toUpperCase()}
              </span>
          </button>
          <button className="toggle-button">
              <span className="user-config">
                  {userConfig.preferedUnits === 'metric' ? '°C' : '°F'}
              </span>
        </button>
        </>
        ) : (null)}

        <button 
            className="toggle-button" 
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

        <button className="user-button">
            {currentUser ? (
                <span onClick={handleUserContext} className="sign-out-button" title="Sign Out">
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