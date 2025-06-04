import React from 'react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer 
} from 'recharts';

const QualityRadarChart = ({ data }) => {
  // Formatta i dati per il radar chart
  const formattedData = data.map(item => ({
    ...item,
    dimension: item.dimension.charAt(0).toUpperCase() + item.dimension.slice(1) // Capitalizza la prima lettera
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formattedData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="dimension" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar
          name="Quality Score"
          dataKey="score"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default QualityRadarChart;