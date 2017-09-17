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

var playersObj = {gamewinner:-2,players:[{name:"", choice: "", losses:0, wins: 0}, {name:"", choice: "", losses:0, wins: 0}]};

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
	database.ref("/players/" + pidx).update({name:pname});
		
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
		
	p1_n = "";
	p2_n = "";

	p1_c = 0;
	p2_c = 0;
	p1_w = 0;
	p1_l = 0;
	p2_w = 0;
	p2_l = 0;	
}

//init routine - should start before document load
database.ref().once("value", function(snap) {
	//check to see if the system is initialized - check to see if there is a games node
	if (!snap.child("players").exists()) {
		init();
	} 
	
	if (snap.child("players/0/name").val() !== "" && snap.child("players/1/name").val() === "") {
		playerIdx = 1;
	} else {
		playerIdx = 0;
	}
});



function updatePageData() {
	database.ref().once("value", function (snap) {
		//get the data for your opponent - different set depending on which player you are
		if (playerIdx === 0) {
			p2_n = snap.child("/players/1/name").val();
			p2_c = snap.child("players/1/choice").val();
			p2_w = snap.child("players/1/wins").val();
			p2_l = snap.child("players/1/losses").val();
		} else {
			p1_n = snap.child("/players/0/name").val();
			p1_c = snap.child("players/0/choice").val();
			p1_w = snap.child("players/0/wins").val();
			p1_l = snap.child("players/0/losses").val();			
		}

		if (p1_c !== "" && p2_c !== "") {

			if (p1_c === p2_c) {

				ties++;
				//No winner. It's a tie.
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
			
			//Game winner or tie has been determined. Store the game winner and clear the choices so the players can play again.
			p1_c = "";
			p2_c = "";

		} else {
			//Game is still undecided. One or both players have yet to take their turns.
			gameWinner = -2;
		}
		
		updateObj = playersObj;
		updateObj.gamewinner = gameWinner;
		updateObj.players[0].name = p1_n;
		updateObj.players[0].choice = p1_c;
		updateObj.players[0].wins = p1_w;
		updateObj.players[0].losses = p1_l;
		
		updateObj.players[1].name = p2_n;
		updateObj.players[1].choice = p2_c;
		updateObj.players[1].wins = p2_w;
		updateObj.players[1].losses = p2_l;		
		
		//update the whole object because too many updates cause too many value change triggers
		database.ref().set(updateObj);
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
	
	
//	if (p1_c === undefined || p2_c === undefined) {
//		gameWinner = -2;
//	}
	
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

database.ref().on("value", function (snap) {
	p1_n = snap.child("players/0/name").val();
	p1_w = snap.child("players/0/wins").val();
	p1_l = snap.child("players/0/losses").val();
	
	p2_n = snap.child("players/1/name").val();	
	p2_w = snap.child("players/1/wins").val();
	p2_l = snap.child("players/1/losses").val();
	
	gameWinner = snap.child("gamewinner").val();
	
	updateDisplay();
});

$(document).ready(function () {
	$("#player-header-label").hide();
	
	$("#add-player").on("click", function () {
		var playerName = $("#player-name").val().trim();
		
		if (playerName !== "" && playerName !== undefined) {
			setPlayer(playerName, playerIdx);
		} else {
			alert("Please enter your name");
			$("#player-name").focus();
		}
	});
	
	$(".btn:not(#message-send)").on("click", function () {
		console.log("playerIdx: " + playerIdx);
		
		var playerSide = $(this).parent().attr("id");
		var actionValue = $(this).attr("data-value");
		
		if (playerSide === "player1-buttons" && playerIdx === 0) {
			p1_c = actionValue;
		} else if (playerSide === "player2-buttons" && playerIdx === 1) {
			p2_c = actionValue;
		}
		
		updatePageData();
	});
	
	$("#message-send").on("click", function () {
		var msgHandle;
		
		if (playerIdx === 0)
			msgHandle = p1_n;
		else 
			msgHandle = p2_n;
		
		if (msgHandle !== "") {
			
			if (p1_n === "" || p2_n === "") {
				alert("Please wait for player 2.");
				return false;
			}			
		
			var msg = $("#message-input").val();

			if (msg !== "" && msg !== undefined) {
				msg = msgHandle + ": " + msg + "<br><br>";
			}
				
			database.ref("/messages").push({message:msg,dateAdded:firebase.database.ServerValue.TIMESTAMP});
			$("#message-input").val("");
		} else {
	
			alert("Please enter your name.");
			
		}
	});
});

database.ref("/messages").orderByChild("dateAdded").limitToLast(1).on("child_added", function(crackle) {
	var mb = $("#message-box");
	
	mb.append(crackle.val().message);

	if(mb.length) {
		mb.scrollTop(mb[0].scrollHeight - mb.height());
	}	
});


