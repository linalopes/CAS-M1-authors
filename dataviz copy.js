// Configurações gerais do gráfico
const margin = {top: 20, right: 30, bottom: 30, left: 100},
      width = 1000 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Carregar dados do Google Spreadsheet via CSV (ajuste o link para o CSV da sua planilha)
const googleSheetCSV = 'https://docs.google.com/spreadsheets/d/1GrZpRGPTnwRBNhCDBusax9BpInPmfxkt6Y7HIGC_N-w/pub?gid=498870662&single=true&output=csv';

// Conectar o gráfico com a seleção de autores no Rap Battle
// Variável para armazenar os autores selecionados
let selectedAuthors = [];
let dataLoaded = false;  // Variável para garantir que os dados tenham sido carregados
let data;  // Variável global para armazenar os dados

// Função para capturar os autores selecionados e destacar no gráfico
function updateSelectedAuthors(author1, author2) {
    selectedAuthors = [author1, author2];  // Atualiza a lista de autores selecionados
    console.log("Autores selecionados:", selectedAuthors);  // Verificar se os autores estão sendo capturados corretamente
    if (dataLoaded) {  // Somente chama updateChart se os dados já foram carregados
        updateChart();
    } else {
        console.error("Os dados ainda não foram carregados.");
    }
}

// Carregar os dados e construir o gráfico
d3.csv(googleSheetCSV).then(function(loadedData) {
    data = loadedData;  // Armazena os dados carregados globalmente
    dataLoaded = true;  // Marca que os dados foram carregados

    // Converter os campos relevantes para o formato adequado
    data.forEach(function(d) {
        d.duration = +d.duration;  // Usar a coluna duration diretamente
        d.startYear = +d['years-of-research'].split('-')[0];  // Extrair o ano inicial
    });

    // Eixo X (tempo)
    const x = d3.scaleLinear()
        .domain([1800, 2025])  // Definindo o range de anos, ajustando 1800 a 1900 sem escala correta
        .range([0, width]);

    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));  // Formato para exibir anos inteiros

    // Eixo Y (lugares)
    const y = d3.scaleBand()
        .domain(["Oceania", "Asia", "Europe Continental", "Europe UK", "Canada", "USA East", "USA West", "South America"])
        .range([0, height])
        .padding(1);

    const yAxis = svg.append("g")
        .call(d3.axisLeft(y));

    // Função de tamanho das bolhas
    const size = d3.scaleSqrt()
        .domain([1, d3.max(data, d => d.duration)])  // Ajusta para o range de duração
        .range([5, 40]);  // Tamanho mínimo e máximo da bolha

    // Função de cor das bolhas (de acordo com o gênero)
    const color = d3.scaleOrdinal()
        .domain(["Male", "Female"])
        .range(["var(--turquoise)", "var(--pink)"]);  // Usando cores do CSS

    // Função para atualizar o gráfico com os autores selecionados
    function updateChart() {
        // Adicionar as bolhas
        const circles = svg.selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", d => x(d.startYear))  // Ajusta o eixo X com o ano de início
            .attr("cy", d => y(d.location))  // Localização no eixo Y
            .attr("r", d => size(d.duration))  // Tamanho da bolha baseado na duração
            .attr("fill", d => color(d['gender of the author']))  // Cor da bolha baseado no gênero
            .attr("stroke", d => selectedAuthors.includes(d.author) ? "black" : "lightgray")  // Stroke preto para autores selecionados, cinza claro para os demais
            .attr("stroke-width", d => selectedAuthors.includes(d.author) ? 3 : 1)  // Stroke fino para todos, mais grosso para os destacados
            .style("opacity", 0.7)
            .on("mouseover", function(event, d) {
                d3.select(this).style("opacity", 1);
                // Tooltip com informações
                const tooltip = d3.select("#chart").append("div")
                    .attr("class", "tooltip")
                    .html(`<strong>${d.author}</strong><br>Research Duration: ${d.duration} years<br>Location: ${d.location}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("opacity", 0.9);
            })
            .on("mouseout", function(d) {
                d3.select(this).style("opacity", 0.7);
                d3.select(".tooltip").remove();
            });
    }

    // Inicializar o gráfico
    updateChart();
});
