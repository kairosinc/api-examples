//------------------------------------
// featurePointAnimation.js
// javascript object responsible for emotion API feature point animation
// dependencies: jquery.js
// created: August 2016
// modified: September 2016
// author: Steve Rucker
//------------------------------------

var featurePointAnimation = featurePointAnimation || {};
featurePointAnimation =  {
    //------------------------------------
    // INITIALIZE 
    //------------------------------------
    init: function (response) { 
        this.response = JSON.parse(response);
        this.adjX   = 1;
        this.adjY   = 1;
        this.subX   = 0;
        this.subY   = 0;
        if (emoDemoApp.mediaType == "video") {
            this.createDisplayCanvas(emoDemoApp.fullVideoWidth, emoDemoApp.fullVideoHeight);
            
            var canvas = $("#displayCanvas" + emoDemoApp.mediaType )[0];
            this.context = canvas.getContext('2d');

            var videoWidth = this.response.media_info.width;
            var videoHeight = this.response.media_info.height;
            // fake video dimensions
            // var videoWidth = 1280;
            // var videoHeight = 720;

            newVideoSize = emoDemoApp.calculateAspectRatioFit(videoWidth,videoHeight,emoDemoApp.fullVideoWidth,emoDemoApp.fullVideoHeight);

            // adjust aspect ratio of feature points relative to resized video
            this.adjX   = newVideoSize.ratio;
            this.adjY   = newVideoSize.ratio;
            // reposition face relative to full video size
            this.subX   = (emoDemoApp.fullVideoWidth - newVideoSize.width) / 2;
            this.subY   = (emoDemoApp.fullVideoHeight - newVideoSize.height) / 2;
        }
        else {
            // wait until still image feature points are more accurate
            // this.createDisplayCanvas(emoDemoApp.viewportWidth, emoDemoApp.viewportHeight);

            // var canvas = $("#displayCanvas" + emoDemoApp.mediaType )[0];
            // this.context = canvas.getContext('2d');

            // // image dimensions
            // var imageWidth = emoDemoApp.imgWidth;
            // var imageHeight = emoDemoApp.imgHeight;

            // newImageSize = emoDemoApp.calculateAspectRatioFit(imageWidth,imageHeight,emoDemoApp.newImageSize.width,emoDemoApp.newImageSize.height);

            // // adjust aspect ratio of feature points relative to resized image
            // this.adjX   = newImageSize.ratio;
            // this.adjY   = newImageSize.ratio;
            // // reposition face relative to full image size
            // this.subX   = ((emoDemoApp.viewportWidth - emoDemoApp.newImageSize.width) / 2);
            // this.subY   = ((emoDemoApp.viewportHeight - emoDemoApp.newImageSize.height) / 2);

        }
            

    },
    //------------------------------------
    // GET FEATURE POINTS 
    //------------------------------------ 
    getFeaturePoints: function (time) {
        var self = this;
        var currFrame = null;
        $.each(self.response.frames, function(idx, val){
            if (val.time > (time * 1000)) {
                currFrame = idx;
                return false;
            }
            else if (time == 0) { // photo
                currFrame = 0;
                return false;
            }
        });
        if (currFrame != null) {
            var strokeStyle = '#fff';
            var frame = self.response.frames[currFrame];
            // if the people array is empty, clear canvas
            if(frame.people.length && $("#featurepoints").is(":checked")) {
                var landmarks = self.response.frames[currFrame].people[0].landmarks;
                if (landmarks != undefined) {
                    self.context.clearRect(0, 0, emoDemoApp.fullVideoWidth, emoDemoApp.fullVideoHeight);
                    self.context.beginPath();
                    self.context.strokeStyle = strokeStyle;
                    $.each(featurePoints, function(idx, val){
                        self.drawPoints(idx, val, landmarks);
                    });
                }
                else {
                    self.context.clearRect(0, 0, emoDemoApp.fullVideoWidth, emoDemoApp.fullVideoHeight);
                }
            }
            else {
                self.context.clearRect(0, 0, emoDemoApp.fullVideoWidth, emoDemoApp.fullVideoHeight);
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
            // console.log(xPoint)
            self.context.beginPath();
            self.context.rect(xPoint * self.adjX + self.subX, yPoint * self.adjY + self.subY, 2, 1);
            self.context.stroke();
        }
    },
    //------------------------------------
    // CREATE CANVAS 
    //------------------------------------ 
    createDisplayCanvas: function(h, w ) {
        $(".canvas-container-video").hide();
        $(".canvas-container-image").hide();
        $(".canvas-container-" + emoDemoApp.mediaType)
        .empty()
        .append(
            $('<canvas/>')
            .attr("id", "displayCanvas" + emoDemoApp.mediaType)
            .attr("width", h)
            .attr("height", w)
            );
        $(".canvas-container-" + emoDemoApp.mediaType).show();
    }
}