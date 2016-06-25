# API Examples

## What it does
This demo app showcases the Kairos Emotion API by giving the user three methods for analyzing human emotions in a video stream.  In each method, video data is passed to the API, which returns a JSON object with frame by frame emotional values ranging from 1 to 100.  By implementing area graphs, the data is displayed visually to the user.

View the app here: https://demo.kairos.com/emotion

## Running the App
The Emotion API demo app must be hosted, or run locally using a solution stack such as MAMP, WAMP or LAMP.

The app is basically a single page application, which is viewed at index.php.

The Emotion API demo app is comprised of three modules:

* Examples Module
* Webcam Module
* Upload Module

---

## Examples module

Three pre-processed video examples are presented to the user.  

![Three Examples](/docs/examples.png?raw=true)

Upon clicking one of the video thumbnails or the Analyze button, a GET request is made to the Kairos API with the ID of the selected video using the following endpoint:
https://api.kairos.com/media/{media_id} 

To accomplish this, an AJAX script in the `emoDemoApp.js` file POSTS to process.php.  This file uses PHP cURL functionality to make a GET request.  curl_exec executes the cURL script, and the JSON response is sent back asymchronously to the `emoDemoApp.js` object.  The postProcessingLayout() function modifies the page layout, and sends the response data in JSON form to `highchartsApp.js`.
<a name="highcharts"></a>

### Highcharts
`highchartsApp.js` compliles the response data, and creates a dataset for each emotion in the JSON response.  The script loops through these datasets, compiling the x-axis, y-axis, and toolip parameters for each emotion.  In addition, all of the emotion charts are synchronized so that the metrics can be viewed in a single tooltip.  This data is then rendered on the screen inside the `#highcharts-wrapper` div.  

![Highcharts Graph](/docs//graph.png?raw=true)

The colors for the indivdual emotion charts, along with the background color of the entire chart collection, are found inside `config.php`.

### Video display
At the same time that the highcharts graph is created, the selected video is rendered in an HTML5 tag inside the `#selected-video` div.  The example videos are hosted on S3:
https://media.kairos.com/emodemo/videos/{video}.mp4

Tools are provided so that the user can play, pause or scrub the video.  

![Video Display](/docs/video_controls.png?raw=true)

These video functions are found in the `videoPlayer.js` object.  When any of these interactions are detected, a white curtain moves across the highcharts graph, showing the user where on the graph the video is currently playing.
<a name="json-display"></a>
### JSON display

The JSON object for each of the modules is displayed underneath the Highcharts graph.  

![JSON Display](/docs/json_display.png?raw=true)

The name/value pairs in the JSON object are color-coded using the syntaxHighlight() function in `emoDemoApp.js`.  The colors are set in main.css (`#json-container` declaration blocks).  A Copy To Clipboard button is provided, which leverages `clipboard.js`.

---
## Webcam Module
The webcam module uses the built-in web camera on the user's device.  A 10 second video is captured from the webcam, is sent to the Kairos API, and an emotional analysis of the video is returned.

To start the process, the Webcam link is clicked, revealing instructional text and a graphic to help the user align their face properly for optimal video capture:

![Face Alignment Graphic](/docs/face_alignment.png?raw=true)

When the Start button is clicked, the captureUserMedia() function in the `emoDemoApp.js` object is called, which engages the getUserMedia API.  On success, a callback function (`onMediaSuccess`) is fired, which contains the video stream from the webcam.  Subsequently, the `webcamVideo` variable is set, which references the HTML5 `#webcam-video` tag, and its source is set to this video stream.  After the play() function is applied to `webcamVideo`, a mediaRecorder object is instantiated, leveraging the methods inside `MediaStreamRecorder.js`. On mediaRecorder.start(), the webcam capture begins.  When the creation of the BLOB object containing the video is complete, processVideo() is called in `emoDemoApp.js` which POSTS to `process.php` asynchronously using AJAX.  The file is uploaded to the /media/ directory, and a PHP cURL POST request is made to the Kairos API, using the following endpoint:
https://api.kairos.com/media?source={mediaPath)&timeout=1

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

Otherwise, the postProcessingLayout() function modifies the page layout, and sends the response data in JSON form to `highchartsApp.js`. 

See [Highcharts](#highcharts)

The corresponding JSON display is also rendered.

See [JSON display](#json-display)

---
## Upload Module

Clicking the Upload link presents the user with a simple file upload form.  

![Upload Form](/docs/file_upload.png?raw=true)

The form upload process leverages `jquery.form.js`.  This API provides several callbacks, as well as the method ajaxSubmit() which is used to submit the form asynchronously to `formPost.php`.  A PHP cURL POST request is made to the Kairos API with the uploaded file, using the following endpoint:
https://api.kairos.com/media?source={uploaded_file)&timeout=1

The timeout is set to 1 so that a response can be retrieved as quickly as possible.

When a response is received, the pollApi() function in `emoDemoApp.js` is called.
See [Polling the API](#polling)

The pollApi() response in turn calls the postProcessingLayout() function, which modifies the page layout, and sends the response data in JSON form to `highchartsApp.js`. 

See [Highcharts](#highcharts)

The corresponding JSON display is also rendered.

See [JSON display](#json-display)

---
## User Interactions

The functionality for a number of user interactions is contained within the `ui.js` file.  Among them are:
* Show/hide Highcharts tooltip
* Provide functionality for Copy to Clipboard button
* Add border and opacity to example thumbnails on hover
* Provide functionality for START OVER button
* Provide propoer layout for modules when corresponding links are clicked
* Show/hide example JSON (deprecated)
* Animate to Results view when RESULTS button is clicked
* Toggle autoscale in Highcharts, depending on Autoscale checkbox
* Clear webcam video when new webcam capture is selected
* Handlers for custom file upload button

---
## Installation

To build with Docker:

```
docker build -t user/demo .
```

To run with Docker:

```
docker run -d -p 8080:80 \
           -e APP_ID="xxxyyy" \
           -e APP_KEY="xxxyyy111" \
           -e API_URL="https://api.kairos.com" \
           -e DEMO1_ID="123456" \
           -e DEMO2_ID="456789" \
           -e DEMO3_ID="789123" \
           -e STAGE="prod" \
           user/demo
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
* DEMO2_ID - Media ID of the second preprocessed video
* DEMO3_ID - Media ID of the third preprocessed video
* STAGE - Environment (dev, prod, stage)

---

## Dependencies
Libraries hosted by content delivery networks:
* jquery.js
* jquery-ui.js
* bootstrap.js
* jquery.form.js
* highcharts.js

Note: These dependencies can be also be saved locally.

For WebRTC video processing, MediaStreamRecorder.js is used.
It is open-sourced at https://github.com/streamproc/MediaStreamRecorder.
This library has been modified slightly by Kairos.

The following licensed libraries are used:
* clipboard.js v1.5.10 Licensed MIT © Zeno Rocha
* adapter.js Copyright (c) 2014 The WebRTC project authors

The following custom javascript libraries are used:
* emoDemoApp.js - javascript object responsible for primary app functionality
* videoPlayer.js - javascript object responsible for video UI on result view
* highchartsApp.js - javascript object containing custom functions for integration with Highcharts.js
* ui.js - a collection of javascript functions to enable user interactions

The following custom php files are used:
* process.php - processes calls to Kairos API (for examples and webcam modules)
* formPost.php - processes form posts to Kairos API (for upload module)
