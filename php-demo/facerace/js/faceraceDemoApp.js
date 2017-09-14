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
        var fileTypeList = [];
        $(this.config.uploadFileTypesImage).each(function(idx, fileType) {
            fileTypeList.push(" ." + fileType.toString().split("/")[1])
        }); 
        this.fileTypeList = fileTypeList;
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
                self.getTemplate("image-container-template","","Uploading your Image...",true,false);
            },700);

            setTimeout(function(){
                self.getTemplate("image-container-template","","Analyzing your Image...",true,false);
            },1000);
            

            var input = $("#upload")[0];
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                setTimeout(function(){
                    self.getTemplate("image-container-template","Error","The File APIs are not fully supported in this browser.","",false);
                },1000);
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
                setTimeout(function(){
                    $(".image-container-template").show();
                    self.getTemplate("image-container-template","","",false,true);
                    var filesizeMsg = "File size is too large.  Must be less than or equal to " + self.config.uploadFileSizeImage/1000000 + "MB";
                    self.getTemplate("image-container-template","Error",filesizeMsg,"",false);
                },1000);
                return false;
            }
            else if (!input) {
                setTimeout(function(){
                    $(".image-container-template").show();
                    self.getTemplate("image-container-template","Error","Couldn't find the file input element.","",false);
                },1000);
                return false;
            }
            else if (!input.files) {
                setTimeout(function(){
                    $(".image-container-template").show();
                    self.getTemplate("image-container-template","Error","This browser doesn't seem to support the `files` property of file inputs.","",false);
                },1000);
                $(".image-container-template").show();
                return false;
            }
            else {
                setTimeout(function(){
                    self.getTemplate("image-container-template","","Preparing your Results...",true,false);
                },700);
                
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
                                $("#upload").val("");
                                var data = {};
                                imgObj = { 
                                    "image"   : utils.parseImageData(imageData),
                                    "minHeadScale" : ".015"
                                };
                                data.imgObj = JSON.stringify(imgObj);
                                $.ajax({
                                    type: 'POST',
                                    url: 'facerace.php',
                                    data: data,
                                    dataType: 'text'
                                }).done(function(data){
                                    var response = JSON.parse(data);

                                    window.__response = response;

                                    if (response.Errors) {
                                        setTimeout(function(){
                                            if (!faceraceDemoApp.mimetypeError) {
                                                self.getTemplate("image-container-template","Error: " + utils.toTitleCase(response.Errors[0].Message),"",false);
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

                        updateUrlWithSha(response.s3_image_url);
                        generateDetailedFacebookShare(response.s3_image_url);
                        generateTwitterShare(response.s3_image_url);
                    }
                });

                $('#diversity_image').html(updated_image);
            }
            else {
                self.getTemplate("image-container-template","Error","No S3 image URL.",false);
                $(".main-image-container .spinner-message-container").show();
            }
        }
        else {
            self.getTemplate("image-container-template","Error","No faces were detected.",false);
            $(".main-image-container .spinner-message-container").show();
        }

        $("#upload_text").text('TRY ANOTHER PHOTO');
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
        $(".spinner-message-container")
        .empty()
        .show();
    },
    showMimetypeError: function () {
        var self = faceraceDemoApp;
        setTimeout(function(){
            $(".image-container-template").show();
            var filetypeMsg = "Wrong file type.  Must be" + self.fileTypeList;
            self.getTemplate("image-container-template","Error",filetypeMsg,"",false);
            $("#upload_text").text('TRY ANOTHER PHOTO');
            self.mimetypeError = true;
        },1000);
        return false;
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