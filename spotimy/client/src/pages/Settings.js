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

const SettingsContainer = styled.div`
  background-color: #282828;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
`;

const SettingGroup = styled.div`
  margin-bottom: 2rem;
`;

const SettingTitle = styled.h3`
  margin-bottom: 1rem;
  color: #1DB954;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const RadioInput = styled.input`
  margin-right: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const CheckboxInput = styled.input`
  margin-right: 0.5rem;
`;

const SaveButton = styled.button`
  background-color: #1DB954;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1ed760;
  }
  
  &:disabled {
    background-color: #1a773a;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  color: #1DB954;
  margin-top: 1rem;
`;

const ErrorMessage = styled.div`
  color: #ff5050;
  margin-top: 1rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.5rem;
`;

const Settings = () => {
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    defaultTimeRange: 'medium_term',
    showExplicitContent: true
  });
  
  const [originalPreferences, setOriginalPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/preferences`, {
          withCredentials: true
        });
        setPreferences(response.data);
        setOriginalPreferences(response.data);
      } catch (error) {
        console.error('Error fetching preferences:', error);
        setMessage({ 
          text: 'Failed to load preferences. Please try again later.', 
          isError: true 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences({
      ...preferences,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', isError: false });
    
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/preferences`, 
        preferences,
        { withCredentials: true }
      );
      
      setOriginalPreferences(response.data);
      setMessage({ text: 'Preferences saved successfully!', isError: false });
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ 
        text: 'Failed to save preferences. Please try again.', 
        isError: true 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    if (!originalPreferences) return false;
    
    return (
      preferences.theme !== originalPreferences.theme ||
      preferences.defaultTimeRange !== originalPreferences.defaultTimeRange ||
      preferences.showExplicitContent !== originalPreferences.showExplicitContent
    );
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
          </NavLinks>
        </Header>
        <LoadingSpinner>Loading preferences...</LoadingSpinner>
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
      
      <h1>Settings</h1>
      
      <SettingsContainer>
        <form onSubmit={handleSubmit}>
          <SettingGroup>
            <SettingTitle>Theme</SettingTitle>
            <RadioGroup>
              <RadioLabel>
                <RadioInput 
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={preferences.theme === 'dark'}
                  onChange={handleChange}
                />
                Dark
              </RadioLabel>
              <RadioLabel>
                <RadioInput 
                  type="radio"
                  name="theme"
                  value="light"
                  checked={preferences.theme === 'light'}
                  onChange={handleChange}
                />
                Light
              </RadioLabel>
            </RadioGroup>
          </SettingGroup>
          
          <SettingGroup>
            <SettingTitle>Default Time Range</SettingTitle>
            <RadioGroup>
              <RadioLabel>
                <RadioInput 
                  type="radio"
                  name="defaultTimeRange"
                  value="short_term"
                  checked={preferences.defaultTimeRange === 'short_term'}
                  onChange={handleChange}
                />
                Last 4 Weeks
              </RadioLabel>
              <RadioLabel>
                <RadioInput 
                  type="radio"
                  name="defaultTimeRange"
                  value="medium_term"
                  checked={preferences.defaultTimeRange === 'medium_term'}
                  onChange={handleChange}
                />
                Last 6 Months
              </RadioLabel>
              <RadioLabel>
                <RadioInput 
                  type="radio"
                  name="defaultTimeRange"
                  value="long_term"
                  checked={preferences.defaultTimeRange === 'long_term'}
                  onChange={handleChange}
                />
                All Time
              </RadioLabel>
            </RadioGroup>
          </SettingGroup>
          
          <SettingGroup>
            <SettingTitle>Content</SettingTitle>
            <CheckboxLabel>
              <CheckboxInput 
                type="checkbox"
                name="showExplicitContent"
                checked={preferences.showExplicitContent}
                onChange={handleChange}
              />
              Show Explicit Content
            </CheckboxLabel>
          </SettingGroup>
          
          <SaveButton 
            type="submit" 
            disabled={isSaving || !hasChanges()}
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </SaveButton>
          
          {message.text && (
            message.isError ? (
              <ErrorMessage>{message.text}</ErrorMessage>
            ) : (
              <SuccessMessage>{message.text}</SuccessMessage>
            )
          )}
        </form>
      </SettingsContainer>
    </PageContainer>
  );
};

export default Settings;