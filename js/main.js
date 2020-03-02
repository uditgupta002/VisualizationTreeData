
//Load External Data
nodes_data = [];
links_data = [];

d3.csv("data/anand_project_data.csv", function(error, data) {
    if (error) {
        throw error;
    }
    data.forEach(function(d) {
        obj = {"id" : d.id,
            "index" : d.index,
            "author" : d.author,
            "DateTimeStamp" : d.DateTimeStamp,
            "Body" : d.Body,
            "Thread" : d.Thread,
            "PostsinThread" : d.PostsinThread
        };
        nodes_data.push(obj);
    });
});

console.log(nodes_data);

/*
d3.csv("data/links.csv", function(error, data) {
    if (error) {
        throw error;
    }
    data.forEach(function(d) {
        links_data.push({source : d.parent_id, target :d.child_id});
    });
});



 */

nodes_data =  [
    {"name": "Lillian", "sex": "F"},
    {"name": "Gordon", "sex": "M"},
    {"name": "Sylvester", "sex": "M"}
];


links_data = [
    {"source": "Sylvester", "target": "Gordon", "type":"A" },
    {"source": "Sylvester", "target": "Lillian", "type":"A" }
    ];

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

console.log(nodes_data);
console.log(links_data);

var simulation = d3.forceSimulation()
    .nodes(nodes_data)
    .force("link", d3.forceLink(links_data).id(function(d) { return d.name; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links_data)
    .enter()
    .append("line");
    //.attr("stroke-width", function(d) { return Math.sqrt(d.value); });

var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes_data)
    .enter()
    .append("g");

simulation.on("tick",ticked);

/*
var circles = node.append("circle")
    .attr("r", 5)
    .attr("fill", function(d) { return color(d.name); })
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

var lables = node.append("text")
    .text(function(d) {
        return d.name;
    }).attr('x', 6)
    .attr('y', 3);

node.append("title")
    .text(function(d) { return d.name; });

*/


function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

