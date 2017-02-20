# Recognize Demo
## What it does
The Recognize Demo demonstrates the capability of the Kairos Face Recognition API to recognize human faces by allowing the user to enroll images into a gallery by dragging them into a window.  The user can then drag an image into another window to see if it matches any of the enrolled images.

View the app here: https://demo.kairos.com/recognize

## Running the App
The Recognize Demo must be hosted, or run locally using a solution stack such as MAMP, WAMP, LAMP or XAMPP.

The app is basically a single page application, which is viewed at index.php.

---

## Enrollment

STEP 1: Enroll one or more JPG or PNG images into a gallery.  

![Enrolled Image](/demo/recognize/docs/recognize_step1.png?raw=true)

This demo limits the number of images to nine, but only because of space considerations.  In your own testing, you can enroll as many images as you'd like.  The images are enrolled by dragging them into the dark grey pane on the left.  A gallery is created automatically for you when the first image is enrolled.

![Enrolled Image](/demo/recognize/docs/enrolled_image.png?raw=true)

* Multi-face images may not be enrolled in the demo.

For each dragged image, the FileReader object reads the contents of image, and makes a POST request with this data to the Kairos API using the following endpoint:

https://api.kairos.com/enroll 

To accomplish this, an AJAX script in the `recognizeDemoApp.js` file POSTS to recognize.php.  This file uses PHP cURL functionality to make a POST request.  curl_exec executes the cURL script, and the JSON response is sent back asynchronously to the `recognizeDemoApp.js` object.  The API response is sent to the `displayResponse()` method, which formats the JSON response.  As each image is enrolled, the JSON response for that image can be viewed by clicking the SHOW JSON link in the right pane.

![JSON Display](/demo/recognize/docs/json_display.png?raw=true)

The name/value pairs in the JSON object are color-coded using the syntaxHighlight() function in `utils.js`.  The colors are set in main.css (`#json-container` response blocks).  A COPY button is provided, which allows the user to copy the JSON response to the clipboard.

## Recognize

Step 2: Drag an image into the pane on the right to be recognized.

![Enrolled Image](/demo/recognize/docs/recognize_step2.png?raw=true)

In a similar manner to the enroll function, the data from the image is extracted and posted to the Kairos API using the following endpoint:

https://api.kairos.com/recognize 

If the image matches any of the images that you enrolled on the left, the message "RECOGNIZED" will appear at the top of the panel, and a box will be drawn around the area of the face.

![JSON Display](/demo/recognize/docs/recognized_image.png?raw=true)

If a multi-face image is used, boxes will be drawn around each face in the image that matches any of the enrolled images.

![JSON Display](/demo/recognize/docs/recognized_multiface.png?raw=true)

The threshold of the demo is set to a 60% confidence level.  If the image to be recognized matches any of the enrolled images with a confidence level equal to or greater than 60%, the "RECOGNIZED" message will appear.  Otherwise a "NOT RECOGNIZED" message is displayed.  Any enrolled images that are not matched are covered with a dark mask to set them apart from the matches.

![JSON Display](/demo/recognize/docs/masking.png?raw=true)

---
## User Interactions

The functionality for the JSON display is contained in the recognizeUi.js file:

* Copy to Clipboard button functionality
* Show/Hide JSON functionality

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
* recognizeDemoApp.js - javascript object responsible for primary app functionality
* recognizeUi.js - a collection of javascript functions to enable user interactions

The following custom php files are used:
* recognize.php - processes calls to Kairos API
* get-image-data.php - retrieves image information




