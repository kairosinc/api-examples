twttr.widgets.createShareButton(
  '/',
  document.getElementById('twitter_container'),
  {
    text: 'Hello World'
  }
);

function getEthnicityData(data) {
    this.defaultApiCallback(data);

    var json_data = JSON.parse(data);
    var attrs_data = (json_data && json_data.images && json_data.images[0] && json_data.images[0].faces && json_data.images[0].faces[0] && json_data.images[0].faces[0].attributes) || {};
    var get_ethnicities = ['asian','black','hispanic','white','other'];

    var build_ethnicity_data = [];

    get_ethnicities.forEach(function(x) {
        if (attrs_data[x] != undefined) {
            var percentage_rounded = (attrs_data[x] * 100).toFixed(2);
            var percentage_text = percentage_rounded + '%';
            var title_eth = x.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
            var ethnicity = {
                ethnicity: x,
                real_percentage: attrs_data[x],
                text: percentage_text + ' ' + title_eth,
                count: percentage_rounded
            };
            build_ethnicity_data.push(ethnicity);
        }
    });

    $('#chart').html('');
    createChart(build_ethnicity_data);
}

function createChart(data) {
  var bubbleChart = new d3.svg.BubbleChart({
    supportResponsive: true,
    //container: => use @default
    size: 600,
    //viewBoxSize: => use @default
    innerRadius: 600 / 3.5,
    //outerRadius: => use @default
    radiusMin: 50,
    //radiusMax: use @default
    //intersectDelta: use @default
    //intersectInc: use @default
    //circleColor: use @default
    data: {
      items: data,
      eval: function (item) {return item.count;},
      classed: function (item) {return item.text.split(" ").join("");}
    },
    plugins: [
      {
        name: "central-click",
        options: {
          style: {
            "font-size": "12px",
            "font-style": "italic",
            "font-family": "Source Sans Pro, sans-serif",
            "text-anchor": "middle",
            "fill": "white"
          },
          attr: {dy: "65px"},
        }
      },
      {
        name: "lines",
        options: {
          format: [
            {// Line #1
              textField: "text",
              classed: {text: true},
              style: {
                "font-size": "20px",
                "font-family": "Source Sans Pro, sans-serif",
                "text-anchor": "middle",
                fill: "white"
              },
              attr: {
                dy: "10px",
                x: function (d) {return d.cx;},
                y: function (d) {return d.cy;}
              }
            }
          ],
          centralFormat: [
            {// Line #0
              style: {"font-size": "50px"},
              attr: {}
            }
          ]
        }
      }]
  });
}