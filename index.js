document.getElementById( 'cronForm' ).addEventListener( 'submit', function ( event ) {
    event.preventDefault();

    const cronInput = document.getElementById( 'cronInput' ).value;
    const occurrences = document.getElementById( 'occurrences' ).value;
    const resultDiv = document.getElementById( 'result' );
    const cronTableBody = document.getElementById( 'cronTable' ).getElementsByTagName( 'tbody' )[ 0 ];

    try {
        const parsedCron = parseCron( cronInput.trim() );
        cronTableBody.innerHTML = ''; // Clear previous results

        // Assuming parsedCron is an object with properties for each cron part
        Object.entries( parsedCron ).forEach( ( [ key, value ] ) => {
            const row = cronTableBody.insertRow();
            const cell1 = row.insertCell();
            const cell2 = row.insertCell();
            cell1.textContent = key;
            cell2.textContent = value;
        } );

        // Fetch and display the next occurrences
        let referenceDate = new Date();
        if ( document.getElementById( 'referenceDate' ).value ) {
            referenceDate = new Date( document.getElementById( 'referenceDate' ).value );
            referenceDate.setHours( 0, 0, 0, 0 );
        }
        const nextOccurrences = getNextOccurrences( cronInput, referenceDate, occurrences );
        nextOccurrences.forEach( ( occurrence, index ) => {
            const row = cronTableBody.insertRow();
            const cell1 = row.insertCell();
            const cell2 = row.insertCell();
            cell1.textContent = `Next occurrence ${ index + 1 }`;
            cell2.textContent = occurrence;
        } );
    } catch ( error ) {
        cronTableBody.innerHTML = '';
        showToast( 'Error parsing cron expression: ' + error.message );
    }
} );
function showToast ( message ) {
    const toast = document.createElement( 'div' );
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild( toast );

    setTimeout( () => {
        document.body.removeChild( toast );
    }, 5000 ); // Remove the toast after 3 seconds
}
