// Shared data source for the authors dataset.
// Both DataViz.js (bubble chart) and RapBattle.js (dropdowns + bios) read from
// the same published Google Sheet, so we fetch and parse it once here and let
// both consumers await the same promise instead of issuing two requests with
// two different parsers.

const AUTHORS_CSV_URL = "https://docs.google.com/spreadsheets/d/1GrZpRGPTnwRBNhCDBusax9BpInPmfxkt6Y7HIGC_N-w/pub?gid=498870662&single=true&output=csv";

let authorsDataPromise = null;

function loadAuthorsData() {
    if (!authorsDataPromise) {
        // d3.csv parses by header name and handles quoted commas/newlines in
        // the bio text, so callers can read fields like row['mini bio']
        // instead of splitting the raw CSV by hand.
        authorsDataPromise = d3.csv(AUTHORS_CSV_URL).catch(error => {
            authorsDataPromise = null; // allow retry on next call
            throw error;
        });
    }
    return authorsDataPromise;
}
