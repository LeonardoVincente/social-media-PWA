var defferedPrompt;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function(){
            console.log('Service worker registered!');
        });
}

window.addEventListener('beforeinstallpropmpt', function(){
    console.log("Before install propmt fired");
    event.preventDefault();
    defferedPrompt = event;
    return false;
});