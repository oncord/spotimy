import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';

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

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-right: 2rem;
`;

const ProfileInfo = styled.div``;

const Username = styled.h2`
  margin-bottom: 0.5rem;
`;

const AccountType = styled.div`
  background-color: ${props => props.premium ? '#FFD700' : '#808080'};
  color: #121212;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: #282828;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StatTitle = styled.div`
  font-size: 1.2rem;
  color: #b3b3b3;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StatSubtext = styled.div`
  color: #b3b3b3;
  font-size: 0.9rem;
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ViewAllLink = styled(Link)`
  font-size: 0.9rem;
  color: #1DB954;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const ItemCard = styled.div`
  background-color: #282828;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #333333;
    transform: translateY(-5px);
  }
`;

const ItemImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ItemName = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemSubtext = styled.div`
  color: #b3b3b3;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.5rem;
`;

const Dashboard = () => {
  /* states */
  const { user } = useContext(AuthContext); // useContext hook to access user data
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // fetch api and dynamically manipulate DOM
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // fetch stats
        const statsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/stats`, {
          withCredentials: true
        });
        
        // fetch top tracks
        const tracksResponse = await axios.get(`${process.env.REACT_APP_API_URL}/top-tracks?time_range=medium_term`, {
          withCredentials: true
        });
        
        // fetch top artists
        const artistsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/top-artists?time_range=medium_term`, {
          withCredentials: true
        });
        
        // fetch top genres
        const genresResponse = await axios.get(`${process.env.REACT_APP_API_URL}/top-genres?time_range=medium_term`, {
          withCredentials: true
        });
        
        setStats(statsResponse.data);
        setTopTracks(tracksResponse.data.items.slice(0, 5));
        setTopArtists(artistsResponse.data.items.slice(0, 5));
        setTopGenres(genresResponse.data.genres.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
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
            <StyledLink to="/mood">Mood Analysis</StyledLink>
            <StyledLink to="/settings">Settings</StyledLink>
          </NavLinks>
        </Header>
        <LoadingSpinner>Loading dashboard...</LoadingSpinner>
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
      
      {user && (
        <UserProfile>
          <ProfileImage src={user.profileImage || 'https://via.placeholder.com/120'} alt={user.displayName} />
          <ProfileInfo>
            <Username>{user.displayName || 'Spotify User'}</Username>
            <AccountType premium={user.premium}>
              {user.premium ? 'Premium' : 'Free'}
            </AccountType>
            <div>{user.email}</div>
          </ProfileInfo>
        </UserProfile>
      )}
      
      {stats && (
        <StatsGrid>
          <StatCard>
            <StatTitle>Unique Artists</StatTitle>
            <StatValue>{stats.uniqueArtists}</StatValue>
            <StatSubtext>in your top artists</StatSubtext>
          </StatCard>
          <StatCard>
            <StatTitle>Unique Genres</StatTitle>
            <StatValue>{stats.uniqueGenres}</StatValue>
            <StatSubtext>in your listening history</StatSubtext>
          </StatCard>
          <StatCard>
            <StatTitle>Top Genre</StatTitle>
            <StatValue>
              {stats.topGenre ? 
                stats.topGenre.name.charAt(0).toUpperCase() + stats.topGenre.name.slice(1) : 
                'None'
              }
            </StatValue>
            <StatSubtext>
              {stats.topGenre ? 
                `${stats.topGenre.count} artists` : 
                'No genre data available'
              }
            </StatSubtext>
          </StatCard>
        </StatsGrid>
      )}
      
      <Section>
        <SectionTitle>
          Your Top Tracks
          <ViewAllLink to="/top-tracks">View All</ViewAllLink>
        </SectionTitle>
        <ItemsGrid>
          {topTracks.map(track => (
            <ItemCard key={track.id}>
              <ItemImage src={track.album.images[0]?.url} alt={track.name} />
              <ItemName>{track.name}</ItemName>
              <ItemSubtext>{track.artists.map(artist => artist.name).join(', ')}</ItemSubtext>
            </ItemCard>
          ))}
        </ItemsGrid>
      </Section>
      
      <Section>
        <SectionTitle>
          Your Top Artists
          <ViewAllLink to="/top-artists">View All</ViewAllLink>
        </SectionTitle>
        <ItemsGrid>
          {topArtists.map(artist => (
            <ItemCard key={artist.id}>
              <ItemImage src={artist.images[0]?.url} alt={artist.name} />
              <ItemName>{artist.name}</ItemName>
              <ItemSubtext>{artist.genres.slice(0, 2).join(', ')}</ItemSubtext>
            </ItemCard>
          ))}
        </ItemsGrid>
      </Section>
      
      <Section>
        <SectionTitle>
          Your Top Genres
          <ViewAllLink to="/top-genres">View All</ViewAllLink>
        </SectionTitle>
        <ItemsGrid>
          {topGenres.map((genre, index) => (
            <ItemCard key={index}>
              <ItemName>
                {genre.name.charAt(0).toUpperCase() + genre.name.slice(1)}
              </ItemName>
              <ItemSubtext>{genre.count} {genre.count === 1 ? 'artist' : 'artists'}</ItemSubtext>
            </ItemCard>
          ))}
        </ItemsGrid>
      </Section>
    </PageContainer>
  );
};

export default Dashboard;