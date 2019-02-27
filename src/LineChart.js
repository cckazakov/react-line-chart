import React from 'react';
import d3 from 'd3';
import './custom.css';

class LineChart extends React.Component {
  
    componentDidMount() {
        this.drawChart();
    }
    
    drawChart() {      
            
      const myData = "date	New York	San Francisco	Austin\n\
20180101	63.4	62.7	72.2\n\
20180201	60.8	59.2	70.0\n\
20180301	62.1	58.9	61.6\n\
20180401	65.1	57.2	57.4\n\
20180501	55.6	56.4	64.3\n\
20180601	54.4	60.7	72.4\n";

     const margin = {
          top: 50,
          right: 80,
          bottom: 30,
          left: 50
        },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
  
      const parseDate = d3.time.format("%Y%m%d").parse;
  
      const x = d3.time.scale()
        .range([0, width]);
  
      const y = d3.scale.linear()
        .range([height, 0]);
  
      let color = d3.scale.category10();
  
      let xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
  
      let yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
  
      let line = d3.svg.line()
        .x(function(d) {
          return x(d.date);
        })
        .y(function(d) {
          return y(d.temperature);
        });
  
      let svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
      let data = d3.tsv.parse(myData);
  
      color.domain(d3.keys(data[0]).filter(function(key) {
        return key !== "date";
      }));
  
      data.forEach(function(d) {
        d.date = parseDate(d.date);
      });
  
      let cities = color.domain().map(function(name) {
        return {
          name: name,
          values: data.map(function(d) {
            return {
              date: d.date,
              temperature: +d[name]
            };
          })
        };
      });
  
      x.domain(d3.extent(data, function(d) {
        return d.date;
      }));
  
      y.domain([
        d3.min(cities, function(c) {
          return d3.min(c.values, function(v) {
            return v.temperature;
          });
        }),
        d3.max(cities, function(c) {
          return d3.max(c.values, function(v) {
            return v.temperature;
          });
        })
      ]);
  
      let legend = svg.selectAll('g')
        .data(cities)
        .enter()
        .append('g')
        .attr('class', 'legend');
  
      legend.append('rect')
        .attr('x', width - 20)
        .attr('y', function(d, i) {
          return i * 20;
        })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function(d) {
          return color(d.name);
        });
  
      legend.append('text')
        .attr('x', width - 8)
        .attr('y', function(d, i) {
          return (i * 20) + 9;
        })
        .text(function(d) {
          return d.name;
        });
  
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
  
      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Temperature (ºF)");
  
      let city = svg.selectAll(".city")
        .data(cities)
        .enter().append("g")
        .attr("class", "city");
  
      city.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
          return line(d.values);
        })
        .style("stroke", function(d) {
          return color(d.name);
        });
  
      city.append("text")
        .datum(function(d) {
          return {
            name: d.name,
            value: d.values[d.values.length - 1]
          };
        })
        .attr("transform", function(d) {
          return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")";
        })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) {
          return d.name;
        });
  
      let mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");
  
      mouseG.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");
        
      let lines = document.getElementsByClassName('line');
  
      let mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(cities)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");
  
      mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", function(d) {
          return color(d.name);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");
  
      mousePerLine.append("text")
        .attr("transform", "translate(10,3)");
  
      mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', width) // can't catch mouse events on a g element
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function() { // on mouse out hide line, circles and text
          d3.select(".mouse-line")
            .style("opacity", "0");
          d3.selectAll(".mouse-per-line circle")
            .style("opacity", "0");
          d3.selectAll(".mouse-per-line text")
            .style("opacity", "0");
        })
        .on('mouseover', function() { // on mouse in show line, circles and text
          d3.select(".mouse-line")
            .style("opacity", "1");
          d3.selectAll(".mouse-per-line circle")
            .style("opacity", "1");
          d3.selectAll(".mouse-per-line text")
            .style("opacity", "1");
        })
        .on('mousemove', function() { // mouse moving over canvas
          let mouse = d3.mouse(this);
          d3.select(".mouse-line")
            .attr("d", function() {
              let d = "M" + mouse[0] + "," + height;
              d += " " + mouse[0] + "," + 0;
              return d;
            });
  
          d3.selectAll(".mouse-per-line")
            .attr("transform", function(d, i) {
              
              let beginning = 0,
                  end = lines[i].getTotalLength(),
                  target = null;
  
              while (true){
                target = Math.floor((beginning + end) / 2);
                var pos = lines[i].getPointAtLength(target);
                if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                    break;
                }
                if (pos.x > mouse[0])      end = target;
                else if (pos.x < mouse[0]) beginning = target;
                else break; //position found
              }
              
              d3.select(this).select('text')
                .text(y.invert(pos.y).toFixed(2));
                
              return "translate(" + mouse[0] + "," + pos.y +")";
            });
        });
    }
    
    render() {
      return  (
        <div id="chart">
        </div>
      )
    }
  }
  
export default LineChart
  // ReactDOM.render(<LineChart />, document.getElementById('app'))