//------------------------------------
// emoDemoApp.js
// javascript object responsible for primary app functionality
// dependencies: jquery.js, highchartsApp.js, MediaStreamRecorder.js, adapter.js, jquery.form.js, process.php
// created: March 2016
// modified: June 2016
// author: Steve Rucker
//------------------------------------

var emoDemoApp = emoDemoApp || {};
emoDemoApp =  {
    //------------------------------------
    // INITIALIZE - index.php
    //------------------------------------
    init: function (config) { 
        this.webcamWidth = 635;
        this.webcamHeight = 475;
        this.video = $("#video");
        this.config = config;
        this.apiCredentials = config.apiCredentials;
        if (this.apiCredentials){
            this.examplesModule();
            this.uploadModule();
            this.urlModule();
        }
        else {
            this.getTemplate("highcharts-template","Error","API credentials not provided.",false,false);
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
        self.processing = true; 
        self.getTemplate("video-container-template","","Loading video...",true,false);
        self.getTemplate("highcharts-template","","Analyzing video...",true,false);
        highchartsApp.parsedData = "";
        self.resetVideoUI();
        var videoId = $("#video").attr("videoId");
        $("#video").attr("src",self.config.mediaPath + "videos/" + videoId + ".mp4");
        var playButton = $("#play-pause"); 
        playButton.removeClass("pause");
        playButton.addClass("play");
        var mediaId = self.config["demoVideos"][videoId];
        self.pollApi(mediaId, "examples");
    },
    //------------------------------------
    // WEBCAM PROCESSING
    //------------------------------------
    webcamModule: function () {
        var self = this;
        self.processing = true; 
        (function () {
            function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
                navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
            }
            var mediaConstraints = {
                audio: false,
                video:  true
            };
            var mediaRecorder;
            self.resetVideoUI();
                // this.disabled = true;
            captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

            function onMediaSuccess(stream) {
                highchartsApp.parsedData = "";
                var webcamVideo = document.getElementById("webcamVideo");
                var videoWidth = self.webcamWidth;
                var videoHeight = self.webcamHeight;
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
                mediaRecorder.videoWidth = self.webcamWidth;
                mediaRecorder.videoHeight = self.webcamHeight;
                var captureInterval = 10000;
                
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
                            mediaRecorder.stream.getVideoTracks()[0].stop();
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
                        processVideo(videoFile);
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
                            if (response.status_message == "In Progress") { 
                                var mediaId = response.id;
                                self.pollApi(mediaId, "webcam"); 
                            }
                            else {
                                self.processing = false;
                                if (response.code) {
                                    var data = {"status_message":"api_error","status_message_text": response.message}; 
                                }
                                else {
                                   var data = {"status_message":"api_error","status_message_text": "API POST error."}; 
                                }
                                self.postProcessingLayout(JSON.stringify(data), "webcam");
                            }
                        }
                        else {
                            self.resetElements();
                            self.getTemplate("video-container-template","","",false, true);
                            self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
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
        var ajaxFormOptions = { 
            success:       afterFormSubmitSuccess,  // post-submit callback 
            beforeSubmit:  beforeFormSubmit,  // pre-submit callback 
            uploadProgress: OnProgress, //upload progress callback 
            resetForm: true        // reset the form after successful submit 
        };

        $('#mediaUploadForm').submit(function() { 
            self.processing = true;
            self.getTemplate("video-container-template","","Uploading video...",true, false);
            self.getTemplate("highcharts-template","","Please Wait",false, false);
            $(this).ajaxSubmit(ajaxFormOptions); 
            highchartsApp.parsedData = ""; 
            highchartsApp.uploadedFileName = $("#upload")[0].files[0].name;
            // if video type is HTML5 compatible,
            // show video on response
            if(self.showUploadedVideo) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $('#video').attr('src', e.target.result);
                }
                reader.readAsDataURL($('#upload')[0].files[0]);
            }
            // always return false to prevent standard browser submit and page navigation 
            return false; 
        });

        function beforeFormSubmit(){
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                $(".upload-error").html("");

                var fsize = $('#upload')[0].files[0].size; //get file size
                var ftype = $('#upload')[0].files[0].type; // get file type

                // if video type is HTML5 compatible,
                // show video on response
                // webm has been removed - doesn't display properly
                self.showUploadedVideo = false;
                if (ftype == "video/mp4" || ftype == "video/webm") {
                    self.showUploadedVideo = true;
                }

                var fileTypeAllowed = false;

                $(self.config.uploadFileTypesVideo).each(function(idx, fileType) {
                    if(fileType == ftype) { fileTypeAllowed = true};
                });

                if(!fileTypeAllowed) {
                    $(".upload-error").html(ftype + " -- unsupported file type!");
                    return false
                }

                if(fsize > self.config.uploadFileSize) {
                    $(".upload-error").html(bytesToSize(fsize) + " -- file is too large, should be less than 20 MB.");
                    return false
                }
            }
        }

        //function after succesful file upload (upon server response)
        function afterFormSubmitSuccess(data) {
            if(self.validateJson(data)){
                if(JSON.parse(data).code && JSON.parse(data).code == 5000) {
                    self.processing = false; 
                    self.resetElements();
                    self.getTemplate("video-container-template","","",false, true);
                    self.getTemplate("highcharts-template","Error",JSON.parse(data).message,false, false);
                }
                else {
                    var mediaId = JSON.parse(data).id;
                    self.pollApi(mediaId, "upload");
                }
            }
            else {
                self.processing = false; 
                self.resetElements();
                self.getTemplate("video-container-template","","",false, true);
                self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
            }
        }
        
        //progress bar function
        function OnProgress(event, position, total, percentComplete) {
            $(".video-wrapper").hide();
            $("#highcharts-titles, #highcharts-containers").hide();
        }

        function bytesToSize(bytes) {
            var k = 1000;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0) return '0 Bytes';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
        }
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
            var urlVideoSrc = self.validateUrl($(".url-from-web").val());
            if (urlVideoSrc === false) {
                $(".url-error").html("Please enter a valid URL");
            }
            else {
                self.processing = true; 
                $(".url-error").html("");
                self.resetElements();
                self.getTemplate("video-container-template","","Uploading video...",true, false);
                self.getTemplate("highcharts-template","","Please Wait",false, false);
                var fd = {};
                fd["fname"] = "webUrl";
                fd["url"] = urlVideoSrc;
                // if video type is HTML5 compatible,
                // show video on response
                var videoExt = urlVideoSrc.split('.').pop();
                if (videoExt == "webm" || videoExt == "mp4") {
                    var videoData = {};
                    videoData.videoExt = urlVideoSrc.split('.').pop();
                    videoData.url = urlVideoSrc;
                    $.ajax({
                        type: "POST",
                        url: "get-video-data.php",
                        data: videoData,
                        dataType: "text"
                    }).done(function(response) {
                        self.showUploadedVideo = true;
                        var data = JSON.parse(response);
                        $('#video').attr('src', data.imageData);
                    });
                }
                $.ajax({
                    type: 'POST',
                    url: 'process.php',
                    data: fd,
                    dataType: 'text',
                    timeout  : self.config.pollTimeout
                }).done(function(data) {
                    if(self.validateJson(data)){
                        var mediaId = JSON.parse(data).id;
                        self.pollApi(mediaId, "url");
                    }
                    else {
                        self.resetElements();
                        self.getTemplate("video-container-template","","",false, true);
                        self.getTemplate("highcharts-template","Error","Invalid JSON response...",false, false);
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
    pollApi: function (mediaId, module) {
        var self = this;
        self.getTemplate("video-container-template","","Processing video...",true, false);
        var url = self.config["api_url"] + "/media/" + mediaId;
        var header_settings = {
            "Content-type"    : "application/json",
            "app_id"          : self.config["app_id"],
            "app_key"         : self.config["app_key"]
        };
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
            }).done(function(response){
                if(self.validateJson(response)){
                    if (JSON.parse(response).status_code == "3") {
                        var data = {"status_message":"api_error","status_message_text": "API GET error."};
                        self.postProcessingLayout(JSON.stringify(data), module);
                        self.processing = false; 
                        clearInterval(self.pollInterval)
                    }
                    else if (JSON.parse(response).status_code == "4") {
                        self.postProcessingLayout(response, module);
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
        var response = JSON.parse(data);
        if (response.status_message != "Complete") {
            var messageText = response.status_message;
            if (response.status_message == "api_error") {
                if (response.status_message_text == "timeout") {
                    messageText = "Error: The API call timed out...";
                    self.processing = false;
                }
                else {
                    messageText = "Error: " + response.status_message_text;
                    self.processing = false;
                }
            }
            $(".video-wrapper").hide();
            self.getTemplate("video-container-template","","",false, true);
            self.getTemplate("highcharts-template","",messageText,false, false);
        }
        else {
            self.resetElements();
            if (module != "examples") {
                if(self.showUploadedVideo) {
                    self.resetVideoUI();
                    $(".video-wrapper").show();
                }
                else {
                    self.getTemplate("video-container-template","","Here's your video analysis!",false, false);
                }
            }
            else {
                $(".video-wrapper").show();
            }
            var str = JSON.stringify(JSON.parse(data), undefined, 4);
            $(".json-response").html("<pre>" + self.syntaxHighlight(str) + "</pre>");
            $("#highcharts-titles, #highcharts-containers").show();
            $("#highcharts-containers").empty();
            highchartsApp.parsedData = JSON.stringify(JSON.parse(data).frames);
            highchartsApp.autoscale = false;
            highchartsApp.displayData();
            $(".ui-buttons-mask").hide();
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
        $("#highcharts-titles, #highcharts-containers").hide();
        $(".face-overlay").hide();
        $(".json-title").hide();
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
}



