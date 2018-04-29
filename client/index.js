import axios from 'axios';
import * as d3 from 'd3';
import * as d3SelectionMulti from 'd3-selection-multi';

const margin = { top: 50, right: 0, bottom: 30, left: 70 }
const dataHeight = window.innerHeight - margin.top - margin.bottom;
const dataWidth = window.innerWidth - margin.left - margin.right;

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

const createInfobox = (data, index) => {
  const infobox = 
    d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('padding', '0 10px')
      .style('background', 'white')
      .style('opacity', 0)
      .html(`<div class="infobox${index}">${fleet[data].call}<br>Lat:${fleet[data].lat}-Lng:${fleet[data].long}<br>Alt:${fleet[data].altitude}</div>`)
      .style('opacity', .9)
      .style('left', (d3.event.pageX - 35) + 'px')
      .style('top', (d3.event.pageY - 30) + 'px');

  return infobox;
}

let fleet = {};
let fleetOffChart = {}; 

function getFleet(carrierCode) {
  return axios.get(`/api/${carrierCode}`)
    .then(response => response.data)
    .then(aircraft => {
      for (const plane in aircraft) {
        const pComplete = aircraft[plane].flightPercentComplete;
        if (pComplete && pComplete > 0) {
          fleet[plane] = aircraft[plane];
        } else {
          fleetOffChart[plane] = aircraft[plane];
        }
      }
      console.log('visible fleet:', Object.keys(fleet))
      console.log('invisible fleet:', Object.keys(fleetOffChart))
      return [fleet, fleetOffChart];
    });
}

function getCallsignsFromFleet(fleet) {
  const callsigns = [];
  for (const plane in fleet) {
    callsigns.push(fleet[plane].call);
  }
  return callsigns.sort();
}

function buildVisualization(data) {

  const callsigns = getCallsignsFromFleet(data);

  const graph = 
    d3.select('#app').append('svg')
      .attr('width', dataWidth + margin.left + margin.right)
      .attr('height', dataHeight + margin.top + margin.bottom)
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.right + ')')
      .selectAll('rect')
      .data(callsigns)
      .enter()
      .append('image')
      // NOW APPLYING TO EACH INDIVIDUAL DATA POINT
      .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
      .attr('width', 25)
      .attr('height', 25)
      .attr('x', d => xScale(fleet[d].flightPercentComplete))
      .attr('y', d => yScale(fleet[d].altitude))
      .on('mouseover', function(d, i) {
        console.dir(this);
        console.log(d);
        const infobox = createInfobox(d, i);
        d3.select(this)
          .style('fill', 'red');
      })
      .on('mouseout', function(d, i) {
        d3.selectAll(`.infobox${i}`).html('');
        d3.select(this)
          .style('fill', 'blue');
      })

  const yGuide = 
    d3.select('#app svg').append('g')
      .attr('transform', 'translate(70,0)')
      .call(yAxisTicks);

  const xGuide = 
    d3.select('#app svg').append('g')
      .attr('transform', 'translate(70,'+ dataHeight + ')')
      .call(xAxisTicks);
}

function updateVisualization() {
  getFleet('DAL')
    .then(() => {
      const callsigns = getCallsignsFromFleet(fleet)

      const existingPoints = 
        d3.select('#app svg')
          .selectAll('image')
          .data(callsigns)
      
      existingPoints
        .classed('updated', true)
      .enter().append('image')
        .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
        .attr('width', 20)
        .attr('height', 20)
        .on('mouseover', function(d, i) {
          console.dir(this);
          console.log(d);
          const infobox = createInfobox(d, i);
          d3.select(this)
            .style('fill', 'red');
        })
        .on('mouseout', function(d, i) {
          d3.selectAll(`.infobox${i}`).html('');
          d3.select(this)
            .style('fill', 'blue');
        })
      .merge(existingPoints)
        .transition().duration(500)
        .attrs({
          x: d => xScale(fleet[d].flightPercentComplete),
          y: d => yScale(fleet[d].altitude)
        })

      existingPoints.exit().remove().transition().duration(500);
    });
}

getFleet('DAL')
  .then( () => {
    buildVisualization(fleet);
  });

setInterval(updateVisualization, 5000);

// getFleet('DAL')
//   .then()