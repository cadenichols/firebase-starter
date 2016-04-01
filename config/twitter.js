'use strict';

var Twitter = require('twitter');
var Firebase = require('firebase');
var moment = require('moment');

var ref = new Firebase('https://cades-cool-app.firebaseio.com/');
var tweetsRef = ref.child('tweets');


ref.createUser({
  email: '',
  password: ''
}, function(err, userData) {

});


// var client = new Twitter({
//   consumer_key: process.env.TWITTER_API_KEY,
//   consumer_secret: process.env.TWITTER_API_SECRET,
//   access_token_key: process.env.TWITTER_ACCESS_TOKEN,
//   access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
// });

// var count = 0;

// setInterval(function() {
//   var tweetObj = {
//     screen_name: 'moment.js',
//     text: moment().format('h:mm:ss a')
//   };

//   // tweetsRef.push(tweetObj);

//   var newTweetRef = tweetsRef.push();
//   newTweetRef.set(tweetObj);

// }, 1000);



// client.stream('statuses/filter', {track: 'flash'}, function(stream) {
//   stream.on('data', function(tweet) {
//     console.log(count++, tweet.user.screen_name, tweet.text);

//     var tweetObj = {
//       screen_name: tweet.user.screen_name,
//       text: tweet.text
//     };
//     tweetsRef.push(tweetObj);
//   });
 
//   stream.on('error', function(error) {
//     console.log(error);
//   });
// });

