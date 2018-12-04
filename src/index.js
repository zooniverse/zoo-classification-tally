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

// static counts from home page
// https://github.com/zooniverse/Panoptes-Front-End/blob/9173e11c1094cb7629ea66cf166d37bc90b84d45/app/pages/home-not-logged-in/research.jsx#L41
const GZ123_COUNT = 98989226
const OUROBOROS_COUNT = 142800311
const OTHERS_COUNT = 8680290

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
  var preExistingCounts = GZ123_COUNT + OUROBOROS_COUNT + OTHERS_COUNT
  var count = window.appData.totalClassificationsCount + preExistingCounts
  return count.toLocaleString()
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

function loadedUserName() {
  return ID2String(window.appData.userName);
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
  return apiClient.type('projects').get(loadedProjectId())
    .then(function (project) {
      console.log('found the project with ID' + loadedProjectId())
      return project.display_name
    })
}

function checkValidUser() {
  var params = null;
  var noUserId = !loadedUserId() && loadedUserName()
  if (noUserId) {
    params = { login: loadedUserName() };
  } else {
    params = { id: loadedUserId() };
  }

  return apiClient.type('users').get(params)
    .then(function (users) {
      console.log('found the user with ID' + loadedUserId())
      window.appData.UserID = window.appData.UserID || users[0].id
      window.appData.userName = window.appData.userName || users[0].login
    })
}

function projectStatsUrl() {
 return `${statsURLPrefix}?project_id=${loadedProjectId()}`;
}

function setProjectCount() {
  $.getJSON(projectStatsUrl())
    .done(function(data) {
      window.appData.projectCount = extractCountData(data);
      $("#total-count").html(formattedProjectCount());
    });
}

function setUserCountDetails() {
  var urlProjectUserClassifications = `${projectStatsUrl()}&user_id=${loadedUserId()}`;
  $.getJSON(urlProjectUserClassifications)
    .done(function(data) {
      window.appData.userCount = extractCountData(data);
      $("#counter").html(formattedUserCount());
      $("#counter-info").html(loadedUserName());
    });
}

function extractCountData(data) {
  var totalClassifications = 0;
  var statData = data.events_over_time.buckets;
  for (var i in statData) {
    totalClassifications = totalClassifications + parseInt(statData[i].doc_count);
  }
  return totalClassifications;
}


function updateCount(data) {
  var pusherProject = data['project_id'];
  var pusherUser = data['user_id'];

  if (!loadedProjectId()) {
    window.appData.totalClassificationsCount++;
    $("#total-count").html(formattedTotalClassificationsCount());
  } else {
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
}

// entry point of the code - start by setting the default counts
$(document).ready(function() {
  if (!loadedProjectId()) {
    $("#total-count").html("Loading")
  }

  if (!window.location.search) {
    $("#project-name").html('Zooniverse');
    countAllZooniverseClassifications();
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    window.appData.projectID = urlParams.get("project_id");
    window.appData.userID = urlParams.get("user_id");
    window.appData.userName = urlParams.get("user_name")

    // ideally these chain together
    var projectName = null;
    if (loadedProjectId()) {
      checkValidProject()
        .then(function (projectName) {
          $("#project-name").html(projectName);
          setProjectCount();
          // test if we have a valid details - if so set their counts
          if (loadedUserId() || loadedUserName()) {
            checkValidUser()
              .then(function () {
                // we have a valid user
                setUserCountDetails();
              })
              .catch((err) => {
                console.log(err)
                $("#counter-info").html(
                  `not a valid user: ${window.appData.userID || window.appData.userName}`
                );
              })
          }
        })
        .catch((err) => {
          console.log(err)
          $("#project-name").html("Not a valid project ID");
        });
    } else {
      projectName = 'Please specify a project to tally counts on'
      $("#project-name").html(projectName);
      throw new Error("Not a valid project ID");
    }
  }
});
