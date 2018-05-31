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
