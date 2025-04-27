// src/pages/Login.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #121212;
  color: white;
`;

const Logo = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #1DB954;
`;

const LoginButton = styled.button`
  background-color: #1DB954;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #1ed760;
    transform: scale(1.05);
  }
`;

const Login = () => {
  const { login } = useContext(AuthContext);

  return (
    <LoginContainer>
      <Logo>Spotimy</Logo>
      <p>Your Personal Spotify Analytics Dashboard</p>
      <LoginButton onClick={login}>
        Login with Spotify
      </LoginButton>
    </LoginContainer>
  );
};

export default Login;