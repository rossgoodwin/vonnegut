// TO DO:
// [ ] Add Chart.js line graphs
// [ ] Add Sequential Loading w/ Scroll
// [ ] Better Loading GIF
// [ ] LICENSE
// [ ] ReadMe
// [ ] INTEGRATE COMPLETE TEXT AS SECRET EASTER EGG

(function() {

// function range(start, stop, step) {
//     if (typeof stop == 'undefined') {
//         // one param defined
//         stop = start;
//         start = 0;
//     }

//     if (typeof step == 'undefined') {
//         step = 1;
//     }

//     if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
//         return [];
//     }

//     var result = [];
//     for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
//         result.push(i);
//     }

//     return result;
// };

var spectrum = ['#F22613', '#E74C3C', '#D35400', '#F2784B', '#95A5A6', '#68C3A3', '#4DAF7C', '#3FC380', '#2ECC71'];

$("#key-block").append(
  '<div id=\"key-text-box\"><p class=\"text-center\">&lt;&lt;&lt; negative | text colors | positive &gt;&gt;&gt;</p></div>'
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
        // .rotate(function() { return ~~(Math.random() * 2) * 90; })
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
              var sentiment = data[bookslug]['sentiment'][1];
              var ix = Math.floor(((sentiment + 1)/2)*spectrum.length);
              return spectrum[ix];
          })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; });

      var labelText = overallContainer
                      .append("a")
                      .attr("href", "http://www.amazon.com/exec/obidos/external-search/?field-keywords=%s"+data[bookslug]['title']+"&mode=blended")
                      .attr("class", "twitter-link")
                      .text(data[bookslug]['title']);

      overallContainer.transition()
          .style("opacity", 1.0)
          .delay(1000)
          .duration(3000);
    }

  });

}

$.getJSON("data/vonnegut-0.json", function(data){
  $("#loadinggif").fadeOut("slow");
  Object.keys(data).sort().map(function(slug){
    $("#vis").append(
      '<div id=\"'+slug+'\" class=\"col-md-12 transparent\"></div>'
    );

    // Charts.js stuff goes here
    // $("#"+slug).append(
    //   '<canvas id=\"'+slug+'-chart\" width=\"400\" height=\"400\"></canvas>'
    // );

    // var ctx = document.getElementById(slug+"-chart").getContext("2d");

    // var data = {
    //     labels: range(data[slug]['length']),
    //     datasets: [
    //         {
    //             label: data[slug]['title'],
    //             fillColor: "rgba(220,220,220,0.2)",
    //             strokeColor: "rgba(220,220,220,1)",
    //             pointColor: "rgba(220,220,220,1)",
    //             pointStrokeColor: "#fff",
    //             pointHighlightFill: "#fff",
    //             pointHighlightStroke: "rgba(220,220,220,1)",
    //             data: data
    //         }
    //     ]
    // };

    // var myNewChart = new Chart(ctx).PolarArea(data);


    $("#"+slug).append(
      '<div class=\"scrubber\"><input id=\"'+slug+'-scrub\" type=\"range\" min=\"0\" max=\"'+data[slug]['length']+'\" value=\"0\" step=\"1\"></div>'
    );
    updateCloud(slug, 0);
    $("#"+slug+"-scrub").on("input", function(){
      var sectNo = $(this).val();
      console.log(sectNo);
      updateCloud(slug, sectNo);
    });
  });
});

})();