/*
Enter values for:
APP_ID
APP_KEY

cd to emotion-go directory
in Terminal, run: go run emotion.go
open browser to: http://127.0.0.1:9090/
enter valid video URL
response from Kairos API will render in browser

to compile, run: go build emotion.go
then, to run program: ./emotion

*/

package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
    "io/ioutil"
    "strings"
)

// set your APP_ID and APP_KEY
var API_URL,APP_ID,APP_KEY string = "api.kairos.com","APP_ID","APP_KEY"

type Response struct {
    ResponseObj string 
}

func doProcess(w http.ResponseWriter, r *http.Request) {
    if r.Method == "GET" {
        t, _ := template.ParseFiles("emotion.gtpl")
        t.Execute(w, nil)
    } else {
        r.ParseForm()
        source := r.Form["videoUrl"] // set form data
        sourceString := strings.Join(source," ") // convert to string
        url := "https://" + API_URL + "/v2/media?source="
        completeUrl := url + sourceString // set url string
        req, err := http.NewRequest("POST",completeUrl,nil) // set http request

        // set response headers
        req.Header.Set("Content-Type", "application/json")
        req.Header.Set("app_id", APP_ID)
        req.Header.Set("app_key", APP_KEY)

        resp, err := http.DefaultClient.Do(req) // make http request
        if err != nil {
            fmt.Println(err)
        } 
        if resp.StatusCode == 200 { // if response is successful, read response
            bodyBytes, err2 := ioutil.ReadAll(resp.Body)
            if err2 != nil {
                fmt.Println(err2)
            } else {
                bodyString := string(bodyBytes) // set response body
                fmt.Println(bodyString)
                r := Response{ResponseObj:bodyString} // define an instance with required field
                t, _ := template.ParseFiles("response.gtpl")
                t.Execute(w, r) // merge template ‘t’ with content of ‘r’
            }
        }

        defer resp.Body.Close()
    }
}

func main() {
    http.HandleFunc("/", doProcess) // set router rule
    err := http.ListenAndServe(":9090", nil) // set listening port
    if err != nil {
        log.Fatal("ListenAndServe: ", err)
    }
}