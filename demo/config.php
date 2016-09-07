<?php

define( 'APP_ID', (getenv('APP_ID') ? getenv('APP_ID') : ''));
define( 'APP_KEY', (getenv('APP_KEY') ? getenv('APP_KEY') : ''));
define( 'API_URL', (getenv('API_URL') ? getenv('API_URL') : ''));
define( 'DEMO1_ID', (getenv('DEMO1_ID') ? getenv('DEMO1_ID') : ''));
define( 'DEMO2_ID', (getenv('DEMO2_ID') ? getenv('DEMO2_ID') : ''));
define( 'DEMO3_ID', (getenv('DEMO3_ID') ? getenv('DEMO3_ID') : ''));
define( 'DEMO_SECRET_KEY', (getenv('DEMO_SECRET_KEY') ? getenv('DEMO_SECRET_KEY') : ''));

return array(

    "highchartsColors" => '[
        ["#22B573"],
        ["#1175E3"],
        ["#FB623E"],
        ["#DA0059"],
        ["#752673"],
        ["#FBB03B"]
    ]',
    "mediaPath" => "https://media.kairos.com/demo/emotion/",
    "uploadFileSizeImage" => "10000000",
    "uploadFileTypesImage" => '[
        ["image/gif"],
        ["image/png"],
        ["image/jpeg"],
        ["image/jpg"]
    ]',
    "uploadFileSizeVideo" => "50000000",
    "uploadFileTypesEmotion" => '[
        ["video/mp4"],
        ["video/x-flv"],
        ["video/webm"],
        ["video/quicktime"],
        ["video/mov"],
        ["image/png"],
        ["image/jpeg"],
        ["image/jpg"],
        ["application/octet-stream"],
        ["image/x-ms-bmp"]
    ]',
    "apiTimeout" => "30",
    "pollTimeout" => "120000",
    "demoMedia"  => array(
        "video_1"=>DEMO1_ID,
        "video_2"=>DEMO2_ID,
        "fullsize_3"=>DEMO3_ID
    )
);

?>
