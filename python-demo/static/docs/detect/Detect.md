# Detect Demo
## What it does
The Detect Demo demonstrates the capability of the Kairos Face Recognition API to detect facial features by giving the user four methods for detection.   In each method, image data is passed to the API, which returns a JSON object containing facial feature data.

---
## Running the App

See "Running the App" in the Python Demo README file: [Documentation](/python-demo/README.md)

You will be able to access the UI for the Detect Demo at https://0.0.0.0:5000/detect

The Emotion API demo app is comprised of four modules:

* Examples Module
* Webcam Module (not on Safari or mobile)
* Upload Module
* URL Module

---

## Examples module

Five pre-processed image examples are presented to the user.  

![Five Examples](/python-demo/static/docs/detect/examples.png?raw=true)

Upon clicking one of the image thumbnails, a POST request is made to the Kairos API with the ID of the selected video using the following endpoint:
https://api.kairos.com/detect 

To accomplish this, an AJAX script in the `detectDemoApp.js` file POSTS to the Python route `/detect/send-to-api` using Python Flask.  Python makes a POST to the `/detect` endpoint with the proper headers containing the user's Kairos app_id and api_key values.  The API response is sent to the `apiCallback()` method, which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

![Box Around Face](/python-demo/static/docs/detect/box.png?raw=true)

### JSON display

The JSON object for each of the modules is displayed when the API response is received.  
![JSON Display](/python-demo/static/docs/detect/json_display.png?raw=true)

The name/value pairs in the JSON object are color-coded using the syntaxHighlight() function in `detectDemoApp.js`.  The colors are set in emotion.css (`#json-container` response blocks).  A COPY button is provided, which allows the user to copy the JSON response to the clipboard.

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
	
The webcam module uses the built-in web camera on the user's device.  When the WEBCAM link is clicked, the user is given 3 seconds to complete the capture.

![Webcam Capture](/python-demo/static/docs/detect/webcam_capture.png?raw=true)

In order to make the capture, getUserMedia() creates a video stream.  After 3 seconds, the `takePicture()` method uses Canvas to draw the image and get the image data.  This data is posted to `/detect/send-to-api` asynchronously using AJAX, where a Python POST request is made to the Kairos API, using the following endpoint:
https://api.kairos.com/detect.

The API response is sent to the `apiCallback()` method in `detectDemoApp.js` which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

---
## Upload Module

Clicking the UPLOAD link opens the upload dialog on the user's local system.

![Upload Dialog](/python-demo/static/docs/detect/upload_dialog.png?raw=true)

When a file is selected, Canvas is used to retrieve the image data.  This data is posted to `/detect/send-to-api` via AJAX, where a Python request is made to the Kairos API with the uploaded file, using the https://api.kairos.com/detect endpoint.

The API response is sent to the `apiCallback()` method in `detectDemoApp.js` which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

---

## URL Module

The URL of a photo on the web can be entered for analysis.

![URL from the Web](/python-demo/static/docs/detect/url_from_the_web.png?raw=true)

When an URL is entered, the URL source is posted to `/detect/send-to-api`, where a Python request is made to the Kairos API with the uploaded file, using the https://api.kairos.com/detect endpoint.

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

## Environment Variables

* APP_ID - Application ID
* APP_KEY - Application Key
* API_URL - URL of the API server 
* DEMO_ENV - Environment (dev, stage, prod)

---

## Dependencies
Javascript ibraries hosted by content delivery networks:
* jquery.js
* jquery-ui.js
* bootstrap.js
* clipboard.js (used for copy function in JSON display)

Note: These dependencies can be also be saved locally.

The following javascript libraries are stored locally:

* exif.js - used to retrieve orientation data from images (used in utils.js for image uploads)
* transparentImageData.js - provides transparent background for canvas drawing

The following custom javascript libraries are used:
* detectDemoApp.js - javascript object responsible for primary app functionality
* detectUi.js - a collection of javascript functions to enable user interactions
* utils.js - a collection of javascript methods for global use (canvas drawing, exif data, URL and JSON validation, aspect ratio calculations, retrival of data from image, mimetype checking, image rotation, and others)

The following Python file is used:
* app.py



