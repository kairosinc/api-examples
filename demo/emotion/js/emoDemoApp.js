//------------------------------------
// emoDemoApp.js
// javascript object responsible for primary app functionality
// dependencies: jquery.js, highchartsApp.js, MediaStreamRecorder.js, adapter.js, jquery.form.js, process.php
// created: March 2016
// last modified: September 2016
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
        this.viewportWidth = 475;
        this.viewportHeight = 560;
        this.fullVideoWidth = 923;
        this.fullVideoHeight = 520;
        if (this.apiCredentials){
            this.examplesModule("video");
            this.uploadModule();
            this.urlModule();
        }
        else {
            this.getTemplate("highcharts-template","Error","API credentials not provided.",false,false);
        }
        this.captureInterval = 10000;
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
    examplesModule: function (mediaType) {
        var self = this; 
        self.processing = true; 
        self.initPostProcessingLayout = false;
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
            $(".show-image").attr("src",self.config.mediaPath + "fullsize_images/" + mediaId + ".png");
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
                self.getTemplate("highcharts-template","Tip","Keep your face inside the green circle...",false,false);
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
                        }
                        reader.readAsDataURL(videoFile);
                        if (videoFile.size > self.config.uploadFileSizeVideo) {
                            self.resetElements();
                            var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeVideo/1000000 + "MB";
                            self.getTemplate("video-container-template","","",false, true);
                            self.getTemplate("highcharts-template","Error",filesizeMsg,false, false);
                            self.processing = false;
                        }
                        else {
                            console.log("process")
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
                self.getTemplate("highcharts-template","","Please Wait",false, false);
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
                        timeout  : self.config.pollTimeout
                    }).done(function(data) {
                        if(self.validateJson(data)){
                            var response = JSON.parse(data);
                            if (response.Error) {
                                self.resetElements();
                                self.getTemplate("video-container-template","","",false, true);
                                self.getTemplate("highcharts-template","Error","Invalid file...",false, false);
                                self.processing = false;
                            }
                            else {
                                var mediaId = response.id;
                                self.pollApi(mediaId, "webcam", "video"); 
                            }
                                
                        }
                        else {
                            self.resetElements();
                            self.getTemplate("video-container-template","","",false, true);
                            self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
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
            console.log(e)
            e.preventDefault();
            $('.show-image')
                .attr("src","")
                .css({"width":0,"height":0});
            self.processing = true;
            self.initPostProcessingLayout = false;
            self.mimeType = "";
            self.resetElements();
            self.getTemplate("video-container-template","","Uploading...",true, false);
            self.getTemplate("highcharts-template","","Please Wait",false, false);
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
                self.mimeType = response;
                // hack for webm issue in php.get-file-data
                if ($('#upload')[0].files[0].type == "video/webm" && response == "application/octet-stream") {
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
                    self.getTemplate("video-container-template","","",false,true);
                    var filetypeMsg = "Wrong file type.  Must be" + fileTypeList;
                    self.getTemplate("highcharts-template","Error",filetypeMsg,false,false);
                    return false;
                }
                else if (!fileSizeAllowed) {
                    self.processing = false; 
                    self.resetElements();
                    self.getTemplate("video-container-template","","",false,true);
                    var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeVideo/1000000 + "MB";
                    self.getTemplate("highcharts-template","Error",filesizeMsg,false,false);
                    return false;
                }
                else if (!input) {
                    self.processing = false; 
                    self.resetElements();
                    self.getTemplate("video-container-template","","",false,true);
                    self.getTemplate("highcharts-template","Error","Couldn't find the file input element.",false,false);
                    return false;
                }
                else if (!input.files) {
                    self.processing = false; 
                    self.resetElements();
                    self.getTemplate("video-container-template","","",false,true);
                    self.getTemplate("highcharts-template","Error","This browser doesn't seem to support the `files` property of file inputs.",false,false);
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
                        if(self.validateJson(data)){
                            if (data.length <= 1) {
                                self.processing = false; 
                                self.resetElements();
                                self.getTemplate("video-container-template","","",false, true);
                                self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false); 
                            }
                            else if(JSON.parse(data).code && JSON.parse(data).code == 5000) {
                                self.processing = false; 
                                self.resetElements();
                                self.getTemplate("video-container-template","","",false, true);
                                self.getTemplate("highcharts-template","Error",JSON.parse(data).message,false, false);
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
                                    var reader = new FileReader();
                                    reader.onload = function (e) {
                                        img.src = e.target.result;
                                        newImageSize = self.calculateAspectRatioFit(img.width,img.height,self.viewportWidth,self.viewportHeight);
                                        $('.show-image')
                                            .attr("src", e.target.result)
                                            .css("z-index",1)
                                            .css(newImageSize)
                                    }
                                    reader.readAsDataURL(input.files[0]);
                                }
                                // if video type is HTML5 compatible,
                                // show video on response
                                if(self.showUploadedVideo) {
                                    var reader = new FileReader();
                                    reader.onload = function (e) {
                                        $('#video').attr('src', e.target.result);
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
                            self.getTemplate("video-container-template","","",false, true);
                            self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
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
            $('.show-image')
                .attr("src","")
                .css({"width":0,"height":0});
            var urlMediaSrc = self.validateUrl($(".url-from-web").val());
            if (urlMediaSrc === false) {
                $(".url-error").html("Please enter a valid URL");
            }
            else {
                self.processing = true; 
                self.initPostProcessingLayout = false;
                $(".url-error").html("");
                self.resetElements();
                self.getTemplate("video-container-template","","Uploading...",true, false);
                self.getTemplate("highcharts-template","","Please Wait",false, false);
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
                        self.getTemplate("video-container-template","","",false,true);
                        var filetypeMsg = "Wrong file type.  Must be" + fileTypeList;
                        self.getTemplate("highcharts-template","Error",filetypeMsg,false,false);
                    }
                    else if (!fileSizeAllowed) {
                        self.processing = false; 
                        self.resetElements();
                        self.getTemplate("video-container-template","","",false,true);
                        var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeVideo/1000000 + "MB";
                        self.getTemplate("highcharts-template","Error",filesizeMsg,false,false);
                        return false;
                    }
                    else {
                        if(self.showUploadedVideo) {
                            $(".video-wrapper").show();
                            $(".video-controls").show()
                            $('#video').attr('src', "data:" + self.mimeType + ";base64," + response.fileData);
                        }
                        var data = {};
                        data.fname = "url";
                        data.url = urlMediaSrc;
                        $.ajax({
                            type: 'POST',
                            url: 'process.php',
                            data: data,
                            dataType: 'text',
                            timeout  : self.config.pollTimeout
                        }).done(function(data) {
                            if(self.validateJson(data)){
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
                                    newImageSize = self.calculateAspectRatioFit(img.width,img.height,self.viewportWidth,self.viewportHeight);
                                    $('.show-image')
                                        .attr("src", imageData)
                                        .css("z-index",1)
                                        .css(newImageSize)
                                }
                                self.pollApi(mediaId, "url", mediaType);
                            }
                            else {
                                self.resetElements();
                                self.getTemplate("video-container-template","","",false, true);
                                self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
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
            // $.ajax({
            //     url: 'fake-post.php', // fake the AJAX call                         
            //     type: 'post',
            // }).done(function(data) {
            //     self.currData = testData;
            //     response = JSON.stringify(testData);
                
                if(self.validateJson(response)){
                    if (JSON.parse(response).status_code == "3") {
                        var data = {"status_message":"api_error","status_message_text": JSON.parse(response).status_message.replace("Error:", "")};
                        self.postProcessingLayout(JSON.stringify(data), module);
                        self.processing = false; 
                        clearInterval(self.pollInterval)
                    }
                    else if (JSON.parse(response).status_code == "4") {
                        if (!self.initPostProcessingLayout) {
                            if (JSON.parse(response).frames[0].people[0] != undefined) {
                                var landmarks = JSON.parse(response).frames[0].people[0].landmarks;
                                if (landmarks != undefined) {
                                    $(".featurepoints-checkbox").show();
                                }
                                self.postProcessingLayout(response, module);
                                self.initPostProcessingLayout = true;
                            }
                            else {
                                self.resetElements();
                                self.getTemplate("video-container-template","","",false, true);
                                self.getTemplate("highcharts-template","Error","Invalid JSON response - 'people' object missing...",false, false);
                            }  
                            self.processing = false;
                            clearInterval(self.pollInterval)
                        }
                    }
                    else if (self.timeRemaining <= 0) {
                        var data = {"status_message":"api_error","status_message_text": "timeout"};
                        self.postProcessingLayout(JSON.stringify(data), module);
                        self.processing = false;
                        clearInterval(self.pollInterval)
                    }
                    else {
                        console.log('keep polling')
                    }
                }
                else {
                    clearInterval(self.pollInterval)
                    self.processing = false;
                    self.resetElements();
                    self.getTemplate("video-container-template","","",false, true);
                    self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
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
        featurePointAnimation.init(data);
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
            self.getTemplate("video-container-template","","",false, true);
            self.getTemplate("highcharts-template","",messageText,false, false);
        }
        else {
            if(response.frames[0].people != undefined) {
                self.resetElements();
                var genderDefined = false;
                var ageDefined = false;
                // photo
                // NOTE: "jpg" should be "jpeg"
                if (response.media_info.mime_type == "image/jpeg" || response.media_info.mime_type == "image/jpg" || response.media_info.mime_type == "image/png" || response.media_info.mime_type == "image/x-ms-bmp") {
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
                    var str = JSON.stringify(response, undefined, 4);
                    $(".json-response").html("<pre>" + self.syntaxHighlight(str) + "</pre>");
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
                    $(".json-response").html("<pre>" + self.syntaxHighlight(str) + "</pre>");
                    $("#highcharts-titles, #highcharts-containers").show();
                }
                else {
                    var lastFrame = response.frames.length - 1;
                    self.getTemplate("highcharts-template","","",false, false, false, false);
                    var maleCount = 0;
                    var femaleCount = 0;
                    var childCount = 0;
                    var yadultCount = 0;
                    var adultCount = 0;
                    var seniorCount = 0;
                    $.each(response.frames, function(idx, val){
                        if(val.people[0].demographics != undefined && val.people[0].demographics.gender == "Male") {
                            maleCount++;
                        }
                        if(val.people[0].demographics != undefined && val.people[0].demographics.gender == "Female") {
                            femaleCount++;
                        }
                        if(val.people[0].demographics != undefined && val.people[0].demographics.age_group == "Child") {
                            childCount++;
                        }
                        if(val.people[0].demographics != undefined && val.people[0].demographics.age_group == "Young Adult") {
                            yadultCount++;
                        }
                        if(val.people[0].demographics != undefined && val.people[0].demographics.age_group == "Adult") {
                            adultCount++;
                        }
                        if(val.people[0].demographics != undefined && val.people[0].demographics.age_group == "Senior") {
                            seniorCount++;
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
                            self.getTemplate("video-container-template","","Here's your video analysis!",false, false);
                        }
                    }
                    else {
                        $(".video-wrapper").show();
                    }
                    var str = JSON.stringify(response, undefined, 4);
                    $(".json-response").html("<pre>" + self.syntaxHighlight(str) + "</pre>");
                    $("#highcharts-titles, #highcharts-containers").show();
                    $("#highcharts-containers").empty();
                    highchartsApp.parsedData = JSON.stringify(response.frames);
                    highchartsApp.autoscale = false;
                    highchartsApp.displayData();
                    $(".ui-buttons-mask").hide();
                }
            }
            else {
                self.getTemplate("video-container-template","","",false, true);
                self.getTemplate("highcharts-template","Error","Improper API response...",false, false);
            }
                
        }
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
                    cls = 'key'
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
    resetElements: function() {
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
    calculateAspectRatioFit: function(srcWidth, srcHeight, maxWidth, maxHeight) {
        var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return { width: srcWidth*ratio, height: srcHeight*ratio, ratio:ratio };
    }
}



