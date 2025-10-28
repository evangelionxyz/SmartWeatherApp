import { useState, useEffect } from 'react'
import './styles/App.css'
import WeatherApp from './components/WeatherApp'

// Declare window interface for C++ bindings
declare global {
  interface Window {
    count: (direction: number) => Promise<string>;
    getWeather: () => Promise<string>;
    checkFileChanges: () => Promise<string>;
  }
}

function App() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Check if we're running in the C++ webview (native mode)
    const checkNativeMode = () => {
      console.log('Checking for native bindings...');
      console.log('window.getWeather:', typeof window.getWeather);
      console.log('window.checkFileChanges:', typeof window.checkFileChanges);
      console.log('window.count:', typeof window.count);
      
      // Check for any of the C++ bindings
      if (typeof window.getWeather === 'function' || typeof window.checkFileChanges === 'function') {
        setIsNative(true);
        console.log('Running in native C++ webview mode');
      } else {
        setIsNative(false);
        console.log('Running in web development mode');
      }
    };

    checkNativeMode();
    
    // Retry check after a short delay in case bindings load later
    const timeout = setTimeout(checkNativeMode, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Smart Weather App</h1>
        <span className="mode-indicator">
          Mode: {isNative ? '🖥️ Native' : '🌐 Web'}
        </span>
      </header>
      
      <main className="app-main">
        <WeatherApp isNative={isNative} />
      </main>
      
      <footer className="app-footer">
        <p>Built with React | C++ WebView</p>
      </footer>
    </div>
  )
}

export default App
