# Go Demo
Kairos Go Demo Suite

## About
This suite consists of 5 demos:

### Detect 
The Detect Demo uses Kairos Face Recognition API to detect a human face in an existing photo, or a snapshot from the user's webcam.
[Documentation](/go-demo/assets/docs/detect/Detect.md)

### Emotion
The Emotion Demo showcases the Kairos Emotion API by giving the user three methods for analyzing human emotions in a video stream.  
[Documentation](/go-demo/assets/docs/emotion/Emotion.md)

### Face Race
The Face Race Demo showcases the Kairos Face Recognition API by allowing the user to upload a photo and allowing the systme to detect the ethic breakdown of the largest face in the image.
[Documentation](/go-demo/assets/docs/facerace/Facerace.md)

### Recognize
The Recognize Demo uses Kairos Face Recognition API to recognize human faces from previously enrolled faces by the user.
[Documentation](/go-demo/assets/docs/recognize/Recognize.md)

### Verify
Using the Kairos Face Recognition API, the Verify Demo compares two photos, and verifies that the two photos are of the same individual.
[Documentation](/go-demo/assets/docs/verify/Verify.md)

## Environment Setup and Installation

The demo app can easily be run using Docker with the included Dockerfile and docker-compose.yml.

The app is basically a single page application, which is viewed at index.php.

Sign-up for your API key via [developer.kairos.com](https://developer.kairos.com) and check your inbox for an activation link. You should now have your `APP_ID` and `APP_KEY`

Enter your personal keys into the docker-compose.yml file:

    version: '2'
    services:
      demo:
        image: demo
        expose:
          - "8080"
        ports:
          - "8080:80"
        environment:
          STAGE: prod
          AWS_S3_REGION: "your-aws-s3-region"
          AWS_S3_UPLOAD_BUCKET: "your-aws-upload-bucket"
          APP_ID: "your-app-id"
          APP_KEY: "your-app-key"
          API_URL: "https://api.kairos.com"
          API_TIMEOUT: "10" 
          POLL_TIMEOUT: "300"
          DEMO1_ID: "leave-blank"
          DEMO_SECRET_KEY: "leave-blank"
          XDEBUG: "true"
          XDEBUG_CONFIG: "remote_host=10.254.254.254"
        volumes:
          - ./demo:/var/www/app/demo
          
The AWS keys aren't necessary unless you're running the Facerace demo.

To run your app locally, you can install your personal keys into the `getEnvVariables()` function in the handler-functions.go file:

```
func getEnvVariables() envVariables {
  demo_env := os.Getenv("STAGE")
  if os.Getenv("STAGE") == "" {
    demo_env = "dev"
  }
  var api_url string = os.Getenv("API_URL")
  if os.Getenv("API_URL") == "" {
    api_url = "api.kairos.com"
  }
  var app_id string = os.Getenv("APP_ID")
  if os.Getenv("APP_ID") == "" {
    app_id = "your-app-id"
  }
  var app_key string = os.Getenv("APP_KEY")
  if os.Getenv("APP_KEY") == "" {
    app_key = "your-app-key"
  }

  envVars := envVariables{api_url, app_id, app_key, demo_env}
  return envVars
}
```

* Download and install Go `brew install golang`
* Choose a folder for your Go workspace such as `$HOME/go`
* Set your `GOPATH` and PATH variables in your `.bash_profile` such as: 
```bash
export GOPATH=$HOME/go
export PATH=$GOPATH/bin:$PATH
```

* Create a directory for your new project
* Clone the `go-demo` repo: `git clone https://github.com/kairosinc/go-demo <project_name>`

Then, cd to your demo repo, and run:
```
make build

make run
```
You will then be able to access the UI at http://localhost:8080:80 (if running using Docker for Mac or Docker for Windows)

To stop the Docker container:

```
docker stop $(docker ps -q)
```

Note: This will stop all running containers not just this one

## Miscellaneous

For now, there is 1 framework included (`echo`). Echo is a beefed up version of `mux` and includes things like pre and post processing or routes.

The following custom golang files are used:
* main.go - handles routes and renders HTML pages
* handler-functions.go - contains handler functions and relevant structures

## Make this better

Pull requests accepted!! 
...


