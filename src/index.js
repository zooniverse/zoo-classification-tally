import _ from 'lodash';
// Enable pusher logging - don't include this in production
// Pusher.logToConsole = true;

var PusherProdKey = '79e8e05ea522377ba6db';
var pusherStagKey = '95781402b5854a712a03';
var pusherDevKey = '95781402b5854a712a03';

var pusher = new Pusher(PusherProdKey);
var panoptesChannel = pusher.subscribe('panoptes');

var projectID = 3434;
// var projectID = 4996 ss

var Count = 0

// $.ajax({
//   url: 'http://stats.zooniverse.org/counts/classification/day?project_id=4846&user_id=6&workflow_id=4441',
//   type: 'GET',
//   success: function(responseText){
//     var jsonData = JSON.stringify(responseText);
//     console.log(jsonData);
//   }
// })

$.getJSON("http://stats.zooniverse.org/counts/classification/year?env=production&project_id=3434", function(data) {
    // var obj = JSON.parse(data);
    console.log(data.events_over_time.buckets[0].doc_count);
});

// // Look up current tally
// (function() {
//   var panoptesAPI = "http://stats.zooniverse.org/counts/classification/year?";
//   $.getJSON( panoptesAPI, {
//     project_id: "4846",
//     user_id: "6",
//   })
//   .done(function ( response ) {
//     console.log(response);
//   });
// });





$(document).ready(function() {
  $("#counter").html('x');
});

// This code runs each time a classification event comes down
// the panoptes pusher pipe

panoptesChannel.bind('classification', function(data) {
   // console.log(data);

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
