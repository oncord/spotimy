import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

// Reuse your existing styled components
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

const SliderContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin-bottom: 2rem;
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  color: #b3b3b3;
`;

const TimeDisplay = styled.div`
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #1DB954;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.5rem;
`;

// Genre-specific styled components
const GenreList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const GenreItem = styled.div`
  background-color: #282828;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background-color: #333333;
  }
`;

const GenreName = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
`;

const GenreBar = styled.div`
  height: 10px;
  background-color: #1DB954;
  border-radius: 5px;
  width: ${props => props.width}%;
`;

const GenreCount = styled.div`
  color: #b3b3b3;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const TopGenres = () => {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthsAgo, setMonthsAgo] = useState(6); // Default to 6 months
  
  // Helper functions for time range conversion
  const getTimeRange = (months) => {
    if (months <= 1) {
      return 'short_term';
    } else if (months <= 6) {
      return 'medium_term';
    } else {
      return 'long_term';
    }
  };
  
  const getTimeDisplay = (months) => {
    if (months === 1) {
      return 'Last month';
    } else if (months === 12) {
      return 'Last year';
    } else {
      return `Last ${months} months`;
    }
  };

  useEffect(() => {
    const fetchTopGenres = async () => {
      try {
        setIsLoading(true);
        const timeRange = getTimeRange(monthsAgo);
        
        console.log("Fetching top genres with time range:", timeRange);
        
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/top-genres?time_range=${timeRange}`, {
          withCredentials: true
        });
        
        console.log("Received genre data:", response.data);
        
        setGenres(response.data.genres || []);
      } catch (error) {
        console.error('Error fetching top genres:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTopGenres();
  }, [monthsAgo]);

  const handleSliderChange = (value) => {
    setMonthsAgo(value);
  };

  // Calculate the maximum count for bar scaling
  const maxCount = genres.length > 0 ? genres[0].count : 0;

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
      
      <h1>Your Top Genres</h1>
      
      <SliderContainer>
        <TimeDisplay>
          Time Range: {getTimeDisplay(monthsAgo)}
        </TimeDisplay>
        <Slider
          min={1}
          max={24}
          value={monthsAgo}
          onChange={handleSliderChange}
          railStyle={{ backgroundColor: '#535353', height: 8 }}
          trackStyle={{ backgroundColor: '#1DB954', height: 8 }}
          handleStyle={{
            borderColor: '#1DB954',
            height: 20,
            width: 20,
            marginTop: -6,
            backgroundColor: '#1DB954',
          }}
          marks={{
            1: '',
            6: '',
            12: '',
            24: ''
          }}
        />
        <SliderLabels>
          <span>1 Month</span>
          <span>6 Months</span>
          <span>1 Year</span>
          <span>2 Years</span>
        </SliderLabels>
      </SliderContainer>
      
      {isLoading ? (
        <LoadingSpinner>Loading...</LoadingSpinner>
      ) : (
        <GenreList>
          {genres.slice(0, 20).map((genre, index) => (
            <GenreItem key={index}>
              <GenreName>{genre.name}</GenreName>
              <GenreBar width={(genre.count / maxCount) * 100} />
              <GenreCount>{genre.count} {genre.count === 1 ? 'artist' : 'artists'}</GenreCount>
            </GenreItem>
          ))}
        </GenreList>
      )}
    </PageContainer>
  );
};

export default TopGenres;