# API Examples 

## What it does
These demo apps showcase the Kairos APIs by giving the user a means to quickly get up and running with our Emotion Analysis and Facial Recognition / Detection APIs.

## Running the App
The demo app can easily be run using Docker with the included Dockerfile and docker-compose.yml.

The app is basically a single page application, which is viewed at index.php.

Sign-up for your API key via [developer.kairos.com](https://developer.kairos.com) and check your inbox for an activation link. You should now have your `APP_ID` and `APP_KEY`:

#### Steps:

1. clone or fork the repo, and git clone via command-line (CLI):
   ```
   cd $HOME/Desktop
   git clone git@github.com:kairosinc/api-examples.git
   ```
2. Edit the `docker-compose.yml` file in the root project directory to add your `APP_ID` and `API_KEY` in the following lines, and save the file:
  ```
  APP_ID: "your-app-id-here"
  APP_KEY: "your-app-key-here"
  ```

3. Run the following commands, which will build your Docker container and execute Docker-Compose run to start up the app locally on your machine:
  ```
  make build && make run
  ```

Once your app is running, you can visit [http://localhost:8080](http://localhost:8080) on your browser to view the demo examples.

---

## For more detailed documentation see the individual page for each module:

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


