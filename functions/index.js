const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const webpush = require('web-push');


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//


const serviceAccount = require('./firebaseKey.json');
const firebaseSecrets = require('./firebaseSecret.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseSecrets.firebaseDBurl
});


exports.storePostData = functions.https.onRequest(function (request, response) {
  cors(request, response, function () {
    var bodyData = JSON.parse(request.body);
    admin.database().ref('posts').push({
      id: bodyData.id,
      title: bodyData.title,
      location: bodyData.location,
      image: bodyData.image
    })
      .then(function () {
        webpush.setVapidDetails(
          'mailto:leo@leo.com',
          firebaseSecrets.publicKey,
          firebaseSecrets.privateKey
          );
        return admin.database().ref('subscriptions').once('value');
      })
      .then(function(subscriptions){
        subscriptions.forEach((sub)=>{
          var pushConfig = {
            endpoint: sub.val().endpoint,
            keys: {
              auth: sub.val().keys.auth,
              p256dh: sub.val().keys.p256dh
            }
          };
          webpush.sendNotification(pushConfig, JSON.stringify({title: 'new post', content: 'new Post added!'}))
            .catch((err)=>{
              console.log(err);
            });
        })
        response.status(201).json({ message: 'Data stored', id: bodyData.id });
      })
      .catch(function (err) {
        response.status(500).json({ error: err });
      });
  });
});
