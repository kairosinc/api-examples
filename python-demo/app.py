import os
import requests
import json
import time
import datetime
import base64
import urllib
from urllib2 import urlopen
from flask import Flask, render_template, request, json
app = Flask(__name__)

# get environment variables
try:
	demo_env = os.environ["STAGE"]
except:
	demo_env = "dev"

try:
	api_url = os.environ["API_URL"]
except:
	api_url = "https://api.kairos.com"

try:
	app_id = os.environ["APP_ID"]
except:
	app_id = "YOUR_APP_ID"

try:
	app_key = os.environ["APP_KEY"]
except:
	app_key = "YOUR_APP_KEY"

headers = {
	# "Content-Type": "application/json",
    "app_id": app_id,
    "app_key": app_key
}


@app.route('/')
def RenderMainIndex():
    return render_template('index.html')

@app.route('/detect')
def renderDetect():
	return render_template("detect.html", APP_ID=app_id, APP_KEY=app_key, API_URL=api_url, CACHE_BUSTER=CacheBuster())

@app.route('/detect/send-to-api', methods=['POST'])
def sendToApiDetect():
	url = api_url + '/detect'
	payload = request.form['imgObj']
	r = requests.post(url, data=payload, headers=headers)
	return r.content

@app.route('/emotion')
def renderEmotion():
	return render_template("emotion.html", APP_ID=app_id, APP_KEY=app_key, API_URL=api_url, CACHE_BUSTER=CacheBuster())

@app.route('/emotion/send-to-api', methods=['POST'])
def sendToApiEmotion():
	if request.form['fname'] == "polling":
		mediaId = request.form['mediaId']
		url = api_url + "/v2/media/" + mediaId
		r = requests.get(url, headers=headers)
		return r.content
	elif request.form['fname'] == "analytics":
		mediaId = request.form['mediaId']
		url = api_url + "/v2/analytics/" + mediaId
		r = requests.get(url, headers=headers)
		return r.content
	elif request.form['fname'] == "urlGetContent":
		res = urlopen(request.form['urlPath'])
		contentLength = res.headers["content-length"]
		contentType = res.headers["content-type"]
		r = requests.get(request.form['urlPath']).content
		b = base64.b64encode(r)
		content = {"contentLength": contentLength, "contentType": contentType, "base64Str": b}
		return json.dumps(content)
	elif request.form['fname'] == "urlProcess":
		mediaUrl = request.form['urlPath']
		url = api_url + "/v2/media?source=" + mediaUrl + "&landmarks=1&timeout=1"
		print url
		r = requests.post(url, headers=headers)
		return r.content
	elif request.form['fname'] == "webcam":
		filename = request.form["videoId"]
		fullFilename = filename + ".webm"
		videoData = request.form["videoData"]
		filePath = "static/tmp/emotion/" + fullFilename
		# write file to tmp directory
		with open(filePath, "wb") as fileUpload:
			fileUpload.write(videoData.decode('base64'))
		fileUpload.close()
		url = api_url + "/v2/media?landmarks=1"
		files = [('source', open(filePath, 'rb'))]
		# upload Multipart-Encoded File
		fileUpload = requests.post(url, files=files, headers=headers)
		fileUpload.close()
		os.remove(filePath)
		return fileUpload.content
	elif request.form['fname'] == "fileupload":
		# data = json.loads(request.form["file"])
		file = request.files['file']
		filePath = "static/tmp/emotion/" + file.filename
		
		with open(filePath, "wb") as fileUpload:
			fileUpload.write(file.read())

		url = api_url + "/v2/media?landmarks=1"
		files = [('source', open(filePath, 'rb'))]
		# upload Multipart-Encoded File
		fileUpload = requests.post(url, files=files, headers=headers)
		fileUpload.close()
		os.remove(filePath)
		return fileUpload.content
@app.route('/recognize')
def renderRecognize():
	return render_template("recognize.html", APP_ID=app_id, APP_KEY=app_key, API_URL=api_url, CACHE_BUSTER=CacheBuster())

@app.route('/recognize/send-to-api', methods=['POST'])
def sendToApiRecognize():
	if request.form['process'] == "enroll":
		url = api_url + '/enroll'
		payload = request.form['imgObj']
		r = requests.post(url, data=payload, headers=headers)
		return r.content
	if request.form['process'] == "recognize":
		url = api_url + '/recognize'
		payload = request.form['imgObj']
		r = requests.post(url, data=payload, headers=headers)
		return r.content

@app.route('/verify')
def renderVerify():
	return render_template("verify.html", APP_ID=app_id, APP_KEY=app_key, API_URL=api_url, CACHE_BUSTER=CacheBuster())

@app.route('/verify/send-to-api', methods=['POST'])
def sendToApiVerify():
	if request.form['process'] == "enroll":
		url = api_url + '/enroll'
		payload = request.form['imgObj']
		r = requests.post(url, data=payload, headers=headers)
		return r.content
	if request.form['process'] == "verify":
		url = api_url + '/verify'
		payload = request.form['imgObj']
		r = requests.post(url, data=payload, headers=headers)
		return r.content




# utility functions
# ExifData needs to be written
@app.route('/exif-data', methods=['POST'])
def ExifData():
	return ""

def CacheBuster():
    timestamp = int(time.time())
    now = datetime.datetime.now()
    cache_buster = str(now.year) + str(now.month) + str(now.day)
    if demo_env == "dev":
        cache_buster = timestamp
    return cache_buster


if __name__ == "__main__":
    app.run(debug=True,host='0.0.0.0',port=5000,ssl_context=('cert.pem', 'key.pem'))