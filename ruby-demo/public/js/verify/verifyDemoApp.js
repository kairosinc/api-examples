//------------------------------------
// verifyDemoApp.js
// javascript object responsible for primary  verify demo functionality
// dependencies: jquery.js, jquery-ui
// created: July 2017
// author: Steve Rucker
//------------------------------------

var verifyDemoApp = verifyDemoApp || {};
verifyDemoApp =  {
    //------------------------------------
    // INITIALIZE - index.php
    //------------------------------------
    init: function (config) {
        this.setElementDimensions();
        this.config = config;
        this.apiCredentials = config.apiCredentials;
        this.processingLeft = false;
        this.processingRight = false;
        this.simultaneousData = "";
        this.simultaneousUrl = undefined;
        this.radiusDefault = 25;
        this.showMasks();
        if (this.apiCredentials){
            this.examplesModule();
            this.uploadModule();
            this.urlModule();
        }
        else {
            this.errorTemplate("image-right-template","ERROR: API credentials not provided.",false,false);
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
    examplesModule: function () {
        var self = this; 
        var positions = ["left", "right"];
        $(".show-json").hide();
        $(".hide-json").click();
        $(".image-group img").css("opacity","0.5");
        var getRandomInt = function getRandomInt(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        $.each(positions, function(index, position) {
            $(".canvas-container-" + position).hide();
            if (position == "left"){
                self.processingLeft = true;
            }
            else {
                self.processingRight = true;
            }
            self.errorTemplate(position,"Analyzing image...",true,false);
            var subjectId = $("#image-" + position).attr("subjectId");
            var imageData = imageDataObj[subjectId];
            var imageAnalysis = imageAnalysisDataObj[subjectId];
            var jsonResponse = "";
            var waitForAnalysis = setTimeout(function(){
                if (position == "left"){
                    self.errorTemplate("left","",false,false,false);
                    // draw box
                    utils.createDisplayCanvas(self.canvasWidth, self.canvasHeight, "left");
                    $(".canvas-container-left").show();
                    self.drawMethod(imageAnalysis.images[0], imageData, "left", false, true);
                    $(".upload-mask-left, .url-mask-left").hide();
                    self.processingLeft = false;
                }
                else {
                    jsonResponse = jsonDataObj[$("#image-left").attr("subjectId")];
                    self.errorTemplate("right","Verifying image...",true,false,false);
                    exampleVerify("right", imageData, imageAnalysis, jsonResponse);
                }
                
            },getRandomInt(500, 1000));
        });
        var exampleVerify = function (position, imageData, imageAnalysis, jsonResponse) {
            var waitForVerification = setTimeout(function(){
                // draw box
                utils.createDisplayCanvas(self.canvasWidth, self.canvasHeight, position);
                $(".canvas-container-" + position).show();
                self.drawMethod(imageAnalysis.images[0], imageData, position, false, true);
                // show json
                self.errorTemplate(position,"",false,false);
                $(".show-json").show();
                if (jsonResponse) {
                    self.errorTemplate(position,"",false,false,true);
                    var status = jsonResponse.images[0].transaction.status;
                    var confidence = jsonResponse.images[0].transaction.confidence;
                    if (status == "success") {
                        if (confidence >= .6) {
                           $(".verify-response").html("MATCH"); 
                        }
                        else {
                            $(".verify-response").html("NO MATCH");
                        }
                    }
                    else {
                        $(".verify-response").html("ERROR");
                    }
                    utils.showJsonResponse(jsonResponse);
                    $(".upload-mask-right, .url-mask-right").hide();
                    self.processingRight = false;
                }
            },getRandomInt(500, 1000));
        };
    },
    verifyImage: function (position, imageData, url) {
        var self = this;
        self.errorTemplate(position,"Verifying image...",true,true,false);
        $(".image-" + position + "-template").show();
        utils.createDisplayCanvas(self.canvasWidth, self.canvasHeight, position);
        // get galleryId and subjectId of OPPOSITE image
        var thisGalleryId = "";
        var thisSubjectId = "";
        if (position == "left"){
            thisGalleryId = $("#image-right").attr("galleryId");
            thisSubjectId = $("#image-right").attr("subjectId");
        }
        if (position == "right"){
            thisGalleryId = $("#image-left").attr("galleryId");
            thisSubjectId = $("#image-left").attr("subjectId");
        }
        var imgSrc = utils.parseImageData(imageData);
        if (url != undefined) {
            imgSrc = url;
        }
        var data = {};
        imgObj = { 
            "image"         : imgSrc,
            "gallery_name"  : thisGalleryId,
            "subject_id"    : thisSubjectId
        };
        data.imgObj = JSON.stringify(imgObj);
        data.process = "verify";
        $.ajax({
            type: 'POST',
            url: '/verify/send-to-api',
            data: data,
            dataType: 'text'
        }).done(function(imageAnalysis){
            self.displayResponse(imageAnalysis, imageData, position, false, false, url);
        });
    },
    enrollImage: function (position, imageData, sendToDisplay, url) {
        var self = this;
        var data = {};
        var thisId = Date.now();
        var galleryId = "gallery-" + thisId;
        var subjectId = "subject-" + thisId;
        var imgSrc = utils.parseImageData(imageData);
        if (url != undefined) {
            imgSrc = url;
        }
        $("#image-" + position).attr("galleryId", galleryId);
        $("#image-" + position).attr("subjectId", subjectId);
        imgObj = { 
            "image"   : imgSrc,
            "gallery_name" : galleryId,
            "subject_id" : subjectId
        };
        
        data.imgObj = JSON.stringify(imgObj);
        data.process = "enroll";
        $.ajax({
            type: 'POST',
            url: '/verify/send-to-api',
            data: data,
            dataType: 'text'
        }).done(function(imageAnalysis){
            if (sendToDisplay) {
                utils.createDisplayCanvas(self.canvasWidth, self.canvasHeight, position);
                self.displayResponse(imageAnalysis, imageData, position, true, true, url);
            }
            else {
                if (JSON.parse(imageAnalysis).images) {
                    self.drawMethod(JSON.parse(imageAnalysis).images[0], imageData, position, false, true, url);
                }
            }
        });
        canvas = null; 
    },
    //------------------------------------
    // FILE UPLOAD PROCESSING
    //------------------------------------
    uploadModule: function () { 
        var self = this;  
        $('.upload-form').submit(function() {
            $(".hide-json").click();
            var position = $(this).attr("id").split("-")[1];
            if (position == "left") {
                self.processingLeft = true;
            }
            if (position == "true") {
                self.processingRight = true;
            }
            self.showMasks();
            var input = $("#upload-" + position)[0];
            if (input.files[0]) { 
                // get galleryId and subjectId of OPPOSITE image
                var thisGalleryId = "";
                var thisSubjectId = "";
                if (position == "left"){
                    thisGalleryId = $("#image-right").attr("galleryId");
                    thisSubjectId = $("#image-right").attr("subjectId");
                }
                if (position == "right"){
                    thisGalleryId = $("#image-left").attr("galleryId");
                    thisSubjectId = $("#image-left").attr("subjectId");
                }
                preProcess(input, thisGalleryId, thisSubjectId, position);
            }
            return false; 

        });
        var preProcess = function (input, galleryId, subjectId, position) {
            $(".show-json").hide();
            self.errorTemplate("image-" + position + "-template","Analyzing image...",false,true,false);
            if (position == "left") {
                self.errorTemplate("image-right-template","",false,false);
            }

            var fsize = input.files[0].size;
            var fileSizeAllowed = false;
            if(fsize <= self.config.uploadFileSizeImage) { 
                fileSizeAllowed = true;
            } 
            if (!fileSizeAllowed) {
                var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeImage/1000000 + "MB";
                self.errorTemplate("image-" + position + "-template",filesizeMsg,false,false);
                self.hideMasks();
                return false;
            }
            else if (!input) {
                self.ere("image-" + position + "-template","Couldn't find the file input element.",false,false);
                self.hideMasks();
                return false;
            }
            else if (!input.files) {
                self.errorTemplate("image-" + position + "-template","This browser doesn't seem to support the `files` property of file inputs.",false,false);
                self.hideMasks();
                return false;
            }
            else {
                $(".display-image-" + position + "-container").empty();
                var file = input.files[0];
                var reader  = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = function () {
                    var imageData = String(reader.result);
                    $(".canvas-container-" + position).empty();
                    // show image
                    $(".canvas-container-" + position).hide();
                    var img = new Image();
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
                                css: cssObj,
                                id: "image-" + position
                            });
                            var processImage = function() {
                                image.appendTo(".display-image-" + position + "-container");
                                setTimeout(function(){
                                   self.setElementDimensions(); 
                                },100);
                                self.verifyImage(position, imageData);
                                self.enrollImage(position, imageData);
                            };
                            utils.rotateImage($(image)[0], processImage, self);
                        }
                    };  
                };
            }
         };
    },
    //------------------------------------
    // URL PROCESSING
    //------------------------------------
    urlModule: function () {
        var self = this;
        $(".submit-button").click(function(){
            $(".hide-json").click();
            var position = $(this).attr("id").split("-")[1];
            if (position == "left") {
                self.processingLeft = true;
            }
            if (position == "right") {
                self.processingRight = true;
            }
            var urlImageSrc = utils.validateUrl($("#url-" + position).val());
            if (urlImageSrc === false) {
                $(".error-" + position).html("Please enter a valid URL");
                self.hideMasks();
                return false;
            }
            // check to see if both URL fields have been submitted simultaneously
            var simultaneous = false;
            if (utils.validateUrl($("#url-left").val()).length && 
                utils.validateUrl($("#url-right").val()).length &&
                self.keydown) {
                simultaneous = true;
            }
            var img = new Image();
            img.src = urlImageSrc;
            img.onload = function () {
                var imgWidth = img.width;
                var imgHeight = img.height;
                var cssObj = utils.computeCss(imgWidth, imgHeight, self.canvasWidth);
                var image = $('<img />', {
                    src: urlImageSrc,
                    css: cssObj,
                    id: "image-" + position
                });
                var processImage = function() {
                    $(".display-image-" + position + "-container").empty();
                    image.appendTo(".display-image-" + position + "-container");
                    if (position == "left") {
                        self.errorTemplate("right","",false,false);
                    }
                    $(".canvas-container-" + position).empty();
                    // show image
                    $(".canvas-container-" + position).hide();

                    if (position == "right" && simultaneous) {
                        // store data for enroll/verify later
                        self.simultaneousUrl = urlImageSrc;
                    }
                    else if (position == "left" && simultaneous) {
                        self.enrollImage("left", "", true, urlImageSrc);
                    }
                    else {
                        self.verifyImage(position, "", urlImageSrc);
                        self.enrollImage(position, "", false, urlImageSrc); 
                    } 
                }
                utils.rotateImage($(image)[0], processImage, self, urlImageSrc);
                    
            }
                 
        });
    },
    //------------------------------------
    // SHOW VERIFICATION RESPONSE
    //------------------------------------
    displayResponse: function(imageAnalysis, imageData, position, simultaneous, enrolled, url) {
        var self = this;
        var kairosJSON = JSON.parse(imageAnalysis);
        if (kairosJSON.Errors) {
            var errorMsg = kairosJSON.Errors[0].Message.charAt(0).toUpperCase() + kairosJSON.Errors[0].Message.slice(1);
            self.errorTemplate(position,errorMsg,false,false); 
            $(".verify-response").html("ERROR");
            self.hideMasks();
        }
        else if (!kairosJSON.images) {
            self.errorTemplate(position,"No faces found.",false,false);
            $(".verify-response").html("ERROR");
            self.hideMasks();
        }
        else {
            if (kairosJSON.images.length > 1) {
                self.errorTemplate(position,"More than one face in the image.",false,false);
                self.hideMasks();
            }
            else {
                self.errorTemplate("left","",false,false);
                if (simultaneous) {
                    $(".canvas-container-" + position).show();
                    self.drawMethod(kairosJSON.images[0], imageData, position, simultaneous, enrolled, url);
                    self.errorTemplate("left","",false,false);
                    self.verifyImage("right", self.simultaneousData, self.simultaneousUrl);
                    self.enrollImage("right", self.simultaneousData, false, self.simultaneousUrl);
                    self.simultaneousData = ""; 
                    self.keydown = false;                   
                }
                else {
                    self.errorTemplate("right","",false,false,true);
                    $(".show-json").show();
                    $(".canvas-container-" + position).show();
                    self.drawMethod(kairosJSON.images[0], imageData, position, simultaneous, enrolled, url);
                    var status = kairosJSON.images[0].transaction.status;
                    var confidence = kairosJSON.images[0].transaction.confidence;
                    if (status == "success") {
                        if (confidence >= .6) {
                           $(".verify-response").html("MATCH"); 
                        }
                        else {
                            $(".verify-response").html("NO MATCH");
                        }
                    }
                    else {
                        $(".verify-response").html("ERROR");
                    }
                    utils.showJsonResponse(kairosJSON);
                    self.hideMasks();
                }
            }
        } 
        if (position == "left") {
            self.processingLeft = false;
        }
        if (position == "true") {
            self.processingRight = false;
        }
        
    },
    //------------------------------------
    // DRAW FEATURE POINTS ON CANVAS
    //------------------------------------
    drawMethod: function(imageAnalysis, imageData, position, simultaneous, enrolled, imageUrl) {
        var self = this;
        if (enrolled) {
            var canvas = $("#displayCanvas" + position)[0];
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            var imgSrc = imageData;
            if (imageUrl != undefined) {
                imgSrc = imageUrl;
            }
            var img = new Image();
            img.src = imgSrc;
            var imageLoaded = false;
            img.onload = function(){
                if (!imageLoaded) {
                    imageLoaded = true;
                    adjX   = 1;
                    adjY   = 1;
                    subX   = 0;
                    subY   = 0;
                    // get actual image dimensions from Kairos API response      
                    var imgWidth = img.width;
                    var imgHeight = img.height;
                    // get dimensions of the image as it is displayed in .display-image-container
                    var displayImageDimensions = utils.getDisplayImageDimensions(imgWidth, imgHeight, self.canvasWidth);
                    // get dimensions and ratio of image relative to display size
                    var newImageInfo = utils.calculateAspectRatioFit(imgWidth,imgHeight,displayImageDimensions.width,displayImageDimensions.height);
                    // adjust aspect ratio of feature points relative to resized image
                    adjX   = newImageInfo.ratio;
                    adjY   = newImageInfo.ratio;
                    // reposition face relative to full image size
                    switch(parseInt(self.imageOrientation)) {
                        case 3:
                            // 180 degrees
                            subX   = (self.canvasWidth - newImageInfo.width) / 2;
                            subY   = (self.canvasHeight - newImageInfo.height) / 2;
                            break;
                        case 6:
                            // 90 CW 
                            subX   = (self.canvasHeight - newImageInfo.height) / 2;
                            subY   = (self.canvasWidth - newImageInfo.width) / 2;
                            break;
                        case 8:
                            // 270 CW
                            subX   = (self.canvasHeight - newImageInfo.height) / 2;
                            subY   = (self.canvasWidth - newImageInfo.width) / 2;
                            break;
                        default:
                            // normal orientation
                            subX   = (self.canvasWidth - newImageInfo.width) / 2;
                            subY   = (self.canvasHeight - newImageInfo.height) / 2;
                    }
                    var imageObj = new Image();
                    imageObj.onload = function() {
                        context.drawImage(imageObj, 0, 0);
                        var face = imageAnalysis.transaction;
                        var strokeStyle = '#139C8A';
                        // color code gender
                        if (imageAnalysis.attributes && imageAnalysis.attributes.gender.type == "F") {
                            strokeStyle = '#ff99ff';
                        }
                        else if (imageAnalysis.attributes && imageAnalysis.attributes.gender.type == "M") {
                            strokeStyle = '#0033ff';
                        }
                        var radius = utils.adjustRadius(face.width * adjX, self.radiusDefault);
                        // draw face box
                        if (face.topLeftX != -1 && face.topLeftY != -1) {
                            utils.roundRect(context, face.topLeftX * adjX + subX, face.topLeftY * adjY + subY, face.width * adjX , face.height * adjY, radius);
                            context.lineWidth = 2;
                            context.strokeStyle = strokeStyle;
                            context.stroke();
                        }
                    };
                    imageObj.src = transparentImageData;
                }
            };
        }
    },
    //------------------------------------
    // DISPLAY ERROR TEMPLATES
    //------------------------------------ 
    errorTemplate: function(position, message, spinner, sadface, response) {
        var templateObj = $(".image-" + position + "-template");
        templateObj.empty();
        var msg = ""
        msg += "<div class='header-bkg-" + position + "'></div>";
        if (spinner) {
            msg += "<div class='processing-spinner'></div>";
        }
        if (sadface) {
            msg += "<div class='sad-face'></div>";
        }
        msg += "<div class='message-container'><div class='message'>" + message + "</div></div>";
        if (response) {
            msg += "<div class='verify-response'></div>";
        }
        msg += "</div>";
        templateObj.append(msg);
    },
    showMasks: function () {
        $(".upload-mask-left, .url-mask-left, .upload-mask-right, .url-mask-right").show();
    },
    hideMasks: function () {
        var self = this;
        self.processingLeft = false;
        self.processingRight = false;
        // $(".url-from-web").val("URL from the web");
        $(".upload-mask-left, .url-mask-left, .upload-mask-right, .url-mask-right").hide();
    },
    showMimetypeError: function (position) {
        var self = verifyDemoApp;
        $(".image-" + position + "-template").show();
        var filetypeMsg = "Wrong file type.  Must be" + self.fileTypeList;
        self.errorTemplate(position,filetypeMsg,false,false);
        if (position == "left"){
            self.processingLeft = false;
        }
        else {
            self.processingRight = false;
        }
        self.hideMasks();
        return false;
    },
    setElementDimensions: function () {
        var self = this;
        if ($(window).width() < 768) {
            this.canvasWidth = $(window).width() / 2;  // allow for side margins
            this.canvasHeight = this.canvasWidth; 
            $(".main-image-container").height(this.canvasWidth + 15); // add bottom margin
            $("#image-left, #image-right").height(this.canvasHeight);
            $(".image-left-template, .image-right-template").width(this.canvasWidth - 22);
            $(".display-image-left-container, .display-image-right-container").height(this.canvasHeight);
            $("#displayCanvasleft, #displayCanvasright")
                .width(this.canvasWidth)
                .height(this.canvasHeight);
            $(".verify.json-response-container, .verify .json-response")
                .width($(window).width() - 30)
                .height(this.canvasHeight);
            $(".verify .json-response pre").height(this.canvasHeight - 55);
            $(".ui-buttons-mask").width(this.canvasWidth);
        }
        else if ($(window).width() < 992) {
            this.canvasWidth = 360;
            this.canvasHeight = this.canvasWidth; 
            $(".main-image-container").height(this.canvasWidth + 15); // add bottom margin
            $("#image-left, #image-right").height(this.canvasHeight);
            $(".image-left-template, .image-right-template").width(this.canvasWidth - 7);
            $(".display-image-left-container, .display-image-right-container").height(this.canvasHeight);
            $("#displayCanvasleft, #displayCanvasright")
                .width(this.canvasWidth)
                .height(this.canvasHeight);
            $(".verify.json-response-container, .verify .json-response")
                .width(338)
                .height(this.canvasHeight);
            $(".verify .json-response pre").height(this.canvasHeight - 55);
            $(".ui-buttons-mask").width(this.canvasWidth);
        }
        else {
            this.canvasWidth = 475;
            this.canvasHeight = 475;
            $(".main-image-container").height(this.canvasWidth + 15); // add bottom margin
            $("#image-left, #image-right").height(this.canvasHeight);
            $(".image-left-template, .image-right-template").width(this.canvasWidth);
            $(".display-image-left-container, .display-image-right-container").height(this.canvasHeight);
            $("#displayCanvasleft, #displayCanvasright")
                .width(this.canvasWidth)
                .height(this.canvasHeight);
            $(".verify.json-response-container, .verify .json-response")
                .width(460)
                .height(this.canvasHeight);
            $(".verify .json-response pre").height(this.canvasWidth);
            $(".ui-buttons-mask").width(this.canvasWidth);
        }
        $(".display-image-left-container img").each(function(idx,image){
            var displayImageCssObj = utils.computeCss(image.naturalWidth, image.naturalHeight, self.canvasWidth);
            $(image).css(displayImageCssObj); 
        });
        $(".display-image-right-container img").each(function(idx,image){
            var displayImageCssObj = utils.computeCss(image.naturalWidth, image.naturalHeight, self.canvasWidth);
            $(image).css(displayImageCssObj); 
        });
    }   
};







