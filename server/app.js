const request = require('request'),
    restify = require('restify'),
    dateFormat = require('dateformat')

// request.debug = true

//get data
let stations

function getConfig() {
    const url = 'http://monitoring.krakow.pios.gov.pl/dane-pomiarowe/wczytaj-konfiguracje',
        formData = {measType: 'Auto'}

    return new Promise((resolve, reject) => {
        request.post(url, {form: formData}, (err, httpResponse, body) => {
            if (err) reject(err)
            try {
                let data = JSON.parse(body)
                if (data.success === true) resolve(data)
                else reject(data)
            } catch (error) {
                reject(error)
            }
        })
    })
}

function getData() {
    const url = 'http://monitoring.krakow.pios.gov.pl/dane-pomiarowe/pobierz',
        formData = {
            query: JSON.stringify({
                measType: 'Auto',
                viewType: 'Parameter',
                dateRange: 'Day',
                date: dateFormat(new Date(), 'dd.mm.yyyy'),
                viewTypeEntityId: 'pm10',
                channels: stations
                    .filter(station => station.channel !== undefined)
                    .map(station => station.channel)
            })
        }
    return new Promise((resolve, reject) => {
        request.post(url, {form: formData}, (err, httpResponse, body) => {
            if (err) reject(err)
            try {
                let data = JSON.parse(body)
                if (data.success === true) resolve(data)
                else reject(data)
            } catch (error) {
                reject(error)
            }
        })
    })
}

function updateData() {
    stations = []
    getConfig()
        .then(configData => {
            configData.config.stations.forEach(stationData => {
                stations[stationData.id] = {
                    name: stationData.name,
                    id: stationData.id
                }
            })
            configData.config.channels.forEach(channelData => {
                if (channelData.param_id === 'pm10') {
                    stations[channelData.station_id].channel = channelData.channel_id
                }
            })

            return getData()
        })
        .then(pollutantData => {
            let channels = stations
                .filter(station => station.channel !== undefined)
                .map(station => station.channel)

            pollutantData.data.series.forEach((series, index) => {
                let stationIndex = stations.findIndex(station => {
                    return station && station.channel === channels[index]
                })
                stations[stationIndex].lastDataPoint = series.data[series.data.length - 1]
            })
        })
        .catch(err => console.error('error:', err))
}

//==========================
//server
const server = restify.createServer()
server.pre((req, res, next) => {
    res.charSet('utf-8')
    next()
})

function clientAddress(req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0]
        || req.connection.remoteAddress;
}

server.get('/', (req, res, next) => {
    console.log(`GET /stations from ${clientAddress(req)}`)
    res.send(stations
        .filter(station => station.channel !== undefined)
        .map(station => {
                return {
                    name: station.name,
                    lastDataPoint: station.lastDataPoint
                }
            }
        )
    )
    next()
})

server.listen(8080, _ => console.log(`Server started, listening at ${server.url}`))
setInterval(updateData, 15 * 60 * 1000)
updateData()