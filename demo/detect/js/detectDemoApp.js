//------------------------------------
// detectDemoApp.js
// javascript object responsible for primary app functionality
// dependencies: jquery.js, jquery-ui, detect.php
// created: May 2016
// author: Steve Rucker
//------------------------------------

var detectDemoApp = detectDemoApp || {};
detectDemoApp =  {
    //------------------------------------
    // INITIALIZE - index.php
    //------------------------------------
    init: function (config) {
        this.canvasWidth = 475;
        this.canvasHeight = 475;
        this.webcamWidth = 635;
        this.webcamHeight = 475;
        this.config = config;
        this.apiCredentials = config.apiCredentials;
        if (this.apiCredentials){
            this.examplesModule();
            this.uploadModule();
            this.dragdropModule();
            this.urlModule();
        }
        else {
            detectDemoApp.getTemplate("json-response-template","Error","API credentials not provided.",false,false);
        }
        // detect getUserMedia compatibility
        // hide webcam link if not supported
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (!navigator.getUserMedia) {
            $(".webcam").hide();
            $(".ui-buttons .upload").addClass("full-width");
        }
        
    },
    //------------------------------------
    // EXAMPLES PROCESSING
    //------------------------------------
    examplesModule: function () {
        var self = this; 
        detectDemoApp.processingExample = true; 
        self.createDisplayCanvas(self.canvasWidth, self.canvasHeight);
        detectDemoApp.getTemplate("json-response-template","","Generating results...",true);
        var canvas = document.createElement('CANVAS');
        var context = canvas.getContext('2d');
        canvas.width = self.canvasWidth;
        canvas.height = self.canvasHeight;
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = $("#previewImage").attr("src");
        img.onload = function(){
            var imageData;
            context.drawImage(this, 0, 0, self.canvasWidth, self.canvasHeight);
            imageData = canvas.toDataURL();
            detectDemoApp.globalImageData = detectDemoApp.parseImageData(imageData);
            var data = {};
            imgObj = { 
                "image"   : detectDemoApp.globalImageData,
                "selector" : "FULL", 
                "minHeadScale" : ".06"
            };
            data.imgObj = JSON.stringify(imgObj);
            $.ajax({
                type: 'POST',
                url: 'detect.php',
                data: data,
                dataType: 'text'
            }).done(function(response){
                self.apiCallback(response);
            });
            canvas = null; 
        };
    },
    //------------------------------------
    // WEBCAM PROCESSING
    //------------------------------------
    webcamModule: function () {
        var self = this;
        self.createDisplayCanvas(self.webcamWidth, self.webcamHeight);
        var streaming = false;
        var video = null;

        (function () {
            video = document.getElementById('webcamVideo');
            navigator.getUserMedia({
                video: true,
                audio: false
            },
                function(stream) {
                    if (navigator.mozGetUserMedia) {
                      video.mozSrcObject = stream;
                    } 
                    else {
                        var vendorURL = window.URL || window.webkitURL;
                        video.src = vendorURL.createObjectURL(stream);
                    }
                    video.play();
                    detectDemoApp.localStream = stream.getTracks()[0];
                },
                function(err) {
                    detectDemoApp.getTemplate("image-container-template","","",false,true);
                    detectDemoApp.getTemplate("json-response-template","Error","A wecam error occured. Please try again.",false,false);
                    return false;
                }
            );
            video.addEventListener('canplay', function(ev){
                $(".face-overlay").show();
                detectDemoApp.getTemplate("json-response-template","Tip","Keep your face inside the green circle...",false);
                if (!streaming) {
                    video.setAttribute('width', self.webcamWidth);
                    video.setAttribute('height', self.webcamHeight);
                    streaming = true;
                }
                var captureInterval = 3000;
                var countdown = captureInterval/1000;
                var counterFunction = setInterval(function () {
                    $(".main-image-container .spinner-message-container").hide();
                    $(".webcam-counter").html(countdown);
                    if (countdown <= 0) {
                        $(".webcam-counter").html("");
                        takepicture();
                        clearInterval(counterFunction);
                    }
                    countdown --;
                },1000);
            },  false);
        })();

        var takepicture = function() {
            detectDemoApp.getTemplate("image-container-template","","Analyzing image...",true,false);
            detectDemoApp.getTemplate("json-response-template","","Generating results...",true,false);
            $("#webcamVideo").hide();
            $(".face-overlay").hide();
            // create canvas
            var canvas = document.createElement('CANVAS');
            var context = canvas.getContext('2d');
            canvas.width = self.webcamWidth;
            canvas.height = self.webcamHeight;
            // draw video image onto canvas, get data
            context.drawImage(video, 0, 0, self.webcamWidth, self.webcamHeight);
            var imageData = canvas.toDataURL('image/png');
            detectDemoApp.globalImageData = detectDemoApp.parseImageData(imageData);
            // send data to Kairos API
            var data = {};
            imgObj = { 
                "image"   : detectDemoApp.globalImageData,
                "selector" : "FULL", 
                "minHeadScale" : ".06"
            };
            data.imgObj = JSON.stringify(imgObj);
            $.ajax({
                type: 'POST',
                url: 'detect.php',
                data: data,
                dataType: 'text'
            }).done(function(response){
                self.apiCallback(response);
            });
            detectDemoApp.localStream.stop();
        };
    },
    //------------------------------------
    // FILE UPLOAD PROCESSING
    //------------------------------------
    uploadModule: function () { 
        var self = this;  
        $('#mediaUploadForm').submit(function() { 
            self.createDisplayCanvas(self.canvasWidth, self.canvasHeight);
            var input = $("#upload")[0];
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                detectDemoApp.getTemplate("image-container-template","","",false,true);
                detectDemoApp.getTemplate("json-response-template","Error","The File APIs are not fully supported in this browser.",false,false);
                return false;
            }  
            var ftype = input.files[0].type; // get file type
            var fileTypeAllowed = false;
            $(self.config.uploadFileTypesImage).each(function(idx, fileType) {
                if(fileType == ftype) { 
                    fileTypeAllowed = true;
                }
            }); 

            if (!fileTypeAllowed) {
                detectDemoApp.getTemplate("image-container-template","","",false,true);
                detectDemoApp.getTemplate("json-response-template","Error","Wrong file type.  Must be .png, .gif, or .jpg.",false,false);
                return false;
            }
            else if (!input) {
                detectDemoApp.getTemplate("image-container-template","","",false,true);
                detectDemoApp.getTemplate("json-response-template","Error","Couldn't find the file input element.",false,false);
                return false;
            }
            else if (!input.files) {
                detectDemoApp.getTemplate("image-container-template","","",false,true);
                detectDemoApp.getTemplate("json-response-template","Error","This browser doesn't seem to support the `files` property of file inputs.",false,false);
                return false;
            }
            else {
                var canvas = document.createElement('CANVAS');
                var context = canvas.getContext('2d');
                canvas.width = self.canvasWidth;
                canvas.height = self.canvasHeight;
                var img = new Image();
                var file = input.files[0];
                var reader  = new FileReader();

                if (file) {
                    reader.readAsDataURL(file);
                } 
                else {
                    img.src = "";
                }   
                reader.onloadend = function () {
                    var imageData;
                    imageData = String(reader.result);
                    img.src = imageData;
                    var imageLoaded = false;
                    img.onload = function(){
                        console.log('load')
                        if (!imageLoaded) {
                            imageLoaded = true;
                            var maxWidth = self.canvasWidth;
                            if(img.width > maxWidth) {
                                var ratio = maxWidth / img.width;
                                imageData = detectDemoApp.imageToDataUri(img, img.width * ratio, img.height * ratio);
                                img.src = imageData;
                            }
                            context.drawImage(this, 0, 0, self.canvasWidth, self.canvasHeight);
                            detectDemoApp.globalImageData = detectDemoApp.parseImageData(imageData);
                            $("#upload").val("");
                            var data = {};
                            imgObj = { 
                                "image"   : detectDemoApp.globalImageData,
                                "selector" : "FULL", 
                                "minHeadScale" : ".06"
                            };
                            data.imgObj = JSON.stringify(imgObj);
                            $.ajax({
                                type: 'POST',
                                url: 'detect.php',
                                data: data,
                                dataType: 'text'
                            }).done(function(response){
                                self.apiCallback(response);
                            });
                        }
                    };  
                };
            } 
            return false; 
        });
    },
    //------------------------------------
    // URL PROCESSING
    //------------------------------------
    urlModule: function () {
        var self = this;
        $(".submit-button").click(function(){
            var urlImageSrc = self.validateUrl($(".url-from-web").val());
            if (urlImageSrc === false) {
                $(".url-error").html("Please enter a valid URL");
            }
            else {
                $(".url-error").html("");
                self.resetElements();
                self.createDisplayCanvas(self.canvasWidth, self.canvasHeight);
                detectDemoApp.getTemplate("image-container-template","","Analyzing image...",true,false);
                detectDemoApp.getTemplate("json-response-template","","Generating results...",true,false);
                // POST to php file to get image data
                var data = {};
                data.url = urlImageSrc;
                $.ajax({
                    type: "POST",
                    url: "../get-image-data.php",
                    data: data,
                    dataType: "text"
                }).done(function(response) {
                    if(self.validateJson(response) && JSON.parse(response).imageType !== false && JSON.parse(response).imageType !== null) {
                        processUrlImage(JSON.parse(response));
                    }              
                    else {
                        detectDemoApp.getTemplate("image-container-template","","",false,true);
                        detectDemoApp.getTemplate("json-response-template","","Invalid response.  Please try another URL.",false,false);
                    }
                });
            }
            var processUrlImage = function (response) {
                var ftype = response.imageType.mime;
                var fileTypeAllowed = false;
                $(self.config.uploadFileTypesImage).each(function(idx, fileType) {
                    if(fileType == ftype) { 
                        fileTypeAllowed = true;
                    }
                }); 
                if (!fileTypeAllowed) {
                    self.resetElements();
                    detectDemoApp.getTemplate("image-container-template","","",false,true);
                    detectDemoApp.getTemplate("json-response-template","Error","Wrong file type.  Must be .png, .gif, or .jpg.",false,false);
                    return false;
                }
                else {
                    var canvas = document.createElement('CANVAS');
                    var context = canvas.getContext('2d');
                    canvas.width = self.canvasWidth;
                    canvas.height = self.canvasHeight;
                    var img = new Image();
                    var imageData;
                    imageData = response.imageData;
                    img.src = imageData;
                    var imageLoaded = false;
                    img.onload = function(){
                        if (!imageLoaded) {
                            imageLoaded = true;
                            var maxWidth = self.canvasWidth;
                            if(img.width > maxWidth) {
                                var ratio = maxWidth / img.width;
                                imageData = detectDemoApp.imageToDataUri(img, img.width * ratio, img.height * ratio);
                                img.src = imageData;
                            }
                            context.drawImage(this, 0, 0, self.canvasWidth, self.canvasHeight);
                            detectDemoApp.globalImageData = detectDemoApp.parseImageData(imageData);
                            $("#upload").val("");
                            var data = {};
                            imgObj = { 
                                "image"   : detectDemoApp.globalImageData,
                                "selector" : "FULL", 
                                "minHeadScale" : ".06"
                            };
                            data.imgObj = JSON.stringify(imgObj);
                            $.ajax({
                                type: 'POST',
                                url: 'detect.php',
                                data: data,
                                dataType: 'text'
                            }).done(function(response){
                                self.apiCallback(response);
                            });
                        }
                    };  
                }
            };
        });
    },
    //------------------------------------
    // DRAGDROP PROCESSING
    //------------------------------------
    dragdropModule: function () {
        var self = this;
        var handleFileSelect = function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            self.resetElements();
            var file = evt.dataTransfer.files[0]; // FileList object.
            var ftype = file.type; // get file type
            var fileTypeAllowed = false;
            $(self.config.uploadFileTypesImage).each(function(idx, fileType) {
                if(fileType == ftype) { 
                  fileTypeAllowed = true;
                }
            }); 
            if (!fileTypeAllowed) {
                self.resetElements();
                detectDemoApp.getTemplate("image-container-template","","",false,true);
                detectDemoApp.getTemplate("json-response-template","Error","Wrong file type.  Must be .png, .gif, or .jpg.",false,false);
                return false;
            }
            else {
                self.createDisplayCanvas(self.canvasWidth, self.canvasHeight);
                $(".json-response pre").html("");
                $(".copy-json-button").hide();
                detectDemoApp.getTemplate("image-container-template","","Analyzing image...",true);
                detectDemoApp.getTemplate("json-response-template","","Generating results...",true);
                var canvas = document.createElement("CANVAS");
                var context = canvas.getContext("2d");
                canvas.width = self.canvasWidth;
                canvas.height = self.canvasWidth;
                var img = new Image();
                var reader  = new FileReader();
                if (file) {
                    reader.readAsDataURL(file);
                } else {
                    img.src = "";
                }
                reader.onloadend = function () {
                    var imageData = String(reader.result);
                    img.src = imageData;
                    var imageLoaded = false;
                    img.onload = function(){
                        if (!imageLoaded) {
                            imageLoaded = true;
                            var maxWidth = self.canvasWidth;
                            if(img.width > maxWidth) {
                                var ratio = maxWidth / img.width;
                                imageData = detectDemoApp.imageToDataUri(img, img.width * ratio, img.height * ratio);
                                img.src = imageData;
                            }
                            context.drawImage(this, 0, 0, self.canvasWidth, self.canvasHeight);
                            detectDemoApp.globalImageData = detectDemoApp.parseImageData(imageData);
                            var data = {};
                            imgObj = { 
                                "image"   : detectDemoApp.globalImageData,
                                "selector" : "FULL", 
                                "minHeadScale" : ".06"
                            };
                            data.imgObj = JSON.stringify(imgObj);
                            $.ajax({
                                type: 'POST',
                                url: 'detect.php',
                                data: data,
                                dataType: 'text'
                            }).done(function(response){
                                self.apiCallback(response);
                            });
                        }
                    };  
                };
            }
        };
        var handleDragOver = function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
        };
        // Setup the dnd listeners.
        var dropZone = $(".canvas-container")[0];
        dropZone.addEventListener("dragover", handleDragOver, false);
        dropZone.addEventListener("drop", handleFileSelect, false);
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
    // CALLBACK FROM API
    //------------------------------------
    apiCallback: function(response) {
        $("#previewImage").hide();
        $(".copy-json-button").show();
        $(".json-title").show();
        $(".spinner-message-container").hide();
        $(".ui-buttons-mask").hide();
        detectDemoApp.processingExample = false;
        
        var kairosJSON = JSON.parse(response);

        if(!kairosJSON.images || !kairosJSON.images[0].faces[0]) {
            detectDemoApp.showJsonResponse({});
        }
        else {
            detectDemoApp.showJsonResponse(kairosJSON);
        }
        if (kairosJSON.images) {
            detectDemoApp.drawMethod(kairosJSON.images[0]);
        }
        else {
            detectDemoApp.getTemplate("image-container-template","Error","No faces were detected.",false);
            $(".main-image-container .spinner-message-container").show();
        }
        
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
    // DRAW FEATURE POINTS ON CANVAS
    //------------------------------------
    drawMethod: function(image) {
        var canvas = $("#displayCanvas")[0];
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        var imageObj = new Image();
        imageObj.onload = function() {
            context.drawImage(imageObj, 0, 0);
            for (var i = 0; i < image.faces.length; i++) { 
                var face = image.faces[i];
                var strokeStyle = '#139C8A';
                // color code gender
                if (face.attributes && face.attributes.gender.type == "F" && parseInt(face.attributes.gender.confidence) > 59) {
                    strokeStyle = '#ff99ff';
                }
                else if (face.attributes && face.attributes.gender.type == "M" && parseInt(face.attributes.gender.confidence) > 59) {
                    strokeStyle = '#0033ff';
                }
                // draw face box
                if (face.topLeftX != -1 && face.topLeftY != -1) {
                    context.beginPath();
                    context.rect(face.topLeftX, face.topLeftY, face.width, face.height);
                    context.lineWidth = 3;
                    context.strokeStyle = strokeStyle;
                    context.stroke();
                }

                // draw left eye
                if (!negVals(face,"leftEyeCornerLeft","leftEyeCornerRight")) {
                    context.beginPath();
                    context.moveTo(face.leftEyeCornerLeftX, face.leftEyeCornerLeftY);
                    context.lineTo(face.leftEyeCornerRightX, face.leftEyeCornerRightY);
                    context.stroke();
                }

                if (face.leftEyeCenterX != -1 && face.leftEyeCenterY != -1) {
                    context.beginPath();
                    context.moveTo(face.leftEyeCenterX, (face.leftEyeCenterY + (face.height / 25)));
                    context.lineTo(face.leftEyeCenterX, (face.leftEyeCenterY - (face.height / 25)));
                    context.stroke();
                }

                // draw right eye
                if (!negVals(face,"rightEyeCornerLeft","rightEyeCornerRight")) {
                    context.beginPath();
                    context.moveTo(face.rightEyeCornerLeftX, face.rightEyeCornerLeftY);
                    context.lineTo(face.rightEyeCornerRightX, face.rightEyeCornerRightY);
                    context.stroke();
                }

                if (face.rightEyeCenterX != -1 && face.rightEyeCenterY != -1) {
                    context.beginPath();
                    context.moveTo(face.rightEyeCenterX, (face.rightEyeCenterY + (face.height / 25)));
                    context.lineTo(face.rightEyeCenterX, (face.rightEyeCenterY - (face.height / 25)));
                    context.stroke();
                }

                // left eyebrow
                if (!negVals(face,"leftEyeBrowLeft","leftEyeBrowMiddle")) {
                    context.beginPath();
                    context.moveTo(face.leftEyeBrowLeftX, face.leftEyeBrowLeftY);
                    context.lineTo(face.leftEyeBrowMiddleX, face.leftEyeBrowMiddleY);
                    context.stroke();
                }

                if (!negVals(face,"leftEyeBrowMiddle","leftEyeBrowRight")) {
                    context.beginPath();
                    context.moveTo(face.leftEyeBrowMiddleX, face.leftEyeBrowMiddleY);
                    context.lineTo(face.leftEyeBrowRightX, face.leftEyeBrowRightY);
                    context.stroke();
                }

                // right eyebrow
                if (!negVals(face,"rightEyeBrowLeft","rightEyeBrowMiddle")) {
                    context.beginPath();
                    context.moveTo(face.rightEyeBrowLeftX, face.rightEyeBrowLeftY);
                    context.lineTo(face.rightEyeBrowMiddleX, face.rightEyeBrowMiddleY);
                    context.stroke();
                }

                if (!negVals(face,"rightEyeBrowMiddle","rightEyeBrowRight")) {
                    context.beginPath();
                    context.moveTo(face.rightEyeBrowMiddleX, face.rightEyeBrowMiddleY);
                    context.lineTo(face.rightEyeBrowRightX, face.rightEyeBrowRightY);
                    context.stroke();
                }

                // draw mouth
                if (!negVals(face,"lipCornerLeft","lipLineMiddle")) {
                    context.beginPath();
                    context.moveTo(face.lipCornerLeftX, face.lipCornerLeftY);
                    context.lineTo(face.lipLineMiddleX, face.lipLineMiddleY);
                    context.stroke();
                }

                if (!negVals(face,"lipLineMiddle","lipCornerRight")) {
                    context.beginPath();
                    context.moveTo(face.lipLineMiddleX, face.lipLineMiddleY);
                    context.lineTo(face.lipCornerRightX, face.lipCornerRightY);
                    context.stroke();
                }

                // draw nose
                if (!negVals(face,"nostrilLeftSide","nostrilLeftHoleBottom")) {
                    context.beginPath();
                    context.moveTo(face.nostrilLeftSideX, face.nostrilLeftSideY);
                    context.lineTo(face.nostrilLeftHoleBottomX, face.nostrilLeftHoleBottomY);
                    context.stroke();
                }

                if (!negVals(face,"nostrilRightSide","nostrilRightHoleBottom")) {
                    context.beginPath();
                    context.moveTo(face.nostrilRightSideX, face.nostrilRightSideY);
                    context.lineTo(face.nostrilRightHoleBottomX, face.nostrilRightHoleBottomY);
                    context.stroke();
                }
            }
        };
        imageObj.src = 'data:image/jpeg;base64,' + detectDemoApp.globalImageData;

        var negVals = function(faceObj,attr1,attr2) {
            var neg = false;
            var xAttr1, yAttr1, xAttr2, yAttr2;
            xAttr1 = attr1 + "X";
            yAttr1 = attr1 + "Y";
            xAttr2 = attr2 + "X";
            yAttr2 = attr2 + "Y";
            if (
                faceObj[xAttr1] == -1 ||
                faceObj[yAttr1] == -1 ||
                faceObj[xAttr2] == -1 ||
                faceObj[yAttr2] == -1
              ) {
                neg = true;
            }
            return neg;
        };
    },
    //------------------------------------
    // SHOW JSON RESPONSE
    //------------------------------------
    showJsonResponse: function (data) {
        var self = this;
        var str = JSON.stringify(data, null, 4);
        $(".json-response pre").html(self.syntaxHighlight(str));
    }, 
    //------------------------------------
    // DISPLAY HANDLEBARS TEMPLATES
    //------------------------------------ 
    getTemplate: function(template,message1,message2,spinner,sadFace){
        var thisTemplate = $("#" + template).html();
        var compiledTemplate = Handlebars.compile(thisTemplate);
        var context = {
            "message1": message1,
            "message2": message2,
            "spinner": spinner,
            "sadFace": sadFace
        };
        var theCompiledHtml = compiledTemplate(context);
        $("." + template).html(theCompiledHtml);
    },
    //------------------------------------
    // CREATE CANVAS FOR DISPLAYING IMAGE
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
    },
    resetElements: function() {
        $(".canvas-container").empty();
        $(".face-overlay").hide();
        $(".json-title").hide();
        $(".spinner-message-container")
        .empty()
        .show();
        $(".json-response pre").html("");
        $(".copy-json-button").hide();
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
    }
};








