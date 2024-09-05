// Configurações gerais do gráfico (ajustando para ser responsivo)
const margin = {top: 20, right: 30, bottom: 30, left: 100};
let width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right;
let height = 600 - margin.top - margin.bottom;

// Criar o SVG
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Criar a div do Tooltip apenas uma vez fora do SVG
const tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("padding", "8px")
    .style("border", "1px solid #d3d3d3")
    .style("border-radius", "4px")
    .style("pointer-events", "none");  // Para evitar que o Tooltip interfira na interação

// Função para redimensionar o gráfico conforme a janela é ajustada
function resize() {
    // Atualiza a largura e altura com base no tamanho da janela
    width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right;

    // Atualiza o SVG com a nova largura
    d3.select("svg")
        .attr("width", width + margin.left + margin.right);

    // Atualiza as escalas X
    x.range([0, width]);

    // Atualiza os eixos
    svg.select(".x-axis").call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Atualiza as posições dos círculos
    svg.selectAll("circle")
        .attr("cx", d => jitter(x(d.startYear), 10));
}

// Carregar dados do Google Spreadsheet via CSV
const googleSheetCSV = "https://docs.google.com/spreadsheets/d/1GrZpRGPTnwRBNhCDBusax9BpInPmfxkt6Y7HIGC_N-w/pub?gid=498870662&single=true&output=csv";

// Variáveis globais
let selectedAuthors = [];
let data = [];

// Definir as escalas para os eixos
const x = d3.scaleLinear()
    .domain([1800, 2025])  // Definindo o range de anos, ajustando 1800 a 1900 sem escala correta
    .range([0, width]);

const y = d3.scaleBand()
    .domain(["Oceania", "Asia", "Europe Continental", "Europe UK", "Canada", "USA East", "USA West", "South America"])
    .range([0, height])
    .padding(1);

// Adicionar os eixos
const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .attr("class", "x-axis")
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

const yAxis = svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

// Função para capturar os autores selecionados e destacar no gráfico
function updateSelectedAuthors(author1, author2) {
    selectedAuthors = [author1, author2];
    if (typeof updateChart === 'function') {
        updateChart();
    }
}

// Função para gerar um valor de jitter (deslocamento) leve
function jitter(value, range) {
    return value + (Math.random() - 0.5) * range;  // Gera um deslocamento aleatório dentro do intervalo fornecido
}

// Função para atualizar o gráfico com os autores selecionados
function updateChart() {
    const size = d3.scaleSqrt()
        .domain([1, d3.max(data, d => d.duration)])
        .range([5, 40]);

    const color = d3.scaleOrdinal()
        .domain(["Male", "Female"])
        .range(["var(--turquoise)", "var(--pink)"]);

    // Atualizar as bolhas
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

// Carregar os dados e construir o gráfico
d3.csv(googleSheetCSV).then(function(loadedData) {
    data = loadedData;

    data.forEach(function(d) {
        d.duration = +d.duration;
        d.startYear = +d['years-of-research'].split('-')[0];
    });

    updateChart();
});

// Redimensionar o gráfico quando a janela for redimensionada
window.addEventListener("resize", resize);
