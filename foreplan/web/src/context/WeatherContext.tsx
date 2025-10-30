import { useContext, createContext, type ReactNode, useState, useCallback } from "react";

export interface WeatherData {
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

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface WeatherContextType {
    location: string;
    setLocation: React.Dispatch<React.SetStateAction<string>>;
    coordinates: Coordinates | null;
    weatherData: WeatherData | null;
    loading: boolean;
    error: string | null;
    fetchWeather: (units: string, coords?: Coordinates) => Promise<void>;
    requestLocationPermission: () => Promise<Coordinates | null>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [location, setLocation] = useState<string>('New York');
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Request location permission and get user's coordinates
     * @returns Coordinates object or null if denied/failed
     */
    const requestLocationPermission = useCallback(async (): Promise<Coordinates | null> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.error('Geolocation is not supported by your browser');
                setError('Geolocation is not supported by your browser');
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords: Coordinates = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    console.log('Location permission granted:', coords);
                    setCoordinates(coords);
                    resolve(coords);
                },
                (error) => {
                    console.error('Location permission denied:', error.message);
                    let errorMessage = 'Unable to get your location';
                    
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                    
                    setError(errorMessage);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }, []);

    const fetchWeather = useCallback(async (units: string, coords?: Coordinates) => {
        setLoading(true);
        setError(null);

        try {
            // Use provided coords, or stored coordinates, or default to Jakarta
            const lat = coords?.latitude ?? coordinates?.latitude ?? -6.2146;
            const lon = coords?.longitude ?? coordinates?.longitude ?? 106.8451;

            console.log(`Fetching weather for lat: ${lat}, lon: ${lon}, units: ${units}`);

            // Fetch weather data with user's preferred units
            const response = await fetch(
                `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&lang=en&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
            );
            const data: WeatherData = await response.json();

            if (response.ok) {
                setWeatherData(data);
            } else {
                setError(data.error || 'Failed to fetch weather data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        } finally {
            setLoading(false);
        }
    }, [coordinates]);

    return (
    <WeatherContext.Provider value={{ 
        location, 
        setLocation, 
        coordinates,
        weatherData, 
        loading, 
        error, 
        fetchWeather,
        requestLocationPermission 
    }}>
        {children}
    </WeatherContext.Provider>
    );
}

export const useWeather = (): WeatherContextType => {
    const context = useContext(WeatherContext);
    if (!context) {
        throw new Error('useWeather must be used within a WeatherProvider');
    }
    return context;
};
