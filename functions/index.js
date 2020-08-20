const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//


const serviceAccount = require('./firebaseKey.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: ''
});


exports.storePostData = functions.https.onRequest(function(request, response) {
    cors(request, response, function() {
      functions.logger.log("Hello from info. Here's an object:", request.body.id);
      var bodyData = JSON.parse(request.body);
      admin.database().ref('posts').push({
        id: bodyData.id || 'empty' ,
        title: bodyData.title || 'emptu',
        location: bodyData.location || 'sad',
        image: bodyData.image || 'acs'
      
      })
        .then(function() {
          response.status(201).json({message: 'Data stored', id: bodyData.id});
        })
        .catch(function(err) {
          response.status(500).json({error: err});
        });
    });
   });
