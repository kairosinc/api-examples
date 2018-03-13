# Emotion Demo
## What it does
The Emotion Demo showcases the Kairos Emotion API by giving the user four methods for analyzing human emotions in a video stream.  In each method, video data is passed to the API, which returns a JSON object with frame by frame emotional values ranging from 1 to 100.  By implementing area graphs, the data is displayed visually to the user.


---
## Running the App

See "Running the App" in the Python Demo README file: [Documentation](/python-demo/README.md)

You will be able to access the UI for the Emotion Demo at http://0.0.0.0:5000/emotion

The Emotion API demo app is comprised of four modules:

* Examples Module
* Webcam Module (not on Safari or mobile)
* Upload Module
* URL Module

---

<a name="examples"></a>
## Examples module

An example video is presented to the user, and an analysis begins immediately upon page render. 

In order to render the analysis of the example video, you must enter a demo1_id into the app.py file.  To get an ID for the example video, run this script at your command prompt:

`curl -v -X POST -H "app_id: {your app_id}" -H "app_key: {your app_key}" http://api.kairos.com/v2/media?source=https://media.kairos.com/python-demo/videos/video_1.mp4`

This should return something similar to this:

`{"id":"abcdefghijklmnopqrstuvwxyz","status_code":2,"status_message":"Analyzing"}`

Enter this id value into the demo1_id definition in the app.py file:

`demo1_id = "abcdefghijklmnopqrstuvwxyz"`

Your example video should now render an emotion analysis.

To accomplish this, an AJAX script in the `emoDemoApp.js` file POSTS to the route `/emotion/send-to-api` using Python Flask.  Using the demo1_id above, Python makes a GET request to the `/v2/media/` endpoint with the proper headers containing the user's Kairos app_id and api_key values.  The API response is sent to the `postProcessingLayout()` method, which formats the JSON response for viewing and sends the JSON data to `highchartsApp.js`.

<a name="highcharts"></a>
### Highcharts
`highchartsApp.js` compliles the response data, and creates a dataset for each emotion in the JSON response.  The script loops through these datasets, compiling the x-axis, y-axis, and toolip parameters for each emotion.  In addition, all of the emotion charts are synchronized so that the metrics can be viewed in a single tooltip.  This data is then rendered on the screen inside the `#highcharts-wrapper` div.  

![Highcharts Graph](/python-demo/static/docs/emotion/graph.png?raw=true)

The colors for the indivdual emotion charts are found inside `config.php`.

### Video display
At the same time that the highcharts graph is created, the selected video is rendered in an HTML5 tag inside the `#selected-video` div.  

Tools are provided so that the user can play, pause or scrub the video.  

![Video Controls](/python-demo/static/docs/emotion/video_controls.png?raw=true)

These video functions are found in the `videoPlayer.js` object.  When any of these interactions are detected, a white curtain moves across the highcharts graph, showing the user where on the graph the video is currently playing.

### Feature Points
49 facial feature points are identified in the analysis, and these points are returned in the JSON object by adding landmarks=1 to the URL used for posting to the API.  The postProcessingLayout() function sends the JSON data with the feature points to `featurePointAnimation.js` where they are drawn on a Canvas panel which is positioned over the top of the video or image.  As the video plays, these feature points animate with the video. 

![Feature Points](/python-demo/static/docs/emotion/feature_points.png?raw=true)

<a name="json-display"></a>
### JSON display

The JSON object for each of the modules is displayed by clicking SHOW JSON in the Highcharts graph view.  
![JSON Display](/python-demo/static/docs/emotion/json_display.png?raw=true)

The name/value pairs in the JSON object are color-coded using the syntaxHighlight() function in `emoDemoApp.js`.  The colors are set in emotion.css (`#json-container` response blocks).  A COPY button is provided, which allows the user to copy the JSON response to the clipboard.

---
## Webcam Module

NOTE:

The webcam functionality requires that your site is secure (https).  In order to run your local install using https, you will need to generate a certificate and a key.  To to this, run this command:

```openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365```

Follow the prompts, and this will generate two files: `cert.pem` and `key.pem`.  These files are used so that the app will spin up a secure browser.  If you want to run in ssl, use this script in the `app.py` file:

`if __name__ == "__main__":
    app.run(debug=True,host='0.0.0.0',ssl_context=('cert.pem', 'key.pem'))`

 Otherwise, use this script to run non-ssl:

 `if __name__ == "__main__":
	app.run(debug=True,host='0.0.0.0')`

The webcam module uses the built-in web camera on the user's device.  A 10 second video is captured from the webcam, is sent to the Kairos API, and an emotional analysis of the video is returned.

The process is initiated by clicking WEBCAM link is clicked, which starts a 10 second webcam capture.  The app counts down from 10 until 1, when the capture is complete.

![Webcam Capture](/python-demo/static/docs/emotion/webcam_capture.png?raw=true)

When the WEBCAM button is clicked, the captureUserMedia() function in the `emoDemoApp.js` object is called, which engages the getUserMedia API.  On success, a callback function (`onMediaSuccess`) is fired, which contains the video stream from the webcam.  Subsequently, the `webcamVideo` variable is set, which references the HTML5 `#webcam-video` tag, and its source is set to this video stream.  After the play() function is applied to `webcamVideo`, a mediaRecorder object is instantiated, leveraging the methods inside `MediaStreamRecorder.js`. On mediaRecorder.start(), the webcam capture begins.  When the creation of the BLOB object containing the video is complete, processVideo() is called in `emoDemoApp.js` which POSTS to the Python route `/emotion/send-to-api` asynchronously using AJAX.  The file is uploaded to the `static/tmp/emotion/` directory, and a POST request is made to the Kairos API, using the following endpoint:
https://api.kairos.com/v2/media?source={mediaPath)&landmarks=1

After a response is received, this file is deleted.
 
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
At this point, the analysis of the emotional data in the video is still in progress.  In order to retrieve the completed analysis, the pollApi() function in `emoDemoApp.js` is used. Using AJAX, a POST containing the media ID is sent at regular intervals to the Python route `/emotion/send-to-api` which makes a GET request until it receives one of the following responses:
* "status_code": 4,  "status_message": "Complete", or
* "status_code": 3,  "status_message": "Failed", or
* the polling function times out.  

The polling interval is set to 1000 ms.  This value can be changed in the init function in `emoDemoApp.js`:

`this.pollTick = 1000;`

A message is rendered to the user if pollApi() receives status_code 3 or if a timeout is reached.

Otherwise, the postProcessingLayout() function sends the JSON data to `highchartsApp.js`. 
See [Highcharts](#highcharts)

In addition, when a status_code 3 is received, a request to the 'https://api.kairos.com/v2/analytics' endpoint is made to retrieve gender and age data.

The corresponding JSON display is also rendered.

See [JSON display](#json-display)

---
## Upload Module

Clicking the UPLOAD link opens the upload dialog on the user's local system.

![Upload Dialog](/python-demo/static/docs/emotion/upload_dialog.png?raw=true)

When a file is selected, the form is posted asynchronously to the Python route `/emotion/send-to-api`.  A POST request is made to the Kairos API with the uploaded file, using the following endpoint:
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

![URL from the Web](/python-demo/static/docs/emotion/url_from_the_web.png?raw=true)

When a URL is entered, the URL source is posted asynchronously to the Python route `/emotion/send-to-api`.  A POST request is made to the Kairos API with the uploaded file, using the following endpoint:
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
## Environment Variables 

* APP_ID - Application ID
* APP_KEY - Application Key
* API_URL - URL of the API server 
* DEMO1_ID - Media ID of the preprocessed video 
* DEMO_ENV - Environment (dev, stage, prod)

---

## Dependencies
Javascript libraries hosted by content delivery networks:
* jquery.js
* jquery-ui.js
* bootstrap.js
* highcharts.js
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

The following Python file is used:
* app.py

