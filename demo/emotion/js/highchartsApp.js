//------------------------------------
// highchartsApp.js
// javascript object containing custom functions for integration with Highcharts.js
// to handle the Highcharts.js lib
// created: April 2016
// last modified: August 2016
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
		var dataJoy = [];
		var dataSurprise = [];
		var dataSadness = [];
		var dataAnger = [];
		var dataDisgust = [];
		var dataFear = [];
		var obj = eval('(' + data + ')');
		var joyKeyValue = {};
		var surpriseKeyValue = {};
		var sadnessKeyValue = {};
		var angerKeyValue = {};
		var disgustKeyValue = {};
		var fearKeyValue = {};
	    for(var i in obj) {
	    	time.push(obj[i].time);
	    	dataJoy.push(obj[i].people[0].emotions.joy);
	    	dataSurprise.push(obj[i].people[0].emotions.surprise);
	        dataSadness.push(obj[i].people[0].emotions.sadness);
	        dataAnger.push(obj[i].people[0].emotions.anger);
	        dataDisgust.push(obj[i].people[0].emotions.disgust);
	        dataFear.push(obj[i].people[0].emotions.fear);
	        joyKeyValue[obj[i].time] = obj[i].people[0].emotions.joy;
	        surpriseKeyValue[obj[i].time] = obj[i].people[0].emotions.surprise;
	        sadnessKeyValue[obj[i].time] = obj[i].people[0].emotions.sadness;
	        angerKeyValue[obj[i].time] = obj[i].people[0].emotions.anger;
	        disgustKeyValue[obj[i].time] = obj[i].people[0].emotions.disgust;
	        fearKeyValue[obj[i].time] = obj[i].people[0].emotions.fear;
	    };

	    datasets = [{
	        name: 'Joy:',
	        data: dataJoy},
	    {
	        name: 'Surprise:',
	        data: dataSurprise},
	    {
	        name: 'Sadness:',
	        data: dataSadness},
	    {
	        name: 'Anger:',
	        data: dataAnger},
	    {
	        name: 'Disgust:',
	        data: dataDisgust},
	    {
	        name: 'Fear:',
	        data: dataFear}];

	     // In order to synchronize tooltips and crosshairs, override the
	     // built-in events with handlers defined on the parent element.
	     
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
	                chart.xAxis[0].drawCrosshair(event, point); // Show the crosshair
	                
	            }
	        }
	    });
    
	    // Override the reset function
	    Highcharts.Pointer.prototype.reset = function () {
	        return undefined;
	    };

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
	    				'<table classs="highcharts-tooltip-table" style="font-size: 10px;">' +
	                    '<tr><td style="padding: 2px; color:' + self.config.colors[0] + ';">' + datasets[0].name.substring(0, datasets[0].name.length - 1).toUpperCase() + '</td><td>' + joyKeyValue[parseFloat(this.x)] + '</td></tr>' +
	                    '<tr><td style="padding: 2px; color:' + self.config.colors[1] + ';">' + datasets[1].name.substring(0, datasets[1].name.length - 1).toUpperCase() + '</td><td>' + surpriseKeyValue[parseFloat(this.x)] + '</td></tr>' +
	                    '<tr><td style="padding: 2px; color:' + self.config.colors[2] + ';">' + datasets[2].name.substring(0, datasets[2].name.length - 1).toUpperCase() + '</td><td>' + sadnessKeyValue[parseFloat(this.x)] + '</td></tr>' +
	                    '<tr><td style="padding: 2px; color:' + self.config.colors[3] + ';">' + datasets[3].name.substring(0, datasets[3].name.length - 1).toUpperCase() + '</td><td>' + angerKeyValue[parseFloat(this.x)] + '</td></tr>' +
	                    '<tr><td style="padding: 2px; color:' + self.config.colors[4] + ';">' + datasets[4].name.substring(0, datasets[4].name.length - 1).toUpperCase() + '</td><td>' + disgustKeyValue[parseFloat(this.x)] + '</td></tr>' +
	                    '<tr><td style="padding: 2px; color:' + self.config.colors[5] + ';">' + datasets[5].name.substring(0, datasets[5].name.length - 1).toUpperCase() + '</td><td>' + fearKeyValue[parseFloat(this.x)] + '</td></tr>' +
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
	                    backgroundColor: "transparent",
	                    // Edit chart spacing
				        spacingBottom: 0,
				        spacingTop: 0,
				        spacingLeft: 10,
				        spacingRight: 10,

				        // Explicitly tell the width and height of a chart
				        width: null,
				        height: 88
	                },
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
		   				tickLength: 0
			        },

			        yAxis: {
			            title: {
			                text: null
			            },
			            labels: {
			                enabled: false
			            },
			            min: 0,
			            max: yAxisMax,
			            gridLineColor: 'transparent'
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