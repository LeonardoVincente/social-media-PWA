var defferedPrompt;

if (!window.Promise) {
    window.Promise = Promise;
}

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