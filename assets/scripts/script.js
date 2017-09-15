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

var gameIdx;
var playerIdx;
var playerID = null;
var connections;

var gamesObj = {games:true};
var playersObj = {players:[{name:"", choice: "", losses:0, wins: 0}, {name:"", choice: "", losses:0, wins: 0}]};

var connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated
// every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

function addPlayer () {
	
}

// When the client's connection state changes...
connectedRef.on("value", function(snap) {

  // If they are connected..
  if (snap.val()) {

    // Add user to the connections list.
    var con = connectionsRef.push(true);
    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

connectionsRef.on("value", function(snap) {
	connections = snap.numChildren()
});

function setPlayer(playerName, playerID) {
	var playerRef = database.ref("/games/"+gameIdx+"/players/" + playerID);
	playerRef.update({name:playerName});
	
	$("#player-header-name").html(playerName);
	$("#player-header-number").html(playerID + 1);	
	
	if (playerID === 0) {
		$("#player1-name").html(playerName);
	} else {
		$("#player2-name").html(playerName);
	}
	
	$("#add-player-layer").hide();
	$("#player-header-label").show();
}

function resetUserStats() {
	//if a player drops out the stats must be rest and the user must wait for a new player to enter the game.
}

function init(gid) {
	gameIdx = gid;
	database.ref().set(gamesObj, function () {database.ref("/games/" + gameIdx).set(playersObj)});
	database.ref().set({currentGames:0});
}

function getGame(data) {
	data.child("games").forEach(function (child) {
		var value = child.val();

		for (var i = 0; i < value.players.length; i++) {
			if (value.players[i].name === "") {
				gameIdx = child.key;
				playerIdx = i;
				break;
			}
		}
	});		
}

function createNewGame() {
	database.ref("/games").once("value", function (snap) {
		var n_gid = snap.numChildren();

		var newGameRef = database.ref("/games/" + n_gid);
		newGameRef.set(playersObj);
		
		database.ref().update({currentGames: n_gid});
	});
	
	database.ref().once("value", function(snap) {
		getGame(snap);
	});
	
}

//init routine - should start before document load
database.ref().once("value", function(snap) {
	//check to see if the system is initialized - check to see if there is a games node
	if (!snap.child("games").exists()) {
		init(0);
	} else {
		//it is initialized so we are going to get the first open game with an open player slot
		getGame(snap);
	}
});

$(document).ready(function () {
	$("#player-header-label").hide();
	
	database.ref().on("value", function (snap) {
		var p1_name = snap.child("players/0/name").val();
		var p1_wins = snap.child("players/0/wins").val();
		var p1_losses = snap.child("players/0/losses").val();
		
		$("#player1-name").html(p1_name);
		$("#p1-wins").html(p1_wins);
		$("#p1-losses").html(p1_losses);		

		var p2_name = snap.child("players/1/name").val();
		var p2_wins = snap.child("players/1/wins").val();
		var p2_losses = snap.child("players/1/losses").val();
		
		$("#player2-name").html(p2_name);
		$("#p2-wins").html(p2_wins);
		$("#p2-losses").html(p2_losses);
	});
	
	$("#add-player").on("click", function () {
		if (playerIdx === undefined) {
			createNewGame();
		}		
		
		var playerName = $("#player-name").val().trim();
		
		if (playerName !== "" || playerName !== undefined) {
			if (playerID === null) {
				if (!player1Set) {
					playerID = 0;
				} else {
					playerID = 1;
				}

				setPlayer(playerName, playerID);
			}
		} else {
			alert("Please enter your name");
			$("#player-name").focus();
			return false;
		}
	});
});


