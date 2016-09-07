//------------------------------------
// detectDemoApp.js
// javascript object responsible for primary app functionality
// dependencies: jquery.js, jquery-ui, detect.php
// created: May 2016
// modified: August 2016
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
            this.examplesModule("");
            this.uploadModule();
            this.dragdropModule();
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
        
    },
    //------------------------------------
    // EXAMPLES PROCESSING
    //------------------------------------
    examplesModule: function (imageElement) {
        var self = this; 
        self.processing = true; 
        self.createDisplayCanvas(self.canvasWidth, self.canvasHeight);
        self.getTemplate("json-response-template","","Generating results...",true);
        var canvas = document.createElement('CANVAS');
        var context = canvas.getContext('2d');
        canvas.width = self.canvasWidth;
        canvas.height = self.canvasHeight;
        var processImage = function () {
            var imageData;
            context.drawImage(imageElement, 0, 0, self.canvasWidth, self.canvasHeight);
            imageData = canvas.toDataURL();
            self.globalImageData = self.parseImageData(imageData);
            var data = {};
            imgObj = { 
                "image"   : self.globalImageData,
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
                    self.localStream = stream.getTracks()[0];
                },
                function(err) {
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
            self.globalImageData = self.parseImageData(imageData);
            // send data to Kairos API
            var data = {};
            imgObj = { 
                "image"   : self.globalImageData,
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
            self.createDisplayCanvas(self.canvasWidth, self.canvasHeight);
            var input = $("#upload")[0];
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                self.getTemplate("image-container-template","","",false,true);
                self.getTemplate("json-response-template","Error","The File APIs are not fully supported in this browser.",false,false);
                self.processing = false; 
                return false;
            }  
            var fileData = $('#upload')[0].files[0]; 
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
            }).done(function(data) {
                var response = JSON.parse(data);
                var mimeType = response.split(";")[0];
                var fileTypeAllowed = false;
                var fileTypeList = [];
                $(self.config.uploadFileTypesImage).each(function(idx, fileType) {
                    fileTypeList.push(" ." + fileType.toString().split("/")[1])
                    if(fileType == mimeType) { 
                        fileTypeAllowed = true;
                    }
                }); 
                var fsize = input.files[0].size; // get file type
                var fileSizeAllowed = false;
                if(fsize <= self.config.uploadFileSizeImage) { 
                    fileSizeAllowed = true;
                }
                if (!fileTypeAllowed) {
                    self.getTemplate("image-container-template","","",false,true);
                    var filetypeMsg = "Wrong file type.  Must be" + fileTypeList;
                    self.getTemplate("json-response-template","Error",filetypeMsg,false,false);
                    self.processing = false;
                    return false;
                }
                else if (!fileSizeAllowed) {
                    self.getTemplate("image-container-template","","",false,true);
                    var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeImage/1000000 + "MB";
                    self.getTemplate("json-response-template","Error",filesizeMsg,false,false);
                    self.processing = false;
                    return false;
                }
                else if (!input) {
                    self.getTemplate("image-container-template","","",false,true);
                    self.getTemplate("json-response-template","Error","Couldn't find the file input element.",false,false);
                    self.processing = false;
                    return false;
                }
                else if (!input.files) {
                    self.getTemplate("image-container-template","","",false,true);
                    self.getTemplate("json-response-template","Error","This browser doesn't seem to support the `files` property of file inputs.",false,false);
                    self.processing = false;
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
                            if (!imageLoaded) {
                                imageLoaded = true;
                                var maxWidth = self.canvasWidth;
                                if(img.width > maxWidth) {
                                    var ratio = maxWidth / img.width;
                                    imageData = self.imageToDataUri(img, img.width * ratio, img.height * ratio);
                                    img.src = imageData;
                                }
                                context.drawImage(this, 0, 0, self.canvasWidth, self.canvasHeight);
                                self.globalImageData = self.parseImageData(imageData);
                                $("#upload").val("");
                                var data = {};
                                imgObj = { 
                                    "image"   : self.globalImageData,
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
            });
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
            var urlImageSrc = self.validateUrl($(".url-from-web").val());
            if (urlImageSrc === false) {
                $(".url-error").html("Please enter a valid URL");
            }
            else {
                $(".url-error").html("");
                self.resetElements();
                self.createDisplayCanvas(self.canvasWidth, self.canvasHeight);
                self.getTemplate("image-container-template","","Analyzing image...",true,false);
                self.getTemplate("json-response-template","","Generating results...",true,false);
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
                        processUrlImage(response);
                    }              
                    else {
                        self.getTemplate("image-container-template","","",false,true);
                        self.getTemplate("json-response-template","","Invalid response.  Please try another URL.",false,false);
                        self.processing = false;
                    }
                });
            }
            var processUrlImage = function (response) {
                var mimeType = response.fileType;
                var fileSize = response.fileSize;
                var fileTypeAllowed = false;
                var fileTypeList = [];
                $(self.config.uploadFileTypesImage).each(function(idx, fileType) {
                    fileTypeList.push(" ." + fileType.toString().split("/")[1]);
                    if(fileType == mimeType) { 
                        fileTypeAllowed = true;
                    }
                }); 
                var fileSizeAllowed = false;
                if(fileSize <= self.config.uploadFileSizeImage) { 
                    fileSizeAllowed = true;
                }
                if (!fileTypeAllowed) {
                    self.resetElements();
                    self.getTemplate("image-container-template","","",false,true);
                    var filetypeMsg = "Wrong file type.  Must be" + fileTypeList;
                    self.getTemplate("json-response-template","Error",filetypeMsg,false,false);
                    self.processing = false;
                    return false;
                }
                else if (!fileSizeAllowed) {
                    self.resetElements();
                    self.getTemplate("image-container-template","","",false,true);
                    var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeImage/1000000 + "MB";
                    self.getTemplate("json-response-template","Error",filesizeMsg,false,false);
                    self.processing = false;
                    return false;
                }
                else {
                    var canvas = document.createElement('CANVAS');
                    var context = canvas.getContext('2d');
                    canvas.width = self.canvasWidth;
                    canvas.height = self.canvasHeight;
                    var img = new Image();
                    var imageData;
                    imageData = "data:" + mimeType + ";base64," + response.fileData;
                    img.src = imageData;
                    var imageLoaded = false;
                    img.onload = function(){
                        if (!imageLoaded) {
                            imageLoaded = true;
                            var maxWidth = self.canvasWidth;
                            if(img.width > maxWidth) {
                                var ratio = maxWidth / img.width;
                                imageData = self.imageToDataUri(img, img.width * ratio, img.height * ratio);
                                img.src = imageData;
                            }
                            context.drawImage(this, 0, 0, self.canvasWidth, self.canvasHeight);
                            self.globalImageData = self.parseImageData(imageData);
                            $("#upload").val("");
                            var data = {};
                            imgObj = { 
                                "image"   : self.globalImageData,
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
            var fileTypeList = [];
            $(self.config.uploadFileTypesImage).each(function(idx, fileType) {
                fileTypeList.push(" ." + fileType.toString().split("/")[1])
                if(fileType == ftype) { 
                    fileTypeAllowed = true;
                }
            }); 
            if (!fileTypeAllowed) {
                self.resetElements();
                self.getTemplate("image-container-template","","",false,true);
                var filetypeMsg = "Wrong file type.  Must be" + fileTypeList;
                self.getTemplate("json-response-template","Error",filetypeMsg,false,false);
                return false;
            }
            else {
                self.createDisplayCanvas(self.canvasWidth, self.canvasHeight);
                $(".json-response pre").html("");
                $(".copy-json-button").hide();
                self.getTemplate("image-container-template","","Analyzing image...",true);
                self.getTemplate("json-response-template","","Generating results...",true);
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
                                imageData = self.imageToDataUri(img, img.width * ratio, img.height * ratio);
                                img.src = imageData;
                            }
                            context.drawImage(this, 0, 0, self.canvasWidth, self.canvasHeight);
                            self.globalImageData = self.parseImageData(imageData);
                            var data = {};
                            imgObj = { 
                                "image"   : self.globalImageData,
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
    apiCallback: function(data) {
        var self = this;
        $("#previewImage").hide();
        $(".copy-json-button").show();
        $(".json-title").show();
        $(".spinner-message-container").hide();
        $(".ui-buttons-mask").hide();
        self.processing = false;
        
        var response = JSON.parse(data);

        if(!response.images || !response.images[0].faces[0]) {
            self.showJsonResponse({});
        }
        else {
            self.showJsonResponse(response);
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
        var self = this;
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
        imageObj.src = 'data:image/jpeg;base64,' + self.globalImageData;

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







