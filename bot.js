// Our Twitter library
var Twit = require('twit');
var T = new Twit(require('./config.js'));

var debug = false; // if you don't want to post to Twitter, doesn't work with stream right now

var capitalismSearch;
var democracySearch;
var corruptSearch;

var timeToTweet1 = true; // true it haven't tweeted too recently, one for each topic
var timeToTweet2 = true;
var timeToTweet3 = true;

// filters for stream searchs; commas act as logical OR ; space acts as logical AND (order doesnt matter)
var capTrack = 'hate capitalism, capitalism ruining, capitalism sucks, capitalism broken, capitalism';
var demTrack = 'hate democracy, democracy is broken, failure of democracy, democracy joke, facist america, I burned a US flag';

// pre-written tweets for bot to post
var tweets = ["Congratulations to our Patriot Partner™ rewards members! Keep up the great work that makes our nation thrive!",
				"Land of the free, home of the brave!",
				"Remember to check in at select retailers to gain bonus Patriot Points!",
				"Lower interest rates, higher application approval, priority jobs; Being a Patriot pays!",
				"Remember: citizens with 825+ points can apply for moderator privileges. Help your neighbors stay on track!",
				"Remember: Patronage to Patriot Partner™ businesses helps your score improve.",
				"Remember: Your score can affect your friends' and neighbors' scores. Be mindful :)",
				"Scores in the 800+ range can get you special visas, lower airfare, and more convenient flying; Being a Patriot pays!",
				"Check your score or you neighbor's score any time online.",
				"Moderate to high Patriot Scores (700+) may increase your chances of landing a job! Employers gain special incentives for hiring Patriots.",
				"While your Patriot Score may look like a credit score, it is not directly related. However, your credit rating may be factored in.",
				"Have a lower score than you like? Members of your social circles may be influencing your score. Check your account for details.",
				"Patriot Scores range from 300 to 850. How much of a Patriot are you?"
				]
var tweetIndex = 0; // current index of the aboe tweet array; will tweet each before repeating



// Stream - Replies to users who tweet @ me
var streamReply = T.stream('statuses/filter', {track: '@PatriotPointUSA'});
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
var stream1 = T.stream('statuses/filter', {track: capTrack});
stream1.on('tweet', function (tweet) {
	capitalismSearch = tweet;
	console.log("capitalismSearch");

	if(timeToTweet1) {
		respondLatest(capitalismSearch);
		timeToTweet1 = false; // wait before tweeting on this topic again, reset in runBot()
	}
})
// Stream - Set current choice to a variable, to be used later
var stream2 = T.stream('statuses/filter', {track: demTrack});
stream2.on('tweet', function (tweet) {
	democracySearch = tweet;
	console.log("democracySearch");

	if(timeToTweet2) {
		respondLatest(democracySearch);
		timeToTweet2 = false; // wait before tweeting on this topic again, reset in runBot()
	}
})
// Stream - Set current choice to a variable, to be used later
var stream3 = T.stream('statuses/filter', {track: '#corrupt'});
stream3.on('tweet', function (tweet) {
	corruptSearch = tweet;
	console.log("corruptSearch");

	if(timeToTweet3) {
		respondLatest(corruptSearch);
		timeToTweet3 = false; // wait before tweeting on this topic again, reset in runBot()
	}
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
	var respondText1 = "ATTENTION: You have lost "
	var respondText2 = " points for ";
	var respondText3 = ". Please check the website for current status / privileges.";
	
	// Choose points value (min inclusive and max exclusive)
	var points = getRandomInt(5,16);

	// Choose a specific reason to deduct points, semi-randomly unless a retweet	
	var reason;
	var rand = Math.random();

	//Doing a regex match here for retweets
  	var regexp_retweet = new RegExp('^RT *','g');

  	if(chosenSearch != undefined) { // prevents script from crashing when getting an undefined tweet

	  	if(chosenSearch.text.match(regexp_retweet)) {
	  		var reason = "PROMOTING FALSE CRITICISM";
	  		console.log("RETWEETED!!!!!!!");
	  	} else if(rand >= .60) {
			var reason = "FALSE CRITISISM";
		} else if (rand <= 0.60 && rand >= .40) {
			var reason = "UNPATRIOTIC CONDUCT";
		} else {
			var reason = "DISTRUPTION OF PEACE";
		}
		// CONSPIRACY, DISORDERLY CONDUCT, DISRUPTION OF PEACE


		var fullResponse = respondText1 + points + respondText2 + reason + respondText3;

	  	console.log("Found a tweet! = " + chosenSearch.text);
	  	// Limit only to United States?
	  	if(chosenSearch.user.location != null) {
			console.log("LOCATION = " + chosenSearch.user.location);
	  	}

	  	var nameID = chosenSearch.id_str;
		var name = '@' + chosenSearch.user.screen_name;
		console.log(name);


		if (debug) {
			console.log(fullResponse);
		} else {
			// Respond to their tweet
			console.log(fullResponse);
			respond(fullResponse, name, nameID);
		}

	} else {
		console.log("!!!!! ERROR: chosenSearch is undefined");
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

		if(data.statuses[0] != undefined) {  // prevents script from crashing when getting an undefined tweet

		  console.log(data.statuses[0].text);
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
					// console.log('There was an error with Twitter:', error);
					console.log('There was an error, probably already retweeted');
				}
			})
		  } else {
		  	console.log('There was an error with your hashtag search:', error);
		  }

		} else {
			console.log("!!!!! ERROR: retweet status is undefined");
		}


	});
}


// Tweet regular statuses
function tweet() {

    var tweetText = tweets[tweetIndex]; // set text to the next prewritten tweet from the array
    if(tweetIndex == (tweets.length - 1) ) {
    	tweetIndex = 0; // reset if needed
	} else {
		tweetIndex++;
	}
    

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


// Returns a random integer between min (included) and max (excluded), for points
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}


function runBot() {

	console.log("----- 00000000000000000000000000000000 -----"); // for console log legibility

	var rand = Math.random();
	// 50/50 chance of tweeting premade string or retweeting something semi-random
	if(rand >= .50) {
		tweet();
	} else {
		retweetLatest();
	}

	timeToTweet1 = true;
	timeToTweet2 = true;
	timeToTweet3 = true;
}


runBot();
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
setInterval(runBot, 1000 * 10);
