import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import * as d3 from 'd3';

const CodeHeatmap = ({ analysisData }) => {
  const svgRef = useRef();
  const [metricType, setMetricType] = useState('issues');
  
  useEffect(() => {
    if (!analysisData || !svgRef.current) return;
    
    // Pulisci il grafico precedente
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Prepara i dati
    const issues = analysisData.result?.issues || [];
    
    if (issues.length === 0) {
      // Nessun problema rilevato
      return;
    }
    
    // Raggruppa problemi per file
    const fileIssues = {};
    issues.forEach(issue => {
      const file = issue.file || 'unknown';
      if (!fileIssues[file]) {
        fileIssues[file] = {
          file,
          issues: 0,
          severity: { high: 0, medium: 0, low: 0 },
          types: {}
        };
      }
      
      fileIssues[file].issues++;
      
      // Incrementa conteggio per severità
      const severity = issue.severity || 'medium';
      fileIssues[file].severity[severity]++;
      
      // Incrementa conteggio per tipo
      const type = issue.type || 'unknown';
      if (!fileIssues[file].types[type]) {
        fileIssues[file].types[type] = 0;
      }
      fileIssues[file].types[type]++;
    });
    
    // Converti in array per D3
    const data = Object.values(fileIssues);
    
    // Dimensioni della heatmap
    const width = svgRef.current.clientWidth;
    const height = 500;
    const margin = { top: 30, right: 30, bottom: 100, left: 250 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Tronca i nomi di file troppo lunghi
    const truncateFilename = (filename, maxLength = 30) => {
      if (filename.length <= maxLength) return filename;
      const parts = filename.split('/');
      const lastName = parts.pop();
      return '.../' + lastName;
    };
    
    // Ordina i file per numero di problemi
    data.sort((a, b) => b.issues - a.issues);
    
    // Limita il numero di file visualizzati
    const topFiles = data.slice(0, 15);
    
    // Scala per l'asse y (file)
    const y = d3.scaleBand()
      .domain(topFiles.map(d => truncateFilename(d.file)))
      .range([0, innerHeight])
      .padding(0.1);
    
    // Metriche per l'asse x
    let metricKeys;
    let colorScale;
    
    if (metricType === 'issues') {
      // Visualizza il totale dei problemi
      metricKeys = ['issues'];
      colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(topFiles, d => d.issues)]);
    } else if (metricType === 'severity') {
      // Visualizza i problemi per severità
      metricKeys = ['high', 'medium', 'low'];
      colorScale = d3.scaleOrdinal()
        .domain(metricKeys)
        .range(['#f44336', '#ff9800', '#4caf50']);
    } else {
      // Visualizza i problemi per tipo
      const allTypes = new Set();
      topFiles.forEach(file => {
        Object.keys(file.types).forEach(type => allTypes.add(type));
      });
      metricKeys = Array.from(allTypes);
      colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(metricKeys);
    }
    
    // Scala per l'asse x (metriche)
    const x = d3.scaleBand()
      .domain(metricKeys)
      .range([0, innerWidth])
      .padding(0.1);
    
    // Crea l'SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    // Gruppo principale con margini
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Asse x
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
    
    // Asse y
    g.append("g")
      .call(d3.axisLeft(y));
    
    // Crea i rettangoli per la heatmap
    if (metricType === 'issues') {
      // Visualizza il totale dei problemi
      g.selectAll("rect")
        .data(topFiles)
        .join("rect")
        .attr("x", x('issues'))
        .attr("y", d => y(truncateFilename(d.file)))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => colorScale(d.issues))
        .append("title")
        .text(d => `File: ${d.file}\nIssues: ${d.issues}`);
    } else if (metricType === 'severity') {
      // Visualizza i problemi per severità
      topFiles.forEach(file => {
        metricKeys.forEach(severity => {
          g.append("rect")
            .attr("x", x(severity))
            .attr("y", y(truncateFilename(file.file)))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .attr("fill", colorScale(severity))
            .attr("opacity", file.severity[severity] > 0 ? 0.8 : 0.1)
            .append("title")
            .text(`File: ${file.file}\nSeverity: ${severity}\nCount: ${file.severity[severity]}`);
            
          // Testo per il conteggio
          if (file.severity[severity] > 0) {
            g.append("text")
              .attr("x", x(severity) + x.bandwidth() / 2)
              .attr("y", y(truncateFilename(file.file)) + y.bandwidth() / 2)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("fill", "white")
              .text(file.severity[severity]);
          }
        });
      });
    } else {
      // Visualizza i problemi per tipo
      topFiles.forEach(file => {
        metricKeys.forEach(type => {
          const count = file.types[type] || 0;
          g.append("rect")
            .attr("x", x(type))
            .attr("y", y(truncateFilename(file.file)))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .attr("fill", colorScale(type))
            .attr("opacity", count > 0 ? 0.8 : 0.1)
            .append("title")
            .text(`File: ${file.file}\nType: ${type}\nCount: ${count}`);
            
          // Testo per il conteggio
          if (count > 0) {
            g.append("text")
              .attr("x", x(type) + x.bandwidth() / 2)
              .attr("y", y(truncateFilename(file.file)) + y.bandwidth() / 2)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("fill", "white")
              .text(count);
          }
        });
      });
    }
    
  }, [analysisData, metricType]);
  
  const handleMetricChange = (event) => {
    setMetricType(event.target.value);
  };
  
  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>View by</InputLabel>
          <Select
            value={metricType}
            label="View by"
            onChange={handleMetricChange}
          >
            <MenuItem value="issues">Total Issues</MenuItem>
            <MenuItem value="severity">Severity</MenuItem>
            <MenuItem value="types">Issue Types</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {(!analysisData?.result?.issues || 
        analysisData.result.issues.length === 0) ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography color="textSecondary">
            No issues found in this analysis
          </Typography>
        </Box>
      ) : (
        <svg ref={svgRef} width="100%" height="100%" />
      )}
    </Box>
  );
};

export default CodeHeatmap;