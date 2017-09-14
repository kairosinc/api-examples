package handlers

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/jpeg"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang/freetype/truetype"
	"github.com/nfnt/resize"
	"golang.org/x/image/font"
	"golang.org/x/image/math/fixed"
)

var (
	origFilenamePtr = flag.String("origfilename", "assets/faces/elizabeth.jpg", "original filename path")
	newFilenamePtr  = flag.String("newfilename", "assets/tmp/barchart_output.jpg", "new filename path")
	widthPtr        = flag.Int("width", 380, "file width")
	heightPtr       = flag.Int("height", 380, "file height")
	defaultImage    = flag.String("defaultimage", *origFilenamePtr, "default image")
	fontfile        = flag.String("fontfile", "assets/fonts/proximanova-semibold.ttf", "font")
	maskFile        = flag.String("maskfile", "assets/mask-black.jpg", "mask file")
	testRandom      = flag.Bool("testrandom", true, "test random image renders")
	brandingURL     = "KAIROS.COM/YOU"
	brandingHashtag = "#DiversityRecognition"
)

// EthnicityGroup ...
type EthnicityGroup struct {
	Hispanic float64 `json:"hispanic"`
	Asian    float64 `json:"asian"`
	White    float64 `json:"white"`
	Black    float64 `json:"black"`
	Other    float64 `json:"other"`
}

// Ethnicity ...
type Ethnicity struct {
	Name    string
	Percent float64
}

// Ethnicities ...
type Ethnicities []Ethnicity

func (slice Ethnicities) Len() int {
	return len(slice)
}

func (slice Ethnicities) Less(i, j int) bool {
	return slice[i].Percent > slice[j].Percent
}

func (slice Ethnicities) Swap(i, j int) {
	slice[i], slice[j] = slice[j], slice[i]
}

var buf bytes.Buffer
var logger = log.New(&buf, "DEBUG: ", log.Lshortfile)

func addLabelToImage(img *image.RGBA, x, y int, label string, setColor string, fontSize float64) {
	col := color.RGBA{0, 0, 0, 255}

	if setColor == "white" {
		col = color.RGBA{255, 255, 255, 255}
	}

	if fontSize == 0 {
		fontSize = 12
	}

	// Read the font data.
	fontBytes, err := ioutil.ReadFile(*fontfile)
	if err != nil {
		log.Println(err)
		return
	}

	f, err := truetype.Parse(fontBytes)
	if err != nil {
		log.Println(err)
		return
	}

	fontDpi := 72.0
	fontHinting := font.HintingNone

	point := fixed.Point26_6{X: fixed.Int26_6(x * 64), Y: fixed.Int26_6(y * 64)}

	d := &font.Drawer{
		Dst: img,
		Src: image.NewUniform(col),
		Face: truetype.NewFace(f, &truetype.Options{
			Size:    fontSize,
			DPI:     fontDpi,
			Hinting: fontHinting,
		}),
		Dot: point,
	}

	d.DrawString(label)
}

func float64ToStr(f float64) string {
	return strconv.FormatFloat(float64(f), 'f', 2, 32)
}

// RandomFloat ...
func RandomFloat() float64 {
	s := rand.NewSource(time.Now().UnixNano())
	r := rand.New(s)
	return float64(r.Float32())
}

// CreateImageBarChart ...
func CreateImageBarChart(originalImageFilename string, newImageFilename string, imageWidth int, imageHeight int, ethnicities Ethnicities) bool {
	// image dimension, coordinates, etc are all in pixel:
	barColorRGBA := color.RGBA{30, 156, 135, 255}
	barHeight := 20
	barPosY := 20
	barPosHeight := 35
	barPaddingLeft := 100
	barPaddingRight := 20

	textPaddingLeft := 30
	textPosYFromBarPosY := 10
	textColor := "white"

	textPercentagePaddingBottom := 5

	brandingPaddingFromBottom := 20
	brandingHashtagPaddingLeft := 170

	fontSizePercentage := 20.0
	fontSizeEthnicity := 14.0
	fontSizeBranding := 14.0

	trackBarPosY := 0
	trackBarHeight := 0

	getOrigImage, _ := os.Open(originalImageFilename)
	defer getOrigImage.Close()
	origImage, _, _ := image.Decode(getOrigImage)

	// mask to stick over person image
	getMaskImage, _ := os.Open(*maskFile)
	defer getMaskImage.Close()
	maskImage, _, _ := image.Decode(getMaskImage)

	// Mask image
	mask := image.NewUniform(color.Alpha{128})

	// create new image with given width/height
	img := image.NewRGBA(image.Rect(0, 0, imageWidth, imageHeight))

	// resize original image using Lanczos resampling, and preserve aspect ratio
	resizedOrigImage := resize.Resize(uint(imageWidth), uint(imageHeight), origImage, resize.Lanczos3)

	// apply the background (person) image
	draw.Draw(img, img.Bounds(), resizedOrigImage, image.ZP, draw.Src)

	// apply the masking (dark) overlay
	draw.DrawMask(img, img.Bounds(), maskImage, image.ZP, mask, image.ZP, draw.Over)

	for _, eth := range ethnicities {
		// get labels and percentages
		fieldName := eth.Name
		fieldValue := eth.Percent
		percentageInt := int(fieldValue * 100)
		percentageStr := fmt.Sprintf("%s%%", strconv.Itoa(percentageInt))

		// set bar positioning & bar (percentage) size
		trackBarPosY = trackBarPosY + (barPosY + barPosHeight)
		trackBarHeight = trackBarPosY + barHeight
		barWidthAvailable := imageWidth - barPaddingLeft - barPaddingRight
		barPercentageWidth := barPaddingLeft + int(float32(barWidthAvailable)*float32(fieldValue))

		// create the bars
		for y := trackBarPosY; y < trackBarHeight; y++ {
			for x := barPaddingLeft; x < barPercentageWidth; x++ {
				img.Set(x, y, barColorRGBA)
			}
		}

		// add percentage labels
		addLabelToImage(img, textPaddingLeft, (trackBarPosY + textPosYFromBarPosY - textPercentagePaddingBottom), percentageStr, textColor, fontSizePercentage)

		// add ethnicity labels
		addLabelToImage(img, textPaddingLeft, (trackBarPosY+textPosYFromBarPosY)+15, strings.ToUpper(fieldName), textColor, fontSizeEthnicity)
	}

	// add branding labels
	addLabelToImage(img, textPaddingLeft, (imageHeight - brandingPaddingFromBottom), brandingURL, textColor, fontSizeBranding)
	addLabelToImage(img, (imageWidth - brandingHashtagPaddingLeft), (imageHeight - brandingPaddingFromBottom), brandingHashtag, textColor, fontSizeBranding)

	file, err := os.Create(newImageFilename)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	jpeg.Encode(file, img, &jpeg.Options{Quality: 100})

	fmt.Print(&buf)

	return true
}

// GetRandomImage ...
func GetRandomImage(secondRandomFile string) string {
	tmpTestOrig := *defaultImage
	randumNum := int(RandomFloat()*100) % 100

	if randumNum >= 50 {
		tmpTestOrig = secondRandomFile
	}

	return tmpTestOrig
}

// GetRandomEthnicity ...
func GetRandomEthnicity() EthnicityGroup {
	return EthnicityGroup{
		Hispanic: RandomFloat(),
		Asian:    RandomFloat(),
		White:    RandomFloat(),
		Black:    RandomFloat(),
		Other:    RandomFloat(),
	}
}

// GetFaceAttributesFromJSON ...
func GetFaceAttributesFromJSON(rawString string) EthnicityGroup {
	rawData := []byte(rawString)

	var jsonData map[string]interface{}

	if err := json.Unmarshal(rawData, &jsonData); err != nil {
		panic("canonical_log=1 log_type=error message=\"Unable to parse json\"")
	}

	if jsonData["images"] == nil {
		return EthnicityGroup{}
	}

	images := jsonData["images"].([]interface{})
	faces := images[0].(map[string]interface{})
	face1 := faces["faces"].([]interface{})[0].(map[string]interface{})

	if faces["faces"] == nil {
		return EthnicityGroup{}
	}

	faceAttr := face1["attributes"].(map[string]interface{})

	//logger.Print(fmt.Sprintf("JSON: %+v", faceAttr))

	ethnicity := EthnicityGroup{
		Hispanic: faceAttr["hispanic"].(float64),
		Asian:    faceAttr["asian"].(float64),
		White:    faceAttr["white"].(float64),
		Black:    faceAttr["black"].(float64),
		Other:    faceAttr["other"].(float64),
	}

	return ethnicity
}
