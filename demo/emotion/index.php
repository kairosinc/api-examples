<?php
    //------------------------------------
    // Emotion Demo Module
    // created: March 2016
    // last modified: October 2016
    // author: Steve Rucker
    //------------------------------------

    $configs = include('../config.php');
?>
<html>
<html lang="en">

<head>
    <title>Kairos Detect Demo</title>   
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
    <link rel="stylesheet" href="../css/fonts.css">
    <link rel="stylesheet" href="../css/main.css">
    <link rel="stylesheet" href="css/emotion.css">
</head>
<body>
    <div class="main-container container">
        <div class="row">
            <div class="col-md-6 main-video-container">
                <div class="video-wrapper">
                    <video id="video" width="100%" mediaId="video_1" src="https://media.kairos.com/demo/emotion/videos/video_1.mp4" muted></video>
                    <div class="video-controls">
                        <a href="/" class="play" id="play-pause"></a>
                        <div id="progress">  
                            <div id="progress-holder">  
                                <div id="progress-bar">
                                    <span id="progress-scrubber"></span> 
                                </div>
                            </div>  
                        </div> 
                        <div id="progress-time">00.00</div>
                    </div>
                    <div class="canvas-container-video"></div>
                </div>
                <div class="webcam-video-container">
                    <div class="face-overlay"></div>
                    <div class="webcam-counter"></div>
                </div>
                <img class="show-image" src="">
                <div class="canvas-container-image"></div>
                <div class="template-background"></div>
                <div class="video-container-template"></div>
            </div>
            <div class="col-md-6 highcharts-container">
                <a href="" class="show-json">SHOW JSON</a>
                <div class="autoscale-checkbox"><input type="checkbox" id="autoscale" /> Autoscale</div>
                <div class="featurepoints-checkbox"><input type="checkbox" id="featurepoints" checked /> Featurepoints</div>
                <div class="highcharts-wrapper">
                    <div id="highcharts-curtain-wrapper">
                        <div id="highcharts-curtain">
                            <div class="gridlines"></div>
                            <div class="gridlines"></div>
                            <div class="gridlines"></div>
                            <div class="gridlines"></div>
                            <div class="gridlines"></div>
                            <div class="gridlines"></div>
                        </div>
                    </div>
                    <div id="highcharts-titles"></div>
                    <div id="highcharts-containers"></div>
                </div>
                <div id="highcharts-container-image"></div>
                <div class="highcharts-template"></div>
            </div>
            <div class="col-md-6 json-response-container">
                <a href="" class="hide-json">HIDE JSON</a>
                <button class="copy-json-button btn btn-primary" data-clipboard-action="copy" data-clipboard-target=".json-response">COPY</button>
                <div class="json-response"><pre></pre></div>
                <div class="json-template"></div>
            </div>
        </div>
        <div class="row ui-buttons">
            <div class="webcam col-md-6">
                <button class="webcam-button btn btn-kairos">WEBCAM</button>
            </div>
            <div class="upload col-md-6">
                <form method="post" enctype="multipart/form-data" id="mediaUploadForm"> 
                    <div class="upload-button btn btn-kairos">UPLOAD<input type="file" id="upload" name="upload"></div>
                </form>
                <div class="upload-error"></div>
            </div>
            <div class="url col-md-8">
                <input type="text" class="url-from-web" autofocus="autofocus" value="URL from the web" />
                <div class="url-error"></div>
            </div>
            <div class="submit col-md-4">
                <button class="submit-button btn btn-kairos">SUBMIT</button>
            </div>
            <div class="ui-buttons-mask"></div>
        </div>
    </div>  

    <script id="video-container-template" type="text/x-handlebars-template">
        <div class="spinner-message-container">
            {{#if spinner}}
              <div class="processing-spinner"></div>
            {{/if}}
            {{#if sadFace}}
              <div class="sad-face"></div>
            {{/if}}
            <div class="message-container strong">{{message1}}</div>
            <div class="message-container">{{message2}}</div>
        </div>
    </script>
    <script id="highcharts-template" type="text/x-handlebars-template">
        <div class="spinner-message-container">
            {{#if spinner}}
              <div class="processing-spinner-transparent"></div>
            {{/if}}
            {{#if sadFace}}
              <div class="sad-face"></div>
            {{/if}}
            <div class="message-container strong">{{message1}}</div>
            <div class="message-container">{{message2}}</div>
        </div>
        <div class="response-box-container">
        {{#if gender}}
            <div class="response-box-gender"></div>
        {{/if}}
        {{#if age}}
            <div class="response-box-age"></div>
        {{/if}}
        </div>
    </script>
    <script id="json-template" type="text/x-handlebars-template">
        <div class="spinner-message-container">
            <div class="message-container strong">{{message1}}</div>
            <div class="message-container">{{message2}}</div>
        </div>
    </script>
            

    <!-- hosted libraries -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="https://code.jquery.com/ui/1.10.2/jquery-ui.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <script src="https://code.highcharts.com/4.2.2/highcharts.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.12/clipboard.min.js"></script>
    <!-- for Edige/FF/Chrome/Opera/etc. getUserMedia support -->
    <script src="https://cdn.WebRTC-Experiment.com/gumadapter.js"></script>

    <!-- custom libraries -->
    <script src="js/MediaStreamRecorder.js"></script>
    <script src="js/featurePoints.js"></script>
    <script src="js/emoDemoApp.js"></script>
    <script src="js/featurePointAnimation.js"></script>
    <script src="js/highchartsApp.js"></script>
    <script src="js/highchartsAppPhoto.js"></script>
    <script src="js/videoPlayer.js"></script>
    <script src="js/emotionUi.js"></script>

    <!-- initialize custom libraries if API credentials are valid -->
    <?php
        if (
            (defined("APP_ID") && APP_ID != "") &&
            (defined("APP_KEY") && APP_KEY != "") &&
            (defined("API_URL") && API_URL != "")
        ) {
    ?>
        <script>
            emoDemoApp.init({
                "uploadFileTypesEmotion":<?php echo $configs["uploadFileTypesEmotion"] ?>,
                "uploadFileSizeVideo":<?php echo $configs["uploadFileSizeVideo"] ?>,
                "pollTimeout":<?php echo $configs["pollTimeout"] ?>,
                "mediaPath": '<?php echo $configs["mediaPath"] ?>',
                "demoMedia":<?php print_r(json_encode($configs["demoMedia"]) ) ?>,
                "apiCredentials":true
            });
            videoPlayer.init();
            highchartsApp.init({
                "colors":<?php echo $configs["highchartsColors"] ?>
            });
            highchartsAppPhoto.init({
                "colors":<?php echo $configs["highchartsColors"] ?>
            });
        </script>
    <?php
        }
        else {
    ?>
        <script>
            emoDemoApp.init({
                "apiCredentials":false
            });
        </script>
    <?php  
        }
    ?>

</body>

</html>

