import * as d3 from 'd3';
import 'd3-transition';
import {
  AIRPLANE_ICON_WIDTH,
  AIRPLANE_ICON_HEIGHT,
  INFOBOX_FADEINOUT_DURATION,
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

  return graph
    .transition()
    .duration(GRAPH_FADEIN_DURATION)
    .style('opacity', 1);
}

function buildGraph() {
  const graph = d3
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

  return graph;
}
