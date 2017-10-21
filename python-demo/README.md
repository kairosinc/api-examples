# Kairos Python/Javascript Demo Modules

## What it does
These demo apps showcase the Kairos APIs by giving the user a means to quickly get up and running with our Emotion Analysis and Facial Recognition / Detection APIs.

## Running the App
The demo app can easily be run using Docker with the included Dockerfile and docker-compose.yml or locally using a solution stack program such as MAMP or WAMP.

The app is basically a single page application, which is viewed at index.html.

The easiest way to get started is to clone or fork the repo, and add your APP_ID and API_KEY to the app.py file after signing up at [developer.kairos.com](https://developer.kairos.com) 

The webcam functionality requires that your site is secure (https).  In order to run your local install using https, you will need to generate a certificate and a key.  To to this, run this command:

```openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365```

Follow the prompts, and this will generate two files: `cert.pem` and `key.pem`.  These files are used so that the app will spin up a secure browser:

`if __name__ == "__main__":
    app.run(debug=True,host='0.0.0.0',ssl_context=('cert.pem', 'key.pem'))`

### Run the app locally from your command prompt 
* make sure Python 2.7 is installed and accessible
* install Python Flask `pip install flask`
* cd into the python-demo repo
* run `python app.py`
* point your browser to `https://127.0.0.1:5000`

### Run the app in a Docker container
* the app uses Python 2.7
* cd into the python-demo repo
* run `docker build -t pythondemo .`
* after the app compiles, run `docker run -d -p 5000:5000 pythondemo`
* run python app.py
* point your browser to `https://127.0.0.1:5000`

---

### Detect 
The Detect Demo uses Kairos Face Recognition API to detect a human face in an existing photo, or a snapshot from the user's webcam.
[Documentation](/python-demo/static/docs/detect/Detect.md)

### Emotion
The Emotion Demo showcases the Kairos Emotion API by giving the user three methods for analyzing human emotions in a video stream.  
[Documentation](/python-demo/static/docs/emotion/Emotion.md)

### Recognize
The Recognize Demo uses Kairos Face Recognition API to recognize human faces from previously enrolled faces by the user.
[Documentation](/python-demo/static/docs/recognize/Recognize.md)

### Verify
Using the Kairos Face Recognition API, the Verify Demo compares two photos, and verifies that the two photos are of the same individual.
[Documentation](/python-demo/static/docs/verify/Verify.md)

---

#### Caching
To cache an asset, add: `?t_{{CACHE_BUSTER}}` to the end of the resource link, for example:
`<link rel="stylesheet" href="https://media.kairos.com/python-demo/detect/css/detect.css?t_{{CACHE_BUSTER}}">` 






