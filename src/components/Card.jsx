import React, { useState } from "react";
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Card = () => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);

    setTimeout(() => {
      navigate("/map");
    }, 500);
  };

  return (
    <StyledWrapper>
      <div
        className={`container noselect ${isAnimating ? "animate" : ""}`}
        onClick={handleClick}
      >
        <div className="canvas">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className={`tracker tr-${i + 1}`} />
          ))}
          <div id="card">
            <p id="prompt">Let's Get Started!</p>
            <div className="title">
              Click <br /> To <br /> Route!
            </div>
            <div className="subtitle"></div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container {
    position: relative;
    width: 300px;
    height: 110px;
    transition: 200ms;
  }

  .container:active {
    width: 254px;
    height: 100px;
  }

  #card {
    position: absolute;
    inset: 0;
    z-index: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
    transition: 700ms;
    background: linear-gradient(
      43deg,
      rgb(30, 200, 30) 0%,
      rgb(50, 205, 50) 50%, 
      rgb(23, 155, 23) 100%
    );
    box-shadow: 0 0 15px rgba(50, 205, 50, 0.5); /* Initial glow */
  }

  .subtitle {
    transform: translateY(160px);
    color: rgb(0, 0, 0);
    text-align: center;
    width: 100%;
  }

  .title {
    opacity: 0;
    transition-duration: 30ms;
    transition-timing-function: ease-in-out-out;
    transition-delay: 10ms;
    position: absolute;
    font-size: x-large;
    font-weight: bold;
    color: white;
  }

  .tracker:hover ~ #card .title {
    opacity: 1;
  }

  #prompt {
    position: absolute;
    font-size: 20px;
    font-weight: bold;
    transition: 300ms ease-in-out-out;
    color: rgb(255, 255, 255);
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    max-width: 110px;
  }

  .tracker {
    position: absolute;
    z-index: 200;
    width: 100%;
    height: 100%;
  }

  .tracker:hover {
    cursor: pointer;
  }

  .tracker:hover ~ #card #prompt {
    opacity: 0;
  }

  .tracker:hover ~ #card {
    transition: 30ms;
    filter: brightness(1.1);
    box-shadow: 0 0 30px rgba(50, 205, 50, 1); /* Increased glow on hover */
  }

  .canvas {
    perspective: 800px;
    inset: 0;
    z-index: 200;
    position: absolute;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 0px;
  }

  #card::before {
    content: "";
    background: linear-gradient(
      43deg,
      rgb(65, 88, 208) 0%,
      rgb(200, 80, 192) 100%,
      rgb(255, 204, 112) 100%
    );
    filter: blur(2rem);
    opacity: 30%;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
    transition: 200ms;
  }

  .noselect {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Trackers */
  ${Array.from({ length: 25 })
    .map(
      (_, i) => `
      .tr-${i + 1} {
        grid-area: tr-${i + 1};
      }
      .tr-${i + 1}:hover ~ #card {
        transition: 125ms ease-in-out;
        transform: rotateX(${20 - (i % 5) * 5}deg) rotateY(${
        (i % 5) * 5 - 10
      }deg);
      }
    `
    )
    .join("\n")}
`;

export default Card;