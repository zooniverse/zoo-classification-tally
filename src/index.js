import _ from "lodash";
import DOMPurify from 'dompurify';
import $ from 'jquery';

import Pusher from 'pusher-js';
var PusherProdKey = "79e8e05ea522377ba6db";
var pusher = new Pusher(PusherProdKey);
var panoptesChannel = pusher.subscribe("panoptes");

var apiClient = require('panoptes-client/lib/api-client');

const statsURLPrefix = 'https://stats.zooniverse.org/counts/classification/year';

//Declare two global classification count variables.
window.appData = {
  userCount: 0,
  projectCount: 0,
  totalClassificationsCount: 0
};

function formattedUserCount() {
  return window.appData.userCount.toLocaleString()
}

function formattedProjectCount() {
  return window.appData.projectCount.toLocaleString()
}

function formattedTotalClassificationsCount() {
  return window.appData.totalClassificationsCount.toLocaleString()
}

var urlParams = new URLSearchParams(window.location.search);
if (!window.location.search) {
  $("#total-count").html(formattedTotalClassificationsCount());
  countAllZooniverseClassifications()
  .done(function(data) {
    let classificationsCount = 0;
    var statData = data.events_over_time.buckets;
    for (var i in statData) {
      var perYearCount = parseInt(statData[i].doc_count)
      classificationsCount = classificationsCount + perYearCount;
    }
    window.appData.totalClassificationsCount = classificationsCount
    $("#total-count").html(formattedTotalClassificationsCount());
    startApp();
  });
}

var projectID = urlParams.get("project_id");
var userID = urlParams.get("user_id");
var username = urlParams.get("username")
var startDate = urlParams.get("exhibit_start_date");

checkValidUser();
checkValidProject();


function countAllZooniverseClassifications() {
  return $.getJSON(statsURLPrefix);
}

function checkValidProject() {
  // TODO: check we have a  project id beofre trying to do things with it

  //Set the project name and throw error if not valid project or user id
  apiClient.type('projects').get(projectID)
    .then(function (project) {
      $("#project-name").html(project.display_name);
      $("#total-count-info").append(project.display_name);
    })
    .catch((err) => {
      throw new Error("Not a valid project ID");
    });
}

function convertUsernameToID() {
  if (!userID && username) {
    apiClient.type('users').get({ login: username})
      .then(function (users) {
        userID = users[0].id;
      })
      .catch((err) => {
        printNotValidUser()
        throw new Error("Not a valid username");
      });
  }
}

function checkValidUser() {
  convertUsernameToID();
  apiClient.type('users').get(userID)
    .then(function () {
      console.log('found the user with ID' + userID)
    })
    .catch((err) => {
      printNotValidUser()
      throw new Error("Not a valid user ID");
    });
}

function startApp() {
  var urlProjectClassifications = `${statsURLPrefix}?project_id=${projectID}`;
  var urlProjectUserClassifications = `${urlProjectClassifications}&user_id=${userID}`;
  if (projectID && userID) {
    setStartingCount(urlProjectUserClassifications, "#counter");
    setStartingCount(urlProjectClassifications, "#total-count");
  } else if (projectID) {
    setStartingCount(urlProjectClassifications, "#total-count");
  }
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

function updateCount(pusherProject, pusherUser) {
  if (projectID === null) {
    window.appData.totalClassificationsCount++;
    $("#total-count").html(formattedTotalClassificationsCount());
    return;
  }

  var newProjectClassification = pusherProject === String(projectID)
  var newUserClassification = pusherUser === String(userID)
  if(newProjectClassification) {
    window.appData.projectCount++;
    $("#total-count").html(formattedProjectCount());
  }
  if (newProjectClassification && newUserClassification) {
    window.appData.userCount++;
    $("#counter").html(formattedUserCount());
  }
}

// Listen for panoptes classifications
function listenForClassifications(userID) {
  // This code runs each time a classification event comes down
  // the panoptes pusher pipe
  panoptesChannel.bind('classification', function(data) {
     // console.log(data);
     var pusherProject = data['project_id'];
     var pusherUser = data['user_id'];
     updateCount(pusherProject, pusherUser);
  });
}

function printNotValidUser() {
  $("#counter").html("not a valid user");
}
