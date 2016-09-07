# How to create an Emotion application

Here at Kairos, we've created an application that demonstrates the way our tech can be used to detect human emotion from video.  This Kairos Emotion API demo contains four modules: Examples, Webcam, Upload and URL from the web.  Any of these modules can be modified, or separated from the main framework and used as standalone applications.  The following is a step by step tutorial designed to get your Kairos Emotion API application up and running.  Then we'll show you how you can customize these modules to suit your needs.

## 1. Get the code

Clone or fork the repo at https://github.com/kairosinc/api-examples

## 2. Get your keys

Go to the Kairos website at https://www.kairos.com/ and click GET A FREE API KEY

![Kairos Website](/demo/emotion/docs/kairos_website.png?raw=true)

Fill out the online form.

![Registration Form](/demo/emotion/docs/registration_form.png?raw=true)

You will receive a confirmation email.  Click on the link in the email, to activate your account.  This will take you to a page with your API ID and Key.

![ID and Key](/demo/emotion/docs/id_and_key.png?raw=true)

## 3. Run the app 

#### Running the app on your local system

The application must be run from a server, such as MAMP, WAMP, LAMP OR XAMPP, or another type of virtual machine.

Insert your Kairos API ID and Key into the config.php file, which is at the root of the demo directory.

![Config File](/demo/emotion/docs/config_file.png?raw=true)

The emotion demo should render at the the host that you designated in your stack or virtual machine. 

{host}/emotion/

#### Running the app in Docker

Go to the Docker website at https://docs.docker.com/, select your platform and install Docker on your system.

![Config File](/demo/emotion/docs/docker_website.png?raw=true)

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
    
The emotion demo should render at http://localhost:8080/emotion/

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
                url: 'process.php',
                data: fileObject,
                dataType: 'text'
            }).done(function(data) {
                // process the data response
            });
        }
        reader.readAsDataURL(videoFile);
        
* Next, you'll need to set up a processing file to send your video file to the API.  We used PHP cURL to POST to the API, but you can use any server-side scripting language.  Here's how our PHP file is put together:

    1. Pull the raw binary data from the POST array and decode:
    
            $data = substr($_POST['data'], strpos($_POST['data'], ",") + 1);
            $decodedData = base64_decode($data);
            
    2. Give the file a name with the extension ".webm", place it in a local directory and set the mediaPath to that directory:
    
            $filename = "foo.webm";
            file_put_contents("media/" . $filename, $decodedData);
            $mediaPath = {host} . "/emotion/media/" . $filename;
            
    3. Set the query URL, using the Kairos API URL and the path to the media that you set above:
    
            $kairosAPI = "https://api.kairos.com";
            $queryUrl = $kairosAPI . "/media?source=" . $mediaPath . "&timeout=1";
            
        The timeout is set to 1 so that the API immediately returns a response.
        
    4. Initialize the cURL script, and set the options:
    
            $request = curl_init($queryUrl);
            curl_setopt($request, CURLOPT_POST, true);
            curl_setopt($request, CURLOPT_HTTPHEADER, array(
                "app_id:" . {your app_id},
                "app_key:" . {your app_key}
                )
            );
            curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
            
    5. Execute the cURL command, get the response and echo the response back to the AJAX call:
    
            $response = curl_exec($request);
            echo $response;
            
    6. Close the session and delete your file from the local directory:
    
            curl_close($request);
            unlink("media/" . $fileName);
            
Your processing file should return a JSON response similar to these:

         {"id":"04663e8e2f116643f439bc0b","status_code":"1","status_message":"In Progress"}
         {"id":"858daf794003c1e43510cef1","status_code":"2","status_message":"Analyzing"}

### Poll API for analysis response   
At this point, your video file has been given an "id" and is queued up for analysis.  The next step is to poll the API with the "id" of your video file until the emotion analysis is obtained.  

* You can use `setInterval()` for this process:

        myPoll = setInterval(function () {
            var fileObject = {};
            fileObject["mediaId"] = {"id" from JSON response above};
            $.ajax({
                type: 'POST',
                url: 'process.php',
                data: fileObject,
                dataType: 'text'
            }).done(function(response){
                // display emotion analysis
            });
        },pollTimeout);
        
* Again, we used PHP cURL, but any server-side scripting language will do.  This time, we do a GET to the API until the API returns our desired response.  Here's how our PHP file is set up, which is very similar to our previous POST to the API:

    1. Get the mediaId from the AJAX POST:

        $mediaId = $_POST['mediaId'];
        
    2. Initialize the cURL script, and set the options: 

        $request = curl_init();
        curl_setopt($request, CURLOPT_URL, API_URL . "/media/" . $mediaId);
        curl_setopt($request, CURLOPT_HTTPHEADER, array(
                "app_id:" . {your app_id},
                "app_key:" . {your app_key}
            )
        );
        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
        
    3. Execute the cURL command, get the response and echo the response back to the AJAX call:

        $response = curl_exec($request);
        echo $response;
        
    4. Close the session

        curl_close($request);
        
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

## 5. SUCCESS! 

Now that you have received the emotion analysis for your video, we'll leave it up to your imagination as to what you can do with the data.  In our demo application, we display the data visually using Highcharts.js.  This display is synced with the video player so that you can see the emotion analysis as the video plays.  We also show the JSON response, which is color coded for easier viewing.

Please feel free to borrow ideas from our application code.  We have used various libraries for our demo to enhance the presentation, for example:

* https://code.jquery.com/ui/1.10.2/jquery-ui.js -- *for video player UI*
* https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js -- *for basic page layout*
* https://code.highcharts.com/highcharts.js -- *for graphic display of emotion analysis*
* https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js -- *for displaying messages via Handlebars, such as "Uploading video", "Analyzing video", "Processing video", "Please Wait", and error messages -- also used to display processing spinner*
* https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.12/clipboard.min.js -- *for copy to clipboard functionality*
* https://cdn.WebRTC-Experiment.com/gumadapter.js -- *for getUserMedia browser support*
    
Good luck with your Kairos API Application, and please let us know if we can answer any questions for you: https://www.kairos.com/contact

            

