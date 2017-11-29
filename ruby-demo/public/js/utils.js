//------------------------------------
// utils.js
// collection of javascript utilities for use with demos
// dependencies: jquery.js
// created: December 2016
// modified: March 2017
// author: Steve Rucker
//------------------------------------

var utils = utils || {};
utils =  {
    roundRect: function(ctx, x, y, width, height, radius) {
        /**
         * Draws a rounded rectangle using the current state of the canvas.
         * If you omit the last three params, it will draw a rectangle
         * outline with a 5 pixel border radius
         * @param {CanvasRenderingContext2D} ctx
         * @param {Number} x The top left x coordinate
         * @param {Number} y The top left y coordinate
         * @param {Number} width The width of the rectangle
         * @param {Number} height The height of the rectangle
         * @param {Number} [radius = 5] 
         */
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    },
    adjustRadius: function(faceWidth, defaultRadius) {
        // reduce size of rounded corners on smaller images
        var radiusAdj = 1;
        if (faceWidth < 15) {
            radiusAdj = .05;
        }
        else if (faceWidth < 30) {
            radiusAdj = .15;
        }
        else if (faceWidth < 60) {
            radiusAdj = .3;  
        }
        else if (faceWidth < 80) {
            radiusAdj = .4;  
        }
        else if (faceWidth < 130) {
            radiusAdj = .5;
        }
        else if (faceWidth < 150) {
            radiusAdj = .6;
        }
        else if (faceWidth < 180) {
            radiusAdj = .7;
        }
        else if (faceWidth < 210) {
            radiusAdj = .8;
        }

        return defaultRadius * radiusAdj;
    },
    validateUrl: function(urlString) {
        var url;
        if (urlString.search(/^http[s]?\:\/\//) == -1) {
            url = 'http://' + urlString;
        }
        else {
            url = urlString;
        }
        var valid = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        if(valid === null)
            return false;
        else
            return url;
    },
    validateJson: function(json){
        if (/^[\],:{}\s]*$/.test(json.replace(/\\["\\\/bfnrtu]/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
            return true;
        } else {
            return false;
        }
    },
    //------------------------------------
    // RETURN NEW DIMENSIONS AND RATIO BASED ON ORIGINAL IMAGE SIZE AND CONTAINER
    //------------------------------------
    calculateAspectRatioFit: function(srcWidth, srcHeight, maxWidth, maxHeight) {
        var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return { width: srcWidth*ratio, height: srcHeight*ratio, ratio:ratio };
    },
    //------------------------------------
    // DISPLAY JSON RESPONSE WITH COLOR CODING
    //------------------------------------
    showJsonResponse: function (data) {
        var self = this;
        var str = JSON.stringify(data, null, 4);
        $(".json-response pre").html(this.syntaxHighlight(str));
    },
    //------------------------------------
    // REMOVE META INFO FROM IMAGE DATA AND SAVE AS GLOBAL VARIABLE
    //------------------------------------
    parseImageData: function(imageData) {
        imageData = imageData.replace("data:image/jpeg;base64,", "");
        imageData = imageData.replace("data:image/jpg;base64,", "");
        imageData = imageData.replace("data:image/png;base64,", "");
        imageData = imageData.replace("data:image/gif;base64,", "");
        imageData = imageData.replace("data:image/bmp;base64,", "");
        return imageData;
    },
    //------------------------------------
    // REMOVE META INFO FROM WEBCAM VIDEO DATA AND SAVE AS GLOBAL VARIABLE
    //------------------------------------
    parseVideoData: function(imageData) {
        videoData = imageData.replace("data:video/webm;base64,", "");
        return videoData;
    },
    //------------------------------------
    // DRAW IMAGE TO CANVAS, KEEPING ASPECT RATIO
    //------------------------------------
    imageToDataUri: function(img, width, height) {
        // create an off-screen canvas
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');

        // set its dimension to target size
        canvas.width = width;
        canvas.height = height;

        // draw source image into the off-screen canvas:
        ctx.drawImage(img, 0, 0, width, height);

        // encode image to data-uri with base64 version of compressed image
        return canvas.toDataURL();
    },
    //------------------------------------
    // COLOR CODE JSON RESPONSE
    //------------------------------------
    syntaxHighlight: function (json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            
            if (/^"/.test(match)) {
                if (/"$/.test(match)) {
                    cls = 'key';
                }
                else {
                    cls = 'string';
                }

            }
            if (match.indexOf(":") > -1) {
                return '<span class="' + cls + '">' + match.replace(":","") + '</span>:';
            }
            else {
                return '<span class="' + cls + '">' + match.replace(":","") + '</span>';
            }
            
        });
    },
    //------------------------------------
    // CAPITALIZE EACH WORD OF A STRING
    //------------------------------------
    toTitleCase: function(str){
      return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    },
    //------------------------------------
    // CREATE CANVAS FOR DISPLAYING IMAGE
    //------------------------------------ 
    createDisplayCanvas: function(h, w, position) {
        var element = $(".canvas-container");
        if (position != null) {
            element = $(".canvas-container-" + position);
        }
        else {
            position = "";
        }
        element
            .empty()
            .append(
                $('<canvas/>')
                    .attr("id", "displayCanvas" + position)
                    .attr("width", h)
                    .attr("height", w)
                );
    },
    //------------------------------------
    // COMPUTE CSS TO RESIZE AND DISPLAY IMAGE
    //------------------------------------ 
    computeCss: function(width, height, newsize) {
        if (width > height) {
            var ratio = (width/height);
            var offset = (newsize - (newsize * ratio)) / 2;
            cssObj = {
                height: newsize,
                width: "auto",
                top: 0,
                left: offset,
                position: "absolute"
            }
        }
        else {
            var ratio = height/width;
            var offset = (newsize - (newsize * ratio)) / 2;
            cssObj = {
                width: newsize,
                height: "auto",
                top: offset,
                left: 0,
                position: "absolute"
            }
        }
        return cssObj;
    },
    //------------------------------------
    // RESIZE IMAGE, SMALLER DIMENSION = CONTAINER
    //------------------------------------ 
    getDisplayImageDimensions: function(width, height, newsize) {
        if (width > height) {
            var ratio = width/height;
            var width = newsize * ratio;   
            var height = newsize;       
        }
        else {
            var ratio = height/width;
            var height = newsize * ratio;
            var width = newsize;
        }
        return { width: width, height: height, ratio: ratio };
    },
    rotateImage: function(image, callback, app, url) {
        var doRotate = function (imageOrientation) {
            app.imageOrientation = imageOrientation;
            if (!utils.isiOS()) {
                switch(parseInt(imageOrientation)) {
                    case 3:
                        var rotate = "rotate(180deg)"
                        break;
                    case 6:
                        var rotate = "rotate(90deg)"
                        break;
                    case 8:
                        var rotate = "rotate(270deg)"
                        break;
                }
                if (imageOrientation > 1) {
                    rotateCss = {};
                    rotateCss["-webkit-transform"] = rotate;
                    rotateCss["-moz-transform"]    = rotate;
                    rotateCss["-o-transform"]      = rotate;
                    rotateCss["-ms-transform"]     = rotate;
                    rotateCss["transform"]         = rotate; 
                    $(image).css(rotateCss);
                } 
            }
            if (typeof callback === "function") {
                callback();
            }
        };
        if (url) {
            var imageData = {};
            imageData["url"] = url;
            $.ajax({
                url: '/exif-data', 
                dataType: 'text', 
                data: imageData,                         
                type: 'post',
            }).done(function(orientation) {
                doRotate(orientation);
            });
        }
        else {
            EXIF.getData(image, function() {
                var orientation = EXIF.getTag(this,"Orientation");
                doRotate(orientation);
            });
        }
        
    },
    isiOS: function() {
        var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        return (iOS);
    },
    getUrlVars: function() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
        function(m,key,value) {
          vars[key] = value;
        });
        return vars;
    },
    isNumber: function(evt){
        var charCode = (evt.which) ? evt.which : evt.keyCode;
            if (charCode != 46 && charCode > 31 
                && (charCode < 48 || charCode > 57)) {
                return false;
            }
        return true;
    }

}