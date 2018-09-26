// Enable pusher logging - don't include this in production
// Pusher.logToConsole = true;

var PusherProdKey = '79e8e05ea522377ba6db';
var pusherStagKey = '95781402b5854a712a03';
var pusherDevKey = '95781402b5854a712a03';

var pusher = new Pusher(PusherProdKey);
var panoptesChannel = pusher.subscribe('panoptes');

var classificationCounts = 0;

// This code runs each time a classification event comes down
// the panoptes pusher pipe

panoptesChannel.bind('classification', function(data) {
   // console.log(data);

   var userID = data['user_id'];

   function logSpecificUser() {
     if (userID == 1804243) {
       classificationCounts++
       console.log(classificationCounts);
     }
   }
   logSpecificUser()
});
