import axios from 'axios';
import * as d3 from 'd3';
import 'd3-transition';

let currentFleet = 'DAL';
let graph;
const margin = { top: 50, right: 20, bottom: 30, left: 90 };
const dataHeight = window.innerHeight * 0.9 - margin.top - margin.bottom;
const dataWidth = window.innerWidth * 0.9 - margin.left - margin.right;

/* Code courtesy of https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript */
const numberWithCommas = num => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
/* */

const selectButtons = document.querySelectorAll('.btn-group input');

selectButtons.forEach(elem => {
  elem.addEventListener('click', function fleetSelect(event) {
    document.querySelector('.btn.btn-secondary.active').setAttribute('checked', '');
    document.querySelector('.btn.btn-secondary.active').classList.remove('active');
    this.parentElement.classList.add('active');
    this.setAttribute('checked', 'checked');
    currentFleet = this.id;
    updateVisualization();
  });
});



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
      .style('left', function () {
        if (window.innerWidth - d3.event.pageX < 200) {
          return (d3.event.pageX - 175) + 'px';
        } else {
          return (d3.event.pageX + 10) + 'px';
        }
      })
      .style('top', function () {
        if (window.innerHeight - d3.event.pageY < 200) {
          return (d3.event.pageY - 175) + 'px';
        } else {
          return (d3.event.pageY - 20) + 'px';
        }
      })
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
            <td>${data.lat}, ${data.long}</td>
          </tr>
          <tr>
            <th>Altitude:</th>
            <td>${numberWithCommas(data.altitude)} ft</td>
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
      .append('div')
      .classed('svg-container', true)
      .append('svg')
      .attr('id', 'app')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`)
      .classed('graph-content-responsive', true)
      .call(d3.zoom().on('zoom', function () {
        graph.attr('transform', d3.event.transform);
      }))
    .append('g')
      .attr('id', 'graph')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')');

  graph
    .selectAll('image')
    .data(fleet)
    .enter()
    .append('image') // all below pertains to each data-bound <image>
    .attr('class', 'aircraft')
    .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
    .attr('width', 25)
    .attr('height', 15)
    .attr('background', 'blue')
    .attr('x', d => xScale(d.flightPercentComplete) - 12.5)
    .attr('y', d => yScale(d.altitude) - 15)
    .on('mouseover', function(d) {
      d3.select(this)
        .transition().duration(500)
        .attr('xlink:href', 'images/airplaneSideViewIconPurple.svg');
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
    .style('font-size', '0.75em')
    .call(yAxis)
    .append('text')
    .text('Altitude (ft)')
    .attr('fill', 'black')
    .style('font-weight', 'bold')
    .attr('y', 200)
    .attr('transform', `rotate(270 0,${dataHeight/2})`)
    .attr('x', 50);

  const xGuide = graph.append('g')
    .style('font-size', '0.75em')
    .attr('transform', 'translate(0, '+ dataHeight +')')
    .call(xAxis)
    .append('text')
    .text('Percentage of Journey Complete')
    .attr('fill', 'black')
    .style('font-weight', 'bold')
    .attr('x', dataWidth/2)
    .attr('y', 50);
}

function updateVisualization() {
  getFleet(currentFleet)
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
          .style('opacity', 0)
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
          createInfobox(d);
          d3.select(this)
            .attr('xlink:href', 'images/airplaneSideViewIconPurple.svg');
        })
        .on('mouseout', function(d) {
          d3.select(`#infobox_${d.callsign}`).remove();
          d3.select(this)
            .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
        })
        .transition()
          .duration(2000)
          .attr('x', d => xScale(d.flightPercentComplete) - 12.5)
          .attr('y', d => yScale(d.altitude) - 15)
    });
}

getFleet('DAL')
  .then( ([fleet]) => {
    buildVisualization(fleet);
  });

setInterval(updateVisualization, 5000);