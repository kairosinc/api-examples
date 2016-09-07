# How to create a Detect application

Here at Kairos, we've created an application that demonstrates the way our tech can be used to detect a human face in an image.  This Kairos Detect demo contains four modules: Examples, Webcam, Upload and URL from the web.  Any of these modules can be modified, or separated from the main framework and used as standalone applications.  The following is a step by step tutorial designed to get your Kairos Detect application up and running.  Then we'll show you how you can customize these modules to suit your needs.

## 1. Get the code

Clone or fork the repo at https://github.com/kairosinc/api-examples

## 2. Get your keys

Go to the Kairos website at https://www.kairos.com/ and click GET A FREE API KEY

![Kairos Website](/demo/detect/docs/kairos_website.png?raw=true)

Fill out the online form.

![Registration Form](/demo/detect/docs/registration_form.png?raw=true)

You will receive a confirmation email.  Click on the link in the email, to activate your account.  This will take you to a page with your API ID and Key.

![ID and Key](/demo/detect/docs/id_and_key.png?raw=true)

## 3. Run the app 

#### Running the app on your local system

The application must be run from a server, such as MAMP, WAMP, LAMP OR XAMPP, or another type of virtual machine.

Insert your Kairos API ID and Key into the config.php file, which is at the root of the demo directory.

![Config File](/demo/detect/docs/config_file.png?raw=true)

The detect demo should render at the the host that you designated in your stack or virtual machine. 

{host}/detect/

#### Running the app in Docker

Go to the Docker website at https://docs.docker.com/, select your platform and install Docker on your system.

![Config File](/demo/detect/docs/docker_website.png?raw=true)

After installation, be sure to run these commands to test if your versions of docker, docker-compose, and docker-machine are up-to-date and compatible with Docker.app.

  $ docker --version
  Docker version 1.12.0-rc2, build 906eacd, experimental

  $ docker-compose --version
  docker-compose version 1.8.0-rc1, build 9bf6bc6

  $ docker-machine --version
  docker-machine version 0.8.0-rc1, build fffa6c9
  
The output may be different if you are running a different verson.

With Docker successfully installed, cd to the location of the repo on your local system, and run:

    make build
    make run
    
The detect demo should render at http://localhost:8080/detect/

## 4. Create a webcam application

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
    
* You can then post this data to a processing file via AJAX:

        var data = {};
        imgObj = { 
            "image"   : self.imageData
        };
        data.imgObj = JSON.stringify(imgObj);
        $.ajax({
            type: 'POST',
            url: 'process.php',
            data: data,
            dataType: 'text'
        }).done(function(data) {
            // process the data response
        });

* Next, you'll need to set up a processing file to send your image data to the API.  We used PHP cURL to POST to the API, but you can use any server-side scripting language.  Here's how our PHP file is put together:

    1. Initialize the cURL script, and set the options:
    
            $request = curl_init($queryUrl);
            curl_setopt($request, CURLOPT_POST, true);
            curl_setopt($request,CURLOPT_POSTFIELDS, $_POST["imgObj"]);
            curl_setopt($request, CURLOPT_HTTPHEADER, array(
                "app_id:" . {your app_id},
                "app_key:" . {your app_key}
                )
            );
            curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
            
    2. Execute the cURL command, get the response and echo the response back to the AJAX call:
    
            $response = curl_exec($request);
            echo $response;
            
    3. Close the session:
    
            curl_close($request);

Your processing file should return a JSON response similar to this:

         {
            "images": [
                {
                    "time": 2.215721,
                    "status": "Complete",
                    "file": "face_57966a5c1b970.jpg",
                    "width": 635,
                    "height": 475,
                    "faces": [
                        {
                            "topLeftX": 199,
                            "topLeftY": 49,
                            "botLeftX": 360,
                            "botLeftY": 319,
                            "leftEyeCenterX": 237,
                            "leftEyeCenterY": 176,
                            "rightEyeCenterX": 315,
                            "rightEyeCenterY": 179,
                            "width": 159,
                            "height": 268,
                            "noseTipX": -1,
                            "noseTipY": -1,
                            "noseBtwEyesX": -1,
                            "noseBtwEyesY": -1,
                            "chinTipX": -1,
                            "chinTipY": -1,
                            "leftEyeCornerLeftX": -1,
                            "leftEyeCornerLeftY": -1,
                            "rightEyeCornerLeftX": -1,
                            "rightEyeCornerLeftY": -1,
                            "rightEyeCornerRightX": -1,
                            "rightEyeCornerRightY": -1,
                            "rightEarTragusX": -1,
                            "rightEarTragusY": -1,
                            "leftEarTragusX": -1,
                            "leftEarTragusY": -1,
                            "leftEyeBrowLeftX": -1,
                            "leftEyeBrowLeftY": -1,
                            "leftEyeBrowMiddleX": -1,
                            "leftEyeBrowMiddleY": -1,
                            "leftEyeBrowRightX": -1,
                            "leftEyeBrowRightY": -1,
                            "rightEyeBrowLeftX": -1,
                            "rightEyeBrowLeftY": -1,
                            "rightEyeBrowMiddleX": -1,
                            "rightEyeBrowMiddleY": -1,
                            "rightEyeBrowRightX": -1,
                            "rightEyeBrowRightY": -1,
                            "nostrilLeftHoleBottomX": -1,
                            "nostrilLeftHoleBottomY": -1,
                            "nostrilRightHoleBottomX": -1,
                            "nostrilRightHoleBottomY": -1,
                            "nostrilLeftSideX": -1,
                            "nostrilLeftSideY": -1,
                            "nostrilRightSideX": -1,
                            "nostrilRightSideY": -1,
                            "lipCornerLeftX": -1,
                            "lipCornerLeftY": -1,
                            "lipCornerMiddleX": -1,
                            "lipCornerMiddleY": -1,
                            "lipCornerRightX": -1,
                            "lipCornerRightY": -1,
                            "pitch": -1,
                            "yaw": -1,
                            "roll": -1,
                            "attributes": {
                                "gender": {
                                    "type": "F",
                                    "confidence": "25%"
                                },
                                "age": 52
                            }
                        }
                    ]
                }
            ]
        }      
        
* NOTE: You'll notice that the "faces" array contains negative values for many of the feature points.  As we improve our technology, you'll see more positive values.

## 5. SUCCESS! 

Now that you have received the data containing the face detection of your image, it's up to you to create applications using this technology: image search, security, gaming, and so on.  The uses are limitless.

Please feel free to borrow ideas from our application code.  We have used various libraries for our demo to enhance the presentation, for example:

* https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js -- *for basic page layout*
* https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js -- *for displaying messages via Handlebars, such as "Analyzing image", "Generating results", and error messages -- also used to display processing spinner*
* https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.12/clipboard.min.js -- *for copy to clipboard functionality*

Good luck with your Kairos API Application, and please let us know if we can answer any questions for you: https://www.kairos.com/contact

            

