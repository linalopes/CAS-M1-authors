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

// FUNCTION TO UPDATE AUTHOR INFO
// One of the core educational ideas behind this project is the repetition of information through interaction.
// Each time two authors are selected, the user is presented with a brief bio of each, along with their
// notable contributions. This helps reinforce memory through repeated exposure—an essential aspect of learning. 

// As the author of this project, I wanted to engage with the material in a playful but effective way.
// By constantly returning to the authors and their key ideas, I create opportunities to solidify that
// knowledge. The more I interact with the data, the more it becomes ingrained. It's like learning through
// play: the process of comparing these authors, selecting them in pairs, and reading their bios repeatedly 
// creates a deeper understanding of their role in AI and Machine Learning. The mini-bios act as bite-sized
// pieces of information that are easier to digest and remember over time. 

// In this way, the rap battle format isn't just about entertainment—it's also an educational tool that
// promotes learning by encouraging users to actively engage with the content, fostering a stronger
// connection to the material with each interaction.

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


// FUNCTION TO START RAP BATTLE
// Why a rap battle? The concept of a "rap battle" originates from the hip-hop culture in the 1970s
// in the Bronx, New York, where two rappers would face off, each trying to outdo the other with
// their lyrical prowess, wit, and rhythm. It’s a verbal duel that  not only showcases skill but also
// adds an element of entertainment and competition. In this project, we bring this cultural concept
// into an academic context, comparing authors in AI and Machine Learning as though they were
// rappers in a lyrical battle. 

// This humorous juxtaposition invites users to think of these intellectuals as contenders in the 'arena'
// of ideas, where their contributions are like verses, each trying to 'outshine' the other in terms
// of impact and innovation. The playful nature of the rap battle format makes the exploration of
// academic figures feel less rigid and more approachable. By pitting authors against each other,
// the user is encouraged to compare their contributions in a fun and engaging way—almost as if 
// they were competing in the intellectual equivalent of a rap battle. After all, aren't AI and Machine
// Learning just another form of  problem-solving and creativity, much like crafting the perfect rap verse?

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
    
    // OPENAI API CONTEXT
    // The OpenAI API is used here to generate the rap battle lyrics between two selected authors. 
    // OpenAI was founded in 2015 as an open-source AI research company, with the goal of
    // making artificial intelligence accessible. While it started as an open-source initiative,
    // OpenAI has since shifted its model and is now a capped-profit organization, with investors
    // like Microsoft holding a significant stake in the company. OpenAI is based in the United States,
    // and its work reflects the influence and values of the tech industry in that region, which brings
    // with it certain biases and perspectives, just like the authors discussed in this project.

    // The tool itself is built on advanced technologies like Deep Learning, specifically large language 
    // models (LLMs) and Natural Language Processing (NLP). These models are trained on vast
    // amounts of text data, which allows them to understand and generate human-like responses. 
    // In this case, the API is used to simulate a rap battle by drawing on a massive corpus of text, including
    // examples of lyrical structures. The API tries to find patterns in language and mimic the format
    // of a battle, but this process is heavily dependent on the data it was trained on — data 
    // which is not fully accessible or transparent to me as the user.

    // This is where the OpenAI API differs from something like D3.js. While D3.js is based on SVG
    // and is a fully open-source library, allowing me full control over how data is rendered and visualized,
    // OpenAI operates more like a black box. I don’t have access to the dataset that was used to 
    // train the model, nor can I tweak the underlying patterns it has learned. This introduces an element
    // of uncertainty — while I can control the inputs to the model (the authors selected for the battle),
    // I am trusting OpenAI’s bias in generating the output. This is a significant contrast to my data
    // visualization work, where I had full control and made my biases clear in the dataset and
    // visualization process.

    // By using the OpenAI API, I am essentially relying on an external system that has been trained
    // on a dataset I did not curate and a model I did not design. This highlights an important point about
    // machine learning tools: much of their power comes from pattern recognition, but the user has limited 
    // insight into the biases inherent in the model. The rap battle, while humorous and creative, is ultimately
    // generated by a tool trained on data whose origins and biases are unknown to me, unlike the bias
    // I can clearly see and control in my dataset of AI authors.

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
