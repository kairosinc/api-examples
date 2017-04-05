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
        var windowWidth = $(window).width();
        this.featurePointWidth = 2;
        if (windowWidth < 786) {
            this.featurePointWidth = 0;
        }
        else if (windowWidth < 992) {
            this.featurePointWidth = 1;
        }

        if (emoDemoApp.mediaType == "video") {
            this.createDisplayCanvas(emoDemoApp.fullVideoWidth, emoDemoApp.fullVideoHeight);
            
            var canvas = $("#displayCanvas" + emoDemoApp.mediaType )[0];
            this.context = canvas.getContext('2d');

            var videoWidth = this.response.media_info.width;
            var videoHeight = this.response.media_info.height;

            newVideoSize = utils.calculateAspectRatioFit(videoWidth,videoHeight,emoDemoApp.fullVideoWidth,emoDemoApp.fullVideoHeight);

            // adjust aspect ratio of feature points relative to resized video
            this.adjX   = newVideoSize.ratio;
            this.adjY   = newVideoSize.ratio;
            // reposition face relative to full video size
            this.subX   = (emoDemoApp.fullVideoWidth - newVideoSize.width) / 2;
            this.subY   = (emoDemoApp.fullVideoHeight - newVideoSize.height) / 2;
        }
        else if (emoDemoApp.mediaType == "image")  {
            var self = this;
            // wait until still image feature points are more accurate
            this.createDisplayCanvas(emoDemoApp.canvasWidth, emoDemoApp.canvasWidth);

            var canvas = $("#displayCanvas" + emoDemoApp.mediaType )[0];
            this.context = canvas.getContext('2d');

            // image dimensions
            var imgWidth = emoDemoApp.imgWidth;
            var imgHeight = emoDemoApp.imgHeight;

            // get dimensions of the image as it is displayed in .display-image-container
            var displayImageDimensions = utils.getDisplayImageDimensions(imgWidth, imgHeight, emoDemoApp.canvasWidth);
            // get dimensions and ratio of image relative to display size
            var newImageInfo = utils.calculateAspectRatioFit(imgWidth,imgHeight,displayImageDimensions.width,displayImageDimensions.height);

            // adjust aspect ratio of feature points relative to resized image
            this.adjX   = newImageInfo.ratio;
            this.adjY   = newImageInfo.ratio;
            // reposition face relative to full image size
            this.subX   = (emoDemoApp.canvasWidth - newImageInfo.width) / 2;
            this.subY   = (emoDemoApp.canvasHeight - newImageInfo.height) / 2;
            this.getFeaturePoints(0);
          
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
        }
        else if (landmarks[idx] != undefined && landmarks[idx]["name"] != undefined && landmarks[idx]["name"] == val) {
            var xPoint = landmarks[idx]["x"];
            var yPoint = landmarks[idx]["y"];
        }
        self.context.beginPath();
        self.context.rect(xPoint * self.adjX + self.subX, yPoint * self.adjY + self.subY, self.featurePointWidth, 1);
        self.context.stroke();
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