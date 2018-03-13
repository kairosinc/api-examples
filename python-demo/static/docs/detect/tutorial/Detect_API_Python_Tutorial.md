# How to create a Detect application

Here at Kairos, we've created an application that demonstrates the way our tech can be used to detect a human face in an image.  Our Kairos Detect demo contains four modules: Examples, Webcam, Upload and URL from the web.  Any of these modules can be modified, or separated from the main framework and used as standalone applications.  The following is a step by step tutorial designed to get your Kairos Detect application up and running.  Then we'll show you how you can customize these modules to suit your needs.

## 1. Get the code

Clone or fork the repo at https://github.com/kairosinc/api-examples

## 2. Get your keys

* Go to the Kairos website at http://kairos.com/pricing and click GET YOUR FREE API KEY at the bottom of the page.

![Kairos Website](/python-demo/static/docs/detect/kairos_website.png?raw=true)

Fill out the online form.

![Registration Form](/python-demo/static/docs/detect/registration_form.png?raw=true)

* You will receive a confirmation email.  Click on the link in the email, to activate your account.  This will take you to a page with your API ID and Key.

![ID and Key](/python-demo/static/docs/detect/id_and_key.png?raw=true)

## 3. Run the app 

Insert your Kairos API ID and Key into the app.py file, which is at the root of the python-demo directory.

    api_url = "https://api.kairos.com"
    app_id = "YOUR_APP_ID"
    app_key = "YOUR_APP_KEY"
        
* make sure Python 2.7 is installed and accessible
* install Python Flask `pip install flask`
* cd into the python-demo repo
* run `python app.py`

The webcam functionality requires that your site is secure (https).  In order to run your local install using https, you will need to generate a certificate and a key.  To to this, run this command:

```openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365```

Follow the prompts, and this will generate two files: `cert.pem` and `key.pem`.  These files are used so that the app will spin up a secure browser.  If you want to run in ssl, use this script in the `app.py` file:

`if __name__ == "__main__":
    app.run(debug=True,host='0.0.0.0',ssl_context=('cert.pem', 'key.pem'))`

* point your browser to `https://0.0.0.0:5000/detect`

 Otherwise, use this script to run non-ssl:

 `if __name__ == "__main__":
    app.run(debug=True,host='0.0.0.0')`

* point your browser to `http://0.0.0.0:5000/detect`

## 4. Create your own custom applications

* For the following applications, we recommend using the `app.py` file in the repo as a basis.  This file contains more functionality than you'll need, so if you'd like, you can strip out all but the necessary scripts.  
* This script sends a payload to the Kairos API:
        
        api_url = 'https://api.kairos.com'
        headers = {
            "app_id": YOUR_APP_ID,
            "app_key": YOUR_APP_KEY
        }
        @app.route("/detect/send-to-api", methods=['POST'])
            def sendToApiDetect():
            url = api_url + "/detect"
            payload = request.form["imgObj"]
            r = requests.post(url, data=payload, headers=headers)
            return r.content

To use requests, you must import the library:
`import requests`
The script uses Python Flask for the "/detect/send-to-api" route (which can be changed to suit your needs).  Make sure you import Flask:
`from flask import Flask, render_template, request, json`

## 5. Create a webcam application

* The webcam functionality in the demo requires that your site is secure (https).  In order to run your local install using https, you will need to generate a certificate and a key.  To to this, run this command in Terminal or Command Prompt:

    ```openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365```

* Follow the prompts, and this will generate two files: `cert.pem` and `key.pem`.  These files are used so that app.py will spin up a secure browser.

        if __name__ == "__main__":
            app.run(debug=True,host='0.0.0.0',port=5000,ssl_context=('cert.pem', 'key.pem'))
### Open your webcam

* Create a video tag 

        <video autoplay="true" id="videoElement"></video>
        ...and assign it a variable...
        var video = document.querySelector("#videoElement")
        
* Use getUserMedia to create a video stream:

        if (navigator.getUserMedia) {       
            navigator.getUserMedia({audio: false, video: true}, handleVideo, videoError);
        }
    
    (Note: use this script to determine if your browser supports getUserMedia -- `navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia`)
* Use the handleVideo callback from getUserMedia to set the stream to your video element:

        function handleVideo(stream) {
            video.src = window.URL.createObjectURL(stream);
        }
        
    Be sure to set the width and height of your video.
        
* Start the video:

        video.play();
        
* Set a variable for your video stream:

        var localStream = stream.getTracks()[0];
      
### Capture the video stream  

For the Kairos demo, the MediaStreamRecorder.js library is used to capture the video stream  (https://webrtcexperiment-webrtc.netdna-ssl.com/MediaStreamRecorder.js). Follow these steps to capture your video using MediaStreamRecorder:

* An event listener fires an image capture function when the video starts:

        video.addEventListener('canplay', function(event){
            takePicture();
        )};
        
* Here is an example of the takePicture function, using Canvas to get the image data:

        var canvas = document.createElement('CANVAS');
        var context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, webcamWidth, webcamHeight);
        var imageData = canvas.toDataURL('image/png');

* Stop the webcam:

        localStream.stop();
    
### Send to Kairos API   

* Now that you've captured an image from your webcam, you'll need to send the image data to the Kairos API for analysis. First, you'll need to parse the data to remove the "data" attributes:

        parseImageData: function(imageData) {
            imageData = imageData.replace("data:image/jpeg;base64,", "");
            imageData = imageData.replace("data:image/jpg;base64,", "");
            imageData = imageData.replace("data:image/png;base64,", "");
            imageData = imageData.replace("data:image/gif;base64,", "");
            imageData = imageData.replace("data:image/bmp;base64,", "");
            return imageData;
        }
    
* You can then POST this data to a Python script via AJAX:

        var data = {};
        imgObj = { 
            "image"   : imageData
        };
        data.imgObj = JSON.stringify(imgObj);
        $.ajax({
            type: "POST",
            url: "detect/send-to-api",
            data: data,
            dataType: "text"
        }).done(function(data) {
            // process the data response
        });

* The "detect/send-to-api" route will POST to the script listed in "Create your own custom applications".

        api_url = "https://api.kairos.com"
        headers = {
            "app_id": app_id,
            "app_key": app_key
        }

        def sendToApiDetect():
            url = api_url + "/detect"
            payload = request.form["imgObj"]
            r = requests.post(url, data=payload, headers=headers)
            return r.content

    The return from this API request is passed back to the AJAX script for processing.
    
Your processing file should return a JSON response similar to this:

    {
        "images": [
            {
                "status": "Complete",
                "width": 640,
                "height": 480,
                "file": "content_59dea34d03784",
                "faces": [
                    {
                        "topLeftX": 205,
                        "topLeftY": 156,
                        "height": 148,
                        "rightEyeCenterY": 190,
                        "rightEyeCenterX": 247,
                        "pitch": -2,
                        "quality": 0.39524,
                        "confidence": 0.99931,
                        "chinTipX": 277,
                        "yaw": 7,
                        "chinTipY": 307,
                        "eyeDistance": 60,
                        "width": 148,
                        "leftEyeCenterY": 190,
                        "leftEyeCenterX": 307,
                        "attributes": {
                            "lips": "Together",
                            "asian": 0,
                            "gender": {
                                "femaleConfidence": 0.46786,
                                "type": "M",
                                "maleConfidence": 0.53214
                            },
                            "age": 46,
                            "hispanic": 0.00066,
                            "other": 0.00002,
                            "black": 0,
                            "white": 0.99932,
                            "glasses": "None"
                        },
                        "face_id": 1,
                        "roll": 0
                    }
                ]
            }
        ],
        "uploaded_image_url": "{URL}"
    }      
        
## 6. SUCCESS! 

Now that you have received the data containing the face detection of your image, it's up to you to create applications using this technology: image search, security, gaming, and so on.  The uses are limitless.

## 7. Create an upload application

* If you aren't using the webcam part of the tutorial, there's no need to set up SSL.  You can modify the final script in the app.py file so that it just spins up a non-secure http browser:

        if __name__ == "__main__":
            app.run(debug=True,host='127.0.0.1',port=5000)

* Create a form element with multipart/form-data enctype, so that file data can be uploaded.

        <form method="post" enctype="multipart/form-data"> 
            <input type="file" />
            <input type="Submit" />
        </form>
        
* When the form is submitted, get the image data using the Javascript FileReader API.

        var file = input.files[0];
        var reader  = new FileReader();
        reader.readAsDataURL(file);   
        reader.onloadend = function () {
            imageData = String(reader.result);
            // POST imageData to Python script via AJAX 
            (see "Send to Kairos API" section above)
        }
        
* Remember to use the `parseImageData()` function to remove the "data" attributes.

* Your Python script should return a JSON response similar to the one in the webcam portion of the tutorial.     

## 8. Create a URL from the web application

* Again, if you aren't using the webcam part of the tutorial, there's no need to set up SSL.  Modify the final script in the app.py file so that it just spins up a non-secure http browser:

        if __name__ == "__main__":
            app.run(debug=True,host="127.0.0.1",port=5000)

* Create a simple form element.

        <form method="post"> 
            <input type="text" />
            <input type="Submit" />
        </form>
        
* There's no need to extract data from the image.  Just POST the image URL string directly to the Python script.

        var data = {};
        imgObj = { 
            "image"   : urlImageSrc
        };
        data.imgObj = JSON.stringify(imgObj);
        $.ajax({
            type: "POST",
            url: "detect/send-to-api",
            data: data,
            dataType: "text"
        }).done(function(data) {
            // process the data response
        });
        
* And, as in the previous applications, your Python script should return a JSON response which can be used as you wish. 
---

Please feel free to borrow ideas from our application code.  We have used various libraries for our demo to enhance the presentation, for example:

* https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js -- *for basic page layout*
* https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.12/clipboard.min.js -- *for copy to clipboard functionality*

Good luck with your Kairos API Application, and please let us know if we can answer any questions for you: https://www.kairos.com/contact

            

