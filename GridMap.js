var IceBegin = false;
var TotalIceList = {"Pause":[{"date":"05-Mar-1931"},{"longitude": 45.5},{"latitude": 45.5}]};
var CurrentIceList = [];
var DisplayList = [];
var FilteredList = [];
var iceYears = Array.apply(0, Array(60)).map(function (x, y) { return y+1900; });
var ColorList = [];
var HistList = [];
var HistDraw = [];
var Progress = [];
var AllColors = ["red", "green", "blue", "yellow", "white", "purple", "orange", "gray"];
var PickColor = "red";

var Bmargin = {top: 552, right: 0, bottom: 50, left: 0}
    Bheight = 600-Bmargin.top;

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    widthT = 1300 - margin.left - margin.right,
    width1 = 1050 - margin.left,
    width2 = widthT - width1 - margin.right
    height = 582 - margin.top - margin.bottom + Bmargin.bottom;
    bwidth = (widthT-width1-2)/3;

var projection = d3.geo.mercator()
    .center([120, 55])
    .scale(660)
    .rotate([-180,0])
    .clipExtent([[0,0],[width1,550]]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", widthT + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("ne_50m_land.json", function(error, topology) {

    svg.append("g").attr("class","MapPath").selectAll("path")
      .data(topojson.object(topology, topology.objects.ne_50m_land).geometries)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke", "#0033CC")
      .attr("stroke-width", "1px")
      .attr("box-shadow", "0 0 20px #0099CC")
      .attr("fill","steelblue");

var TitleText = svg.append("g")
                  .attr("class", "TitleText")
                  .append("text")
                  .text("International Ice Patrol")
                  .attr("x", 25)
                  .attr("y", 380);

svg.append("g").attr("class", "TitleText").append("text")
                  .text("Ice Mapper")
                  .attr("x", 25)
                  .attr("y", 405)

svg.append("g").attr("class", "TitleText").append("text")
                  .text("by Andrew Beers")
                  .attr("font-size", "12px")
                  .attr("x", 26)
                  .attr("y", 425)

svg.append("g").attr("class", "TitleText").append("text")
                  .text("Data Courtesy")
                  .attr("font-size", "12px")
                  .attr("x", 26)
                  .attr("y", 440)

svg.append("g").attr("class", "TitleText").append("text")
                  .text("United State Coast Guard")
                  .attr("font-size", "12px")
                  .attr("x", 26)
                  .attr("y", 455)


      // svg.append("g").attr("class", "Title").append("text").text("International Ice Patrol \n Mapper").attr("x", 50).attr("y",)
});