// Our Twitter library
var Twit = require('twit');
var T = new Twit(require('./config.js'));

var debug = false; // if you don't want to post to Twitter, doesn't work with stream right now


var capitalismSearch;
var democracySearch;
var corruptSearch;



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



// Stream - Set current choice to a variable, to be used later
var streamCap = T.stream('statuses/filter', {track: 'hate capitalism, capitalism'});
streamCap.on('tweet', function (tweet) {
	capitalismSearch = tweet;
	console.log("capitalismSearch");

	respondLatest(capitalismSearch);
})
// Stream - Set current choice to a variable, to be used later
var streamPat = T.stream('statuses/filter', {track: 'hate democracy, democracy'});
streamPat.on('tweet', function (tweet) {
	patriotismSearch = tweet;
	console.log("democracyearch");

	respondLatest(democracySearch);
})
// Stream - Set current choice to a variable, to be used later
var streamCor = T.stream('statuses/filter', {track: '#corrupt'});
streamCor.on('tweet', function (tweet) {
	corruptSearch = tweet;
	console.log("corruptSearch");

	respondLatest(corruptSearch);
})



// Helper function for responding based on some criteria
function respond(data, name, nameID) {
	T.post('statuses/update', {in_reply_to_status_id: nameID, status: name + " " + data}, function(err, data, response) {
		if (response) {
			console.log('Success! The bot has responded to someone.')
		}
		if (err) {
			console.log('There was an error with Twitter:', err);
		}
	})
}


// Responds when called by stream
function respondLatest(chosenSearch) {
	// Partial responses to people, telling them why they lost points
	var respondText1 = "ATTENTION: You have lost 10 points for ";
	var respondText2 = ". Please check the website for current status / privileges.";
		
	// Choose a specific reason to deduct points	
	var reason;
	var rand = Math.random();

	//Doing a regex match here.
  	var regexp_retweet = new RegExp('^RT *','g');

  	if(chosenSearch.text.match(regexp_retweet)) {
  		var reason = "PROMOTING FALSE CRITISISM";
  		console.log("RETWEETED!!!!!!!");
  	} else if(rand >= .60) {
		var reason = "FALSE CRITISISM";
	} else if (rand <= 0.60 && rand >= .40) {
		var reason = "UNPATRIOTIC CONDUCT";
	} else {
		var reason = "DISTRUPTION OF PEACE";
	}
	// CONSPIRACY, DISORDERLY CONDUCT, DISRUPTION OF PEACE


  	console.log("Found a tweet! = " + chosenSearch.text);
  	// Limit only to United States?
  	if(chosenSearch.user.location != null) {
		console.log("LOCATION = " + chosenSearch.user.location);
  	}

  	var nameID = chosenSearch.id_str;
	var name = '@' + chosenSearch.user.screen_name;
	console.log(name);

	if (debug) {
		console.log(respondText1 + reason + respondText2);
	} else {
		// Respond to their tweet
		console.log(respondText1 + reason + respondText2);
		respond(respondText1 + reason + respondText2, name, nameID);
	}

}





// Finds the latest tweet with the hashtag, and retweets it
function retweetLatest() {

	//Choose a hashtag to search randomly, for variety
	var chosenSearch;
	var rand = Math.random();

	if(rand >= .50) {
		var chosenSearch = {q: "#patriotism", count: 1, result_type: "recent"};
		console.log("RETWEET = patriotism");
	} else {
		var chosenSearch = {q: "#ILoveAmerica", count: 1, result_type: "recent"};
		console.log("RETWEET = ILoveAmerica");
	}

	T.get('search/tweets', chosenSearch, function (error, data) {
	  // log out any errors and responses
	  console.log(error, data);
	  // If the search request to the server had no errors...
	  if (!error) {
		// ...then retweet it
		var retweetId = data.statuses[0].id_str;
		T.post('statuses/retweet/' + retweetId, { }, function (error, response) {
			if (response) {
				console.log('Success! The bot has retweeted something.')
			}
			// If there was an error with the Twitter call, print it out here
			if (error) {
				console.log('There was an error with Twitter:', error);
			}
		})
	  } else {
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

	// Refresh hashtag searches to keep them recent
	// capitalismSearch = {q: "#capitalism", count: 1, result_type: "recent"};
	// patriotismSearch = {q: "#patriotism", count: 1, result_type: "recent"};
	// corruptSearch = {q: "#corrupt", count: 1, result_type: "recent"};


	var rand = Math.random();

	console.log(rand);
	retweetLatest();


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
