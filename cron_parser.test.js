const { parseCronField, parseCron, getNextOccurrence, getNextOccurrences } = require( './cron_parser.js' );

const referenceDate = new Date( 2024, 0, 1 );

describe( 'parsing cron field', () => {
    test( 'should throw error for invalid field syntax with multiple slashes', () => {
        expect( () => parseCronField( '1/2/3', 0, 59 ) ).toThrow();
    } );

    test( 'should throw error for invalid field syntax with invalid step', () => {
        expect( () => parseCronField( '1/A', 0, 59 ) ).toThrow();
    } );

    test( 'should throw error for invalid field syntax when slash is present but step is absent', () => {
        expect( () => parseCronField( '*/', 0, 59 ) ).toThrow();
    } );

    test( 'should throw error for invalid field syntax with multiple dashes', () => {
        expect( () => parseCronField( '1-2-3', 0, 59 ) ).toThrow();
    } );

    test( 'should throw error for invalid field syntax with invalid range', () => {
        expect( () => parseCronField( '1-A', 0, 59 ) ).toThrow();
    } );

    test( 'should throw error for invalid field syntax with invalid start', () => {
        expect( () => parseCronField( 'A/2', 0, 59 ) ).toThrow();
    } );

    test( 'should throw error for invalid field syntax with invalid range when start greater than end', () => {
        expect( () => parseCronField( '10-1', 0, 59 ) ).toThrow();
    } );

    test( 'should throw error for invalid field syntax when the range is greater than max', () => {
        expect( () => parseCronField( '50-60', 0, 59 ) ).toThrow();
    } );

    test( 'should handle number/step values', () => {
        const values = parseCronField( '3/2', 0, 6 );
        expect( values ).toEqual( [ 3, 5 ] );
    } );

    test( 'should handle step values', () => {
        const values = parseCronField( '1-5/2', 0, 59 );
        expect( values ).toEqual( [ 1, 3, 5 ] );
    } );

    test( 'should handle range values', () => {
        const values = parseCronField( '1-5', 0, 59 );
        expect( values ).toEqual( [ 1, 2, 3, 4, 5 ] );
    } );

    test( 'should handle wildcard values', () => {
        const values = parseCronField( '*', 0, 59 );
        expect( values ).toEqual( [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59 ] );
    } );

    test( 'should handle single values', () => {
        const values = parseCronField( '1', 0, 59 );
        expect( values ).toEqual( [ 1 ] );
    } );
} );

describe( 'Cron Parser', () => {
    test( 'should parse a simple cron expression', () => {
        const cronString = '30 9 1-10/5,3-12/3 2 *';
        const result = parseCron( cronString );
        expect( result ).toEqual( {
            minutes: [ 30 ],
            hours: [ 9 ],
            days: [ 1, 3, 6, 9, 12 ],
            months: [ 2 ],
            weekdays: [ 0, 1, 2, 3, 4, 5, 6 ]
        } );
    } );

    test( 'should throw error for invalid cron expression', () => {
        expect( () => parseCron( 'invalid cron' ) ).toThrow();
    } );

    test( 'should handle minimum and maximum values', () => {
        const cronString = '0 0 1 1 0'; // Minimum values
        const parsed = parseCron( cronString );
        expect( parsed.minutes ).toEqual( [ 0 ] );
        expect( parsed.hours ).toEqual( [ 0 ] );
        expect( parsed.days ).toEqual( [ 1 ] );
        expect( parsed.months ).toEqual( [ 1 ] );
        expect( parsed.weekdays ).toEqual( [ 0 ] ); // Sunday
    } );

    test( 'should handle complex cron expressions', () => {
        const cronString = '30 9 1-10/5,3-12/3 2 *'; // Complex expression
        const parsed = parseCron( cronString );
        expect( parsed.minutes ).toEqual( [ 30 ] );
        expect( parsed.hours ).toEqual( [ 9 ] );
        expect( parsed.days ).toEqual( [ 1, 3, 6, 9, 12 ] );
        expect( parsed.months ).toEqual( [ 2 ] );
        expect( parsed.weekdays ).toEqual( [ 0, 1, 2, 3, 4, 5, 6 ] ); // All weekdays
    } );

} );

describe( 'getNextOccurrence', () => {
    test( 'should throw error for invalid cron expression for next occurrence', () => {
        expect( () => getNextOccurrence( 'invalid cron' ) ).toThrow();
    } );

    test( 'should increment year when month overflows', () => {
        const cronString = '0 0 1 12 *';
        const nextOccurrence = getNextOccurrence( cronString, referenceDate );
        expect( nextOccurrence.getFullYear() ).toBe( 2024 );
        expect( nextOccurrence.getMonth() ).toBe( 11 );
        expect( nextOccurrence.getDate() ).toBe( 1 );
    } );

    test( 'should increment month when day overflows', () => {
        const cronString = '0 0 31 1 *';
        const nextOccurrence = getNextOccurrence( cronString, new Date( 2024, 1, 1 ) );
        expect( nextOccurrence.getFullYear() ).toBe( 2025 );
        expect( nextOccurrence.getMonth() ).toBe( 0 );
        expect( nextOccurrence.getDate() ).toBe( 31 );
    } );

    test( 'should increment day when hour overflows', () => {
        const cronString = '0 0 15 1 *';
        const nextOccurrence = getNextOccurrence( cronString, new Date( 2024, 1, 16 ) );
        expect( nextOccurrence.getFullYear() ).toBe( 2025 );
        expect( nextOccurrence.getMonth() ).toBe( 0 );
        expect( nextOccurrence.getDate() ).toBe( 15 );
    } );

    test( 'should increment hour when minute overflows', () => {
        const cronString = '30 5 15 1 *';
        const nextOccurrence = getNextOccurrence( cronString, new Date( 2024, 1, 15, 6, 30 ) );
        expect( nextOccurrence.getFullYear() ).toBe( 2025 );
        expect( nextOccurrence.getMonth() ).toBe( 0 );
        expect( nextOccurrence.getDate() ).toBe( 15 );
        expect( nextOccurrence.getHours() ).toBe( 5 );
        expect( nextOccurrence.getMinutes() ).toBe( 30 );
    } );

    test( 'should increment hour and adjust day when next hour is not found', () => {
        const cronString = '0 4-15 * * *'; // Last hour of the day
        const referenceDate = new Date( 2024, 0, 1, 23, 1 );
        const nextOccurrence = getNextOccurrence( cronString, referenceDate );
        expect( nextOccurrence.getFullYear() ).toBe( 2024 );
        expect( nextOccurrence.getMonth() ).toBe( 0 ); // January
        expect( nextOccurrence.getDate() ).toBe( 2 ); // Next day
        expect( nextOccurrence.getHours() ).toBe( 4 ); // Next hour
        expect( nextOccurrence.getMinutes() ).toBe( 0 ); // Next minute

    } );
} );

describe( 'Getting next occurrences', () => {

    test( 'should calculate the next occurrences for a given cron expression', () => {
        const cronString = '10-30 5-18 1-10/5,3-12/3 2 *';
        const nextOccurrences = getNextOccurrences( cronString, referenceDate );
        expect( nextOccurrences.length ).toBeGreaterThan( 0 );
    } );

    test( 'should handle leap years', () => {
        const cronString = '0 0 29 2 *'; // February 29th
        const nextOccurrences = getNextOccurrences( cronString, referenceDate );
        expect( nextOccurrences ).toContain( '2/29/2024, 12:00:00 AM' );
    } );

    test( 'should handle day of month and weekday conflicts', () => {
        const cronString = '0 0 1 * 1'; // First day of the month and Monday
        const nextOccurrences = getNextOccurrences( cronString, referenceDate );
        expect( nextOccurrences ).toContain( '4/1/2024, 12:00:00 AM' );
    } );

    test( 'should handle the next occurrences only on leap year', () => {
        const cronString = '30 9 29 2 *';
        const nextOccurrences = getNextOccurrences( cronString, referenceDate );
        expect( nextOccurrences ).toContain( '2/29/2028, 9:30:00 AM' );
    } );

    test( 'should return empty array when invalid cron is given', () => {
        const cronString = '30 9 30 2 *'; // impossible date
        const nextOccurrences = getNextOccurrences( cronString, referenceDate, 1 );
        expect( nextOccurrences ).toEqual( [] );
    } );

    test( 'should throw error for invalid cron expression for next occurrence', () => {
        const cronString = '30 9 30 2'; // impossible cron
        const nextOccurrences = getNextOccurrences( cronString );
        expect( nextOccurrences ).toEqual( [] );
    } );
} );
