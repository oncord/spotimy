import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  background-color: #121212;
  color: white;
  min-height: 100vh;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1DB954;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  &:hover {
    color: #1DB954;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: 1px solid #1DB954;
  color: #1DB954;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  &:hover {
    background-color: #1DB954;
    color: white;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const Card = styled(Link)`
  background-color: #282828;
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  color: white;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #333333;
    transform: translateY(-5px);
  }
`;

const CardTitle = styled.h2`
  color: #1DB954;
  margin-bottom: 1rem;
`;

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <DashboardContainer>
      <Header>
        <Logo>Spotimy</Logo>
        <NavLinks>
          <StyledLink to="/dashboard">Dashboard</StyledLink>
          <StyledLink to="/top-tracks">Top Tracks</StyledLink>
          <StyledLink to="/top-artists">Top Artists</StyledLink>
          <LogoutButton onClick={logout}>Logout</LogoutButton>
        </NavLinks>
      </Header>
      
      <h1>Welcome{user?.display_name ? `, ${user.display_name}` : ''}!</h1>
      <p>Explore your Spotify listening habits and preferences.</p>
      
      <CardGrid>
        <Card to="/top-tracks">
          <CardTitle>Top Tracks</CardTitle>
          <p>Discover your most played songs over different time periods.</p>
        </Card>
        
        <Card to="/top-artists">
          <CardTitle>Top Artists</CardTitle>
          <p>See your favorite artists based on your listening history.</p>
        </Card>
      </CardGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
