import axios from 'axios';
import * as d3 from 'd3';

const margin = { top: 50, right: 0, bottom: 30, left: 70 }
const dataHeight = window.innerHeight - margin.top - margin.bottom;
const dataWidth = window.innerWidth - margin.left - margin.right;

function getFleet(carrierCode) {
  const fleet = [];
  const fleetOffChart = []; 
  return axios.get(`/api/${carrierCode}`)
    .then(response => response.data)
    .then(aircraft => {
      for (const plane in aircraft) {
        const pComplete = aircraft[plane].flightPercentComplete;
        if (pComplete && pComplete > 0) {
          fleet.push(aircraft[plane]);
        } else {
          fleetOffChart.push(aircraft[plane]);
        }
      }
      return [fleet, fleetOffChart];
    });
}

getFleet('DAL')
  .then( ([fleet]) => {
    const yScale = 
      d3.scaleLinear()
        .domain([0, 45000])
        .range([dataHeight, 0]);
  
    const yAxisTicks = 
      d3.axisLeft(yScale)
        .ticks(9);
  
    const xScale = 
      d3.scaleLinear()
        .domain([0, 100])
        .range([0, dataWidth]);
  
    const xAxisTicks = 
    d3.axisBottom(xScale)
      .ticks(10);

  const tooltip = 
    d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('padding', '0 10px')
      .style('background', 'white')
      .style('opacity', 0);

  const myChart = 
    d3.select('#app').append('svg')
      .attr('width', dataWidth + margin.left + margin.right)
      .attr('height', dataHeight + margin.top + margin.bottom)
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.right + ')')
      .selectAll('rect')
      .data(fleet)
      .enter()
      .append('rect')
        .attr('fill', 'blue')
        .attr('width', 10)
        .attr('height', 10)
        .attr('x', d => xScale(d.flightPercentComplete))
        .attr('y', d => yScale(d.altitude))
        .on('mouseover', d => {
          console.log(d)
          tooltip.html(`<div>${d.call} ${d.airportFrom.code}-${d.airportTo.code}</div>`)
            .style('opacity', .9)
            .style('left', (d3.event.pageX -35) + 'px')
            .style('top', (d3.event.pageY -30) + 'px');
          d3.select(this)
            .style('fill', 'red');
        })
        .on('mouseout', d => {
          tooltip.html('')
          d3.select(this)
            .style('fill', 'blue');
        });

  const yGuide = 
    d3.select('#app svg').append('g')
      .attr('transform', 'translate(70,0)')
      .call(yAxisTicks);

  const xGuide = 
    d3.select('#app svg').append('g')
      .attr('transform', 'translate(70,'+ dataHeight + ')')
      .call(xAxisTicks);
  })

// getFleet('DAL')
//   .then()