//------------------------------------
// verifyDemoApp.js
// javascript object responsible for primary  verify demo functionality
// dependencies: jquery.js, jquery-ui, verify.php
// created: December 2016
// last modified: January 2017
// author: Steve Rucker
//------------------------------------

var recognizeDemoApp = recognizeDemoApp || {};
recognizeDemoApp =  {
    //------------------------------------
    // INITIALIZE - index.php
    //------------------------------------
    init: function (config) {
        this.thumbnailSize = 141;
        this.recognizeDisplaySize = 475;
        this.recognizeThreshold = 0.6; // this is NOT an API parameter, it's for the demo display
        this.radiusDefault = 25;
        this.config = config;
        this.apiCredentials = config.apiCredentials;
        this.galleryId = "gallery-" + Date.now();
        // options
        this.minHeadScale = 0.015;
        this.threshold = 0.01;
        this.enrolledImages = 1; // 1 is the minimum for max_num_results
        if (this.apiCredentials){
            this.examples();
            this.uploadHandler();
            this.setElementDimensions();
        }
        else {
            this.errorTemplate("image-right-template","ERROR: API credentials not provided.",false,false);
        }
    },
    //------------------------------------
    // EXAMPLES
    //------------------------------------
    examples: function () {
        $(".json-response pre").html(utils.showJsonResponse(jsonDataObj));
    },
    //------------------------------------
    // UPLOAD HANDLER (MOBILE)
    //------------------------------------
    uploadHandler: function () { 
        var self = this;  
        $(".enroll-form").submit(function(e) {
            e.stopPropagation();
            e.preventDefault();
            var input = $("#enrollImage")[0];
            self.enrollImage(input);
        });
        $(".recognize-form").submit(function(e) {
            e.stopPropagation();
            e.preventDefault();
            var input = $("#recognizeImage")[0];
            self.recognizeImage(input);
        });
    },
    //------------------------------------
    // ENROLL IMAGE PROCESSING
    //------------------------------------
    enrollImage: function(input) {
        var self = recognizeDemoApp;
        if (input.dataTransfer != undefined) {
            input.stopPropagation();
            input.preventDefault();
            var file = input.dataTransfer.files[0]; // FileList object.
        }
        else {
            var file = input.files[0];
        }
        if ($(".enrolled-image").length >= self.enrollmentLimit ) {
            $(".image-left-template").show();
            self.errorTemplate("image-left-template","You have reached the image enrollment limit.",false,false);
            setTimeout(function(){
                $(".image-left-template").fadeOut(); 
            },3000);
            return false;
        }
        else {
            $(".image-left-template, .image-right-template").show();
            $(".reset-panels").show();
            var ftype = file.type; // get file type
            var fileTypeAllowed = false;
            var fileTypeList = [];
            $(self.config.uploadFileTypesImage).each(function(idx, fileType) {
                fileTypeList.push(" ." + fileType.toString().split("/")[1])
                if(fileType == ftype) { 
                    fileTypeAllowed = true;
                }
            }); 
            if (!fileTypeAllowed) {
                var filetypeMsg = "Wrong file type.  Must be" + fileTypeList;
                self.errorTemplate("image-left-template",filetypeMsg,false,false);
                setTimeout(function(){
                    $(".image-left-template").fadeOut(); 
                },3000);
                return false;
            }
            else {
                $(".json-response pre").html("");
                $(".copy-json-button").hide();
                self.errorTemplate("image-left-template","Analyzing image...",false,true);
                self.errorTemplate("image-right-template","",false,false);
                var reader  = new FileReader();
                reader.readAsDataURL(file);
                var thumbnail = self.thumbnailSize;
                reader.onloadend = function () {
                    var imageData = String(reader.result);
                    // get dimensions of original image
                    var img = new Image();
                    img.src = imageData;
                    img.onload = function(){
                        var cssObj = utils.computeCss(img.width, img.height, thumbnail);
                        var subjectId = "subject-" + Date.now();
                        var image = $('<img />', {
                            src: imageData,
                            css: cssObj
                        });
                        var processEnrollImage = function() {
                            var imageWrapper = $('<li />', {
                                class: "enrolled-image",
                                css: {height: thumbnail},
                                subjectId: subjectId
                            });
                            setTimeout(function(){
                               self.setElementDimensions(); 
                            },100);
                            imageWrapper.append(image);
                            imageWrapper.append("<div class='image-mask'></div><div class='image-mask-unrecognized'></div><div class='image-info'></div>");
                            $('.enrolled-images').append(imageWrapper);
                            // show in options panel
                            self.enrolledImages = $(".enrolled-image").length;
                            $("#optionMaxNumResults").val(self.enrolledImages);
                            $(".maxnumresults-slider").slider( "option", "max", self.enrolledImages);
                            $(".maxnumresults-slider").slider("value", self.enrolledImages);
                            $(".option-error-maxnumresults").html("");
                            if (self.enrolledImages > 1) {
                               $(".max-num-prompt").html("Enter a value between 1 and " + self.enrolledImages);
                            }
                            
                            $(".left-image-container .user-instructions").hide();
                            var data = {};
                            imgObj = { 
                                "image"   : utils.parseImageData(imageData),
                                "gallery_name" : self.galleryId,
                                "subject_id" : subjectId,
                                "minHeadScale": 0.015,
                                "multiple_faces": false
                            }
                            data.imgObj = JSON.stringify(imgObj);
                            data.process = "enroll";
                            $.ajax({
                                type: 'POST',
                                url: '/recognize/send-to-api',
                                data: data,
                                dataType: 'text'
                            }).done(function(response){
                                $(".main-container").addClass("enrolled");
                                self.displayResponse(response,"enroll",subjectId);
                            });
                                    
                        };
                        // rotate image if needed
                        utils.rotateImage($(image)[0], processEnrollImage, self);                         
                      };
                 };
            }
        }
    },
    //------------------------------------
    // RECOGNIZE IMAGE PROCESSING
    //------------------------------------
    recognizeImage: function(input) {
        var self = recognizeDemoApp;
        if (input.dataTransfer != undefined) {
            input.stopPropagation();
            input.preventDefault();
            var file = input.dataTransfer.files[0]; // FileList object.
        }
        else {
            var file = input.files[0];
        }
        $(".right-image-container .user-instructions").hide();
        $(".image-right-template").show();
        $(".show-json").hide();
        if (!$('.main-container').hasClass("enrolled")) {
            self.errorTemplate("image-right-template","You must first enroll at least one image on the right",false,false);
        }
        else {
            var ftype = file.type; // get file type
            var fileTypeAllowed = false;
            var fileTypeList = [];
            $(self.config.uploadFileTypesImage).each(function(idx, fileType) {
                fileTypeList.push(" ." + fileType.toString().split("/")[1])
                if(fileType == ftype) { 
                    fileTypeAllowed = true;
                }
            }); 
            if (!fileTypeAllowed) {
                var filetypeMsg = "Wrong file type.  Must be" + fileTypeList;
                self.errorTemplate("image-right-template",filetypeMsg,false,false);
                setTimeout(function(){
                    $(".image-right-template").fadeOut(); 
                    $(".right-image-container img").remove();
                    $(".right-image-container .user-instructions").show();
                    $(".show-json").hide(); 
                },3000);
                return false;
            }
            else {
                $(".json-response pre").html("");
                $(".copy-json-button").hide();
                if ($(window).width() <= 479) {
                    $(".right-image-container").show();
                }
                utils.createDisplayCanvas(self.canvasWidth, self.canvasHeight);
                self.errorTemplate("image-left-template","","",false);
                self.errorTemplate("image-right-template","Analyzing image...",false,true);
                var reader  = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = function () {
                    var imageData = String(reader.result);
                    // get dimensions of original image
                    var img = new Image();
                    img.src = imageData;
                    
                    img.onload = function(){
                        self.recognizeImgWidth = img.width;
                        self.recognizeImgHeight = img.height;
                        var cssObj = utils.computeCss(self.recognizeImgWidth, self.recognizeImgHeight, self.canvasWidth);
                        var image = $('<img />', {
                            src: imageData,
                            css: cssObj
                        });
                        var processRecognizeImage = function() {
                            $(".recognize-image-container")
                                .empty()
                                .show();
                            setTimeout(function(){
                               self.setElementDimensions(); 
                            },100);
                            image.appendTo(".recognize-image-container");
                            var data = {};
                            // options
                            var minHeadScale = self.minHeadScale;
                            if ($("#optionMinHeadScale").val()) {
                                minHeadScale = $("#optionMinHeadScale").val();
                            }
                            var threshold = self.threshold;
                            if ($("#optionThreshold").val()) {
                                threshold = $("#optionThreshold").val();
                            }
                            var max_num_results = $(".enrolled-image").length;
                            if ($("#optionMaxNumResults").val()) {
                                max_num_results = $("#optionMaxNumResults").val();
                            }
                            imgObj = { 
                                "image"   : utils.parseImageData(imageData),
                                "gallery_name" : self.galleryId,
                                "max_num_results": max_num_results,
                                "threshold": threshold,
                                "minHeadScale": minHeadScale
                            };
                            imgObjDisplay = { 
                                "gallery_name" : self.galleryId,
                                "max_num_results": max_num_results,
                                "threshold": threshold,
                                "minHeadScale": minHeadScale
                            };
                            $(".payload-display span").html(JSON.stringify(imgObjDisplay));
                            data.imgObj = JSON.stringify(imgObj);
                            data.process = "recognize";
                            $.ajax({
                                type: 'POST',
                                url: '/recognize/send-to-api',
                                data: data,
                                dataType: 'text'
                            }).done(function(response){
                                self.displayResponse(response,"recognize");
                            });
                        }
                        // rotate image if needed
                        utils.rotateImage($(image)[0], processRecognizeImage, self);  
                    };
                };
            }
        }
    },
    displayResponse: function(response, process, subjectId) {
        if (process == "enroll") {
            var self = this;
            var response = JSON.parse(response);
            if (response.Errors) {
                self.errorTemplate("image-left-template","Error: " + utils.toTitleCase(response.Errors[0].Message));
                $(".image-right-template").fadeOut(); 
                setTimeout(function(){
                    $(".image-left-template").fadeOut(); 
                    $(".show-json").hide(); 
                    $(".enrolled-image[subjectId='" + subjectId + "']").remove();
                    if ($(".enrolled-image").length == 0 ) {
                        $(".left-image-container .user-instructions").show();
                        $(".enrolled-images").removeClass("enrolled");
                    }
                },3000);

            }
            else {
                $(".show-json").show();
                utils.showJsonResponse(response)
                $(".image-left-template").fadeOut();
                $(".recognize-image-container").empty();
                var canvas = $("#displayCanvas")[0];
                var context = canvas.getContext('2d');
                context.clearRect(0, 0, self.canvasWidth, self.canvasWidth);
                $(".right-image-container .user-instructions").show();
                if ($(window).width() <= 479) {
                    $(".step-two-prompt").show();
                }
                $(".ui-buttons .upload").show();
            }
        }
        else {
            var self = this;
            var response = JSON.parse(response);
            $(".enrolled-image .image-mask, .enrolled-image .image-mask-unrecognized, .enrolled-image .image-info").hide();
            $(".left-image-container .user-instructions").hide();
            if (response.Errors) {
                self.errorTemplate("image-right-template","Error: " + utils.toTitleCase(response.Errors[0].Message));
                setTimeout(function(){
                    $(".show-json").hide(); 

                },3000);
            }
            else {
                if ($(window).width() <= 479) {
                    $(".ui-buttons").hide();
                    $(".json-response-container").css({top:430});
                    $(".main-container").addClass("recognized");
                     $(".example-instructions").show();
                }
                var enrolledImages = [];
                // get all enrolled images, set confidence to 0
                $(".enrolled-image").each(function(){
                    enrolledImages[$(this).attr("subjectid")] = 0;
                });
                self.drawMethod(response.images);
                $(".show-json").show();
                // loop through all candidates, set enrolled images
                // to highest confidence level 
                $.each(response.images,function(idx, value){
                    if (value.transaction) {
                        if (value.transaction.status != "failure") {
                            $.each(value.candidates,function(idx, value){
                                var subjectId = value.subject_id;
                                if (enrolledImages[subjectId] < value.confidence) {
                                    enrolledImages[subjectId] = value.confidence
                                }
                            });
                        }
                        else {
                            self.errorTemplate("image-right-template","Error: " + utils.toTitleCase(value.transaction.status));
                        }
                    }
                });
                recognized = false;
                // loop through enrolled images, display confidence level
                $(".enrolled-image").each(function(){
                    var confidence = enrolledImages[$(this).attr("subjectid")];
                    $(this).find(".image-info")
                        .html("Confidence: <br />" + (100 * confidence).toFixed(3) + "%")
                        .show();
                    // set lighter mask to high confidence level,
                    // darker mask to low confidence level
                    if (confidence >= self.recognizeThreshold) {
                        recognized = true;
                        $(this).find(".image-mask").show();
                    }
                    else {
                        $(this).find(".image-mask-unrecognized").show();
                    }
                });
                // if any enrolled images are recognized, display message
                if (recognized) {
                    self.errorTemplate("image-right-template","RECOGNIZED");
                }
                else {
                    self.errorTemplate("image-right-template","NOT RECOGNIZED");
                }
                utils.showJsonResponse(response)
            }
        }
    },
    //------------------------------------
    // DRAW FEATURE POINTS ON CANVAS
    //------------------------------------
    drawMethod: function(images) {
        var self = this;
        var canvas = $("#displayCanvas")[0];
        var context = canvas.getContext('2d');
        adjX   = 1;
        adjY   = 1;
        subX   = 0;
        subY   = 0;
        // get actual image dimensions from Kairos API response      
        var imgWidth = self.recognizeImgWidth;
        var imgHeight = self.recognizeImgHeight;
        // get dimensions of the image as it is displayed in .display-image-container
        var displayImageDimensions = utils.getDisplayImageDimensions(imgWidth, imgHeight, self.canvasWidth);
        // get dimensions and ratio of image relative to display size
        var newImageInfo = utils.calculateAspectRatioFit(imgWidth,imgHeight,displayImageDimensions.width,displayImageDimensions.height);
        // adjust aspect ratio of feature points relative to resized image
        adjX   = newImageInfo.ratio;
        adjY   = newImageInfo.ratio;

        // reposition face relative to full image size
        switch(self.imageOrientation) {
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
        
        context.clearRect(0, 0, self.recognizeImgWidth, self.recognizeImgHeight);
        
        var imageObj = new Image();
        imageObj.onload = function() {
            context.drawImage(imageObj, 0, 0);    
            for (var i = 0; i < images.length; i++) { 
                var face = images[i].transaction;
                if (face.confidence >= self.recognizeThreshold) {
                    var strokeStyle = '#139C8A';
                    var radius = utils.adjustRadius(face.width * self.adjX, self.radiusDefault);
                    if (face.topLeftX != -1 && face.topLeftY != -1) {
                        utils.roundRect(context, face.topLeftX * adjX + subX, face.topLeftY * adjY + subY, face.width * adjX , face.height * adjY, radius);
                        context.lineWidth = 2;
                        context.strokeStyle = strokeStyle;
                        context.stroke();
                    }
                }
            }
        };
        imageObj.src = transparentImageData;
    },
    //------------------------------------
    // DISPLAY ERROR TEMPLATES
    //------------------------------------ 
    errorTemplate: function(template, message, spinner, sadface) {
        var templateObj = $("." + template);
        templateObj.empty();
        var msg = ""
        if (spinner) {
            msg += "<div class='processing-spinner'></div>";
        }
        if (sadface) {
            msg += "<div class='sad-face'></div>";
        }
        msg += "<div class='header-bkg-right'></div>";
        msg += "<div class='message-container'>";
        msg += "<div class='message'>";
        msg += message;
        msg += "</div></div>";
        templateObj.append(msg);
    },
    setElementDimensions: function () {
        var self = this;
        if ($(window).width() <= 479) {
            this.enrollmentLimit = 4;
            var canvasWidth = $(window).width();
            this.canvasWidth =  canvasWidth;
            this.canvasHeight = canvasWidth; 
            var thumbnail = this.canvasWidth / 2 - 20;
            this.thumbnailSize = thumbnail;
            $(".json-response-container, .json-response").width(canvasWidth - 30);
            $(".json-response-container").css({top: canvasWidth + 60});
            $(".enrolled-image").height(thumbnail);
            $(".recognize-image-container").width(canvasWidth);
            $(".right-image-container").height(canvasWidth - 2);
            $(".left-image-container, .json-response-container, .recognize-image-container").height(thumbnail * 2 + 50);
            $(".json-response pre").height(thumbnail * 2 - 40);
            $(".left-image-container .user-instructions").html("<h3>STEP 1:</h3>Upload images to enroll them into a gallery.<br />You can enroll up to 4 images.");
            $(".right-image-container .user-instructions").html("<h3>STEP 2:</h3>Upload an image to match it against<br />images that you have enrolled.");
            if ($(".main-container").hasClass("enrolled")) {
                $(".step-two-prompt").show();
                $(".ui-buttons .upload:nth-child(3)").show();
            }
            else {
                $(".step-two-prompt").hide();
                $(".ui-buttons .upload:nth-child(3)").hide();
            }
            if ($(".main-container").hasClass("recognized")) {
                $(".right-image-container").show();
            }
        }
        else if ($(window).width() <= 600) {
            this.enrollmentLimit = 4;
            var canvasWidth = $(window).width() / 2 - 15;  // allow for side margins
            this.canvasWidth =  canvasWidth;
            this.canvasHeight = canvasWidth;
            var thumbnail = canvasWidth / 2;
            this.thumbnailSize = thumbnail;
            $(".json-response-container, .json-response").width($(window).width() - 30);
            $(".enrolled-image").height(thumbnail - 12);
            $(".left-image-container, .json-response-container, .recognize-image-container").height(canvasWidth);
            $(".json-response pre").height(thumbnail * 2 - 40);
            $(".recognize-image-container").width(canvasWidth);
            $(".right-image-container").height(canvasWidth - 2);
            $(".right-image-container").show();
            $(".left-image-container .user-instructions").html("<h3>STEP 1:</h3>Upload images to enroll them into a gallery.<br />You can enroll up to 4 images.");
            $(".right-image-container .user-instructions").html("<h3>STEP 2:</h3>Upload an image to match it against<br />images that you have enrolled.");
            $(".json-response-container").css({top:0})
            $(".step-two-prompt").hide();
        }
        else if ($(window).width() < 768) {
            this.enrollmentLimit = 4;
            var canvasWidth = $(window).width() / 2 - 15;  // allow for side margins
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasWidth; 
            var thumbnail = canvasWidth / 2;
            this.thumbnailSize = thumbnail;
            $(".json-response-container, .json-response").width($(window).width() - 30);
            $(".json-response pre").height(canvasWidth);
            $(".enrolled-image").height(thumbnail - 12);
            $(".recognize-image-container").width(canvasWidth);
            $(".right-image-container").height(canvasWidth - 2);
            $(".right-image-container").show();
            $(".left-image-container, .json-response-container, .recognize-image-container").height(canvasWidth);
            $(".left-image-container .user-instructions").html("<h3>STEP 1:</h3>Upload images to enroll them into a gallery.<br />You can enroll up to 4 images.");
            $(".right-image-container .user-instructions").html("<h3>STEP 2:</h3>Upload an image to match it against<br />images that you have enrolled.");
            $(".step-two-prompt").hide();
        }
        else if ($(window).width() < 992) {
            this.enrollmentLimit = 4;
            var canvasWidth = 360;
            this.canvasWidth = canvasWidth; 
            this.canvasHeight = canvasWidth; 
            var thumbnail = 138;
            this.thumbnailSize = thumbnail;
            $(".json-response-container, .json-response").width(canvasWidth - 15)
            $(".json-response pre").height(canvasWidth);
            $(".enrolled-image").height(thumbnail);
            $(".right-image-container").show();
            $(".left-image-container, .json-response-container, .recognize-image-container").height(canvasWidth);
            $(".right-image-container").height(canvasWidth - 2);
            $(".recognize-image-container").width(canvasWidth);
            $(".left-image-container .user-instructions").html("<h3>STEP 1:</h3>Upload images to enroll them into a gallery.<br />You can enroll up to 4 images.");
            $(".right-image-container .user-instructions").html("<h3>STEP 2:</h3>Upload an image to match it against<br />images that you have enrolled.");
            $(".step-two-prompt").hide();
        }
        else {
            this.enrollmentLimit = 9;
            var canvasWidth = 475;
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasWidth;
            var thumbnail = 134;
            this.thumbnailSize = thumbnail;
            var containerHeight = thumbnail * 3 + 58;
            $(".json-response-container, .json-response").width(canvasWidth - 15)
            $(".json-response pre").height(canvasWidth);
            $(".enrolled-image").height(this.thumbnailSize);
            $(".right-image-container").show();
            $(".left-image-container, .json-response-container, .recognize-image-container").height(canvasWidth);
            $(".right-image-container").height(canvasWidth - 2);
            $(".recognize-image-container").width(canvasWidth);
            $(".left-image-container .user-instructions").html("<h3>STEP 1:</h3>Drop images here to enroll them into a gallery.<br />You can enroll up to 9 images.");
            $(".right-image-container .user-instructions").html("<h3>STEP 2:</h3>Drop an image here to match it against<br />images that you have enrolled.");
            $(".step-two-prompt").hide();
        }
        $(".enrolled-image img").each(function(idx,image){
            var thumbnailCssObj = utils.computeCss(image.naturalWidth, image.naturalHeight, thumbnail);
            $(image).css(thumbnailCssObj); 
        });
        $(".recognize-image-container img").each(function(idx,image){
            var recognizeCssObj = utils.computeCss(image.naturalWidth, image.naturalHeight, self.canvasWidth);
            $(image).css(recognizeCssObj); 
        });
    } 
};







