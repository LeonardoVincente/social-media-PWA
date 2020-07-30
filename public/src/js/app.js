var defferedPrompt;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function () {
            console.log('Service worker registered!');
        })
        .catch(function (err) {
            console.log("Error in service worked")
        });
}

window.addEventListener('beforeinstallpropmpt', function () {
    console.log("Before install propmt fired");
    event.preventDefault();
    defferedPrompt = event;
    return false;
});

var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://httpbin.org/ip');
xhr.responseType = 'json';
xhr.onload = function () {
    console.log('response', xhr.response);
}

xhr.onerror = function () {
    console.log('error');
}

xhr.send();

fetch('https://httpbin.org/post', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    mode: 'cors', // no-cors
    body: JSON.stringify({
        message: 'Does this work?'
    })
})
    .then(function (response) {
        console.log(response);
        return response.json();
    })
    .then(function (data) {
        console.log(data);
    })
    .catch(err => {
        console.llg(err);
    })