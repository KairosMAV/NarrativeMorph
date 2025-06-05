import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import * as d3 from 'd3';

const DependencyGraph = ({ analysisData }) => {
  const svgRef = useRef();
  
  useEffect(() => {
    if (!analysisData || !svgRef.current) return;
    
    // Pulisci il grafico precedente
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Prepara i dati
    const dependencies = analysisData.details?.architecture?.components?.dependencies || [];
    const components = analysisData.details?.architecture?.components?.components || [];
    
    if (dependencies.length === 0 || components.length === 0) {
      // Nessun dato di dipendenza disponibile
      return;
    }
    
    // Crea nodi e collegamenti per il grafico di dipendenza
    const nodes = components.map(component => ({
      id: component.name,
      group: 1
    }));
    
    const links = dependencies.map(dep => ({
      source: dep.from,
      target: dep.to,
      value: dep.strength * 10
    }));
    
    // Dimensioni del grafico
    const width = svgRef.current.clientWidth;
    const height = 500;
    
    // Crea il force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));
    
    // Crea l'SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    // Crea i collegamenti
    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));
    
    // Crea i nodi
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", "#1976d2")
      .call(drag(simulation));
    
    // Aggiungi etichette ai nodi
    const text = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", 12)
      .attr("y", ".31em")
      .text(d => d.id);
    
    // Aggiorna la posizione degli elementi durante la simulazione
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
        
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
        
      text
        .attr("x", d => d.x + 12)
        .attr("y", d => d.y + 3);
    });
    
    // Funzione per il trascinamento dei nodi
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    
  }, [analysisData]);
  
  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      {(!analysisData?.details?.architecture?.components?.dependencies || 
        analysisData.details.architecture.components.dependencies.length === 0) ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography color="textSecondary">
            No dependency data available for this analysis
          </Typography>
        </Box>
      ) : (
        <svg ref={svgRef} width="100%" height="100%" />
      )}
    </Box>
  );
};

export default DependencyGraph;