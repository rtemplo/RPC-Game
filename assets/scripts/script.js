// JavaScript Document

// Initialize Firebase
var config = {
	apiKey: "AIzaSyCOVr-8-BqqjgAWCJgHCScisX7jxdWS_GE",
	authDomain: "rps-game-6b5cc.firebaseapp.com",
	databaseURL: "https://rps-game-6b5cc.firebaseio.com",
	projectId: "rps-game-6b5cc",
	storageBucket: "",
	messagingSenderId: "950215502996"
};
firebase.initializeApp(config);

var database = firebase.database();

var playerIdx = 0;

var playersObj = {players:[{name:"", choice: "", losses:0, wins: 0}, {name:"", choice: "", losses:0, wins: 0}]};

var ties = 0;

var p1_n, p1_c, p1_w, p1_l;
var p2_n, p2_c, p2_w, p2_l;

var gameWinner;

//var connections;
//var connectionsRef = database.ref("/connections");

//// '.info/connected' is a special location provided by Firebase that is updated
//// every time the client's connection state changes.
//// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
//var connectedRef = database.ref(".info/connected");
//
//// When the client's connection state changes...
//connectedRef.on("value", function(snap) {
//  // If they are connected..
//  if (snap.val()) {
//
//    // Add user to the connections list.
//    var con = connectionsRef.push(true);
//    // Remove user from the connection list when they disconnect.
//    con.onDisconnect().remove();
//  }
//});
//
//connectionsRef.on("value", function(snap) {
//	connections = snap.numChildren()
//});

function setPlayer(pname, pidx) {
	var playerRef = database.ref("/players/" + pidx);
	playerRef.update({name:pname});
	
	$("#player-header-name").html(pname);
	$("#player-header-number").html(pidx + 1);	
	
	if (pidx === 0) {
		$("#player1-name").html(pname);
	} else {
		$("#player2-name").html(pname);
	}
	
	$("#add-player-layer").hide();
	$("#player-header-label").show();
}

function resetUserStats() {
	//if a player drops out the stats must be rest and the user must wait for a new player to enter the game.
}

function init() {
	database.ref().set(playersObj);
	database.ref().update({gamewinner:-2});
}

//init routine - should start before document load
database.ref().once("value", function(snap) {
	//check to see if the system is initialized - check to see if there is a games node
	if (!snap.child("players").exists()) {
		init();
	} 
	
	if (snap.child("players/0/name").val() !== "" && snap.child("players/1/name").val() === "") {
		playerIdx = 1;
	}

});

function updateCards() {
	database.ref().once("value", function (snap) {
		p1_n = snap.child("/players/0/name").val();
		p2_n = snap.child("/players/1/name").val();

		p1_c = snap.child("players/0/choice").val();
		p2_c = snap.child("players/1/choice").val();
		p1_w = snap.child("players/0/wins").val();
		p1_l = snap.child("players/0/losses").val();
		p2_w = snap.child("players/1/wins").val();
		p2_l = snap.child("players/1/losses").val();

		if (p1_c !== "" && p2_c !== "") {

			if (p1_c === p2_c) {

				ties++;
				gameWinner = -1;

			} else {

				if (p1_c !== "" && p2_c !== "") {
					if (
						(p1_c === "R") && (p2_c === "S")
						||
						(p1_c === "P") && (p2_c === "R")
						||
						(p1_c === "S") && (p2_c === "P")
						) 
					{
						p1_w++;
						p2_l++;

						gameWinner = 0;

					} else {
						p1_l++;
						p2_w++;

						gameWinner = 1;
						
					}
				}
			}
			
			database.ref("/players/0").update({choice:"", wins:p1_w, losses:p1_l});
			database.ref("/players/1").update({choice:"", wins:p2_w, losses:p2_l});			

		} else {
			gameWinner = -2;
		}
		
		database.ref().update({gamewinner:gameWinner});
	});
	
}

function updateDisplay() {
	var gameMsg;
	
	$("#player1-name").html(p1_n);
	$("#player2-name").html(p2_n);		
	
	$("#p1-wins").html(p1_w);		
	$("#p2-wins").html(p2_w);

	$("#p1-losses").html(p1_l);
	$("#p2-losses").html(p2_l);	
	
	if (gameWinner === 0) {
		if (playerIdx === 0) {
			gameMsg = "You win!";
		} else {
			gameMsg = "You lose.";
		}
	} else if (gameWinner === 1) {
		if (playerIdx === 1) {
			gameMsg = "You win!";
		} else {
			gameMsg = "You lose.";
		}
	} else if (gameWinner === -1) {
		gameMsg = "Tie!";
	} else {
		gameMsg = "-----";
	}
	
	$("#result-display").html(gameMsg);
}

$(document).ready(function () {
	$("#player-header-label").hide();
	
	database.ref().on("value", function (snap) {
		//console.log("change event occured.")
		updateDisplay();	
	});	
	
	$("#add-player").on("click", function () {
		var playerName = $("#player-name").val().trim();
		
		if (playerName !== "" || playerName !== undefined) {
			setPlayer(playerName, playerIdx);
		} else {
			alert("Please enter your name");
			$("#player-name").focus();
			return false;
		}
	});
	
	$(".btn").on("click", function () {
		console.log("playerIdx: " + playerIdx);
		
		var playerSide = $(this).parent().attr("id");
		var actionValue = $(this).attr("data-value");
		
		if (playerSide === "player1-buttons" && playerIdx === 0) {
			database.ref("/players/0").update({choice:actionValue}, updateCards);
		} else if (playerSide === "player2-buttons" && playerIdx === 1) {
			database.ref("/players/1").update({choice:actionValue}, updateCards);
		}
		
	});
});


