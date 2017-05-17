#!/usr/bin/python

import requests

url = "https://api.kairos.com/detect"

headers = {
    'app_id': '',
    'app_key': ''
    }

files = {'image': open('test1.jpg', 'rb')}

r = requests.post( url, headers=headers, files=files )

print r.text


