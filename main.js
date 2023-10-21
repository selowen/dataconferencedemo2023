// YouTube Video
var tag = document.createElement('script');
var firstScriptTag = document.getElementsByTagName('script')[0];
var player;
var tracking;
var videotime = 0;
var timeupdater = null;

// Main Variables
let video = document.getElementById('video');
let durationTime;
let currentTime;
let videoHalfWay;
let SD = window.parent;
let runHalfOnce = false;

// xAPI variables
let email = "admin@learningdojo.net";
let name = "Sammy McGee";
let verb = "";
let objectDesc = "";
let alertMsg = document.getElementById("alertMsg");

tag.src = "https://www.youtube.com/iframe_api";
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Page Ready
$(document).ready(function(){
    if(xAPIReporting){
        $('#userInfo').modal("show");
    };
});

// Update text
function updateLabels(){
    videoTitle.innerHTML = title;
    videoDesc.innerHTML = description;
    copyright.innerHTML = copyrightText;
    profile.src = profilePic;
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-video', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: { 'autoplay':0, 'controls': 1 },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    var node = document.createElement('div');
    node.setAttribute("id", "event-view");
    node.setAttribute("class", "player-event-view");
    // document.getElementsByClassName('outer-container')[0].appendChild(node);

    videoHalfWay = Math.round(player.getDuration()/2);

    function updateTime() {
        var oldTime = videotime;
        if(player && player.getCurrentTime) {
            videotime = Math.round(player.getCurrentTime());
        }
        if(videotime !== oldTime) {
            onProgress(videotime);
        }
      }
      timeupdater = setInterval(updateTime, 100);

    //   Intialized verb
    if(xAPIReporting){
        sendBasicStatement("http://adlnet.gov/expapi/verbs/initialized", "initialized", objectName, "user was able to initialize the " + objectName + " video.")
    }

}

// Video Events
function onPlayerStateChange(event) {
    if (event.data == 1){ //Playing
        if(xAPIReporting){
            sendBasicStatement("https://w3id.org/xapi/video/verbs/played", "played", objectName, "User was able to start "+ objectName +" video.");
        }
        console.log('playing');
    } else if (event.data == 2){ //Paused
        if(xAPIReporting){
            sendBasicStatement("http://id.tincanapi.com/verb/paused", "paused", objectName + " at " + Math.round(player.getCurrentTime()) + " seconds.", "User paused the " + objectName + " video.");
        }
        console.log('paused');
    } else if (event.data == 0){ //Ended
        setCompletion();
        console.log('ended');
	};
};

function onProgress(currentTime) {
    // Reached Halfway
    if (currentTime == videoHalfWay){
        console.log('Half first')
        if(!runHalfOnce){
            sendBasicStatement("http://id.tincanapi.com/verb/viewed", "viewed", "half of " + objectName, "User was able to complete half of "+ objectName +" video.");
            console.log('Halfway second')
            runHalfOnce = true;
        }
    }
}

// Set Video Completion
function setCompletion(){
    // SCORM Reporting
    if(scormReporting){
        SD.SetScore(100, 100, 0);
	    SD.SetPassed();
    }

    // xAPI Wrapper
    if(xAPIReporting){
        sendBasicStatement("http://adlnet.gov/expapi/verbs/initialized", "completed", objectName, "The user completed the "+ objectName +" video.");
    } 
}

// Save user details
function saveName(){
	name = document.getElementById('nameEntered').value;
	console.log(name);
}

function saveEmail(){
	email = document.getElementById('userEmail').value;
	console.log(email)
}

$('#userInfo').on('shown.bs.modal', function (e) {
    player.pause();
});

$('#userInfo').on('hidden.bs.modal', function (e) {
    player.play();
});

function saveUserInfo(){
    if(name != "" && email != ""){
        $('#userInfo').modal("hide");
    } else{
        alertMsg.classList.remove('d-none');
    }
}

// xAPI Basic Statement
function sendBasicStatement(verbID, verb, objectName, objectDesc){
    let statement = {
		"actor": {
			"mbox": "mailto:"+email,  
			"name": name,  
			"objectType": "Agent"  
		},
		"verb": {
			"id": verbID,
			"display": {
				"en-US": verb
			}
		},
		"object": {
			"id": objectID,
			"definition": {
				"name": {
					"en-US": objectName
				},
				"description": {
					"en-US": objectDesc
				}
			},
			"objectType": "Activity"
		}
	};
	ADL.XAPIWrapper.sendStatement(statement);
}