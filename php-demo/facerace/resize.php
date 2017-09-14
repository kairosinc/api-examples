<?php

$via = trim(preg_replace('@[^a-z0-9]@i', '', (string)$_GET['via']));
$sha = trim(preg_replace('@[^a-z0-9]{40}@', '', (string)$_GET['sha']));

define('DEMO_ENV', (getenv('STAGE') ? getenv('STAGE') : 'dev'));

$image_url = "https://media.kairos.com/demo/facerace/".DEMO_ENV."/".$sha.".png";

$content = @file_get_contents($image_url);

if (empty($content)) {
    header("HTTP/1.0 404 Not Found");
    exit;
}

// set image resize
switch (strtolower($via)) {
    case 'twitter':
        $width = 0; //300;
        $height = 230;
        break;
    default:
        $width = 440;
        $height = 440;
}

$image = new Imagick();
$image->readImageBlob($content);
$image->cropImage($width, $height, 0, 40);

// make smaller
//$image->resizeImage($width, $height, Imagick::FILTER_LANCZOS, 1);
//$image->scaleImage($width, $height); //, true);
//$image->setImageExtent(440, 230);

// make smaller but with extra padding
//$image->setImageBackgroundColor('#2C3444');
//$image->extentImage(440, 230, -110, 0);

header('Content-Type: image/png');
echo $image;