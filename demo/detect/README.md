# Detect Demo
## What it does
The Detect Demo demonstrates the capability of the Kairos Face Recognition API to detect facial features by giving the user four methods for detection.   In each method, image data is passed to the API, which returns a JSON object containing facial feature data.

View the app here: https://demo.kairos.com/detect

## Running the App
The Detect demo app must be hosted, or run locally using a solution stack such as MAMP, WAMP, LAMP or XAMPP.

The app is basically a single page application, which is viewed at index.php.

The Emotion API demo app is comprised of three modules:

* Examples Module
* Webcam Module
* Upload Module
* URL Module

---

## Examples module

Five pre-processed image examples are presented to the user.  

![Five Examples](/demo/detect/docs/examples.png?raw=true)

Upon clicking one of the image thumbnails, a POST request is made to the Kairos API with the ID of the selected video using the following endpoint:
https://api.kairos.com/detect 

To accomplish this, an AJAX script in the `detectDemoApp.js` file POSTS to process.php.  This file uses PHP cURL functionality to make a POST request.  curl_exec executes the cURL script, and the JSON response is sent back asynchronously to the `detectDemoApp.js` object.  The API response is sent to the `apiCallback()` method, which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

![Box Around Face](/demo/detect/docs/box.png?raw=true)

### JSON display

The JSON object for each of the modules is displayed when the API response is received.  
![JSON Display](/demo/detect/docs/json_display.png?raw=true)

The name/value pairs in the JSON object are color-coded using the syntaxHighlight() function in `detectDemoApp.js`.  The colors are set in emotion.css (`#json-container` response blocks).  A COPY button is provided, which allows the user to copy the JSON response to the clipboard.

---
## Webcam Module
The webcam module uses the built-in web camera on the user's device.  When the WEBCAM link is clicked, the user is given 3 seconds to complete the capture.

![Webcam Capture](/demo/detect/docs/webcam_capture.png?raw=true)

In order to make the capture, getUserMedia() creates a video stream.  After 3 seconds, the `takePicture()` method uses Canvas to draw the image and get the image data.  This data is posted to `detect.php` asynchronously using AJAX, where a PHP cURL POST request is made to the Kairos API, using the following endpoint:
https://api.kairos.com/detect.

The API response is sent to the `apiCallback()` method in `detectDemoApp.js` which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

---
## Upload Module

Clicking the UPLOAD link opens the upload dialog on the user's local system.

![Upload Dialog](/demo/detect/docs/upload_dialog.png?raw=true)

When a file is selected, Canvas is used to retrieve the image data.  This data is posted to `detect.php` via AJAX, where a PHP cURL POST request is made to the Kairos API with the uploaded file, using the https://api.kairos.com/detect endpoint.

The API response is sent to the `apiCallback()` method in `detectDemoApp.js` which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

---

## URL Module

The URL of a photo on the web can be entered for analysis.

![URL from the Web](/demo/detect/docs/url_from_the_web.png?raw=true)

When an URL is entered, the URL source is posted asynchronously to `get-image-data.php` where the image type is determined.  If the image type is allowable, the image is written to Canvas and the image data is retrieved.  This data is posted to `detect.php` via AJAX, where a PHP cURL POST request is made to the Kairos API with the uploaded file, using the https://api.kairos.com/detect endpoint.

As in the other modules, the API response is sent to the `apiCallback()` method, where the JSON response is formatted for viewing, and a box is drawn around the detected face, along with feature points.

---
## User Interactions

The functionality for a number of user interactions is contained within the `detectUi.js` file.  Among them are:

* Click functionality for Example thumbnails
* Functionality for Copy to Clipboard button
* Webcam button functionality
* Upload functionality
* URL from web functionality

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
* STAGE - Environment (dev, prod, stage)

---

## Dependencies
Libraries hosted by content delivery networks:
* jquery.js
* jquery-ui.js
* bootstrap.js
* handlebars.js
* clipboard.js

Note: These dependencies can be also be saved locally.

The following custom javascript libraries are used:
* detectDemoApp.js - javascript object responsible for primary app functionality
* detectUi.js - a collection of javascript functions to enable user interactions

The following custom php files are used:
* detect.php - processes calls to Kairos API (for examples and webcam modules)
* get-image-data.php - retrieves image information

**There's a secret functionality that we haven't described here.  Can you find it?**

