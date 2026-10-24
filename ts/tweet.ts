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
            return "miscellaneous";
        }
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written(): boolean {
        return this.userText.length > 0;
    }

    // returns the user-written text or an empty string if there is no user-written text.
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

        let activity = this.removePrefix;

        // If the first word is a distance, skip it and its unit
        let firstSpace = activity.indexOf(" ");
        let afterNumber = activity.substring(firstSpace + 1);
        if (afterNumber.startsWith("km ") || afterNumber.startsWith("mi ")) {
            activity = afterNumber.substring(3);
        }

        // The activity ends at " with ", " - ", or " in " 
        let endings = [" with ", " - ", " in "];
        for (let i = 0; i < endings.length; i++) {
            let endIndex = activity.indexOf(endings[i]);
            if (endIndex !== -1) {
                activity = activity.substring(0, endIndex);
            }
        }

        return activity.trim().toLowerCase();
    }



    get distance(): number {
        if (this.source != 'completed_event') {
            return 0;
        }

        let rest = this.removePrefix;

        // The number is everything before the first space
        let firstSpace = rest.indexOf(" ");
        let number = parseFloat(rest.substring(0, firstSpace));
        let afterNumber = rest.substring(firstSpace + 1);

        // Convert km to miles
        if (afterNumber.startsWith("km ")) {
            return number / 1.609; // 1 mi = 1.609 km
        }
        if (afterNumber.startsWith("mi ")) {
            return number;
        }

        // No distance
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

        // User text in completed events is always after " - " (if there is any)
        let dashIndex = cleaned.indexOf(" - ");

        if (dashIndex === -1) {
            return "";
        }

        let afterDash = cleaned.substring(dashIndex + 3);
        return afterDash.trim();
    }


    // Returns the tweet without the first three words (useful for determining activity)
    private get removePrefix(): string {
        let rest = this.text;

        for (let i = 0; i < 3; i++) {
            let space = rest.indexOf(" ");
            rest = rest.substring(space + 1);
        }

        return rest;
    }



}