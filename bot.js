// Our Twitter library
var Twit = require('twit');
var T = new Twit(require('./config.js'));

var debug = true; // if you don't want to post to Twitter, useful for debugging

var capitalismSearch = {q: "#capitalism", count: 1, result_type: "recent"};
var patriotismSearch = {q: "#patriotism", count: 1, result_type: "recent"};
var corruptSearch = {q: "#corrupt", count: 1, result_type: "recent"};


// Stream - Replies to users who tweet @ me
var streamReply = T.stream('statuses/filter', {track: '@testingBot9'});
streamReply.on('tweet', function (tweet) {
	console.log("Got a tweet at me!")
  	var nameID = tweet.id_str;
	var name = '@' + tweet.user.screen_name;
	console.log(name);

	//Now follow that user
	T.post('friendships/create', {screen_name: name }, function (err, reply) {
		if (err != null) {
			console.log('Error: ', err);
		}
		else {
			console.log('Followed: ' + name);
		}
	});

	var respondText = "We hear your concerns. Please check the website for details about your point deductions and privileges.";

	if (debug) {
		console.log(tweet.text);
	} else {
		// Respond to mention
		respond(respondText, name, nameID);
	}
})

// Steam - Replies to users based on search
// var streamCap = T.stream('statuses/filter', {track: 'capitalism'});
// streamCap.on('tweet', function (tweet) {
// 	console.log("Found a tweet!")
//   	var nameID = tweet.id_str;
// 	var name = '@' + tweet.user.screen_name;
// 	console.log(name);

// 	var respondText = "10 points have been deducted for INNAPRORIATE TOPIC. Please check the website for current points / privileges.";

// 	if (debug) {
// 		console.log(tweet.text);
// 	} else {
// 		respond(respondText, name, nameID);
// 	}
// })


// Helper function for responding based on some criteria
function respond(data, name, nameID) {
	T.post('statuses/update', {in_reply_to_status_id: nameID, status: name + " " + data}, function(err, data, response) {
		if (response) {
			console.log('Success! The bot has responded to someone.')
		}
		if (err) {
			console.log('There was an error with Twitter:', error);
		}
	})
}




// Finds the latest tweet with the hashtag, and responds
function respondLatest() {
	//Partial responses to people, telling them why they lost points
	var respondText1 = "10 points have been deducted for ";
	var respondText2 = ". Please check the website for current points / privileges.";
		
	var reason = "INNAPRORIATE TOPIC";
		
	//Choose a hashtag to search randomly, for variety
	var chosenSearch;
	var rand = Math.random();

	if(rand >= .60) {
		var chosenSearch = capitalismSearch;
	} else if (rand <= 0.60 && rand >= .40) {
		var chosenSearch = patriotismSearch;
	} else {
		var chosenSearch = corruptSearch;
	}


	T.get('search/tweets', chosenSearch, function (error, data) {
	  // If the search request to the server had no errors...
	  if (!error) {

	  	console.log("Found a tweet! = " + data.statuses[0].text);
	  	var nameID = data.statuses[0].id_str;
		var name = '@' + data.statuses[0].user.screen_name;
		console.log(name);

		if (debug) {
			// console.log("Found a tweet! = " + data.statuses[0].text);
		} else {
			// Respond to their tweet
			respond(respondText1 + reason + respondText2, name, nameID);
		}

	  } else {
	  	console.log('There was an error with your hashtag search:', error);
	  }
	});
}




// Finds the latest tweet with the hashtag, and retweets it
function retweetLatest() {
	T.get('search/tweets', capitalismSearch, function (error, data) {
	  // log out any errors and responses
	  console.log(error, data);
	  // If the search request to the server had no errors...
	  if (!error) {
	  	// ...then grab the ID of the tweet we want to retweet...
		var retweetId = data.statuses[0].id_str;
		// ...and then tell Twitter we want to retweet it
		T.post('statuses/retweet/' + retweetId, { }, function (error, response) {
			if (response) {
				console.log('Success! The bot has retweeted something.')
			}
			// If there was an error with the Twitter call, print it out here
			if (error) {
				console.log('There was an error with Twitter:', error);
			}
		})
	  }
	  // However, if our original search request had an error, print it out here
	  else {
	  	console.log('There was an error with your hashtag search:', error);
	  }
	});
}



// Tweet regular statuses with no user engagement
function tweet() {
    var tweetText;

    tweetText = "Okay cool!";
	
	if (debug) {
		console.log(tweetText);
	} else {
		T.post('statuses/update', {status: tweetText }, function(err, reply) {
			if (err != null) {
				console.log('Error: ', err);
			}
			else {
				console.log('Tweeted: ', tweetText);
			}
		});
	}
}

// Not a reply; Tweet at a user; Maybe good if I store users
// function tweetAtUser() {
// 	var rand = Math.random();
// 	console.log("Hashtag random: " + rand);


// 	T.get('search/tweets', capitalismSearch, function (error, data) {
// 		if (error) {
// 			console.log("ERROR: " + error);
// 		} else {
// 			console.log(data);
// 			var username = data.statuses[0].user.screen_name;
// 			console.log(username);
// 			var theText = data.statuses[0].text;
// 			console.log(theText);
// 			var message;
// 			if (username != "testingBot9") {
// 				message = "@" + username + " " + "responding test"
// 			} else {
// 				message = "responding test 2";
// 			}
// 			T.post('statuses/update', {status: message}, function (err, response) {
// 				if (err) {
// 					console.log(err);
// 				} else {
// 					console.log(message);
// 					console.log("Should have responded to a tweet with that hashtag");
// 				}
// 			})
// 		}
// 	});
// }





function runBot() {
	var rand = Math.random();

	console.log(rand);
	respondLatest();


	// if(rand >= .60) {
	// 	console.log("-------Tweet something");
	// 	tweet();
		
	// } else if (rand <= 0.60 && rand >= .40) {
	// 	console.log("-------Tweet something @someone who mentioned");
	// 	respondToMention();
		
	// } else {
	// 	console.log("-------Follow someone who @-mentioned");
	// 	followAMentioner();
	// }
}


runBot();
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
setInterval(runBot, 1000 * 5);
