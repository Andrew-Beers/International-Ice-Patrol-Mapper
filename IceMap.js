
var IceBegin = false;
var TotalIceList = {Pause:[{date:"05-Mar-1931"},{longitude: 45.5},{latitude: 45.5}]};
var CurrentIceList = [];
var DisplayList = [];
var FilteredList = [];
var iceYears = Array.apply(0, Array(133)).map(function (x, y) { return y+1880; });
var ColorList = [];
var HistList = [];
var Progress = 0;
var AllColors = ["red", "green", "blue", "yellow", "white", "purple", "orange", "gray"];
var LoadTitles = ["Loading 133 years of iceberg data collected from the Coast Guard,", "the US Hydrographic Office, and maritime newspaper sightings..."]
var SubTitles = ["by Andrew Beers", "Data courtesy of", "United States Coast Guard", "and Brian Hill", "Andrew_Beers@brown.edu for more info"];
var HelpTitles = ['Add years to the map by clicking', 'the buttons at right.', 'Change the time period by', 'adjusting the filter below the map.',
                  'Change the display color of the next', 'year using the box at bottom right.']
var PickColor = "red";

function getIceData() {

iceYears.forEach(function(entry){
d3.csv("IceData/IceData" + entry + ".csv")
                        .row(function(d) {
                          return {
                            date: d.date,
                            day: parseInt(DayNumber(new Date(d.date))),
                            year: (1880 + parseInt(YearNumber(new Date(d.date)))),
                            lon: projection([d.longitude, d.latitude])[0],
                            lat: projection([d.longitude, d.latitude])[1],
                            resight: d.resight
                          }})
                        .get(function(error, rows) {
                          TotalIceList[entry] = rows;
                          Progress++;
                          if (Progress == 133){
                            d3.select("#main").style('display', 'block')
                            d3.select("#loading").style('display', 'none')
                          }
                          });

});
}

var Bmargin = {top: 552, right: 0, bottom: 50, left: 0},
    Bheight = 600-Bmargin.top;

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    widthT = 1300 - margin.left - margin.right,
    width1 = 1050 - margin.left,
    width2 = widthT - width1 - margin.right,
    height = 582 - margin.top - margin.bottom + Bmargin.bottom,
    bwidth = (widthT-width1-2)/7;

var wordmargin = 15
    wordtop = 425

var projection = d3.geo.mercator()
    .center([120, 55])
    .scale(660)
    .rotate([-180,0])
    .clipExtent([[0,0],[width1,550]]);

var path = d3.geo.path()
    .projection(projection);

var DayNumber = d3.time.format("%_j");
var YearNumber = d3.time.format("%_y")
var YearColor = d3.scale.ordinal().domain(DisplayList).range(ColorList);
var xHist = d3.scale.linear().domain([0, 366]).range([0, width1]);

var x = d3.time.scale().domain([new Date(2013, 0, 1), new Date(2013, 11, 31)]).range([0, width1]);

var LoadingScreen = d3.select("body").append("svg")
                       .attr("id", "loading")
                       .attr("width", widthT + margin.left + margin.right)
                       .attr("height", height + margin.top + margin.bottom);

LoadingScreen.append("g")
              .attr("class", "TitleText")
              .attr("id", "LoadingText")
              .selectAll("text")
                      .data(LoadTitles)
                      .enter()
                      .append("text")
                      .attr("x", width1/3)
                      .attr("y", function(d,i){return height/2 - 40 + i*28;})
                      .text(function(d){return d;});

var svg = d3.select("body").append("svg")
    .attr("id", "main")
    .attr("width", widthT + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style('display', 'none')
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

var TitleText = svg.append("g").attr("class", "TitleText");

TitleText.append("text")
                  .text("The Grand Banks")
                  .attr("x", wordmargin)
                  .attr("y", wordtop);

TitleText.append("text")
                  .text("Iceberg Mapper")
                  .attr("x", wordmargin)
                  .attr("y", wordtop+25);

var SubTitleText = svg.append("g")
                      .attr("class", "SubTitleText")
                      .selectAll("text")
                      .data(SubTitles)
                      .enter()
                      .append("text")
                      .attr("x", wordmargin+1)
                      .attr("y", function(d,i){return wordtop + 45 + i*15;})
                      .text(function(d){return d;});

var DetailsBox = svg.append("g")
    .attr("class", "HelpTitleText");

DetailsBox.append("rect")
    .attr("x", width1*.8)
    .attr("y", 0)
    .attr("width", width1*.2)
    .attr("height", height/6)
    .attr("fill", "black")
    .attr("stroke", "#0033CC")
    .attr("stroke-width", "1px")
    .attr("shape-rendering", "crispEdges");

DetailsBox.selectAll("text")
                      .data(HelpTitles)
                      .enter()
                      .append("text")
                      .attr("x", width1*.8 + wordmargin/2)
                      .attr("y", function(d,i){return 20 + i*15;})
                      .text(function(d){return d;});
});

var brush = d3.svg.brush()
    .x(x)
    .extent([new Date(2013, 0, 100), new Date(2013, 0, 117)])
    .on("brushend", UpdateIce)
    .on("brush", UpdateIce);

var BrushBackground = svg.append("rect")
    .attr("class", "grid-background")
    .attr("width", width1)
    .attr("height", (Bheight + Bmargin.top))
    .attr("opacity", "0%");

var BrushGrid = svg.append("g")
    .attr("class", "x grid")
    .attr("transform", "translate(0," + (Bheight + Bmargin.top) + ")")
    .attr("shape-rendering", "crispEdges")
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

var colorbuttonbox = svg.append("g")
                        .attr("class", "buttonbox")
                        .append("rect")
                        .attr("x", width1 + 2*bwidth)
                        .attr("y", 550)
                        .attr("height", 50)
                        .attr("width", 3*bwidth)
                        .attr("stroke", "#0033CC")
                        .attr("stroke-width", "1px")
                        .attr("shape-rendering", "crispEdges");

var colorlabel = svg.append("g")
                    .attr("class", "buttonlabels")
                    .append("text")
                    .attr("x", width1 + 2.75*bwidth)
                    .attr("y", 550 + 14)
                    .text("Point Color");

var colorbuttons = svg.append("g")
                      .attr("class", "colorbuttons")
                      .selectAll("circle")
                      .data(AllColors)
                      .enter()
                      .append("circle")
                      .attr("cx", function(d, i){return width1 + 2*bwidth + 22 + (Math.floor(i/2)%4)*20;})
                      .attr("cy", function(d, i){return 550 + 25 + (i%2)*15;})
                      .attr("r", 6)
                      .attr("fill", function(d){return d})
                      .attr("stroke", function(d){if (d == PickColor) {return "#0033CC";}else{return "gray";};})
                      .on("click", function(d){PickColor = d; return;});

var buttonheading = svg.append("g")
                .attr("class", "buttonbox")
                .append("rect")
                .attr("x", width1)
                .attr("y", 0)
                .attr("height", 550/20)
                .attr("width", bwidth*7)
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

var buttonbox = svg.append("g")
                .attr("class", "buttonbox")
                .selectAll("rect")
                .data(iceYears)
                .enter()
                .append("rect")
                .attr("x", function(d, i){return width1+(i%7)*(bwidth);})
                .attr("y", function(d, i){return (Math.floor((i+7)/7)%20)*(550/20);})
                .attr("height", 550/20)
                .attr("width", bwidth)
                .attr("fill", "transparent")
                .attr("stroke", "#0033CC")
                .attr("stroke-width", "1px")
                .attr("shape-rendering", "crispEdges")
                .attr("id", function(d,i) {return "Button" + d;})
                .style('cursor','pointer')
                .on("click", clicked)
                .on('mouseover', buttonin)
                .on("mouseout", buttonout);

var buttonlabel = svg.append("g")
                .attr("class", "buttonlabels")
                .selectAll("text")
                .data(iceYears)
                .enter()
                .append("text")
                .attr("id", function(d,i) {return "Label" + d;})
                .style('cursor','pointer')
                .attr("x", function(d, i){return width1+(i%7)*(bwidth)+(bwidth/7);})
                .attr("y", function(d, i){return (Math.floor((i+7)/7)%20)*(550/20)+550/20/1.5;})
                .text(function(d){return d;})
                .on("click", clicked)
                .on('mouseover', buttonin)
                .on("mouseout", buttonout);

var IceIn;

function buttonin(){
d3.select("#Button" + this.__data__).transition()
                        .ease('cubic-out')
                        .duration('200')
                        .attr("fill", PickColor)
                        .attr("stroke", "#0033CC")
                        .attr("fill-opacity", 0.2)
                        .attr("stroke-opacity", 1)
}

function buttonout(){
d3.select("#Button" + this.__data__).transition()
                        .ease('cubic-out')
                        .duration('200')
                        .attr("fill", "transparent")
                        .attr("stroke", "#0033CC")
                        .attr("opacity", 1)
}

function clicked(d) {

  if (DisplayList.indexOf(this.__data__) > -1) {
    DisplayList.splice(DisplayList.indexOf(this.__data__), 1);
    ColorList.splice(ColorList.indexOf(this.__data__), 1);
    HistList.splice(HistList.indexOf(this.__data__), 1);
    d3.select("#Button" + this.__data__).attr("fill", "transparent").attr("stroke", "#0033CC").attr("opacity", 1);
    d3.select("#Button" + this.__data__).on('mouseout', buttonout).on('mouseover', buttonin);
    d3.select("#Label" + this.__data__).on('mouseout', buttonout).on('mouseover', buttonin);
    DestroyHist(this.__data__);
  }
  else {
  DisplayList.push(this.__data__);
  ColorList.push(PickColor);
  YearColor.domain(DisplayList);
  d3.select("#Button" + this.__data__).attr("fill", YearColor(this.__data__)).attr("stroke", "#0033CC").attr("fill-opacity", 0.4).attr("stroke-opacity", 1);
  d3.select("#Button" + this.__data__).on('mouseout', null).on('mouseover', null);
  d3.select("#Label" + this.__data__).on('mouseout', null).on('mouseover', null);
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
  YearColor = d3.scale.ordinal().domain(DisplayList).range(ColorList);
  UpdateIce();

  console.log(DisplayList)
  console.log(ColorList)
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

var bar = svg.append("g").attr("class", "Bar" + Year)

bar.selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("opacity", "60%")
    .attr("x", function(d){return xHist(d.x)})
    .attr("y", 600)
    .attr("width", xHist(data[0].dx) - 1)
    .attr("height", 0)
    .attr("fill", YearColor(Year));

svg.selectAll("g.Bar" + Year).selectAll("rect").transition()
    .duration(500)
    .attr("y", function(d){return yHist(d.y)})
    .attr("height", function(d) { return 600 - yHist(d.y); });

}

function DestroyHist(Year) {
  svg.selectAll("g.Bar" + Year).selectAll("rect").transition().duration(500).attr("height", 0).attr("y", 600).remove();
}

getIceData();

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
