# How to create a Verify application

Here at Kairos, we've created an application that demonstrates the way our tech can be used to detect a human face in an image.  Our Verify demo contains three modules: Examples, Upload and URL from the web.  Any of these modules can be modified, or separated from the main framework and used as standalone applications.  The following is a step by step tutorial designed to get your Kairos Detect application up and running using the Upload module, which uploads files from your local system. 

## 1. Get the code

Clone or fork the repo at https://github.com/kairosinc/api-examples

## 2. Get your keys

Go to the Kairos website at https://www.kairos.com/ and click GET A FREE API KEY

![Kairos Website](/php-demo/detect/docs/kairos_website.png?raw=true)

Fill out the online form.

![Registration Form](/php-demo/detect/docs/registration_form.png?raw=true)

You will receive a confirmation email.  Click on the link in the email, to activate your account.  This will take you to a page with your API ID and Key.

![ID and Key](/php-demo/detect/docs/id_and_key.png?raw=true)

## 3. Run the app 

#### Running the app on your local system

The application must be run from a server, such as MAMP, WAMP, LAMP OR XAMPP, or another type of virtual machine.

Insert your Kairos API ID and Key into the config.php file, which is at the root of the demo directory.

![Config File](/php-demo/detect/docs/config_file.png?raw=true)

The verify demo should render at the the host that you designated in your stack or virtual machine. 

{host}/verify/

#### Running the app in Docker

Go to the Docker website at https://docs.docker.com/, select your platform and install Docker on your system.

![Config File](/php-demo/detect/docs/docker_website.png?raw=true)

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
    
The detect demo should render at http://localhost:8080/verify/

## 4. Create an application

`MAKE SURE THAT ALL OF YOUR SCRIPTS ARE ON THE SAME SERVER!`

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
        var file = $('#imageFile')[0].files[0]; `this is your uploaded file`
        var reader  = new FileReader(); `instantiate FileReader, which is a web API`
        reader.readAsDataURL(file); `the readAsDataURL method reads the contents of your file`
        reader.onloadend = function () { `after FileReader has loaded, send image data to API`
          var imageData = reader.result; `this is the base64 data of your image`
          imageData = parseImageData(imageData); `the string at the beginning of the base64 data must be removed using parseImageData()`
          var data = {};
          imgObj = { 
            "image"   : imageData,
            "gallery_name" : $("#galleryName").val(),
            "subject_id" : $("#subjectId").val()
          };
          data.imgObj = JSON.stringify(imgObj);
          $.ajax({
            url      : "enroll.php",
            type     : "POST",
            data     :  data,
            dataType : 'text'
          }).done(function(response) {
            console.log(response)
          });
        }
    }); 
    
    Parsing function:
    var parseImageData = function(imageData) {
        imageData = imageData.replace("data:image/jpeg;base64,", "");
        imageData = imageData.replace("data:image/jpg;base64,", "");
        imageData = imageData.replace("data:image/png;base64,", "");
        imageData = imageData.replace("data:image/gif;base64,", "");
        imageData = imageData.replace("data:image/bmp;base64,", "");
        return imageData;
    }
</script>

AJAX will POST the data to enroll.php which, in turn, will submit a POST request to the Kairos API.  Here is an example script:


$api_url = "http://api.kairos.com";
$app_id = "";
$app_key = "";

$request = curl_init($api_url . "/enroll");
curl_setopt($request, CURLOPT_POST, true);
curl_setopt($request, CURLOPT_HTTPHEADER, array(
    "app_id:" . $app_id, 
    "app_key:" . $app_key
    )
);
curl_setopt($request,CURLOPT_POSTFIELDS, $_POST["imgObj"]);
curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($request);
echo $response;
curl_close($request);


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

### Next, upload an image to be verified.

We will now upload another image into the gallery that we created above to see if our image matches any images that we enrolled previously.  We need to specify which gallery and subject we should search against to compare.  

Use a file upload form similar to the one above.

<form method="post" enctype="multipart/form-data"> 
    <input type="file" id="imageFile" />
    <input type="text" id="galleryName" />
    <input type="text" id="subjectId" />
    <input type="submit" id="formSubmit" />
</form>

Again, extract and parse the base64 data from the image, and use jQuery/AJAX to POST the gallery_name and image data to a verify.php file, which submits a POST request to the API.

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
    "gallery_name" : $("#galleryName").val(),
    "subject_id" : $("#subjectId").val()
    };
    data.imgObj = JSON.stringify(imgObj);

    $.ajax({
        url      : "verify.php",
        type     : "POST",
        data     :  data,
        dataType : 'text'
      }).done(function(response) {
        console.log(response)
    });
</script>

Here is our verify.php file:

$api_url = "http://api.kairos.com";
$app_id = "";
$app_key = "";

$request = curl_init($api_url . "/verify");
curl_setopt($request, CURLOPT_POST, true);
curl_setopt($request, CURLOPT_HTTPHEADER, array(
    "app_id:" . $app_id, 
    "app_key:" . $app_key
    )
);
curl_setopt($request,CURLOPT_POSTFIELDS, $_POST["imgObj"]);
curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($request);
echo $response;
curl_close($request);

##### This will give you a JSON object containing the verify analysis, similar to this:
    {
      "images": [
        {
          "transaction": {
            "status": "success",
            "subject_id": "Elizabeth",
            "width": 170,
            "height": 287,
            "topLeftX": 108,
            "topLeftY": 55,
            "confidence": 0.88309,
            "gallery_name": "MyGallery"
          }
        }
      ]
    }

## 5. SUCCESS! 

Now it's up to you to create applications using this technology: image search, security, gaming, and so on.  The uses are limitless.

Please feel free to borrow ideas from our application code.  We have used various libraries for our demo to enhance the presentation, for example:

* https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js -- *for basic page layout*
* https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js -- *for displaying messages via Handlebars, such as "Analyzing image", "Generating results", and error messages -- also used to display processing spinner*
* https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.12/clipboard.min.js -- *for copy to clipboard functionality*

Good luck with your Kairos API Application, and please let us know if we can answer any questions for you: https://www.kairos.com/contact

            

