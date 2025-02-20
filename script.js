import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

console.log(d3); // Check if D3 is loaded

// Define biome color mapping
const biomeColors = {
    "Atlantic Forest": "#2E8B57",
    "Pantanal": "#806D43",
    "Cerrado": "#CD853F"
};

// Biome sorting order
const biomeOrder = ["Atlantic Forest", "Pantanal", "Cerrado"];

// Load the dataset and rename it as tapirs
d3.csv('data/activity_summary2.csv', d3.autoType)
    .then(tapirs => {
        console.log("Loaded CSV Data:", tapirs);
        console.table(tapirs);

        // Group data by individual.local.identifier
        const groupedTapirs = d3.group(tapirs, d => d.individual_name);

        console.log("Grouped Tapirs Data:", groupedTapirs);

        // Convert grouped data to an array and sort by biome order
        const sortedTapirs = Array.from(groupedTapirs.entries()).sort((a, b) => {
            const biomeA = a[1][0].Biome;
            const biomeB = b[1][0].Biome;
            return biomeOrder.indexOf(biomeA) - biomeOrder.indexOf(biomeB);
        });

        console.log("Sorted Tapirs Data:", sortedTapirs);

        // Create a container to hold all plots
        const container = d3.select("#chart-container");

        // Iterate through each individual and generate a polar plot
        sortedTapirs.forEach(([individual, data]) => {
            const aggregatedData = data.map(d => ({ hour: d.hour, count: d.count }));

            console.log(`Aggregated Data for ${individual}:`, aggregatedData);

            // Get the biome for the individual (assuming the first entry defines it)
            const biome = data[0].Biome;
            const fillColor = biomeColors[biome] || "#b899a1"; // Default color if not found

            // Create a new div for each individual's plot
            const individualDiv = container.append("div")
                .attr("class", "individual-chart")
                .style("display", "inline-block")
                .style("margin", "10px");

            // Add title
            individualDiv.append("h4").text(`${individual}`);
            // Append SVG element
            const svg = individualDiv.append("svg")
                .attr("width", 180)
                .attr("height", 180);

            drawPolarPlot(svg, aggregatedData, fillColor);
        });
    })
    .catch(error => {
        console.error("Error loading CSV:", error);
    });

// Function to draw a polar plot inside a given SVG
function drawPolarPlot(svg, tapirs, fillColor) {
    const width = 180, height = 180;
    const radius = Math.min(width, height) / 2 - 28;

    // Append a group element
    const g = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Convert hours to radians (0-23 maps to 0-2π)
    const angleScale = d3.scaleLinear()
        .domain([0, 24])
        .range([0, 2 * Math.PI]);

    // Scale for count values
    const radiusScale = d3.scaleLinear()
        .domain([0, d3.max(tapirs, d => d.count)])
        .range([0, radius]);

    // Define line generator
    const lineGenerator = d3.lineRadial()
        .angle(d => angleScale(d.hour))
        .radius(d => radiusScale(d.count))
        .curve(d3.curveLinearClosed);

    // Draw radial gridlines
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

    // Draw line plot
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

    // Draw hour labels
    g.selectAll(".hour-label")
        .data(d3.range(0, 24, 3))
        .enter().append("text")
        .attr("x", d => (radius + 10) * Math.cos(angleScale(d) - Math.PI / 2))
        .attr("y", d => (radius + 15) * Math.sin(angleScale(d) - Math.PI / 2))
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#6f8982")
        .text(d => d);

    // Draw the outer circle
    g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);
}

// videos
const videos = document.querySelectorAll('.video-player');

function playAllVideos() {
    videos.forEach(video => video.play());
}

//function pauseAllVideos() {
//    videos.forEach(video => {
//        video.pause();
//        video.currentTime = 0; // Reset to start
//    });
//}

document.querySelectorAll('.video-container').forEach(container => {
    container.addEventListener('mouseenter', playAllVideos);
//    container.addEventListener('mouseleave', pauseAllVideos);
});
