# Kairos Ruby/Javascript Demo Modules

## What it does
These demo apps showcase the Kairos APIs by giving the user a means to quickly get up and running with our Emotion Analysis and Facial Recognition / Detection APIs.

## Running the App
The demo app can easily be run using Docker with the included Dockerfile and docker-compose.yml or locally from your command prompt.

The app is basically a single page application, which is viewed at index.html.

The easiest way to get started is to clone or fork the repo, and add your APP_ID and API_KEY to the app.rb file after signing up at [developer.kairos.com](https://developer.kairos.com) 

#### Install Ruby
From your command prompt, run `rvm install ruby-2.3.0` or the latest version.
#### Install dependencies
From your command prompt, run:

* `gem install sinatra`
* `gem install rest-client`
* `gem install httparty`

#### Run application

Run `ruby app.rb`

Point your browser to `http://127.0.0.1:4567/`

### Detect 
The Detect Demo uses Kairos Face Recognition API to detect a human face in an existing photo, or a snapshot from the user's webcam.
[Documentation](/ruby-demo/public/docs/detect/Detect.md)

### Emotion
The Emotion Demo showcases the Kairos Emotion API by giving the user three methods for analyzing human emotions in a video stream.  
[Documentation](/ruby-demo/public/docs/emotion/Emotion.md)

### Recognize
The Recognize Demo uses Kairos Face Recognition API to recognize human faces from previously enrolled faces by the user.
[Documentation](/ruby-demo/public/docs/recognize/Recognize.md)

### Verify
Using the Kairos Face Recognition API, the Verify Demo compares two photos, and verifies that the two photos are of the same individual.
[Documentation](/ruby-demo/public/docs/verify/Verify.md)


