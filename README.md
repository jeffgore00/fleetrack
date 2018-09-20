# Fleetrack

Fleetrack is a visualization of real-time flight data for a handful of major carriers (i.e. fleet tracking) on an scalable vector altitude/distance graph using the D3.js visualization library.

The app is deployed at [http://fleetrack2018.herokuapp.com/](http://fleetrack2018.herokuapp.com/).
_Note: due to the "sleeping dyno" associated with free Heroku accounts, the site may take a long time to load when you first access it._

![Fleetrack Screenshot](http://drive.google.com/uc?export=view&id=19HzDKOHH4132ADDWYBZv0Ydcx8a5qKfO)
The app queries the [Virtual Radar Server](http://www.virtualradarserver.co.uk/Documentation/Formats/AircraftList.aspx) every five seconds for the location data of the currently active fleet of the airline selected in the navbar. Delta is selected by default. (I included the Area 51 airline [Janet](<https://en.wikipedia.org/wiki/Janet_(airline)>) for fun - you will likely never see any data for this airline, but if you do, let me know!)

**This is not meant to be authoritative resource on live flight carrier information.\*** This is chiefly an experiment in using D3 to visualize real-time data.

I originally created this app within the bounds of the [Fullstack Academy](https://www.fullstackacademy.com/) "Stackathon", which allowed a total of four days for students to make a personal project and [demonstrate it to the cohort](https://www.youtube.com/watch?v=6tHKfI9sdD4). Since then, I have revisited the code to do some significant refactoring and modularizing, but the features have remained the same.

From a technical perspective, this app is pretty lean. Besides using D3-rendered SVG for the graph, I use Redux for state management and `redux-thunk` for making server calls. My Express server uses `request` to make API calls to the Virtual Radar Server, and grooms the response JSON - as well as a list of the world's airports - so that each aircraft icon is bound to data that looks something like the following:

```js
{
  ageInYears: 26
  aircraftType: "B763"
  airportFrom: {
    code: "PHNL",
    lat: 21.3358,
    long: -157.919,
    name: "Honolulu International Airport",
    city: "Honolulu",
    state: "Hawaii"
  },
  airportStops: [
    /* array of airport objects like the one above */
  ],
  airportTo: /* airport object */
  altitude: 35000,
  callsign: "DAL2768",
  flightPercentComplete: 42.24810449262908,
  grounded: false,
  heading: 67.5,
  lat: 35.742017,
  long: -126.065836,
  speed: 523.7
}
```

When a plane icon zooms from the top left corner of the graph to a position, that means that in the most recent API call, data for a new aircraft was fetched. When data is lost for an aircraft, it simply fades away.

Speaking of animations, the true "cool factor" of this app (in my opinion) is using the D3 zoom functionality to get really close to a cluster of planes and note how they are moving incrementally, since their `x` and `y` position is bound to the data that is being updated constantly. I demonstrate this in the video link provided above.

\* _There are several reasons why this should not be regarded as an authoritative data source_:

- _I'm sure there are more complete and consistent sources of data out there, such as the paid FlightAware API. The Virtual Radar Server is a free resource which does not require an API key._
- _The "Percent of Journey Complete" x-axis is a rough calculation that does not take into account an aircraft's planned flight path, which is not a perfectly straight line from point A to point B. I do not have access to flight plan data. Because of runway positioning and the possibility of takeoff in a direction opposite that of the destination, an airplane can be temporarily further from its destination in midair than it was before takeoff. Therefore I have conveniently omitted any aircraft for which that calculation results in a value less than 0 percent or greater than 100 percent._
