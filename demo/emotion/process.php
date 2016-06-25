<?php

//------------------------------------
// process.php
// processes calls to Kairos API (for examples and webcam modules)
// created: March 2016
// author: Steve Rucker
//------------------------------------

$configs = include('../config.php');

if ($_POST['fname'] == "demoVideo") {
    
    //------------------------------------
    // GET REQUEST TO API FOR EXAMPLES
    //------------------------------------

    $demoVideos = $configs["demoVideos"];
    $thisDemo = $_POST['demo'];

    $request = curl_init(API_URL . "/media");
    // set curl options
    curl_setopt($request, CURLOPT_URL, API_URL . "/media/" . $demoVideos[$thisDemo]);
    curl_setopt($request, CURLOPT_HTTPHEADER, array(
            // "Content-type: application/json",
            "app_id:" . APP_ID,
            "app_key:" . APP_KEY
        )
    );
    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($request);

    echo $response;
    // // close the session
    curl_close($request);

} else if ($_POST['fname'] == "polling") {

    //------------------------------------
    // GET REQUEST TO API FOR POLLING FUNCTION
    //------------------------------------

    $mediaId = $_POST['mediaId'];

    $request = curl_init();
    // set curl options
    curl_setopt($request, CURLOPT_URL, API_URL . "/media/" . $mediaId);
    curl_setopt($request, CURLOPT_RETURNTRANSFER,true);
    curl_setopt($request, CURLOPT_HTTPHEADER, array(
            // "Content-type: application/json",
            "app_id:" . APP_ID,
            "app_key:" . APP_KEY
        )
    );
    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($request);

    echo $response;
    // // close the session
    curl_close($request);

}
else if ($_POST['fname'] == "webUrl") {

    //------------------------------------
    // POST REQUEST TO API WITH URL
    //------------------------------------

    // get URL from AJAX POST
    $thisUrl = $_POST["url"];

    $request = curl_init(API_URL . "/media?source=" . $thisUrl . "&timeout=1");

    // set curl options
    curl_setopt($request, CURLOPT_POST, true);
    curl_setopt($request, CURLOPT_HTTPHEADER, array(
        "app_id:" . APP_ID, 
        "app_key:" . APP_KEY
        )
    );

    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

    $response =  curl_exec($request);

    echo $response;

    curl_close($request);

}
else {

    //------------------------------------
    // POST REQUEST TO API FOR WEBCAM
    //------------------------------------

    // pull the raw binary data from the POST array
    $data = substr($_POST['data'], strpos($_POST['data'], ",") + 1);
    // decode it
    $decodedData = base64_decode($data);
    // print out the raw data,
    $filename = $_POST['fname'];
    $fullFilename = $filename . ".webm";
    file_put_contents("media/" . $fullFilename, $decodedData);

    function isSSL()
    {
        $protocol = "http://";
        if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443) {
            $protocol = "https://";
        }
        return $protocol;
    }

    $mediaPath = isSSL() . $_SERVER['HTTP_HOST'] . "/emotion/media/" . $fullFilename;
    $queryUrl = API_URL . "/media?source=" . $mediaPath . "&timeout=1";

    $request = curl_init($queryUrl);
    // set curl options
    curl_setopt($request, CURLOPT_POST, true);
    curl_setopt($request, CURLOPT_HTTPHEADER, array(
            "app_id:" . APP_ID,
            "app_key:" . APP_KEY
        )
    );

    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($request);

    echo $response;
    // // close the session
    curl_close($request);

    unlink("media/" . $fullFilename);

}


?> 