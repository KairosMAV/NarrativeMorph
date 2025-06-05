import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const TrendLineChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="quality_score" 
          stroke="#8884d8" 
          activeDot={{ r: 8 }} 
          name="Quality Score"
        />
        <Line 
          type="monotone" 
          dataKey="reliability" 
          stroke="#82ca9d" 
          name="Reliability"
        />
        <Line 
          type="monotone" 
          dataKey="security" 
          stroke="#ffc658" 
          name="Security"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendLineChart;