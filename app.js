// Enable pusher logging - don't include this in production
// Pusher.logToConsole = true;

var PusherProdKey = '79e8e05ea522377ba6db';
var pusherStagKey = '95781402b5854a712a03';
var pusherDevKey = '95781402b5854a712a03';

var pusher = new Pusher(PusherProdKey);
var panoptesChannel = pusher.subscribe('panoptes');

// This code runs each time a classification event comes down
// the panoptes pusher pipe

panoptesChannel.bind('classification', function(data) {
   // console.log(data);

   var userID = data['user_id'];

   function logSpecificUser() {
     if (userID == 1804243) {
       console.log(userID);
     }
   }
   logSpecificUser()
});








// userKey: "user:1804243"
// var pusher = new Pusher('51aa9c226f414d8b1a32', {
//   cluster: 'eu',
//   forceTLS: true
// });
//
// var channel = pusher.subscribe('my-channel');
// channel.bind('my-event', function(data) {
//   alert(JSON.stringify(data));
