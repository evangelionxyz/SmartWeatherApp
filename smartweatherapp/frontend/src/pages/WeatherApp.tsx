import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import CardContainer from '../components/CardContainer';
import { useUserConfig } from '../context/UserContext';
import { useWeather } from '../context/WeatherContext';
import '../styles/WeatherApp.css';
import '../styles/App.css';

const WeatherApp: React.FC = () => {
  const { currentUser } = useAuth();
  const { config: userConfig } = useUserConfig();
  const { weatherData, loading, error, fetchWeather, requestLocationPermission, coordinates } = useWeather();
  const hasFetchedRef = useRef(false);
  const hasRequestedLocationRef = useRef(false);

  // Request location permission on mount
  useEffect(() => {
    const getLocation = async () => {
      if (!hasRequestedLocationRef.current) {
        hasRequestedLocationRef.current = true;
        await requestLocationPermission();
      }
    };
    getLocation();
  }, [requestLocationPermission]);

  // Fetch weather when user config or coordinates are available
  useEffect(() => {
    if (!userConfig) return;

    if (!hasFetchedRef.current) {
      // Fetch with user's location if available
      fetchWeather(userConfig.preferredUnits, coordinates || undefined);
      hasFetchedRef.current = true;
    }

    const intervalId = setInterval(() => {
      fetchWeather(userConfig.preferredUnits, coordinates || undefined);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [userConfig, fetchWeather, coordinates]);

  const handleLocationRequest = async () => {
    const coords = await requestLocationPermission();
    if (coords && userConfig) {
      // Fetch weather immediately with new coordinates
      await fetchWeather(userConfig.preferredUnits, coords);
    }
  };

  return (
    <div className="weather-app">
      <div className="weather-header">
        <h2>Welcome, {currentUser?.displayName || 'User'}!</h2>
        {!coordinates && (
          <button onClick={handleLocationRequest} className="app-button">
            Enable Location
          </button>
        )}
      </div>

      <div className="weather-content">
        {error && <div className="error-message">{error}</div>}

        {weatherData?.current && (
          <div className="weather-info">
            
            {loading && <div className="loading">Loading weather data...</div>}

            <h3>Current Weather</h3>
            <p>Temperature: {weatherData.current.temp}°C</p>
            <p>Feels Like: {weatherData.current.feels_like}°C</p>
            <p>Humidity: {weatherData.current.humidity}%</p>
            <p>Description: {weatherData.current.weather[0]?.description}</p>
          </div>
        )}
      </div>

      <CardContainer title="Weather Details" cards={[
        { title: 'Pressure', content: weatherData?.current ? `${weatherData.current.pressure} hPa` : 'N/A' },
        { title: 'UV Index', content: weatherData?.current ? `${weatherData.current.uvi}` : 'N/A' },
        { title: 'Visibility', content: weatherData?.current ? `${weatherData.current.visibility} meters` : 'N/A' },
      ]} />

    </div>
  );
};

export default WeatherApp;