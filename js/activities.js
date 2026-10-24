function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function (tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// -- Activity frequency -- 

	// Only completed tweets have an activity type
	var completed = tweet_array.filter(function (tweet) {
		return tweet.source === 'completed_event';
	});

	// Counting tweets per each activity
	var counts = {};
	completed.forEach(function (tweet) {
		var type = tweet.activityType;

		// If this type hasn't been seen yet, start its count at 0
		if (counts[type] === undefined) {
			counts[type] = 0;
		}
		counts[type] = counts[type] + 1;
	});


	// Sorting
	var types = Object.keys(counts);
	types.sort(function (a, b) {
		var countA = counts[a];
		var countB = counts[b];

		if (countA > countB) {
			return -1;    // -1 means goes first in sort
		}

		if (countA < countB) {
			return 1;     // 1 means goes second in sort
		}

		return 0;         // 0 means doesn't matter
	});


	// Setting the top 3 Activities on the activities.html page
	var topThree = [types[0], types[1], types[2]];

	document.getElementById('numberActivities').innerText = types.length;
	document.getElementById('firstMost').innerText = topThree[0];
	document.getElementById('secondMost').innerText = topThree[1];
	document.getElementById('thirdMost').innerText = topThree[2];

	// -- End: Activity frequency --


	// -- Activity Longest/Shortest --

	// Average Distance Helper
	function averageDistance(type) {
		var specificType = completed.filter(function (tweet) {
			return tweet.activityType === type;
		});

		var total = 0;
		for (var i = 0; i < specificType.length; i++) {
			total = total + specificType[i].distance;
		}

		return total / specificType.length;
	}

	var byDistance = topThree.slice();

	byDistance.sort(function (a, b) {
		var averageA = averageDistance(a);
		var averageB = averageDistance(b);

		if (averageA > averageB) {
			return -1;    // -1 means goes first in sort
		}

		if (averageA < averageB) {
			return 1;     // 1 means goes second in sort
		}

		return 0;         // 0 means doesn't matter
	});

	document.getElementById('longestActivityType').innerText = byDistance[0];
	document.getElementById('shortestActivityType').innerText = byDistance[2];

	// -- End: Activity Longest/Shortest --

	// -- Weekday/Weekend --
	var weekendTotal = 0;
	var weekendCount = 0;
	var weekdayTotal = 0;
	var weekdayCount = 0;


	completed.forEach(function (tweet) {
		// skip activities outside the top three
		if (!topThree.includes(tweet.activityType)) {
			return;
		}


		var day = tweet.time.getDay();    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
		if (day === 0 || day === 6) {
			weekendTotal = weekendTotal + tweet.distance;
			weekendCount = weekendCount + 1;
		}
		else {
			weekdayTotal = weekdayTotal + tweet.distance;
			weekdayCount = weekdayCount + 1;
		}
	});


	var weekendAverage = weekendTotal / weekendCount;
	var weekdayAverage = weekdayTotal / weekdayCount;

	if (weekendAverage > weekdayAverage) {
		document.getElementById('weekdayOrWeekendLonger').innerText = 'weekends';
	}
	else {
		document.getElementById('weekdayOrWeekendLonger').innerText = 'weekdays';
	}
	// -- End: Weekday/Weekend --



	// -- Graphing Start --

	// -- Graph 1: Number of tweets per activity type -- 
	// One row per activity type, ex: {activityType: "run", count: 22}
	var typeCounts = [];
	for (var i = 0; i < types.length; i++) {
		var type = types[i];

		var row = {
			activityType: type,
			count: counts[type]
		};

		typeCounts.push(row);
	}


	activity_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "A graph of the number of Tweets containing each type of activity.",
		"data": {
			"values": typeCounts
		},
		"mark": "bar",
		"encoding": {
			"x": { "field": "activityType", "type": "nominal", "sort": "-y", "title": "Activity type" },
			"y": { "field": "count", "type": "quantitative", "title": "Number of tweets" }
		}
	};

	vegaEmbed('#activityVis', activity_vis_spec, { actions: false });

	// -- End: Graph 1 -- 

	// -- Graph 2: Day of Week v Distance (for top three) --
	var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // needed to convert getDay() to common abberviations

	// One row per top-three tweet, ex: {activityType: "run", distance: 3.02, day: "Sun"}
	var topThreeRows = [];
	for (var i = 0; i < completed.length; i++) {
		var tweet = completed[i];

		// Skip activities outside the top three
		if (!topThree.includes(tweet.activityType)) {
			continue;
		}

		var row = {
			activityType: tweet.activityType,
			distance: tweet.distance,
			day: DAYS[tweet.time.getDay()]
		};

		topThreeRows.push(row);
	}


	var distance_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Distances of the three most-tweeted activities by day of the week.",
		"data": {
			"values": topThreeRows
		},
		"mark": "point",
		"encoding": {
			"x": { "field": "day", "type": "ordinal", "sort": DAYS, "title": "Day of the week" },
			"y": { "field": "distance", "type": "quantitative", "title": "Distance (mi)" },
			"color": { "field": "activityType", "type": "nominal", "title": "Activity type" }
		}
	};

	vegaEmbed('#distanceVis', distance_vis_spec, { actions: false });

	// -- End: Graph 2 --


	// -- Graph 3: Day of Week v Mean Distance --
	var distance_vis_aggregated_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Mean distances of the three most-tweeted activities by day of the week.",
		"data": {
			"values": topThreeRows
		},
		"mark": "point",
		"encoding": {
			"x": { "field": "day", "type": "ordinal", "sort": DAYS, "title": "Day of the week" },
			"y": { "field": "distance", "type": "quantitative", "aggregate": "mean", "title": "Mean distance (mi)" },
			"color": { "field": "activityType", "type": "nominal", "title": "Activity type" }
		}
	};

	vegaEmbed('#distanceVisAggregated', distance_vis_aggregated_spec, { actions: false });

	// -- End: Graph 3 --


	// -- Button Logic (for switching between graph 2 and 3) --
	var button = document.getElementById('aggregate');
	var graphTwo = document.getElementById('distanceVis');
	var graphThree = document.getElementById('distanceVisAggregated');


	graphThree.style.display = 'none'; // graphThree hidden at first (graphTwo showing)

	button.addEventListener('click', function () {
		if (graphThree.style.display === 'none') {
			// Switch to graphThree
			graphThree.style.display = '';
			graphTwo.style.display = 'none';
			button.innerText = 'Show all activities';
		}
		else {
			// Switch back to graphTwo
			graphThree.style.display = 'none';
			graphTwo.style.display = '';
			button.innerText = 'Show means';
		}
	});

	// -- End: Button --

	// -- End: Graphing --








}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});