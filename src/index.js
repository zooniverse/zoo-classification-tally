import _ from "lodash";

var PusherProdKey = "79e8e05ea522377ba6db";
var pusherStagKey = "95781402b5854a712a03";
var pusherDevKey = "95781402b5854a712a03";

var pusher = new Pusher(PusherProdKey);
var panoptesChannel = pusher.subscribe("panoptes");
// Enable pusher logging - don't include this in production
// Pusher.logToConsole = true;

var urlParams = new URLSearchParams(window.location.search);
if (!window.location.search) {
  throw new Error("Need query params");
}

var projectID = urlParams.get("project_id");
var userID = urlParams.get("user_id");
var startDate = urlParams.get("exhibit_start_date")

var urlProjectUserClassifications = `http://stats.zooniverse.org/counts/classification/year?project_id=${projectID}&user_id=${userID}`;
var urlProjectClassifications = `http://stats.zooniverse.org/counts/classification/year?project_id=${projectID}`;

var apiClient = require('panoptes-client/lib/api-client');

//Declare two global classification count variables.
window.appData = {
  userCount: 0,
  projectCount: 0
};

//Set the project name and throw error if not valid project or user id
apiClient.type('projects').get(projectID)
  .then(function (project) {
    $(document).ready(function() {
      $("#project-name").html(project.display_name);
    });
    $(document).ready(function() {
      $("#total-count-info").append(project.display_name);
    });
  })
  .catch((err) => {
    throw new Error("Not a valid project ID");
  });

//Throw error if not valid user id
apiClient.type('users').get(userID)
  .then(function () {
    console.log("");
  })
  .catch((err) => {
    throw new Error("Not a valid user ID");
  });

// Get the current classification count values and start count
if (projectID && userID) {
  initialisePage(urlProjectUserClassifications, urlProjectClassifications);
}

function initialisePage(userQueryURL, projectQueryURL) {
  setStartingCount(userQueryURL, "#counter");
  setStartingCount(projectQueryURL, "#total-count");
  listenForClassifications();
}

function setStartingCount(url, container) {
  $.getJSON(url, function(data) {
    var totalClassifications = 0;
    var statData = data.events_over_time.buckets;
    for (var i in statData) {
      totalClassifications = totalClassifications + parseInt(statData[i].doc_count);
    }
    if (container === "#counter") {
      window.appData.userCount = totalClassifications;
    } else {
      window.appData.projectCount = totalClassifications;
    }
    $(document).ready(function() {
      $(container).html(totalClassifications);
    });
  });
}

// Listen for panoptes classifications
function listenForClassifications() {
  // This code runs each time a classification event comes down
  // the panoptes pusher pipe
  panoptesChannel.bind('classification', function(data) {
     // console.log(data);
     var pusherProject = data['project_id'];
     var pusherUser = data['user_id'];

     function updateCount() {
       if (pusherProject === String(projectID)) {
         window.appData.projectCount++;
         $(document).ready(function() {
           $("#total-count").html(window.appData.projectCount);
         });
       }
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
