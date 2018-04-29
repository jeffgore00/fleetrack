import axios from 'axios';
import * as d3 from 'd3';
import * as d3SelectionMulti from 'd3-selection-multi';

let graph;
const margin = { top: 20, right: 20, bottom: 30, left: 50 };
const dataHeight = window.innerHeight * 0.9 - margin.top - margin.bottom;
const dataWidth = window.innerWidth * 0.9 - margin.left - margin.right;

const yScale = 
  d3.scaleLinear()
    .domain([0, 42000])
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

const updateTransition = d3.transition().duration(3000);
const entryTransition = d3.transition().duration(1000).ease(d3.polyOut);
const exitTransition = d3.transition().duration(1000)

const createInfobox = data => {
  const infobox = 
    d3.select('body')
      .append('div')
      .classed(`infobox_${data.callsign}`, true)
      .style('position', 'absolute')
      .style('padding', '0 10px')
      .style('background', 'white')
      .style('opacity', 0)
      .html(`${data.callsign}<br>Lat:${data.lat}-Lng:${data.long}<br>Alt:${data.altitude}`)
      .style('opacity', .9)
      .style('left', (d3.event.pageX - 35) + 'px')
      .style('top', (d3.event.pageY - 30) + 'px');

  return infobox;
}


function getFleet(carrierCode) {
  const fleet = [];
  const fleetOffChart = []; 
  return axios.get(`/api/${carrierCode}`)
    .then(response => response.data)
    .then(aircraft => {
      for (const plane in aircraft) {
        const pComplete = aircraft[plane].flightPercentComplete;
        if (aircraft[plane].altitude && pComplete && pComplete > 0) {
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
    .append('g')
      .classed('graph', true)
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')

  graph
    .selectAll('image')
    .data(fleet)
    .enter()
    .append('image')
    // NOW APPLYING TO EACH INDIVIDUAL DATA POINT
    .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
    .attr('width', 25)
    .attr('height', 15)
    .attr('x', d => xScale(d.flightPercentComplete) - 12.5)
    .attr('y', d => yScale(d.altitude) - 15)
    .on('mouseover', function(d) {
      console.dir(this);
      console.log(d);
      const infobox = createInfobox(d);
      d3.select(this)
        .style('fill', 'red');
    })
    .on('mouseout', function(d) {
      d3.selectAll(`.infobox_${d.callsign}`).html('');
      d3.select(this)
        .style('fill', 'blue');
    })

  const yGuide = 
    graph.append('g')
      .call(yAxisTicks);

  const xGuide = 
    graph.append('g')
      .attr('transform', 'translate(0, '+ dataHeight +')')
      .call(xAxisTicks);
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
      graphData.exit().attr('class', 'exiting')
        .transition(exitTransition)
          .style('fill-opacity', 0)
          .remove();

      // UPDATE old elements present in new data.
      graphData.attr('class', 'updated')
        .transition(updateTransition)
          .attr('x', d => xScale(d.flightPercentComplete))
          .attr('y', d => yScale(d.altitude));

      // ENTER new elements present in new data.
      graphData.enter().append('image')
        .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
        .attr('width', 20)
        .attr('height', 20)
        .on('mouseover', function(d) {
          console.dir(this);
          console.log(d);
          createInfobox(d);
          d3.select(this)
            .style('fill', 'red');
        })
        .on('mouseout', function(d) {
          d3.selectAll(`.infobox_${d.callsign}`).html('');
          d3.select(this)
            .style('fill', 'blue');
        })
        .transition(entryTransition)
          .attr('x', d => xScale(d.flightPercentComplete))
          .attr('y', d => yScale(d.altitude))
      
    });
}

getFleet('DAL')
  .then( ([fleet]) => {
    buildVisualization(fleet);
  });

setInterval(updateVisualization, 5000);

// getFleet('DAL')
//   .then()