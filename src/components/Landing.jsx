import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from './Card'
import Loader from './Loader'
import './Landing.css';
import Social from './Social'
import VideoBackground from './VideoBackground';
import Button from './button'

const Landing = () => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Add a slight delay before navigation to allow animation to complete
    setTimeout(() => {
      navigate('/map');
    }, 300); // Adjust this delay as needed
  }

  return (
    <div className='wrapper'>
      <h1 className='title'> RunLotte </h1>
      <Card onNavigate={handleCardClick} />
      <Loader />
      <Social />
      <Button />
      <VideoBackground />
    </div>
  )
}

export default Landing;
