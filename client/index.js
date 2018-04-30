import axios from 'axios';
import * as d3 from 'd3';
import 'd3-transition';

let graph;
const margin = { top: 20, right: 20, bottom: 30, left: 50 };
const dataHeight = window.innerHeight * 0.9 - margin.top - margin.bottom;
const dataWidth = window.innerWidth * 0.9 - margin.left - margin.right;

const yScale = 
  d3.scaleLinear()
    .domain([0, 42000])
    .range([dataHeight, 0]);

const yAxis = 
  d3.axisLeft(yScale)
    .ticks(9);

const xScale = 
  d3.scaleLinear()
    .domain([0, 100])
    .range([0, dataWidth]);

const xAxis = 
  d3.axisBottom(xScale)
    .ticks(10);

const createInfobox = data => {
  const infobox = 
    d3.select('body')
      .append('div')
      .attr('class', 'infobox')
      .attr('id',`infobox_${data.callsign}`)
      .style('left', (d3.event.pageX + 10) + 'px')
      .style('top', (d3.event.pageY - 20) + 'px')
      .html(`
        <table>
          <tr class="infoHeader">
            <th colspan="2">${data.callsign}</th>
          </tr>
          <tr>
            <th>Departure:</th>
            <td>${data.airportFrom.city} (${data.airportFrom.code})</th>
          </tr>
          <tr>
            <th>Arrival:</td>
            <td>${data.airportTo.city} (${data.airportTo.code}) ${data.airportStops && data.airportStops.length ? '(stopping in ' + data.airportStops.map(stop => stop.code).join(', ') +')' : ''} </td> 
          </tr>
          <tr>
            <th>Location:</th>
            <td>${data.lat},${data.long}</td>
          </tr>
          <tr>
            <th>Heading:</th>
            <td>${data.heading}&deg;</td>
          </tr>
        </table>
        `);

  return infobox;
};

function getFleet(carrierCode) {
  const fleet = [];
  const fleetOffChart = []; 
  return axios.get(`/api/${carrierCode}`)
    .then(response => response.data)
    .then(aircraft => {
      for (const plane in aircraft) {
        const pComplete = aircraft[plane].flightPercentComplete;
        if (aircraft[plane].altitude && !aircraft[plane].grounded && pComplete && pComplete > 0) {
          fleet.push(aircraft[plane]);
        } else {
          fleetOffChart.push(aircraft[plane]);
        }
      }
      return [fleet, fleetOffChart];
    });
}

function buildVisualization(fleet) {

  graph = 
    d3.select('body')
      .append('svg')
      .attr('width', dataWidth + margin.left + margin.right)
      .attr('height', dataHeight + margin.top + margin.bottom)
      .attr('id', 'app')
    .append('g')
      .attr('id', 'graph')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')');

  graph
    .selectAll('image')
    .data(fleet)
    .enter()
    .append('image')
      .attr('class', 'aircraft')
      .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
      .attr('width', 25)
      .attr('height', 15)
      .attr('background', 'blue')
      .attr('x', d => xScale(d.flightPercentComplete) - 12.5)
      .attr('y', d => yScale(d.altitude) - 15)
      .on('mouseover', function(d) {
        console.dir(this);
        console.log(d);
        d3.select(this)
          .transition().duration(500)
          .attr('xlink:href', 'images/airplaneOverheadViewIcon.svg');
        createInfobox(d);
      })
      .on('mouseout', function(d) {
        d3.select(`#infobox_${d.callsign}`).remove();
        d3.select(this)
          .transition().duration(500)
          .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
          .style('fill', 'blue');
      });

  const yGuide = graph.append('g')
    .call(yAxis);

  const xGuide = graph.append('g')
    .attr('transform', 'translate(0, '+ dataHeight +')')
    .call(xAxis);
}

function updateVisualization() {
  getFleet('DAL')
    .then(([fleet]) => {
      // JOIN new data with old elements.
      const graphData = 
        graph.selectAll('image')
          .data(fleet, function(d) { 
            return d.callsign; 
          });
        
      // EXIT old elements not present in new data.
      graphData.exit().classed('exiting', true)
        .transition()
          .duration(1000)
          .style('fill-opacity', 0)
          .remove();

      // UPDATE old elements present in new data.
      graphData.classed('updated', true)
        .transition()
          .duration(4000)
          .attr('x', d => xScale(d.flightPercentComplete) - 12.5)
          .attr('y', d => yScale(d.altitude) - 15);

      // ENTER new elements present in new data.
      graphData.enter().append('image').attr('class', 'aircraft')
        .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
        .attr('width', 25)
        .attr('height', 15)
        .on('mouseover', function(d) {
          console.dir(this);
          console.log(d);
          createInfobox(d);
          d3.select(this)
            .style('fill', 'red');
        })
        .on('mouseout', function(d) {
          d3.selectAll(`#infobox_${d.callsign}`).html('');
          d3.select(this)
            .style('fill', 'blue');
        })
        .transition()
          .duration(2000)
          .attr('x', d => xScale(d.flightPercentComplete))
          .attr('y', d => yScale(d.altitude))
    });
}

getFleet('DAL')
  .then( ([fleet]) => {
    buildVisualization(fleet);
  });

setInterval(updateVisualization, 5000);