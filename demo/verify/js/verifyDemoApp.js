//------------------------------------
// verifyDemoApp.js
// javascript object responsible for primary  verify demo functionality
// dependencies: jquery.js, jquery-ui, verify.php
// created: June 2016
// last modified: August 2016
// author: Steve Rucker
//------------------------------------

var verifyDemoApp = verifyDemoApp || {};
verifyDemoApp =  {
    //------------------------------------
    // INITIALIZE - index.php
    //------------------------------------
    init: function (config) {
        this.canvasWidth = 475;
        this.canvasHeight = 475;
        this.config = config;
        this.apiCredentials = config.apiCredentials;
        this.processingLeft = false;
        this.processingRight = false;
        this.simultaneousData = "";
        this.showMasks();
        if (this.apiCredentials){
            this.examplesModule();
            this.uploadModule();
            this.urlModule();
        }
        else {
            this.getTemplate("image-right-template","ERROR: API credentials not provided.",false,false);
        }
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
            self.getTemplate("image-" + position + "-template","Analyzing image...",false,true);
            var subjectId = $("#image-" + position).attr("subjectId");
            var imageData = imageDataObj[subjectId];
            var imageAnalysis = imageAnalysisDataObj[subjectId];
            var jsonResponse = "";
            var waitForAnalysis = setTimeout(function(){
                if (position == "left"){
                    self.getTemplate("image-left-template","",false,false);
                    // draw box
                    self.createDisplayCanvas("left", self.canvasWidth, self.canvasHeight);
                    $(".canvas-container-left").show();
                    self.drawMethod(imageAnalysis.images[0], imageData, "left", false, true);
                    $(".upload-mask-left, .url-mask-left").hide();
                    self.processingLeft = false;
                }
                else {
                    jsonResponse = jsonDataObj[$("#image-left").attr("subjectId")];
                    self.getTemplate("image-right-template","Verifying image...",false,true);
                    exampleVerify("right", imageData, imageAnalysis, jsonResponse);
                }
                
            },getRandomInt(500, 1000));
        });
        var exampleVerify = function (position, imageData, imageAnalysis, jsonResponse) {
            var waitForVerification = setTimeout(function(){
                // draw box
                self.createDisplayCanvas(position, self.canvasWidth, self.canvasHeight);
                $(".canvas-container-" + position).show();
                self.drawMethod(imageAnalysis.images[0], imageData, position, false, true);
                // show json
                self.getTemplate("image-" + position + "-template","",false,false);
                $(".show-json").show();
                if (jsonResponse) {
                    self.getTemplate("image-" + position + "-template","",true,false);
                    var status = jsonResponse.images[0].transaction.status;
                    var confidence = jsonResponse.images[0].transaction.confidence;
                    if (status == "success") {
                        if (confidence >= .5) {
                           $(".verify-response").html("MATCH"); 
                        }
                        else {
                            $(".verify-response").html("NO MATCH");
                        }
                    }
                    else {
                        $(".verify-response").html("ERROR");
                    }
                    var str = JSON.stringify(jsonResponse, undefined, 4);
                    $(".json-response").html("<pre>" + self.syntaxHighlight(str) + "</pre>");
                    $(".upload-mask-right, .url-mask-right").hide();
                    self.processingRight = false;
                }
            },getRandomInt(500, 1000));
        };
    },
    verifyImage: function (position, imageData) {
        var self = this;
        self.getTemplate("image-" + position + "-template","Verifying image...","",true,true);
        $(".image-" + position + "-template").show();
        self.createDisplayCanvas(position, self.canvasWidth, self.canvasHeight);
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
        var data = {};
        imgObj = { 
            "image"         : self.parseImageData(imageData),
            "gallery_name"  : thisGalleryId,
            "subject_id"    : thisSubjectId
        };
        data.imgObj = JSON.stringify(imgObj);
        data.process = "verify";
        $.ajax({
            type: 'POST',
            url: 'verify.php',
            data: data,
            dataType: 'text'
        }).done(function(imageAnalysis){
            self.displayResponse(imageAnalysis, imageData, position, false, false);
        });
    },
    enrollImage: function (position, imageData, sendToDisplay) {
        var self = this;
        var data = {};
        var thisId = Date.now();
        var galleryId = "gallery-" + thisId;
        var subjectId = "subject-" + thisId;
        $("#image-" + position).attr("galleryId", galleryId);
        $("#image-" + position).attr("subjectId", subjectId);
        imgObj = { 
            "image"   : self.parseImageData(imageData),
            "gallery_name" : galleryId,
            "subject_id" : subjectId
        };
        
        data.imgObj = JSON.stringify(imgObj);
        data.process = "enroll";
        $.ajax({
            type: 'POST',
            url: 'verify.php',
            data: data,
            dataType: 'text'
        }).done(function(imageAnalysis){
            console.log("enrollImage")
            if (sendToDisplay) {
                self.createDisplayCanvas(position, self.canvasWidth, self.canvasHeight);
                self.displayResponse(imageAnalysis, imageData, position, true, true);
            }
            else {
                console.log(JSON.parse(imageAnalysis))
                self.drawMethod(JSON.parse(imageAnalysis).images[0], imageData, position, false, true);
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
            self.getTemplate("image-" + position + "-template","Analyzing image...",false,true);
            if (position == "left") {
                self.getTemplate("image-right-template","",false,false);
            }
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                self.getTemplate("image-" + position + "-template","The File APIs are not fully supported in this browser.",false,false);
                self.hideMasks();
                return false;
            }  
            var fileData = input.files[0]; 
            var formData = new FormData();                  
            formData.append('file', fileData);
            formData.append('fname', 'upload');
            $.ajax({
                url: '../get-file-data.php', 
                dataType: 'text', 
                cache: false,
                contentType: false,
                processData: false,
                data: formData,                         
                type: 'post',
            }).done(function(response) {
                var response = JSON.parse(response);
                var mimeType = response;

                var fileTypeAllowed = false;
                var fileTypeList = [];
                $(self.config.uploadFileTypesImage).each(function(idx, fileType) {
                    fileTypeList.push(" ." + fileType.toString().split("/")[1])
                    if(fileType == mimeType) { 
                        fileTypeAllowed = true;
                    }
                }); 
                var fsize = input.files[0].size;
                var fileSizeAllowed = false;
                if(fsize <= self.config.uploadFileSizeImage) { 
                    fileSizeAllowed = true;
                } 
                if (!fileTypeAllowed) {
                    var filetypeMsg = "Wrong file type.  Must be" + fileTypeList;
                    self.getTemplate("image-" + position + "-template",filetypeMsg,false,false);
                    self.hideMasks();
                    return false;
                }
                else if (!fileSizeAllowed) {
                    var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeImage/1000000 + "MB";
                    self.getTemplate("image-" + position + "-template",filesizeMsg,false,false);
                    self.hideMasks();
                    return false;
                }
                else if (!input) {
                    self.getTemplate("image-" + position + "-template","Couldn't find the file input element.",false,false);
                    self.hideMasks();
                    return false;
                }
                else if (!input.files) {
                    self.getTemplate("image-" + position + "-template","This browser doesn't seem to support the `files` property of file inputs.",false,false);
                    self.hideMasks();
                    return false;
                }
                else {
                    var file = input.files[0];
                    var reader  = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onloadend = function () {
                        var imageData = String(reader.result);
                        $(".canvas-container-" + position).empty();
                        // show image
                        $(".canvas-container-" + position).hide();
                        $("#image-" + position).attr("src", imageData);
                        var img = new Image();
                        img.src = imageData;
                        var imageLoaded = false;
                        img.onload = function(){
                            if (!imageLoaded) {
                                imageLoaded = true;
                                var resizedImageData = self.imageToData(img, img.width, img.height, position);
                                self.verifyImage(position, resizedImageData);
                                self.enrollImage(position, resizedImageData);

                            }
                        };  
                    };
                } 
            });
                
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
            var urlImageSrc = self.validateUrl($("#url-" + position).val());
            if (urlImageSrc === false) {
                $(".error-" + position).html("Please enter a valid URL");
                self.hideMasks();
                return false;
            }
            // check to see if both URL fields have been submitted simultaneously
            var simultaneous = false;
            if (self.validateUrl($("#url-left").val()).length && 
                self.validateUrl($("#url-right").val()).length &&
                self.keydown) {
                simultaneous = true;
            }
            self.getImageData(urlImageSrc, position, simultaneous);
        });
    },
    getImageData: function (urlImageSrc, position, simultaneous) {
        var self = this;
        self.showMasks();
        $(".url-error").html("");
        $(".show-json").hide();
        self.getTemplate("image-" + position + "-template","Analyzing image...",false,true);
        // POST to php file to get image data
        var data = {};
        data.fname = "url";
        data.url = urlImageSrc;
        $.ajax({
            type: "POST",
            url: "../get-file-data.php",
            data: data,
            dataType: "text"
        }).done(function(data) {
            var response = JSON.parse(data);
            if(self.validateJson(data) && response.fileType !== false && response.fileType !== null) {
                self.processUrlImage(response, position, simultaneous);
            }              
            else {
                self.hideMasks();
                self.getTemplate("image-" + position + "-template","Invalid response.  Please try another URL.",false,false);
            }
        });
    },
    processUrlImage: function (response, position, simultaneous) {
        var self = this;
        var mimeType = response.fileType;
        var fileSize = response.fileSize;
        var fileTypeAllowed = false;
        var fileTypeList = [];
        $(self.config.uploadFileTypesImage).each(function(idx, fileType) {
            fileTypeList.push(" ." + fileType.toString().split("/")[1])
            if(fileType == mimeType) { 
                fileTypeAllowed = true;
            }
        }); 
        var fileSizeAllowed = false;
        if(fileSize <= self.config.uploadFileSizeImage) { 
            fileSizeAllowed = true;
        } 
        if (!fileTypeAllowed) {
            var filetypeMsg = "Wrong file type.  Must be" + fileTypeList;
            verifyDemoApp.getTemplate("image-" + position + "-template",filetypeMsg,true,false);
            self.hideMasks();
            return false;
        }
        else if (!fileSizeAllowed) {
            var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeImage/1000000 + "MB";
            verifyDemoApp.getTemplate("image-" + position + "-template",filesizeMsg,true,false);
            self.hideMasks();
            return false;
        }
        else {
            if (position == "left") {
                self.getTemplate("image-right-template","",false,false);
            }
            $(".canvas-container-" + position).empty();
            // show image
            $(".canvas-container-" + position).hide();
            $("#image-" + position).attr("src", "data:" + mimeType + ";base64," + response.fileData);
            var img = new Image();
            img.src = "data:" + mimeType + ";base64," + response.fileData;
            var imageLoaded = false;
            img.onload = function(){
                if (!imageLoaded) {
                    imageLoaded = true;
                    var resizedImageData = self.imageToData(img, img.width, img.height, position);
                    if (position == "right" && simultaneous) {
                        // store data for enroll/verify later
                        self.simultaneousData = resizedImageData;
                    }
                    else if (position == "left" && simultaneous) {
                        self.enrollImage("left", resizedImageData, true);
                    }
                    else {
                        self.verifyImage(position, resizedImageData);
                        self.enrollImage(position, resizedImageData); 
                    }
                }
            }; 
        }
    },
    //------------------------------------
    // SHOW VERIFICATION RESPONSE
    //------------------------------------
    displayResponse: function(imageAnalysis, imageData, position, simultaneous, enrolled) {
        var self = this;
        var kairosJSON = JSON.parse(imageAnalysis);
        if (kairosJSON.Errors) {
            var errorMsg = kairosJSON.Errors[0].Message.charAt(0).toUpperCase() + kairosJSON.Errors[0].Message.slice(1);
            self.getTemplate("image-" + position + "-template",errorMsg,true,false); 
            $(".verify-response").html("ERROR");
            self.hideMasks();
        }
        else if (!kairosJSON.images) {
            self.getTemplate("image-" + position + "-template","No faces found.",false,false);
            $(".verify-response").html("ERROR");
            self.hideMasks();
        }
        else {
            if (kairosJSON.images.length > 1) {
                self.getTemplate("image-" + position + "-template","More than one face in the image.",false,false);
                self.hideMasks();
            }
            else {
                self.getTemplate("image-left-template","",false,false);
                if (simultaneous) {
                    $(".canvas-container-" + position).show();
                    self.drawMethod(kairosJSON.images[0], imageData, position, simultaneous, enrolled);
                    self.getTemplate("image-left-template","",false,false);
                    self.verifyImage("right", self.simultaneousData);
                    self.enrollImage("right", self.simultaneousData);
                    self.simultaneousData = ""; 
                    self.keydown = false;                   
                }
                else {
                    self.getTemplate("image-right-template","",true,false);
                    $(".show-json").show();
                    $(".canvas-container-" + position).show();
                    self.drawMethod(kairosJSON.images[0], imageData, position, simultaneous, enrolled);
                    var status = kairosJSON.images[0].transaction.status;
                    var confidence = kairosJSON.images[0].transaction.confidence;
                    if (status == "success") {
                        if (confidence >= .5) {
                           $(".verify-response").html("MATCH"); 
                        }
                        else {
                            $(".verify-response").html("NO MATCH");
                        }
                    }
                    else {
                        $(".verify-response").html("ERROR");
                    }
                    var str = JSON.stringify(kairosJSON, undefined, 4);
                    $(".json-response").html("<pre>" + self.syntaxHighlight(str) + "</pre>");
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
    // DRAW IMAGE TO CANVAS, KEEPING ASPECT RATIO
    //------------------------------------
    imageToData: function(img, imgWidth, imgHeight, position) {
        var self = this;
        // create an off-screen canvas
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var width = self.canvasWidth;
        var height = self.canvasHeight;

        // set its dimension to target size

        canvas.width = width;
        canvas.height = height;

        var resizeImage = function(srcWidth, srcHeight, width, height) {
            var ratio = srcHeight/srcWidth;
            return { width : width, height : width * ratio };
        }
        var newImageSize = resizeImage(imgWidth, imgHeight, width, height);
        // draw source image into the off-screen canvas:
        ctx.drawImage(img, 0, 0, newImageSize.width, newImageSize.height);

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
    // CREATE CANVAS FOR DISPLAYING IMAGE
    //------------------------------------ 
    createDisplayCanvas: function(position, h, w) {
        $(".canvas-container-" + position)
        .empty()
        .append(
            $('<canvas/>')
            .attr("id", "displayCanvas" + position)
            .attr("width", h)
            .attr("height", w)
            );
    },
    //------------------------------------
    // DRAW FEATURE POINTS ON CANVAS
    //------------------------------------
    drawMethod: function(imageAnalysis, imageData, position, simultaneous, enrolled) {
        var self = this;
        if (enrolled) {
            var canvas = $("#displayCanvas" + position)[0];
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
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
                // draw face box
                if (face.topLeftX != -1 && face.topLeftY != -1) {
                    context.beginPath();
                    context.rect(face.topLeftX, face.topLeftY, face.width, face.height);
                    context.lineWidth = 2;
                    context.strokeStyle = strokeStyle;
                    context.stroke();
                }
            };
            imageObj.src = imageData;
        }
    },
    //------------------------------------
    // DISPLAY HANDLEBARS TEMPLATES
    //------------------------------------ 
    getTemplate: function(template,message,response,spinner){
        var thisTemplate = $("#" + template).html();
        var compiledTemplate = Handlebars.compile(thisTemplate);
        var context = {
            "message": message,
            "response": response,
            "spinner": spinner
        };
        var theCompiledHtml = compiledTemplate(context);
        $("." + template).html(theCompiledHtml);
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
    showMasks: function () {
        $(".upload-mask-left, .url-mask-left, .upload-mask-right, .url-mask-right").show();
    },
    hideMasks: function () {
        var self = this;
        self.processingLeft = false;
        self.processingRight = false;
        // $(".url-from-web").val("URL from the web");
        $(".upload-mask-left, .url-mask-left, .upload-mask-right, .url-mask-right").hide();
    }
};







