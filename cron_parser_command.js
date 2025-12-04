const { parseCron } = require( './cron_parser.js' );

if ( process.argv.length < 3 ) {

    console.error( 'Please provide a cron string as a command line argument.' );
    process.exit( 1 );

} else {
    const cronStringCommand = process.argv[ 2 ];
    console.log( parseCron( cronStringCommand ) );
}
