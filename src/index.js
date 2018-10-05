import _ from "lodash";

var PusherProdKey = "79e8e05ea522377ba6db";
var pusherStagKey = "95781402b5854a712a03";
var pusherDevKey = "95781402b5854a712a03";

var pusher = new Pusher(PusherProdKey);
var panoptesChannel = pusher.subscribe("panoptes");
// Enable pusher logging - don't include this in production
// Pusher.logToConsole = true;

var urlParams = new URLSearchParams(window.location.search);
var projectID = urlParams.get("project_id");
var userID = urlParams.get("user_id");

var urlProjectUserClassifications = `http://stats.zooniverse.org/counts/classification/year?project_id=${projectID}&user_id=${userID}`;
var urlProjectClassifications = `http://stats.zooniverse.org/counts/classification/year?project_id=${projectID}`;

var apiClient = require('panoptes-client/lib/api-client');

//Set the project name
apiClient.type('projects').get(projectID)
  .then(function (project) {
    $(document).ready(function() {
      $("#project-name").html(project.display_name);
    });
  });

//Declare two global classification count variables.
window.appData = {
  userCount: 0
};

// // Get the current classification count values and start count
setStartCount(urlProjectUserClassifications, "#counter");

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
       }
     }
     updateCount();
  });
}
