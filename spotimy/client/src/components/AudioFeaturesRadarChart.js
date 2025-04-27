import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register required Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const AudioFeaturesRadarChart = ({ userFeatures, globalFeatures }) => {
  // Format features for chart display - scale tempo to 0-1 range
  const formatFeatures = (features) => {
    if (!features) return null;
    
    const formattedFeatures = { ...features };
    // Normalize tempo to 0-1 range (assuming typical tempo range of 50-180 BPM)
    if (formattedFeatures.tempo) {
      formattedFeatures.tempo = Math.min(Math.max((formattedFeatures.tempo - 50) / 130, 0), 1);
    }
    return formattedFeatures;
  };

  const formattedUserFeatures = formatFeatures(userFeatures);
  const formattedGlobalFeatures = formatFeatures(globalFeatures);

  // Return null if features aren't available
  if (!formattedUserFeatures) return null;

  // Feature labels with friendly display names
  const featureLabels = {
    danceability: 'Danceability',
    energy: 'Energy',
    valence: 'Positivity',
    acousticness: 'Acousticness',
    instrumentalness: 'Instrumentalness',
    liveness: 'Liveness',
    tempo: 'Tempo'
  };

  // Data for the radar chart
  const data = {
    labels: Object.keys(featureLabels).map(key => featureLabels[key]),
    datasets: [
      {
        label: 'Your Music',
        data: Object.keys(featureLabels).map(key => formattedUserFeatures[key] || 0),
        backgroundColor: 'rgba(29, 185, 84, 0.2)',
        borderColor: 'rgba(29, 185, 84, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(29, 185, 84, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(29, 185, 84, 1)',
      }
    ]
  };

  // Add global features comparison if available
  if (formattedGlobalFeatures) {
    data.datasets.push({
      label: 'Global Average',
      data: Object.keys(featureLabels).map(key => formattedGlobalFeatures[key] || 0),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
    });
  }

  // Chart options
  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12
          }
        },
        ticks: {
          display: false,
          maxTicksLimit: 5,
        },
        suggestedMin: 0,
        suggestedMax: 1,
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              // Show percentage for better readability
              label += Math.round(context.parsed * 100) + '%';
            }
            return label;
          }
        }
      }
    },
    maintainAspectRatio: true,
  };

  return (
    <div style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
      <Radar data={data} options={options} />
    </div>
  );
};

export default AudioFeaturesRadarChart;