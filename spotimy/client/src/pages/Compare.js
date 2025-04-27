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

const ComparisonContainer = styled.div`
  background-color: #282828;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const ComparisonTitle = styled.h2`
  margin-bottom: 1.5rem;
  color: #1DB954;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UserColumn = styled.div`
  background-color: rgba(29, 185, 84, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
`;

const GlobalColumn = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
`;

const ComparisonHeader = styled.h3`
  margin-bottom: 1rem;
  text-align: center;
`;

const ComparisonSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h4`
  margin-bottom: 1rem;
  color: #1DB954;
`;

const ComparisonItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
`;

const ItemRank = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-right: 1rem;
  min-width: 30px;
  text-align: center;
`;

const ItemImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: ${props => props.isArtist ? '50%' : '4px'};
  margin-right: 1rem;
`;

const ItemInfo = styled.div`
  flex-grow: 1;
`;

const ItemName = styled.div`
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const ItemSubtext = styled.div`
  color: #b3b3b3;
  font-size: 0.9rem;
`;

const MatchPercentage = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #1DB954;
  margin-bottom: 1rem;
`;

const GenreComparisonChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const GenreItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const GenreName = styled.div`
  margin-bottom: 0.25rem;
`;

const GenreBarContainer = styled.div`
  height: 20px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
`;

const GenreBar = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background-color: #1DB954;
  border-radius: 10px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.5rem;
`;

const Compare = () => {
  const [userTopTracks, setUserTopTracks] = useState([]);
  const [userTopArtists, setUserTopArtists] = useState([]);
  const [userTopGenres, setUserTopGenres] = useState([]);
  const [globalTopTracks, setGlobalTopTracks] = useState([]);
  const [globalTopArtists, setGlobalTopArtists] = useState([]);
  const [globalTopGenres, setGlobalTopGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [similarity, setSimilarity] = useState({
    tracks: 0,
    artists: 0,
    genres: 0,
    overall: 0
  });

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user's top data
        const userTracksResponse = await axios.get(`${process.env.REACT_APP_API_URL}/top-tracks?time_range=medium_term`, {
          withCredentials: true
        });
        
        const userArtistsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/top-artists?time_range=medium_term`, {
          withCredentials: true
        });
        
        const userGenresResponse = await axios.get(`${process.env.REACT_APP_API_URL}/top-genres?time_range=medium_term`, {
          withCredentials: true
        });
        
        // Fetch global top data
        const globalDataResponse = await axios.get(`${process.env.REACT_APP_API_URL}/global-trends`, {
          withCredentials: true
        });
        
        setUserTopTracks(userTracksResponse.data.items.slice(0, 5));
        setUserTopArtists(userArtistsResponse.data.items.slice(0, 5));
        setUserTopGenres(userGenresResponse.data.genres.slice(0, 5));
        
        setGlobalTopTracks(globalDataResponse.data.topTracks);
        setGlobalTopArtists(globalDataResponse.data.topArtists);
        setGlobalTopGenres(globalDataResponse.data.topGenres);
        
        // Calculate similarity
        const trackMatch = calculateMatchPercentage(
          userTracksResponse.data.items.map(t => t.id),
          globalDataResponse.data.topTracks.map(t => t.id)
        );
        
        const artistMatch = calculateMatchPercentage(
          userArtistsResponse.data.items.map(a => a.id),
          globalDataResponse.data.topArtists.map(a => a.id)
        );
        
        const genreMatch = calculateMatchPercentage(
          userGenresResponse.data.genres.map(g => g.name),
          globalDataResponse.data.topGenres.map(g => g.name)
        );
        
        const overallMatch = Math.round((trackMatch + artistMatch + genreMatch) / 3);
        
        setSimilarity({
          tracks: trackMatch,
          artists: artistMatch,
          genres: genreMatch,
          overall: overallMatch
        });
        
      } catch (error) {
        console.error('Error fetching comparison data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComparisonData();
  }, []);
  
  // Helper function to calculate match percentage
  const calculateMatchPercentage = (userItems, globalItems) => {
    let matches = 0;
    userItems.forEach(item => {
      if (globalItems.includes(item)) {
        matches++;
      }
    });
    
    return Math.round((matches / userItems.length) * 100);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Header>
          <Logo>Spotimy</Logo>
          <NavLinks>
            <StyledLink to="/dashboard">Dashboard</StyledLink>
            <StyledLink to="/top-tracks">Top Tracks</StyledLink>
            <StyledLink to="/top-artists">Top Artists</StyledLink>
            <StyledLink to="/top-genres">Top Genres</StyledLink>
            <StyledLink to="/compare">Compare</StyledLink>
            <StyledLink to="/settings">Settings</StyledLink>
          </NavLinks>
        </Header>
        <LoadingSpinner>Loading comparison data...</LoadingSpinner>
      </PageContainer>
    );
  }

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
      
      <h1>Compare Your Taste</h1>
      
      <ComparisonContainer>
        <ComparisonTitle>Your Music vs. Global Trends</ComparisonTitle>
        <MatchPercentage>Overall Similarity: {similarity.overall}%</MatchPercentage>
        
        <ComparisonGrid>
          <UserColumn>
            <ComparisonHeader>Your Favorites</ComparisonHeader>
            
            <ComparisonSection>
              <SectionTitle>Your Top Tracks</SectionTitle>
              {userTopTracks.map((track, index) => (
                <ComparisonItem key={track.id}>
                  <ItemRank>{index + 1}</ItemRank>
                  <ItemImage src={track.album.images[0]?.url} alt={track.name} />
                  <ItemInfo>
                    <ItemName>{track.name}</ItemName>
                    <ItemSubtext>{track.artists.map(artist => artist.name).join(', ')}</ItemSubtext>
                  </ItemInfo>
                </ComparisonItem>
              ))}
            </ComparisonSection>
            
            <ComparisonSection>
              <SectionTitle>Your Top Artists</SectionTitle>
              {userTopArtists.map((artist, index) => (
                <ComparisonItem key={artist.id}>
                  <ItemRank>{index + 1}</ItemRank>
                  <ItemImage isArtist src={artist.images[0]?.url} alt={artist.name} />
                  <ItemInfo>
                    <ItemName>{artist.name}</ItemName>
                    <ItemSubtext>{artist.genres.slice(0, 2).join(', ')}</ItemSubtext>
                  </ItemInfo>
                </ComparisonItem>
              ))}
            </ComparisonSection>
            
            <ComparisonSection>
              <SectionTitle>Your Top Genres</SectionTitle>
              <GenreComparisonChart>
                {userTopGenres.map((genre, index) => (
                  <GenreItem key={index}>
                    <GenreName>
                      {index + 1}. {genre.name.charAt(0).toUpperCase() + genre.name.slice(1)}
                    </GenreName>
                    <GenreBarContainer>
                      <GenreBar percentage={100} />
                    </GenreBarContainer>
                  </GenreItem>
                ))}
              </GenreComparisonChart>
            </ComparisonSection>
          </UserColumn>
          
          <GlobalColumn>
            <ComparisonHeader>Global Trends</ComparisonHeader>
            
            <ComparisonSection>
              <SectionTitle>Popular Tracks</SectionTitle>
              {globalTopTracks.map((track, index) => (
                <ComparisonItem key={track.id}>
                  <ItemRank>{index + 1}</ItemRank>
                  <ItemImage src={track.image} alt={track.name} />
                  <ItemInfo>
                    <ItemName>{track.name}</ItemName>
                    <ItemSubtext>{track.artist}</ItemSubtext>
                  </ItemInfo>
                </ComparisonItem>
              ))}
            </ComparisonSection>
            
            <ComparisonSection>
              <SectionTitle>Popular Artists</SectionTitle>
              {globalTopArtists.map((artist, index) => (
                <ComparisonItem key={artist.id}>
                  <ItemRank>{index + 1}</ItemRank>
                  <ItemImage isArtist src={artist.image} alt={artist.name} />
                  <ItemInfo>
                    <ItemName>{artist.name}</ItemName>
                    <ItemSubtext>{artist.genres.join(', ')}</ItemSubtext>
                  </ItemInfo>
                </ComparisonItem>
              ))}
            </ComparisonSection>
            
            <ComparisonSection>
              <SectionTitle>Popular Genres</SectionTitle>
              <GenreComparisonChart>
                {globalTopGenres.map((genre, index) => (
                  <GenreItem key={index}>
                    <GenreName>
                      {index + 1}. {genre.name.charAt(0).toUpperCase() + genre.name.slice(1)}
                    </GenreName>
                    <GenreBarContainer>
                      <GenreBar percentage={genre.popularity} />
                    </GenreBarContainer>
                  </GenreItem>
                ))}
              </GenreComparisonChart>
            </ComparisonSection>
          </GlobalColumn>
        </ComparisonGrid>
      </ComparisonContainer>
    </PageContainer>
  );
};

export default Compare;