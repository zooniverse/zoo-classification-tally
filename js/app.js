// Enable pusher logging - don't include this in production
// Pusher.logToConsole = true;

var PusherProdKey = '79e8e05ea522377ba6db';
var pusherStagKey = '95781402b5854a712a03';
var pusherDevKey = '95781402b5854a712a03';

var pusher = new Pusher(PusherProdKey);
var panoptesChannel = pusher.subscribe('panoptes');

var projectID = 3434

var Count = 0

// This code runs each time a classification event comes down
// the panoptes pusher pipe

panoptesChannel.bind('classification', function(data) {
   console.log(data);

   var classified_project = data['project_id'];

   var currentCount = document.getElementById('id')

   function logSpecificUser() {
     if (classified_project === String(projectID)) {
       Count = (Count + 1);
       $(document).ready(function() {
         $("#counter").html(Count);
       });
     };
   };
   logSpecificUser();
});
