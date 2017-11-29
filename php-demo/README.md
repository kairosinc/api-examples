# PHP Demo 

## What it does
This demo app the Kairos APIs by giving the user a means to quickly get up and running with our Emotion Analysis and Facial Recognition / Detection APIs.

The demo suite consists of 5 demos:

### Detect 
The Detect Demo uses Kairos Face Recognition API to detect a human face in an existing photo, or a snapshot from the user's webcam.
[Documentation](/php-demo/detect/README.md)

### Emotion
The Emotion Demo showcases the Kairos Emotion API by giving the user three methods for analyzing human emotions in a video stream.  
[Documentation](/php-demo/emotion/README.md)

### Face Race
The Face Race Demo showcases the Kairos Face Recognition API by allowing the user to upload a photo and allowing the systme to detect the ethic breakdown of the largest face in the image.
[Documentation](/php-demo/facerace/README.md)

### Recognize
The Recognize Demo uses Kairos Face Recognition API to recognize human faces from previously enrolled faces by the user.
[Documentation](/php-demo/recognize/README.md)

### Verify
Using the Kairos Face Recognition API, the Verify Demo compares two photos, and verifies that the two photos are of the same individual.
[Documentation](/php-demo/verify/README.md)


## Installation

The demo app can easily be run either locally or using Docker with the included Dockerfile and docker-compose.yml.

The app is basically a single page application, which is viewed at index.php.

Sign-up for your API key via [developer.kairos.com](https://developer.kairos.com) and check your inbox for an activation link. You should now have your `APP_ID` and `APP_KEY`


#### Clone or fork the repo, and git clone via command-line (CLI):
   ```
   cd $HOME/Desktop
   git clone https://github.com/kairosinc/api-examples.git
   ```
#### Running the app on your local system

* The application can be run from a server, such as MAMP, WAMP, LAMP OR XAMPP, or another type of virtual machine or solution stack.
* Insert your Kairos API ID and Key into the config.php file, which is at the root of the demo directory.
* The demo should render at the the host that you designated in your stack or virtual machine: {host}/demo/emotion/
* NOTE: The webcam functionality requires that your app has SSL enabled.  To do this, you can create a self-signed certificate and key and add these to your config settings.  MAMP Pro will create the certificate files and then add them to your config automatically.  If you're using Apache, the standard SSL port will be 443, so your demo will render here: https://{host}/demo/emotion/

#### Running the app in a Docker container
* Enter your personal keys into the docker-compose.yml file:
```
    version: '2'
    services:
      demo:
        image: demo
        expose:
          - "8080"
        ports:
          - "8080:80"
        environment:
          STAGE: dev
          AWS_S3_REGION: "us-east-1"
          AWS_S3_UPLOAD_BUCKET: "valid-s3-bucket-here"
          APP_ID: "your-app-id-here"
          APP_KEY: "your-app-key-here"
          API_URL: "https://api.kairos.com"
          API_TIMEOUT: "10" 
          POLL_TIMEOUT: "300"
          DEMO1_ID: "x"
          DEMO_SECRET_KEY: "abc123"
          XDEBUG: "true"
          XDEBUG_CONFIG: "remote_host=10.254.254.254"
        volumes:
          - .:/var/www/app/php-demo
  ```
* The AWS keys aren't necessary unless you're running the Facerace demo.  For more information about using XDEBUG with PHPStorm, go to: https://gist.github.com/coleca/c227543fbed515e4eb4c058a7455c581

* Run the following commands, which will build your Docker container and execute Docker-Compose run to start up the app locally on your machine:
  ```
  make build
  make run
  ```
* Once your app is running, you can visit `http://localhost:8080` in your browser to view the demo examples.

* To stop the Docker container:

```
docker stop $(docker ps -q)
```

Note: This will stop all running containers not just this one

## Make this better

Pull requests accepted!! 





