var nodes_data = [];
var links_data = [];

d3.csv("data/anand_project_data.csv", function(error, data) {
    if (error) {
        throw error;
    }

    data.forEach(function(d) {
        var obj = {
            "index" : d.index,
            "author" : d.author,
            "DateTimeStamp" : d.DateTimeStamp,
            "Body" : d.Body,
            "Thread" : d.Thread,
            "PostsinThread" : d.PostsinThread,
            "psuedoId" : d.psuedoId,
            "id" : d.id
        };
        console.log(d.parentId);
        if(d.parentId != null && d.parentId !== '')
            obj["parentId"] = d.parentId;
        else
            obj["parentId"] = "Root";
        nodes_data.push(obj);
    });
    nodes_data.push({id: "Root"});

    var stratified_data = d3.stratify()(nodes_data);
    console.log(stratified_data)


    // set the dimensions and margins of the diagram
    var margin = {top: 40, right: 90, bottom: 50, left: 90},
        width = 1000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // declares a tree layout and assigns the size
    var treemap = d3.tree()
        .size([width, height]);

    //  assigns the data to a hierarchy using parent-child relationships
    //var nodes = d3.hierarchy(treeData);
    var nodes = stratified_data;
    //var nodes = nodes_data;
    // maps the node data to the tree layout
    nodes = treemap(nodes);


    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom),
        g = svg.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    // adds the links between the nodes
    var link = g.selectAll(".link")
        .data( nodes.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", function(d) {
            return "M" + d.x + "," + d.y
                + "C" + d.x + "," + (d.y + d.parent.y) / 2
                + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
                + " " + d.parent.x + "," + d.parent.y;
        });

    // adds each node as a group
    var node = g.selectAll(".node")
        .data(nodes.descendants())
        .enter()
        .append("g")
        .attr("class", function(d) {
            return "node" +
                (d.children ? " node--internal" : " node--leaf"); })
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; });

    // adds the circle to the node
    node.append("circle")
        .attr("r", 10);

    // adds the text to the node
    node.append("text")
        .attr("dy", ".35em")
        .attr("x", function(d) { return d.children ? -40 : 0; })
        .attr("y", function(d) { return d.children ? 0 : 20; })
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.id; });



    function fade(opacity) {
        return d => {
                node.style('stroke-opacity', function (o) {
                    const thisOpacity = opacity;
                    this.setAttribute('fill-opacity', thisOpacity);
                    return thisOpacity;
                });

                link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));

            };
        }

        var tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


    function formatData(data) {
        var html = "<table style=\"width:75%\">" +
            "<thead>" +
            "<tr>" +
            "<td>Attribute</td><td>Value</td>" +
            "</tr>" +
            "</thead>" +
            "<tbody>";
            for (var key in data) {
                html += "<tr>" +
                        "<td>" + key + "</td>" +
                        "<td class=\"cell-breakWord\">" + data[key] + "</td>" +
                        "</tr>";
            }
            html += "</tr></tbody>" +
            "</table>";
            return html
    }

    node.on('mouseover.tooltip', function(d) {
            tooltip.transition()
                .duration(300)
                .style("opacity", .8);

            tooltip.html(formatData(d.data))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        }).on("mouseout.tooltip", function() {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        }).on('mouseout.fade', fade(1))
        .on("mousemove", function() {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 10) + "px");
        });

});