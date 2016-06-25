//------------------------------------
// highchartsApp.js
// javascript object containing custom functions for integration with Highcharts.js
// to handle the Highcharts.js lib
// created: April 2016
// author: Steve Rucker
//------------------------------------

var highchartsApp = highchartsApp || {};
highchartsApp = {
	init: function (config) { 
	 	this.config = config;
	},
	displayData: function () {
		var self = this;
		var data = highchartsApp.parsedData;
		var highchartsData = [];
		var time = [];
		var seriesData = [];
		var dataSmile = [];
		var dataSurprise = [];
		var dataNegative = [];
		var dataAttention = [];
		var obj = eval('(' + data + ')');
		var smileKeyValue = {};
		var negativeKeyValue = {};
		var surpriseKeyValue = {};
		var attentionKeyValue = {};
	    for(var i in obj) {
	    	time.push(obj[i].person.time);
	    	dataSmile.push(obj[i].person.emotions.smile);
	    	dataSurprise.push(obj[i].person.emotions.surprise);
	        dataNegative.push(obj[i].person.emotions.negative);
	        dataAttention.push(obj[i].person.emotions.attention);
	        smileKeyValue[obj[i].person.time] = obj[i].person.emotions.smile;
	        surpriseKeyValue[obj[i].person.time] = obj[i].person.emotions.surprise;
	        negativeKeyValue[obj[i].person.time] = obj[i].person.emotions.negative;
	        attentionKeyValue[obj[i].person.time] = obj[i].person.emotions.attention;
	    };
	    datasets = [{
	        name: 'Smile:',
	        data: dataSmile},
	    {
	        name: 'Surprise:',
	        data: dataSurprise},
	    {
	        name: 'Negative:',
	        data: dataNegative},
	    {
	        name: 'Attention:',
	        data: dataAttention}];

	    $('#highcharts-containers').bind('mousemove touchmove touchstart', function (e) {
	        var chart,
	            point,
	            i,
	            event;

	        for (i = 0; i < Highcharts.charts.length; i = i + 1) {
	            chart = Highcharts.charts[i];
	            event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
	            point = chart.series[0].searchPoint(event, true); // Get the hovered point

	            if (point) {
	                point.onMouseOver(); // Show the hover marker
	                // chart.tooltip.refresh(point); // Show the tooltip
	                chart.xAxis[0].drawCrosshair(event, point); // Show the crosshair
	                
	            }
	        }
	    });
    
	    // Override the reset function
	    Highcharts.Pointer.prototype.reset = function () {
	        return undefined;
	    };

	    // Synchronize zooming through the setExtremes event handler.
	    function syncExtremes(e) {
	        var thisChart = this.chart;

	        if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
	            Highcharts.each(Highcharts.charts, function (chart) {
	                if (chart !== thisChart) {
	                    if (chart.xAxis[0].setExtremes) { // It is null while updating
	                        chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
	                    }
	                }
	            });
	        }
	    }

	    if (highchartsApp.autoscale == true) {
	    	var yAxisMax = null;
	    }
	    else {
	    	var yAxisMax = 100;
	    }

	    colors = self.config.colors;

	    $("#highcharts-titles").empty();

	    $.each(datasets, function(i, dataset) {

	    	var thisTooltip = {
	    		enabled: false
	    	}

	    	if (i == 1) {
	    		thisTooltip = {
	    			useHTML:true,
	    			formatter: function() {return ' ' +
	    				'<table style="font-size: 10px;">' +
	                    '<tr><td style="padding: 2px; color:' + self.config.colors[0] + ';">' + datasets[0].name.substring(0, datasets[0].name.length - 1).toUpperCase() + '</td><td>' + smileKeyValue[parseFloat(this.x)] + '</td></tr>' +
	                    '<tr><td style="padding: 2px; color:' + self.config.colors[1] + ';">' + datasets[1].name.substring(0, datasets[1].name.length - 1).toUpperCase() + '</td><td>' + surpriseKeyValue[parseFloat(this.x)] + '</td></tr>' +
	                    '<tr><td style="padding: 2px; color:' + self.config.colors[2] + ';">' + datasets[2].name.substring(0, datasets[2].name.length - 1).toUpperCase() + '</td><td>' + negativeKeyValue[parseFloat(this.x)] + '</td></tr>' +
	                    '<tr><td style="padding: 2px; color:' + self.config.colors[3] + ';">' + datasets[3].name.substring(0, datasets[3].name.length - 1).toUpperCase() + '</td><td>' + attentionKeyValue[parseFloat(this.x)] + '</td></tr>' +
			            '<tr><td colspan=2 align=center style="padding-top: 5px;">' + this.x/1000 + ' secs</td></tr>' 
			            '</table>'
	    			},
	    			borderColor: "#2c3444",
	    			borderRadius: 0
	    		}
	    	};

	        $("#highcharts-titles").append("<div class='highchart-title'>" + dataset.name.substring(0, dataset.name.length - 1) + "</div>");

	        $('<div class="chart">')
	            .appendTo('#highcharts-containers')
	            .highcharts({
			        chart: {
	                    backgroundColor: "transparent"
	                },
	                // removes points on graph:
	                // plotOptions: {
	                //     series: {
	                //         states: {
	                //             hover: {
	                //                 enabled: false
	                //             }
	                //         }
	                //     }
	                // },

			        colors: colors[i],

			        title: {
			            text: dataset.name.substring(0, dataset.name.length - 1),
			            align: 'left',
			            style: {'text-transform':'uppercase','font-size':'12px', 'font-weight':'bold', 'color':'transparent'}
			        },

			        credits: {
			            enabled: false
			        },

			        legend: {
			            enabled: false
			        },

			        xAxis: {
			        	crosshair: {
	                        width: 1,
	                        color: '#2c3444'
	                    },
			        	categories: time,
			            labels: {
			                enabled: false
			            },
			            minorTickLength: 0,
		   				tickLength: 0,
		   				events: {
	                        setExtremes: syncExtremes
	                    }
			        },

			        yAxis: {
			            title: {
			                text: null
			            },
			            labels: {
			                enabled: false
			            },
			            min: 0,
			            max: yAxisMax
			        },

			        tooltip: thisTooltip,

			        series: [{
	                    data: dataset.data,
	                    name: dataset.name,
	                    type: "area",
	                    fillOpacity: 0.8
	                }]

			    });
		});
	}
}