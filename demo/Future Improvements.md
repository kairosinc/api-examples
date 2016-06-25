# Future Improvments
* Currently, the emotions are hardcoded: Smile, Surprise, Negative, Attention.  These states need to be made dynamic to allow for future additions to the API.
* The javascript needs to be refactored.  Many of the jQuery statements can be combined. Consider namespacing javascript objects.  Break up long methods by shifting overly complex chunks of code into new methods.  Make variable naming more consistent.
* Show videos in result view in webcam and upload modules.  Investigate saving webcam video in browser.  Uploaded video might need to be saved temporarily, then deleted.
* Add more variables to config.php file.
* Obtain better video examples.
* In Highcharts graph, connect y axis lines at mousepoint so that there's an unbroken line from top to bottom of the entire graph.  (Ben)
* Add face detection before webcam capture starts.
