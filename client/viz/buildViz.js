import { select, selectAll, event } from 'd3-selection';
import { zoom } from 'd3-zoom';
import 'd3-transition';
import {
  AIRPLANE_ICON_WIDTH,
  AIRPLANE_ICON_HEIGHT,
  INFOBOX_FADEINOUT_DURATION,
  AIRPLANE_ICON_ENTER_DURATION,
  GRAPH_FADEIN_DURATION
} from '../constants';
import {
  createAltitudeScale,
  createAltitudeAxis,
  createPercentCompleteScale,
  createPercentCompleteAxis,
  createAxisLabel,
  createAltitudeAxisLabel,
  createPercentCompleteAxisLabel
} from './scalesAndAxes';
import { appendInfobox } from './infobox';
import { computeDataHeight, computeDataWidth, margin } from './data';
import { updateCraftCount } from '../menu/selectionButtons';

export const dataHeight = computeDataHeight();
export const dataWidth = computeDataWidth();

export const yScale = createAltitudeScale(dataHeight);
export const yAxis = createAltitudeAxis(yScale);

export const xScale = createPercentCompleteScale(dataWidth);
export const xAxis = createPercentCompleteAxis(xScale);

export default function buildVisualization(fleet) {
  updateCraftCount(fleet);
  const graph = buildGraph();
  addGraphData(graph, fleet, 'aircraft');
  addGraphAxesAndLabels(graph, xAxis, yAxis, dataWidth, dataHeight);

  return graph
    .transition()
    .duration(GRAPH_FADEIN_DURATION)
    .style('opacity', 1);
}

function buildGraph() {
  const graph = select('body')
    .append('div')
    .classed('graph-container', true)
    .append('svg')
    .attr('id', 'app')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`)
    .classed('graph-content-responsive', true)
    .call(
      zoom().on('zoom', function() {
        graph.attr('transform', event.transform);
      })
    )
    .append('g')
    .style('opacity', 0)
    .attr('id', 'graph')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  return graph;
}

export function addGraphData(graph, data, className) {
  let graphData = addGraphDataElements(graph, data, className);
  return positionAndEventHandle(graphData, AIRPLANE_ICON_ENTER_DURATION);
}

export function positionAndEventHandle(graphData, duration) {
  graphData = addMouseoverHandling(graphData);
  graphData = positionGraphElements(graphData, duration);
  return graphData;
}

export function addGraphAxesAndLabels(
  graph,
  xAxis,
  yAxis,
  dataWidth,
  dataHeight
) {
  createAltitudeAxisLabel(createAxisLabel(graph), yAxis, dataHeight);
  createPercentCompleteAxisLabel(
    createAxisLabel(graph),
    xAxis,
    dataHeight,
    dataWidth
  );
}

export function addGraphDataElements(graph, data, className) {
  const dataSel = graph.selectAll('image').data(data);

  enterData(dataSel, className);

  return selectAll(`.${className}`);
}

export function enterData(d3dataSel, className) {
  d3dataSel
    .enter()
    .append('image')
    .attr('class', className)
    .attr('xlink:href', 'images/airplaneSideViewIcon.svg')
    .attr('width', AIRPLANE_ICON_WIDTH)
    .attr('height', AIRPLANE_ICON_HEIGHT);

  return selectAll(`.${className}`);
}

export function positionGraphElements(d3elems, duration) {
  d3elems
    .transition()
    .duration(duration)
    .attr('x', d => xScale(d.flightPercentComplete) - AIRPLANE_ICON_WIDTH / 2)
    .attr('y', d => yScale(d.altitude) - AIRPLANE_ICON_HEIGHT);

  return d3elems;
}

export function addMouseoverHandling(d3elems) {
  d3elems
    .on('click', function(d) {
      window.open(`https://flightaware.com/live/flight/${d.callsign}`);
    })
    .on('mouseover', function(d) {
      addMouseoverAnimation(this, 'airplaneSideViewIconPurple');
      appendInfobox(d);
    })
    .on('mouseout', function(d) {
      addMouseoverAnimation(this, 'airplaneSideViewIcon');
      select(`#infobox_${d.callsign}`).remove();
    });

  return d3elems;
}

export function addMouseoverAnimation(domElem, imageName) {
  select(domElem)
    .transition()
    .duration(INFOBOX_FADEINOUT_DURATION)
    .attr('xlink:href', `images/${imageName}.svg`);

  return select(domElem);
}
