#!/usr/bin/python

import requests

url = 'https://api.kairos.com/enroll'

values =  {
    "subject_id": "Michael-Scott",
    "gallery_name": "Office"
  }


headers = {
  'Content-Type': 'application/json',
  'app_id': '',
  'app_key': ''
}

files = {'image': open('test1.jpg', 'rb')}

r = requests.post(url, data=values, headers=headers, files=files)


print r

