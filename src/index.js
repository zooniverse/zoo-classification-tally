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

console.log("build1.0");

var projectID = urlParams.get("project_id");
var userID = urlParams.get("user_id");
var username = urlParams.get("username")
var startDate = urlParams.get("exhibit_start_date");

var apiClient = require('panoptes-client/lib/api-client');

//Declare two global classification count variables.
window.appData = {
  userCount: 0,
  projectCount: 0
};

checkValidProject();

function checkValidProject() {
  //Set the project name and throw error if not valid project or user id
  apiClient.type('projects').get(projectID)
    .then(function (project) {
      $(document).ready(function() {
        $("#project-name").html(project.display_name);
      });
      $(document).ready(function() {
        $("#total-count-info").append(project.display_name);
      });
      convertUsernameToID();
    })
    .catch((err) => {
      throw new Error("Not a valid project ID");
    });
}

function convertUsernameToID() {
  if (!userID && username) {
    apiClient.type('users').get({ login: username})
      .then(function (users) {
        var userID = users[0].id;
        checkValidUser(userID);
      })
      .catch((err) => {
        printNotValidUser()
        throw new Error("Not a valid username");
      });
  } else {
    checkValidUser(userID);
  }
}

function checkValidUser(userID) {
  //Throw error if not valid user id
  apiClient.type('users').get(userID)
    .then(function () {
      console.log("");
      startApp(userID);
    })
    .catch((err) => {
      printNotValidUser()
      throw new Error("Not a valid user ID");
    });
}

function startApp(userID) {
  var urlProjectUserClassifications = `https://stats.zooniverse.org/counts/classification/year?project_id=${projectID}&user_id=${userID}`;
  var urlProjectClassifications = `https://stats.zooniverse.org/counts/classification/year?project_id=${projectID}`;
  if (projectID && userID) {
    initialisePage(urlProjectUserClassifications, urlProjectClassifications, userID);
  } else if (projectID) {
    initialisePage("", urlProjectClassifications, userID);
  }
}

function initialisePage(userQueryURL, projectQueryURL, userID) {
  setStartingCount(userQueryURL, "#counter");
  setStartingCount(projectQueryURL, "#total-count");
  listenForClassifications(userID);
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
function listenForClassifications(userID) {
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

function printNotValidUser () {
  $(document).ready(function() {
    $("#counter").html("not a valid user");
  });
}
