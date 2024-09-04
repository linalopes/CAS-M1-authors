// Function to load the CSV file and populate the dropdowns
let authorData = {};

function loadAuthors() {
    const googleSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1GrZpRGPTnwRBNhCDBusax9BpInPmfxkt6Y7HIGC_N-w/pub?gid=498870662&single=true&output=csv';

    fetch(googleSpreadsheetUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            const rows = data.split('\n').slice(1);  // Skip the header row
            const author1Select = document.getElementById('author1');
            const author2Select = document.getElementById('author2');

            rows.forEach(row => {
                const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);  // Split row respecting commas inside quotes
                const author = columns[0]?.trim();  // First column: Author name
                const notableWork = columns[1]?.trim();  // Second column: Notable Work
                const miniBio = columns[9]?.trim();  // Tenth column: Mini Bio

                if (author) {
                    // Store the data in a dictionary
                    authorData[author] = {
                        notableWork: notableWork || "No notable work available",
                        miniBio: miniBio || "No bio available"
                    };

                    // Add options to both select elements
                    let option1 = document.createElement('option');
                    option1.text = author;
                    option1.value = author;
                    author1Select.add(option1);

                    let option2 = document.createElement('option');
                    option2.text = author;
                    option2.value = author;
                    author2Select.add(option2);
                }
            });
        })
        .catch(error => {
            console.error('Error loading authors:', error);
            const resultDiv = document.getElementById('rapBattleResult');
            resultDiv.textContent = 'Failed to load authors data. Please check your internet connection or try again later.';
        });
}

// Function to update selected authors' information
function updateAuthorInfo() {
    const author1 = document.getElementById('author1').value;
    const author2 = document.getElementById('author2').value;

    const author1BioElement = document.getElementById('author1-bio');
    const author2BioElement = document.getElementById('author2-bio');

    const author1InfoTitle = document.querySelector('#author1-info h3');
    const author2InfoTitle = document.querySelector('#author2-info h3');

    // Update the bio of Author 1
    if (author1 && authorData[author1]) {
        const author1Bio = authorData[author1].miniBio || "No bio available.";
        author1BioElement.textContent = author1Bio;
        author1InfoTitle.style.display = "none"; // Hide the title when bio is loaded
    } else {
        author1BioElement.textContent = "Select an author to see their bio.";
        author1InfoTitle.style.display = "block"; // Show the title if no bio is loaded
    }

    // Update the bio of Author 2
    if (author2 && authorData[author2]) {
        const author2Bio = authorData[author2].miniBio || "No bio available.";
        author2BioElement.textContent = author2Bio;
        author2InfoTitle.style.display = "none"; // Hide the title when bio is loaded
    } else {
        author2BioElement.textContent = "Select an author to see their bio.";
        author2InfoTitle.style.display = "block"; // Show the title if no bio is loaded
    }
}

// Add event listener to update bios when an author is selected
document.getElementById('author1').addEventListener('change', updateAuthorInfo);
document.getElementById('author2').addEventListener('change', updateAuthorInfo);

// Load authors when the page loads
window.onload = function() {
    loadAuthors(); // Load the authors from Google Spreadsheet
    updateAuthorInfo(); // Update the bios on page load
};
