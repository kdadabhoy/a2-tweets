function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	


	// -- Earliest/Latest Tweet --
		// Idea is to convert all dates to a numbers and get max and min):

	// Creates an array of times (time, in ms, since Jan 1, 1970, 0:00:00.000 GMT) for each tweet
	var times = tweet_array.map(function(tweet) {
		return tweet.time.getTime();
	});

	var earliestTweet = new Date(Math.min(...times));
	var latestTweet = new Date(Math.max(...times));

	var dateOptions = {
		weekday: 'long', 
		year: 'numeric', 
		month: 'long', 
		day: 'numeric'
	};

	document.getElementById('firstDate').innerText = earliestTweet.toLocaleDateString('en-US', dateOptions);
	document.getElementById('lastDate').innerText = latestTweet.toLocaleDateString('en-US', dateOptions);

	// -- End: Earliest/Latest Tweet -- 

	// -- Tweet Categories --

	// Helpers:
	function setSpans(className, value) {
		var spans = document.getElementsByClassName(className);
		for (var i = 0; i < spans.length; i++) {
			spans[i].innerText = value;
		}
	}

	function formatPercentage(numerator, denominator) {
		return math.format(numerator / denominator * 100, {notation: 'fixed', precision:2}) + '%';
	}

	// End Helpers


	var completed = tweet_array.filter(function(tweet) { 
		return tweet.source === 'completed_event'; 
	});

	var live = tweet_array.filter(function(tweet) { 
		return tweet.source === 'live_event'; 
	});
	
	var achievements = tweet_array.filter(function(tweet) { 
		return tweet.source === 'achievement'; 
	});

	var miscellaneous = tweet_array.filter(function(tweet) { 
		return tweet.source === 'miscellaneous'; 
	});

	setSpans('completedEvents', completed.length);
	setSpans('completedEventsPct', formatPercentage(completed.length, tweet_array.length));
	setSpans('liveEvents', live.length);
	setSpans('liveEventsPct', formatPercentage(live.length, tweet_array.length));
	setSpans('achievements', achievements.length);
	setSpans('achievementsPct', formatPercentage(achievements.length, tweet_array.length));
	setSpans('miscellaneous', miscellaneous.length);
	setSpans('miscellaneousPct', formatPercentage(miscellaneous.length, tweet_array.length));

	// -- End: Tweet Categories --



	// -- User-written Tweets --
	var writtenCompleted = completed.filter(function(tweet) {
		return tweet.written;
	});

	setSpans('written', writtenCompleted.length);
	setSpans('writtenPct', formatPercentage(writtenCompleted.length, completed.length));


	// -- End: User-written Tweets --


}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets); // This is returning a promise (a box with data)... then runs the function with what is inside the box... essentially parseTweets(RUNKEEPER_TWEETS) after it loads
});