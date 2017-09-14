//------------------------------------
// videoPlayer.js
// javascript object responsible for video UI on result view
// dependencies: jquery.js, jquery-ui.js (scrubber interaction)
// created: April 2016
// author: Steve Rucker
//------------------------------------

var videoPlayer = videoPlayer || {};
var playButton = $("#play-pause");
var progressHolder = $("#progress-holder");
var progressBar = $("#progress-bar");
var progressTime = $("#progress-time");
var curtain = $("#highcharts-curtain");
var titles = $("#highcharts-titles");

var videoPlayer = { 
	init: function () { 
	 	this.handleButtonPresses();
		this.videoScrubbing();
	},
	handleButtonPresses: function () { 
		var self = this;
		playButton.on("click", function(e) {
			e.preventDefault();
			self.playPause();
			curtain.show();
		  	if (video.paused == true) {
		  		playButton.removeClass("pause");
		    	playButton.addClass("play");
		  	} 
		  	else {
		    	playButton.removeClass("play");
		    	playButton.addClass("pause");
		  	}
		}); 
	},
	playPause: function () { 
		var self = this;
		if ( video.paused || video.ended ) {				 
			if ( video.ended ) { video.currentTime = 0; } 
			video.play();
			self.trackPlayProgress(); 
		} 
		else { 
			video.pause();
			self.stopTrackingPlayProgress();
		} 
	},
	converttoTime: function (timeInSeconds) {
    	var minutes = Math.round(Math.floor(timeInSeconds / 60));
    	var seconds = Math.round(timeInSeconds - minutes * 60);
    	var time=('0'  + minutes).slice(-2)+':'+('0' + seconds).slice(-2);
    	return time;
   	},
   	trackPlayProgress: function (){ 
   		var self = this;
		(function progressTrack() { 
			if ( video.ended == true ) {
				self.stopTrackingPlayProgress();
			}
			else {
				self.updatePlayProgress(); 
		 		playProgressInterval = setTimeout(progressTrack, 50); 
			}
	 	})(); 
	},
	updatePlayProgress: function () { 
		var self = this;
		progressBar.width( (video.currentTime / video.duration) * (progressHolder[0].offsetWidth) ); 
		progressTime.html(self.converttoTime(video.currentTime));
		var widthPercent = 100 - ((video.currentTime / video.duration) * 100);
		curtain.width( widthPercent  + "%");
		featurePointAnimation.getFeaturePoints(video.currentTime);
		if ( widthPercent < 80 || curtain.css("display") == "none") {
			titles.css("z-index",2);
		}
		else {
			titles.css("z-index",3);
		}
		if ( widthPercent < 60 ) {
			$(".highcharts-tooltip").css("visibility","visible");
		}
		else {
			$(".highcharts-tooltip").css("visibility","hidden");
		}
	},
	// Video was stopped, so stop updating progress. 
	stopTrackingPlayProgress: function () { 
		clearTimeout( playProgressInterval ); 
	},
	videoScrubbing: function () { 
		var self = this;
		progressHolder.slider({
			value: 0,
			orientation: "horizontal",
			range: "min",
			animate: true,
			slide: function(event, ui) {
				curtain.show();
				video.currentTime = (ui.value * video.duration)/100;
				self.updatePlayProgress();
			}
		});
	}
};

