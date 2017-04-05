//------------------------------------
// detectDemoApp.js
// javascript object responsible for primary app functionality
// dependencies: jquery.js, jquery-ui, detect.php
// created: May 2016
// modified: January 2017
// author: Steve Rucker
//------------------------------------

var detectDemoApp = detectDemoApp || {};
detectDemoApp =  {
    //------------------------------------
    // INITIALIZE - index.php
    //------------------------------------
    init: function (config) {
        this.setElementDimensions();
        this.radiusDefault = 25;
        this.config = config;
        this.apiCredentials = config.apiCredentials;
        if (this.apiCredentials){
            this.examplesModule("");
            this.uploadModule();
            this.urlModule();
        }
        else {
            this.getTemplate("json-response-template","Error","API credentials not provided.",false,false);
        }
        // detect getUserMedia compatibility
        // hide webcam link if not supported
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (!navigator.getUserMedia) {
            $(".webcam").hide();
            $(".ui-buttons .upload").addClass("full-width");
        }
        var fileTypeList = [];
        $(this.config.uploadFileTypesImage).each(function(idx, fileType) {
            fileTypeList.push(" ." + fileType.toString().split("/")[1])
        }); 
        this.fileTypeList = fileTypeList;
    },
    //------------------------------------
    // EXAMPLES PROCESSING
    //------------------------------------
    examplesModule: function (imageElement) {
        var self = this; 
        self.processing = true; 
        $(".display-image-container")
            .empty()
            .hide();
        utils.createDisplayCanvas(self.canvasWidth, self.canvasHeight);
        self.getTemplate("json-response-template","","Generating results...",true);
        var canvas = document.createElement('CANVAS');
        var context = canvas.getContext('2d');
        canvas.width = self.canvasWidth;
        canvas.height = self.canvasHeight;
        var processImage = function () {
            var imageData;
            context.drawImage(imageElement, 0, 0, self.canvasWidth, self.canvasHeight);
            imageData = canvas.toDataURL();
            var data = {};
            imgObj = { 
                "image"   : utils.parseImageData(imageData),
                "minHeadScale" : ".015"
            };
            data.imgObj = JSON.stringify(imgObj);
            $.ajax({
                type: 'POST',
                url: 'detect.php',
                data: data,
                dataType: 'text'
            }).done(function(data){
                var response = JSON.parse(data);
                if (response.Errors) {
                    self.processing = false;
                    self.getTemplate("image-container-template","","",false,true);
                    self.getTemplate("json-response-template","Error: " + utils.toTitleCase(response.Errors[0].Message),"",false);
                    return false;
                }
                else {
                    $(".display-image-container").show();
                    var imgWidth = response.images[0].width;
                    var imgHeight = response.images[0].height;
                    var cssObj = utils.computeCss(imgWidth, imgHeight, self.canvasWidth);
                    var image = $('<img />', {
                        src: $(imageElement).attr("src"),
                        css: cssObj
                    });
                    image.appendTo(".display-image-container");
                    self.apiCallback(data);
                }
            });
            canvas = null; 
        }  
        if (imageElement == "") {
            img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = $("#previewImage").attr("src");
            img.onload = function () {
                imageElement = this;
                processImage();
            }
        }
        else {
            processImage();
        }
    },
    //------------------------------------
    // WEBCAM PROCESSING
    //------------------------------------
    webcamModule: function () {
        var self = this;
        self.processing = true; 
        $(".display-image-container")
            .empty()
            .hide();
        utils.createDisplayCanvas(self.webcamWidth, self.webcamHeight);
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
                    self.localStream = stream.getTracks()[0];
                },
                function(err) {
                    $(".image-container-template").show();
                    self.getTemplate("image-container-template","","",false,true);
                    self.getTemplate("json-response-template","Error","A wecam error occured. Please try again.",false,false);
                    return false;
                }
            );
            video.addEventListener('canplay', function(ev){
                $(".face-overlay").show();
                self.getTemplate("json-response-template","Tip","Keep your face inside the green circle...",false);
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
            $(".image-container-template").show();
            self.getTemplate("image-container-template","","Analyzing image...",true,false);
            self.getTemplate("json-response-template","","Generating results...",true,false);
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

            var cssObj = utils.computeCss(self.webcamWidth, self.webcamHeight, self.canvasWidth);
            var image = $('<img />', {
                src: imageData,
                css: cssObj
            });
            image.appendTo(".display-image-container");
            // send data to Kairos API
            var data = {};
            imgObj = { 
                "image"   : utils.parseImageData(imageData),
                "minHeadScale" : ".015"
            };
            data.imgObj = JSON.stringify(imgObj);
            $.ajax({
                type: 'POST',
                url: 'detect.php',
                data: data,
                dataType: 'text'
            }).done(function(data){
                var response = JSON.parse(data);
                if (response.Errors) {
                    self.processing = false;
                    self.getTemplate("image-container-template","","",false,true);
                    self.getTemplate("json-response-template","Error: " + utils.toTitleCase(response.Errors[0].Message),"",false);
                    return false;
                }
                else {
                    $(".display-image-container").show();
                    self.apiCallback(data);
                }
            });
            self.localStream.stop();
        };
    },
    //------------------------------------
    // FILE UPLOAD PROCESSING
    //------------------------------------
    uploadModule: function () { 
        var self = this;  
        $('#mediaUploadForm').submit(function() { 
            self.processing = true; 
            $(".display-image-container")
                .empty()
                .hide();
            utils.createDisplayCanvas(self.canvasWidth, self.canvasHeight);
            $(".image-container-template").show();
            self.getTemplate("image-container-template","","Analyzing image...",true,false);
            self.getTemplate("json-response-template","","Generating results...",true,false);
            var input = $("#upload")[0];
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                self.getTemplate("image-container-template","","",false,true);
                self.getTemplate("json-response-template","Error","The File APIs are not fully supported in this browser.",false,false);
                self.processing = false; 
                return false;
            } 
            // asynchronous script to check for mime type
            utils.checkMimeType(self.config, input, "upload", self.showMimetypeError);

            var fileSizeAllowed = false;
            var fsize = input.files[0].size;          
            if(fsize <= self.config.uploadFileSizeImage) { 
                fileSizeAllowed = true;
            }
            if (!fileSizeAllowed) {
                $(".image-container-template").show();
                self.getTemplate("image-container-template","","",false,true);
                var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeImage/1000000 + "MB";
                self.getTemplate("json-response-template","Error",filesizeMsg,false,false);
                self.processing = false;
                return false;
            }
            else if (!input) {
                $(".image-container-template").show();
                self.getTemplate("image-container-template","","",false,true);
                self.getTemplate("json-response-template","Error","Couldn't find the file input element.",false,false);
                self.processing = false;
                return false;
            }
            else if (!input.files) {
                $(".image-container-template").show();
                self.getTemplate("image-container-template","","",false,true);
                self.getTemplate("json-response-template","Error","This browser doesn't seem to support the `files` property of file inputs.",false,false);
                self.processing = false;
                return false;
            }
            else {
                var img = new Image();
                var file = input.files[0];
                var reader  = new FileReader();
                reader.readAsDataURL(file);   
                reader.onloadend = function () {
                    var imageData;
                    imageData = String(reader.result);
                    img.src = imageData;
                    var imageLoaded = false;
                    img.onload = function(){
                        if (!imageLoaded) {
                            imageLoaded = true;
                            var imgWidth = img.width;
                            var imgHeight = img.height;
                            var cssObj = utils.computeCss(imgWidth, imgHeight, self.canvasWidth);
                            var image = $('<img />', {
                                src: imageData,
                                css: cssObj
                            });
                            var processImage = function() {
                                image.appendTo(".display-image-container");
                                $("#upload").val("");
                                var data = {};
                                imgObj = { 
                                    "image"   : utils.parseImageData(imageData),
                                    "minHeadScale" : ".015"
                                };
                                data.imgObj = JSON.stringify(imgObj);
                                $.ajax({
                                    type: 'POST',
                                    url: 'detect.php',
                                    data: data,
                                    dataType: 'text'
                                }).done(function(data){
                                    var response = JSON.parse(data);
                                    if (response.Errors) {
                                        self.processing = false;
                                        self.getTemplate("image-container-template","","",false,true);
                                        self.getTemplate("json-response-template","Error: " + utils.toTitleCase(response.Errors[0].Message),"",false);
                                        return false;
                                    }
                                    else {
                                        setTimeout(function(){
                                           self.setElementDimensions(); 
                                        },100);
                                        $(".display-image-container").show();
                                        self.apiCallback(data);
                                    }
                                });
                            };
                            // rotate image if needed
                            utils.rotateImage($(image)[0], processImage, self); 
                        }
                    };  
                };
            } 
            // });
            return false; 
        });
    },
    //------------------------------------
    // URL PROCESSING
    //------------------------------------
    urlModule: function () {
        var self = this;
        $(".submit-button").click(function(){
            self.processing = true;
            var url = $(".url-from-web").val();
            var img = new Image();
            img.src = url;
            img.onload = function () {
                var imgWidth = img.width;
                var imgHeight = img.height;
                var cssObj = utils.computeCss(imgWidth, imgHeight, self.canvasWidth);
                var image = $('<img />', {
                    src: urlImageSrc,
                    css: cssObj
                });
                image.appendTo(".display-image-container");
            }

            var urlImageSrc = utils.validateUrl(url);
            self.urlImageSrc = urlImageSrc;
            if (urlImageSrc === false) {
                self.processing = false;
                $(".url-error").html("Please enter a valid URL");
            }
            else {
                // Image info cannot be retrieved from files received
                // by URL due to CORS issues, so a simulaneous POST 
                // request is made to a PHP file to get this info,
                // and show an error if the file type is not accepted
                utils.checkMimeType(self.config, url, "url", self.showMimetypeError);
                $(".display-image-container")
                    .empty()
                    .hide();
                $(".url-error").html("");
                self.resetElements();
                utils.createDisplayCanvas(self.canvasWidth, self.canvasHeight);
                $(".image-container-template").show();
                self.getTemplate("image-container-template","","Analyzing image...",true,false);
                self.getTemplate("json-response-template","","Generating results...",true,false);
                var data = {};
                imgObj = { 
                    "image"   : urlImageSrc,
                    "minHeadScale" : ".015"
                };
                data.imgObj = JSON.stringify(imgObj);
                $.ajax({
                    type: 'POST',
                    url: 'detect.php',
                    data: data,
                    dataType: 'text'
                }).done(function(data){
                    var response = JSON.parse(data);
                    if (response.Errors) {
                        self.processing = false;
                        self.getTemplate("image-container-template","","",false,true);
                        self.getTemplate("json-response-template","Error: " + utils.toTitleCase(response.Errors[0].Message),"",false);
                        return false;
                    }
                    else if (response.images) {
                        setTimeout(function(){
                           self.setElementDimensions(); 
                        },100);
                        $(".display-image-container").show();
                        self.apiCallback(data);
                    }
                });
            }
        });
    },
    //------------------------------------
    // CALLBACK FROM API
    //------------------------------------
    apiCallback: function(data) {
        var self = this;
        $("#previewImage").hide();
        $(".copy-json-button").show();
        $(".json-title").show();
        $(".image-container-template").hide();
        $(".spinner-message-container").hide();
        $(".ui-buttons-mask").hide();
        self.processing = false;
        
        var response = JSON.parse(data);

        if(!response.images || !response.images[0].faces[0]) {
            utils.showJsonResponse({});
        }
        else {
            utils.showJsonResponse(response);
        }
        if (response.images) {
            self.drawMethod(response.images[0]);
        }
        else {
            self.getTemplate("image-container-template","Error","No faces were detected.",false);
            $(".main-image-container .spinner-message-container").show();
        }
        
    },
    //------------------------------------
    // DRAW FEATURE POINTS ON CANVAS
    //------------------------------------
    drawMethod: function(image) {
        var self = this;
        var canvas = $("#displayCanvas")[0];
        var context = canvas.getContext('2d');
        adjX   = 1;
        adjY   = 1;
        subX   = 0;
        subY   = 0;
        // get actual image dimensions from Kairos API response      
        var imgWidth = image.width;
        var imgHeight = image.height;

        // get dimensions of the image as it is displayed in .display-image-container
        var displayImageDimensions = utils.getDisplayImageDimensions(imgWidth, imgHeight, self.canvasWidth);
        // get dimensions and ratio of image relative to display size
        var newImageInfo = utils.calculateAspectRatioFit(imgWidth,imgHeight,displayImageDimensions.width,displayImageDimensions.height);
        // adjust aspect ratio of feature points relative to resized image
        adjX   = newImageInfo.ratio;
        adjY   = newImageInfo.ratio;
        // reposition face relative to full image size
        subX   = (self.canvasWidth - newImageInfo.width) / 2;
        subY   = (self.canvasHeight - newImageInfo.height) / 2;

        context.clearRect(0, 0, canvas.width, canvas.height);
        var imageObj = new Image();
        imageObj.onload = function() {
            context.drawImage(imageObj, 0, 0);
            
            for (var i = 0; i < image.faces.length; i++) { 

                var face = image.faces[i];
                var strokeStyle = '#139C8A';
                // color code gender
                if (face.attributes && face.attributes.gender.type == "F") {
                    strokeStyle = '#ff99ff';
                }
                else if (face.attributes && face.attributes.gender.type == "M") {
                    strokeStyle = '#0033ff';
                }
                if (face.confidence >= .989) {
                    var radius = utils.adjustRadius(face.width * adjX, self.radiusDefault);

                    // draw face box
                    if (face.topLeftX != -1 && face.topLeftY != -1) {
                        utils.roundRect(context, face.topLeftX * adjX + subX, face.topLeftY * adjY + subY, face.width * adjX , face.height * adjY, radius);
                        context.lineWidth = 2;
                        context.strokeStyle = strokeStyle;
                        context.stroke();
                    }

                    if (face.leftEyeCenterX != -1 && face.leftEyeCenterY != -1) {
                        context.beginPath();
                        context.moveTo(face.leftEyeCenterX * adjX + subX, (face.leftEyeCenterY * adjY + subY + ((face.height * adjY + subY) / 25)));
                        context.lineTo(face.leftEyeCenterX * adjX + subX, (face.leftEyeCenterY * adjY + subY - ((face.height * adjY + subY) / 25)));
                        context.stroke();
                    }

                    if (face.rightEyeCenterX != -1 && face.rightEyeCenterY != -1) {
                        context.beginPath();
                        context.moveTo(face.rightEyeCenterX * adjX + subX, (face.rightEyeCenterY * adjY + subY + ((face.height * adjY + subY) / 25)));
                        context.lineTo(face.rightEyeCenterX * adjX + subX, (face.rightEyeCenterY * adjY + subY - ((face.height * adjY + subY) / 25)));
                        context.stroke();
                    }

                    if (face.chinTipX != -1 && face.chinTipY != -1) {
                        context.beginPath();
                        context.moveTo(face.chinTipX * adjX + subX, (face.chinTipY * adjY + subY + ((face.height * adjY + subY) / 25)));
                        context.lineTo(face.chinTipX * adjX + subX, (face.chinTipY * adjY + subY - ((face.height * adjY + subY) / 25)));
                        context.stroke();
                    }
                }
            }
        };
        imageObj.src = transparentImageData;
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
    showMimetypeError: function () {
        var self = detectDemoApp;
        $(".image-container-template").show();
        self.getTemplate("image-container-template","","",false,true);
        var filetypeMsg = "Wrong file type.  Must be" + self.fileTypeList;
        self.getTemplate("json-response-template","Error",filetypeMsg,false,false);
        self.processing = false;
        return false;
    },
    setElementDimensions: function () {
        var self = this;
        if ($(window).width() < 768) {
            this.canvasWidth = $(window).width() - 30;  // allow for side margins
            this.canvasHeight = this.canvasWidth; 
            $(".main-image-container").height(this.canvasWidth + 15); // add bottom margin
            $("#previewImage").height(this.canvasHeight);
            $(".webcam-video-container, .canvas-container, .display-image-container, .display-image-container img, .image-container-template, #displayCanvas")
                .width(this.canvasWidth)
                .height(this.canvasHeight);
            $(".json-response").width(this.canvasWidth);
            $(".json-response pre").height(this.canvasHeight);
            $(".ui-buttons-mask").width(this.canvasWidth);
        }
        else if ($(window).width() < 992) {
            this.canvasWidth = 360;
            this.canvasHeight = this.canvasWidth; 
            $(".main-image-container").height(this.canvasWidth); // add bottom margin
            $("#previewImage").height(this.canvasHeight);
            $(".webcam-video-container, .canvas-container, .display-image-container, .display-image-container img, .image-container-template, #displayCanvas")
                .width(this.canvasWidth)
                .height(this.canvasHeight);
            $(".json-response").width(345);
            $(".json-response pre").height(305);
            $(".ui-buttons-mask").width(720);
        }
        else {
            this.canvasWidth = 475;
            this.canvasHeight = 475;
            $(".main-image-container").height(this.canvasWidth + 15); // add bottom margin
            $("#previewImage").height(this.canvasHeight);
            $(".webcam-video-container, .canvas-container, .display-image-container, .display-image-container img, .image-container-template, #displayCanvas")
                .width(this.canvasWidth)
                .height(this.canvasHeight);
            $(".json-response").width(475);
            $(".json-response pre").height(420);
            $(".ui-buttons-mask")
                .width($(".ui-buttons").width() - 30)
                .height(110);
        }
        $(".display-image-container img").each(function(idx,image){
            var displayImageCssObj = utils.computeCss(image.naturalWidth, image.naturalHeight, self.canvasWidth);
            $(image).css(displayImageCssObj); 
        });
    } 
};







