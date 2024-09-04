// Function to load the CSV file and populate the dropdowns
let authorData = {};

function loadAuthors() {
    const googleSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1GrZpRGPTnwRBNhCDBusax9BpInPmfxkt6Y7HIGC_N-w/pub?gid=498870662&single=true&output=csv';

    fetch(googleSpreadsheetUrl)
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n').slice(1);  // Skip the header row
            const author1Select = document.getElementById('author1');
            const author2Select = document.getElementById('author2');

            rows.forEach(row => {
                const columns = row.split(',');  // Split row into columns
                const author = columns[0].trim();  // First column: Author name
                const notableWork = columns[1]?.trim();  // Second column: Notable Work
                const otherWorks = columns[4]?.trim();  // Fifth column: Books, Papers, Artwork

                if (author) {
                    // Store the data in a dictionary
                    authorData[author] = {
                        notableWork: notableWork || "No notable work available",
                        otherWorks: otherWorks || "No additional works available"
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
        .catch(error => console.error('Error loading authors:', error));
}

// Function to validate selected authors
function validateAuthors(author1, author2) {
    if (!author1 || !author2) {
        return false;  // Invalid selection
    }
    if (!authorData[author1] || !authorData[author2]) {
        return false;  // Author data not found
    }
    return true;  // Valid selection
}

// Function to show loading indicator
function showLoadingIndicator() {
    const resultDiv = document.getElementById('rapBattleResult');
    resultDiv.innerHTML = '<p>Loading...</p>';
}

// Function to hide loading indicator
function hideLoadingIndicator() {
    const resultDiv = document.getElementById('rapBattleResult');
    resultDiv.innerHTML = '';  // Clear loading text
}

// Function to start the rap battle
function startRapBattle() {
    const author1 = document.getElementById('author1').value;
    const author2 = document.getElementById('author2').value;
    const resultDiv = document.getElementById('rapBattleResult');

    // Input validation
    if (!validateAuthors(author1, author2)) {
        resultDiv.textContent = 'Invalid author selection. Please choose valid authors.';
        return;
    }

    // Show loading indicator
    showLoadingIndicator();

    const author1Data = authorData[author1];
    const author2Data = authorData[author2];

    const prompt = `
        Imagine ${author1} and ${author2} are having a rap battle. 
        The battle should have four parts:
        1. ${author1} starts by boasting about their work "${author1Data.notableWork}" and criticizing ${author2}'s work "${author2Data.notableWork}".
        2. ${author2} responds by boasting about their work "${author2Data.notableWork}" and criticizing ${author1}'s work "${author1Data.notableWork}".
        3. ${author1} replies with another verse, making references to other works such as "${author1Data.otherWorks}".
        4. Finally, ${author2} concludes the battle with a last verse, possibly mentioning their own additional works like "${author2Data.otherWorks}".
        Each part should be clearly labeled with the author's name before their verse.
    `;
    console.log('Generated prompt:', prompt);

    // Make the API call to OpenAI with the prompt
    fetch('/api/openai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt })
    })
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data);
            hideLoadingIndicator();  // Hide loading indicator when data is received
            if (data.choices && data.choices.length > 0) {
                let battleText = data.choices[0].message.content;

                // Format the response text
                battleText = battleText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                battleText = battleText.replace(/\n/g, '<br>'); // Replace newlines with <br> tags for line breaks

                resultDiv.innerHTML = `<h3>${author1} vs. ${author2}</h3><p>${battleText}</p>`;
            } else {
                resultDiv.textContent = 'No valid response from the API. Please try again later.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            hideLoadingIndicator();  // Hide loading indicator on error
            resultDiv.textContent = 'An error occurred. Please try again later.';
        });
}

document.getElementById('battleButton').addEventListener('click', startRapBattle);

// Load the authors when the page loads
window.onload = loadAuthors;