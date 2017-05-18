# Emotion Demo
## What it does
The Emotion Demo showcases the Kairos Emotion API by giving the user four methods for analyzing human emotions in a video stream.  In each method, video data is passed to the API, which returns a JSON object with frame by frame emotional values ranging from 1 to 100.  By implementing area graphs, the data is displayed visually to the user.

View the app here: https://demo.kairos.com/emotion

## Running the App
The Emotion API demo app must be hosted, or run locally using a solution stack such as MAMP, WAMP, LAMP or XAMPP.

The app is basically a single page application, which is viewed at index.php.

The Emotion API demo app is comprised of three modules:

* Examples Module
* Webcam Module
* Upload Module
* URL Module

---

## Examples module

Two pre-processed video examples and one pre-processed still image are presented to the user.  

![Examples](/demo/emotion/docs/examples.png?raw=true)

Upon clicking one of the thumbnails, a GET request is made to the Kairos API with the ID of the selected media using the following endpoint:
https://api.kairos.com/v2/media/{media_id} 

To accomplish this, an AJAX script in the `emoDemoApp.js` file POSTS to process.php.  This file uses PHP cURL functionality to make a GET request.  curl_exec executes the cURL script, and the JSON response is sent back asynchronously to the `emoDemoApp.js` object.  The postProcessingLayout() function formats the JSON response for viewing and sends the JSON data to `highchartsApp.js`.
<a name="highcharts"></a>

### Highcharts
`highchartsApp.js` compliles the response data, and creates a dataset for each emotion in the JSON response.  The script loops through these datasets, compiling the x-axis, y-axis, and toolip parameters for each emotion.  In addition, all of the emotion charts are synchronized so that the metrics can be viewed in a single tooltip.  This data is then rendered on the screen inside the `#highcharts-wrapper` div.  

![Highcharts Graph](/demo/emotion/docs//graph.png?raw=true)

The colors for the indivdual emotion charts are found inside `config.php`.

### Video display
At the same time that the highcharts graph is created, the selected video is rendered in an HTML5 tag inside the `#selected-video` div.  The example videos are hosted on S3:
https://media.kairos.com/emodemo/videos/{video}.mp4

Tools are provided so that the user can play, pause or scrub the video.  

![Video Controls](/demo/emotion/docs/video_controls.png?raw=true)

These video functions are found in the `videoPlayer.js` object.  When any of these interactions are detected, a white curtain moves across the highcharts graph, showing the user where on the graph the video is currently playing.

### Feature Points
49 facial feature points are identified in the analysis, and these points are returned in the JSON object by adding landmarks=1 to the URL used for posting to the API.  The postProcessingLayout() function sends the JSON data with the feature points to `featurePointAnimation.js` where they are drawn on a Canvas panel which is positioned over the top of the video or image.  As the video plays, these feature points animate with the video. 

![Feature Points](/demo/emotion/docs/feature_points.png?raw=true)

<a name="json-display"></a>
### JSON display

The JSON object for each of the modules is displayed by clicking SHOW JSON in the Highcharts graph view.  
![JSON Display](/demo/emotion/docs/json_display.png?raw=true)

The name/value pairs in the JSON object are color-coded using the syntaxHighlight() function in `emoDemoApp.js`.  The colors are set in emotion.css (`#json-container` response blocks).  A COPY button is provided, which allows the user to copy the JSON response to the clipboard.

---
## Webcam Module
The webcam module uses the built-in web camera on the user's device.  A 10 second video is captured from the webcam, is sent to the Kairos API, and an emotional analysis of the video is returned.

The process is initiated by clicking WEBCAM link is clicked, which starts a 10 second webcam capture.  The app counts down from 10 until 1, when the capture is complete.

![Webcam Capture](/demo/emotion/docs/webcam_capture.png?raw=true)

When the WEBCAM button is clicked, the captureUserMedia() function in the `emoDemoApp.js` object is called, which engages the getUserMedia API.  On success, a callback function (`onMediaSuccess`) is fired, which contains the video stream from the webcam.  Subsequently, the `webcamVideo` variable is set, which references the HTML5 `#webcam-video` tag, and its source is set to this video stream.  After the play() function is applied to `webcamVideo`, a mediaRecorder object is instantiated, leveraging the methods inside `MediaStreamRecorder.js`. On mediaRecorder.start(), the webcam capture begins.  When the creation of the BLOB object containing the video is complete, processVideo() is called in `emoDemoApp.js` which POSTS to `process.php` asynchronously using AJAX.  The file is uploaded to the /media/ directory, and a PHP cURL POST request is made to the Kairos API, using the following endpoint:
https://api.kairos.com/v2/media?source={mediaPath)&landmarks=1&timeout=1

After a response is received, this file is deleted.
The timeout is set to 1 so that a response can be retrieved as quickly as possible. 
<a name="polling"></a>
### Polling the API
If a successful reponse is received from the POST request to the Kairos API, it takes the following form:
```
{
    "id": "{media_id}",
    "status_code": "1",
    "status_message": "In Progress"
}
```
At this point, the analysis of the emotional data in the video is still in progress.  In order to retrieve the completed analysis, the pollApi() function in `emoDemoApp.js` is used. Using AJAX, a POST containing the media ID is sent at regular intervals to `process.php` which makes a GET request with PHP cURL until it receives one of the following responses:
* "status_code": 4,  "status_message": "Complete", or
* "status_code": 3,  "status_message": "Failed", or
* the polling function times out.  

A message is rendered to the user if pollApi() receives status_code 3 or if a timeout is reached.

Otherwise, the postProcessingLayout() function sends the JSON data to `highchartsApp.js`. 

See [Highcharts](#highcharts)

The corresponding JSON display is also rendered.

See [JSON display](#json-display)

---
## Upload Module

Clicking the UPLOAD link opens the upload dialog on the user's local system.

![Upload Dialog](/demo/emotion/docs/upload_dialog.png?raw=true)

When a file is selected, the form is posted asynchronously to `form-post.php`.  A PHP cURL POST request is made to the Kairos API with the uploaded file, using the following endpoint:
https://api.kairos.com/v2/media?source={uploaded_file)&landmarks=1&timeout=1

The timeout is set to 1 so that a response can be retrieved as quickly as possible.

When a response is received, the pollApi() function in `emoDemoApp.js` is called.
See [Polling the API](#polling)

The pollApi() response in turn calls the postProcessingLayout() function, which sends the JSON data to `highchartsApp.js`. 

See [Highcharts](#highcharts)

The corresponding JSON display is also rendered.

See [JSON display](#json-display)

---

## URL Module

The user can enter a video URL from the web.

![URL from the Web](/demo/emotion/docs/url_from_the_web.png?raw=true)

When a URL is entered, the URL source is posted asynchronously to `process.php`.  A PHP cURL POST request is made to the Kairos API with the uploaded file, using the following endpoint:
https://api.kairos.com/v2/media?source={uploaded_file)&landmarks=1&timeout=1

The timeout is set to 1 so that a response can be retrieved as quickly as possible.

When a response is received, the pollApi() function in `emoDemoApp.js` is called.
See [Polling the API](#polling)

The pollApi() response in turn calls the postProcessingLayout() function, which sends the JSON data to `highchartsApp.js`. 

See [Highcharts](#highcharts)

The corresponding JSON display is also rendered.

See [JSON display](#json-display)

---
## User Interactions

The functionality for a number of user interactions is contained within the `emotionUi.js` file.  Among them are:

* Show/hide Highcharts tooltip
* Functionality for Copy to Clipboard button
* Show/hide JSON response
* Toggle autoscale in Highcharts, depending on Autoscale checkbox
* Click functionality for Example thumbnails
* Webcam button functionality
* Upload functionality
* URL from web functionality

---

## Option Panel

If `?option-panel=yes` is added to the URL of the demo, a panel is revealed underneath the example video containing a slider/input box where the user can enter the time allowed for the demo to poll for a response once a Media ID is returned (in seconds).  See the docs for detailed information on these arguments: http://kairos.com/docs/api/

---
## Installation

First, enter your personal keys into the docker-compose.yml file:

    version: '2'
    services:
      demo:
        image: demo
        expose:
          - "8080"
        ports:
          - "8080:80"
        environment:
          STAGE: prod
          AWS_S3_REGION: "your-aws-s3-region"
          AWS_S3_UPLOAD_BUCKET: "your-aws-upload-bucket"
          APP_ID: "your-app-id"
          APP_KEY: "your-app-key"
          API_URL: "https://api.kairos.com"
          API_TIMEOUT: "10" 
          POLL_TIMEOUT: "300"
          DEMO1_ID: "leave-blank"
          DEMO_SECRET_KEY: "leave-blank"
          XDEBUG: "true"
          XDEBUG_CONFIG: "remote_host=10.254.254.254"
        volumes:
          - ./demo:/var/www/app/demo
          
The AWS keys aren't necessary unless you're running the Facerace demo.  For more information about using XDEBUG with PHPStorm, go to: https://gist.github.com/coleca/c227543fbed515e4eb4c058a7455c581


Then, cd to your demo repo, and run:
```
make build

make run
```
You will then be able to access the UI at http://localhost:8080 (if running using Docker for Mac or Docker for Windows)

To stop the Docker container:

```
docker stop $(docker ps -q)
```

Note: This will stop all running containers not just this one

---
## Environment Variables

* APP_ID - Application ID
* APP_KEY - Application Key
* API_URL - URL of the API server 
* DEMO1_ID - Media ID of the first preprocessed video 
* DEMO_ENV - Environment (dev, prod, stage)

---

## Dependencies
Javascript libraries hosted by content delivery networks:
* jquery.js
* jquery-ui.js
* bootstrap.js
* highcharts.js
* handlebars.js (used for error message display)
* clipboard.js (used for copy function in JSON display)
* gumadapter.js

Note: These dependencies can be also be saved locally.

For WebRTC video processing, MediaStreamRecorder.js is used.
It is open-sourced at https://github.com/streamproc/MediaStreamRecorder.
This library has been modified slightly by Kairos.

The following custom javascript libraries are used:
* emoDemoApp.js - javascript object responsible for primary app functionality
* videoPlayer.js - javascript object responsible for video UI on result view
* highchartsApp.js - javascript object containing custom functions for integration with Highcharts.js
* featurePointAnimation.js - javascript object which draws feature points onto a Canvas element which is positioned over the video or image
* featurePoints.js - a javascript array containing the 49 feature points
* emotionUi.js - a collection of javascript functions to enable user interactions
* utils.js - a collection of javascript methods for global use (canvas drawing, exif data, URL and JSON validation, aspect ratio calculations, retrival of data from image, mimetype checking, image rotation, and others)

The following custom php files are used:
* process.php - processes calls to Kairos API (for examples and webcam modules)
* form-post.php - processes form posts to Kairos API (for upload module)
* get-file-data.php - retrieves file information for validation (used in utils.js to check mimetype)

