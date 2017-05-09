//------------------------------------
// emoDemoApp.js
// javascript object responsible for primary app functionality
// dependencies: jquery.js, highchartsApp.js, MediaStreamRecorder.js, adapter.js, jquery.form.js, process.php
// created: March 2016
// last modified: April 2017
// author: Steve Rucker
//------------------------------------

var emoDemoApp = emoDemoApp || {};
emoDemoApp =  {
    //------------------------------------
    // INITIALIZE - index.php
    //------------------------------------
    init: function (config) { 
        this.config = config;
        this.apiCredentials = config.apiCredentials;
        if (this.apiCredentials){
            // if example video id is not provided, 
            // bypass example processing
            if (this.config["demoMedia"]["video_1"] != "") {
                this.examplesModule("video");
            }
            else {
                $(".ui-buttons-mask").hide();
            }
            this.uploadModule();
            this.urlModule();
        }
        else {
            this.getTemplate("highcharts-template","Error","API credentials not provided.",false,false);
        }
        this.captureInterval = 10000;
        $("#optionPollTimeout").val(this.config.pollTimeout);
        // detect getUserMedia compatibility
        // hide webcam link if not supported
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (!navigator.getUserMedia) {
            $(".webcam").hide();
            $(".ui-buttons .upload").addClass("full-width");
        }
        // hide webcam link from Windows platform until supported
        if (navigator.platform.indexOf('Win') > -1) {
            $(".webcam").hide();
            $(".ui-buttons .upload").addClass("full-width");
        }
        this.setElementDimensions();
    },
    //------------------------------------
    // EXAMPLES PROCESSING
    //------------------------------------
    examplesModule: function (mediaType) {
        var self = this; 
        self.mediaType = mediaType;
        self.processing = true; 
        self.initPostProcessingLayout = false;
        $(".canvas-container-image").empty()
        if (mediaType == "video") {
            self.getTemplate("video-container-template","","Loading video...",true,false);
            self.getTemplate("highcharts-template","","Analyzing video...",true,false);
            highchartsApp.parsedData = "";
            self.resetVideoUI();
            var mediaId = $("#video").attr("mediaId");
            $("#video").attr("src",self.config.mediaPath + "videos/" + mediaId + ".mp4");
            var playButton = $("#play-pause"); 
            playButton.removeClass("pause");
            playButton.addClass("play");
        }
        else {
            self.getTemplate("video-container-template","","Loading image...",true,false);
            self.getTemplate("highcharts-template","","Analyzing image...",true,false);
            var mediaId = $(".show-image").attr("mediaId");
            $(".show-image").attr("src",self.config.mediaPath + "fullsize_images/" + mediaId + ".jpg");
        }
        var mediaId = self.config["demoMedia"][mediaId];
        self.pollApi(mediaId, "examples");
    },
    //------------------------------------
    // WEBCAM PROCESSING
    //------------------------------------
    webcamModule: function () {
        var self = this;
        var webcamWidth = 750;
        var webcamHeight = 560;
        self.processing = true; 
        self.initPostProcessingLayout = false;
        (function () {
            function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
                navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
            }
            var mediaConstraints = {
                audio: false,
                video:  true
            };
            var mediaRecorder;
            self.resetElements();
            $(".canvas-container-image").empty();
            self.resetVideoUI();
            $(".video-wrapper").hide();
            $(".show-image").hide();
            $("#highcharts-container-image").hide();
            $(".highcharts-wrapper").show();
                // this.disabled = true;
            captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

            function onMediaSuccess(stream) {
                highchartsApp.parsedData = "";
                var webcamVideo = document.getElementById("webcamVideo");
                var videoWidth = webcamWidth;
                var videoHeight = webcamHeight;
                webcamVideo = mergeProps(webcamVideo, {
                    controls: false,
                    muted: true,
                    width: videoWidth,
                    height: videoHeight,
                    src: URL.createObjectURL(stream)
                });

                webcamVideo.play();
                mediaRecorder = new MediaStreamRecorder(stream);
                mediaRecorder.stream = stream;
                mediaRecorder.mimeType = 'video/webm'; // this line is mandatory
                mediaRecorder.videoWidth = webcamWidth;
                mediaRecorder.videoHeight = webcamHeight;
                var captureInterval = self.captureInterval;
                var countdown = captureInterval/1000;
                if ($(window).width() < 768) {
                    $(".highcharts-container").hide();
                    self.getTemplate("video-container-template","Tip","Keep your face inside the green circle...",false,false);
                }
                else {
                    self.getTemplate("highcharts-template","Tip","Keep your face inside the green circle...",false,false);
                }
                webcamVideo.addEventListener('canplay', function(ev){
                    $(".webcam-counter").html(countdown);
                    mediaRecorder.start(captureInterval);
                    self.getTemplate("video-container-template","","",false, false);
                    $(".face-overlay").show();
                    var counterFunction = setInterval(function () {
                        $(".webcam-counter").html(countdown);
                        if (countdown <= 1) {
                            clearInterval(counterFunction);
                            mediaRecorder.stop();
                            mediaRecorder.stream.getVideoTracks()[0].stop(); // stop webcam
                            setTimeout(function(){
                                self.getTemplate("video-container-template","","Saving video...",true, false);
                                self.getTemplate("highcharts-template","","",false,false);
                                waitForBlob();
                            },1000)
                        }
                        countdown --;
                    },1000);
                    // stop after time interval
                });
            }
            var waitForBlob = function () {
                $(".webcam-video-container").hide();
                var mediaRecorderInterval = 500;
                var pollCount = 0;
                var pollMediaRecorder = setInterval(function () {
                    if (mediaRecorder.blobExists() != undefined) {
                        clearInterval(pollMediaRecorder);
                        var videoFile = mediaRecorder.saveToDir();
                        if (!videoFile.type) {
                            videoFile.type = 'video/webm';
                        }
                        // show video in player after processing
                        self.showUploadedVideo = true;
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            $('#video').attr('src', reader.result);
                            // hack: video must play in order to render length
                            video.play();
                            setTimeout(function(){
                                video.pause();
                                video.currentTime = 0;
                            },self.captureInterval)
                        }
                        reader.readAsDataURL(videoFile);
                        if (videoFile.size > self.config.uploadFileSizeVideo) {
                            self.resetElements();
                            var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeVideo/1000000 + "MB";
                            if ($(window).width() < 768) {
                                $(".highcharts-container").hide();
                                self.getTemplate("video-container-template","Error",filesizeMsg,false,false);
                            }
                            else {
                                self.getTemplate("video-container-template","","",false, true);
                                self.getTemplate("highcharts-template","Error",filesizeMsg,false, false);
                            }
                            self.processing = false;
                        }
                        else {
                           processVideo(videoFile); 
                        }  
                     }
                    pollCount ++;
                    // stop polling after 40x = 20 seconds
                    if (pollCount >= 40) { 
                        clearInterval(pollMediaRecorder);
                        self.postProcessingLayout({},"webcam_error");
                    }
                },mediaRecorderInterval);
            }
            var processVideo = function ( blob ) {
                self.getTemplate("video-container-template","","Uploading video...",true, false);
                if ($(window).width() < 768) {
                    $(".highcharts-container").hide();
                    self.getTemplate("highcharts-template","","Please Wait",false, false);
                }
                var reader = new FileReader();
                reader.onload = function(event){
                    var fd = {};
                    var videoId = Math.round(Math.random() * 9999999999) + 888888888;
                    fd["fname"] = videoId;
                    fd["data"] = event.target.result;
                    $.ajax({
                        type: 'POST',
                        url: 'process.php',
                        data: fd,
                        dataType: 'text',
                        timeout  : self.config.apiTimeout
                    }).done(function(data) {
                        if(utils.validateJson(data)){
                            var response = JSON.parse(data);
                            if (response.Error) {
                                self.resetElements();
                                if ($(window).width() < 768) {
                                    $(".highcharts-container").hide();
                                    self.getTemplate("video-container-template","Error","Invalid file...",false,false);
                                }
                                else {
                                    self.getTemplate("video-container-template","","",false, true);
                                    self.getTemplate("highcharts-template","Error","Invalid file...",false, false);
                                }
                                
                                self.processing = false;
                            }
                            else {
                                var mediaId = response.id;
                                self.pollApi(mediaId, "webcam", "video"); 
                            }
                                
                        }
                        else {
                            self.resetElements();
                            if ($(window).width() < 768) {
                                $(".highcharts-container").hide();
                                self.getTemplate("video-container-template","Error","Invalid JSON response...",false, false);
                            }
                            else {
                                self.getTemplate("video-container-template","","",false, true);
                                self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
                            }
                            self.processing = false;
                        }
                    }).fail(function (jqXHR, textStatus) {
                        var data = {"status_message":"api_error","status_message_text":textStatus};
                        self.postProcessingLayout(JSON.stringify(data), videoId, "webcam");
                    });
                };
                reader.readAsDataURL(blob);
            }
            var onMediaError = function (e) {
                console.error('media error', e);
            }
        })();
    },
    //------------------------------------
    // FILE UPLOAD PROCESSING
    //------------------------------------
    uploadModule: function () { 
        var self = this;  
        $('#mediaUploadForm').submit(function(e) {
            e.preventDefault();
            $(".display-image-container")
                .empty()
                .hide();
            self.processing = true;
            self.initPostProcessingLayout = false;
            self.mimeType = "";
            self.resetElements();
            $(".canvas-container-image").empty();
            self.getTemplate("video-container-template","","Uploading...",true, false);
            if ($(window).width() < 768) {
                $(".highcharts-container").hide();
            }
            else {
                self.getTemplate("highcharts-template","","Please Wait",false, false);
            }
            highchartsApp.parsedData = ""; 
            var input = $("#upload")[0];
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
                self.mimeType = response.fileType;
                // hack for webm issue in php.get-file-data
                if ($('#upload')[0].files[0].type == "video/webm" && self.mimeType == "application/octet-stream") {
                    self.mimeType = "video/webm";
                }
                if ($('#upload')[0].files[0].type == "video/webm" && self.mimeType == "video/x-matroska") {
                    self.mimeType = "video/webm";
                }
                // end hack
                self.showUploadedVideo = false;
                // if video type is HTML5 compatible,
                // show video on response
                if (self.mimeType == "video/mp4" || self.mimeType == "video/webm") {
                    self.showUploadedVideo = true;
                }
                var fileTypeAllowed = false;
                var fileTypeList = [];
                $(self.config.uploadFileTypesEmotion).each(function(idx, fileType) {
                    fileTypeList.push(" ." + fileType.toString().split("/")[1]);
                    if(fileType == self.mimeType) { 
                        fileTypeAllowed = true;
                    }
                }); 
                var fileSizeAllowed = false;
                var fileSize = $('#upload')[0].files[0].size; //get file size
                if(fileSize <= self.config.uploadFileSizeVideo) { 
                    fileSizeAllowed = true;
                }
                if (!fileTypeAllowed) {
                    self.processing = false; 
                    self.resetElements();
                    if ($(window).width() < 768) {
                        $(".highcharts-container").hide();
                        self.getTemplate("video-container-template","Error","Wrong file type.  Must be" + fileTypeList,false,false);
                    }
                    else {
                        self.getTemplate("video-container-template","","",false,true);
                        var filetypeMsg = "Wrong file type.  Must be" + fileTypeList;
                        self.getTemplate("highcharts-template","Error",filetypeMsg,false,false);
                    }
                    return false;
                }
                else if (!fileSizeAllowed) {
                    self.processing = false; 
                    self.resetElements();
                    var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeVideo/1000000 + "MB";
                    if ($(window).width() < 768) {
                        $(".highcharts-container").hide();
                        self.getTemplate("video-container-template","Error",filesizeMsg,false,false);
                    }
                    else {
                        self.getTemplate("video-container-template","","",false,true);
                        self.getTemplate("highcharts-template","Error",filesizeMsg,false,false);
                    }
                    return false;
                }
                else if (!input) {
                    self.processing = false; 
                    self.resetElements();
                    if ($(window).width() < 768) {
                        $(".highcharts-container").hide();
                        self.getTemplate("video-container-template","Error","Couldn't find the file input element.",false,false);
                    }
                    else {
                        self.getTemplate("video-container-template","","",false,true);
                        self.getTemplate("highcharts-template","Error","Couldn't find the file input element.",false,false);
                    }
                    return false;
                }
                else if (!input.files) {
                    self.processing = false; 
                    self.resetElements();
                    if ($(window).width() < 768) {
                        $(".highcharts-container").hide();
                        self.getTemplate("video-container-template","Error","This browser doesn't seem to support the `files` property of file inputs.",false,false);
                    }
                    else {
                        self.getTemplate("video-container-template","","",false,true);
                        self.getTemplate("highcharts-template","Error","This browser doesn't seem to support the `files` property of file inputs.",false,false);
                    }
                    return false;
                }
                else {
                    var fileData = $('#upload')[0].files[0]; 
                    var formData = new FormData();                  
                    formData.append('file', fileData);
                    $.ajax({
                        url: 'form-post.php', // point to server-side PHP script 
                        dataType: 'text',  // what to expect back from the PHP script, if anything
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: formData,                         
                        type: 'post',
                    }).done(function(data) {
                        if(utils.validateJson(data)){
                            if (data.length <= 1) {
                                self.processing = false; 
                                self.resetElements();
                                if ($(window).width() < 768) {
                                    $(".highcharts-container").hide();
                                    self.getTemplate("video-container-template","Error","Invalid JSON response...",false, false);
                                }
                                else {
                                    self.getTemplate("video-container-template","","",false, true);
                                    self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
                                }
                            }
                            else if(JSON.parse(data).code && JSON.parse(data).code == 5000) {
                                self.processing = false; 
                                self.resetElements();
                                if ($(window).width() < 768) {
                                    $(".highcharts-container").hide();
                                    self.getTemplate("video-container-template","Error",JSON.parse(data).message,false, false);
                                }
                                else {
                                    self.getTemplate("video-container-template","","",false, true);
                                    self.getTemplate("highcharts-template","Error",JSON.parse(data).message,false, false);
                                }
                            }
                            else {
                                var mediaId = JSON.parse(data).id;
                                if (self.mimeType == "image/png" || self.mimeType == "image/jpeg" || self.mimeType == "image/x-ms-bmp") {
                                    var mediaType = "image";
                                }
                                else {
                                    var mediaType = "video";
                                }
                                self.pollApi(mediaId, "upload", mediaType);
                                // if upload is image
                                if (mediaType == "image") {
                                    var img = new Image();
                                    var file = input.files[0];
                                    var reader = new FileReader();
                                    reader.readAsDataURL(file);
                                    reader.onloadend = function () {
                                        if (!imageLoaded) {
                                            imageLoaded = true;
                                            var imageData;
                                            imageData = String(reader.result);
                                            img.src = imageData;
                                            var imageLoaded = false;
                                            img.onload = function(){
                                                imageLoaded = true;
                                                self.imgWidth = img.width;
                                                self.imgHeight = img.height;
                                                var cssObj = utils.computeCss(self.imgWidth, self.imgHeight, self.canvasWidth);
                                                var image = $('<img />', {
                                                    src: imageData,
                                                    css: cssObj
                                                });
                                                $(".display-image-container").show();
                                                image.addClass("display-image");
                                                image.appendTo(".display-image-container");
                                            }
                                        }
                                    }
                                }
                                // if video type is HTML5 compatible,
                                // show video on response
                                if(self.showUploadedVideo) {
                                    var reader = new FileReader();
                                    reader.onload = function (e) {
                                        $('#video').attr('src', e.target.result);
                                        // hack: video must play in order to render length
                                        video.play();
                                        setTimeout(function(){
                                            video.pause();
                                            video.currentTime = 0;
                                        },10000)
                                    }
                                    reader.readAsDataURL($('#upload')[0].files[0]);
                                }
                                // reset form field
                                $("#upload").val("");
                            }
                        }
                        else {
                            self.processing = false; 
                            self.resetElements();
                            if ($(window).width() < 768) {
                                $(".highcharts-container").hide();
                                self.getTemplate("video-container-template","Error","Invalid JSON response...",false, false);
                            }
                            else {
                                self.getTemplate("video-container-template","","",false, true);
                                self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
                            }
                        }
                    });
                } 
            });
            return false; 
        });
    },
    resetVideoUI: function () {
        $("#highcharts-curtain")
            .width("100%")
            .hide();
        $("#progress-bar").width(0);
    },
    //------------------------------------
    // URL PROCESSING
    //------------------------------------
    urlModule: function () {
        var self = this;
        $(".submit-button").click(function(){
            $(".display-image-container")
                .empty()
                .hide();
            var urlMediaSrc = utils.validateUrl($(".url-from-web").val());
            if (urlMediaSrc === false) {
                $(".url-error").html("Please enter a valid URL");
            }
            else {
                self.processing = true; 
                self.initPostProcessingLayout = false;
                $(".url-error").html("");
                self.resetElements();
                $(".hide-json").click();
                $(".canvas-container-image").empty();
                self.getTemplate("video-container-template","","Uploading...",true, false);
                if ($(window).width() < 768) {
                    $(".highcharts-container").hide();
                }
                else {
                    self.getTemplate("highcharts-template","","Please Wait",false, false);
                }
                var data = {};
                data.fname = "url";
                data.url = urlMediaSrc;
                $.ajax({
                    type: "POST",
                    url: "../get-file-data.php",
                    data: data,
                    dataType: "text"
                }).done(function(data) {
                    var response = JSON.parse(data);
                    // hack for webm issue in php.get-file-data
                    self.mimeType = response.fileType;
                    if (urlMediaSrc.split('.').pop() == "webm" && response.fileType == "application/octet-stream") {
                        self.mimeType = "video/webm";
                    }
                    if (urlMediaSrc.split('.').pop() == "webm" && response.fileType == "video/x-matroska") {
                        self.mimeType = "video/webm";
                    }
                    // end hack
                    self.fileSize = response.fileSize;
                    self.fileData = response.fileData;
                    self.showUploadedVideo = false;
                    // if video type is HTML5 compatible,
                    // show video on response
                    if (self.mimeType == "video/mp4" || self.mimeType == "video/webm") {
                        self.showUploadedVideo = true;
                    }
                    var fileTypeAllowed = false;
                    var fileTypeList = [];
                    $(self.config.uploadFileTypesEmotion).each(function(idx, fileType) {
                        fileTypeList.push(" ." + fileType.toString().split("/")[1])
                        if(fileType == self.mimeType) { 
                            fileTypeAllowed = true;
                        }
                    }); 
                    var fileSizeAllowed = false;
                    if(self.fileSize <= self.config.uploadFileSizeVideo) { 
                        fileSizeAllowed = true;
                    }
                    if (!fileTypeAllowed) {
                        self.processing = false;
                        if ($(window).width() < 768) {
                            $(".highcharts-container").hide();
                            self.getTemplate("video-container-template","","Wrong file type.  Must be" + fileTypeList,false,false);
                        }
                        else {
                            self.getTemplate("video-container-template","","",false,true);
                            var filetypeMsg = "Wrong file type.  Must be" + fileTypeList;
                            self.getTemplate("highcharts-template","Error",filetypeMsg,false,false);
                        }
                    }
                    else if (!fileSizeAllowed) {
                        self.processing = false; 
                        self.resetElements();
                        var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeVideo/1000000 + "MB";
                        if ($(window).width() < 768) {
                            $(".highcharts-container").hide();
                            self.getTemplate("video-container-template","Error",filesizeMsg,false,false);
                        }
                        else {
                            self.getTemplate("video-container-template","","",false,true);
                            self.getTemplate("highcharts-template","Error",filesizeMsg,false,false);
                        }
                        return false;
                    }
                    else {
                        if(self.showUploadedVideo) {
                            $('#video').attr('src', "data:" + self.mimeType + ";base64," + response.fileData);
                            // hack: video must play in order to render length
                            video.play();
                            setTimeout(function(){
                                video.pause();
                                video.currentTime = 0;
                            },10000)
                        }
                        var data = {};
                        data.fname = "url";
                        data.url = urlMediaSrc;
                        $.ajax({
                            type: 'POST',
                            url: 'process.php',
                            data: data,
                            dataType: 'text',
                            timeout  : self.config.apiTimeout
                        }).done(function(data) {
                            if(utils.validateJson(data)){
                                var mediaId = JSON.parse(data).id;
                                if (self.mimeType == "image/png" || self.mimeType == "image/jpeg") {
                                    var mediaType = "image";
                                }
                                else {
                                    var mediaType = "video";
                                }
                                var img = new Image();
                                var imageData;
                                imageData = "data:" + self.mimeType + ";base64," + self.fileData;
                                img.src = imageData;
                                img.onload = function(){
                                    imageLoaded = true;
                                    self.imgWidth = img.width;
                                    self.imgHeight = img.height;
                                    var cssObj = utils.computeCss(self.imgWidth, self.imgHeight, self.canvasWidth);
                                    var image = $('<img />', {
                                        src: imageData,
                                        css: cssObj
                                    });
                                    $(".display-image-container").show();
                                    image.addClass("display-image");
                                    image.appendTo(".display-image-container");
                                }
                                self.pollApi(mediaId, "url", mediaType);
                            }
                            else {
                                self.resetElements();
                                if ($(window).width() < 768) {
                                    $(".highcharts-container").hide();
                                    self.getTemplate("video-container-template","Error","Invalid JSON response...",false, false);
                                }
                                else {
                                    self.getTemplate("video-container-template","","",false, true);
                                    self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
                                }
                            }
                        });
                    }
                });
            }
        });
    },
    //------------------------------------
    // POLL KAIROS API WITH MEDIA ID FOR JSON RESPONSE
    // RESPONSES:
    //      "code": 3002, "message": "Invalid API Call"
    //      "status_code": 1,  "status_message": "In_Progress"
    //      "status_code": 2,  "status_message": "Analyzing"
    //      "status_code": 3,  "status_message": "Error: Media record not found"
    //      "status_code": 4,  "status_message": "Complete"
    //------------------------------------
    pollApi: function (mediaId, module, mediaType) {
        var self = this;
        if (mediaType == "video") {
            self.getTemplate("video-container-template","","Processing video...",true, false);
        }
        else {
            self.getTemplate("video-container-template","","Processing image...",true, false);
        }
        var pollTimeout = self.config.pollTimeout;
        if ($("#optionPollTimeout").val()) {
            pollTimeout = $("#optionPollTimeout").val();
        }
        pollTimeout = pollTimeout * 1000;
        var pollTick = 1000;
        self.timeRemaining = pollTimeout;
        self.pollInterval = setInterval(function () {
            if (self.processing) {
                self.timeRemaining -= pollTick;
                getApiResponse(); 
            }
        },pollTick);
        var fd = {};
        fd["fname"] = "polling";
        fd["mediaId"] = mediaId;
        var getApiResponse = function () {
             $.ajax({
                type: 'POST',
                url: 'process.php',
                data: fd,
                dataType: 'text'
            }).done(function(data){
                var response = data;
                if(utils.validateJson(response)){
                    // if (JSON.parse(response).status_code == "3") {
                    //     var data = {"status_message":"api_error","status_message_text": JSON.parse(response).status_message.replace("Error:", "")};
                    //     self.postProcessingLayout(JSON.stringify(data), module);
                    //     self.processing = false; 
                    //     clearInterval(self.pollInterval)
                    // }
                    if (JSON.parse(response).status_code == "4") {
                        if (!self.initPostProcessingLayout) {
                            // make sure response contains at least one
                            // "people" array, which contains landmark data
                            var frames = JSON.parse(response).frames;
                            var containsOnePeopleArray = false;
                            $.each(frames, function(idx, val){
                                if (val.people.length) {
                                    containsOnePeopleArray = true;
                                }
                            });
                            if (containsOnePeopleArray) {
                                $(".featurepoints-checkbox").show();
                                self.postProcessingLayout(response, module);
                                self.initPostProcessingLayout = true;
                            }
                            else {
                                self.resetElements();
                                if ($(window).width() < 768) {
                                    $(".highcharts-container").hide();
                                    self.getTemplate("video-container-template","Error","Invalid JSON response - 'people' object empty...",false, false);
                                }
                                else {
                                    self.getTemplate("video-container-template","","",false, true);
                                    self.getTemplate("highcharts-template","Error","Invalid JSON response - 'people' object empty...",false, false);
                                }
                            }  
                            self.processing = false;
                            clearInterval(self.pollInterval)
                        }
                    }
                    else if (JSON.parse(response).code != undefined && JSON.parse(response).message) {
                        var msg = JSON.parse(response).message;
                        if (msg == "No faces found in the image.") {
                            msg = "No faces found in the image, or the face is too close to the camera.";
                        }
                        var data = {"status_message": msg};
                        self.postProcessingLayout(JSON.stringify(data), module);
                        self.processing = false;
                        clearInterval(self.pollInterval)
                    }
                    else if (self.timeRemaining <= 0) {
                        var data = {"status_message":"api_error","status_message_text": "timeout"};
                        self.postProcessingLayout(JSON.stringify(data), module);
                        self.processing = false;
                        clearInterval(self.pollInterval)
                    }
                    else {
                        $(".polling-display span").html(parseInt(pollTimeout - self.timeRemaining) / 1000 + 1);
                        console.log('keep polling')
                    }
                }
                else {
                    console.log("invalid")
                    clearInterval(self.pollInterval)
                    self.processing = false;
                    self.resetElements();
                    if ($(window).width() < 768) {
                        $(".highcharts-container").hide();
                        self.getTemplate("video-container-template","Error","Invalid JSON response...",false, false);
                    }
                    else {
                        self.getTemplate("video-container-template","","",false, true);
                        self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
                    }
                }
                    
            }).fail(function (jqXHR, textStatus) {
                var data = {"status_message":"api_error","status_message_text":"Access-Control-Allow-Origin"};
                self.postProcessingLayout(JSON.stringify(data), module);
            });
        };
        getApiResponse();
    },
    //------------------------------------
    // SET LAYOUT AFTER RESPONSE IS RECEIVED FROM API
    // SEND DATA TO HIGHCHARTS
    //------------------------------------
    postProcessingLayout: function (data, module) {
        var self = this;
        var response = JSON.parse(data);
        $(".hide-json").click();
        $(".json-response").html("");
        if (response.status_message != "Complete") {
            var messageText = response.status_message;
            if (response.status_message == "api_error") {
                if (response.status_message_text == "timeout") {
                    messageText = "Error: The API call timed out...";
                    self.resetElements();
                    self.processing = false;
                }
                else {
                    messageText = "Error: " + response.status_message_text;
                    self.resetElements();
                    self.processing = false;
                }
            }
            $(".video-wrapper").hide();
            if ($(window).width() < 768) {
                $(".highcharts-container").hide();
                self.getTemplate("video-container-template","",messageText,false, false);
            }
            else {
                self.getTemplate("video-container-template","","",false, true);
                self.getTemplate("highcharts-template","",messageText,false, false);
            }
        }
        else {
            self.mediaType = response.media_info.type;
            featurePointAnimation.init(data);
            if(response.frames[0].people != undefined) {
                self.resetElements();
                var genderDefined = false;
                var ageDefined = false;
                // photo
                // NOTE: "jpg" should be "jpeg"
                if (response.media_info.type == "image") {
                    self.getTemplate("highcharts-template","","",false, false, false, false);
                    if(response.frames[0].people[0].demographics != undefined) {
                        var gender = response.frames[0].people[0].demographics.gender;
                        var age = response.frames[0].people[0].demographics.age_group;
                        if (gender != undefined && gender != "Not Available" && gender != "") {
                            genderDefined = true;
                        }
                        if (age != undefined && age != "Not Available" != "") {
                            ageDefined = true;
                        } 
                        self.getTemplate("highcharts-template","","",false, false, genderDefined, ageDefined);
                        $(".response-box-gender").html(gender);
                        $(".response-box-age").html(age);
                    }
                    $(".show-json, .hide-json").show();
                    self.resetVideoUI();
                    $(".video-wrapper").hide();
                    // feature points on still images not accurate enough to
                    // show at this time
                    // featurePointAnimation.getFeaturePoints(0);
                    self.jsonResponse = JSON.stringify(response, undefined, 4);
                    $(".highcharts-wrapper").hide();
                    $(".autoscale-checkbox").hide();   
                    $(".featurepoints-checkbox").hide();   
                    $("#highcharts-containers").empty();
                    highchartsAppPhoto.parsedData = JSON.stringify(response.frames);
                    $("#highcharts-container-image").show();
                    highchartsAppPhoto.displayData();
                    $(".ui-buttons-mask").hide();
                }
                // detect multi-face
                else if (response.frames[0].people.length > 1) {
                    var str = JSON.stringify(response, undefined, 4);
                    self.getTemplate("video-container-template","","We have detected a mulit-face video.  Visualization is not available at this time.",false, false);
                    $(".show-json").click();
                    $(".hide-json").hide();
                    self.jsonResponse = JSON.stringify(response, undefined, 4);
                    $("#highcharts-titles, #highcharts-containers").show();
                }
                else {
                    self.getTemplate("highcharts-template","","",false, false, false, false);
                    var fd = {};
                    fd["fname"] = "analytics";
                    fd["mediaId"] = response.id;
                    $.ajax({
                        type: 'POST',
                        url: 'process.php',
                        data: fd,
                        dataType: 'text'
                    }).done(function(analyticsData){
                        var analyticsResponse = JSON.parse(analyticsData);
                        // if analytics object is available, show, if not
                        // loop through response
                        if (analyticsResponse.id != undefined) {
                            var analytics   = analyticsResponse.impressions[0].demographics;
                            genderDefined   = true;
                            ageDefined      = true;
                            gender          = analytics.gender;
                            age             = analytics.age_group;
                        }
                        else {
                            var analytics   = self.getAnalyticsFromJson(response);
                            genderDefined   = analytics.genderDefined;
                            ageDefined      = analytics.ageDefined;
                            gender          = analytics.gender;
                            age             = analytics.age;
                        }
                        self.getTemplate("highcharts-template","","",false, false, genderDefined, ageDefined);
                        $(".response-box-gender").html(gender);
                        $(".response-box-age").html(age);
                        $(".show-json, .hide-json").show();
                        $(".autoscale-checkbox").show(); 
                        $(".featurepoints-checkbox").show();
                        if (module != "examples") {
                            if(self.showUploadedVideo) {
                                self.resetVideoUI();
                                $(".video-wrapper").show();
                                $(".video-controls").show();
                            }
                            else {
                                if ($(window).width() < 768) {
                                    $(".main-video-container").hide();
                                }
                                self.getTemplate("video-container-template","","Here's your video analysis!",false, false);
                            }
                        }
                        else {
                            $(".video-wrapper").show();
                        }
                        self.jsonResponse = JSON.stringify(response, undefined, 4);
                        $("#highcharts-titles, #highcharts-containers").show();
                        $("#highcharts-containers").empty();
                        highchartsApp.parsedData = JSON.stringify(response.frames);
                        highchartsApp.autoscale = false;
                        highchartsApp.displayData();
                        $(".ui-buttons-mask").hide();
                    });
                }
            }
            else {
                if ($(window).width() < 768) {
                    $(".highcharts-container").hide();
                    self.getTemplate("video-container-template","Error","Invalid JSON response...",false, false);
                }
                else {
                    self.getTemplate("video-container-template","","",false, true);
                    self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
                }
                    
            }
                
        }
        $( window ).resize(function() {
          featurePointAnimation.init(data);
        });
    },
    resetElements: function() {
        $(".main-video-container").show();
        $(".highcharts-container").show();
        $(".video-wrapper").hide();
        $(".autoscale-checkbox").hide();
        $(".featurepoints-checkbox").hide();
        $(".highcharts-wrapper").show();
        $("#highcharts-titles, #highcharts-containers, #highcharts-container-image, #highcharts-curtain").hide();
        $(".face-overlay").hide();
        $(".show-json, .hide-json").hide();
        $(".spinner-message-container")
            .empty()
            .show();
        $(".json-response pre").html("");
        $(".copy-json-button").hide();
        $(".ui-buttons-mask").hide();
        $(".polling-display span").empty();
        $(".json-response-container").hide();
    },
    //------------------------------------
    // DISPLAY HANDLEBARS TEMPLATES
    //------------------------------------ 
    getTemplate: function(template,message1,message2,spinner,sadFace,gender,age){
        var thisTemplate = $("#" + template).html();
        var compiledTemplate = Handlebars.compile(thisTemplate);
        var context = {
            "message1": message1,
            "message2": message2,
            "spinner": spinner,
            "sadFace": sadFace,
            "gender": gender,
            "age": age
        };
        var theCompiledHtml = compiledTemplate(context);
        $("." + template).html(theCompiledHtml);
    },
    getAnalyticsFromJson: function(response) {
        var maleCount = 0;
        var femaleCount = 0;
        var childCount = 0;
        var yadultCount = 0;
        var adultCount = 0;
        var seniorCount = 0;
        var genderDefined = false;
        var ageDefined = false;
        $.each(response.frames, function(idx, val){
            if (val.people[0] != undefined && val.people[0].demographics != undefined) {
                if( val.people[0].demographics.gender == "Male") {
                    maleCount++;
                }
                if(val.people[0].demographics.gender == "Female") {
                    femaleCount++;
                }
                if(val.people[0].demographics.age_group == "Child") {
                    childCount++;
                }
                if(val.people[0].demographics.age_group == "Young Adult") {
                    yadultCount++;
                }
                if(val.people[0].demographics.age_group == "Adult") {
                    adultCount++;
                }
                if(val.people[0].demographics.age_group == "Senior") {
                    seniorCount++;
                }
            }
        });
        var gender = "";
        if (maleCount > 0 || femaleCount > 0) {
            gender = (maleCount >= femaleCount) ? "MALE" : "FEMALE";
        }
        if (gender != undefined && gender != "Not Available" && gender != "") {
            genderDefined = true;
        }
        var ageArray = ["Child","Young Adult","Adult","Senior"];
        var ageValArray = [childCount,yadultCount,adultCount,seniorCount];
        var maxVal = Math.max.apply(Math, ageValArray);
        var ageIndex = $.inArray(maxVal,ageValArray);
        var age = ageArray[ageIndex];
        if (age != undefined && age != "") {
            ageDefined = true;
        }
        return {gender: gender, genderDefined: genderDefined, age: age, ageDefined: ageDefined};
    },
    setElementDimensions: function () {
        if ($(window).width() < 768) {
            this.fullVideoWidth = $(window).width() - 30;  // allow for side margins
            this.fullVideoHeight = this.fullVideoWidth * 9/16;
            var mediaHeight = this.fullVideoHeight + 40 + 15 + 1; // add video controls height + top margin
            $(".main-video-container, .display-image-container").height(mediaHeight); 
            this.canvasWidth = mediaHeight; 
            this.canvasHeight = mediaHeight; 
            $("#video").height(this.fullVideoHeight);
        }
        else if ($(window).width() < 992) {
            this.fullVideoWidth = 750 - 30;
            this.fullVideoHeight = this.fullVideoWidth * 9/16;
            var mediaHeight = this.fullVideoHeight + 40 + 15 + 1; // add video controls height + top margin
            $(".main-video-container, .display-image-container").height(mediaHeight); // add video controls height + top margin
            this.canvasWidth = mediaHeight; 
            this.canvasHeight = mediaHeight; 
            $("#video").height(this.fullVideoHeight);
        }
        else {
            this.canvasWidth = 475;
            this.canvasHeight = 475;
            this.fullVideoWidth = 923;
            this.fullVideoHeight = 520;
            $(".display-image-container").height(this.fullVideoHeight);
        }
        $(".display-image-container img").each(function(idx,image){
            var displayImageCssObj = utils.computeCss(image.naturalWidth, image.naturalHeight, self.canvasWidth);
            $(image).css(displayImageCssObj); 
        });
    }
}



