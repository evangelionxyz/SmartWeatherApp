import React, { useState } from 'react';
import '../styles/WeatherApp.css';

interface WeatherData {
  current?: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    uvi: number;
    visibility: number;
    weather: Array<{
      description: string;
      main: string;
      icon: string;
    }>;
  };
  error?: string;
}

interface WeatherAppProps {
  isNative: boolean;
}

const WeatherApp: React.FC<WeatherAppProps> = ({ isNative }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    // Weather functions
  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let weatherResponse: string;
      
      // Debug: Check if window.getWeather exists
      console.log('isNative:', isNative);
      console.log('window.getWeather exists:', typeof window.getWeather);
      console.log('All window bindings:', Object.keys(window).filter(k => k === 'getWeather' || k === 'checkFileChanges'));
      
      if (isNative && window.getWeather) {
        // Use C++ native API
        console.log('Calling native getWeather...');
        weatherResponse = await window.getWeather();
        console.log('Got response:', weatherResponse.substring(0, 100));
      } else {
        // Use mock data for web development
        console.log('Using mock data (isNative=' + isNative + ', hasBinding=' + !!window.getWeather + ')');
        weatherResponse = JSON.stringify({
          current: {
            temp: 25.5,
            feels_like: 27.2,
            humidity: 65,
            pressure: 1013,
            uvi: 4.2,
            visibility: 10000,
            weather: [
              {
                description: "scattered clouds",
                main: "Clouds",
                icon: "03d"
              }
            ]
          }
        });
      }
      
      const data: WeatherData = JSON.parse(weatherResponse);
      
      if (data.error) {
        setError(data.error);
        setWeatherData(null);
      } else {
        setWeatherData(data);
        setError(null);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-app">
      {/* Weather Section */}
      <section className="weather-section">
        <h2>Weather Information</h2>
        <div className="weather-controls">
          <button 
            className="btn btn-primary" 
            onClick={fetchWeather}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {weatherData && weatherData.current && (
          <div className="weather-display">
            <h3>Current Weather</h3>
            <div className="weather-grid">
              <div className="weather-item">
                <span className="label">Temperature:</span>
                <span className="value">{weatherData.current.temp}°C</span>
              </div>
              <div className="weather-item">
                <span className="label">Feels like:</span>
                <span className="value">{weatherData.current.feels_like}°C</span>
              </div>
              <div className="weather-item">
                <span className="label">Humidity:</span>
                <span className="value">{weatherData.current.humidity}%</span>
              </div>
              <div className="weather-item">
                <span className="label">Pressure:</span>
                <span className="value">{weatherData.current.pressure} hPa</span>
              </div>
              <div className="weather-item">
                <span className="label">UV Index:</span>
                <span className="value">{weatherData.current.uvi}</span>
              </div>
              <div className="weather-item">
                <span className="label">Visibility:</span>
                <span className="value">{(weatherData.current.visibility / 1000).toFixed(1)} km</span>
              </div>
              {weatherData.current.weather && weatherData.current.weather.length > 0 && (
                <div className="weather-item full-width">
                  <span className="label">Condition:</span>
                  <span className="value">{weatherData.current.weather[0].description}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Development Info */}
      {!isNative && (
        <section className="dev-info">
          <h3>🔧 Development Mode</h3>
          <p>
            You're running in web development mode. The weather data is mocked.
            Build and run the C++ application to use real weather data.
          </p>
        </section>
      )}
    </div>
  );
};

export default WeatherApp;