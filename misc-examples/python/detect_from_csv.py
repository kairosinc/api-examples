#!/usr/bin/python

##
## This script takes in a CSV file of image IDs, image URLs and runs the /detect method against each
##  image to find the ethnicity, age, gender and glasses values of each of the faces within the image
##  and writes the output to another CSV file
##

import requests
import csv
import argparse
import json


def main(inputfilename, outputfilename):
    url = "https://api.kairos.com/detect"

    headers = {
        'app_id': '',
        'app_key': ''
        }

    with open(outputfilename, 'w') as output_file:
        writer = csv.writer(output_file, delimiter=",")

        with open(inputfilename, "rU") as input_file:
            read_input = csv.reader(input_file, delimiter=',')
            for row in read_input:
                image_id = row[0]
                image_url = row[1]

                payload = '{"image": "' + image_url + '"}'
                r = requests.post(url, data=payload, headers=headers)
                j = json.loads(r.text)
                if 'Errors' not in j:
                    for face in j['images'][0]['faces']:
                        values = [image_id, image_url, face['face_id'], face['attributes']['age'], face['attributes']['gender']['type'], face['attributes']['asian'], face['attributes']['black'], face['attributes']['hispanic'], face['attributes']['other'], face['attributes']['white'], face['attributes']['glasses']]
                        writer.writerow(values)
                        print r.text
                else:
                    values = [image_id, image_url, j['Errors'][0]['ErrCode'], j['Errors'][0]['Message']]
                    writer.writerow(values)
                    print r.text


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('inputfilename', help='Enter the filename of the CSV to read as input')
    parser.add_argument('outputfilename', help='Enter the filename of the CSV to write to')
    args = parser.parse_args()
    main(args.inputfilename,args.outputfilename)