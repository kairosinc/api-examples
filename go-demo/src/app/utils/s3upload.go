package s3upload

import (
	"bytes"
	"fmt"
	"net/http"
	"os"
)

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

// Upload ...
func Upload(imageFileName, imageFilePath string) string {
	if imageFilePath == "" {
		imageFilePath = "assets/agassi.jpg" // for testing
	}

	aws_access_key_id := os.Getenv("AWS_ACCESS_KEY_ID")
	aws_secret_access_key := os.Getenv("AWS_SECRET_ACCESS_KEY")
	aws_s3_region := os.Getenv("AWS_S3_REGION")
	if os.Getenv("AWS_S3_REGION") == "" {
		aws_s3_region = "us-east-1"
	}
	aws_s3_upload_bucket := os.Getenv("AWS_S3_UPLOAD_BUCKET")
	if os.Getenv("AWS_S3_UPLOAD_BUCKET") == "" {
		aws_s3_upload_bucket = "kairos-media"
	}
	demo_env := os.Getenv("STAGE")
	if os.Getenv("STAGE") == "" {
		demo_env = "dev"
	}
	token := ""
	creds := credentials.NewStaticCredentials(aws_access_key_id, aws_secret_access_key, token)
	_, err := creds.Get()
	if err != nil {
		fmt.Printf("canonical_log=1 log_type=error message=\"bad credentials: %s\"", err)
	}
	cfg := aws.NewConfig().WithRegion(aws_s3_region).WithCredentials(creds)
	svc := s3.New(session.New(), cfg)

	file, err := os.Open(imageFilePath)
	if err != nil {
		fmt.Printf("canonical_log=1 log_type=error message=\"err opening file: %s\"", err)
	}
	defer file.Close()
	fileInfo, _ := file.Stat()
	size := fileInfo.Size()
	buffer := make([]byte, size) // read file content to buffer

	file.Read(buffer)
	fileBytes := bytes.NewReader(buffer)
	fileType := http.DetectContentType(buffer)
	path := "demo/facerace/" + demo_env + "/" + imageFileName
	params := &s3.PutObjectInput{
		Bucket:        aws.String(aws_s3_upload_bucket),
		Key:           aws.String(path),
		Body:          fileBytes,
		ContentLength: aws.Int64(size),
		ContentType:   aws.String(fileType),
		ACL:           aws.String("public-read"),
	}
	resp, err := svc.PutObject(params)
	if err != nil {
		fmt.Println(fmt.Sprintf("canonical_log=1 log_type=error message=\"S3 Response Failed: %s (resp => %s)\"", err, resp))
	}
	//fmt.Println(fmt.Sprintf("S3 Response: %+v", awsutil.StringValue(resp)))

	s3URL := fmt.Sprintf("https://%s.s3.amazonaws.com/%s", aws_s3_upload_bucket, path)

	return s3URL
}
