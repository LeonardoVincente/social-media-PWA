var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  let deferredPrompt;
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(function (registrations) {
        for (var i = 0; i < registrations.length; i++) {
          registrations[i].unregister();
        }
      })
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function onSavedButtonClicked(event) {
  console.log('click');
  if ('caches' in window) {
    caches.open('user-requested')
      .then(function (cache) {
        cache.add('https://httpbin.org/get')
        cache.add('/src/images/sf-boat.jpg')
      })
  }

}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'black';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent="save";
  // cardSaveButton.addEventListener('click', onSavedButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}


function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

var url = FIREBASE_URL_BASE + '/posts.json';
var networkDataReceived = false;

fetch(url)
  .then(function (res) {
    console.log("Calling fetch")
    return res.json();
  })
  .then(function (data) {
    console.log("From web 2")
    networkDataReceived = true;
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  })
  .catch(error => {
    console.log('[Fedd JS] feeching failed ', error);
  });


if ('indexedDB' in window) {
  readAllData('posts')
    .then(function (data) {
      if (!networkDataReceived) {
        console.log("FROM CACHE ", data);
        updateUI(data);
      }
    })
}
