package orientation

import (
	"fmt"
	"image"
	"image/jpeg"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	exif "app/utils/exif"

	"github.com/disintegration/imaging"
)

/* ========================
EXIF Orientation (sides) http://www.impulseadventure.com/photo/exif-orientation.html
~~~~~~~~~~~~~~~~~~~~~~~~~~~
Value |	Row:	| Column: |
---------------------------
 1	  | Top		| Left	  |
 2*	  | Top		| Right	  |
 3	  | Bottom	| Right	  |
 4*	  | Bottom	| Left	  |
 5*	  | Left	| Top	  |
 6	  | Right	| Top	  |
 7*	  | Right	| Bottom  |
 8	  | Left	| Bottom  |

NOTE: Values with "*" are uncommon since
they represent "flipped" orientations.
=========================== */

func getExifOrientationMap() map[int]string {
	orientationMap := map[int]string{
		1: "top-left",
		2: "top-right",
		3: "bottom-right",
		4: "bottom-left",
		5: "left-top",
		6: "right-top",
		7: "right-bottom",
		8: "left-bottom",
	}
	return orientationMap
}

func getExifOrientationKeyFromValue(data string) int {
	orientationMap := getExifOrientationMap()
	for key, value := range orientationMap {
		if value == data {
			return key
		}
	}
	return 0
}

func getExifOrientationValueFromKey(key int) string {
	orientationMap := getExifOrientationMap()
	if val, found := orientationMap[key]; found {
		return val
	}
	return ""
}

func getOrientationFromImage(imageFilename string) (orientationID int, orientationValue string) {
	f, err := os.Open(imageFilename)
	if err != nil {
		log.Fatal(err)
	}

	exifData := &exif.ExifData{}
	_, exifError := exifData.ProcessExifStream(f)

	if exifError != nil {
		//fmt.Println(fmt.Sprintf("[orientation debug] %+v", exifError))
		return 0, "EXIF (orientation) data not found"
	}

	orientationID = 0

	// get tag "Orientation" => 0x0112
	if val1, ok1 := exifData.GetTagValues(0x0112); exifError == nil && ok1 == true {
		if val2, ok2 := val1.([]interface{}); ok2 {
			if len(val2) == 1 {
				orientationID = int(val2[0].(uint16))
			}
		}
	}

	orientationValue = getExifOrientationValueFromKey(orientationID)

	return orientationID, orientationValue
}

func rotateImageByDegree(rotateDegree int, originalFilePath string, destinationFilePath string) {
	getOrigImage, _ := os.Open(originalFilePath)
	defer getOrigImage.Close()
	origImage, _, _ := image.Decode(getOrigImage)

	rotatedImage := origImage

	switch rotateDegree {
	case 90:
		rotatedImage = imaging.Rotate90(origImage)
	case 180:
		rotatedImage = imaging.Rotate180(origImage)
	case 270:
		rotatedImage = imaging.Rotate270(origImage)
	}

	newFile, err := os.Create(destinationFilePath)
	if err != nil {
		log.Fatal(err)
	}
	defer newFile.Close()

	jpeg.Encode(newFile, rotatedImage, &jpeg.Options{Quality: 100})
}

func RotateImageIfNotOrientedCorrectly(origFilename string, newFilename string) bool {
	orientationID, orientationValue := getOrientationFromImage(origFilename)
	imageIsRotated := false
	rotateToDegree := 0

	if orientationID > 0 && orientationValue != "" {
		switch orientationValue {
		case "top-left":
			// Do Not Rotate - This is the normal position we want.
		case "right-top":
			rotateToDegree = 270
		case "bottom-right":
			rotateToDegree = 180
		case "left-bottom":
			rotateToDegree = 90
		}

		if rotateToDegree > 0 {
			rotateImageByDegree(rotateToDegree, origFilename, newFilename)
			imageIsRotated = true
		}
	}

	// debug output
	// textDone := "%s left alone (%d)"
	// if imageIsRotated {
	// 	textDone = "%s was rotated (by %d degrees)"
	// }
	// fmt.Println(fmt.Sprintf("(orient => %s) "+textDone, orientationValue, origFilename, rotateToDegree))

	return imageIsRotated
}

// DownloadRemoteURL ...
func DownloadRemoteURL(url string, saveAsFilePath string) (bool, string) {
	localFile, localFileErr := os.Create(saveAsFilePath)
	if localFileErr != nil {
		return false, fmt.Sprintf("Unable to create local file for download: %s", saveAsFilePath)
	}
	defer localFile.Close()

	remoteResponse, remoteResponseErr := http.Get(url)
	if remoteResponseErr != nil {
		return false, fmt.Sprintf("Unable to download remote file: %s", url)
	}
	defer remoteResponse.Body.Close()

	_, copyErr := io.Copy(localFile, remoteResponse.Body)
	if copyErr != nil {
		return false, fmt.Sprintf("Unable to save remote file to local file path: %s", saveAsFilePath)
	}

	return true, ""
}

func testImage(filePath string) {
	orientationID, orientationValue := getOrientationFromImage(filePath)
	fmt.Println(fmt.Sprintf("[%s] => (%d) %v", filePath, orientationID, orientationValue))
}

// RandomFloat ...
func randomFloat() float64 {
	s := rand.NewSource(time.Now().UnixNano())
	r := rand.New(s)
	return float64(r.Float32())
}

func testingMain() {
	// vals := getExifOrientationValueFromKey(1)
	// fmt.Println(fmt.Sprintf("found val: %v", vals))

	// vali := getExifOrientationKeyFromValue("top-left")
	// fmt.Println(fmt.Sprintf("found key: %v", vali))

	// testImage("/tmp/Steves/180.JPG")
	// testImage("/tmp/Steves/90CW.JPG")

	// testImage("/tmp/ios_top_left.jpg")
	// testImage("/tmp/ios_top_left.jpg")
	// testImage("/tmp/ios_top_bottom.jpg")
	// testImage("/tmp/ios_top_right.jpg")

	// prefixRandomNum := strconv.FormatFloat(randomFloat()*1000, 'f', 4, 32)
	// dir := "/tmp/Steves"

	// origFilename := dir + "/NORMAL.JPG"
	// newFilename := dir + "/" + prefixRandomNum + "_NORMAL.ROTATED.JPG"
	// _ = RotateImageIfNotOrientedCorrectly(origFilename, newFilename)

	// origFilename = dir + "/90CW.JPG"
	// newFilename = dir + "/" + prefixRandomNum + "_90CW.ROTATED.JPG"
	// _ = RotateImageIfNotOrientedCorrectly(origFilename, newFilename)

	// origFilename = dir + "/180.JPG"
	// newFilename = dir + "/" + prefixRandomNum + "_180.ROTATED.JPG"
	// _ = RotateImageIfNotOrientedCorrectly(origFilename, newFilename)

	// origFilename = dir + "/270CW.JPG"
	// newFilename = dir + "/" + prefixRandomNum + "_270CW.ROTATED.JPG"
	// _ = RotateImageIfNotOrientedCorrectly(origFilename, newFilename)

	// origFilename := "/tmp/90cw.jpg"
	// newFilename := "/tmp/rotated_pic.jpg"

	// fmt.Println("-- ",is_rotated)

	// is_rotated := RotateImageIfNotOrientedCorrectly(origFilename, newFilename)

	// if is_rotated == true {
	// 	fmt.Println("[%s] was rotated")

	// } else {
	// 	fmt.Println(fmt.Sprintf("[%s] original left", origFilename, is_rotated ? 1 : 0))
	// }
}
