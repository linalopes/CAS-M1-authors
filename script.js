// Function to load the CSV file and populate the dropdowns
let authorData = {};

function loadAuthors() {
    const googleSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQqCdcwLemmOhO16KOVWabBRabqQoRwx1QqIyS0mxZWq_O5dxYALM4JrZDu_LUoulbRQS6137gCsmJc/pub?gid=498870662&single=true&output=csv';

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
            resultDiv.innerHTML = `
                <p style="color: red;">
                    Failed to load authors data. Please check your internet connection or try again later.
                </p>
                <button onclick="loadAuthors()">Retry Loading Authors</button>
            `;
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
    } else {
        author1BioElement.textContent = "Select an author to see their bio.";
    }

    // Update the bio of Author 2
    if (author2 && authorData[author2]) {
        const author2Bio = authorData[author2].miniBio || "No bio available.";
        author2BioElement.textContent = author2Bio;
    } else {
        author2BioElement.textContent = "Select an author to see their bio.";
    }

    // Atualiza o gráfico de bolhas com os autores selecionados
    if (typeof updateSelectedAuthors === 'function') {
        updateSelectedAuthors(author1, author2);  // Função que atualiza o gráfico de bolhas
    } else {
        console.error("Function updateSelectedAuthors is not defined");
    }
}

// Debounce function to avoid calling the function too many times in quick succession
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Update author info with a debounce to optimize performance
const updateAuthorInfoDebounced = debounce(updateAuthorInfo, 300);

// Add event listener to update bios when an author is selected with debounce
document.getElementById('author1').addEventListener('change', updateAuthorInfoDebounced);
document.getElementById('author2').addEventListener('change', updateAuthorInfoDebounced);


// Function to start the rap battle by generating a prompt and calling OpenAI API
function startRapBattle() {
    const author1 = document.getElementById('author1').value;
    const author2 = document.getElementById('author2').value;
    const resultDiv = document.getElementById('rapBattleResult');

    // Clear previous error messages
    resultDiv.innerHTML = '';

    // Input validation
    if (!author1 || !author2) {
        resultDiv.innerHTML = '<p style="color: red;">Please select both authors before starting the battle.</p>';
        
        // Add focus to the first empty field
        if (!author1) {
            document.getElementById('author1').focus();
        } else if (!author2) {
            document.getElementById('author2').focus();
        }
        
        return; // Stop the function from proceeding further
    }

    // Show loading indicator
    resultDiv.innerHTML = '<p>Loading battle...</p>';

    const author1Data = authorData[author1];
    const author2Data = authorData[author2];

    // Construct the prompt for OpenAI
    const prompt = `
        Imagine ${author1} and ${author2} are having a rap battle. 
        The battle should have four parts:
        1. ${author1} starts by boasting about their work "${author1Data.notableWork}" and criticizing ${author2}'s work "${author2Data.notableWork}".
        2. ${author2} responds by boasting about their work "${author2Data.notableWork}" and criticizing ${author1}'s work "${author1Data.notableWork}".
        3. ${author1} replies with another verse, making references to other works.
        4. Finally, ${author2} concludes the battle with a last verse.
        Each part should be clearly labeled with the author's name before their verse.
    `;
    
    // Call the OpenAI API
    fetch('/api/openai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt })
    })
    .then(response => response.json())
    .then(data => {
        if (data.choices && data.choices.length > 0) {
            let battleText = data.choices[0].message.content;

            // Format the response text
            battleText = battleText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            battleText = battleText.replace(/\n/g, '<br>'); // Replace newlines with <br> tags for line breaks

            resultDiv.innerHTML = `<h3>${author1} vs. ${author2}</h3><p>${battleText}</p>`;
        } else {
            resultDiv.textContent = 'The AI did not return a valid response. Please try again later.';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.textContent = 'An error occurred. Please try again later.';
    });
}

// Add event listener to update bios when an author is selected
document.getElementById('author1').addEventListener('change', updateAuthorInfo);
document.getElementById('author2').addEventListener('change', updateAuthorInfo);

// Add event listener to start rap battle when button is clicked
document.getElementById('battleButton').addEventListener('click', startRapBattle);

// Load authors when the page loads
window.onload = function() {
    loadAuthors(); // Load the authors from Google Spreadsheet
    updateAuthorInfo(); // Update the bios on page load
};
