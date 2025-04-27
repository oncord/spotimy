import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import AudioFeaturesRadarChart from '../components/AudioFeaturesRadarChart';

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

const MoodContainer = styled.div`
  background-color: #282828;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MoodSummary = styled.div`
  padding-right: 2rem;
  
  @media (max-width: 768px) {
    padding-right: 0;
  }
`;

const MoodTitle = styled.h2`
  margin-bottom: 1rem;
  color: #1DB954;
`;

const MoodDescription = styled.p`
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const CharacteristicsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const CharacteristicTag = styled.div`
  background-color: rgba(29, 185, 84, 0.2);
  color: #1DB954;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const RecommendedGenres = styled.div`
  margin-top: 2rem;
`;

const GenreTitle = styled.h3`
  margin-bottom: 1rem;
  color: #1DB954;
`;

const GenreList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const GenreTag = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const MoodChart = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const MoodPoint = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: #1DB954;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  left: ${props => props.x * 100}%;
  bottom: ${props => props.y * 100}%;
  filter: drop-shadow(0 0 10px rgba(29, 185, 84, 0.7));
`;

const ChartAxis = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;

const HorizontalAxis = styled.div`
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
  bottom: 50%;
`;

const VerticalAxis = styled.div`
  position: absolute;
  width: 1px;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  left: 50%;
`;

const AxisLabel = styled.div`
  position: absolute;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
`;

const TopTracks = styled.div`
  margin-top: 2rem;
`;

const TracksTitle = styled.h3`
  margin-bottom: 1rem;
`;

const TracksList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const TrackItem = styled.div`
  background-color: #282828;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #333333;
  }
`;

const TrackImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 0.75rem;
`;

const TrackName = styled.div`
  font-weight: bold;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackArtist = styled.div`
  color: #b3b3b3;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FeatureBadge = styled.div`
  display: inline-block;
  background-color: ${props => 
    props.value >= 0.7 ? 'rgba(29, 185, 84, 0.3)' : 
    props.value >= 0.4 ? 'rgba(255, 255, 255, 0.1)' : 
    'rgba(255, 0, 0, 0.1)'
  };
  color: ${props => 
    props.value >= 0.7 ? '#1DB954' : 
    props.value >= 0.4 ? '#FFFFFF' : 
    '#FF5555'
  };
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.5rem;
`;

const FeaturesSection = styled.div`
  margin-top: 2rem;
  background-color: #282828;
  border-radius: 8px;
  padding: 2rem;
`;

const FeatureTitle = styled.h3`
  margin-bottom: 1.5rem;
  color: #1DB954;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FeatureCard = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
`;

const FeatureLabel = styled.div`
  color: #b3b3b3;
  margin-bottom: 0.5rem;
`;

const FeatureValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #1DB954;
`;

const FeatureDescription = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #b3b3b3;
`;

const FeatureExplanations = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const ExplanationTitle = styled.h4`
  margin-bottom: 1rem;
  color: #b3b3b3;
`;

const ExplanationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ExplanationItem = styled.div`
  margin-bottom: 1rem;
`;

const ExplanationTerm = styled.div`
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: #1DB954;
`;

const ExplanationDefinition = styled.div`
  font-size: 0.9rem;
  color: #b3b3b3;
`;

const MoodAnalysis = () => {
  const [moodData, setMoodData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        console.log('Fetching mood data...');
        setIsLoading(true);
        
        // Log the API URL
        console.log('API URL:', `${process.env.REACT_APP_API_URL}/audio-features`);
        
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/audio-features`, {
          withCredentials: true
        });
        
        // Log the response
        console.log('Received mood data:', response.data);
        
        setMoodData(response.data);
      } catch (error) {
        console.error('Error fetching mood data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoodData();
  }, []);

  // Helper function to format feature descriptions
  const getFeatureDescription = (feature, value) => {
    const descriptions = {
      danceability: {
        high: "Your music is highly danceable!",
        medium: "Your music has moderate rhythm patterns.",
        low: "Your music has complex or irregular rhythms."
      },
      energy: {
        high: "Your music is intense and energetic!",
        medium: "Your music has a balanced energy level.",
        low: "Your music is calm and relaxed."
      },
      valence: {
        high: "Your music is very positive and upbeat!",
        medium: "Your music has balanced emotional tones.",
        low: "Your music tends to be melancholic or negative."
      },
      acousticness: {
        high: "You prefer acoustic instruments and sounds!",
        medium: "You enjoy a mix of acoustic and electronic elements.",
        low: "You prefer electronic or processed sounds."
      },
      instrumentalness: {
        high: "You enjoy instrumental music without vocals!",
        medium: "You enjoy a mix of vocal and instrumental sections.",
        low: "You prefer music with vocals."
      },
      liveness: {
        high: "You enjoy the energy of live performances!",
        medium: "Your music has some live elements.",
        low: "You prefer studio recordings."
      }
    };

    if (value >= 0.7) return descriptions[feature].high;
    if (value >= 0.4) return descriptions[feature].medium;
    return descriptions[feature].low;
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
            <StyledLink to="/mood">Mood Analysis</StyledLink>
            <StyledLink to="/settings">Settings</StyledLink>
          </NavLinks>
        </Header>
        <LoadingSpinner>Analyzing your music mood...</LoadingSpinner>
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
      
      <h1>Your Music Mood Analysis</h1>
      
      {moodData && moodData.moodProfile && (
        <MoodContainer>
          <MoodSummary>
            <MoodTitle>{moodData.moodProfile.primaryMood}</MoodTitle>
            <MoodDescription>{moodData.moodProfile.description}</MoodDescription>
            
            <CharacteristicsList>
              {moodData.moodProfile.characteristics.map((char, index) => (
                <CharacteristicTag key={index}>{char}</CharacteristicTag>
              ))}
            </CharacteristicsList>
            
            <RecommendedGenres>
              <GenreTitle>Recommended Genres</GenreTitle>
              <GenreList>
                {moodData.moodProfile.recommendedGenres.map((genre, index) => (
                  <GenreTag key={index}>{genre}</GenreTag>
                ))}
              </GenreList>
            </RecommendedGenres>
          </MoodSummary>
          
          <div>
            <MoodChart>
              <ChartAxis>
                <HorizontalAxis />
                <VerticalAxis />
                <AxisLabel style={{ bottom: '5px', left: '50%', transform: 'translateX(-50%)' }}>
                  Positive
                </AxisLabel>
                <AxisLabel style={{ top: '5px', left: '50%', transform: 'translateX(-50%)' }}>
                  Negative
                </AxisLabel>
                <AxisLabel style={{ left: '5px', top: '50%', transform: 'translateY(-50%)' }}>
                  Calm
                </AxisLabel>
                <AxisLabel style={{ right: '5px', top: '50%', transform: 'translateY(-50%)' }}>
                  Energetic
                </AxisLabel>
              </ChartAxis>
              <MoodPoint 
                x={moodData.moodProfile.coordinates.x} 
                y={moodData.moodProfile.coordinates.y} 
              />
            </MoodChart>
          </div>
        </MoodContainer>
      )}
      
      {moodData && moodData.averageFeatures && (
        <FeaturesSection>
          <FeatureTitle>Your Audio Features vs Global Average</FeatureTitle>
          <div style={{ marginBottom: '2rem' }}>
            <AudioFeaturesRadarChart 
              userFeatures={moodData.averageFeatures} 
              globalFeatures={moodData.globalAverageFeatures} 
            />
          </div>
          
          <FeatureExplanations>
            <ExplanationTitle>What These Features Mean</ExplanationTitle>
            <ExplanationGrid>
              <ExplanationItem>
                <ExplanationTerm>Danceability</ExplanationTerm>
                <ExplanationDefinition>How suitable a track is for dancing based on tempo, rhythm stability, beat strength, and regularity.</ExplanationDefinition>
              </ExplanationItem>
              <ExplanationItem>
                <ExplanationTerm>Energy</ExplanationTerm>
                <ExplanationDefinition>A measure of intensity and activity. Energetic tracks feel fast, loud, and noisy.</ExplanationDefinition>
              </ExplanationItem>
              <ExplanationItem>
                <ExplanationTerm>Positivity</ExplanationTerm>
                <ExplanationDefinition>The musical positiveness conveyed by a track. High values sound more positive (happy, cheerful), while low values sound more negative (sad, angry).</ExplanationDefinition>
              </ExplanationItem>
              <ExplanationItem>
                <ExplanationTerm>Acousticness</ExplanationTerm>
                <ExplanationDefinition>A confidence measure of whether the track is acoustic (using acoustic instruments rather than electronic).</ExplanationDefinition>
              </ExplanationItem>
              <ExplanationItem>
                <ExplanationTerm>Instrumentalness</ExplanationTerm>
                <ExplanationDefinition>Predicts whether a track contains no vocals. Higher values represent instrumental tracks.</ExplanationDefinition>
              </ExplanationItem>
              <ExplanationItem>
                <ExplanationTerm>Liveness</ExplanationTerm>
                <ExplanationDefinition>Detects the presence of an audience in the recording. Higher values represent a higher probability the track was performed live.</ExplanationDefinition>
              </ExplanationItem>
              <ExplanationItem>
                <ExplanationTerm>Tempo</ExplanationTerm>
                <ExplanationDefinition>The overall estimated tempo of a track in beats per minute (BPM).</ExplanationDefinition>
              </ExplanationItem>
            </ExplanationGrid>
          </FeatureExplanations>
          
          <FeatureGrid>
            <FeatureCard>
              <FeatureLabel>Danceability</FeatureLabel>
              <FeatureValue>{Math.round(moodData.averageFeatures.danceability * 100)}%</FeatureValue>
              <FeatureDescription>
                {getFeatureDescription('danceability', moodData.averageFeatures.danceability)}
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureLabel>Energy</FeatureLabel>
              <FeatureValue>{Math.round(moodData.averageFeatures.energy * 100)}%</FeatureValue>
              <FeatureDescription>
                {getFeatureDescription('energy', moodData.averageFeatures.energy)}
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureLabel>Happiness</FeatureLabel>
              <FeatureValue>{Math.round(moodData.averageFeatures.valence * 100)}%</FeatureValue>
              <FeatureDescription>
                {getFeatureDescription('valence', moodData.averageFeatures.valence)}
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureLabel>Acousticness</FeatureLabel>
              <FeatureValue>{Math.round(moodData.averageFeatures.acousticness * 100)}%</FeatureValue>
              <FeatureDescription>
                {getFeatureDescription('acousticness', moodData.averageFeatures.acousticness)}
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureLabel>Instrumentalness</FeatureLabel>
              <FeatureValue>{Math.round(moodData.averageFeatures.instrumentalness * 100)}%</FeatureValue>
              <FeatureDescription>
                {getFeatureDescription('instrumentalness', moodData.averageFeatures.instrumentalness)}
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureLabel>Liveness</FeatureLabel>
              <FeatureValue>{Math.round(moodData.averageFeatures.liveness * 100)}%</FeatureValue>
              <FeatureDescription>
                {getFeatureDescription('liveness', moodData.averageFeatures.liveness)}
              </FeatureDescription>
            </FeatureCard>
          </FeatureGrid>
        </FeaturesSection>
      )}
      
      {moodData && moodData.tracks && (
        <TopTracks>
          <TracksTitle>Top Tracks in Your Analysis</TracksTitle>
          <TracksList>
            {moodData.tracks.slice(0, 8).map((track) => (
              <TrackItem key={track.id}>
                <TrackImage src={track.image || 'https://via.placeholder.com/150'} alt={track.name} />
                <TrackName>{track.name}</TrackName>
                <TrackArtist>{track.artist}</TrackArtist>
                <div>
                  <FeatureBadge value={track.audioFeatures.danceability}>
                    Dance: {Math.round(track.audioFeatures.danceability * 100)}%
                  </FeatureBadge>
                  <FeatureBadge value={track.audioFeatures.energy}>
                    Energy: {Math.round(track.audioFeatures.energy * 100)}%
                  </FeatureBadge>
                  <FeatureBadge value={track.audioFeatures.valence}>
                    Mood: {Math.round(track.audioFeatures.valence * 100)}%
                  </FeatureBadge>
                </div>
              </TrackItem>
            ))}
          </TracksList>
        </TopTracks>
      )}
    </PageContainer>
  );
};

export default MoodAnalysis;