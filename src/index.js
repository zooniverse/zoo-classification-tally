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
var projectName = urlParams.get("project_name");
var userID = urlParams.get("user_id");
var username = urlParams.get("username")
var startDate = urlParams.get("exhibit_start_date");

var apiClient = require('panoptes-client/lib/api-client');

//Declare two global classification count variables.
window.appData = {
  userCount: 0,
  projectCount: 0
};

// checkValidProject();
convertProjectNameToID();

function convertProjectNameToID() {
  if (!projectID && projectName) {

    var lowerCaseSpacesProjectName = projectName.replace(/-/g, ' '); // Here the name is converted to have spaces to match the panoptes API. However all words start with lowercase

    apiClient.type('projects').get({ display_name: lowerCaseSpacesProjectName}) // This is where the url paramter project name needs to be used to query the panoptes api
      .then(function (project) {
        var projectID = project[0].id;
        checkValidProject(projectID);
      })
      .catch((err) => {
        throw new Error("Not a valid project");
      });
  } else {
    checkValidProject(projectID);
  }
}

function checkValidProject(projectID) {
  //Set the project name and throw error if not valid project or user id
  apiClient.type('projects').get(projectID)
    .then(function (project) {
      $(document).ready(function() {
        $("#project-name").html(project.display_name);
      });
      $(document).ready(function() {
        $("#total-count-info").append(project.display_name);
      });
      convertUsernameToID(projectID);
    })
    .catch((err) => {
      throw new Error("Not a valid project ID");
    });
}

function convertUsernameToID(projectID) {
  if (!userID && username) {
    apiClient.type('users').get({ login: username})
      .then(function (users) {
        var userID = users[0].id;
        checkValidUser(userID, projectID);
      })
      .catch((err) => {
        printNotValidUser()
        throw new Error("Not a valid username");
      });
  } else {
    checkValidUser(userID, projectID);
  }
}

function checkValidUser(userID, projectID) {
  //Throw error if not valid user id
  apiClient.type('users').get(userID)
    .then(function () {
      console.log("");
      startApp(userID, projectID);
    })
    .catch((err) => {
      printNotValidUser()
      throw new Error("Not a valid user ID");
    });
}

function startApp(userID, projectID) {
  var urlProjectUserClassifications = `https://stats.zooniverse.org/counts/classification/year?project_id=${projectID}&user_id=${userID}`;
  var urlProjectClassifications = `https://stats.zooniverse.org/counts/classification/year?project_id=${projectID}`;
  if (projectID && userID) {
    initialisePage(urlProjectUserClassifications, urlProjectClassifications, userID, projectID);
  } else if (projectID) {
    initialisePage("", urlProjectClassifications, userID, projectID);
  }
}

function initialisePage(userQueryURL, projectQueryURL, userID, projectID) {
  setStartingCount(userQueryURL, "#counter");
  setStartingCount(projectQueryURL, "#total-count");
  listenForClassifications(userID, projectID);
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
function listenForClassifications(userID, projectID) {
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
