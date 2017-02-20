# Verify Demo
## What it does
The Verify Demo demonstrates the capability of the Kairos Face Recognition API to verify human faces by giving the user three methods for presenting photos for verification.   In each method, the application compares two faces, gives the user a message of MATCH or NO MATCH, and presents confidence percentage for that result.

View the app here: https://demo.kairos.com/verify

## Running the App
The Verify Demo must be hosted, or run locally using a solution stack such as MAMP, WAMP, LAMP or XAMPP.

The app is basically a single page application, which is viewed at index.php.

The Verify Demo app is comprised of three modules:

* Examples Module
* Upload Module
* URL Module

---

## Enrollment

In order to understand how the verification process works, you must understand the method in which the Kairos tech determines verification.  First, an image is "enrolled" into a specified gallery in the system.  Then, subsequent images are compared to this enrolled image and a verification is made as to whether they are the same person.  The more images that are enrolled, the more accurate the verification will be.  However, for this demo, only one image is enrolled for each comparison. 

## Examples module

Five pre-processed pairs of images are presented to the user.  

![Five Pairs of Images](/demo/verify/docs/five_example_pairs.png?raw=true)

For each pair, the image on the right is the enrolled image, and the one on the left is compared to it.  So that this example runs quickly, the image data for each image is stored in the imageData.js file, the image analysis (or feature point detection) is stored in the imageAnalysisData.js file, and the JSON responses from running the verify process is contained in the jsonData.js file. 

Upon clicking an image pair, the application does the following:

*   Left image: the source of the image is set to the base64 data for that image in the imageData.js file, and the feature points are drawn using the imageAnalysisData.js data.
*   Right image: the `exampleVerify()` function is called for this image, which sets the source and draws feature points as in the left image.  It also displays MATCH or NO MATCH and the confidence level in the right pane, based on the data in the jsonData.js file.  By clicking the SHOW JSON link, the user can view this JSON data.

As you can see, Brad is no match for Angelina:

![Box Around Face](/demo/verify/docs/brad_angelina_verify.png?raw=true)

### JSON display

The JSON response for the image which has been verified is displayed in the right panel when the SHOW JSON link is clicked.  

![JSON Display](/demo/verify/docs/json_display.png?raw=true)

The name/value pairs in the JSON object are color-coded using the syntaxHighlight() function in `verifyDemoApp.js`.  The colors are set in emotion.css (`#json-container` response blocks).  A COPY button is provided, which allows the user to copy the JSON response to the clipboard.

---
## Upload Module

The user is provided with two upload elements, one for each of the left and right panels.

![Upload Dialog](/demo/verify/docs/upload_elements.png?raw=true)

These provide the user with the ability to verify images from their local system.  

When a file is selected, Canvas is used to retrieve the image data.  This data is posted to `verify.php' via AJAX, where a PHP cURL POST request is made to the Kairos API with the uploaded file, using the https://api.kairos.com/verify endpoint.

The API response is sent to the `apiCallback()` method in `verifyDemoApp.js` which formats the JSON response for viewing, and draws a box around the detected face, along with various other feature points.

---

## URL Module

The URL of a photo on the web can be entered for analysis.

![URL from the Web](/demo/verify/docs/url_from_the_web.png?raw=true)

When an URL is entered, the URL source is posted asynchronously to `get-image-data.php` where the image type is determined.  If the image type is allowable, the image is written to Canvas and the image data is retrieved.  This data is posted to `verify.php' via AJAX, where a PHP cURL POST request is made to the Kairos API with the uploaded file, using the https://api.kairos.com/verify endpoint.

As in the other modules, the API response is sent to the `apiCallback()` method, where the JSON response is formatted for viewing, and a box is drawn around the detected face, along with feature points.

---
## User Interactions

The functionality for a number of user interactions is contained within the `verifyUi.js` file.  Among them are:

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
* clipboard.js

Note: These dependencies can be also be saved locally.

The following custom javascript libraries are used:
* verifyDemoApp.js - javascript object responsible for primary app functionality
* verifyUi.js - a collection of javascript functions to enable user interactions

The following custom php files are used:
* verify.php - processes calls to Kairos API (for examples and webcam modules)
* get-image-data.php - retrieves image information


## These public domain images were used for the examples:

## George Clooney:
https://commons.wikimedia.org/wiki/Category:George_Clooney_in_2009#/media/File:George_Clooney-4_The_Men_Who_Stare_at_Goats_TIFF09_(cropped).jpg
https://commons.wikimedia.org/wiki/File:George_Clooney_2012.jpg

## Brad Pitt
https://commons.wikimedia.org/wiki/File:Brad_Pitt,_Mus%C3%A9e_Gr%C3%A9vin.jpg
https://commons.wikimedia.org/wiki/Category:Brad_Pitt_in_2013#/media/File:Brad_Pitt_2,_2013.jpg

## Angelina Jolie
https://commons.wikimedia.org/wiki/Category:Angelina_Jolie_in_2005#/media/File:Angelina_Jolie_at_Davos_crop.jpg
https://commons.wikimedia.org/wiki/Category:Angelina_Jolie_in_2010#/media/File:Angelina_jolie_by_philipp_von_ostau.jpg
## Halle Berry

https://commons.wikimedia.org/wiki/Category:Halle_Berry_in_2010#/media/File:Halle_Berry_10.jpg
https://commons.wikimedia.org/wiki/Category:Halle_Berry_in_2002#/media/File:HalleBerryHSFeb07.jpg

## Bradley Cooper

https://commons.wikimedia.org/wiki/Category:Bradley_Cooper_in_2014#/media/File:Bradley_Cooper_avp_2014.jpg
https://commons.wikimedia.org/wiki/Category:Bradley_Cooper_in_2009#/media/File:Bradley_Cooper_(3699322472)_(cropped).jpg




