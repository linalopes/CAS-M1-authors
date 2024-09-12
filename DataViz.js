// ABOUT THE DATASET
// The dataset consists of 74 key authors who have made significant contributions to Artificial 
// Intelligence (AI) and Machine Learning (ML).These authors were referenced during Module 1 
// of the CAS AI for Creative Practices, focusing on the genealogy of AI. The data reveals the 
// intellectual profiles and geographical distribution of the authors, highlighting important socio-technical
// aspects such as gender, location, and the duration of their research careers. Visualizing this data 
// allows us to better understand the intellectual landscape that has shaped  the field of AI and ML.


// D3.js LIBRARY
// This code uses D3.js, a powerful JavaScript library for producing dynamic, interactive data 
// visualizations in web browsers. D3.js (Data-Driven Documents) was created in 2011 by Mike Bostock 
// during his time at The New York Times (NYC), where he focused on engaging audiences with 
// data-driven storytelling, and at Stanford, where his academic work deepened the technical 
// foundations of the library. D3.js is widely used for creating complex, dynamic visualizations 
// in web browsers. It is an open-source library that binds data to a Document Object Model (DOM) 
// and applies data-driven transformations to the document, allowing the creation of dynamic charts.
// Since it is open-source, the code can be adapted and expanded by developers globally. However, 
// like any tool, it carries the biases of its initial development. This ties into the broader discussion 
// on how technical tools, like academic concepts, carry  inherent worldviews and biases,
// as discussed during the course throw the eyes of Steyerl (2023) and Suchman (2023).

// General settings for the chart
const margin = {top: 20, right: 30, bottom: 30, left: 100};
let width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right;
let height = 600 - margin.top - margin.bottom;

// CREATE THE SVG
// D3 works with SVG (Scalable Vector Graphics), a web standard for rendering vector-based graphics 
// that ensures visualizations can scale and be responsive across different devices. 
// SVG was developed by the W3C (World Wide Web Consortium) and was introduced in 1999. 
// Its primary purpose was to enable resolution-independent vector graphics on the web, ensuring 
// that images and graphics could be displayed clearly on any screen size or resolution. 

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create Tooltips provide additional context about the data when a user hovers over the chart elements. 
const tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("padding", "8px")
    .style("border", "1px solid #d3d3d3")
    .style("border-radius", "4px")
    .style("pointer-events", "none");  // Prevents the tooltip from interfering with user interactions

// RESIZE FUNCTION
// This function ensures that the chart dynamically adjusts to fit various screen sizes, from desktops 
// to small smartphones. It's a problem that Alan Turing never had to deal with while working on computing 
// and breaking German codes in the 1940s. Almost 84 years later, we now hold more processing power 
// in a single smartphone than existed in Turing's time. Yet, instead of breaking codes, we're now breaking
// our heads over screen sizes — adapting to a world of endless devices and resolutions. 
// Welcome to the joys of modern computing: more power, more screens, more problems!


function resize() {
    // Update width and height based on window size
    width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right;

    // Update the SVG with the new width
    d3.select("svg")
        .attr("width", width + margin.left + margin.right);

    // Update the X scales
    x.range([0, width]);

    // Update the axes
    svg.select(".x-axis").call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Update the circle positions
    svg.selectAll("circle")
        .attr("cx", d => jitter(x(d.startYear), 10));
}

// LOAD DATA FROM GOOGLE SPREADSHEET VIA CSV
// This dataset includes all the authors mentioned by both the professor and the students during
// three days of class in August 2024. These references emerged in the context of discussions around 
// AI and Machine Learning, with the aim of tracing the genealogy of the field. The process of building
// this spreadsheet was directly connected to my note-taking system. I take structured notes
// during class, organizing them in a way that allows me to later extract meaningful data. This has been
// possible with the aid of modern AI-powered analysis tools that help make sense of unstructured
// information. The decision to store this data in a Google Spreadsheet and export it as a CSV
// (Comma-Separated Values) file was a conscious one. CSV files are simple data structures that are 
// widely readable and easy to manipulate. They have a long history, dating back to the early 1970s. 
// It was created in the context of the need for data exchange between different systems and software
// during the early days of computing and became popular with the increased use of personal computers
// and electronic spreadsheets, such as VisiCalc (1979) and Lotus 1-2-3 (1983).
// Being a text-based format, CSV files are lightweight, making them ideal for online sharing and integration.

// By hosting the data in a Google Spreadsheet, the dataset remains dynamic and can be updated
// or corrected as needed, thanks to its cloud-based nature. Of course, there’s nothing truly "cloudy"
// about it — it's supported by hard infrastructure. This term, like many others in computing and AI,
// reflects an analogie, similar to those discussed by Mitchell (2021), where mnemonics borrowed from
// human intelligence and society are used to describe technological systems, often leading to
// misconceptions. But anyway, this cloud-system allows us for real-time updates in the visualization,
// ensuring that any new information or corrections are reflected instantly in the graph. 

// As for using a tool from Google to host the data, it’s worth pausing for a moment to reflect on the
// company's role as a giant in data processing. Google began, 1998, as an ambitious project to index
// the world’s information, essentially becoming a modern-day librarian of the digital world. The value of 
// indexing and organizing data became apparent as the company collected search queries, user data,
// and web content, leading to the massive accumulation of data that we now know as "big data." 
// For many years, it was not entirely clear how this data would be leveraged, but Google’s position
// as a data-centric company allowed it to profit immensely from understanding, categorizing, and
// making sense of the data it collected. Now, we live in a time when data is one of the most valuable
// commodities, and companies like Google are creating tools and platforms that allow users like me
// to store and manage datasets in the cloud. It’s ironic in a way: Google has evolved from indexing
// websites to becoming the very infrastructure we rely on to create, store, and analyze new data.

const googleSheetCSV = "https://docs.google.com/spreadsheets/d/1GrZpRGPTnwRBNhCDBusax9BpInPmfxkt6Y7HIGC_N-w/pub?gid=498870662&single=true&output=csv";

// Global variables
let selectedAuthors = [];
let data = [];

// SET THE SCALES FOR THE AXES
// While the graph spans the years from 1800 to 2024, there is an important distinction in how the
// time is represented. Between 1800 and 1910, the timeline is not scaled accurately. This decision
// reflects a trade-off in data visualization:  the need for a dynamic, engaging chart takes precedence
// over strict temporal accuracy for that earlier period. This approach highlights the subjectivity inherent
// in data visualization. As the author, I opted to prioritize a  clear visual representation of the more
// recent developments in AI (post-1900), where the timeline is fully linear and accurate. This kind of
// decision-making reflects one of the key themes in data science and machine learning:  that models,
// algorithms, and visualizations are not neutral — they are shaped by the decisions and biases of
// their creators. Just as Herbert Simon (1982), a pioneer in AI and decision-making, discussed bounded
// rationality — the limitations we face when processing information — this graph reflects the constraints
// of data visualization. I made decisions to highlight certain data, revealing the inherent bias in how
// we present and interpret information. Thus, this visualization makes a conscious choice to simplify
// the earlier years to focus on the more meaningful trends in the 20th and 21st centuries.

const x = d3.scaleLinear()
    .domain([1800, 1910, 2025])  // Define custom breakpoints in the timeline
    .range([0, width * 0.1, width]);  // Allocate only 10% of the width for 1800-1900, and the rest for 1900-2025

const y = d3.scaleBand()
    .domain(["Oceania", "Asia", "Europe Continental", "Europe UK", "Canada", "USA East", "USA West", "South America"])
    .range([0, height])
    .padding(1);

// Add the axes
const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .attr("class", "x-axis")
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

const yAxis = svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

// Function to capture selected authors and highlight them in the graph
function updateSelectedAuthors(author1, author2) {
    selectedAuthors = [author1, author2];
    if (typeof updateChart === 'function') {
        updateChart();
    }
}

// FUNCTION TO GENERATE A SLIGHT JITTER VALUE
// Since it was declared the X-axis was rescaled to better accommodate the data, the bubbles are
// also not placed precisely on the timeline. This slight jitter prevents bubbles from overlapping,
// especially in densely populated years like the 1950s and 1990s, where many authors made
// key contributions. This was a deliberate choice to improve readability and avoid visual clutter.
// A kind of a degree of poetic license in the visualization.

function jitter(value, range) {
    return value + (Math.random() - 0.5) * range;  // Generates a random offset within the given range
}

// FUNCTION TO RENDER THE CHART
// This function renders the graph on the screen and is responsible for updating the visualization
// whenever authors are selected. The colors pink (for female) and turquoise (for male) represent
// the gender of the authors. While I recognize that some authors may prefer non-binary pronouns
// or might not identify with these gender categories, I did not find consistent information on this.
// So, for the sake of simplicity, I used male and female classifications. Also, before anyone gets
// upset, the pink color for female  is not meant to reinforce any stereotypes.
// It's simply because pink and turquoise are the colors of my brand.

// The size of each bubble reflects the duration of the author's research career. For instance,
// Noam Chomsky, who has been active for over 60 years, has a larger circle compared to others
// with shorter research spans. This gives an interesting visual insight  into the consistency and
// longevity of many of these authors' engagements with topics related to AI and Machine Learning.

// It's worthy to mention taht his function creates a bubble chart to visualize the data. The use of
// bubbles in data visualization can be traced back to the early 1900s, with figures like Florence
// Nightingale and William Playfair using circular graphics to represent data,  particularly in relation
// to health and economic statistics. Over time, bubbles became a popular visual tool for representing 
// relationships between variables, such as size and quantity, in a visually compelling way.

// Ironically, the term "bubble" has also come to signify closed-off environments—cultural or ideological 
//"bubbles" where people are isolated  from outside perspectives. Here, we use bubbles to open up a
// new way of seeing data, but one can't ignore the tension in the metaphor, 
// as each bubble still represents an isolated data point, bound within its own space.


function updateChart() {
    const size = d3.scaleSqrt()
        .domain([1, d3.max(data, d => d.duration)])
        .range([5, 40]);

    const color = d3.scaleOrdinal()
        .domain(["Male", "Female"])
        .range(["var(--turquoise)", "var(--pink)"]);

    // Update the bubbles
    const circles = svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => jitter(x(d.startYear), 20))
        .attr("cy", d => jitter(y(d.location), 20))
        .attr("r", d => size(d.duration))
        .attr("fill", d => color(d['gender of the author']))
        .attr("stroke", d => selectedAuthors.includes(d.author) ? "black" : "lightgray")
        .attr("stroke-width", d => selectedAuthors.includes(d.author) ? 3 : 1)
        .style("opacity", 0.7)
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 1);
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${d.author}</strong><br>${d['Key Contribution']}<br>${d['city-country']}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("opacity", 0.7);
            tooltip.transition().duration(200).style("opacity", 0);
        });
}
// LOAD THE DATA AND BUILD THE GRAPH
// The dataset used here represents three days of lectures on Machine Learning and AI, during which
// authors were mentioned by the professor and students. This dataset, however, is not an universal list
// of AI and ML contributors — it was selected and organized by me based on my notes, and it’s possible
// that I missed some authors or added others that seemed relevant during the lectures. 
// This introduces an initial layer of bias, rooted in my own perspective on what was discussed in class.

// The visualization itself was built based on this dataset, and throughout the comments, I've made it clear
// where I made specific design decisions. For instance, I chose to scale the timeline between 1800
// and 1910 differently to better visualize the data, and I introduced slight randomness in the positioning
// of the bubbles to prevent overlap in densely populated periods, such as the 1950s and 1990s. 
// I also found it relevant to include data on gender and research duration, which helped me explore the
// relationships between the authors in this context.

// However, it’s important to acknowledge that this dataset already reflects a bias introduced by Chris
// Salter, the professor who selected the authors. The graph clearly shows that the majority of authors
// are from North America, with some from Europe, but very few from regions like South America
// or Oceania. None in Afrika. Even the representation of women in this field is limited, which reflects
// the broader reality of AI and ML as fields that have been developed largely in North America and Europe.

// The visualization choices I've made, like separating the US into East and West coasts, were intended 
// to explore potential differences in perspectives. Ultimately, this graph is an attempt to find patterns
// in this small but meaningful dataset, much like what machine learning aims to do:
// analyzing large datasets, identifying patterns, and making predictions based on those patterns. 
// This visualization, while based on only a limited number of authors, allowed me to highlight key trends
// and insights within this specific academic context. As I create this visualization to uncover patterns
// and insights, I’m learning — and so is the machine.
// But in the end, the question bubbles up: who is teaching ?

d3.csv(googleSheetCSV).then(function(loadedData) {
    data = loadedData;

    data.forEach(function(d) {
        d.duration = +d.duration;
        d.startYear = +d['years-of-research'].split('-')[0];
    });

    updateChart();
});

// Resize the chart when the window is resized
window.addEventListener("resize", resize);
