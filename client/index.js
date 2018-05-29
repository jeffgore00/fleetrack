import * as d3 from 'd3';
import 'd3-transition';
import store from './store';
import {
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
import { appendInfobox } from './viz/infobox';
import { fetchFleetDataFromServer } from './data';
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

addFunctionalityToButtons();

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
      appendInfobox(d);
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

export function updateVisualization(carrierCode) {
  fetchFleetDataFromServer(carrierCode).then(([fleet]) => {
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
        appendInfobox(d);
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

fetchFleetDataFromServer(store.getState().currentFleet).then(([fleet]) => {
  buildVisualization(fleet);
});
