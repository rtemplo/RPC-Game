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

var playerIdx = 1;

var ties = 0;

var p1_n, p1_c, p1_w, p1_l;
var p2_n, p2_c, p2_w, p2_l;

var gameWinner;

//// '.info/connected' is a special location provided by Firebase that is updated
//// every time the client's connection state changes.
//// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");
var rootRef = database.ref();
var playersRef = database.ref("/players");
var messagesRef = database.ref("/messages");

function setPlayer(pname, pidx) {
	//this has to be here because we need the pidx argument in order to reference the specific player node for actions on disconnect
	connectedRef.on("value", function(snap) {
		if (snap.val()) {
			playersRef.child(pidx).set({name:pname,choice:"",wins:0,losses:0});
			var playerNode = playersRef.child(pidx);
			
			playerNode.onDisconnect().remove();
			messagesRef.onDisconnect().remove();
			$("#message-box").val("");
		}
	});
		
	$("#player-header-name").html(pname);
	$("#player-header-number").html(pidx);	
	
	$("#player"+pidx+"-name").html(pname);
	
	$("#add-player-layer").hide();
	$("#player-header-label").show();
	
	$("#player"+pidx+"-buttons button").attr("disabled", false);		
}

function init() {
	p1_n = "";
	p1_c = "";
	p1_w = 0;
	p1_l = 0;
	
	p2_n = "";
	p2_c = "";
	p2_w = 0;
	p2_l = 0;
	
	gameWinner = -2;
}

//init routine - should start before document load - should be initial promise
rootRef.once("value", function(snap) {
	init();
	
	if (snap.child("players/1/name").exists() && snap.child("players/2/name").exists()) {
		alert("Sorry the game is full.");
		window.close();
	} else {
		if (snap.child("players/1/name").exists()) {
			playerIdx = 2;
		} else {
			playerIdx = 1;
		}
	}
});


function updatePageData() {
	rootRef.once("value", function (snap) {
		//get the data for your opponent - different set depending on which player you are
		if (playerIdx === 1) {
			p2_n = snap.child("players/2/name").val();
			p2_c = snap.child("players/2/choice").val();
			p2_w = snap.child("players/2/wins").val();
			p2_l = snap.child("players/2/losses").val();
		} else {
			p1_n = snap.child("players/1/name").val();
			p1_c = snap.child("players/1/choice").val();
			p1_w = snap.child("players/1/wins").val();
			p1_l = snap.child("players/1/losses").val();			
		}

		if (p1_c !== "" && p2_c !== "") {

			if (p1_c === p2_c) {

				ties++;
				//No winner. It's a tie.
				gameWinner = 0;

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

						gameWinner = 1;

					} else {
						p1_l++;
						p2_w++;

						gameWinner = 2;
						
					}
				}
			}
			
			//Game winner or tie has been determined. Store the game winner and clear the choices so the players can play again.
			p1_c = "";
			p2_c = "";

		} else {
			//Game is still undecided. One or both players have yet to take their turns.
			gameWinner = -1;
		}
		
	});
	
	rootRef.update({
		gamewinner:gameWinner, 
		players:{
			1:{"name":p1_n, "choice":p1_c, "wins":p1_w, "losses":p1_l},
			2:{"name":p2_n, "choice":p2_c, "wins":p2_w, "losses":p2_l}
		}
	});
	
}

function updateDisplay() {
	var gameMsg;
	
	if (p1_n === "" || p1_n === undefined || p1_n === null) {
		p1_n = '<span class="text-muted">Offline</span>';
	}
	
	if (p2_n === "" || p2_n === undefined || p2_n === null) {
		p2_n = '<span class="text-muted">Offline</span>';
	}
	
	$("#player1-name").html(p1_n);
	$("#player2-name").html(p2_n);		
	
	$("#p1-wins").html(p1_w);		
	$("#p2-wins").html(p2_w);

	$("#p1-losses").html(p1_l);
	$("#p2-losses").html(p2_l);	
		
	if (gameWinner === 1) {
		if (playerIdx === 1) {
			gameMsg = "You win!";
		} else {
			gameMsg = "You lose.";
		}
	} else if (gameWinner === 2) {
		if (playerIdx === 2) {
			gameMsg = "You win!";
		} else {
			gameMsg = "You lose.";
		}
	} else if (gameWinner === 0) {
		gameMsg = "Tie!";
	} else {
		gameMsg = "-----";
	}
	
	$("#result-display").html(gameMsg);
}

//var dbRef = database.ref();
rootRef.on("value", function (snap) {
	p1_n = snap.child("players/1/name").val();
	p1_w = snap.child("players/1/wins").val();
	p1_l = snap.child("players/1/losses").val();
	
	p2_n = snap.child("players/2/name").val();	
	p2_w = snap.child("players/2/wins").val();
	p2_l = snap.child("players/2/losses").val();
	
	gameWinner = snap.child("gamewinner").val();
	
	updateDisplay();
	
	if (snap.numChildren() === 2) $("#message-send").attr("disabled", false);
	
});

$(document).ready(function () {
	$("#player-header-label").hide();
	$("button:not(#add-player)").attr("disabled", true);
		
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
		
		if (playerSide === "player1-buttons" && playerIdx === 1) {
			p1_c = actionValue;
		} else if (playerSide === "player2-buttons" && playerIdx === 2) {
			p2_c = actionValue;
		}
		
		updatePageData();
	});
	
	$("#message-send").on("click", function () {
		var msgHandle;
		
		if (playerIdx === 1)
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
				
			messagesRef.push({message:msg,dateAdded:firebase.database.ServerValue.TIMESTAMP});
			$("#message-input").val("");
		} else {
	
			alert("Please enter your name.");
			
		}
	});
});

messagesRef.orderByChild("dateAdded").limitToLast(1).on("child_added", function(crackle) {
	var mb = $("#message-box");
	
	mb.append(crackle.val().message);

	if(mb.length) {
		mb.scrollTop(mb[0].scrollHeight - mb.height());
	}	
});

function disableF5(e) { if ((e.which || e.keyCode) == 116) e.preventDefault(); };
// To disable f5
$(document).on("keydown", disableF5);

document.addEventListener('contextmenu', event => event.preventDefault());


