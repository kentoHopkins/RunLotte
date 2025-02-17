import React from "react";
import styled from 'styled-components';
import logo from '../assets/Charlotte-49ers-004.webp';

const Button = () => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="card-image" style={{ backgroundImage: `url(${logo})` }}/> 
        <div className="category">UNC Charlotte </div>
        <div className="heading">
          {" "}
          Have you ever heard of RunLotte?
          <div className="author">
            {" "}
            By <span className="name"> John Smith </span> 1 day ago
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: fixed;  
  bottom: 20px; 
  right: 20px;    

  .card {
    width: 150px;
    background: white;
    padding: .4em;
    border-radius: 10px;
    text-align: left;
  }

  .card-image {
    background-color: rgb(236, 236, 236);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 100%;
    height: 100px;
    border-radius: 6px 6px 0 0;
  }

  .card-image:hover {
    transform: scale(0.98);
  }

  .category {
    text-transform: uppercase;
    font-size: 0.7em;
    font-weight: 600;
    color: rgb(63, 121, 230);
    padding: 15px 1px 0;
    text-align: left;
  }

  .heading {
    font-weight: 600;
    color: rgb(88, 87, 87);
    padding: 3px 0px;
    text-align: left;
  }

  .author {
    color: gray;
    font-weight: 400;
    font-size: 10px;
    padding-top: 20px;
    text-align: left;
  }

  .name {
    font-weight: 600;
  }
`;

export default Button;