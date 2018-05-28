import axios from 'axios';
import * as d3 from 'd3';
import 'd3-transition';
import { numberWithCommas } from './utils';
import {
  DATA_MARGIN_TOP,
  DATA_MARGIN_RIGHT,
  DATA_MARGIN_BOTTOM,
  DATA_MARGIN_LEFT,
  DATA_TO_CONTENT_PROPORTION,
  MAX_ALTITUDE,
  Y_AXIS_TICK_COUNT,
  X_AXIS_TICK_COUNT,
  INFOBOX_X_OFFSET_LEFT,
  INFOBOX_X_OFFSET_RIGHT,
  INFOBOX_Y_OFFSET_TOP,
  INFOBOX_Y_OFFSET_BOTTOM,
  AIRPLANE_ICON_WIDTH,
  AIRPLANE_ICON_HEIGHT,
  INFOBOX_FADEINOUT_DURATION,
  AXIS_LABEL_FONT_SIZE,
  Y_AXISLABEL_Y_OFFSET,
  Y_AXISLABEL_X_OFFSET,
  X_AXISLABEL_Y_OFFSET,
  GRAPH_FADEIN_DURATION,
  AIRPLANE_ICON_ENTER_DURATION,
  AIRPLANE_ICON_EXIT_DURATION,
  AIRPLANE_ICON_UPDATE_DURATION
} from './constants';

let currentFleet = 'DAL';
let graph;

const margin = {
  top: DATA_MARGIN_TOP,
  right: DATA_MARGIN_RIGHT,
  bottom: DATA_MARGIN_BOTTOM,
  left: DATA_MARGIN_LEFT
};
const dataHeight =
  window.innerHeight * DATA_TO_CONTENT_PROPORTION - margin.top - margin.bottom;
const dataWidth =
  window.innerWidth * DATA_TO_CONTENT_PROPORTION - margin.left - margin.right;

const craftCountDisplay = document.getElementById('craftCount');

const selectButtons = document.querySelectorAll('.btn-group input');

selectButtons.forEach(elem => {
  elem.addEventListener('click', function fleetSelect(event) {
    document
      .querySelector('.btn.btn-secondary.active')
      .setAttribute('checked', '');
    document
      .querySelector('.btn.btn-secondary.active')
      .classList.remove('active');
    this.parentElement.classList.add('active');
    this.setAttribute('checked', 'checked');
    currentFleet = this.id;
    updateVisualization();
  });
});

const yScale = d3
  .scaleLinear()
  .domain([0, MAX_ALTITUDE])
  .range([dataHeight, 0]);

const yAxis = d3.axisLeft(yScale).ticks(Y_AXIS_TICK_COUNT);

const xScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([0, dataWidth]);

const xAxis = d3.axisBottom(xScale).ticks(X_AXIS_TICK_COUNT);

const createInfobox = data => {
  const infobox = d3
    .select('body')
    .append('div')
    .attr('class', 'infobox')
    .attr('id', `infobox_${data.callsign}`)
    .style('left', function() {
      if (window.innerWidth - d3.event.pageX < 200) {
        return d3.event.pageX + INFOBOX_X_OFFSET_LEFT + 'px';
      } else {
        return d3.event.pageX + INFOBOX_X_OFFSET_RIGHT + 'px';
      }
    })
    .style('top', function() {
      if (window.innerHeight - d3.event.pageY < 200) {
        return d3.event.pageY + INFOBOX_Y_OFFSET_TOP + 'px';
      } else {
        return d3.event.pageY + INFOBOX_Y_OFFSET_BOTTOM + 'px';
      }
    }).html(`
        <table>
          <tr class="infoHeader">
            <th colspan="2">${data.callsign} (${data.aircraftType})</th>
          </tr>
          <tr>
            <th>Departure:</th>
            <td>${data.airportFrom.city} (${data.airportFrom.code})</th>
          </tr>
          <tr>
            <th>Arrival:</td>
            <td>${data.airportTo.city} (${data.airportTo.code}) ${
  data.airportStops && data.airportStops.length
    ? '(stopping in ' +
        data.airportStops.map(stop => stop.code).join(', ') +
        ')'
    : ''
} </td> 
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
  return axios
    .get(`/api/${carrierCode}`)
    .then(response => response.data)
    .then(aircraft => {
      for (const plane in aircraft) {
        const pComplete = aircraft[plane].flightPercentComplete;
        if (
          aircraft[plane].altitude &&
          !aircraft[plane].grounded &&
          pComplete &&
          pComplete > 0
        ) {
          fleet.push(aircraft[plane]);
        } else {
          fleetOffChart.push(aircraft[plane]);
        }
      }
      return [fleet, fleetOffChart];
    });
}

function buildVisualization(fleet) {
  craftCountDisplay.innerHTML = `${fleet.length ? fleet.length : 0} aircraft`;

  graph = d3
    .select('body')
    .append('div')
    .classed('graph-container', true)
    .append('svg')
    .attr('id', 'app')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`)
    .classed('graph-content-responsive', true)
    .call(
      d3.zoom().on('zoom', function() {
        graph.attr('transform', d3.event.transform);
      })
    )
    .append('g')
    .style('opacity', 0)
    .attr('id', 'graph')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  graph
    .selectAll('image')
    .data(fleet)
    .enter()
    .append('image') // all below pertains to each data-bound <image>
    .attr('class', 'aircraft')
    .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
    .attr('width', AIRPLANE_ICON_WIDTH)
    .attr('height', AIRPLANE_ICON_HEIGHT)
    .attr('background', 'blue')
    .attr('x', d => xScale(d.flightPercentComplete) - AIRPLANE_ICON_WIDTH / 2)
    .attr('y', d => yScale(d.altitude) - AIRPLANE_ICON_HEIGHT)
    .on('mouseover', function(d) {
      d3
        .select(this)
        .transition()
        .duration(INFOBOX_FADEINOUT_DURATION)
        .attr('xlink:href', 'images/airplaneSideViewIconPurple.svg');
      createInfobox(d);
    })
    .on('mouseout', function(d) {
      d3.select(`#infobox_${d.callsign}`).remove();
      d3
        .select(this)
        .transition()
        .duration(INFOBOX_FADEINOUT_DURATION)
        .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
        .style('fill', 'blue');
    });

  const yGuide = graph
    .append('g')
    .style('font-size', AXIS_LABEL_FONT_SIZE)
    .call(yAxis)
    .append('text')
    .text('Altitude (ft)')
    .attr('fill', 'black')
    .style('font-weight', 'bold')
    .attr('y', Y_AXISLABEL_Y_OFFSET)
    .attr('transform', `rotate(270 0,${dataHeight / 2})`)
    .attr('x', Y_AXISLABEL_X_OFFSET);

  const xGuide = graph
    .append('g')
    .style('font-size', AXIS_LABEL_FONT_SIZE)
    .attr('transform', 'translate(0, ' + dataHeight + ')')
    .call(xAxis)
    .append('text')
    .text('Percentage of Journey Complete')
    .attr('fill', 'black')
    .style('font-weight', 'bold')
    .attr('x', dataWidth / 2)
    .attr('y', X_AXISLABEL_Y_OFFSET);

  graph
    .transition()
    .duration(GRAPH_FADEIN_DURATION)
    .style('opacity', 1);
}

function updateVisualization() {
  getFleet(currentFleet).then(([fleet]) => {
    craftCountDisplay.innerHTML = `${
      fleet.length ? fleet.length : 0
    }  aircraft`;

    // JOIN new data with old elements.
    const graphData = graph.selectAll('image').data(fleet, function(d) {
      return d.callsign;
    });

    // EXIT old elements not present in new data.
    graphData
      .exit()
      .classed('exiting', true)
      .transition()
      .duration(AIRPLANE_ICON_EXIT_DURATION)
      .style('opacity', 0)
      .remove();

    // UPDATE old elements present in new data.
    graphData
      .classed('updated', true)
      .transition()
      .duration(AIRPLANE_ICON_UPDATE_DURATION)
      .attr('x', d => xScale(d.flightPercentComplete) - AIRPLANE_ICON_WIDTH / 2)
      .attr('y', d => yScale(d.altitude) - AIRPLANE_ICON_HEIGHT);

    // ENTER new elements present in new data.
    graphData
      .enter()
      .append('image')
      .attr('class', 'aircraft')
      .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
      .attr('width', AIRPLANE_ICON_WIDTH)
      .attr('height', AIRPLANE_ICON_HEIGHT)
      .on('mouseover', function(d) {
        createInfobox(d);
        d3
          .select(this)
          .attr('xlink:href', 'images/airplaneSideViewIconPurple.svg');
      })
      .on('mouseout', function(d) {
        d3.select(`#infobox_${d.callsign}`).remove();
        d3.select(this).attr('xlink:href', 'images/airplaneSideViewIcon.svg');
      })
      .transition()
      .duration(AIRPLANE_ICON_ENTER_DURATION)
      .attr('x', d => xScale(d.flightPercentComplete) - AIRPLANE_ICON_WIDTH / 2)
      .attr('y', d => yScale(d.altitude) - AIRPLANE_ICON_HEIGHT);
  });
}

getFleet('DAL').then(([fleet]) => {
  buildVisualization(fleet);
});

setInterval(updateVisualization, 5000);
