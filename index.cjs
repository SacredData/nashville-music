//🎸 Mates of State @ The Basement East, 8p, $32.87, Info

const fs = require("fs");
var ticketmaster = require("ticketmaster");
function getNextDay(dayName) {
  // The current day
  var date = new Date();
  var now = date.getDay();

  // Days of the week
  var days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  // The index for the day you want
  var day = days.indexOf(dayName.toLowerCase());

  // Find the difference between the current day and the one you want
  // If it's the same day as today (or a negative number), jump to the next week
  var diff = day - now;
  diff = diff < 1 ? 7 + diff : diff;

  // Get the timestamp for the desired day
  var nextDayTimestamp = date.getTime() + 1000 * 60 * 60 * 24 * diff;

  // Get the next day
  return new Date(nextDayTimestamp);
}

const nextMonday = getNextDay("Monday");
const nextTuesday = getNextDay("Tuesday");
const nextWednesday = getNextDay("Wednesday");
const nextThursday = getNextDay("Thursday");
const nextFriday = getNextDay("Friday");
const nextSaturday = getNextDay("Saturday");
const nextSunday = getNextDay("Sunday");
const nextWeekMon = new Date();
const nextWeekTues = new Date();
const nextWeekWed = new Date();
const nextWeekThurs = new Date();
const nextWeekFri = new Date();
const nextWeekSat = new Date();
const nextWeekSun = new Date();
nextWeekMon.setDate(nextMonday.getDate() + 1 * 7);
nextWeekTues.setDate(nextTuesday.getDate() + 1 * 7);
nextWeekWed.setDate(nextWednesday.getDate() + 1 * 7);
nextWeekThurs.setDate(nextThursday.getDate() + 1 * 7);
nextWeekFri.setDate(nextFriday.getDate() + 1 * 7);
nextWeekSat.setDate(nextSaturday.getDate() + 1 * 7);
nextWeekSun.setDate(nextSunday.getDate() + 1 * 7);

//const today = new Date().toLocaleDateString().replaceAll("/", "-");

const keysWeCareAbout = [
  "name",
  "id",
  "url",
  "images",
  "sales", // has date when sales begin
  "dates", // has start/end datetime of event
  "status", // tells you if its on sale or off sale
  "classifications", // genre is provided if available
  "ageRestrictions", // has "legal age enforced" property
  "_embedded", // has venue, artist, and other important info
  "info", // venue provided info
  "pleaseNote", // venue provided updates to event after initial listing
  "priceRanges", // range of prices for tickets
];

const embeddedWeCareAbout = [
  "venues",
  "attractions", // this is where artist info is
];

const venueIds = [];

function parseString(event) {
  const startDate = event.dates.start.localDate;
  const startTime = event.dates.start.localTime;
  const performers = [];
  let genreName = "";
  let genreEmoji = "🎸";
  let performerName = "";
  let venueName;
  const price = [];
  let infoLink;
  if (event.priceRanges) {
    price.push(...event.priceRanges);
  }
  if (event._embedded) {
    const embedded = event._embedded;
    if (Object.keys(embedded).includes("venues")) {
      const { venues } = embedded;
      const venue = venues[0];
      venueName = venue.name;
      const venueId = venue.id;
      venueIds.push(venueId);
    }
    if (Object.keys(embedded).includes("attractions")) {
      performers.push(...embedded.attractions);
    }
  }
  if (performers.length > 0) {
    if (performers.length === 1) {
      performerName += performers[0].name;
    } else {
      performerName += `${performers.shift().name}`;
      performers.forEach((p) => {
        performerName += `, ${p.name}`;
      });
    }
  }

  if (event.classifications) {
    if (event.classifications.length > 0) {
      if (event.classifications[0].genre) {
        if (event.classifications[0].genre !== "Rock") {
          if (event.classifications[0].genre.name === "Country") {
            genreEmoji = "🪕";
          } else if (event.classifications[0].genre.name === "Pop") {
            genreEmoji = "🎙️";
          } else {
            genreEmoji = "🎸";
          }
        }
      }
    }
  }
  const string = `${genreEmoji}${performerName ? performerName : event.name} @ ${venueName}, ${Number(startTime.split(":")[0]) - 12}p, ${price.length > 0 ? "$" + price[0].min : ""}`;
  const infoUrl = ("INFO: ", event.url);
  return { string, infoUrl, event };
}

[nextWeekMon, nextWeekTues, nextWeekWed, nextWeekThurs, nextWeekFri, nextWeekSat].forEach(day => {
	ticketmaster("7CkCoGcODcnxjvrVJZpWGtI6HaEt8PbF")
	  .discovery.v2.event.all({
	    city: "Nashville",
	    startDateTime: `${new Date(day).toJSON().split(".")[0]}Z`,
	    //endDateTime: `${new Date(nextSunday).toJSON().split(".")[0]}Z`,
	    sort: "date,asc",
	    classificationName: "music",
	  })
	  .then(async function (result) {
	    const filteredRes = result.items.map((r) => {
	      const keys = Object.keys(r).reduce(function (obj, k) {
		if (keysWeCareAbout.includes(k)) obj[k] = r[k];
		return obj;
	      }, {});
	      return keys;
	    });
	    console.log(filteredRes);

	    const onsaleOnly = filteredRes.filter(
	      (r) => r.dates.status.code !== "offsale",
	    );
	    console.log(onsaleOnly);

	    const allImportantInfo = onsaleOnly.map((o) => parseString(o));
	    console.log(allImportantInfo);

	    const dayOfWeek = new Date(day).getDay()
	    let dayName
	    switch (dayOfWeek) {
		case 0:
	    	 dayName = 'sunday'
		break
		case 1:
		 dayName = 'monday'
	        break
		case 2:
		dayName = 'tuesday'
		break
		case 3:
		dayName = 'wednesday'
		break
		case 4:
		dayName = 'thursday'
		break
		case 5:
		dayName = 'friday'
		break
		case 6:
		dayName = 'saturday'
		break
		default:
		break
	    }
	    fs.writeFileSync(`./shows/${dayName}.json`, JSON.stringify(allImportantInfo));

	    let theDayString = ''
	    allImportantInfo.forEach((i) => {
	      console.log(i.string);
	      console.log(`[Info](${i.infoUrl})`, "\n");
	      theDayString += `${i.string} [Info](${i.infoUrl})\n\n`
	      fs.writeFileSync(`./shows/${dayName}`, theDayString)
	    });

	    console.log("ALL OF THE VENUE IDS");
	    console.log(venueIds);

	    venueIds.forEach(async (v) => {
	      await getVenue(v);
	    });
	    // "result" is an object of Ticketmaster events information
	  })
	  .catch((err) => console.error(err));
})


async function getVenue(venueId) {
  const res = await fetch(
    `https://app.ticketmaster.com/discovery/v2/venues/${venueId}.json?apikey=7CkCoGcODcnxjvrVJZpWGtI6HaEt8PbF`,
  );
  const j = await res.json();
  fs.writeFileSync(`./venues/${venueId}.json`, JSON.stringify(j));
}
