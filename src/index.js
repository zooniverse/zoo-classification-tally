import _ from "lodash";
import DOMPurify from 'dompurify';
import $ from 'jquery';
import Pusher from 'pusher-js';

//Declare two global classification count variables.
window.appData = {
  loadedInitialCounts: false,
  userCount: 0,
  projectCount: 0,
  totalClassificationsCount: 0,
  projectID: null,
  userID: null,
  userName: null
};

const PusherProdKey = "79e8e05ea522377ba6db";
const pusher = new Pusher(PusherProdKey);
const panoptesChannel = pusher.subscribe("panoptes");

// Listen for panoptes classifications
// This code runs each time a classification event comes down
// the panoptes pusher pipe
panoptesChannel.bind('classification', function(data) {
   if (window.appData.loadedInitialCounts === true) {
     console.log
     updateCount(data);
   }
});

var apiClient = require('panoptes-client/lib/api-client');

const statsURLPrefix = 'https://stats.zooniverse.org/counts/classification/year';

function formattedUserCount() {
  return window.appData.userCount.toLocaleString()
}

function formattedProjectCount() {
  return window.appData.projectCount.toLocaleString()
}

function formattedTotalClassificationsCount() {
  return window.appData.totalClassificationsCount.toLocaleString()
}

function ID2String(id) {
  if (id === null) {
    return null;
  } else {
    return String(id);
  }
}

function loadedProjectId() {
  return ID2String(window.appData.projectID);
}

function loadedUserId() {
  return ID2String(window.appData.userID);
}

function countAllZooniverseClassifications() {
  $.getJSON(statsURLPrefix).done(function(data) {
    let classificationsCount = 0;
    var statData = data.events_over_time.buckets;
    for (var i in statData) {
      var perYearCount = parseInt(statData[i].doc_count)
      classificationsCount = classificationsCount + perYearCount;
    }
    window.appData.totalClassificationsCount = classificationsCount
    $("#total-count").html(formattedTotalClassificationsCount());
    window.appData.loadedInitialCounts = true;
  });
}

function checkValidProject() {
  // TODO: check we have a  project id beofre trying to do things with it

  //Set the project name and throw error if not valid project or user id
  apiClient.type('projects').get(loadedProjectId())
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

function setStartingCounts() {
  if (loadedProjectId() === null) {
    $("#total-count").html("Loading")
  }
  else {
    var urlProjectClassifications = `${statsURLPrefix}?project_id=${loadedProjectId()}`;
    setStartingCount(urlProjectClassifications, "#total-count");
    if (userID) {
      var urlProjectUserClassifications = `${urlProjectClassifications}&user_id=${userID}`;
      setStartingCount(urlProjectUserClassifications, "#counter");
    }
  }
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

function updateCount(data) {
  var pusherProject = data['project_id'];
  var pusherUser = data['user_id'];

  if (loadedProjectId() === null) {
    window.appData.totalClassificationsCount++;
    $("#total-count").html(formattedTotalClassificationsCount());
    return;
  }

  var newProjectClassification = pusherProject === loadedProjectId();
  var newUserClassification = pusherUser === loadedUserId();
  if(newProjectClassification) {
    window.appData.projectCount++;
    $("#total-count").html(formattedProjectCount());
  }
  if (newProjectClassification && newUserClassification) {
    window.appData.userCount++;
    $("#counter").html(formattedUserCount());
  }
}

function printNotValidUser() {
  $("#counter").html("not a valid user");
}

// entry point of the code - start by setting the default counts
setStartingCounts();

if (!window.location.search) {
  countAllZooniverseClassifications();
} else {
  const urlParams = new URLSearchParams(window.location.search);
  window.appData.projectID = urlParams.get("project_id");
  window.appData.userID = urlParams.get("user_id");
  window.appData.userName = urlParams.get("username")

  checkValidUser();
  checkValidProject();
}
