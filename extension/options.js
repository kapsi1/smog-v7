const serverUrl =  'http://default-environment.e2uzb9ftv3.eu-west-1.elasticbeanstalk.com/', //'http://localhost:8080'
    selectEl = document.querySelector('select')

selectEl.addEventListener('change', event => {
    let stationId = selectEl.options[selectEl.selectedIndex].value
    chrome.storage.local.set({'stationId': stationId})
})

fetch(serverUrl)
    .then(res => res.json())
    .then(stations => {
        stations.forEach(station => {
            let optionEl = document.createElement('option')
            optionEl.value = station.id
            optionEl.textContent = station.name
            selectEl.appendChild(optionEl)
        })
    })