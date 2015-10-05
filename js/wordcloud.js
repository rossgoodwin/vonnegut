// Interactive TF-IDF Word Cloud Visualizer

// Copyright (C) 2015  Ross Goodwin

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// You can contact Ross Goodwin at ross.goodwin@gmail.com or address 
// physical correspondence and verbal abuse to:

// Ross Goodwin c/o ITP
// 721 Broadway
// 4th Floor
// New York, NY 10003

// TO DO:
// [X] Add Chart.js line graphs
// [ ] Add Sequential Loading w/ Scroll
// [ ] Better Loading GIF
// [X] LICENSE
// [X] ReadMe
// [X] PLAY BUTTON

(function() {

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function titleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// Charts.js global config
Chart.defaults.global.animation = false;
Chart.defaults.global.tooltipEvents = [];
Chart.defaults.global.scaleFontFamily = "'Cousine', monospace";
Chart.defaults.global.showScale = false;

// var spectrum = ['#F22613', '#E74C3C', '#D35400', '#F2784B', '#95A5A6', '#68C3A3', '#4DAF7C', '#3FC380', '#2ECC71'];
var spectrum = ["#f22613", "#f25749", "#f28379", "#f2b0aa", "#95a5a6", "#add9c2", "#74b391", "#45996c", "#1e824c"];


$("#key-block").append(
  '<div id=\"key-text-box\"><p class=\"text-center lead small\" style=\"margin-left: 7px;\">&lt;&lt;&lt; negative | positive &gt;&gt;&gt;</p></div>'
);

spectrum.map(function(hex){
  $("#key-block").append(
    '<div class=\"key-color\" style=\"background-color:'+hex+';\"></div>'
  );
});

function updateCloud(bookslug, section) {

  $.getJSON("data/vonnegut-"+section+".json", function(data){

    // var factor = Math.pow(data[bookslug]['tfidf'].length, 2);

    var layout = d3.layout.cloud()
        .size([800, 500])
        .words(data[bookslug]['tfidf'].map(function(d) {
          return {text: d[0], size: d[1] * 500};
        }))
        .padding(3)
        .rotate(function() { return 0; }) // return ~~(Math.random() * 2) * 90
        .font("Cousine")
        .fontSize(function(d) { return d.size; })
        .on("end", draw);
    layout.start();

    function draw(words) {

      var overallContainer = d3.select("#"+bookslug);

      overallContainer.select("svg").remove();
      overallContainer.select("a").remove();

      var svgContainer = overallContainer.append("svg")
          .attr("width", layout.size()[0])
          .attr("height", layout.size()[1])
          .attr("class", "svg-cont");

      var wordCloud = svgContainer.append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
          .data(words)
        .enter().append("text")
          .transition().duration(500)
          .style("font-size", function(d) { return d.size + "px"; })
          .style("font-family", "Cousine")
          .style("fill", function(d, i) {
              var sentiment = data[bookslug]['sentiment'];
              var ix = Math.floor(((sentiment + 1)/2)*spectrum.length);
              return spectrum[ix];
          })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; });

      var title = titleCase(data[bookslug]['title']);

      var labelText = overallContainer
                      .append("a")
                      .attr("href", "http://www.amazon.com/exec/obidos/external-search/?field-keywords=%s"+title+"&mode=blended")
                      .attr("class", "twitter-link")
                      .attr("target", "_blank")
                      .text(title);

      overallContainer.transition()
          .style("opacity", 1.0)
          .delay(1000)
          .duration(3000);
    }

  });

}

$.getJSON("data/sentiment.json", function(sent){
$.getJSON("data/vonnegut-0.json", function(data){
  $("#loadinggif").fadeOut("slow");
  Object.keys(data).sort().map(function(slug){
    $("#vis").append(
      '<div id=\"'+slug+'\" class=\"col-md-12 transparent text-center\"></div>'
    );

    $("#"+slug).append(
      '<canvas class="chart-canvas" id=\"'+slug+'-chart\" width=\"800\" height=\"150\"></canvas>'
    );

    var ctx = document.getElementById(slug+"-chart").getContext("2d");

    var xLabels = [];

    for (var i=0;i<data[slug]['length'];i++) {
      xLabels.push('');
    }

    var chartData = {
        labels: xLabels,
        datasets: [
            {
                label: titleCase(data[slug]['title']),
                fillColor: "rgba(210, 215, 211, 0.7)",
                strokeColor: "rgba(189, 195, 199, 1)",
                pointColor: "rgba(210, 215, 211, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: sent[slug]
            }
        ]
    };

    var chartOptions = {
      pointDot : false,
      pointHitDetectionRadius : 5,
      scaleShowVerticalLines: false,
      bezierCurve: false
    };

    var myNewChart = new Chart(ctx).Line(chartData, chartOptions);

    var stepCount = data[slug]['length'] - 1;

    $("#"+slug).append(
      '<div class=\"scrubber\"><input id=\"'+slug+'-scrub\" type=\"range\" min=\"0\" max=\"'+stepCount+'\" value=\"0\" step=\"1\"></div>'
    );

    $("#"+slug+"-chart").on("click", function(evt){
      var activePoints = myNewChart.getPointsAtEvent(evt);
      var xPos = activePoints[Math.floor(activePoints.length/2)].x;
      var ix = Math.floor(xPos.map(0, 800, 0, data[slug]['length']));
      console.log(xPos);
      console.log(ix);
      $('#'+slug+'-scrub').val(ix);
      updateCloud(slug, ix);
    });

    // Play Button
    $('#'+slug).append(
      '<button type=\"button\" id=\"'+slug+'-btn\" class=\"btn btn-default btn-xs play-btn\" aria-label=\"Play\"><span class=\"glyphicon glyphicon-play\" aria-hidden=\"true\"></span></button>'
    );

    $('#'+slug).append(
      '<button type=\"button\" id=\"'+slug+'-btn-pause\" class=\"btn btn-default btn-xs play-btn\" aria-label=\"Pause\"><span class=\"glyphicon glyphicon-pause\" aria-hidden=\"true\"></span></button>'
    );

    // Load First Clouds
    updateCloud(slug, 0);

    var play;

    $('#'+slug+'-btn').click(function(){

      console.log('clicked ' + slug);
      autoAdvance();
      play = setInterval(function(){
        autoAdvance();
      }, 5000);

      function autoAdvance(){
          var scrubVal = $('#'+slug+'-scrub').val();
          console.log(data[slug]['length']);
          if (scrubVal >= data[slug]['length']-1) {
            console.log("EOR");
            clearInterval(play);
          }
          console.log(scrubVal);
          var newVal = parseInt(scrubVal, 10) + 1;
          $('#'+slug+'-scrub').val(newVal);
          updateCloud(slug, newVal);
      }

    });



    $('#'+slug+'-btn-pause').click(function(){
      clearInterval(play);
    });


    $("#"+slug+"-scrub").on("input", function(){
      var sectNo = $(this).val();
      console.log(sectNo);
      updateCloud(slug, sectNo);
    });
  });
});
});



})();