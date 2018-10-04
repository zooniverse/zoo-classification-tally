import _ from 'lodash';
// Enable pusher logging - don't include this in production
// Pusher.logToConsole = true;

var PusherProdKey = '79e8e05ea522377ba6db';
var pusherStagKey = '95781402b5854a712a03';
var pusherDevKey = '95781402b5854a712a03';

var pusher = new Pusher(PusherProdKey);
var panoptesChannel = pusher.subscribe('panoptes');

// console.log(window.location.search);

var projectID = 4996;
var userID = 1804243;

window.appData = {  //Declare a global variable. Not really a great idea, but hey.
  userCount: 0
};

// Get the current count values and start count
var userQueryURL = "http://stats.zooniverse.org/counts/classification/year?project_id=4996&user_id=1804243";
var projectQueryURL = "http://stats.zooniverse.org/counts/classification/year?project_id=4996&user_id=1804243";

setStartCount(userQueryURL, "#counter");

function setStartCount(userQueryURL, container) {
  $.getJSON(userQueryURL, function(data) {
    var totalClassifications = 0;
    var statData = data.events_over_time.buckets;
    for (var i in statData) {
      totalClassifications = totalClassifications + parseInt(statData[i].doc_count);
    };
    window.appData.userCount = totalClassifications;
    console.log(totalClassifications);
    $(document).ready(function() {
      $(container).html(totalClassifications)
    });

    listenForClassifications();
  });
};

function listenForClassifications() {
  // This code runs each time a classification event comes down
  // the panoptes pusher pipe
  panoptesChannel.bind('classification', function(data) {
     // console.log(data);
     var pusherProject = data['project_id'];
     var pusherUser = data['user_id'];

     function updateCount() {
       if (pusherProject === String(projectID) && pusherUser === String(userID)) {
         window.appData.userCount++;
         $(document).ready(function() {
           $("#counter").html(window.appData.userCount);
         });
       };
     };
     updateCount();
  });
}




//
// step1_initialiseAppAndFetchStartingNumber('http://stats.zooniverse.org/counts/classification/year?project_id=4996&user_id=1804243', "#counter");
//
//
//
// var currentCount = document.getElementById("counter");
// console.log(currentCount);
//
//
//
//
// function step1_initialiseAppAndFetchStartingNumber(url, container) {
//   $.getJSON(url, function(data) {
//     var total_classifications = 0;
//     var stats_data = data.events_over_time.buckets;
//     for (var i in stats_data) {
//       total_classifications = total_classifications + parseInt(stats_data[i].doc_count);
//     };
//     window.appData.count = total_classifications;
//     $(document).ready(function(){
//       $("#counter").html(total_classifications)
//     });
//
//     step2_listenForFurtherAdditions();
//   });
// };
//
// function step2_listenForFurtherAdditions() {
//   panoptesChannel.bind('classification', function(data) {
//      // console.log(data);
//
//      var classified_project = data['project_id'];
//
//      function logSpecificUser() {
//        if (classified_project === String(projectID)) {
//          window.appData.count++;
//          $(document).ready(function() {
//            $("#counter").html(window.appData.count);
//          });
//        };
//      };
//      logSpecificUser();
//   });
// }
//


//
// // This code runs each time a classification event comes down
// // the panoptes pusher pipe
// var currentCount = document.getElementById('counter');
// console.log(currentCount);
// panoptesChannel.bind('classification', function(data) {
//    // console.log(data);
//
//    var classified_project = data['project_id'];
//
//    function logSpecificUser() {
//      if (classified_project === String(projectID)) {
//        Count = (Count + 1);
//        $(document).ready(function() {
//          $("#counter").html(Count);
//        });
//      };
//    };
//    logSpecificUser();
// });
