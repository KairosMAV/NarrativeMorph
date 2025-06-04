import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

const PredictiveTrendChart = ({ data }) => {
  // Formatta i dati per il grafico predittivo
  const formatTrendValue = (trend) => {
    if (!trend) return 0;
    return parseFloat(trend);
  };
  
  const predictionData = [
    {
      month: 'Current',
      reliability: 100,
      security: 100,
      maintainability: 100,
      complexity: 100
    },
    {
      month: '1 Month',
      reliability: 100 + formatTrendValue(data.reliability_trend),
      security: 100 + formatTrendValue(data.security_trend),
      maintainability: 100 + formatTrendValue(data.maintainability_trend),
      complexity: 100 + formatTrendValue(data.complexity_trend)
    },
    {
      month: '2 Month',
      reliability: 100 + formatTrendValue(data.reliability_trend) * 2,
      security: 100 + formatTrendValue(data.security_trend) * 2,
      maintainability: 100 + formatTrendValue(data.maintainability_trend) * 2,
      complexity: 100 + formatTrendValue(data.complexity_trend) * 2
    },
    {
      month: '3 Month',
      reliability: 100 + formatTrendValue(data.reliability_trend) * 3,
      security: 100 + formatTrendValue(data.security_trend) * 3,
      maintainability: 100 + formatTrendValue(data.maintainability_trend) * 3,
      complexity: 100 + formatTrendValue(data.complexity_trend) * 3
    }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={predictionData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis 
          domain={[80, 120]} 
          label={{ value: '% of Current Value', angle: -90, position: 'insideLeft' }} 
        />
        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
        <Legend />
        <ReferenceLine y={100} stroke="#666" strokeDasharray="3 3" />
        <Line 
          type="monotone" 
          dataKey="reliability" 
          stroke="#8884d8" 
          activeDot={{ r: 8 }} 
          name="Reliability"
        />
        <Line 
          type="monotone" 
          dataKey="security" 
          stroke="#82ca9d" 
          name="Security"
        />
        <Line 
          type="monotone" 
          dataKey="maintainability" 
          stroke="#ffc658" 
          name="Maintainability"
        />
        <Line 
          type="monotone" 
          dataKey="complexity" 
          stroke="#ff8042" 
          name="Complexity"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PredictiveTrendChart;