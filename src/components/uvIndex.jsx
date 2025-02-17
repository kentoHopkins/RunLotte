import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UVIndex = ({ lat, lon, onUVIUpdate}) => {
    const [data, setData] = useState(null);
    const [UVI, setUVI] = useState(null);

    useEffect(() => {
        if (lat && lon) {
            const fetchUVData = async () => {
                const apiKey = '3de7efcab1d779a860b3887b098d516d'; // Replace with your API key
                const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`; // 'units=metric' for Celsius

                try {
                    const response = await axios.get(url);
                    const uvi = response.data.current.uvi;
                    setData(response.data);
                    setUVI(response.data.current.uvi);
                    onUVIUpdate(uvi);  // Send uvi to parent
                    console.log(response.data); 
                } catch (error) {
                    console.error('Error fetching weather data:', error);
                }
            };

            fetchUVData();
        }
    }, [lat, lon, onUVIUpdate]);
    return;
};

export default UVIndex;