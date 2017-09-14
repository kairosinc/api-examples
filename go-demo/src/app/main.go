package main

import (
	"app/handlers"
	"github.com/labstack/echo"
	"html/template"
	"io"
)

type Template struct {
	templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func main() {
	e := echo.New()

	// Routes

	e.Static("/", "assets")
	t := &Template{
		templates: template.Must(template.ParseGlob("public/views/*.html")),
	}
	e.Renderer = t
	e.GET("/", handlers.RenderMainIndex)
	// detect
	e.GET("/detect", handlers.RenderDetect)
	e.GET("/detect/", handlers.RenderDetect)
	e.POST("/detect/send-to-api", handlers.SendToApiDetect)
	// facerace
	e.GET("/facerace", handlers.RenderFacerace)
	e.GET("/facerace/", handlers.RenderFacerace)
	e.POST("/facerace/send-to-api", handlers.SendToApiFacerace)
	// recognize
	e.GET("/recognize", handlers.RenderRecognize)
	e.GET("/recognize/", handlers.RenderRecognize)
	e.POST("/recognize/send-to-api", handlers.SendToApiRecognize)
	// verify
	e.GET("/verify", handlers.RenderVerify)
	e.GET("/verify/", handlers.RenderVerify)
	e.POST("/verify/send-to-api", handlers.SendToApiVerify)
	// emotion
	e.GET("/emotion", handlers.RenderEmotion)
	e.GET("/emotion/", handlers.RenderEmotion)
	e.POST("/emotion/send-to-api", handlers.SendToApiEmotion)
	// utilities
	e.POST("/exif-data", handlers.ExifData)
	e.Logger.Fatal(e.Start(":8080"))
}
