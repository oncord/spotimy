import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
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

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TimeButton = styled.button`
  background: ${props => (props.active ? '#1DB954' : 'none')};
  border: 1px solid #1DB954;
  color: ${props => (props.active ? 'white' : '#1DB954')};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  &:hover {
    background-color: #1DB954;
    color: white;
  }
`;

const ArtistList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const ArtistItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #282828;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #333333;
    transform: translateY(-5px);
  }
`;

const ArtistImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 1rem;
  object-fit: cover;
`;

const ArtistName = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const GenreList = styled.div`
  color: #b3b3b3;
  font-size: 0.9rem;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.5rem;
`;

const TopArtists = () => {
  const [artists, setArtists] = useState([]);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/top-artists?time_range=${timeRange}`, {
          withCredentials: true
        });
        setArtists(response.data.items || []);
      } catch (error) {
        console.error('Error fetching top artists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopArtists();
  }, [timeRange]);

  return (
    <PageContainer>
      <Header>
        <Logo>Spotimy</Logo>
        <NavLinks>
          <StyledLink to="/dashboard">Dashboard</StyledLink>
          <StyledLink to="/top-tracks">Top Tracks</StyledLink>
          <StyledLink to="/top-artists">Top Artists</StyledLink>
          <StyledLink to="/top-genres">Top Genres</StyledLink>
          <StyledLink to="/mood">Mood Analysis</StyledLink>
          <StyledLink to="/settings">Settings</StyledLink>
        </NavLinks>
      </Header>
      
      <h1>Your Top Artists</h1>
      
      <TimeRangeSelector>
        <TimeButton 
          active={timeRange === 'short_term'} 
          onClick={() => setTimeRange('short_term')}
        >
          Last 4 Weeks
        </TimeButton>
        <TimeButton 
          active={timeRange === 'medium_term'} 
          onClick={() => setTimeRange('medium_term')}
        >
          Last 6 Months
        </TimeButton>
        <TimeButton 
          active={timeRange === 'long_term'} 
          onClick={() => setTimeRange('long_term')}
        >
          All Time
        </TimeButton>
      </TimeRangeSelector>
      
      {isLoading ? (
        <LoadingSpinner>Loading...</LoadingSpinner>
      ) : (
        <ArtistList>
          {artists.map((artist) => (
            <ArtistItem key={artist.id}>
              <ArtistImage 
                src={artist.images[0]?.url || 'https://via.placeholder.com/150'} 
                alt={artist.name} 
              />
              <ArtistName>{artist.name}</ArtistName>
              <GenreList>
                {artist.genres.slice(0, 3).join(', ')}
              </GenreList>
            </ArtistItem>
          ))}
        </ArtistList>
      )}
    </PageContainer>
  );
};

export default TopArtists;