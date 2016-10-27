const MAX_PM10_ALLOWED_VALUE = 50, //µg/m³
    serverUrl = 'https://smogserver.herokuapp.com/' //'http://localhost:8080'

function isToday(inputDate) {
    return new Date(inputDate.getTime()).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)
}

let selectedStationId
chrome.storage.local.get('stationId', obj => {
    if(!obj.stationId) chrome.runtime.openOptionsPage()
    selectedStationId = Number(obj.stationId)
    getData()
})

const valEl = document.querySelector('.value'),
    timeEl = document.querySelector('.time'),
    locationEl = document.querySelector('.location')

function updateValues(value, timestamp, location) {
    let percentVal = Math.round(100 * value / MAX_PM10_ALLOWED_VALUE)
    valEl.textContent = percentVal + '%'
    if (percentVal >= 200) {
        document.body.className = 'red';
    } else if (percentVal >= 100) {
        document.body.className = 'orange';
    } else {
        document.body.className = '';
    }

    let date = new Date(Number(timestamp + '000'))
    timeEl.textContent = date.format(isToday(date) ? 'HH:MM' : 'HH:MM dd.mm.yyyy')

    locationEl.textContent = location
}

function getData() {
    fetch(serverUrl)
        .then(res => res.json())
        .then(stations => {
            let station = stations.find(station => station.id === selectedStationId)
            updateValues(station.lastDataPoint[1], station.lastDataPoint[0], station.name)
        })
}

chrome.storage.onChanged.addListener(changes => {
    selectedStationId = Number(changes.stationId.newValue)
    getData()
});

setInterval(_ => {
    if (selectedStationId !== undefined) getData()
}, 1000 * 60 * 5) //5 minutes