// src/pages/TopTracks.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const SliderContainer = styled.div`
  width: 100%;
  max-width: 500px;
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
  // Keep your existing state variables
  const [tracks, setTracks] = useState([]);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [isLoading, setIsLoading] = useState(true);
  
  // Add a new state for the slider value
  const [sliderValue, setSliderValue] = useState(1); // Default to medium term (index 1)
  
  // Time range mapping
  const timeRanges = [
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' }
  ];

  // Effect to update the time range when slider changes
  useEffect(() => {
    setTimeRange(timeRanges[sliderValue].value);
  }, [sliderValue]);

  // Keep your existing data fetching effect
  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/top-tracks?time_range=${timeRange}`, {
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

  const handleSliderChange = (value) => {
    setSliderValue(value);
  };

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
      
      <h1>Your Top Tracks</h1>
      
      {/* Replace the buttons with a slider */}
      <SliderContainer>
        <TimeDisplay>
          Time Range: {timeRanges[sliderValue].label}
        </TimeDisplay>
        <Slider
          min={0}
          max={2}
          value={sliderValue}
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
            0: '',
            1: '',
            2: ''
          }}
        />
        <SliderLabels>
          <span>4 Weeks</span>
          <span>6 Months</span>
          <span>All Time</span>
        </SliderLabels>
      </SliderContainer>
      
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