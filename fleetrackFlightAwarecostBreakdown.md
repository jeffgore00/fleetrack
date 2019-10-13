Here's the query I'm running:

https://flightxml.flightaware.com/json/FlightXML2/SearchBirdseyeInFlight?query={match ident DAL\*} {true inAir}&howMany=500

The `SearchBirdseyeInFlight` query is a Class 1 query, at \$0.012 per query. But it's not really per query, it's per 15 records. So let's call this a billing query.

Therefore with an average fleet size of 375 aircraft, that's 25 billing queries (375/15 = 25) per actual call to my own API route i.e. 'api/DAL', which I'll call a 'fleet query'.

How many fleet queries can I make and still stay under \$5/month (I'm told that I won't be billed if I stay under that amount)?

$4.99 divided by the Class 1 rate,$0.012, is 415 rounded down.

415 billing queries divided by an average of 25 billing queries per fleet is 16.6 fleet queries per MONTH. Pretty meager!
