# How to create a Detect application

Here at Kairos, we've created an application that demonstrates the way our tech can be used to detect a human face in an image.  Our Kairos Detect demo contains four modules: Examples, Webcam, Upload and URL from the web.  Any of these modules can be modified, or separated from the main framework and used as standalone applications.  The following is a step by step tutorial designed to get your Kairos Detect application up and running.  Then we'll show you how you can customize these modules to suit your needs.

## 1. Get the code

Clone or fork the repo at https://github.com/kairosinc/api-examples

## 2. Get your keys

* Go to the Kairos website at http://kairos.com/pricing and click GET YOUR FREE API KEY at the bottom of the page.

![Kairos Website](/ruby-demo/public/docs/detect/kairos_website.png?raw=true)

Fill out the online form.

![Registration Form](/ruby-demo/public/docs/detect/registration_form.png?raw=true)

* You will receive a confirmation email.  Click on the link in the email, to activate your account.  This will take you to a page with your API ID and Key.

![ID and Key](/ruby-demo/public/docs/detect/id_and_key.png?raw=true)

## 3. Run the app 

Insert your Kairos API ID and Key into the app.rb file, which is at the root of the ruby-demo directory.

    api_url = "https://api.kairos.com"
    app_id = "YOUR_APP_ID"
    app_key = "YOUR_APP_KEY"
        
* make sure Ruby is installed and accessible.  From your command prompt, run `rvm install ruby-2.3.0` or the latest version.

From your command prompt, run:
* `gem install sinatra`
* `gem install rest-client`
* `gem install httparty`

Then:
* cd into the ruby-demo repo
* run `ruby app.rb`
* Point your browser to `http://127.0.0.1:4567/detect`


## 4. Create your own custom applications

* For the following applications, we recommend using the `app.rb` file in the repo as a basis.  This file contains more functionality than you'll need, so if you'd like, you can strip out all but the necessary scripts.  
* These dependencies are required:


    require "sinatra"
    require "rest-client"
    require "base64"
    require "httparty"
    
* This script sends a payload to the Kairos API:

    api_url = 'https://api.kairos.com'
    headers = {
        "app_id": YOUR_APP_ID,
        "app_key": YOUR_APP_KEY
    }
    post "/detect/send-to-api" do
        # set API url path
        url = api_url + "/detect"
        # set payload
        payload = request["imgObj"]
        # make request to the API
        return RestClient.post(url,payload,headers=headers)
    end




## 5. Create an upload application


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
        imgObj = { 
            "image"   : parseImageData(imageData)
        };
        // POST imageData to Ruby script via AJAX 
        (see "Send to Kairos API" section above)
    }
        
* Remember to use the `parseImageData()` function to remove the "data" attributes.


    parseImageData: function(imageData) {
        imageData = imageData.replace("data:image/jpeg;base64,", "");
        imageData = imageData.replace("data:image/jpg;base64,", "");
        imageData = imageData.replace("data:image/png;base64,", "");
        imageData = imageData.replace("data:image/gif;base64,", "");
        imageData = imageData.replace("data:image/bmp;base64,", "");
        return imageData;
    }

* This is the Ruby script we use in our demo for image detect:



     post "/detect/send-to-api" do
        # set API url path
        url = api_url + "/detect"
        # set payload
        payload = request["imgObj"]
        # make request to the API
        return RestClient.post(url,payload,headers=headers)
    end

* Your Ruby script should return a JSON response similar to the one in the webcam portion of the tutorial.     

## 6. Create a URL from the web application


* Create a simple form element.

        <form method="post"> 
            <input type="text" />
            <input type="Submit" />
        </form>
        
* There's no need to extract data from the image.  Just POST the image URL string directly to the Ruby script.

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
        
* And, as in the previous applications, your Ruby script should return a JSON response which can be used as you wish. 
---

## 7. SUCCESS! 

Now it's up to you to create applications using this technology: image search, security, gaming, and so on.  The uses are limitless.

Please feel free to borrow ideas from our application code.  We have used various libraries for our demo to enhance the presentation, for example:

* https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js -- *for basic page layout*
* https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.12/clipboard.min.js -- *for copy to clipboard functionality*

Good luck with your Kairos API Application, and please let us know if we can answer any questions for you: https://www.kairos.com/contact





            

