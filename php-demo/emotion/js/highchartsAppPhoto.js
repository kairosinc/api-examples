//------------------------------------
// highchartsAppPhoto.js
// javascript object containing custom functions for integration with Highcharts.js
// to handle the Highcharts.js lib
// created: August 2016
// author: Steve Rucker
//------------------------------------

var highchartsAppPhoto = highchartsAppPhoto || {};
highchartsAppPhoto = {
    init: function (config) { 
        this.config = config;
        var chartColors = [];
        $.each(this.config.colors, function (idx, val) {
            chartColors.push('"' + this[0] + '"');
        }); 
        this.chartColors = "[" + chartColors.join(",") + "]";
    },
    displayData: function () {
        var self = this;
        var data = highchartsAppPhoto.parsedData;
        var obj = eval('(' + data + ')');
        var dataset = [];
        dataset.push(obj[0].people[0].emotions.joy);
        dataset.push(obj[0].people[0].emotions.surprise);
        dataset.push(obj[0].people[0].emotions.sadness);
        dataset.push(obj[0].people[0].emotions.anger);
        dataset.push(obj[0].people[0].emotions.disgust);
        dataset.push(obj[0].people[0].emotions.fear);

        $('#highcharts-container-image').highcharts({
            chart: {
                type: 'column',
                backgroundColor: "transparent"
            },
            plotOptions: {
                column: {
                    colorByPoint: true
                }
            },
            colors: JSON.parse(self.chartColors),
            title: {
                text: ""
            },
            xAxis: {
                categories: [
                    'Joy',
                    'Surprise',
                    'Sadness',
                    'Anger',
                    'Disgust',
                    'Fear',
                ],
                crosshair: true
            },
            yAxis: {
                min: 0,
                max: 100,
                title: {
                    text: ''
                }
            },
            credits: {
                enabled: false
            },
            tooltip:{
                formatter:function(){
                    return this.key + ': ' + this.y;
                }
            },
            legend: {
                enabled: false
            },
            series: [{
                data: dataset
            }]
        });
    }
}