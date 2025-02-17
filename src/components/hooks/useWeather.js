import { useState, useEffect } from 'react';

export const useWeather = (lat, lon) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchWeatherData = async () => {
            if (!lat || !lon) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=3de7efcab1d779a860b3887b098d516d`
                );
                
                if (!response.ok) {
                    throw new Error('Weather data fetch failed');
                }
                
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching weather data:', error);
                setError('Failed to load weather data');
            } finally {
                setLoading(false);
            }
        };

        fetchWeatherData();

        // Optional: Update weather every 5 minutes
        const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [lat, lon]);

    return {
        temperature: data?.main?.temp,
        temperatureF: data?.main?.temp ? Math.round((data.main.temp * 9/5) + 32) : null,
        humidity: data?.main?.humidity,
        description: data?.weather?.[0]?.description,
        icon: data?.weather?.[0]?.icon,
        loading,
        error
    };
};