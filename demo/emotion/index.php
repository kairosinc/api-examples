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
    <title>Kairos Emotion Demo</title>  
    <meta name="viewport" content="width=device-width, initial-scale=1"> 
    <link href="../images/favicon.ico" rel="shortcut icon" type="image/vnd.microsoft.icon" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <link rel="stylesheet" href="../css/fonts.css">
    <link rel="stylesheet" href="../css/main.css">
    <link rel="stylesheet" href="css/emotion.css">
    <link rel="stylesheet" href="css/emotion-mediaqueries.css">
</head>
<body>
    <div class="main-container container">
        <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-6 main-video-container">
                <div class="video-wrapper">
                    <video id="video" width="100%" mediaId="video_1" src="https://media.kairos.com/demo/emotion/videos/video_1.mp4" muted  playsinline></video>
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
                <div class="display-image-container"></div>
                <div class="canvas-container-image"></div>
                <div class="template-background"></div>
                <div class="video-container-template"></div>
            </div>
            <div class="col-xs-12 col-sm-12 col-md-6 highcharts-container emotion">
                <div class="highcharts-menu">
                    <a href="" class="show-json">SHOW JSON</a>
                    <div class="autoscale-checkbox"><input type="checkbox" id="autoscale" /> Autoscale</div>
                    <div class="featurepoints-checkbox"><input type="checkbox" id="featurepoints" checked /> Featurepoints</div>
                </div>
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
            <div class="col-xs-12 col-sm-12 col-md-6 json-response-container emotion">
                <a href="" class="hide-json">HIDE JSON</a>
                <button class="copy-json-button btn btn-primary" data-clipboard-action="copy" data-clipboard-target=".json-response">COPY</button>
                <div class="json-response"><pre></pre></div>
                <div class="json-template"></div>
            </div>
        </div>
        <div class="row options-panel col-md-12">
            <div class="col-xs-12 col-sm-6 col-md-6">
                <h4>Options</h4>
                <div class="form-group">
                    <label class="control-label" for="optionPollTimeout">Poll Timeout:</label><span class="prompt">Time allowed for the demo to poll for a response once a Media ID is returned (in seconds)</span>
                    <input class="form-control" type="text" name="optionPollTimeout" id="optionPollTimeout"><span class="option-error"></span>
                    <div class="polltimeout-slider"></div>
                </div>
                <div class="polling-display">Polling: <span></span></div>
            </div>
        </div>
        <div class="row ui-buttons">
            <div class="webcam col-xs-6 col-sm-6 col-md-6">
                <button class="webcam-button btn btn-kairos">WEBCAM</button>
            </div>
            <div class="upload col-xs-6 col-sm-6 col-md-6">
                <form method="post" enctype="multipart/form-data" id="mediaUploadForm"> 
                    <div class="upload-button btn btn-kairos">UPLOAD<input type="file" id="upload" name="upload"></div>
                </form>
                <div class="upload-error"></div>
            </div>
            <div class="url col-xs-6 col-sm-8 col-md-8">
                <input type="text" class="url-from-web" value="URL from the web" />
                <div class="url-error"></div>
            </div>
            <div class="submit col-xs-6 col-sm-4 col-md-4">
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <script src="https://code.highcharts.com/4.2.3/highcharts.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.12/clipboard.min.js"></script>
    

    <!-- custom libraries -->
    <script src="../js/utils.js"></script>
    <script src="js/MediaStreamRecorder.js"></script>
    <!-- for Edige/FF/Chrome/Opera/etc. getUserMedia support -->
    <script src="https://cdn.WebRTC-Experiment.com/gumadapter.js"></script>
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

