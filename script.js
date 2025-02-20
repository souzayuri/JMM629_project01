// Import the D3.js library from the specified CDN
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

console.log(d3); // Check if D3 is loaded

// Define biome color mapping, associating specific biomes with colors
const biomeColors = {
    "Atlantic Forest": "#2E8B57", // Green color for Atlantic Forest
    "Pantanal": "#806D43", // Brown color for Pantanal
    "Cerrado": "#CD853F" // Orange color for Cerrado
};

// Biome sorting order (used later to maintain a predefined sorting)
const biomeOrder = ["Atlantic Forest", "Pantanal", "Cerrado"];

// Load the dataset from a CSV file and rename it as "tapirs"
// d3.csv() loads the file, and d3.autoType() automatically converts data types
d3.csv('data/activity_summary2.csv', d3.autoType)
    .then(tapirs => { // Executes once the data is successfully loaded
        console.log("Loaded CSV Data:", tapirs); // Log loaded CSV data
        console.table(tapirs); // Display it in a table format for better readability

        // Group data by 'individual.local.identifier' (tapir name)
        const groupedTapirs = d3.group(tapirs, d => d.individual_name);

        console.log("Grouped Tapirs Data:", groupedTapirs); // Log grouped data

        // Convert grouped data into an array and sort based on predefined biome order
        const sortedTapirs = Array.from(groupedTapirs.entries()).sort((a, b) => {
            const biomeA = a[1][0].Biome; // Extract biome of first entry in group A
            const biomeB = b[1][0].Biome; // Extract biome of first entry in group B
            return biomeOrder.indexOf(biomeA) - biomeOrder.indexOf(biomeB); // Sort by index in biomeOrder
        });

        console.log("Sorted Tapirs Data:", sortedTapirs); // Log sorted data

        // Select the container where plots will be displayed
        const container = d3.select("#chart-container");

        // Iterate through each individual tapir and generate a polar plot
        sortedTapirs.forEach(([individual, data]) => {
            // Extract relevant data (hour and count) for each individual
            const aggregatedData = data.map(d => ({ hour: d.hour, count: d.count }));

            console.log(`Aggregated Data for ${individual}:`, aggregatedData);

            // Get the biome of the individual (assuming the first entry defines it)
            const biome = data[0].Biome;
            const fillColor = biomeColors[biome] || "#b899a1"; // Default color if biome is missing

            // Create a new div for each individual's chart
            const individualDiv = container.append("div")
                .attr("class", "individual-chart")
                .style("display", "inline-block")
                .style("margin", "10px");

            // Add a title displaying the individual's name
            individualDiv.append("h4").text(`${individual}`);

            // Append an SVG element where the polar plot will be drawn
            const svg = individualDiv.append("svg")
                .attr("width", 180)
                .attr("height", 180);

            drawPolarPlot(svg, aggregatedData, fillColor);
        });
    })
    .catch(error => {
        console.error("Error loading CSV:", error); // Handle CSV loading errors
    });

// Function to draw a polar plot inside a given SVG
function drawPolarPlot(svg, tapirs, fillColor) {
    const width = 180, height = 180;
    const radius = Math.min(width, height) / 2 - 28; // Define radius for plot

    // Create a group (`g`) element and center it in the SVG
    const g = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Scale for mapping hours (0-24) to radians (0 to 2π)
    const angleScale = d3.scaleLinear()
        .domain([0, 24])
        .range([0, 2 * Math.PI]);

    // Scale for mapping count values to radial distance
    const radiusScale = d3.scaleLinear()
        .domain([0, d3.max(tapirs, d => d.count)])
        .range([0, radius]);

    // Define a radial line generator for the plot
    const lineGenerator = d3.lineRadial()
        .angle(d => angleScale(d.hour))
        .radius(d => radiusScale(d.count))
        .curve(d3.curveLinearClosed);

    // Draw radial gridlines (every 3 hours)
    g.selectAll(".grid-line")
        .data(d3.range(0, 24, 3))
        .enter().append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", d => radius * Math.cos(angleScale(d) - Math.PI / 2))
        .attr("y2", d => radius * Math.sin(angleScale(d) - Math.PI / 2))
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "2, 2");

    // Draw the radial line plot
    g.append("path")
        .datum(tapirs)
        .attr("fill", fillColor)
        .attr("fill-opacity", 0.5)
        .attr("stroke", fillColor)
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 1)
        .attr("d", lineGenerator);

    // Define the scale steps (e.g., 25%, 50%, 75%, 100% of max value)
    const scaleSteps = d3.range(0, d3.max(tapirs, d => d.count), d3.max(tapirs, d => d.count) / 4);

    // Add stacked scale labels with a better font
    g.selectAll(".scale-label")
        .data(scaleSteps)
        .enter().append("text")
        .attr("class", "scale-label")
        .attr("x", 0) // Centered on the y-axis (12 o'clock position)
        .attr("y", d => -radiusScale(d)) // Move upward based on radius
        .attr("dy", "-4px") // Small offset for readability
        .attr("text-anchor", "middle")
        .attr("font-size", "10px") // Adjusted for better readability
        .attr("font-family", 'Bungee') // Apply the new font
        .attr("fill", "#475d57") // Darker color for contrast
        .attr("fill-opacity", 0.4)
        .text(d => Math.round(d)); // Display rounded values


    // Tooltip for displaying data on hover
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("visibility", "hidden")
        .style("pointer-events", "none");

    // Add data points and enable hover effect
    g.selectAll(".data-point")
        .data(tapirs)
        .enter().append("circle")
        .attr("class", "data-point")
        .attr("cx", d => radiusScale(d.count) * Math.cos(angleScale(d.hour) - Math.PI / 2))
        .attr("cy", d => radiusScale(d.count) * Math.sin(angleScale(d.hour) - Math.PI / 2))
        .attr("r", 2)
        .attr("fill", fillColor)
        .attr("fill-opacity", 0.6)
        .attr("stroke", "#333")
        .attr("stroke-width", 0.0)
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                .html(`Hour: ${d.hour}<br>Count: ${d.count}`);
        })
        .on("mousemove", (event) => {
            tooltip.style("top", `${event.pageY - 20}px`)
                .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
        });

    // Draw hour labels around the radial plot
    g.selectAll(".hour-label")
        .data(d3.range(0, 24, 3))
        .enter().append("text")
        .attr("x", d => (radius + 10) * Math.cos(angleScale(d) - Math.PI / 2))
        .attr("y", d => (radius + 15) * Math.sin(angleScale(d) - Math.PI / 2))
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#6f8982")
        .text(d => d);

    // Draw the outer boundary circle
    g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);
}

// Select all videos in the document
const videos = document.querySelectorAll('.video-player');

function playAllVideos() {
    videos.forEach(video => video.play());
}

// function pauseAllVideos() {
//     videos.forEach(video => {
//         video.pause();
//         video.currentTime = 0; // Reset to start
//     });
// }

document.querySelectorAll('.video-container').forEach(container => {
    container.addEventListener('mouseenter', playAllVideos);
    // container.addEventListener('mouseleave', pauseAllVideos);
});

