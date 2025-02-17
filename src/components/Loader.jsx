import React from "react";
import styled from 'styled-components';
import Weather from "../components/weather";
import AirPolution from "../components/airpolution";
import { useState } from "react";

const Loader = () => {
  const [temperatureF, setTemperatureF] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState(null);
  const [aqi, setAQI] = useState(null);
  const [airPolutionStats, setAirPolutionStats] = useState(null);

  const handleTemperatureUpdate = (temp) => {
    setTemperatureF(temp);   // Update state with temperature from Weather component
  };

  const handleWeatherUpdate = (weather) => {
    setWeather(weather); // Update state with weather from Weather component
  };

  const handleWeatherIconUpdate = (weatherIcon) => {
    setWeatherIcon(weatherIcon);  // Update state with weatherIcon from Weather component
  };

  const handleAQIUpdate = (aqi) => {
    setAQI(aqi);  // Update state with aqi from air polution component
  };

  const handleAirPolutionStatsUpdate = (airPolutionStats) => {
    setAirPolutionStats(airPolutionStats);  // Update state with airPolutionStats from air polution component
  };

  return (
    <StyledWrapper>
      <Weather lat={35.227207} lon={-80.84309} onTemperatureUpdate={handleTemperatureUpdate} onWeatherUpdate={handleWeatherUpdate} onWeatherIcon={handleWeatherIconUpdate}/>
      <AirPolution lat={35.227207} lon={-80.84309} onAQIUpdate={handleAQIUpdate} onAirPolutionStatsUpdate={handleAirPolutionStatsUpdate}/>
      <div className="container">
        {<p className="airpolutionindex">
            Air Quality: {airPolutionStats ? `${airPolutionStats}` : "..."}
          </p>}
        {<p className="temp">
          {temperatureF ? `${temperatureF.toFixed(1)}°` : "..."}
          </p>}
          {weatherIcon && <img className="weather-icon" src={weatherIcon} alt="Weather icon" />}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;

  .temp {
    font-size: 50px;
    font-weight: bold;
    margin-top: 50px;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 250px;
    padding: 15px;
  }

  .weather-icon {
    position: fixed;
    Top: 0px;
    width: 100px;
    height: 100px;
    margin-top: 10px;
  }

  .airpolutionindex {
  position: fixed;
  Top: 130px;
  font-size: 30px;
  
  }
  
`;

export default Loader;