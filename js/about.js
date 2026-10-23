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

	var completed = tweet_array.filter(function(tweet){
		return tweet.source == 'completed_event';
	});
	
	// TODO: write a for loop to get all instances of this... maybe helper functions (bc [0] might not be good enough)
	document.getElementsByClassName('completedEvents')[0].innerText = completed.length;
	document.getElementsByClassName('completedEventsPct')[0].innerText = math.format(completed.length / tweet_array.length * 100, {notation: 'fixed', precision:2}) + '%';



	// -- End: Tweet Categories --



}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets); // This is returning a promise (a box with data)... then runs the function with what is inside the box... essentially parseTweets(RUNKEEPER_TWEETS) after it loads
});