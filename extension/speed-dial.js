function isToday(inputDate) {
    return new Date(inputDate.getTime()).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)
}

const MAX_PM10_ALLOWED_VALUE = 50, //µg/m³
    valEl = document.querySelector('.value'),
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

    let date = new Date(timestamp)
    timeEl.textContent = date.format(isToday(date) ? 'HH:MM' : 'HH:MM dd.mm.yyyy')

    locationEl.textContent = location
}

