// The svg
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
const projection = d3.geoMercator()
    .center([0,20])                // GPS of location to zoom on
    .scale(99)                       // This is like the zoom
    .translate([ width/2, height/2 ])

Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("https://raw.githubusercontent.com/Johncates/ProjProposal/master/js/data.csv")
]).then(function (initialize) {

    let dataGeo = initialize[0]
    let data = initialize[1]

    // Create a color scale
    let color;
    color = d3.scaleOrdinal()
        .domain(data.map(d => d.Degreeofendangerment))
        .range(d3.schemePaired);

    // Add a scale for bubble size
    const valueExtent = d3.extent(data, d => +d.Numberofspeakers)
    const size = d3.scaleSqrt()
        .domain(valueExtent)  // What's in the data
        .range([ 1, 50])  // Size in pixel

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(dataGeo.features)
        .join("path")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "none")
        .style("opacity", .3)

    // Add circles:
    svg
        .selectAll("myCircles")
        .data(data.sort((a,b) => +b.Numberofspeakers - +a.Numberofspeakers).filter((d,i) => i<0))
        .join("circle")
        .attr("cx", d => projection([+d.Longitude, +d.Latitude])[0])
        .attr("cy", d => projection([+d.Longitude, +d.Latitude])[1])
        .attr("r", d => size(+d.Numberofspeakers))
        .style("fill", d => color(d.Degreeofendangerment))
        .attr("stroke", d=> {if (d.Numberofspeakers>1) {return "black"} else {return "none"}  })
        .attr("stroke-width", 1)
        .attr("fill-opacity", .4)



    // Add title and explanation
    svg
        .append("text")
        .attr("text-anchor", "end")
        .style("fill", "black")
        .attr("x", width - 10)
        .attr("y", height - 30)
        .attr("width", 90)
        .html("Languages and their Endangerment Status")
        .style("font-size", 14)


    // --------------- //
    // ADD LEGEND //
    // --------------- //

    // Add legend: circles
    const valuesToShow = ["Extinct", "Critically endangered", "Severely endangered", "Definitely endangered", "Vulnerable"]
    const xCircle = 40
    const xLabel = 90
    svg
        .selectAll("legend")
        .data(valuesToShow)
        .join("circle")
        .attr("cx", xCircle)
        .attr("cy", d => height - size(d))
        .attr("r", d => size(d))
        .style("fill", "none")
        .attr("stroke", "black")

    // Add legend: segments
    svg
        .selectAll("legend")
        .data(valuesToShow)
        .join("line")
        .attr('x1', d => xCircle + size(d))
        .attr('x2', xLabel)
        .attr('y1', d => height - size(d))
        .attr('y2', d => height - size(d))
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))

    // Add legend: labels
    svg
        .selectAll("legend")
        .data(valuesToShow)
        .join("text")
        .attr('x', xLabel)
        .attr('y', d => height - size(d.Numberofspeakers))
        .text(d => d)
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')
})


// set the dimensions and margins of the graph
const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width1 = 460 - margin.left - margin.right,
    height2 = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg2 = d3.select("my_dataviz")
    .append("svg2")
    .attr("width1", width1 + margin.left + margin.right)
    .attr("height2", height2 + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Parse the Data
d3.csv("https://raw.githubusercontent.com/Johncates/ProjProposal/master/js/data.csv").then ( function(data) {

    // sort data
    data.sort(function(d, a) {
        return a.Countrycodesalpha3 - (d.NameinEnglish);
    });

    // X axis
    const x = d3.scaleBand()
        .range([ 0, width1 ])
        .domain(data.map(d => d.Countrycodesalpha3))
        .padding(0.2);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([data.Countrycodesalpha3])
        .range([ height2, 0]);
    svg2.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svg2.selectAll("#mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.Countrycodesalpha3))
        .attr("y", d => y(d.NameinEnglish))
        .attr("width", x.bandwidth())
        .attr("height", d => height2 - y(d.NameinEnglish))
        .attr("fill", "#69b3a2")

})
// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(width, height) / 2 - margin


// set the color scale
const color = d3.scaleOrdinal()
    .range(d3.schemeSet2);

// Compute the position of each group on the pie:
const pie = d3.pie()
    .value(function(d) {return d[1]})
const data_ready = pie(Object.entries(d.NameinEnglish))

// shape helper to build arcs:
const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg
    .selectAll('mySlices')
    .data(data_ready)
    .join('path')
    .attr('d', arcGenerator)
    .attr('fill', function(d){ return(color(d.data[0])) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)

// Now add the annotation. Use the centroid method to get the best coordinates
svg
    .selectAll('mySlices')
    .data(data_ready)
    .join('text')
    .text(function(d){ return "grp " + d.data[0]})
    .attr("transform", function(d) { return `translate(${arcGenerator.centroid(d)})`})
    .style("text-anchor", "middle")
    .style("font-size", 17)