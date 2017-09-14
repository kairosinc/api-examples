# Recognize Demo
## What it does
The Recognize Demo demonstrates the capability of the Kairos Face Recognition API to recognize human faces by allowing the user to enroll images into a gallery by dragging them into a window.  The user can then drag an image into another window to see if it matches any of the enrolled images.

View the app here: https://demo2.kairos.com/recognize

--- 

## Running the App

The app is basically a single page application, which is viewed at index.html.

---

## Enrollment

STEP 1: Enroll one or more JPG or PNG images into a gallery.  

![Enrolled Image](/assets/docs/recognize/images/recognize_step1.png?raw=true)

This demo limits the number of images to nine, but only because of space considerations.  In your own testing, you can enroll as many images as you'd like.  The images are enrolled by dragging them into the dark grey pane on the left.  A gallery is created automatically for you when the first image is enrolled.

![Enrolled Image](/assets/docs/recognize/images/enrolled_image.png?raw=true)

* Multi-face images may not be enrolled in the demo.

For each dragged image, the FileReader object reads the contents of image, and makes a POST request with this data to the Kairos API using the following endpoint:

https://api.kairos.com/enroll 

To accomplish this, an AJAX script in the `recognizeDemoApp.js` file POSTS to the route `/detect/send-to-api` which calls the Golang method `SendToApiDetect`, making a POST request to the `https://api.kairos.com/detect` endpoint.  The JSON response is sent back asynchronously to the `recognizeDemoApp.js` object, which calls the `displayResponse()` method, formatting the JSON response.  As each image is enrolled, the JSON response for that image can be viewed by clicking the SHOW JSON link in the right pane.

![JSON Display](/assets/docs/recognize/images/json_display.png?raw=true)

The name/value pairs in the JSON object are color-coded using the syntaxHighlight() function in `utils.js`.  The colors are set in main.css (`#json-container` response blocks).  A COPY button is provided, which allows the user to copy the JSON response to the clipboard.

## Recognize

Step 2: Drag an image into the pane on the right to be recognized.

![Enrolled Image](/assets/docs/recognize/images/recognize_step2.png?raw=true)

In a similar manner to the enroll function, the data from the image is extracted and posted to the Kairos API using the following endpoint:

`https://api.kairos.com/recognize`

If the image matches any of the images that you enrolled on the left, the message "RECOGNIZED" will appear at the top of the panel, and a box will be drawn around the area of the face.

![JSON Display](/assets/docs/recognize/images/recognized_image.png?raw=true)

If a multi-face image is used, boxes will be drawn around each face in the image that matches any of the enrolled images.

![JSON Display](/assets/docs/recognize/images/recognized_multiface.png?raw=true)

The threshold of the demo is set to a 60% confidence level.  If the image to be recognized matches any of the enrolled images with a confidence level equal to or greater than 60%, the "RECOGNIZED" message will appear.  Otherwise a "NOT RECOGNIZED" message is displayed.  Any enrolled images that are not matched are covered with a dark mask to set them apart from the matches.

![JSON Display](/assets/docs/recognize/images/masking.png?raw=true)

---
## User Interactions

The functionality for the JSON display is contained in the recognizeUi.js file:

* Copy to Clipboard button functionality
* Show/Hide JSON functionality

---

## Option Panel

If `?option-panel=yes` is added to the URL of the demo, a panel is revealed underneath the example images containing slider/input boxes where the user can enter values for minHeadScale, threshold, and max num results.  The payload which is sent to the API is also displayed.  See the docs for detailed information on these arguments: http://kairos.com/docs/api/


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






