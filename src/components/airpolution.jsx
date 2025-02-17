import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AirPolution = ({ lat, lon, onAQIUpdate, onAirPolutionStatsUpdate}) => {
    const [data, setData] = useState(null);
    const [AQI, setAQI] = useState(null);

    useEffect(() => {
        if (lat && lon) {
            const fetchAirPolutionData = async () => {
                const apiKey = '3de7efcab1d779a860b3887b098d516d'; // Replace with your API key
                const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`; // 'units=metric' for Celsius
                try {
                    const response = await axios.get(url);
                    const aqi = response.data.list[0].main.aqi;

                    let stats = "";
                    if(aqi === 1){
                        stats = "Good";
                    }
                    else if(aqi === 2){
                        stats = "Fair";
                    }
                    else if(aqi === 3){
                        stats = "Moderate";
                    }
                    else if(aqi === 4){
                        stats = "Poor";
                    }
                    else{
                        stats = "Very Poor";
                    }
                    
                    setData(response.data);
                    setAQI(response.data.list.aqi);

                    onAQIUpdate(aqi);  // Send temperature to parent
                    onAirPolutionStatsUpdate(stats);
                    console.log(response.data); // For debugging
                } catch (error) {
                    console.error('Error fetching air polution data:', error);
                }
            };

            fetchAirPolutionData();
        }
    }, [lat, lon, onAQIUpdate, onAirPolutionStatsUpdate]);
    return;
};

export default AirPolution;