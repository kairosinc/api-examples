// Copyright 2013 atanas "jack" argirov. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

// Package exif implements reading EXIF metadata as specified
// in EXIF format specification

// For more information see:
// http://www.media.mit.edu/pia/Research/deepview/exif.html
// http://www.exiv2.org/tags.html

// Example client using the package can be found in exif-client/exif-client.go

package exif

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"log"
	"math/big"
	"os"
	"strings"
)

const EXIF_HEADER_READ_SIZE = 12
const EXIF_SUBIFD_OFFSET_TAG = 0x8769 // SubIFD
const EXIF_GPSINFO_TAG = 0x8825       // GPSInfo
const EXIF_IOP_TAG = 0xa005           // ExifInteroperabilityOffset

var EXIF_HEADER_SIGNATURE = []byte{0xff, 0xd8, 0xff, 0xe1}

var EXIF_TAGS = map[uint16]string{
	0x0100: "ImageWidth",
	0x0101: "ImageLength",
	0x0102: "BitsPerSample",
	0x0103: "Compression",
	0x0106: "PhotometricInterpretation",
	0x0111: "StripOffsets",
	0x0115: "SamplesPerPixel",
	0x0116: "RowsPerStrip",
	0x0117: "StripByteConunts",
	0x010e: "ImageDescription",
	0x010f: "Make",
	0x0110: "Model",
	0x0112: "Orientation",
	0x011a: "XResolution",
	0x011b: "YResolution",
	0x011c: "PlanarConfiguration",
	0x0128: "ResolutionUnit",
	0x0131: "Software",
	0x0132: "DateTime",
	0x013e: "WhitePoint",
	0x013f: "PrimaryChromaticities",
	0x0201: "JpegIFOffset",
	0x0202: "JpegIFByteCount",
	0x0211: "YCbCrCoefficients",
	0x0213: "YCbCrPositioning",
	0x0214: "ReferenceBlackWhite",
	0x8298: "Copyright",
	0x8769: "ExifOffset",
	// EXIF IFD1
	0x829a: "ExposureTime",
	0x829d: "FNumber",
	0x8822: "ExposureProgram",
	0x8827: "ISOSpeedRatings",
	0x9000: "ExifVersion",
	0x9003: "DateTimeOriginal",
	0x9004: "DateTimeDigitized",
	0x9101: "ComponentConfiguration",
	0x9102: "CompressedBitsPerPixel",
	0x9201: "ShutterSpeedValue",
	0x9202: "ApertureValue",
	0x9203: "BrightnessValue",
	0x9204: "ExposureBiasValue",
	0x9205: "MaxApertureValue",
	0x9206: "SubjectDistance",
	0x9207: "MeteringMode",
	0x9208: "LightSource",
	0x9209: "Flash",
	0x920a: "FocalLength",
	0x927c: "MakerNote",
	0x9286: "UserComment",
	0xa000: "FlashPixVersion",
	0xa001: "ColorSpace",
	0xa002: "ExifImageWidth",
	0xa003: "ExifImageHeight",
	0xa004: "RelatedSoundFile",
	0xa005: "ExifInteroperabilityOffset",
	0xa20e: "FocalPlaneXResolution",
	0xa20f: "FocalPlaneYResolution",
	0xa210: "FocalPlaneResolutionUnit",
	0xa217: "SensingMethod",
	0xa300: "FileSource",
	0xa301: "SceneType",
	0xa401: "CustomRendered",
	0xa402: "ExposureMode",
	0xa403: "WhiteBalance",
	0xa404: "DigitalZoomRatio",
	0xa405: "FocalLengthIn35mmFilm",
	0xa406: "SceneCaptureType",
	0xa407: "GainControl",
	0xa408: "Contrast",
	0xa409: "Saturation",
	0xa40a: "Sharpness",
	0xa40b: "DeviceSettingDescription",
	0xa40c: "SubjectDistanceRange",
	0xa420: "ImageUniqueID",
	0xa430: "CameraOwnerName",
	0xa431: "BodySerialNumber",
	0xa432: "LensSpecification",
	0xa433: "LensMake",
	0xa434: "LensModel",
	0xa435: "LensSerialNumber",
}

var EXIF_GPSINFO_TAGS = map[uint16]string{
	0x0000: "GPSVersionID",
	0x0001: "GPSLatitudeRef",
	0x0002: "GPSLatitude",
	0x0003: "GPSLongitudeRef",
	0x0004: "GPSLongitude",
	0x0005: "GPSAltitudeRef",
	0x0006: "GPSAltitude",
	0x0007: "GPSTimeStamp",
	0x0008: "GPSSatellites",
	0x0009: "GPSStatus",
	0x000a: "GPSMeasureMode",
	0x000b: "GPSDOP",
	0x000c: "GPSSpeedRef",
	0x000d: "GPSSpeed",
	0x000e: "GPSTrackRef",
	0x000f: "GPSTrack",
	0x0010: "GPSImgDirectionRef",
	0x0011: "GPSImgDirection",
	0x0012: "GPSMapDatum",
	0x0013: "GPSDestLatitudeRef",
	0x0014: "GPSDestLatitude",
	0x0015: "GPSDestLongitudeRef",
	0x0016: "GPSDestLongitude",
	0x0017: "GPSDestBearingRef",
	0x0018: "GPSDestBearing",
	0x0019: "GPSDestDistanceRef",
	0x001a: "GPSDestDistance",
	0x001b: "GPSProcessingMethod",
	0x001c: "GPSAreaInformation",
	0x001d: "GPSDateStamp",
	0x001e: "GPSDifferential",
}

var EXIF_IOP_TAGS = map[uint16]string{
	0x0001: "InteroperabilityIndex",
	0x0002: "InteroperabilityVersion",
	0x1000: "RelatedImageFileFormat",
	0x1001: "RelatedImageWidth",
	0x1002: "RelatedImageLength",
}

var IfdSeqMap = map[uint8]string{
	0: "Main",
	1: "Thumbnail",
	2: "SubIFD",
	3: "GPSInfo",
	4: "IOPInfo",
}

var FormatType = map[int]string{
	1:  "UB", // unsigned byte
	2:  "A",  // ASCII
	3:  "US", // unsigned short
	4:  "UL", // unsigned long
	5:  "UR", // unsigned rational
	6:  "SB", // signed byte
	7:  "?",  // undefined
	8:  "SS", // signed short
	9:  "SL", // signed long
	10: "SR", // signed rational
}

// ExifData represents a map of IfdEntries
type ExifData struct {
	headerLength uint16
	IfdData      map[string][]IfdEntries
}

// TiffData contains the byteorder, data buffer and current slice
type TiffData struct {
	byteorder string
	data      []byte
	slice     []byte
}

// IfdEntries represents EXIF metadata for specific tag
type IfdEntries struct {
	IfdSeq  uint8
	Tag     uint16
	TagDesc string
	Format  uint16
	Values  interface{}
}

// ExifInterface implements Exif Header retrieval and Exif stream processing
type ExifInterface interface {
	GetExifHeader(r io.Reader) (data []byte, err error)
	ProcessExifStream(f *os.File)
	GetTagValues(tag uint16) (values interface{}, ok bool)
}

// TiffInterface implements methods to process IFDs
type TiffInterface interface {
	SetByteOrder(byteorder string)
	SetData(data []byte)
	GetFirstIFD() uint32
	GetNextIFD(ifdOffset uint32) uint32
	GetIFDList() []uint32
	ProcessIFD(ifdSeq uint8, ifdOffset uint32, tagDict map[uint16]string) []IfdEntries
}

func debug(s string) {
	log.Println(s)
}

// GetExifData checks the byte stream header to match EXIF metadata
// and returns the EXIF data up to length defined in the header
func (self *ExifData) GetExifData(r io.Reader) (data []byte, err error) {
	b := make([]byte, EXIF_HEADER_READ_SIZE)
	n, err := r.Read(b)
	if err != nil {
		return nil, err
	}

	if n < EXIF_HEADER_READ_SIZE {
		return nil, errors.New(fmt.Sprintf("Read short of EXIF_HEADER_READ_SIZE > %d\n", n))
	}

	if bytes.Equal(b[0:4], EXIF_HEADER_SIGNATURE) &&
		string(b[6:10]) == "Exif" {
		// get length of EXIF data
		var length uint16
		buf := bytes.NewBuffer(b[4:6])
		// data size is BigEndian
		err := binary.Read(buf, binary.BigEndian, &length)
		if err != nil {
			return nil, err
		}

		self.headerLength = length - 8
		data := make([]byte, self.headerLength)
		_, err = r.Read(data)

		if err != nil {
			return nil, err
		}

		return data, nil
	}

	return nil, errors.New("File is not in EXIF complaint format")
}

// SetByteOrder sets the byte order for the TiffData (Intel/Motorola)
func (self *TiffData) SetByteOrder(byteorder string) {
	self.byteorder = byteorder
}

// SetData sets the EXIF data in TiffData struct
func (self *TiffData) SetData(data []byte) {
	self.data = make([]byte, len(data))
	copy(self.data, data)
}

// GetFirstIFD returns the first IFD in the data
func (self TiffData) GetFirstIFD() uint32 {
	return self.Slice(4, 4).Uint32()
}

// GetNextIFD calculates end returns offset of the next available IFD
func (self TiffData) GetNextIFD(ifdOffset uint32) uint32 {
	ifdEntries := uint32(self.Slice(ifdOffset, 2).Uint16())

	// next IFD is calculated as idfOffset + number of entries (2 bytes) storage + Ifd Entries * 12 bytes
	nextIfdOffset := self.Slice(ifdOffset+2+ifdEntries*12, 4).Uint32()

	return nextIfdOffset
}

// GetIFDList returns the list of all IFDs (as offsets)
func (self TiffData) GetIFDList() []uint32 {
	var ifdList []uint32

	ifdOffset := self.GetFirstIFD()
	for ifdOffset != 0 {
		ifdList = append(ifdList, ifdOffset)
		ifdOffset = self.GetNextIFD(ifdOffset)
	}

	return ifdList
}

// Slice allocates and sets TiffData.slice bases on provided offset & length
// returns pointer to TiffData
func (self *TiffData) Slice(offset uint32, length uint32) *TiffData {
	self.slice = make([]byte, length)
	self.slice = self.data[offset : offset+length]
	return self
}

// Uint16 returns 16 bit unsigned integer taking into consideration
// the endianness defined
func (self *TiffData) Uint16() uint16 {
	var v uint16

	switch self.byteorder {
	case "M": // big-endian
		v = uint16(self.slice[1]) | uint16(self.slice[0])<<8
	case "I": // little-endian
		v = uint16(self.slice[0]) | uint16(self.slice[1])<<8
	default:
		log.Fatal(fmt.Sprintf("unrecognised byteorder: %v", self.byteorder))
	}

	return v
}

// Uint32 returns 32 bit unsigned integer taking into consideration
// the endianness defined
func (self *TiffData) Uint32() uint32 {
	var v uint32

	switch self.byteorder {
	case "M": // big-endian
		v = uint32(self.slice[3]) | uint32(self.slice[2])<<8 |
			uint32(self.slice[1])<<16 | uint32(self.slice[0])<<24
	case "I": // little-endian
		v = uint32(self.slice[0]) | uint32(self.slice[1])<<8 |
			uint32(self.slice[2])<<16 | uint32(self.slice[3])<<24
	default:
		log.Fatal(fmt.Sprintf("unrecognised byteorder: %v", self.byteorder))
	}

	return v
}

// Uint64 returns 64 bit unsigned integer taking into consideration
// the endianness defined
func (self *TiffData) Uint64() uint64 {
	var v uint64

	switch self.byteorder {
	case "M": // big-endian
		v = uint64(self.slice[7]) |
			uint64(self.slice[6])<<8 |
			uint64(self.slice[5])<<16 |
			uint64(self.slice[4])<<24 |
			uint64(self.slice[3])<<32 |
			uint64(self.slice[2])<<40 |
			uint64(self.slice[1])<<48 |
			uint64(self.slice[0])<<56

	case "I": // little-endian
		v = uint64(self.slice[0]) |
			uint64(self.slice[1])<<8 |
			uint64(self.slice[2])<<16 |
			uint64(self.slice[3])<<24 |
			uint64(self.slice[4])<<32 |
			uint64(self.slice[5])<<40 |
			uint64(self.slice[6])<<48 |
			uint64(self.slice[7])<<56
	default:
		log.Fatal(fmt.Sprintf("unrecognised byteorder: %v", self.byteorder))

	}

	return v
}

// Int16 returns 16 bit signed integer taking into consideration
// the endianness defined
func (self *TiffData) Int16() int16 {
	numBytes := len(self.slice)
	msb := 2 << ((uint8(numBytes) * 8) - 1) // shift 1 to msb
	v := self.Uint16()                      // unsigned value
	if msb&int(v) == msb {                  // msb is 1
		v = -v // negate the value
	}

	return int16(v)
}

// Int32 returns 32 bit signed integer taking into consideration
// the endianness defined
func (self *TiffData) Int32() int32 {
	numBytes := len(self.slice)
	msb := 1 << ((uint8(numBytes) * 8) - 1) // shift 1 to msb
	v := self.Uint32()                      // unsigned value
	if msb&int(v) == msb {                  // msb is 1
		v = -v // negate the value
	}

	return int32(v)
}

// Int64 returns 64 bit signed integer taking into consideration
// the endianness defined
func (self *TiffData) Int64() int64 {
	numBytes := len(self.slice)
	msb := 1 << ((uint8(numBytes) * 8) - 1) // shift 1 to msb
	v := self.Uint64()                      // unsigned value
	// fmt.Printf("msb = %b; v = %v\n", msb, v)
	if msb&int(v) == msb { // msb is 1
		v = -v // negate the value
	}

	return int64(v)
}

// ProcessIFD takes the IFD sequence; IFD offset; EXIF tags dictionary
// and returns an array of IfdEntries
func (self TiffData) ProcessIFD(ifdSeq uint8, ifdOffset uint32, tagDict map[uint16]string) []IfdEntries {
	entries := self.Slice(ifdOffset, 2).Uint16()
	var ifdFields []IfdEntries

	// bytes per format
	var formatBytes []uint = []uint{1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8}
	for i := uint16(0); i < entries; i++ {
		// get the base offset to retrieve tag
		base := ifdOffset + 2 + uint32(i)*12
		tag := self.Slice(base, 2).Uint16() // tag: 2 bytes
		format := self.Slice(base+2, 2).Uint16()
		count := self.Slice(base+4, 4).Uint32()
		offset := base + 8 // tag + format + count bytes
		formatLen := uint32(formatBytes[format-1])

		if count*formatLen > 4 { // have offset, not value
			offset = self.Slice(offset, 4).Uint32()
		}

		var values []interface{}

		if format == 2 { // string NULL terminated
			v := self.Slice(offset, count-1).slice
			values = append(values, fmt.Sprintf("%s", v))
		} else {
			for i := uint32(0); i < count; i++ {
				if format%5 != 0 { // non-rationals
					vptr := self.Slice(offset, formatLen)

					switch format {
					case 1: // unsigned byte
						values = append(values, vptr.slice)
					case 3: // unsigned short
						values = append(values, vptr.Uint16())
					case 4: // unsigned long
						values = append(values, vptr.Uint32())
					case 6: // signed byte
						values = append(values, vptr.slice)
					case 7: // undefined
						values = append(values, vptr.slice)
					case 8: // signed short
						values = append(values, vptr.Int16())
					case 9: // signed long
						values = append(values, vptr.Int32())
						// 11 & 12 (float types) are not handled
					}
				} else { // it's a fraction
					// only format type 5 & 10
					num := self.Slice(offset, 4).Int32()
					den := self.Slice(offset+4, 4).Int32()
					// values = append(values, fmt.Sprintf("%d/%d", num, den))
					if den != 0 {
						values = append(values, big.NewRat(int64(num), int64(den)))
					}
				}
				offset = offset + formatLen
			}
		}

		var tagDesc string
		for k, v := range tagDict {
			if k == tag {
				tagDesc = v
			}
		}

		ifdFields = append(ifdFields, IfdEntries{ifdSeq, tag, tagDesc, format, values})
	}

	return ifdFields
}

// PrintIfd prints the supplied IFD entries
func PrintIFD(ifds []IfdEntries) {
	for _, v := range ifds {
		lval, ok := v.Values.([]interface{})
		var values string
		if ok {
			switch val := lval[0].(type) {
			case string:
				values = fmt.Sprintf("'%s'", val)
			case byte:
				values = fmt.Sprintf("%#x", val)
			case []uint8:
				var lstr []string
				for _, v := range lval {
					lstr = append(lstr, fmt.Sprintf("%#x", v))
				}
				values = strings.Join(lstr, ", ")
			case int16:
				values = fmt.Sprintf("%d", val)
			case int32:
				values = fmt.Sprintf("%d", val)
			case int64:
				values = fmt.Sprintf("%d", val)
			case uint16:
				values = fmt.Sprintf("%d", val)
			case uint32:
				values = fmt.Sprintf("%d", val)
			case uint64:
				values = fmt.Sprintf("%d", val)
			case *big.Rat:
				values = fmt.Sprintf("%s", val.RatString())
			default:
				values = fmt.Sprintf("%v", lval)
			}
		}
		fmt.Printf("[%s] (0x%04x) %s(%s) = [%s]\n", IfdSeqMap[v.IfdSeq], v.Tag, v.TagDesc, FormatType[int(v.Format)], values)
	}
}

func (self *ExifData) GetTagValues(tag uint16) (values interface{}, ok bool) {
	for _, entries := range self.IfdData {
		for _, v := range entries {
			if v.Tag == tag {
				return v.Values, true
			}
		}
	}

	return nil, false
}

// ProcessExifStream reads the image file content
func (self *ExifData) ProcessExifStream(f *os.File) (datax []byte, err error) {
	data, err := self.GetExifData(f)

	if err != nil {
		return nil, err
		//log.Fatal(err)
	}

	var tiff TiffInterface = &TiffData{}

	tiff.SetByteOrder(string(data[0]))
	tiff.SetData(data)
	ifdList := tiff.GetIFDList()

	self.IfdData = make(map[string][]IfdEntries, len(ifdList)+3) // provision for SubIFD, GPSInfo, IOPInfo

	for k, v := range ifdList {
		ifds := tiff.ProcessIFD(uint8(k), v, EXIF_TAGS)
		self.IfdData[IfdSeqMap[uint8(k)]] = ifds

		var subIfdOffset uint32
		var gpsInfoOffset uint32
		var iopOffset uint32

		for _, v := range ifds {
			if v.Tag == EXIF_SUBIFD_OFFSET_TAG {
				values, ok := v.Values.([]interface{})
				if ok {
					val, ok := values[0].(uint32)
					if ok {
						subIfdOffset = uint32(val)
					}
				}
			} else if v.Tag == EXIF_GPSINFO_TAG {
				values, ok := v.Values.([]interface{})
				if ok {
					val, ok := values[0].(uint32)
					if ok {
						gpsInfoOffset = uint32(val)
					}
				}
			}
		}

		if subIfdOffset != 0 {
			subIfd := tiff.ProcessIFD(2, subIfdOffset, EXIF_TAGS)
			self.IfdData[IfdSeqMap[2]] = subIfd
			for _, v := range subIfd { // try to find SubIFD Interoperability Tag
				if v.Tag == EXIF_IOP_TAG {
					values, ok := v.Values.([]interface{})
					if ok {
						val, ok := values[0].(uint32)
						if ok {
							iopOffset = uint32(val)
						}
					}
				}
			}
		}

		if gpsInfoOffset != 0 {
			gpsInfo := tiff.ProcessIFD(3, gpsInfoOffset, EXIF_GPSINFO_TAGS)
			self.IfdData[IfdSeqMap[3]] = gpsInfo
		}

		if iopOffset != 0 {
			iopInfo := tiff.ProcessIFD(4, iopOffset, EXIF_IOP_TAGS)
			self.IfdData[IfdSeqMap[4]] = iopInfo
		}
	}

	return data, nil
}
