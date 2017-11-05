#!/usr/bin/python

import requests
import base64

url = "https://api.kairos.com/detect"

headers = {
    'app_id': '',
    'app_key': '',
    'content-type': 'application/json'
    }


with open("test1.jpg", "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read())

payload = "{\"image\":\"" + encoded_string + "\"}"

r = requests.post(url, headers=headers, data=payload)

print r.text


