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

const TrackList = styled.div`
  display: grid;
  gap: 1rem;
`;

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #282828;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #333333;
  }
`;

const TrackNumber = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-right: 1rem;
  min-width: 30px;
`;

const TrackImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 4px;
  margin-right: 1rem;
`;

const TrackInfo = styled.div`
  flex-grow: 1;
`;

const TrackName = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ArtistName = styled.div`
  color: #b3b3b3;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.5rem;
`;

const TopTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/spotify/top-tracks?time_range=${timeRange}`, {
          withCredentials: true
        });
        setTracks(response.data.items || []);
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopTracks();
  }, [timeRange]);

  return (
    <PageContainer>
      <Header>
        <Logo>Spotimy</Logo>
        <NavLinks>
          <StyledLink to="/dashboard">Dashboard</StyledLink>
          <StyledLink to="/top-tracks">Top Tracks</StyledLink>
          <StyledLink to="/top-artists">Top Artists</StyledLink>
        </NavLinks>
      </Header>
      
      <h1>Your Top Tracks</h1>
      
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
        <TrackList>
          {tracks.map((track, index) => (
            <TrackItem key={track.id}>
              <TrackNumber>{index + 1}</TrackNumber>
              <TrackImage src={track.album.images[0]?.url} alt={track.name} />
              <TrackInfo>
                <TrackName>{track.name}</TrackName>
                <ArtistName>{track.artists.map(artist => artist.name).join(', ')}</ArtistName>
              </TrackInfo>
            </TrackItem>
          ))}
        </TrackList>
      )}
    </PageContainer>
  );
};

export default TopTracks;
