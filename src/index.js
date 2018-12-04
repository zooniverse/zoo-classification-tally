import _ from "lodash";
import DOMPurify from 'dompurify';
import $ from 'jquery';

import Pusher from 'pusher-js';
var PusherProdKey = "79e8e05ea522377ba6db";
var pusher = new Pusher(PusherProdKey);
var panoptesChannel = pusher.subscribe("panoptes");

var apiClient = require('panoptes-client/lib/api-client');


window.appData = {
  userCount: 0,
  projectCount: 0
};


//Declare two global classification count variables.
var urlParams = new URLSearchParams(window.location.search);
if (!window.location.search) {
  const queryParamsErrorMsg = 'Help!<br><br>Please set the query params to configure this application';
  console.log(queryParamsErrorMsg)
  $("#total-count-info").html(queryParamsErrorMsg);
}

var projectID = urlParams.get("project_id");
var userID = urlParams.get("user_id");
var username = urlParams.get("username")
var startDate = urlParams.get("exhibit_start_date");

checkValidProject();

function checkValidProject() {
  //Set the project name and throw error if not valid project or user id
  apiClient.type('projects').get(projectID)
    .then(function (project) {
      $("#project-name").html(project.display_name);
      $("#total-count-info").append(project.display_name);
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
    $(container).html(totalClassifications);
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
         $("#total-count").html(window.appData.projectCount);
       }
       if (pusherProject === String(projectID) && pusherUser === String(userID)) {
         window.appData.userCount++;
         $("#counter").html(window.appData.userCount);
       }
     }
     updateCount();
  });
}

function printNotValidUser() {
  $("#counter").html("not a valid user");
}
