# How to create an Emotion application

Here at Kairos, we've created an application that demonstrates the way our tech can be used to detect human emotion from video.  This Kairos Emotion API demo contains four modules: Examples, Webcam, Upload and URL from the web.  Any of these modules can be modified, or separated from the main framework and used as standalone applications.  The following is a step by step tutorial designed to get your Kairos Emotion API application up and running.  Then we'll show you how you can customize these modules to suit your needs.

## 1. Get the code

Clone or fork the repo at https://github.com/kairosinc/api-examples

## 2. Get your keys

* Go to the Kairos website at http://kairos.com/pricing and click GET YOUR FREE API KEY at the bottom of the page.

![Kairos Website](/python-demo/static/docs/emotion/kairos_website.png?raw=true)

Fill out the online form.

![Registration Form](/python-demo/static/docs/emotion/registration_form.png?raw=true)

* You will receive a confirmation email.  Click on the link in the email, to activate your account.  This will take you to a page with your API ID and Key.

![ID and Key](/python-demo/static/docs/emotion/id_and_key.png?raw=true)

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

* point your browser to `https://0.0.0.0:5000/emotion`

 Otherwise, use this script to run non-ssl:

 `if __name__ == "__main__":
    app.run(debug=True,host='0.0.0.0')`

* point your browser to `http://0.0.0.0:5000/emotion`

## 4. Create your own custom applications

* For the following applications, we recommend using the `app.py` file in the repo as a basis.  This file contains more functionality than you'll need, so if you'd like, you can strip out all but the necessary scripts.  
* This script sends a payload to the Kairos API:
        
        api_url = 'https://api.kairos.com'
        headers = {
            "app_id": YOUR_APP_ID,
            "app_key": YOUR_APP_KEY
        }
        @app.route("/emotion/send-to-api", methods=['POST'])
        def sendToApiEmotion():
            (in our demo, we wrote conditional statements depending on the point of origin)

To use requests, you must import the library:
`import requests`
The script uses Python Flask for the "/emotion/send-to-api" route (which can be changed to suit your needs).  Make sure you import Flask:
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
      
### Capture the video stream  

For the Kairos demo, the MediaStreamRecorder.js library is used to capture the video stream  (https://webrtcexperiment-webrtc.netdna-ssl.com/MediaStreamRecorder.js). Follow these steps to capture your video using MediaStreamRecorder:

* Create a mediaRecorder object and set the parameters:

        mediaRecorder = new MediaStreamRecorder(stream);
        mediaRecorder.stream = stream;
        mediaRecorder.mimeType = 'video/webm'; // this line is mandatory
        mediaRecorder.videoWidth = webcamWidth;
        mediaRecorder.videoHeight = webcamHeight;
        
* Start the mediaRecorder when the webcam starts:

        video.addEventListener('canplay', function(event){
            mediaRecorder.start(captureInterval);
        )};
        
    `captureInterval` is the amount of time you want your camera to capture video in milliseconds.
    
* When the captureInterval is reached, stop the capture and save your video:  

        mediaRecorder.stop();
        var videoFile = mediaRecorder.saveToDir();
        
    The video is saved in blob format.  You may need to modify the `saveToDir()` method in MediaStreamRecorder.js to suit your needs.  Also, in our application, we use a `setInterval()` script to poll the mediaRecorder for when the blob file is ready.
        
* Stop the webcam:

        mediaRecorder.stream.getVideoTracks()[0].stop();
    
### Send to Kairos API    
Now that you've captured a video from your webcam, you'll need to send this video to the Kairos API for emotion analysis.  To do this, you'll need to use the `FileReader()` method.

* Create a new fileReader instance:

        var fileReader = new FileReader();
        
* Then, set up the fileReader so that when it loads, it posts to a processing file via AJAX:

        reader.onload = function(event){
            var fileObject = {};
            fileObject["data"] = event.target.result;
            $.ajax({
                type: 'POST',
                url: "emotion/send-to-api",
                data: fileObject,
                dataType: 'text'
            }).done(function(data) {
                // process the data response
            });
        }
        reader.readAsDataURL(videoFile);
        
* The "emotion/send-to-api" route will POST to the script listed in "Create your own custom applications".

        api_url = "https://api.kairos.com"
        headers = {
            "app_id": app_id,
            "app_key": app_key
        }
        
        @app.route('/emotion/send-to-api', methods=['POST'])
        def sendToApiEmotion():
        
* In our demo, the point of origin is "webcam", as determined by `data["fname"] = "webcam"` in the data object passed to the route
        
        elif request.form['fname'] == "webcam":
            # get file name from form and add .webm extension
            filename = request.form["videoId"]
            fullFilename = filename + ".webm"
            # get base64 video data from form
            videoData = request.form["videoData"]
            # set tmp path to webcam file
            filePath = "static/tmp/emotion/" + fullFilename
            # write file to tmp directory
            with open(filePath, "wb") as fileUpload:
                fileUpload.write(videoData.decode('base64'))
            fileUpload.close()
            # set API url path
            url = api_url + "/v2/media?landmarks=1"
            # open tmp file
            files = [('source', open(filePath, 'rb'))]
            # make request to API with uploaded multipart-encoded file
            fileUpload = requests.post(url, files=files, headers=headers)
            fileUpload.close()
            # remove tmp file
            os.remove(filePath)
            # return API response
            return fileUpload.content
            
Your processing file should return a JSON response similar to these:

         {"id":"04663e8e2f116643f439bc0b","status_code":"1","status_message":"In Progress"}
         {"id":"858daf794003c1e43510cef1","status_code":"2","status_message":"Analyzing"}

### Poll API for analysis response   
At this point, your video file has been given an "id" and is queued up for analysis.  The next step is to poll the API with the "id" of your video file until the emotion analysis is obtained.  

* You can use `setInterval()` for this process:

        myPoll = setInterval(function () {
            var data = {};
            data["fname"] = "polling";
            data["mediaId"] = {"id" from JSON response above};
            $.ajax({
                type: 'POST',
                url: 'emotion/send-to-api',
                data: data,
                dataType: 'text'
            }).done(function(response){
                // display emotion analysis
            });
        },pollTimeout);
        
* Again, the data is sent to the `emotion/send-to-api` route:
    @app.route('/emotion/send-to-api', methods=['POST'])
        def sendToApiEmotion():
        
* In our demo, the point of origin is "polling", as determined by `data["fname"] = "polling"` in the data object passed to the route.

        if request.form['fname'] == "polling":
            # get mediaId from form
            mediaId = request.form['mediaId']
            # set API url path
            url = api_url + "/v2/media/" + mediaId
            # make request to the API with the mediaId endpoint
            r = requests.get(url, headers=headers)
            # return API response
            return r.content
        
* Keep polling until you get a JSON response with "status_code":"4".  It should look something like this:


        {
            "id": "f8188ee703961eca98a47bd5",
            "frames": [
                {
                    "person": {
                        "time": 0,
                        "person_id": "0",
                        "emotions": {
                            "smile": 1.132,
                            "surprise": 0.531,
                            "negative": 0.89,
                            "attention": 100
                        }
                    }
                },
                {
                    "person": {
                        "time": 42,
                        "person_id": "0",
                        "emotions": {
                            "smile": 1.2,
                            "surprise": 0.463,
                            "negative": 0.964,
                            "attention": 100
                        }
                    }
                },
                {
                    "person": {
                        "time": 83,
                        "person_id": "0",
                        "emotions": {
                            "smile": 1.275,
                            "surprise": 0.278,
                            "negative": 0.886,
                            "attention": 100
                        }
                    }
                }
            ],
            "status_code": 4,
            "status_message": "Complete",
            "length": 21.355
        }
        
You should set a timeout in your polling function in case you never get a response.  The API will time out after 60 seconds.


## 6. SUCCESS! 

Now that you have received the emotion analysis for your video, we'll leave it up to your imagination as to what you can do with the data.  In our demo application, we display the data visually using Highcharts.js.  This display is synced with the video player so that you can see the emotion analysis as the video plays.  We also show the JSON response, which is color coded for easier viewing.

## 7. Create an upload application

* If you aren't using the webcam part of the tutorial, there's no need to set up SSL.  You can modify the final script in the app.py file so that it just spins up a non-secure http browser:

        if __name__ == "__main__":
            app.run(debug=True,host='127.0.0.1',port=5000)

* Create a form element with multipart/form-data enctype, so that file data can be uploaded.

        <form method="post" enctype="multipart/form-data"> 
            <input type="file" />
            <input type="Submit" />
        </form>
        
* When the form is submitted, get the form data using Javascript `FormData()` API:

        var input = $("#upload")[0];
        var fileData = $('#upload')[0].files[0]; 
        var data = new FormData();                  
        data.append('file', fileData);
        data.append('fname', 'fileupload');
        
        # use AJAX to post to the `emotion/send-to-api` route:
        $.ajax({
            type: 'POST',
            url: 'emotion/send-to-api',
            data: data,
            dataType: 'text'
        }).done(function(response){
            // process the data response
        });
        
* Your Python script should return a JSON response similar to the one in the webcam portion of the tutorial.  Use your polling script to get the emotion response from the mediaId.     

## 8. Create a URL from the web application

* Again, if you aren't using the webcam part of the tutorial, there's no need to set up SSL.  Modify the final script in the app.py file so that it just spins up a non-secure http browser:

        if __name__ == "__main__":
            app.run(debug=True,host="127.0.0.1",port=5000)

* Create a simple form element.

        <form method="post"> 
            <input type="text" />
            <input type="Submit" />
        </form>
        
* There's no need to extract data from the video.  Just POST the video URL string directly to the Python script.

        var data = {};
        imgObj = { 
            "image"   : urlImageSrc
        };
        data.imgObj = JSON.stringify(imgObj);
        $.ajax({
            type: "POST",
            url: "emotion/send-to-api",
            data: data,
            dataType: "text"
        }).done(function(data) {
            // process the data response
        });
        
* Your Python script should return a JSON response similar to the one in the webcam portion of the tutorial.  Use your polling script to get the emotion response from the mediaId.  

Please feel free to borrow ideas from our application code.  We have used various libraries for our demo to enhance the presentation, for example:

* https://code.jquery.com/ui/1.10.2/jquery-ui.js -- *for video player UI*
* https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js -- *for basic page layout*
* https://code.highcharts.com/highcharts.js -- *for graphic display of emotion analysis*
* https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.12/clipboard.min.js -- *for copy to clipboard functionality*
* https://cdn.WebRTC-Experiment.com/gumadapter.js -- *for getUserMedia browser support*
    
Good luck with your Kairos API Application, and please let us know if we can answer any questions for you: https://www.kairos.com/contact

            

