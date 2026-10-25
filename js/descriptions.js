
var written_tweets = []; // shared by parseTweets and search


function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	var tweet_array = runkeeper_tweets.map(function (tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Only search tweets with user-written text
	written_tweets = tweet_array.filter(function (tweet) {
		return tweet.written;
	});
}

function addEventHandlerForSearch() {
	// Run the search after every change to the search box
	document.getElementById('textFilter').addEventListener('input', updateSearch);

	// Replace the ??? right away (empty box → count 0, no rows)
	updateSearch();
}


// Updates the search text, the count, and the table to match the search box
function updateSearch() {
	var searchText = document.getElementById('textFilter').value;
	document.getElementById('searchText').innerText = searchText;

	var table = document.getElementById('tweetTable');

	// Empty search box: no results, empty table
	if (searchText === '') {
		document.getElementById('searchCount').innerText = 0;
		table.innerHTML = '';
		return;
	}

	// Find written tweets containing the search text (ignoring capitals)
	var query = searchText.toLowerCase();
	var matches = written_tweets.filter(function (tweet) {
		return tweet.writtenText.toLowerCase().includes(query);
	});

	document.getElementById('searchCount').innerText = matches.length;

	// Build all the rows as one string, then put them in the table once
	var rows = '';
	for (var i = 0; i < matches.length; i++) {
		rows = rows + matches[i].getHTMLTableRow(i + 1);
	}
	table.innerHTML = rows;
}


//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});