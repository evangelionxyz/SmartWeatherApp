import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/WeatherApp.css';
import CardContainer from '../components/CardContainer';
import { useUserConfig } from '../context/UserContext';

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

const WeatherApp: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { config: userConfig } = useUserConfig();

  // Weather functions
  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let config = userConfig;

      let weatherCall: string = `https://api.openweathermap.org/data/3.0/onecall?lat=-6.2146&lon=106.8451&units=${config?.preferedUnits}&lang=${config?.preferedLanguage}&appid=893bab7ae25756bc9c80791010ec76bd`;
      let weatherResponse: string = "";

      const response = await fetch(weatherCall);
      weatherResponse = await response.text();
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

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div className="weather-app">
      <div className="weather-header">
        <h2>Welcome, {currentUser?.displayName || 'User'}!</h2>
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