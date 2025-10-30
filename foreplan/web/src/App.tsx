import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import WeatherApp from './pages/WeatherApp'
import AuthBoarding from './pages/AuthBoarding'
import Header from './pages/Header'
import './styles/App.css'
import { UserConfigProvider } from './context/UserContext'
import { WeatherProvider } from './context/WeatherContext'

function App() {
  return (
    <ThemeProvider>
      <WeatherProvider>
        <AuthProvider>
          <UserConfigProvider>
            <Router>
              <div className="app">
                <Header/>
                <main className="app-main">
                  <Routes>
                    <Route path="/auth" element={<AuthBoarding />} />
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute>
                          <WeatherApp/>
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                
                <footer className="app-footer">
                  <p>Built with React | C++ WebView</p>
                </footer>
              </div>
            </Router>
          </UserConfigProvider>
        </AuthProvider>
      </WeatherProvider>
    </ThemeProvider>
  )
}

export default App
