/*
Enter values for:
APP_ID
APP_KEY

cd to detect-go directory
in Terminal, run: go run detect.go
open browser to: http://127.0.0.1:9090/
enter valid image URL
response from Kairos API will render in browser

to compile, 
run: go build detect.go
./emotion

This demo extracts base64 data from the imageUrl
form field and passes this data to the detect/
endpoint of the Kairos API

*/

package main

import (
    "html/template"
    "log"
    "io/ioutil"
    "net/http"
    "fmt"
    b64 "encoding/base64"
    "bytes"
    "encoding/json"
    "strings"
)

var API_URL,APP_ID,APP_KEY string = "api.kairos.com","",""

type ImgObj struct {
    Image  string `json:"image"`
}

type Response struct {
    ResponseObj string 
}

func doProcess(w http.ResponseWriter, r *http.Request) {
    if r.Method == "GET" {
        t, _ := template.ParseFiles("detect.gtpl")
        t.Execute(w, nil)
    } else {
        // get image url from form
        r.ParseForm()
        imageUrl := r.Form["imageUrl"]
        imageUrlString := strings.Join(imageUrl," ")
        res, err := http.Get(imageUrlString)
        if err != nil {
            log.Fatalf("http.Get -> %v", err)
        }
        // retrieve image data
        var data []byte

        data, err = ioutil.ReadAll(res.Body)
        sEnc := b64.StdEncoding.EncodeToString([]byte(data)) // convert to base64
        
        if err != nil {
            log.Fatalf("ioutil.ReadAll -> %v", err)
        }
        
        imgObj := ImgObj{
            Image:  sEnc,
        }
        jsonStr, _ := json.Marshal(imgObj) // create JSON object for API payload

        url := "https://" + API_URL + "/detect/"

        req, err := http.NewRequest("POST",url,bytes.NewBuffer(jsonStr))

        req.Header.Set("Content-Type", "application/json")
        req.Header.Set("app_id", APP_ID)
        req.Header.Set("app_key", APP_KEY)

        resp, err := http.DefaultClient.Do(req)
        if err != nil {
            fmt.Println(err)
        } 
        if resp.StatusCode == 200 {
            bodyBytes, err2 := ioutil.ReadAll(resp.Body)
            if err2 != nil {
                fmt.Println(err2)
            } else {
                bodyString := string(bodyBytes) 
                fmt.Println(bodyString)
                r := Response{ResponseObj:bodyString} //define an instance with required field
                t, _ := template.ParseFiles("response.gtpl")
                t.Execute(w, r) //merge template ‘t’ with content of ‘r’
            }
        }

        defer resp.Body.Close()
    }           
}

func main() {
    http.HandleFunc("/", doProcess) // setting router rule
    err := http.ListenAndServe(":9090", nil) // setting listening port
    if err != nil {
        log.Fatal("ListenAndServe: ", err)
    }
}