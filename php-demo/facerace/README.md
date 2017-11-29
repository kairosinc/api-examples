# FaceRace Demo
## What it does
The FaceRace Demo demonstrates the capability of the Kairos Face Recognition API to detect ethnicity in faces. 

View the app here: https://demo.kairos.com/facerace

## Running the App
The FaceRace demo app must be hosted, or run locally using a solution stack such as MAMP, WAMP, LAMP or XAMPP.

The app is basically a single page application, which is viewed at index.php.

---

## Upload Module

Clicking the UPLOAD link opens the upload dialog on the user's local system.

![Upload Dialog](/php-demo/facerace/docs/upload_dialog.png?raw=true)

When a file is selected, Canvas is used to retrieve the image data.  This data is posted to `facerace.php` via AJAX, where a PHP cURL POST request is made to the Kairos API with the uploaded file, using the https://api.kairos.com/detect endpoint.  This file also instantiates DiversityRecognition, which handles S3 image processing and creates a graph with ethnicity data from the API response.

The end result is an image containing a "racerace" display:

![Facerace image](/php-demo/facerace/docs/facerace_image.png?raw=true)

---
## User Interactions

The functionality for a number of user interactions is contained within the `faceraceUi.js` file, which provides methods for image upload, displaying the preview image, and for handling Facebook and Twitter feeds.

---

## Social Media

The uploaded image and ethnicity metrics are saved as an image on S3 and can be shared on Facebook and Twitter.


---
## Installation


See `INSTALLATION` in the main php-demo README file: [Installation](/php-demo/README.md)

---
## Environment Variables

* APP_ID - Application ID
* APP_KEY - Application Key
* API_URL - URL of the API server 
* DEMO_ENV - Environment (dev, prod, stage)

The developer also must provide a Facebook App ID, which is entered on the index.php page:

        window.fbAsyncInit = function() {
            FB.init({
              appId      :'xxxxxxxxxxxxxxxx',
              xfbml      : true,
              version    : 'v2.8'
            });
            FB.AppEvents.logPageView();
        };
A meta tag with this App ID may also be added:
`<meta property="fb:app_id" content="xxxxxxxxxxxxxxxx" />`

The developer must also provide a preview image:

    define('DEMO_PREVIEW_IMAGE', (getenv('DEMO_PREVIEW_IMAGE') ? getenv('DEMO_PREVIEW_IMAGE') : "path-to-preview-image"));
---

## Dependencies
Javascript ibraries hosted by content delivery networks:
* jquery.js
* jquery-ui.js
* bootstrap.js
* handlebars.js (used for error message display)

Note: These dependencies can be also be saved locally.

The following javascript libraries are stored locally:

* exif.js - used to retrieve orientation data from images (used in utils.js for image uploads)

The following custom javascript libraries are used:
* detectDemoApp.js - javascript object responsible for primary app functionality
* detectUi.js - a collection of javascript methods to enable user interactions
* utils.js - a collection of javascript methods for global use (canvas drawing, exif data, URL and JSON validation, aspect ratio calculations, retrival of data from image, mimetype checking, image rotation, and others)

The following custom php files are used:
* facerace.php - processes calls to Kairos API 
* diversity_recognition.php - handles S3 functionality, draws graph and provides verification methods
* get-file-data.php - retrieves file information for validation (used in utils.js to check mimetype)

Also, phpgraphlib.php is used for graphing.



