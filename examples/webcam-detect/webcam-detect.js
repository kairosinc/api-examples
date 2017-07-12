var webcamModule = function () {
    var streaming = false;
    var video = null;
    (function () {
        video = document.getElementById('webcamVideo');
        navigator.getUserMedia({
            video: true,
            audio: false
        },
            function(stream) {
                if (navigator.mozGetUserMedia) {
                  video.mozSrcObject = stream;
                } 
                else {
                    var vendorURL = window.URL || window.webkitURL;
                    video.src = vendorURL.createObjectURL(stream);
                }
                video.play();
                localStream = stream.getTracks()[0];
            },
            function(err) {
                console.log(err)
            }
        );
        video.addEventListener('canplay', function(ev){
            if (!streaming) {
                video.setAttribute('width', '600');
                video.setAttribute('height', '450');
                streaming = true;
            }
            var captureInterval = 3000;
            var countdown = captureInterval/1000;
            var counterFunction = setInterval(function () {
                $("#showCounter").html(countdown);
                if (countdown <= 0) {
                    takepicture(video);
                    clearInterval(counterFunction);
                    localStream.stop();
                }
                countdown --;
            },1000);
        },  false);
    })();
};
var takepicture = function(video) {
    $("#showCounter").html("Retrieving data...");
    var canvas = document.createElement('CANVAS');
    var context = canvas.getContext('2d');
    canvas.width = '600';
    canvas.height = '450';
    // draw video image onto canvas, get data
    context.drawImage(video, 0, 0);
    var imageData = canvas.toDataURL('image/png');
    var data = {};
    imgObj = { 
        "image"   : parseImageData(imageData)
    };
    data.imgObj = JSON.stringify(imgObj);
    $.ajax({
        type: 'POST',
        url: 'detect.php',
        data: data,
        dataType: 'text'
    }).done(function(data){
        $("#showCounter").html("");
        $("#detectResponse").html("Response: " + data);
        var response = JSON.parse(data);
        if (response.images) {
            $("#facesFound").html("Faces Found");
        }
        else {
            $("#facesFound").html("No Faces Found");
        }
    });
    $(video).hide();
}
var parseImageData = function(imageData) {
    imageData = imageData.replace("data:image/jpeg;base64,", "");
    imageData = imageData.replace("data:image/jpg;base64,", "");
    imageData = imageData.replace("data:image/png;base64,", "");
    imageData = imageData.replace("data:image/gif;base64,", "");
    imageData = imageData.replace("data:image/bmp;base64,", "");
    return imageData;
}