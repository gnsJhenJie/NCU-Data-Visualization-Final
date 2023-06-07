d3.csv("../data/World_Bank_labol_force_data.csv", preprocess).then(
    data => {
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(
            geoFeatures => {
                // console.log(data)
                geoFeatures.features.forEach(
                    function(feature){
                        var id = feature.id
                        countryData = data.find((row) => row["Country Code"] === id)
                        feature.countryData = Object()
                        feature.countryData = Object.assign(feature.countryData, countryData)                    
                    }
                )
                // console.log(geoFeatures.features[0]);
                init(geoFeatures);
            }
        );
    }
);

const TypeMap = [
    "Total population",
    "Public Sector",
    "Agriculture",
    "Industry",
    "Services",
    "Mining",
    "Manufacturing",
    "Electricity & Utilities",
    "Construction",
    "Commerce",
    "Transport & Communication",
    "Financial & Business",
    "Public Administration",
    "Other Services"
]

const incomeColorScale = d3.scaleOrdinal().domain(['Low income', 'Lower middle income', 'Upper middle income', 'High income']).range(d3.schemeRdYlGn[4]);
const ColorScaleMap = [
    d3.scaleThreshold().domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000]).range(d3.schemeBlues[7]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemeReds[9]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemeGreens[9]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemeGreys[9]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemePurples[9]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemeOranges[9]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemeGreys[9]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemeOranges[9]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemeBlues[9]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemeGreens[9]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemePurples[9]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemeGreens[9]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemeOranges[9]),
    d3.scaleThreshold().domain([0, 0.01, 0.3, 0.10, 0.15, 0.25, 0.5, 0.75, 1]).range(d3.schemeReds[9]),
]
const TOTAL_LABEL = TypeMap.length;
var currentType = 6;
var colorlegend = d3.select("#colorlegend");


const tip = d3.select('.tooltip');
// The svg
var svg = d3.select("svg"),
  svg_width = +svg.attr("width"),
  svg_height = +svg.attr("height");
const chart_margin = {top: 40, right: 40, bottom: 40, left: 40};
const chart_width = svg_width - (chart_margin.left + chart_margin.right);
const chart_height = svg_height - (chart_margin.top + chart_margin.bottom);
  
  
  // Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(120)
  .center([0,20])
  .translate([chart_width / 2, chart_height / 2]);


// convert index to label
const indexToLabel = value => { return TypeMap[value];}
const SPLICE_NUM = 4;


function init(geoFeatures){
    const slider = document.getElementById('slider');
    noUiSlider.create(slider, {
        range: range = {
            'min': 0,
            'max': TOTAL_LABEL-1
        },
        start: currentType,
        step: 1,
        tooltips: {
            to: indexToLabel
        },
        pips: {
            mode: 'steps',
            density: -1,
            format: {
                to: indexToLabel
            }
        },
        format: {
            to: function (value) {
              return value;
            },
            from: function (value) {
              return value;
            }
        }
    });
    slider.noUiSlider.on('update', function(values, handle) {
        // todo
        currentType = values[handle];
        drawMap(geoFeatures);
        drawColorLegend();
    });

    drawMap(geoFeatures)
}


function drawMap(topo) {
    // draw header
    let header = svg.select('#header').attr('class', 'bar-header')
    .attr('transform', `translate(${svg_width/2}, ${chart_margin.top/2})`)
    
    .selectAll('text');
    header.selectAll('tspan').remove();
    header.append('tspan').text('World Bank Labol Force Data').style('font-size', '20px');
    header.append('tspan').text(`${TypeMap[currentType]}`).attr('x', 0).attr('dy', '1.5em').attr('class', 'bar-subheader');

    let mouseOver = function(e) {
        d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .5)
        .style("stroke", "transparent")
        d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black")

        const thisBarData = d3.select(this).data()[0];
        const countryData = thisBarData.countryData;

        // console.log(e)
        tip.transition()
            .style('left', svg_width + 'px')
            .style('top', chart_margin.top + 'px')
            .style('opacity', 0.98);
        tip.select('h3').html(`${thisBarData.properties.name}, ${thisBarData.id}`);
        tip.select('h4').html(
            `${countryData["Income Level Name"] === undefined ? "" : countryData["Income Level Name"]}`
        ).style('color', incomeColorScale(countryData["Income Level Name"]));


        if (countryData["Other Services"] === undefined){
            tip.select('.tip-body').selectAll('p').data(['No Data'])
            .join('p')
            .attr('class', 'tip-info')
            .html(d=> d);
        }else{
            console.log()
            tip.select('.tip-body').selectAll('p').data(Object.keys(countryData).splice(SPLICE_NUM))
            .join('p')
            .attr('class', 'tip-info')
            .html(d=> `${d} : ${countryData[d]}`);
        }
    }   

    let mouseLeave = function(d) {
        d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .8)
        d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
                tip.transition()
        .style('opacity', 0);
    }

    // Draw the map
    svg.selectAll("path").remove();

    svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    // draw each country
    .attr("d", d3.geoPath().projection(projection))
    // set the color of each country
    .attr("fill", "transparent")
    .attr("fill", function (d) {
    d.total = d.countryData[indexToLabel(currentType)] || 0;
    return ColorScaleMap[currentType](d.total);
    })
    .style("stroke", "transparent")
    .attr("class", function(d){ return "Country" } )
    .style("opacity", .8)
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave)
}


function preprocess(d){
    return {
        "Country Name": d["Country Name"],
        "Country Code": d["Country Code"],
        "Income Level Name": d["Income Level Name"],
        "Region Code": d["Region Code"],
        // Income_Level_Code: d["Income Level Code"],
        "Total population": +d["Total population"],
        "Public Sector": +d["Public sector employment, aged 15-64"],
        "Agriculture": +d[" Agriculture, aged 15-64"],
        "Industry": +d[" Industry, aged 15-64"],
        "Services": +d[" Services, aged 15-64"],
        "Mining": +d["Mining, aged 15-64"],
        "Manufacturing": +d["Manufacturing, aged 15-64"],
        "Electricity & Utilities": +d["Electricity and utilities, aged 15-64"],
        "Construction": +d["Construction, aged 15-64"],
        "Commerce": +d["Commerce, aged 15-64"],
        "Transport & Communication": +d["Transport & Communication, aged 15-64"],
        "Financial & Business": +d["Financial and Business Services, aged 15-64"],
        "Public Administration": +d["Public Administration, aged 15-64"],
        "Other Services": +d["Other services, aged 15-64"],
    }
};

function formatTicks(d){ //?
    return d3.format('~s')(d)
    .replace('M', 'mil')
    .replace('G', 'bil')
    .replace('T', 'tri')
}

function drawColorLegend(){
    var colorScale = ColorScaleMap[currentType];
    const legendWidth = 200;
    const legendHeight = 20;


    colorlegend.attr("x", 0)
    .attr("y", 0)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#color-gradient)");


    var gradient = colorlegend.append("defs")
    .append("linearGradient")
    .attr("id", "color-gradient");

    gradient.selectAll("stop")
    .data(colorScale.ticks(10))
    .enter().append("stop")
    .attr("offset", function(d) {
        return ((d - colorScale.domain()[0]) / (colorScale.domain()[1] - colorScale.domain()[0])) * 100 + "%";
    })
    .attr("stop-color", function(d) {
        return colorScale(d);
    });
}
