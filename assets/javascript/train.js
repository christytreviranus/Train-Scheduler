// Firebase configuration
let firebaseConfig = {
  apiKey: "AIzaSyBKOxTa-0d73TiyQ4yNPemEed5ee_HxvXk",
  authDomain: "trainscheduler-cade2.firebaseapp.com",
  databaseURL: "https://trainscheduler-cade2.firebaseio.com",
  projectId: "trainscheduler-cade2",
  storageBucket: "",
  messagingSenderId: "1062247882497",
  appId: "1:1062247882497:web:2b9c84a74c074f69"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Declare variable for Firebase database
let database = firebase.database();

//Declare letiables for Train data

let trainName = '';
let destination = '';
let trainTime = '';
let frequency = 0;


//Adding Trains - Set to Session Storage
$(".form-field").on("keyup", function () {
  let train = $("#train-name").val().trim();
  let destination = $("#destination").val().trim();
  let trainTime = $("#train-time").val().trim();
  let frequency = $("#frequency").val().trim();

  sessionStorage.setItem("trainName", train);
  sessionStorage.setItem("destination", destination);
  sessionStorage.setItem("trainTime", trainTime);
  sessionStorage.setItem("frequency", frequency);
});

//Retrieve Session Storage Values
$("#train-name").val(sessionStorage.getItem("trainName"));
$("#destination").val(sessionStorage.getItem("destination"));
$("#train-time").val(sessionStorage.getItem("trainTime"));
$("#frequency").val(sessionStorage.getItem("frequency"));

//On click event for submit button
$("#submit").on("click", function (event) {
  event.preventDefault();

  if ($("#train-name").val().trim() === "" ||
    $("#destination").val().trim() === "" ||
    $("#train-time").val().trim() === "" ||
    $("#frequency").val().trim() === "") {
      
    $("#error-message").html("Please fill in all fields to add a new train");
  } else {

  trainName = $("#train-name").val().trim();
  destination = $("#destination").val().trim();
  trainTime = $("#train-time").val().trim();
  frequency = $("#frequency").val().trim();

  //Clear form data after submit is clicked
  $(".form-field").val("");

  //Push to Firebase
  database.ref().push({
    trainName: trainName,
    destination: destination,
    frequency: frequency,
    trainTime: trainTime,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });

  //Clear session storage after Firebase data pushed
  sessionStorage.clear();
};

//Firebase Child Added Snapshot
database.ref().on("child_added", function (childSnapshot) {

  let trainTimeConverted = moment(childSnapshot.val().trainTime, "HH:mm").subtract(1, "years");
  let timeDiff = moment().diff(moment(trainTimeConverted), "minutes");
  let timeRemain = timeDiff % childSnapshot.val().frequency;
  let minToArrival = childSnapshot.val().frequency - timeRemain;
  let nextTrain = moment().add(minToArrival, "minutes");

  let key = childSnapshot.key;

  let newRow = $("<tr>");
  newRow.append($("<td>" + childSnapshot.val().trainName + "</td>"));
  newRow.append($("<td>" + childSnapshot.val().destination + "</td>"));
  newRow.append($("<td class='text-center'>" + childSnapshot.val().frequency + "</td>"));
  newRow.append($("<td class='text-center'>" + moment(nextTrain).format("LT") + "</td>"));
  newRow.append($("<td class='text-center'>" + minToArrival + "</td>"));
  newRow.append($("<td class='text-center'><button class='remove btn btn-default btn-sm' remove='" + key + "'> - </button></td>"));

  $("#trainsTable").append(newRow);
});

//Remove Functionality - Removes data from Firebase and Page
$(document).on("click", ".remove", function () {
  removeKey = $(this).attr("remove");
  database.ref().child(removeKey).remove();
  window.location.reload();
});


//Real Time Clock on page
let update;
(update = function () {
  document.getElementById("currentTime").innerHTML = moment().format('MMMM DD, YYYY -- hh:mm:ss A');
})();
setInterval(update, 1000);
});
