// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #121212;
  color: white;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 4rem;
  color: #1DB954;
  margin-bottom: 1rem;
`;

const Text = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const StyledLink = styled(Link)`
  background-color: #1DB954;
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: bold;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #1ed760;
    transform: scale(1.05);
  }
`;

const NotFound = () => {
  return (
    <Container>
      <Title>404</Title>
      <Text>Oops! The page you're looking for doesn't exist.</Text>
      <StyledLink to="/">Back to Home</StyledLink>
    </Container>
  );
};

export default NotFound;