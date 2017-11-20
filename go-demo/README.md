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

The demo app can easily be run locally.

The app is basically a single page application, which is viewed at index.php.

Sign-up for your API key via [developer.kairos.com](https://developer.kairos.com) and check your inbox for an activation link. You should now have your `APP_ID` and `APP_KEY`

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

make install

```

Then, type bin/app, and the site will render at http://localhost:8080

## Miscellaneous

For now, there is 1 framework included (`echo`). Echo is a beefed up version of `mux` and includes things like pre and post processing or routes.

The following custom golang files are used:
* main.go - handles routes and renders HTML pages
* handler-functions.go - contains handler functions and relevant structures

## Make this better

Pull requests accepted!! 
...


