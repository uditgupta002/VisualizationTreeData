var nodes_data = [];
var links_data = [];

d3.csv("data/annotate_posts_of_thread_length30.csv", function(error, data) {
    if (error) {
        throw error;
    }

    data.forEach(function(d) {
        var obj = {
            "index" : "d.index",
            "author" : d.Author,
            "DateTimeStamp" : d.DateTimeStamp,
            "Body" : d.Body,
            "Thread" : d.Thread,
            "PostsinThread" : d.PostsInThread,
            //"psuedoId" : d.psuedoId,
            "id" : d.ID
        };
        if(d.parentId != null && d.parentId !== '')
            obj["parentId"] = d.parentId;
        else
            obj["parentId"] = "Root";
        nodes_data.push(obj);
    });
    nodes_data.push({id: "Root"});

    var stratified_data = d3.stratify()(nodes_data);

    // set the dimensions and margins of the diagram
    var margin = {top: 40, right: 90, bottom: 50, left: 90},
        height = 800 - margin.top - margin.bottom;

    var leafNodes = Math.pow(2, stratified_data.height);
    var width = 1200;

    width = Math.max(width, leafNodes * 230 * 4);
    // declares a tree layout and assigns the size
    var treemap = d3.tree()
        .size([width, height]);

    //  assigns the data to a hierarchy using parent-child relationships
    //var nodes = d3.hierarchy(treeData);
    var nodes = stratified_data;
    //var nodes = nodes_data;
    // maps the node data to the tree layout
    nodes = treemap(nodes);
    var descendents = nodes.descendants().slice(1);

    descendents.forEach(function(d) { d.y = d.depth * 400 * 2; });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height * (stratified_data.height + 1) + margin.bottom + margin.top);

    //         .call(d3.zoom()
    //             .scaleExtent([1 / 8, 8])
    //             .on("zoom", zoomed));
    //
    // function zoomed() {
    //     svg.attr("transform", d3.event.transform);
    // }

    var g = svg.append("g")
            .attr("transform", "translate(" + margin.right + "," + margin.top + ")");


    // adds the links between the nodes
    var link = g.selectAll(".link")
        .data( nodes.descendants().slice(1))
        .enter()
        .append("path")
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


    appendData(node);

    function appendData(node) {
        var rect = node.append("rect")
            .attr("x", function(d) {
                var width = 115 * 2;
                return -width / 2;
            })
            .attr("y", 0)
            .attr("width",115 * 2)
            .attr("height",150 * 2)
            .style("stroke","black")
            .style("fill", "White");

        var text = node.append('svg:text')
            .attr('y', 0)
            .attr("text-anchor", "middle")
            .attr('class', 'id');

        text.selectAll("tspan.text")
            .data(function(d) {
                var dataList = [];
                if(d.data.Body != null) {
                    dataList.push("Id: " + d.data.id + " Author: " + d.data.author);
                    for (var i = 0; i < d.data.Body.length && dataList.length < 13; i += 33) {
                        dataList.push(d.data.Body.substring(i, i + 33));
                    }
                } else {
                    dataList.push("Id: " + d.data.id);
                    dataList.push("Total Conversations: " + d.children.length);
                }
                return dataList;
            })
            .enter()
            .append("tspan")
            .attr("class", "text")
            .text(function(d) { return d; })
            .attr("x", 0)
            .attr("dy", 22);
    }




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
                var str = data[key];
                html += "<tr>" +
                        "<td>" + key + "</td>" +
                        "<td class=\"cell-breakWord\">" + str + "</td>" +
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