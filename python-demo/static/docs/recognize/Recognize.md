# Recognize Demo
## What it does
The Recognize Demo demonstrates the capability of the Kairos Face Recognition API to recognize human faces by allowing the user to enroll images into a gallery by dragging them into a window.  The user can then drag an image into another window to see if it matches any of the enrolled images.

---

## Running the App

See "Running the App" in the Python Demo README file: [Documentation](/python-demo/README.md)

You will be able to access the UI for the Recognize Demo at http://0.0.0.0:5000/recognize

---

## Enrollment

STEP 1: Enroll one or more JPG or PNG images into a gallery.  

![Enrolled Image](/python-demo/static/docs/recognize/recognize_step1.png?raw=true)

This demo limits the number of images to nine, but only because of space considerations.  In your own testing, you can enroll as many images as you'd like.  The images are enrolled by dragging them into the dark grey pane on the left.  A gallery is created automatically for you when the first image is enrolled.

![Enrolled Image](/python-demo/static/docs/recognize/enrolled_image.png?raw=true)

* Multi-face images may not be enrolled in the demo.

For each dragged image, the FileReader object reads the contents of image, and makes a POST request with this data to the Kairos API using the following endpoint:

https://api.kairos.com/enroll 

To accomplish this, an AJAX script in the `recognizeDemoApp.js` file POSTS to the route `/recognize/send-to-api` using Python Flask.  Python makes a POST to the `/enroll` endpoint with the proper headers containing the user's Kairos app_id and api_key values.  The API response is sent to the `displayResponse()` method, which formats the JSON response.  As each image is enrolled, the JSON response for that image can be viewed by clicking the SHOW JSON link in the right pane.  

![JSON Display](/python-demo/static/docs/recognize/json_display.png?raw=true)

The name/value pairs in the JSON object are color-coded using the syntaxHighlight() function in `utils.js`.  The colors are set in main.css (`#json-container` response blocks).  A COPY button is provided, which allows the user to copy the JSON response to the clipboard.

## Recognize

Step 2: Drag an image into the pane on the right to be recognized.

![Enrolled Image](/python-demo/static/docs/recognize/recognize_step2.png?raw=true)

In a similar manner to the enroll function, the data from the image is extracted and posted to the Python route `/recognize/send-to-api`.  Python makes a POST to the `/recognize` endpoint with the proper headers containing the user's Kairos app_id and api_key values.

If the image matches any of the images that you enrolled on the left, the message "RECOGNIZED" will appear at the top of the panel, and a box will be drawn around the area of the face.

![JSON Display](/python-demo/static/docs/recognize/recognized_image.png?raw=true)

If a multi-face image is used, boxes will be drawn around each face in the image that matches any of the enrolled images.

![JSON Display](/python-demo/static/docs/recognize/recognized_multiface.png?raw=true)

The threshold of the demo is set to a 60% confidence level.  If the image to be recognized matches any of the enrolled images with a confidence level equal to or greater than 60% (this value can be set in the init method in recognizeDemoApp.js as `this.recognizeThreshold`), the "RECOGNIZED" message will appear.  Otherwise a "NOT RECOGNIZED" message is displayed.  Any enrolled images that are not matched are covered with a dark mask to set them apart from the matches.

![JSON Display](/python-demo/static/docs/recognize/masking.png?raw=true)

---
## User Interactions

The functionality for the JSON display is contained in the recognizeUi.js file:

* Copy to Clipboard button functionality
* Show/Hide JSON functionality

---

## Option Panel

If `?option-panel=yes` is added to the URL of the demo, a panel is revealed underneath the example images containing slider/input boxes where the user can enter values for minHeadScale, threshold, and max num results.  The payload which is sent to the API is also displayed.  See the docs for detailed information on these arguments: http://kairos.com/docs/api/

---

## Environment Variables

* APP_ID - Application ID
* APP_KEY - Application Key
* API_URL - URL of the API server 
* DEMO_ENV - Environment (dev, stage, prod)

---

## Dependencies
Javascript libraries hosted by content delivery networks:
* jquery.js
* jquery-ui.js
* bootstrap.js
* clipboard.js (used for copy function in JSON display)
* featherlight.js (used for lightbox display of threshold range in option panel)

Note: These dependencies can be also be saved locally.

The following javascript libraries are stored locally:

* exif.js - used to retrieve orientation data from images (used in utils.js for image uploads)
* transparentImageData.js - provides transparent background for canvas drawing

The following custom javascript libraries are used:
* recognizeDemoApp.js - javascript object responsible for primary app functionality
* recognizeUi.js - a collection of javascript functions to enable user interactions

The following Python file is used:
* app.py





