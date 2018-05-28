import * as d3 from 'd3';
import {
  MAX_ALTITUDE,
  Y_AXIS_TICK_COUNT,
  X_AXIS_TICK_COUNT,
  AXIS_LABEL_FONT_SIZE,
  Y_AXISLABEL_Y_OFFSET,
  Y_AXISLABEL_X_OFFSET,
  X_AXISLABEL_Y_OFFSET
} from '../constants';

export const createAltitudeScale = dataHeight =>
  d3
    .scaleLinear()
    .domain([0, MAX_ALTITUDE])
    .range([dataHeight, 0]);

export const createAltitudeAxis = scale =>
  d3.axisLeft(scale).ticks(Y_AXIS_TICK_COUNT);

export const createPercentCompleteScale = dataWidth =>
  d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, dataWidth]);

export const createPercentCompleteAxis = scale =>
  d3.axisBottom(scale).ticks(X_AXIS_TICK_COUNT);

export const createAxisLabel = graph =>
  graph.append('g').style('font-size', AXIS_LABEL_FONT_SIZE);

export const createAltitudeAxisLabel = (label, axis, dataHeight) =>
  label
    .call(axis)
    .append('text')
    .text('Altitude (ft)')
    .attr('fill', 'black')
    .style('font-weight', 'bold')
    .attr('y', Y_AXISLABEL_Y_OFFSET)
    .attr('transform', `rotate(270 0,${dataHeight / 2})`)
    .attr('x', Y_AXISLABEL_X_OFFSET);

export const createPercentCompleteAxisLabel = (
  label,
  axis,
  dataHeight,
  dataWidth
) =>
  label
    .attr('transform', 'translate(0, ' + dataHeight + ')')
    .call(axis)
    .append('text')
    .text('Percentage of Journey Complete')
    .attr('fill', 'black')
    .style('font-weight', 'bold')
    .attr('x', dataWidth / 2)
    .attr('y', X_AXISLABEL_Y_OFFSET);
