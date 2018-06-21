import * as d3 from 'd3';
import 'd3-transition';
import {
  AIRPLANE_ICON_ENTER_DURATION,
  AIRPLANE_ICON_EXIT_DURATION,
  AIRPLANE_ICON_UPDATE_DURATION
} from '../constants';
import { updateCraftCount } from '../menu/selectionButtons';
import {
  positionAndEventHandle,
  positionGraphElements,
  enterData
} from './buildViz';

export default function updateVisualization(fleet) {
  updateCraftCount(fleet);

  const graph = d3.select('#graph');

  // This order of operations is important!
  // See https://bl.ocks.org/mbostock/3808218

  // JOIN new data with old elements.
  const graphData = graph.selectAll('image').data(fleet, function(d) {
    return d.callsign;
  });

  // UPDATE old elements present in new data.
  positionGraphElements(graphData, AIRPLANE_ICON_UPDATE_DURATION);

  // ENTER new elements present in new data.
  positionAndEventHandle(
    enterData(graphData, 'aircraft'),
    AIRPLANE_ICON_ENTER_DURATION
  );

  // EXIT old elements not present in new data.
  graphData
    .exit()
    .transition()
    .duration(AIRPLANE_ICON_EXIT_DURATION)
    .style('opacity', 0)
    .remove();

  return graphData;
}
