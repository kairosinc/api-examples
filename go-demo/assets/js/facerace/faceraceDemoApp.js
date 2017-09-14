//------------------------------------
// faceraceDemoApp.js
// javascript object responsible for primary app functionality
// dependencies: jquery.js, jquery-ui, facerace.php
// created: March 2017
// last modified: April 2017 Steve Rucker
// author: Josue Rodriguez
//------------------------------------

var faceraceDemoApp = faceraceDemoApp || {};
faceraceDemoApp =  {
    //------------------------------------
    // INITIALIZE - index.php
    //------------------------------------
    init: function (config) {
        this.setElementDimensions();
        this.config = config;
        this.apiCredentials = config.apiCredentials;
        if (this.apiCredentials){
            this.uploadModule();
        }
        else {
            $("#diversity_image").hide();
            $("#waiting").show();
            $(".image-container-template").show();
            this.getTemplate("image-container-template","Error","API credentials not provided.","",false);
        }
    },
        
    //------------------------------------
    // FILE UPLOAD PROCESSING
    //------------------------------------
    uploadModule: function () { 
        var self = this;  
        $('#mediaUploadForm').submit(function() { 
            $(".image-container-template").show();

            // fake processing messages
            setTimeout(function(){
                var msg = ""
                msg += "<div class='spinner-message-container'>";
                msg += "<div class='processing-spinner'></div>";
                msg += "<div class='message-container'>Uploading your Image...</div>";
                msg += "</div>";
                $(".image-container-template").append(msg);
            },700);
   
            setTimeout(function(){
                $(".image-container-template").empty();
                var msg = ""
                msg += "<div class='spinner-message-container'>";
                msg += "<div class='processing-spinner'></div>";
                msg += "<div class='message-container'>Analyzing your Image...</div>";
                msg += "</div>";
                $(".image-container-template").append(msg);
            },1000);

            var input = $("#upload")[0];
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                setTimeout(function(){
                    $(".image-container-template").empty();
                    var msg = ""
                    msg += "<div class='spinner-message-container'>";
                    msg += "<div class='message-container'>The File APIs are not fully supported in this browser.</div>";
                    msg += "</div>";
                    $(".image-container-template").append(msg);
                },1000);
                return false;
            } 

            var fileSizeAllowed = false;
            var fsize = input.files[0].size; 
            if(fsize <= self.config.uploadFileSizeImage) { 
                fileSizeAllowed = true;
            }
            if (!fileSizeAllowed) {
                setTimeout(function(){
                    $(".image-container-template").empty();
                    var msg = ""
                    msg += "<div class='spinner-message-container'>";
                    msg += "<div class='message-container'>File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeImage/1000000 + "MB</div>";
                    msg += "</div>";
                    $(".image-container-template").append(msg);
                },1000);
                return false;
            }
            else if (!input) {
                setTimeout(function(){
                    $(".image-container-template").empty();
                    var msg = ""
                    msg += "<div class='spinner-message-container'>";
                    msg += "<div class='message-container'>Couldn't find the file input element.</div>";
                    msg += "</div>";
                    $(".image-container-template").append(msg);
                },1000);
                return false;
            }
            else if (!input.files) {
                setTimeout(function(){
                    $(".image-container-template").empty();
                    var msg = ""
                    msg += "<div class='spinner-message-container'>";
                    msg += "<div class='message-container'>This browser doesn't seem to support the `files` property of file inputs.</div>";
                    msg += "</div>";
                    $(".image-container-template").append(msg);
                },1000);
                return false;
            }
            else {
                setTimeout(function(){
                    $(".image-container-template").empty();
                    var msg = ""
                    msg += "<div class='spinner-message-container'>";
                    msg += "<div class='processing-spinner'></div>";
                    msg += "<div class='message-container'>Preparing your Results...</div>";
                    msg += "</div>";
                    $(".image-container-template").append(msg);
                },700);
                
                var img = new Image();
                var file = input.files[0];
                var fileType = file.type;
                var fileTypeAllowed = false;
                $(self.config.uploadFileTypesImage).each(function(idx, ft) {
                    if(ft == fileType) { 
                        fileTypeAllowed = true;
                    }
                });
                if (!fileTypeAllowed) {
                    setTimeout(function(){
                        $(".image-container-template").empty();
                        var msg = ""
                        msg += "<div class='spinner-message-container'>";
                        msg += "<div class='message-container'>Wrong file type.  Must be jpg or png.</div>";
                        msg += "</div>";
                        $(".image-container-template").append(msg);
                    },1000);
                }
                else {
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
                                    $("#upload").val("");
                                    var data = {};
                                    imgObj = { 
                                        "image"   : utils.parseImageData(imageData),
                                        "minHeadScale" : ".015"
                                    };
                                    data.imgObj = JSON.stringify(imgObj);
                                    data.fileType = fileType;
                                    //console.log(data)
                                    $.ajax({
                                        type: 'POST',
                                        url: 'facerace/send-to-api',
                                        data: data,
                                        dataType: 'text'
                                    }).done(function(data){
                                        //console.log(data)
                                        var response = JSON.parse(data);

                                        window.__response = response;
                                        if (response.Errors) {
                                            setTimeout(function(){
                                                if (!faceraceDemoApp.mimetypeError) {
                                                    $(".image-container-template").empty();
                                                    var msg = ""
                                                    msg += "<div class='spinner-message-container'>";
                                                    msg += "<div class='message-container'>Error: " + utils.toTitleCase(response.Errors[0].Message) + "</div>";
                                                    msg += "</div>";
                                                    $(".image-container-template").append(msg);
                                                    $("#upload_text").text('TRY ANOTHER PHOTO'); 
                                                }
                                            },1000);
                                            
                                            return false;
                                        }
                                        else {
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
                    
            } 
            // });
            return false; 
        });
    },
    
    //------------------------------------
    // CALLBACK FROM API
    //------------------------------------
    apiCallback: function(data) {
        var self = this;
        $("#previewImage").hide();
        $(".spinner-message-container").hide();
        $(".ui-buttons-mask").hide();
        
        var response = JSON.parse(data);
        window.__response = response;

        if (response.images) {
            if (response.s3_image_url) {
                var updated_image = $('<img>', {
                    src: response.s3_image_url,
                    onload: function(){
                        $("#waiting").hide();
                        $('#diversity_image').show();
                        $('#social_plugins').show();

                        window.___api_response = response.s3_image_url;
                        generateDetailedFacebookShare(response.s3_image_url);
                        generateTwitterShare(response.s3_image_url);
                    }
                });

                $('#diversity_image').html(updated_image);
            }
            else {
                setTimeout(function(){
                    $(".image-container-template").empty();
                    var msg = ""
                    msg += "<div class='spinner-message-container'>";
                    msg += "<div class='message-container'>No S3 image URL.</div>";
                    msg += "</div>";
                    $(".image-container-template").append(msg);
                    $(".image-container-template").show();
                },1000);
            }
        }
        else {
            setTimeout(function(){
                $(".image-container-template").empty();
                var msg = ""
                msg += "<div class='spinner-message-container'>";
                msg += "<div class='message-container'>No faces were detected.</div>";
                msg += "</div>";
                $(".image-container-template").append(msg);
                $(".image-container-template").show();
            },1000);
        }

        $("#upload_text").text('TRY ANOTHER PHOTO');
    },
    resetElements: function() {
        $(".spinner-message-container")
        .empty()
        .show();
    },
    setElementDimensions: function () {
        var self = this;
        if ($(window).width() <= 470) {
            var elemSize = $(window).width() - 30;
            $(".image-container-template")
                .width(elemSize)
                .height(elemSize);
        }
        else {
            $(".image-container-template")
                .width(440)
                .height(440);
        }
    } 
};