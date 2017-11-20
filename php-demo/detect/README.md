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

![Five Examples](/php-demo/detect/docs/examples.png?raw=true)

Upon clicking one of the image thumbnails, a POST request is made to the Kairos API with the ID of the selected video using the following endpoint:
https://api.kairos.com/detect 

To accomplish this, an AJAX script in the `detectDemoApp.js` file POSTS to process.php.  This file uses PHP cURL functionality to make a POST request.  curl_exec executes the cURL script, and the JSON response is sent back asynchronously to the `detectDemoApp.js` object.  The API response is sent to the `apiCallback()` method, which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

![Box Around Face](/php-demo/detect/docs/box.png?raw=true)

### JSON display

The JSON object for each of the modules is displayed when the API response is received.  
![JSON Display](/php-demo/detect/docs/json_display.png?raw=true)

The name/value pairs in the JSON object are color-coded using the syntaxHighlight() function in `detectDemoApp.js`.  The colors are set in emotion.css (`#json-container` response blocks).  A COPY button is provided, which allows the user to copy the JSON response to the clipboard.

---
## Webcam Module
The webcam module uses the built-in web camera on the user's device.  When the WEBCAM link is clicked, the user is given 3 seconds to complete the capture.

![Webcam Capture](/php-demo/detect/docs/webcam_capture.png?raw=true)

In order to make the capture, getUserMedia() creates a video stream.  After 3 seconds, the `takePicture()` method uses Canvas to draw the image and get the image data.  This data is posted to `detect.php` asynchronously using AJAX, where a PHP cURL POST request is made to the Kairos API, using the following endpoint:
https://api.kairos.com/detect.

The API response is sent to the `apiCallback()` method in `detectDemoApp.js` which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

---
## Upload Module

Clicking the UPLOAD link opens the upload dialog on the user's local system.

![Upload Dialog](/php-demo/detect/docs/upload_dialog.png?raw=true)

When a file is selected, Canvas is used to retrieve the image data.  This data is posted to `detect.php` via AJAX, where a PHP cURL POST request is made to the Kairos API with the uploaded file, using the https://api.kairos.com/detect endpoint.

The API response is sent to the `apiCallback()` method in `detectDemoApp.js` which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

---

## URL Module

The URL of a photo on the web can be entered for analysis.

![URL from the Web](/php-demo/detect/docs/url_from_the_web.png?raw=true)

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

## Option Panel

If `?option-panel=yes` is added to the URL of the demo, a panel is revealed underneath the example images containing a slider/input box where the user can enter values for minHeadScale, and also radio/checkbox buttons for selector.  The payload which is sent to the API is also displayed.  See the docs for detailed information on these arguments: http://kairos.com/docs/api/


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
          - ./demo:/var/www/app/php-demo
          
The AWS keys aren't necessary unless you're running the Facerace demo.  For more information about using XDEBUG with PHPStorm, go to: https://gist.github.com/coleca/c227543fbed515e4eb4c058a7455c581


Then, cd to your demo repo, and run:
```
make build

make run
```
You will then be able to access the UI at http://localhost:8080:80 (if running using Docker for Mac or Docker for Windows)

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
Javascript ibraries hosted by content delivery networks:
* jquery.js
* jquery-ui.js
* bootstrap.js
* handlebars.js (used for error message display)
* clipboard.js (used for copy function in JSON display)

Note: These dependencies can be also be saved locally.

The following javascript libraries are stored locally:

* exif.js - used to retrieve orientation data from images (used in utils.js for image uploads)
* transparentImageData.js - provides transparent background for canvas drawing

The following custom javascript libraries are used:
* detectDemoApp.js - javascript object responsible for primary app functionality
* detectUi.js - a collection of javascript functions to enable user interactions
* utils.js - a collection of javascript methods for global use (canvas drawing, exif data, URL and JSON validation, aspect ratio calculations, retrival of data from image, mimetype checking, image rotation, and others)

The following custom php files are used:
* detect.php - processes calls to Kairos API (for examples and webcam modules)
* get-file-data.php - gets mimetype data from uploaded or URL retrieved files (used in utils.js for URL retrieved images)
* get-exif-data.php - used to retrieve orientation data from images (used in utils.js for URL retrieved images)



