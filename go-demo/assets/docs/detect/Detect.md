# Detect Demo

## What it does
The Detect Demo demonstrates the capability of the Kairos Face Recognition API to detect facial features by giving the user four methods for detection.   In each method, image data is passed to the API, which returns a JSON object containing facial feature data.

View the app here: https://demo2.kairos.com/detect

---

## Running the App

The app is basically a single page application, which is viewed at index.html.

The Emotion API demo app is comprised of four modules:

* Examples Module
* Webcam Module
* Upload Module
* URL Module

---

### Examples module

Five pre-processed image examples are presented to the user.  

![Five Examples](/go-demo/assets/docs/detect/images/examples.png?raw=true)

Upon clicking one of the image thumbnails, a POST request is made to the Kairos API with the ID of the selected video using the following endpoint:
https://api.kairos.com/detect 

To accomplish this, an AJAX script in the `detectDemoApp.js` file POSTS to the route `/detect/send-to-api` (the routes for the demos are in the main.go file).  This route calls the Golang method `SendToApiDetect` which makes a POST request to the `https://api.kairos.com/detect` endpoint.  The JSON response is sent back asynchronously to the `detectDemoApp.js` object.  This response is then sent to the `apiCallback()` method, which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

![Box Around Face](/go-demo/assets/docs/detect/images/box.png?raw=true)

## JSON display

The JSON object for each of the modules is displayed when the API response is received.  
![JSON Display](/go-demo/demo/detect/docs/json_display.png?raw=true)

The name/value pairs in the JSON object are color-coded using the syntaxHighlight() function in `detectDemoApp.js`.  The colors are set in emotion.css (`#json-container` response blocks).  A COPY button is provided, which allows the user to copy the JSON response to the clipboard.

---
#### Webcam Module
The webcam module uses the built-in web camera on the user's device.  When the WEBCAM link is clicked, the user is given 3 seconds to complete the capture.

![Webcam Capture](/go-demo/assets/docs/detect/images/webcam_capture.png?raw=true)

In order to make the capture, getUserMedia() creates a video stream.  After 3 seconds, the `takePicture()` method uses Canvas to draw the image and get the image data.  This data is posted to the route `/detect/send-to-api`, calling the Golang method `SendToApiDetect`, where a POST request is made to the Kairos API, using the following endpoint:
`https://api.kairos.com/detect`.

The API response is sent to the `apiCallback()` method in `detectDemoApp.js` which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

---
### Upload Module

Clicking the UPLOAD link opens the upload dialog on the user's local system.

![Upload Dialog](/go-demo/assets/docs/detect/images/upload_dialog.png?raw=true)

When a file is selected, Canvas is used to retrieve the image data.  This data is posted to the route `/detect/send-to-api`, calling the Golang method `SendToApiDetect`, where a POST request is made to the Kairos API using the https://api.kairos.com/detect endpoint.

The API response is sent to the `apiCallback()` method in `detectDemoApp.js` which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

---

### URL Module

The URL of a photo on the web can be entered for analysis.

![URL from the Web](/go-demo/assets/docs/detect/images/url_from_the_web.png?raw=true)

When a URL is entered, the image is written to Canvas and the image data is retrieved.  Similar to the other modules, the image data posted to the route `/detect/send-to-api`, calling the Golang method `SendToApiDetect`, where a POST request is made to the `https://api.kairos.com/detect` endpoint.

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

## Dependencies
Javascript ibraries hosted by content delivery networks:
* jquery.js
* jquery-ui.js
* bootstrap.js
* clipboard.js (used for copy function in JSON display)

Note: These dependencies can be also be saved locally.

The following javascript libraries are implemented:

* exif.js - used to retrieve orientation data from images (used in utils.js for image uploads)
* transparentImageData.js - provides transparent background for canvas drawing

The following custom javascript libraries are used:
* detectDemoApp.js - javascript object responsible for primary app functionality
* detectUi.js - a collection of javascript functions to enable user interactions
* utils.js - a collection of javascript methods for global use (canvas drawing, exif data, URL and JSON validation, aspect ratio calculations, retrival of data from image, mimetype checking, image rotation, and others)

## Make this better

Pull requests accepted!! 
...