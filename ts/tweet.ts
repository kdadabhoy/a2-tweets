class Tweet {
    private text: string;
    time: Date;

    constructor(tweet_text: string, tweet_time: string) {
        this.text = tweet_text;
        this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
    }

    //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source(): string {
        // Completed identified with:
        // "Just completed..."
        // "Just posted..."

        // Live Event identified with:
        // "Watch my"

        // Achievement identified with:
        // "Achieved a..."
        // Misc identified with:
        // anything else

        if (this.text.startsWith("Just completed") || this.text.startsWith("Just posted")) {
            return "completed_event";
        }
        else if (this.text.startsWith("Watch my")) {
            return "live_event";
        }
        else if (this.text.startsWith("Achieved")) {
            return "achievement";
        }
        else {
            return "miscellaneous"
        }
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written(): boolean {
        return this.userText.length > 0;
    }

    get writtenText(): string {
        if (!this.written) {
            return "";
        }
        return this.userText;
    }

    get activityType(): string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        return "";
    }

    get distance(): number {
        if (this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }

    getHTMLTableRow(rowNumber: number): string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }




    // Helpers:

    // Removes links, #Runkeeper, and RunKeeper's default phrases from the tweet
    private get cleanedText(): string {
        let words = this.text.split(" ");

        // Removing any links and #runkeeper
        let keptWords = words.filter(function (word) {
            let isLink = word.startsWith("https://");
            let isHashtag = word.toLowerCase() === "#runkeeper";
            return !isLink && !isHashtag;
        });

        let cleaned = keptWords.join(" ");

        // Removing other default phrases
        cleaned = cleaned.replace("with @Runkeeper. Check it out!", "");
        cleaned = cleaned.replace("TomTom MySports Watch", "");

        return cleaned.trim();
    }


    // Returns the text the person wrote
    private get userText(): string {

        // Live events and achievements don't have user text
        if (this.source === "live_event" || this.source === "achievement") {
            return "";
        }

        let cleaned = this.cleanedText;

        // Misc tweets always have user text
        if (this.source === "miscellaneous") {
            return cleaned;
        }

        // User text in completed events is always after "-" (if there is any)
        let dashIndex = cleaned.indexOf(" - ");

        if (dashIndex === -1) {
            return "";
        }

        let afterDash = cleaned.substring(dashIndex + 3);
        return afterDash.trim();
    }



}