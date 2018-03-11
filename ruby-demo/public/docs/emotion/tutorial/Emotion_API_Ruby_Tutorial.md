# How to create an Emotion application

Here at Kairos, we've created an application that demonstrates the way our tech can be used to detect human emotion from video.  This Kairos Emotion API demo contains four modules: Examples, Webcam, Upload and URL from the web.  Any of these modules can be modified, or separated from the main framework and used as standalone applications.  The following is a step by step tutorial designed to get your Kairos Emotion API application up and running.  Then we'll show you how you can customize these modules to suit your needs.

## 1. Get the code

Clone or fork the repo at https://github.com/kairosinc/api-examples

## 2. Get your keys

* Go to the Kairos website at http://kairos.com/pricing and click GET YOUR FREE API KEY at the bottom of the page.

![Kairos Website](/ruby-demo/public/docs/emotion/kairos_website.png?raw=true)

Fill out the online form.

![Registration Form](/ruby-demo/public/docs/emotion/registration_form.png?raw=true)

* You will receive a confirmation email.  Click on the link in the email, to activate your account.  This will take you to a page with your API ID and Key.

![ID and Key](/ruby-demo/public/docs/emotion/id_and_key.png?raw=true)

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
* Point your browser to `http://127.0.0.1:4567/emotion`

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
    post "/emotion/send-to-api" do
        url = api_url + "/emotion"
        payload = request["imgObj"]
        return RestClient.post(url,payload,headers=headers)
    end


## 5. Create an upload application

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
        
Our Ruby script in app.rb for processing file uploads looks like this:

    elsif request["fname"] == "fileupload"
            # get file from tempfile directory on local system
            @filename = params[:file][:filename]
            file = params[:file][:tempfile]
            # copy to tmp folder in public directory
            filepath = "./public/tmp/#{@filename}"
            # open the file
            File.open(filepath, "wb") do |f|
                f.write(file.read)
            end
            # set Kairos URL endpoint
            url = api_url + "/v2/media?landmarks=1"
            # get video file and set payload
            video = File.new(filepath, "rb")
            payload = {"source" => video}
            # delete tmp file
            File.delete(filepath)
            # make request with payload
            return RestClient.post(url,payload,headers=headers)
        
This should return a JSON response similar to these:

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


    post "/emotion/send-to-api" do
        if request["fname"] == "polling"
            # get mediaId from form
            mediaId = request["mediaId"]
            # set API url path
            url = api_url + "/v2/media/" + mediaId
            # make request to the API with the mediaId
            return RestClient.get(url,headers=headers)
    end

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

## 6. Create a URL from the web application

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
        
* Your Ruby script should return a JSON response similar to the one in the upload portion of the tutorial.  Use your polling script to get the emotion response from the mediaId.  

## 7. SUCCESS! 

Now it's up to you to create applications using this technology: image search, security, gaming, and so on.  The uses are limitless.

Please feel free to borrow ideas from our application code.  We have used various libraries for our demo to enhance the presentation, for example:

* https://code.jquery.com/ui/1.10.2/jquery-ui.js -- *for video player UI*
* https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js -- *for basic page layout*
* https://code.highcharts.com/highcharts.js -- *for graphic display of emotion analysis*
* https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.12/clipboard.min.js -- *for copy to clipboard functionality*
* https://cdn.WebRTC-Experiment.com/gumadapter.js -- *for getUserMedia browser support*
    
Good luck with your Kairos API Application, and please let us know if we can answer any questions for you: https://www.kairos.com/contact

            

