//------------------------------------
// featurePointAnimation.js
// javascript object responsible for emotion API feature point animation
// dependencies: jquery.js
// created: August 2016
// author: Steve Rucker
//------------------------------------

var featurePointAnimation = featurePointAnimation || {};
featurePointAnimation =  {
    //------------------------------------
    // INITIALIZE 
    //------------------------------------
    init: function (response) { 
        this.createDisplayCanvas(emoDemoApp.fullVideoWidth, emoDemoApp.fullVideoHeight);
        this.response = JSON.parse(response);
        var canvas = $("#displayCanvas")[0];
        this.context = canvas.getContext('2d');

        // fake video dimensions
        var videoWidth = 1280;
        var videoHeight = 720;

        newVideoSize = emoDemoApp.calculateAspectRatioFit(videoWidth,videoHeight,emoDemoApp.fullVideoWidth,emoDemoApp.fullVideoHeight);

        // adjust aspect ratio of feature points relative to resized video
        this.adjX   = newVideoSize.ratio;
        this.adjY   = newVideoSize.ratio;
        // reposition face relative to full video size
        this.subX   = (emoDemoApp.fullVideoWidth - newVideoSize.width) / 2;
        this.subY   = (emoDemoApp.fullVideoHeight - newVideoSize.height) / 2;

    },
    //------------------------------------
    // GET FEATURE POINTS 
    //------------------------------------ 
    getFeaturePoints: function (time) {
        var self = this;
        $.each(self.response.frames, function(idx, val){
            if (val.time > (time * 1000)) {
                currFrame = idx;
                return false;
            }
        });
        if (currFrame != undefined) {
            var strokeStyle = '#fff';
            var landmarks = self.response.frames[currFrame].people[0].landmarks;
            if (landmarks != undefined) {
                self.context.clearRect(0, 0, emoDemoApp.fullVideoWidth, emoDemoApp.fullVideoHeight);
                self.context.beginPath();
                self.context.strokeStyle = strokeStyle;

                $.each(featurePoints, function(idx, val){
                    self.drawPoints(idx, val, landmarks);
                });
            }
        }
    },
    //------------------------------------
    // DRAW POINTS
    //------------------------------------ 
    drawPoints: function(idx, val, landmarks) {
        var self = this;
        if (landmarks[idx] != undefined && landmarks[idx][val] != undefined) {
            var xPoint = landmarks[idx][val]["x"];
            var yPoint = landmarks[idx][val]["y"];
            self.context.beginPath();
            self.context.rect(xPoint * self.adjX + self.subX, yPoint * self.adjY + self.subY, 1, 1);
            self.context.stroke();
        }
    },
    //------------------------------------
    // CREATE CANVAS 
    //------------------------------------ 
    createDisplayCanvas: function(h, w) {
        $(".canvas-container")
        .empty()
        .append(
            $('<canvas/>')
            .attr("id", "displayCanvas")
            .attr("width", h)
            .attr("height", w)
            );
    }
}