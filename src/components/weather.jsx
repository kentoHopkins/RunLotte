import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Weather = ({ lat, lon, onTemperatureUpdate, onWeatherUpdate, onWeatherIcon}) => {
    const [data, setData] = useState(null);
    const [temperature, setTemperature] = useState(null);
    const [weather, setWeather] = useState(null);
    const [weatherIcon, setWeatherIcon] = useState(null);

    useEffect(() => {
        if (lat && lon) {
            const fetchWeatherData = async () => {
                const apiKey = '3de7efcab1d779a860b3887b098d516d'; // Replace with your API key
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`; // 'units=metric' for Celsius

                try {
                    const response = await axios.get(url);
                    const tempCelsius = response.data.main.temp;
                    const weather = response.data.weather[0].main;
                    const weatherIcon = response.data.weather[0].icon;
                    setData(response.data);
                    setTemperature(response.data.main.temp);
                    setWeather(response.data.description);
                    setWeatherIcon(response.data.icon);
                    const tempFahrenheit = (tempCelsius * 9/5) + 32;
                    const iconUrl = 'https://openweathermap.org/img/wn/' + weatherIcon + '@2x.png';
                    onTemperatureUpdate(tempFahrenheit);  // Send temperature to parent
                    onWeatherUpdate(weather);
                    onWeatherIcon(iconUrl);
                    console.log(response.data); // For debugging
                } catch (error) {
                    console.error('Error fetching weather data:', error);
                }
            };

            fetchWeatherData();
        }
    }, [lat, lon, onTemperatureUpdate, onWeatherUpdate, onWeatherIcon]);
    return;
};

export default Weather;