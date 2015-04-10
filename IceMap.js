
var IceBegin = false;
var TotalIceList = {"Pause":[{"date":"05-Mar-1931"},{"longitude": 45.5},{"latitude": 45.5}]};
var CurrentIceList = [];
var DisplayList = [];
var FilteredList = [];
var iceYears = Array.apply(0, Array(114)).map(function (x, y) { return y+1900; });
var ColorList = [];
var HistList = [];
var HistDraw = [];
var Progress = [];
var AllColors = ["red", "green", "blue", "yellow", "white", "purple", "orange", "gray"];
var PickColor = "red";
var SizeNums = [];
var Sizes = [];

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

d3.selection.prototype.moveToBack = function() { 
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    }); 
};

queue(1)
  .defer(getIceData);                    

function getIceData() {

iceYears.forEach(function(entry){ 

d3.csv("IceData/IceData" + entry + ".csv")
                        .row(function(d) {
                          return {
                            date: d.date,
                            day: parseInt(DayNumber(new Date(d.date))),
                            year: (1900 + parseInt(YearNumber(new Date(d.date)))),
                            lon: projection([d.longitude, d.latitude])[0],
                            lat: projection([d.longitude, d.latitude])[1],
                            resight: d.resight
                          }})
                        .get(function(error, rows) {
                          TotalIceList[entry] = rows;
                          Progress.push(1);
                          });

});
}

var Bmargin = {top: 552, right: 0, bottom: 50, left: 0}
    Bheight = 600-Bmargin.top;

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    widthT = 1300 - margin.left - margin.right,
    width1 = 1050 - margin.left,
    width2 = widthT - width1 - margin.right
    height = 582 - margin.top - margin.bottom + Bmargin.bottom;
    bwidth = (widthT-width1-2)/6;

var projection = d3.geo.mercator()
    .center([120, 55])
    .scale(660)
    .rotate([-180,0])
    .clipExtent([[0,0],[width1,550]]);

var path = d3.geo.path()
    .projection(projection);

var DayNumber = d3.time.format("%_j");
var YearNumber = d3.time.format("%_y")
var YearColor = d3.scale.ordinal().domain(iceYears).range(ColorList);
var xHist = d3.scale.linear().domain([0, 366]).range([0, width1]);

var x = d3.time.scale().domain([new Date(2013, 0, 1), new Date(2013, 11, 31)]).range([0, width1]);

var svg = d3.select("body").append("svg")
    .attr("width", widthT + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var LoadingScreen = svg.append("g")
                       .attr("class", "TitleText")
                       .append("text")
                       .text("Loading 60 Years of Data...")
                       .attr("x", 500)
                       .attr("y", 225);

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
                  .text("Data courtesy of")
                  .attr("font-size", "12px")
                  .attr("x", 26)
                  .attr("y", 440)

svg.append("g").attr("class", "TitleText").append("text")
                  .text("United States Coast Guard")
                  .attr("font-size", "12px")
                  .attr("x", 26)
                  .attr("y", 455)

svg.append("g").attr("class", "TitleText").append("text")
                  .text("and Brian Hill")
                  .attr("font-size", "12px")
                  .attr("x", 26)
                  .attr("y", 470)


      // svg.append("g").attr("class", "Title").append("text").text("International Ice Patrol \n Mapper").attr("x", 50).attr("y",)
});

var brush = d3.svg.brush()
    .x(x)
    .extent([new Date(2013, 0, 100), new Date(2013, 0, 117)])
    .on("brushend", brushended)
    .on("brush", UpdateIce);

var BrushBackground = svg.append("rect")
    .attr("class", "grid-background")
    .attr("width", width1)
    .attr("height", (Bheight + Bmargin.top))
    .attr("opacity", "0%");

var BrushGrid = svg.append("g")
    .attr("class", "x grid")
    .attr("transform", "translate(0," + (Bheight + Bmargin.top) + ")")
    .call(d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.months, 1)
        .tickSize(-Bheight)
        .tickFormat(""));

var BrushAxis = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (Bheight + Bmargin.top) + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(d3.time.months)
      .tickPadding(0)
      .tickFormat(d3.time.format("%B")))
  .selectAll("text")
  .style("fill", "white")
    .attr("x", 6)
    .style("text-anchor", null);

var gBrush = svg.append("g")
    .attr("class", "brush")
    .attr("transform", "translate(0," + (Bmargin.top) + ")")
    .call(brush)
    .call(brush.event)
    .selectAll("rect")
    .attr("height", Bheight);

// var animateB = svg.append("g")
//                   .attr("class", animateB)
//                   .append("rect")
//                   .attr("x", width1+2)
//                   .attr("y", 552)
//                   .attr("width", bwidth-4)
//                   .attr("height", 48)
//                   .attr("stroke", "red")
//                   .attr("stroke-width", "1px")
//                   .attr("shape-rendering", "crispEdges")
//                   .on("click", animateButton);

// var animateBtext = svg.append("g")
//                   .attr("class", animateBtext)
//                   .append("text")
//                   .text("Animate")
//                   .attr("x", width1+bwidth/4)
//                   .attr("y", 552+48/1.7)
//                   .style("fill", "white")
//                   .style("font", "11px sans-serif")
//                   .attr("shape-rendering", "crispEdges");
// <<<<<<< HEAD:index.html

var colorbuttonbox = svg.append("g")
                        .attr("class", "colorbox")
                        .append("rect")
                        .attr("x", width1 + 2*bwidth)
                        .attr("y", 550)
                        .attr("height", 50)
                        .attr("width", 2*bwidth)
                        .attr("stroke", "#0033CC")
                        .attr("stroke-width", "1px")
                        .attr("shape-rendering", "crispEdges");

var colorlabel = svg.append("g")
                    .attr("class", "buttonlabels")
                    .append("text")
                    .attr("x", width1 + 2*bwidth + 12)
                    .attr("y", 550 + 14)
                    .text("Color Picker");

var colorbuttons = svg.append("g")
                      .attr("class", "colorbuttons")
                      .selectAll("circle")
                      .data(AllColors)
                      .enter()
                      .append("circle")
                      .attr("cx", function(d, i){return width1 + 2*bwidth + 20 + (Math.floor(i/2)%4)*15;})
                      .attr("cy", function(d, i){return 550 + 25 + (i%2)*15;})
                      .attr("r", 6)
                      .attr("fill", function(d){return d})
                      .attr("stroke", function(d){if (d == PickColor) {return "#0033CC";}else{return "gray";};})
                      .attr("stroke-width", "1px")
                      .attr("shape-rendering", "crispEdges")
                      .on("click", function(d){console.log(d); PickColor = d; return;}); 

var buttonheading = svg.append("g")
                .attr("class", "buttonbox")
                .append("rect")
                .attr("x", width1)
                .attr("y", 0)
                .attr("height", 550/20)
                .attr("width", bwidth*6)
                .attr("fill", "transparent")
                .attr("stroke", "#0033CC")
                .attr("stroke-width", "1px")
                .attr("shape-rendering", "crispEdges")

var buttonheadinglabel = svg.append("g")
                .attr("class", "buttonlabels")
                .append("text")
                .attr("x", width1 + bwidth/1.5)
                .attr("y", 550/20/1.5)
                .text("Select a year to display its iceberg map.")

var buttonlabel = svg.append("g")
                .attr("class", "buttonlabels")
                .selectAll("text")
                .data(iceYears)
                .enter()
                .append("text")
                .attr("x", function(d, i){return width1+(i%6)*(bwidth)+(bwidth/6);})
                .attr("y", function(d, i){return (Math.floor((i+6)/6)%20)*(550/20)+550/20/1.5;})
                .text(function(d){return d;})

var buttonbox = svg.append("g")
                .attr("class", "buttonbox")
                .selectAll("rect")
                .data(iceYears)
                .enter()
                .append("rect")
                .attr("x", function(d, i){return width1+(i%6)*(bwidth);})
                .attr("y", function(d, i){return (Math.floor((i+6)/6)%20)*(550/20);})
                .attr("height", 550/20)
                .attr("width", bwidth)
                .attr("fill", "transparent")
                .attr("stroke", "#0033CC")
                .attr("stroke-width", "1px")
                .attr("shape-rendering", "crispEdges")
                .on("click", clicked);

// var buttons = svg.append("g")
//                 .attr("class", "buttons")
//                 .selectAll("rect")
//                 .data(iceYears)
//                 .enter()
//                 .append("rect")
//                 .attr("x", function(d, i){return width1+(i%6)*(bwidth)+(bwidth/1.6);})
//                 .attr("y", function(d, i){return (Math.floor(i/6)%20)*(550/20)+(550/20*1/4);})
//                 .attr("height", 550/20*1/2)
//                 .attr("width", bwidth*1/4)
//                 .attr("fill", "black")
//                 .attr("stroke", "gray")
//                 .attr("stroke-width", "1px")
//                 .attr("shape-rendering", "crispEdges")
                // .on("click", clicked);

var IceIn;

// function animateButton() {
// var Size = parseInt(DayNumber(new Date(brush.extent()[1]))) - parseInt(DayNumber(new Date(brush.extent()[0])));

// // gBrush.call(brush.event)
// //       .transition()
// //       .duration(10000)
// //       .ease("linear")
// //       .call(brush.extent([new Date(2013,11,31-Size), new Date(2013,11,31)]))
// //       .call(brush.event);
// //   // brush.event(d3.select(".brush").transition().ease("linear"));
//   gBrush.transition()
//   .duration(750)
//   .call(brush.extent([new Date(2013, 0, 1), new Date(2013, 0, 300)]))
//   .call(brush.event);
// gBrush.call(brush.event)
//       .transition()
//       .duration(10000)
//       .ease("linear")
//       .call(brush.extent([new Date(2013,11,31-Size), new Date(2013,11,31)]))
//       .call(brush.event);
//   // brush.event(d3.select(".brush").transition().ease("linear"));
//   // gBrush.transition()
//   // .duration(750)
//   // .call(brush.extent([new Date(2013, 0, 1), new Date(2013, 0, 300)]))
//   // .call(brush.event);
// }

function clicked(d) {

  if (DisplayList.indexOf(this.__data__) > -1) {
    DisplayList.splice(DisplayList.indexOf(this.__data__), 1);
    ColorList.splice(ColorList.indexOf(this.__data__), 1);
    HistList.splice(HistList.indexOf(this.__data__), 1);
    d3.select(this).attr("fill", "transparent").attr("stroke", "#0033CC").attr("opacity", 1);
    DestroyHist(this.__data__);
  }
  else {
  DisplayList.push(this.__data__);
  ColorList.push(PickColor);
  YearColor.domain(DisplayList);
  d3.select(this).attr("fill", YearColor(this.__data__)).attr("stroke", "#0033CC").attr("fill-opacity", 0.2).attr("stroke-opacity", 1);
  GenerateHist(this.__data__);
  }

  if (DisplayList.length == 0){
  CurrentIceList = [];
  UpdateIce();
  IceBegin = true;
  }
  else {
  CurrentIceList = [];
  DisplayList.forEach(function(entry){
  CurrentIceList = CurrentIceList.concat(TotalIceList[entry]);
  });
  IceBegin = true;
  }
  UpdateIce();
}

function GenerateHist(Year) {

HistList.push(Year);
var HistData = [];
TotalIceList[Year].forEach(function(entry){
HistData = HistData.concat(entry.day);
});

var data = d3.layout.histogram()
    .bins(xHist.ticks(365))
    (HistData);

var yHist = d3.scale.linear().domain([0, d3.max(data, function(d) { return d.y; })]).range([600, 552]);

var bar = svg.selectAll(".bar" + Year)
    .data(data)
    .enter().append("g")
    .attr("class", "bar" + Year)
    .attr("transform", function(d) { return "translate(" + xHist(d.x) + "," + yHist(d.y) + ")"; });

bar.append("rect")
    .attr("width", xHist(data[0].dx) - 1)
    .attr("height", function(d) { return 600 - yHist(d.y); })
    .attr("fill", YearColor(Year))
    .attr("opacity", "60%");

}

function DestroyHist(Year) {
  svg.selectAll("g.bar" + Year).remove();
}

function brushended() {
UpdateIce();
}

function UpdateIce() {

if (IceBegin){
StartingDay = parseInt(DayNumber(new Date(brush.extent()[0])));
EndingDay = parseInt(DayNumber(new Date(brush.extent()[1])));

FilteredList = CurrentIceList.filter(function(d) {
                return (d.day >= StartingDay 
                && d.day <= EndingDay
                && d.resight == 0);
            });};

IceIn = svg.selectAll('.icepoints').data(FilteredList)

IceIn.exit().remove();

IceIn.enter().append("circle").classed("icepoints", true);

IceIn.attr("cx", function(d){return d.lon;})
            .attr("cy", function(d){return d.lat;})
            .attr("r", 2)
           .attr("fill", function(d){return YearColor(d.year);})
           .attr("fill-opacity", "60%");
}
