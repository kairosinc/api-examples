# API Examples 

## What it does
These demo apps showcase the Kairos APIs by giving the user a means to quickly get up and running with our Emotion Analysis and Facial Recognition / Detection APIs.

## Running the App
The demo app can easily be run using Docker with the included Dockerfile and docker-compose.yml.

The app is basically a single page application, which is viewed at index.php.

The easiest way to get started is to clone or fork the repo, edit the docker-compose.yml and add your APP_ID and API_KEY after signing up at [developer.kairos.com](https://developer.kairos.com) 

Then just run these commands to run Docker-Compose and start up the app locally on your machine:
```
make build && make run
```

---

##For more detailed documentation see the individual page for each module:

### Detect 
The Detect Demo uses Kairos Face Recognition API to detect a human face in an existing photo, or a snapshot from the user's webcam.
[Documentation](/demo/detect/README.md)

### Emotion
The Emotion Demo showcases the Kairos Emotion API by giving the user three methods for analyzing human emotions in a video stream.  
[Documentation](/demo/emotion/README.md)

### Face Race
The Face Race Demo showcases the Kairos Face Recognition API by allowing the user to upload a photo and allowing the systme to detect the ethic breakdown of the largest face in the image.
[Documentation](/demo/facerace/README.md)

### Recognize
The Recognize Demo uses Kairos Face Recognition API to reocgnize human faces from previously enrolled faces by the user.
[Documentation](/demo/recognize/README.md)

### Verify
Using the Kairos Face Recognition API, the Verify Demo compares two photos, and verifies that the two photos are of the same individual.
[Documentation](/demo/verify/README.md)


