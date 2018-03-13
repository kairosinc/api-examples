# How to create a Recognize application

Here at Kairos, we've created an application that demonstrates the way our tech can be used to recognize a human face against a gallery of enrolled subjects.  The following is a step by step tutorial designed to get your Kairos Recognize application up and running.  Then we'll show you how you can customize these modules to suit your needs.

## 1. Get the code

Clone or fork the repo at https://github.com/kairosinc/api-examples

## 2. Get your keys

Go to the Kairos website at https://www.kairos.com/ and click GET A FREE API KEY

![Kairos Website](/python-demo/static/docs/recognize/kairos_website.png?raw=true)

Fill out the online form.

![Registration Form](/python-demo/static/docs/recognize/registration_form.png?raw=true)

You will receive a confirmation email.  Click on the link in the email, to activate your account.  This will take you to a page with your API ID and Key.

![ID and Key](/python-demo/static/docs/recognize/id_and_key.png?raw=true)

## 3. Run the app 

Insert your Kairos API ID and Key into the app.py file, which is at the root of the python-demo directory.

    api_url = "https://api.kairos.com"
    app_id = "YOUR_APP_ID"
    app_key = "YOUR_APP_KEY"
        
* make sure Python 2.7 is installed and accessible
* install Python Flask `pip install flask`
* cd into the python-demo repo
* run `python app.py`
* point your browser to `http://0.0.0.0:5000/recognize`

## 4. Create your own custom applications

* For the following applications, we recommend using the `app.py` file in the repo as a basis.  This file contains more functionality than you'll need, so if you'd like, you can strip out all but the necessary scripts.  
* This script sends a payload to the Kairos API:
        
        api_url = 'https://api.kairos.com'
        headers = {
            "app_id": YOUR_APP_ID,
            "app_key": YOUR_APP_KEY
        }
        @app.route("/recognize/send-to-api", methods=['POST'])
            def sendToApiRecognize():
                (this method processes both enroll and recognize requests)

To use requests, you must import the library:
`import requests`
The script uses Python Flask for the "/recognize/send-to-api" route (which can be changed to suit your needs).  Make sure you import Flask:
`from flask import Flask, render_template, request, json`

### First, enroll an image from your local system

##### Start with a simple form:

    <form method="post" enctype="multipart/form-data"> 
        <input type="file" id="imageFile" />
        <input type="text" id="galleryName" />
        <input type="text" id="subjectId" />
        <input type="submit" id="formSubmit" />
    </form>
                    
##### To submit this form asynchronously to the Kairos API, use jQuery/AJAX.  Be sure to include jQuery on your page:

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>

    <script>
        $("#formSubmit").click(function(e) {
            e.preventDefault();
            // this is your uploaded file
            var file = $('#imageFile')[0].files[0];
            // instantiate FileReader, which is a web API
            var reader  = new FileReader(); 
            // the readAsDataURL method reads the contents of your file
            reader.readAsDataURL(file); 
            // after FileReader has loaded, send image data to API
            reader.onloadend = function () { 
                // this is the base64 data of your image
                var imageData = reader.result; 
                // this is the base64 data of your image - the string at the beginning of the base64 data must be removed using parseImageData()
                imageData = parseImageData(imageData);
                var data = {};
                imgObj = { 
                    "image"   : imageData,
                    "gallery_name" : $("#galleryName").val(),
                    "subject_id" : $("#subjectId").val()
                };
                data.imgObj = JSON.stringify(imgObj);
                data.process = "enroll"
                $.ajax({
                    url      : "recognize/send-to-api",
                    type     : "POST",
                    data     :  data,
                    dataType : 'text'
                }).done(function(response) {
                    console.log(response)
                });
            }
        }); 
            
        // Parsing function:
        var parseImageData = function(imageData) {
            imageData = imageData.replace("data:image/jpeg;base64,", "");
            imageData = imageData.replace("data:image/jpg;base64,", "");
            imageData = imageData.replace("data:image/png;base64,", "");
            imageData = imageData.replace("data:image/gif;base64,", "");
            imageData = imageData.replace("data:image/bmp;base64,", "");
            return imageData;
        }
    </script>

* The "recognize/send-to-api" route will POST to the script listed in "Create your own custom applications".

        api_url = "https://api.kairos.com"
        headers = {
            "app_id": app_id,
            "app_key": app_key
        }
        @app.route('/recognize/send-to-api', methods=['POST'])
        def sendToApiRecognize():
        
* In our demo, the point of origin is "enroll", as determined by `data.process = "enroll"` in the data object passed to the route.

        if request.form['process'] == "enroll":
            url = api_url + '/enroll'
            payload = request.form['imgObj']
            r = requests.post(url, data=payload, headers=headers)
            return r.content

##### This will enroll your image, and give you the JSON response object in your AJAX script.  You can enroll more than one image into this gallery.

Sample response:

    {
        "images": [
            {
            "transaction": {
                "status": "success",
                "face_id": 1,
                "subject_id": "Elizabeth",
                "width": 934,
                "height": 934,
                "topLeftX": 300,
                "topLeftY": 526,
                "timestamp": "1417207442",
                "gallery_name": "MyGallery",
                "confidence" : 0.99996
            },
            "attributes": {
                "gender": {
                "type": "F",
                },
                "age" : 23
            }
        }]
    }

### Next, upload an image to be recognized.

We will now upload another image into the gallery that we created above to see if our image matches any images that we enrolled previously.  We need to specify which gallery and subject we should search against to compare.  

Use a file upload form similar to the one above.

    <form method="post" enctype="multipart/form-data"> 
        <input type="file" id="imageFile" />
        <input type="text" id="galleryName" />
        <input type="submit" id="formSubmit" />
    </form>

Again, extract and parse the base64 data from the image, and use jQuery/AJAX to POST the gallery_name and image data to the `/recognize/send-to-api` route, which submits a POST request to the API.

    <script>
        $("#formSubmit").click(function(e) {
            e.preventDefault();
            var file = $('#imageFile')[0].files[0]; 
            var reader  = new FileReader(); 
            reader.readAsDataURL(file); 
            reader.onloadend = function () { 
            var imageData = reader.result; 
            imageData = parseImageData(imageData); 
            var data = {};
            imgObj = { 
                "image"   : imageData,
                "gallery_name" : $("#galleryName").val()
            };
            data.imgObj = JSON.stringify(imgObj);
            data.process = "recognize";
            $.ajax({
                url      : "recognize/send-to-api",
                type     : "POST",
                data     :  data,
                dataType : 'text'
              }).done(function(response) {
                console.log(response)
            });
        });
    </script>

* Similar to the enroll functionality, this posts to the `recognize/send-to-api` endpoint, but this time the point of origin is "recognize", as determined by `data.process = "recognize"` in the data object passed to the route.

        if request.form['process'] == "recognize":
            url = api_url + '/recognize'
            payload = request.form['imgObj']
            r = requests.post(url, data=payload, headers=headers)
            return r.content

##### This will give you a JSON object containing the recognize analysis, similar to this:
    {
        "images": [
            {
                "transaction":
                {
                    "status": "success",
                    "subject": "Elizabeth",
                    "width": 170,
                    "height": 287,
                    "topLeftX": 108,
                    "topLeftY": 55,
                    "confidence": 0.80214,
                    "gallery_name": "MyGallery",
                    "face_id" : 1
                },
                "candidates": [
                    {
                        "subject_id" : "Elizabeth",
                        "confidence" : 0.80214,
                        "enrollment_timestamp": "1417207485"
                    }
                ]
            } 
        ]
    }
    
### Drag and Drop

In our demo, we used drag and drop functionality to enroll and recognize images.  This can easily be implemented using the following code:

    var handleDragOver = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
    };
    
    // Setup the dnd listeners:
    var dropZone = $(".left-image-container")[0];
    dropZone.addEventListener("dragover", handleDragOver, false);
    dropZone.addEventListener("drop", enrollImage, false);

    // Setup the dnd listeners:
    var dropZone = $(".right-image-container")[0];
    dropZone.addEventListener("dragover", handleDragOver, false);
    dropZone.addEventListener("drop", recognizeImage, false);

## 5. SUCCESS! 

Now that you have received the data containing the face recognition of your image, it's up to you to create applications using this technology: image search, security, gaming, and so on.  The uses are limitless.

Please feel free to borrow ideas from our application code.  We have used various libraries for our demo to enhance the presentation, for example:

* https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js -- *for basic page layout*
* https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.12/clipboard.min.js -- *for copy to clipboard functionality*

Good luck with your Kairos API Application, and please let us know if we can answer any questions for you: https://www.kairos.com/contact

            

