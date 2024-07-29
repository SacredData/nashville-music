//🎸 Mates of State @ The Basement East, 8p, $32.87, Info

const fs = require('fs')
var ticketmaster = require('ticketmaster');

const keysWeCareAbout = [
	'name',
	'id',
	'url',
	'images',
	'sales', // has date when sales begin
	'dates', // has start/end datetime of event
	'status', // tells you if its on sale or off sale
	'classifications', // genre is provided if available
	'ageRestrictions', // has "legal age enforced" property
	'_embedded', // has venue, artist, and other important info
	'info', // venue provided info
	'pleaseNote', // venue provided updates to event after initial listing
	'priceRanges', // range of prices for tickets
]

const embeddedWeCareAbout = [
	'venues',
	'attractions', // this is where artist info is
]

function parseString(event) {
	const startDate = event.dates.start.localDate
	const startTime = event.dates.start.localTime
	const performers = []
	let genreName = ''
	let genreEmoji = '🎸'
	let performerName = ''
	let venueName
	const price = []
	let infoLink
	if (event.priceRanges) {
		price.push(...event.priceRanges)
	}
	if (event._embedded) {
		const embedded = event._embedded
		if (Object.keys(embedded).includes('venues')) {
			const { venues } = embedded
			const venue = venues[0]
			venueName = venue.name
		}
		if (Object.keys(embedded).includes('attractions')) {
			performers.push(...embedded.attractions)
		}
	}
	if (performers.length > 0) {
		if (performers.length === 1) {
			performerName += performers[0].name
		} else {
			performerName += `${performers.shift().name}`
			performers.forEach(p => {
				performerName += `, ${p.name}`
			})
		}
	}

	if (event.classifications) {
		if (event.classifications.length > 0) {
			if (event.classifications[0].genre) {
				if (event.classifications[0].genre !== 'Rock') {
					if (event.classifications[0].genre.name === 'Country') {
						genreEmoji = '🪕'
					} else if (event.classifications[0].genre.name === 'Pop') {
						genreEmoji = '🎙️'
					} else {
						genreEmoji = '🎸'
					}
				}
			}
		}
	}
	const string = `${genreEmoji}${performerName ? performerName : event.name} @ ${venueName}, ${Number(startTime.split(':')[0])-12}p, ${price.length > 0 ? '$'+price[0].min : ''}`
	const infoUrl = ('INFO: ', event.url)
	return { string, infoUrl, event }
}

ticketmaster('7CkCoGcODcnxjvrVJZpWGtI6HaEt8PbF').discovery.v2.event.all({
	/*postalCode:37201,
	radius: 50,
	unit: 'miles',*/
	city: 'Nashville',
	startDateTime: `${new Date('07/28/2024').toJSON().split('.')[0]}Z`,
	endDateTime: `${new Date('08/02/2024').toJSON().split('.')[0]}Z`,
	sort: 'date,asc',
	classificationName: 'music',
})
.then(function(result) {
		const filteredRes = result.items.map(r => {
			const keys = Object.keys(r).reduce(function(obj, k) {
				if (keysWeCareAbout.includes(k)) obj[k] = r[k];
				return obj;
			}, {})
			return keys
		})
		console.log(filteredRes)

		const onsaleOnly = filteredRes.filter(r => r.dates.status.code !== 'offsale')
		console.log(onsaleOnly)


		const allImportantInfo = onsaleOnly.map(o => parseString(o))
		console.log(allImportantInfo)

		fs.writeFileSync('ticketmaster.json', JSON.stringify(allImportantInfo))
  // "result" is an object of Ticketmaster events information
}).catch(err => console.error(err));
