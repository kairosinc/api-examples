package handlers

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/labstack/echo"
	"image"
	_ "image/png" // allow to decode PNG and JPEG
	"io"
	"io/ioutil"
	"mime"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"app/utils"
	exif "app/utils/exif"
	"app/utils/orientation"
)

type PageVarsDetect struct {
	CacheBuster string
	APP_ID      string
	APP_KEY     string
	API_URL     string
}

type PageVarsFacerace struct {
	CacheBuster  string
	DemoEnv      string
	PreviewImage string
	APP_ID       string
	APP_KEY      string
	API_URL      string
}

type PageVarsRecognize struct {
	CacheBuster string
	APP_ID      string
	APP_KEY     string
	API_URL     string
}

type PageVarsVerify struct {
	CacheBuster string
	APP_ID      string
	APP_KEY     string
	API_URL     string
}

type PageVarsEmotion struct {
	CacheBuster string
	APP_ID      string
	APP_KEY     string
	API_URL     string
}

type Image struct {
	Status string
	Width  int
	Height int
	File   string
}

type ApiResponse struct {
	Images           []Image
	UploadedImageURL string `json:"uploaded_image_url"`
}

type envVariables struct {
	API_URL string
	APP_ID  string
	APP_KEY string
	ENV_VAR string
}

type S3Data struct {
	Url string `json:"s3_url"`
}

var (
	renderImageWidth  = 440
	renderImageHeight = 440
)

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
		app_id = ""
	}
	var app_key string = os.Getenv("APP_KEY")
	if os.Getenv("APP_KEY") == "" {
		app_key = ""
	}

	envVars := envVariables{api_url, app_id, app_key, demo_env}
	return envVars
}

func RenderMainIndex(c echo.Context) error {
	return c.Render(http.StatusOK, "mainindex", nil)
}

// Detect Damo
func RenderDetect(c echo.Context) error {
	pageVars := PageVarsDetect{
		cacheBuster(),
		getEnvVariables().API_URL,
		getEnvVariables().APP_ID,
		getEnvVariables().APP_KEY,
	}
	return c.Render(http.StatusOK, "detect", &pageVars)
}

func SendToApiDetect(c echo.Context) error {
	r := c.Request()
	r.ParseForm()

	imgObj := r.Form["imgObj"]
	imgObjString := strings.Join(imgObj, " ")

	url := getURLFromAPIMethod("detect")

	req, reqError := http.NewRequest("POST", url, bytes.NewBufferString(imgObjString))
	if reqError != nil {
		fmt.Println(reqError)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("app_id", getEnvVariables().APP_ID)
	req.Header.Set("app_key", getEnvVariables().APP_KEY)

	resp, respError := http.DefaultClient.Do(req)
	if respError != nil {
		fmt.Println(respError)
	}

	if resp.StatusCode == 200 {
		bodyBytes, readError := ioutil.ReadAll(resp.Body)
		if readError != nil {
			fmt.Println(readError)
		} else {
			bodyString := string(bodyBytes)
			return c.String(http.StatusOK, string(bodyString))
		}
	}
	return c.String(http.StatusOK, "")
}

// facerace demo
func RenderFacerace(c echo.Context) error {
	demo_env := os.Getenv("STAGE")
	if os.Getenv("STAGE") == "" {
		demo_env = "dev"
	}
	demo_preview_image := os.Getenv("DEMO_PREVIEW_IMAGE")
	if os.Getenv("DEMO_PREVIEW_IMAGE") == "" {
		demo_preview_image = "https://media.kairos.com/demo/facerace/demo-elizabeth.png"
	}
	pageVars := PageVarsFacerace{
		cacheBuster(),
		demo_env,
		demo_preview_image,
		getEnvVariables().API_URL,
		getEnvVariables().APP_ID,
		getEnvVariables().APP_KEY,
	}
	return c.Render(http.StatusOK, "facerace", &pageVars)
}

func SendToApiFacerace(c echo.Context) error {
	r := c.Request()
	r.ParseForm()
	imgObj := r.Form["imgObj"]
	imgObjString := strings.Join(imgObj, " ")
	byt := []byte(imgObjString)

	var dat map[string]interface{}
	if err := json.Unmarshal(byt, &dat); err != nil {
		panic(fmt.Sprintf("canonical_log=1 log_type=error message=\"%s\"", err))
	}

	imageData := dat["image"].(string)

	uploadedFileNameExt := generateRandomImageFilename("jpg")
	uploadedOrigFilePath := filepath.Join("assets/tmp/facerace", "orig_"+uploadedFileNameExt)

	/**
	NOTE: Stdlib image.Decode() has a bug that strips out the EXIF data, thus never adds it back after
	manipulation - therefore, we will manually detect Exif orientation tags & rotate the image, then save
	the new transformed image into the same file before continuing.

	Golang Issue (unresolved): https://github.com/golang/go/issues/12202
	**/

	_, conversionErr := ConvertBase64StringToImageFile(imageData, uploadedOrigFilePath)
	if conversionErr != "" {
		panic(fmt.Sprintf("canonical_log=1 log_type=error message=\"%s\"", conversionErr))
	}

	url := getURLFromAPIMethod("detect")
	req, err := http.NewRequest("POST", url, bytes.NewBufferString(imgObjString))

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("app_id", getEnvVariables().APP_ID)
	req.Header.Set("app_key", getEnvVariables().APP_KEY)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
	}
	response := ""
	if resp.StatusCode == 200 {
		bodyBytes, err2 := ioutil.ReadAll(resp.Body)
		if err2 != nil {
			fmt.Println(fmt.Sprintf("canonical_log=1 log_type=error message=\"%s\"", err2))
		} else {
			bodyString := string(bodyBytes)
			b := []byte(bodyString)
			res := ApiResponse{}

			err := json.Unmarshal(b, &res)
			if err != nil {
				fmt.Println(fmt.Sprintf("canonical_log=1 log_type=error message=\"Unable to parse API response for %s\"", uploadedFileNameExt))
				panic("Unable to parse API response")
			}

			if res.Images == nil {
				deleteFile(uploadedOrigFilePath)
				return c.String(http.StatusOK, bodyString)
			}

			fixOrientationFilePath := filepath.Join("assets/tmp/facerace", "orient_"+uploadedFileNameExt)
			remoteURL := res.UploadedImageURL

			// @WIP - native Exif orientation detection and rotation
			//fixOrientationFilePath := filepath.Join("assets/tmp/facerace", "orient_"+uploadedFileNameExt)
			//imageIsRotated := orientation.RotateImageIfNotOrientedCorrectly(uploadedOrigFilePath, fixOrientationFilePath)

			// @NOTE: temporary solution to grab the rotated image from kairosid > S3 processed file.
			downloaded, downloadErr := orientation.DownloadRemoteURL(remoteURL, fixOrientationFilePath)
			if downloaded == false && downloadErr != "" {
				deleteFile(uploadedOrigFilePath)
				return c.String(http.StatusOK, bodyString)
			}

			// if image rotation was performed then lets use the new file path:
			if downloaded == true {
				deleteFile(uploadedOrigFilePath)
				uploadedOrigFilePath = fixOrientationFilePath
			}

			// this is the name for the image that is uploaded to S3
			imageFilename := strings.Replace(res.Images[0].File, "content_", "", -1)

			faceEthnicity := GetFaceAttributesFromJSON(bodyString)

			ethnicities := Ethnicities{
				{Name: "white", Percent: faceEthnicity.White},
				{Name: "black", Percent: faceEthnicity.Black},
				{Name: "asian", Percent: faceEthnicity.Asian},
				{Name: "other", Percent: faceEthnicity.Other},
				{Name: "hispanic", Percent: faceEthnicity.Hispanic},
			}

			sort.Sort(ethnicities)

			renderFinalFileNameExt := imageFilename + ".jpg"
			renderFinalFilePath := filepath.Join("assets/tmp/facerace", renderFinalFileNameExt)

			done := CreateImageBarChart(uploadedOrigFilePath, renderFinalFilePath, renderImageWidth, renderImageHeight, ethnicities)

			if done != true {
				panic("canonical_log=1 log_type=error message=\"Unable to create render final output\"")
			}

			// upload image to S3 (uncomment "app/utils" import)
			s3UrlPath := s3upload.Upload(renderFinalFileNameExt, renderFinalFilePath)

			// delete orig + final uploaded files
			if s3UrlPath != "" {
				deleteFile(uploadedOrigFilePath)
				deleteFile(renderFinalFilePath)
			}

			// append the final S3 url path in the JSON response
			getFinalS3Data := &S3Data{
				Url: s3UrlPath,
			}

			// grab the original API reponse and append the s3_image_url
			jsonOutput := map[string]interface{}{}
			json.Unmarshal(bodyBytes, &jsonOutput)
			jsonOutput["s3_image_url"] = getFinalS3Data.Url
			finalJSONoutput, _ := json.Marshal(jsonOutput)

			fmt.Println(fmt.Sprintf("canonical_log=1 log_type=success message=\"%s\"", renderFinalFileNameExt))

			return c.String(http.StatusOK, string(finalJSONoutput))
		}
	}

	return c.String(http.StatusOK, response)
}

// Recognize Damo
func RenderRecognize(c echo.Context) error {
	pageVars := PageVarsRecognize{
		cacheBuster(),
		getEnvVariables().API_URL,
		getEnvVariables().APP_ID,
		getEnvVariables().APP_KEY,
	}
	return c.Render(http.StatusOK, "recognize", &pageVars)
}

func SendToApiRecognize(c echo.Context) error {
	r := c.Request()
	r.ParseForm()

	process := r.Form["process"]
	imgObj := r.Form["imgObj"]
	imgObjString := strings.Join(imgObj, " ")

	if strings.Join(process, " ") == "enroll" {

		url := getURLFromAPIMethod("enroll")

		req, reqError := http.NewRequest("POST", url, bytes.NewBufferString(imgObjString))
		if reqError != nil {
			fmt.Println(reqError)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("app_id", getEnvVariables().APP_ID)
		req.Header.Set("app_key", getEnvVariables().APP_KEY)

		resp, respError := http.DefaultClient.Do(req)
		if respError != nil {
			fmt.Println(respError)
		}

		if resp.StatusCode == 200 {
			bodyBytes, readError := ioutil.ReadAll(resp.Body)
			if readError != nil {
				fmt.Println(readError)
			} else {
				bodyString := string(bodyBytes)
				return c.String(http.StatusOK, string(bodyString))
			}
		}

	} else if strings.Join(process, " ") == "recognize" {

		url := getURLFromAPIMethod("recognize")

		req, reqError := http.NewRequest("POST", url, bytes.NewBufferString(imgObjString))
		if reqError != nil {
			fmt.Println(reqError)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("app_id", getEnvVariables().APP_ID)
		req.Header.Set("app_key", getEnvVariables().APP_KEY)

		resp, respError := http.DefaultClient.Do(req)
		if respError != nil {
			fmt.Println(respError)
		}

		if resp.StatusCode == 200 {
			bodyBytes, readError := ioutil.ReadAll(resp.Body)
			if readError != nil {
				fmt.Println(readError)
			} else {
				bodyString := string(bodyBytes)

				return c.String(http.StatusOK, string(bodyString))
			}
		}

	}
	return c.String(http.StatusOK, "")
}

// Verify Damo
func RenderVerify(c echo.Context) error {
	pageVars := PageVarsVerify{
		cacheBuster(),
		getEnvVariables().API_URL,
		getEnvVariables().APP_ID,
		getEnvVariables().APP_KEY,
	}
	return c.Render(http.StatusOK, "verify", &pageVars)
}

func SendToApiVerify(c echo.Context) error {
	r := c.Request()
	r.ParseForm()

	imgObj := r.Form["imgObj"]
	imgObjString := strings.Join(imgObj, " ")
	process := r.Form["process"]

	if strings.Join(process, " ") == "enroll" {

		url := getURLFromAPIMethod("enroll")

		req, reqError := http.NewRequest("POST", url, bytes.NewBufferString(imgObjString))
		if reqError != nil {
			fmt.Println(reqError)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("app_id", getEnvVariables().APP_ID)
		req.Header.Set("app_key", getEnvVariables().APP_KEY)

		resp, respError := http.DefaultClient.Do(req)
		if respError != nil {
			fmt.Println(respError)
		}

		if resp.StatusCode == 200 {
			bodyBytes, readError := ioutil.ReadAll(resp.Body)
			if readError != nil {
				fmt.Println(readError)
			} else {
				bodyString := string(bodyBytes)
				return c.String(http.StatusOK, string(bodyString))
			}
		}

	} else if strings.Join(process, " ") == "verify" {

		url := getURLFromAPIMethod("verify")

		req, reqError := http.NewRequest("POST", url, bytes.NewBufferString(imgObjString))
		if reqError != nil {
			fmt.Println(reqError)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("app_id", getEnvVariables().APP_ID)
		req.Header.Set("app_key", getEnvVariables().APP_KEY)

		resp, respError := http.DefaultClient.Do(req)
		if respError != nil {
			fmt.Println(respError)
		}

		if resp.StatusCode == 200 {
			bodyBytes, readError := ioutil.ReadAll(resp.Body)
			if readError != nil {
				fmt.Println(readError)
			} else {
				bodyString := string(bodyBytes)

				return c.String(http.StatusOK, string(bodyString))
			}
		}

	}
	return c.String(http.StatusOK, "")

}

// Emotion Damo
func RenderEmotion(c echo.Context) error {
	pageVars := PageVarsEmotion{
		cacheBuster(),
		getEnvVariables().API_URL,
		getEnvVariables().APP_ID,
		getEnvVariables().APP_KEY,
	}
	return c.Render(http.StatusOK, "emotion", &pageVars)
}

func SendToApiEmotion(c echo.Context) error {
	r := c.Request()
	r.ParseMultipartForm(32 << 20)

	fname := r.Form["fname"]
	fileName := strings.Join(fname, " ")

	fmt.Println(fileName)

	if fileName == "polling" {

		mediaId := r.Form["mediaId"]
		mediaIdString := strings.Join(mediaId, " ")

		url := getURLFromAPIMethod("") + "/v2/media/" + mediaIdString

		req, reqError := http.NewRequest("GET", url, nil)
		if reqError != nil {
			fmt.Println(reqError)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("app_id", getEnvVariables().APP_ID)
		req.Header.Set("app_key", getEnvVariables().APP_KEY)

		resp, respError := http.DefaultClient.Do(req)
		if respError != nil {
			fmt.Println(respError)
		}

		bodyBytes, readError := ioutil.ReadAll(resp.Body)
		if readError != nil {
			fmt.Println(readError)
		} else {
			bodyString := string(bodyBytes)
			return c.String(http.StatusOK, string(bodyString))
		}
	}

	if fileName == "analytics" {

		mediaId := r.Form["mediaId"]
		mediaIdString := strings.Join(mediaId, " ")

		url := getURLFromAPIMethod("") + "/v2/analytics/" + mediaIdString

		req, reqError := http.NewRequest("GET", url, nil)
		if reqError != nil {
			fmt.Println(reqError)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("app_id", getEnvVariables().APP_ID)
		req.Header.Set("app_key", getEnvVariables().APP_KEY)

		resp, respError := http.DefaultClient.Do(req)
		if respError != nil {
			fmt.Println(respError)
		}

		if resp.StatusCode == 503 {
			fmt.Println("503 Error")
		}
		bodyBytes, readError := ioutil.ReadAll(resp.Body)
		if readError != nil {
			fmt.Println(readError)
		} else {
			bodyString := string(bodyBytes)
			return c.String(http.StatusOK, string(bodyString))
		}

	}

	if fileName == "webcam" {

		videoId := r.Form["videoId"]
		videoIdString := strings.Join(videoId, " ")
		videoData := r.Form["videoData"]
		videoDataString := strings.Join(videoData, " ")

		b64data := videoDataString[strings.IndexByte(videoDataString, ',')+1:]

		uploadPath := filepath.Join("assets/tmp/emotion/" + videoIdString + ".webm")

		ConvertBase64StringToVideoFile(b64data, uploadPath)

		url := getURLFromAPIMethod("") + "/v2/media?landmarks=1"

		file, openError := os.Open(uploadPath)
		if openError != nil {
			fmt.Println("File open error : ", openError)
			os.Exit(-1)
		}

		defer file.Close()

		// since we are not going to upload our file with a Web browser or curl -F
		// we need to prepare a "virtual form"
		fileInfo, _ := file.Stat()

		var fileBody bytes.Buffer
		writer := multipart.NewWriter(&fileBody)

		filePart, err := writer.CreateFormFile("source", fileInfo.Name())
		if err != nil {
			fmt.Println("CreateFormFile error : ", err)
			os.Exit(-1)
		}

		// using mime - multipart
		_, err = io.Copy(filePart, file)
		if err != nil {
			fmt.Println("io.Copy error : ", err)
			os.Exit(-1)
		}

		// close writer
		err = writer.Close()
		if err != nil {
			fmt.Println("Writer close error : ", err)
			os.Exit(-1)
		}

		// "virtual form" is ready, submit fileBody
		req, reqError := http.NewRequest("POST", url, &fileBody)
		if reqError != nil {
			fmt.Println("POST ERROR : ", reqError)
			os.Exit(-1)
		}

		// set the header with the proper content type for the fileBody's boundary
		// see https://golang.org/pkg/mime/multipart/#Writer.FormDataContentType
		req.Header.Set("Content-Type", writer.FormDataContentType())
		req.Header.Set("app_id", getEnvVariables().APP_ID)
		req.Header.Set("app_key", getEnvVariables().APP_KEY)

		resp, respError := http.DefaultClient.Do(req)

		if respError != nil {
			fmt.Println(respError)
		}

		defer resp.Body.Close()

		bodyBytes, readError := ioutil.ReadAll(resp.Body)
		if readError != nil {
			fmt.Println(readError)
		} else {
			bodyString := string(bodyBytes)
			deleteFile(uploadPath)
			return c.String(http.StatusOK, string(bodyString))
		}
	}

	if fileName == "fileupload" {

		file, handler, fileError := r.FormFile("file")
		if fileError != nil {
			fmt.Println(fileError)
		}
		defer file.Close()

		uploadPath := "assets/tmp/emotion/" + handler.Filename

		// f, err := os.Open(handler.Filename)
		// f, err := os.OpenFile(handler.Filename, os.O_WRONLY|os.O_CREATE, 0666)
		openedFile, openError := os.OpenFile(uploadPath, os.O_RDWR|os.O_CREATE, os.ModePerm)
		if openError != nil {
			fmt.Println(openError)
		}
		defer openedFile.Close()
		// io.Copy(f, file)

		fileInfo, _ := openedFile.Stat()

		var fileBody bytes.Buffer
		writer := multipart.NewWriter(&fileBody)

		filePart, err := writer.CreateFormFile("source", fileInfo.Name())
		if err != nil {
			fmt.Println("CreateFormFile error : ", err)
			os.Exit(-1)
		}

		// using mime - multipart
		_, err = io.Copy(filePart, file)
		if err != nil {
			fmt.Println("io.Copy error : ", err)
			os.Exit(-1)
		}

		// close writer
		err = writer.Close()
		if err != nil {
			fmt.Println("Writer close error : ", err)
			os.Exit(-1)
		}

		url := getURLFromAPIMethod("") + "/v2/media?landmarks=1"

		// "virtual form" is ready, submit fileBody
		req, reqError := http.NewRequest("POST", url, &fileBody)
		if reqError != nil {
			fmt.Println("POST ERROR : ", reqError)
			os.Exit(-1)
		}

		// set the header with the proper content type for the fileBody's boundary
		// see https://golang.org/pkg/mime/multipart/#Writer.FormDataContentType
		req.Header.Set("Content-Type", writer.FormDataContentType())
		req.Header.Set("app_id", getEnvVariables().APP_ID)
		req.Header.Set("app_key", getEnvVariables().APP_KEY)

		resp, respError := http.DefaultClient.Do(req)
		if respError != nil {
			fmt.Println(respError)
		}

		defer resp.Body.Close()

		bodyBytes, readError := ioutil.ReadAll(resp.Body)
		if readError != nil {
			fmt.Println(readError)
		} else {
			bodyString := string(bodyBytes)
			deleteFile(uploadPath)
			return c.String(http.StatusOK, string(bodyString))
		}
	}

	if fileName == "urlGetContent" {

		urlPath := r.Form["urlPath"]
		urlPathString := strings.Join(urlPath, " ")

		resp, respError := http.Get(urlPathString)
		if respError != nil {
			fmt.Println(respError)
		}

		bodyBytes, readError := ioutil.ReadAll(resp.Body)
		if readError != nil {
			fmt.Println(readError)
		}

		base64Str := base64.StdEncoding.EncodeToString(bodyBytes)

		contentType := resp.Header.Get("Content-type")
		contentLength := resp.Header.Get("Content-length")

		var content = map[string]string{
			"contentType":   contentType,
			"contentLength": contentLength,
			"base64Str":     base64Str,
		}

		jsonString, marshallError := json.Marshal(content)
		if marshallError != nil {
			fmt.Println(marshallError)
		}

		return c.String(http.StatusOK, string(jsonString))

	}

	if fileName == "urlProcess" {

		urlPath := r.Form["urlPath"]
		urlPathString := strings.Join(urlPath, " ")

		url := getURLFromAPIMethod("") + "/v2/media?source=" + urlPathString + "&landmarks=1"

		req, reqError := http.NewRequest("POST", url, nil)
		if reqError != nil {
			fmt.Println("POST ERROR : ", reqError)
			os.Exit(-1)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("app_id", getEnvVariables().APP_ID)
		req.Header.Set("app_key", getEnvVariables().APP_KEY)

		resp, respError := http.DefaultClient.Do(req)
		if respError != nil {
			fmt.Println(respError)
		}

		defer resp.Body.Close()

		bodyBytes, readError := ioutil.ReadAll(resp.Body)
		if readError != nil {
			fmt.Println(readError)
		} else {
			bodyString := string(bodyBytes)
			return c.String(http.StatusOK, string(bodyString))
		}

	}

	return c.String(http.StatusOK, "")

}

// get mimetype from URL from tmp file
func imageMimeTypeUrl(imageData string) string {
	response, e := http.Get(imageData)
	if e != nil {
		fmt.Println(e)
	}
	//open a file for writing
	mimeFile := "assets/tmp/mime.jpg"
	file, err := os.Create(mimeFile)
	if err != nil {
		fmt.Println(err)
	}

	_, err = io.Copy(file, response.Body)
	if err != nil {
		fmt.Println(err)
	}

	file.Close()

	f, err := os.Open(mimeFile)
	if err != nil {
		fmt.Println(err)
	}

	_, format, err := image.DecodeConfig(f)
	if format == "" {
		return ""
	}

	os.Remove(mimeFile)

	return mime.TypeByExtension("." + format)
}

func deleteFile(filePath string) {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		fmt.Println(fmt.Sprintf("canonical_log=1 log_type=success message=\"Cannot delete non-existing file: %s\"", filePath))
	}
	os.Remove(filePath)
}

func generateRandomImageFilename(extension string) string {
	if extension == "" {
		extension = "jpg"
	}
	fileName := fmt.Sprintf("%d.%s", time.Now().UnixNano(), extension)
	return fileName
}

func getURLFromAPIMethod(method string) string {
	url := getEnvVariables().API_URL

	matched, _ := regexp.MatchString("^(http|https)://", url)

	if matched == false {
		url = "https://" + url
	}

	url = url + "/" + method
	return url
}

func ExifData(c echo.Context) error {
	r := c.Request()
	r.ParseForm()
	url := r.Form["url"]

	response, e := http.Get(strings.Join(url, " "))
	if e != nil {
		fmt.Println(e)
	}

	defer response.Body.Close()

	//open a file for writing
	exifFile := "assets/tmp/exif.jpg"
	file, err := os.Create(exifFile)
	if err != nil {
		fmt.Println(err)
	}

	_, err = io.Copy(file, response.Body)
	if err != nil {
		fmt.Println(err)
	}

	file.Close()

	f, err := os.Open(exifFile)
	if err != nil {
		fmt.Println(err)
	}

	exifData := exif.ExifData{}
	_, exifError := exifData.ProcessExifStream(f)
	if exifError != nil {
		fmt.Println(err)
	}

	var orientationID string = "0"

	if val1, ok1 := exifData.GetTagValues(0x0112); exifError == nil && ok1 == true {
		if val2, ok2 := val1.([]interface{}); ok2 {
			if len(val2) == 1 {
				orientationID := int(val2[0].(uint16))
				return c.String(http.StatusOK, strconv.Itoa(orientationID))
			}
		}
	}

	os.Remove(exifFile)

	return c.String(http.StatusOK, orientationID)
}

/*
Map of magic numbers and associated image formats (used for mime-type detection)
*/
var magicTable = map[string]string{
	"\xff\xd8\xff":      "image/jpeg",
	"\x89PNG\r\n\x1a\n": "image/png",
	"GIF87a":            "image/gif",
	"GIF89a":            "image/gif",
}

/*
Extracts the mime-type from the file data bytes (ie: image/jpeg, image/png), using magicTable.

@param dataBytes []byte
@return string
*/
func mimeTypeFromFile(dataBytes []byte) string {
	dataStr := string([]byte(dataBytes))
	for magic, mime := range magicTable {
		if strings.HasPrefix(dataStr, magic) {
			return mime
		}
	}
	return ""
}

// ConvertBase64StringToImageFile ...
func ConvertBase64StringToImageFile(base64Data string, saveToFilePath string) (bool, string) {
	base64Decoded, base64Err := base64.StdEncoding.DecodeString(base64Data)
	if base64Err != nil {
		return false, "Cannot decode base64"
	}

	mimeType := mimeTypeFromFile(base64Decoded)
	if mimeType != "image/jpeg" && mimeType != "image/png" {
		return false, "Invalid file format"
	}

	imageFile, imageErr := os.Create(saveToFilePath)
	defer imageFile.Close()
	if imageErr != nil {
		return false, "Unable to create file"
	}
	imageFile.Write(base64Decoded)

	return true, ""
}

// ConvertBase64StringToVideoFile ...
func ConvertBase64StringToVideoFile(base64Data string, saveToFilePath string) (bool, string) {
	base64Decoded, base64Err := base64.StdEncoding.DecodeString(base64Data)
	if base64Err != nil {
		return false, "Cannot decode base64"
	}

	fp, fileOpenErr := os.OpenFile(saveToFilePath, os.O_RDWR|os.O_CREATE, os.ModePerm)

	if fileOpenErr != nil {
		return false, "Error opening file"
	}

	defer fp.Close()

	_, fileWriteErr := fp.Write(base64Decoded)

	if fileWriteErr != nil {
		return false, "Error writing file"
	}

	return true, ""

}

func cacheBuster() string {
	t := time.Now()
	cache_buster := t.Format("20060102")
	demo_env := os.Getenv("STAGE")
	if os.Getenv("STAGE") == "" {
		demo_env = "dev"
	}
	if demo_env == "dev" {
		cache_buster = strconv.Itoa(int(t.Unix()))
	}
	return cache_buster
}
