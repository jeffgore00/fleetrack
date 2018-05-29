import axios from 'axios';
import * as d3 from 'd3';
import 'd3-transition';
import store from './store';
import { numberWithCommas } from './utils';
import {
  INFOBOX_X_OFFSET_LEFT,
  INFOBOX_X_OFFSET_RIGHT,
  INFOBOX_Y_OFFSET_TOP,
  INFOBOX_Y_OFFSET_BOTTOM,
  AIRPLANE_ICON_WIDTH,
  AIRPLANE_ICON_HEIGHT,
  INFOBOX_FADEINOUT_DURATION,
  GRAPH_FADEIN_DURATION,
  AIRPLANE_ICON_ENTER_DURATION,
  AIRPLANE_ICON_EXIT_DURATION,
  AIRPLANE_ICON_UPDATE_DURATION
} from './constants';
import {
  createAltitudeScale,
  createAltitudeAxis,
  createPercentCompleteScale,
  createPercentCompleteAxis,
  createAxisLabel,
  createAltitudeAxisLabel,
  createPercentCompleteAxisLabel
} from './viz/scalesAndAxes';
import { computeDataHeight, computeDataWidth, margin } from './viz/data';
import {
  craftCountDisplay,
  addFunctionalityToButtons
} from './menu/selectionButtons';

let graph;

// store.subscribe(() => console.log(store.getState()))

const dataHeight = computeDataHeight();
const dataWidth = computeDataWidth();

const yScale = createAltitudeScale(dataHeight);
const yAxis = createAltitudeAxis(yScale);

const xScale = createPercentCompleteScale(dataWidth);
const xAxis = createPercentCompleteAxis(xScale);

addFunctionalityToButtons(updateVisualization);

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

export function getFleet(carrierCode) {
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

  createAltitudeAxisLabel(createAxisLabel(graph), yAxis, dataHeight);
  createPercentCompleteAxisLabel(
    createAxisLabel(graph),
    xAxis,
    dataHeight,
    dataWidth
  );

  graph
    .transition()
    .duration(GRAPH_FADEIN_DURATION)
    .style('opacity', 1);
}

export function updateVisualization(callsign) {
  getFleet(callsign).then(([fleet]) => {
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

getFleet(store.getState().currentFleet).then(([fleet]) => {
  buildVisualization(fleet);
});
