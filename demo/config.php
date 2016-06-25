<?php

define( 'APP_ID', (getenv('APP_ID') ? getenv('APP_ID') : ''));
define( 'APP_KEY', (getenv('APP_KEY') ? getenv('APP_KEY') : ''));
define( 'API_URL', (getenv('API_URL') ? getenv('API_URL') : ''));
define( 'DEMO1_ID', (getenv('DEMO1_ID') ? getenv('DEMO1_ID') : ''));
define( 'DEMO2_ID', (getenv('DEMO2_ID') ? getenv('DEMO2_ID') : ''));
define( 'DEMO3_ID', (getenv('DEMO3_ID') ? getenv('DEMO3_ID') : ''));

return array(

    "highchartsColors" => '[
        ["#2DB475"],
        ["#1175E3"],
        ["#DA0059"],
        ["#2C3444"]
    ]',
    "mediaPath" => "https://media.kairos.com/emodemo/",
    "highchartsBkgColor" => '"#fff"',
    "uploadFileSize" => "20971520",
    "uploadFileTypesVideo" => '[
        ["video/mp4"],
        ["video/x-flv"],
        ["video/webm"],
        ["video/quicktime"]
    ]',
    "uploadFileTypesImage" => '[
        ["image/gif"],
        ["image/png"],
        ["image/jpeg"]
    ]',
    "apiTimeout" => "30",
    "pollTimeout" => "60000",
    "demoVideos"  => array(
        "demo1"=>DEMO1_ID,
        "demo2"=>DEMO2_ID,
        "demo3"=>DEMO3_ID
    )
);

?>
