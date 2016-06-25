<?php
    //------------------------------------
    // Emotion Demo Module
    // created: March 2016
    // modified: June 2016
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
                    <video id="video" width="100%" videoId="demo1" src="https://media.kairos.com/emodemo/videos/demo1.mp4" muted></video>
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
                </div>
                <div class="webcam-video-container">
                    <div class="face-overlay"></div>
                    <div class="webcam-counter"></div>
                </div>
                <div class="template-background"></div>
                <div class="video-container-template"></div>
            </div>
            <div class="col-md-6 highcharts-container">
                <a href="" class="show-json">SHOW JSON</a>
                <div class="autoscale-checkbox"><input type="checkbox" id="autoscale" /> Autoscale</div>
                <div class="highcharts-wrapper">
                    <div id="highcharts-curtain-wrapper">
                        <div id="highcharts-curtain">
                            <div class="gridlines"></div>
                            <div class="gridlines"></div>
                            <div class="gridlines"></div>
                            <div class="gridlines"></div>
                        </div>
                    </div>
                    <div id="highcharts-titles"></div>
                    <div id="highcharts-containers"></div>
                </div>
                <div class="highcharts-template"></div>
            </div>
            <div class="col-md-6 json-response-container">
                <a href="" class="hide-json">HIDE JSON</a>
                <button class="copy-json-button btn btn-primary" data-clipboard-action="copy" data-clipboard-target=".json-response">COPY</button>
                <div class="json-response"><pre></pre></div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12 thumbnails container">
                <a href="demo1" class="video-thumbnail">
                    <img src="https://media.kairos.com/emodemo/thumbnails/demo1_thumbnail.png" />
                </a>
                <a href="demo2" class="video-thumbnail">
                    <img src="https://media.kairos.com/emodemo/thumbnails/demo2_thumbnail.png" />
                </a>
                <a href="demo3" class="video-thumbnail">
                    <img src="https://media.kairos.com/emodemo/thumbnails/demo3_thumbnail.png" />
                </a>
                <a href="demo1" class="video-thumbnail">
                    <img src="https://media.kairos.com/emodemo/thumbnails/demo1_thumbnail.png" />
                </a>
                <a href="demo1" class="video-thumbnail">
                    <img src="https://media.kairos.com/emodemo/thumbnails/demo1_thumbnail.png" />
                </a>
            </div>
        </div>
        <div class="row ui-buttons">
            <div class="webcam col-md-6">
                <button class="webcam-button btn btn-kairos">WEBCAM</button>
            </div>
            <div class="upload col-md-6">
                <form method="post" action="formPost.php" enctype="multipart/form-data" id="mediaUploadForm"> 
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
    </script>
            

   <!-- hosted libraries -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="https://code.jquery.com/ui/1.10.2/jquery-ui.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.form/3.51/jquery.form.min.js"></script>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js"></script>
    <!-- for Edige/FF/Chrome/Opera/etc. getUserMedia support -->
    <script src="../js/adapter.js"></script>
    <!-- for copy to clipboard functionality -->
    <script src="../js/clipboard.min.js"></script>
    <!-- custom libraries -->
    <script src="../js/MediaStreamRecorder.js"></script>
    <script src="js/emoDemoApp.js"></script>
    <script src="js/highchartsApp.js"></script>
    <script src="js/videoPlayer.js"></script>
    <script src="js/emotionUi.js"></script>
    <!-- initialize custom libraries -->
    <?php
        if (
            (defined("APP_ID") && APP_ID != "") &&
            (defined("APP_KEY") && APP_KEY != "") &&
            (defined("API_URL") && API_URL != "")
        ) {
    ?>
        <script>
            highchartsApp.init({
                "colors":<?php echo $configs["highchartsColors"] ?>, 
                "bkgColor":<?php echo $configs["highchartsBkgColor"] ?>
            });
            emoDemoApp.init({
                "uploadFileSize":<?php echo $configs["uploadFileSize"] ?>,
                "uploadFileTypesVideo":<?php echo $configs["uploadFileTypesVideo"] ?>,
                "pollTimeout":<?php echo $configs["pollTimeout"] ?>,
                "mediaPath": '<?php echo $configs["mediaPath"] ?>',
                "demoVideos":<?php print_r(json_encode($configs["demoVideos"]) ) ?>,
                "apiCredentials":true
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

