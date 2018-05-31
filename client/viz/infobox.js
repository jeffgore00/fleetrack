import * as d3 from 'd3';
import {
  INFOBOX_X_OFFSET_LEFT,
  INFOBOX_X_OFFSET_RIGHT,
  INFOBOX_Y_OFFSET_TOP,
  INFOBOX_Y_OFFSET_BOTTOM
} from '../constants';
import { numberWithCommas } from '../utils';

export function appendInfobox(data) {
  const infobox = d3
    .select('body')
    .append('div')
    .attr('class', 'infobox')
    .attr('id', `infobox_${data.callsign}`)
    .style('left', setInfoboxXPosition())
    .style('top', setInfoboxYPosition())
    .html(buildInfobox(data));

  return infobox;
}

function buildInfobox(data) {
  return `
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
  `;
}

function setInfoboxXPosition() {
  if (window.innerWidth - d3.event.pageX < 200) {
    return d3.event.pageX + INFOBOX_X_OFFSET_LEFT + 'px';
  } else {
    return d3.event.pageX + INFOBOX_X_OFFSET_RIGHT + 'px';
  }
}

function setInfoboxYPosition() {
  if (window.innerHeight - d3.event.pageY < 200) {
    return d3.event.pageY + INFOBOX_Y_OFFSET_TOP + 'px';
  } else {
    return d3.event.pageY + INFOBOX_Y_OFFSET_BOTTOM + 'px';
  }
}
