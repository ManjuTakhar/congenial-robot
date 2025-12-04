/**
 * Parses a cron expression into its components (minutes, hours, days, months, weekdays).
 * @param {string} cronString - The cron expression to parse.
 * @returns {Object} An object with the parsed components.
 * @throws {Error} If the cron expression is invalid or cannot be parsed.
 */
function parseCron ( cronString ) {
    const minuteValues = [];
    const hourValues = [];
    const dayValues = [];
    const monthValues = [];
    const weekdayValues = [];
    let command = '';
    try {
        const splits = cronString.split( ' ' );
        if ( !( splits.length == 6 || splits.length == 5 ) ) {
            throw new Error( `Invalid cron expression: ${ cronString }. Expected format: minutes hours days months weekdays command[optional]` );
        }
        // Split the cron string into its components using spaces as delimiters.
        const [ minutes, hours, days, months, weekdays, comm ] = splits;
        // Parse each component using the parseCronField function.
        minuteValues.push( ...parseCronField( minutes, 0, 59 ) );
        hourValues.push( ...parseCronField( hours, 0, 23 ) );
        dayValues.push( ...parseCronField( days, 1, 31 ) );
        monthValues.push( ...parseCronField( months, 1, 12 ) );
        weekdayValues.push( ...parseCronField( weekdays, 1, 7 ) );
        command = comm;

        // Return an object with the parsed components.
    } catch ( err ) {
        // console.error( `Error parsing cron expression: . Error: ${ err.message }` );
        throw err;
    }
    return {
        minutes: minuteValues,
        hours: hourValues,
        days: dayValues,
        months: monthValues,
        weekdays: weekdayValues,
        command: command
    };
}

/**
 * Parses a single field of a cron expression into an array of unique values.
 * This function handles various cron field syntaxes including ranges, steps, and wildcards.
 * @param {string} field - The field value from the cron expression. This can be a single number, a range (e.g.,  1-5), a step (e.g.,  2-10/5), or a combination of these.
 * @param {number} min - The minimum allowed value for the field. This is used to validate the parsed values.
 * @param {number} max - The maximum allowed value for the field. This is used to validate the parsed values.
 * @returns {Array} An array of unique values for the field, sorted in ascending order.
 * @throws {Error} If the field syntax is invalid or cannot be parsed.
 */
function parseCronField ( field, min, max ) {
    const values = new Set();
    const parts = field.split( ',' );
    // iterate over each comma separated part to parse its value(s)
    for ( const part of parts ) {
        let start, end;
        // check if the part includes a valid slash, indicating a step value
        const splits = part.split( '/' );
        if ( splits.length > 2 ) {
            throw new Error( `Invalid cron field syntax: ${ field }. A field cannot have more than one slash.` );
        }
        const hasSlash = splits.length == 2;
        // Split into range and step if a slash is present
        let [ range, step ] = splits;
        if ( step && hasSlash ) {
            if ( isNaN( Number( step ) ) ) {
                throw new Error( `Invalid step value in the part: ${ step }. Step must be a number.` );
            }
            step = Number( step );
        } else if ( !step && hasSlash ) {
            throw new Error( `Invalid step value in the part: ${ part }. Step must be provided when using a slash.` );
        } else {
            // if no step is provided, default to  1
            step = 1;
        }
        if ( range.includes( '-' ) ) {
            if ( range.split( '-' ).length > 2 ) {
                throw new Error( `Invalid range syntax in the part: ${ part }. A range cannot have more than one dash.` );
            }
            [ start, end ] = range.split( '-' ).map( Number );
            if ( isNaN( start ) || isNaN( end ) ) {
                throw new Error( `Invalid range in the part: ${ part }. Range values must be numbers.` );
            }
            if ( start > end ) {
                throw new Error( `Invalid range window in the part: ${ part }. Start must be less than or equal to end.` );
            }
        } else if ( range == "*" ) {
            // if the range is "*", set start and end to the min and max values
            start = min;
            end = max - 1;
        } else if ( isNaN( Number( range ) ) ) {
            throw new Error( `Invalid syntax in the part: ${ part }. Range must be a number or a valid range.` );
        } else {
            if ( hasSlash ) {
                // if the part has a slash like 3/2. then the count starts from 3 with step as 2
                start = Number( range );
                end = max;
            } else {
                // if the part does not include a slash, it's a single value or a range without a step
                start = end = Number( range );
            }
        }
        // validate the start and end values against the min and max
        if ( start > max || end > max || start < min || end < min || start > end ) {
            throw new Error( `Invalid syntax in the part: ${ part }. Values must be within the allowed range: ${ min }-${ max }` );
        }
        // Add each value in the range to the set, incrementing by the step
        for ( let i = start; i <= end; i += step ) {
            values.add( i );
        }
    }

    // return an array of the unique, sorted values in ascending order.
    return Array.from( values ).sort( ( a, b ) => a - b );
}

/**
 * Calculates the next occurrence date based on a cron expression and an optional reference date.
 * If no reference date is provided, the current date and time is used.
 * @param {string} cronString - The cron expression to parse.
 * @param {Date} [referenceDate] - The reference date to calculate the next occurrence from.
 * @returns {Date} The next occurrence date based on the cron expression.
 */
function getNextOccurrence ( cronString, referenceDate = new Date() ) {
    const cronElements = parseCron( cronString );
    let year = referenceDate.getFullYear();
    const baseYear = year;
    let month = referenceDate.getMonth() + 1;
    let day = referenceDate.getDate();
    let hour = referenceDate.getHours();
    let minute = referenceDate.getMinutes();

    const getCurrentReferenceDate = () => {
        const currRef = new Date( year, month - 1, day, hour, minute );
        // console.log( currRef.toLocaleString() );
        return currRef;
    };

    // Helper function to check if a value is in the cron elements array
    const isInCronElements = ( value, cronElements ) => cronElements.includes( value );

    // Helper function to increment the month and adjust the year if necessary
    const incrementMonth = () => {
        let nextMonthIndex = cronElements.months.findIndex( m => m == month );
        if ( nextMonthIndex !== -1 ) {
            month = cronElements.months[ nextMonthIndex + 1 ];
            if ( month === undefined ) {
                month = cronElements.months[ 0 ];
                year++;
            }
        } else {
            nextMonthIndex = cronElements.months.findIndex( m => m > month );
            if ( nextMonthIndex !== -1 ) {
                month = cronElements.months[ nextMonthIndex ];
            } else {
                month = cronElements.months[ 0 ];
                year++;
            }
        }
    };


    // Helper function to increment the day and adjust the month if necessary
    const incrementDay = () => {
        // Logic to handle leap month days and months with lesser days.
        const maxDay = new Date( year, month, 0 ).getDate();
        const allowedDays = cronElements.days.filter( x => x <= maxDay );
        if ( !allowedDays.length ) {
            incrementMonth();
            return;
        }
        let nextDayIndex = allowedDays.findIndex( d => d == day );
        if ( nextDayIndex !== -1 ) {
            day = allowedDays[ nextDayIndex + 1 ];
            if ( day === undefined ) {
                day = allowedDays[ 0 ];
                incrementMonth();
            }
        } else {
            nextDayIndex = allowedDays.findIndex( d => d > day );
            if ( nextDayIndex !== -1 ) {
                day = allowedDays[ nextDayIndex ];
            } else {
                day = allowedDays[ 0 ];
                incrementMonth();
            }
        }

    };

    // Helper function to increment the hour and adjust the day if necessary
    const incrementHour = () => {
        let nextHourIndex = cronElements.hours.findIndex( h => h == hour );
        if ( nextHourIndex !== -1 ) {
            hour = cronElements.hours[ nextHourIndex + 1 ];
            if ( hour === undefined ) {
                hour = cronElements.hours[ 0 ];
                incrementDay();
            }
        } else {
            nextHourIndex = cronElements.hours.findIndex( h => h > hour );
            if ( nextHourIndex !== -1 ) {
                hour = cronElements.hours[ nextHourIndex ];
            } else {
                hour = cronElements.hours[ 0 ];
                incrementDay();
            }
        }
    };

    // Helper function to increment the minute and adjust the hour if necessary
    const incrementMinute = () => {
        // Find the next minute in the cronElements.minutes array that is equal to the current minute
        let nextMinuteIndex = cronElements.minutes.findIndex( m => m == minute );
        if ( nextMinuteIndex !== -1 ) {
            // If a next minute is found, set the minute to that value
            minute = cronElements.minutes[ nextMinuteIndex + 1 ];
            if ( minute === undefined ) {
                minute = cronElements.minutes[ 0 ];
                incrementHour();
            }
        } else {
            // If the current minute is not in the array, then find the minute that is greater than the current minute
            nextMinuteIndex = cronElements.minutes.findIndex( m => m > minute );
            if ( nextMinuteIndex !== -1 ) {
                // If a next minute is found, set the minute to that value
                minute = cronElements.minutes[ nextMinuteIndex ];
            } else {
                minute = cronElements.minutes[ 0 ];
                incrementHour();
            }
        }
    };

    const validateDayAndWeekDayOfTheDate = () => {
        const isValidDay = isInCronElements( day, cronElements.days );
        const isValidWeekDay = isInCronElements( getCurrentReferenceDate().getDay(), cronElements.weekdays );
        const maxDay = new Date( year, month, 0 ).getDate();

        return ( isValidDay || isValidWeekDay ) && day <= maxDay;
    };

    // Main loop to find the next occurrence
    while ( true ) {
        // Check if the current minute is in the cron elements
        if ( isInCronElements( minute, cronElements.minutes ) ) {
            // Check if the current hour is in the cron elements
            if ( isInCronElements( hour, cronElements.hours ) ) {
                // Check if the current day of the month is in the cron elements or  if the current day of the week is in the cron elements
                if ( validateDayAndWeekDayOfTheDate() ) {
                    // Check if the current month is in the cron elements
                    if ( isInCronElements( month, cronElements.months ) ) {
                        return new Date( year, month - 1, day, hour, minute );
                    }
                }
            }
        }

        // Increment the minute and adjust the hour, day, month, and year as necessary
        incrementMinute();

        // 11 years is the repetition cycle of a calender, if we are not able to find an instance in 11 years then the date might never come.
        if ( year - baseYear >= 11 ) {
            throw new Error( `Unable to find occurrences in 11 years of the given cron: ${ cronString }` );
        }
    }
}

/**
 * Calculates the next n occurrences of a cron expression based on a reference date.
 * If no reference date is provided, the current date and time is used.
 * @param {string} cronString - The cron expression to parse.
 * @param {Date} [referenceDate=new Date()] - The reference date to calculate the next occurrences from.
 * @param {number} [n=5] - The number of occurrences to calculate.
 * @returns {Array<string>} An array of strings representing the next n occurrences in the format "MM/DD/YYYY, HH:MM:SS".
 * @throws {Error} If the cron expression is invalid or cannot be parsed, or if no occurrences can be found within 11 years.
 */
function getNextOccurrences ( cronString, referenceDate = new Date(), n = 5 ) {
    const occurrences = [];
    while ( n-- ) {
        try {
            referenceDate = getNextOccurrence( cronString, referenceDate );
            occurrences.push( referenceDate.toLocaleString() );
            referenceDate = new Date( referenceDate.setMinutes( referenceDate.getMinutes() + 1 ) );
        } catch ( err ) {
            // console.error( err );
        }
    }
    return occurrences;
}


module.exports = {
    parseCron,
    parseCronField,
    getNextOccurrence,
    getNextOccurrences
};
