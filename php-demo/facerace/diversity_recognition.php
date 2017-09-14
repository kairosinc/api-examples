<?php

/*
apk update; apk add php5-gd php5-imagick ghostscript ghostscript-fonts
supervisorctl restart php-fpm
composer require aws/aws-sdk-php
*/

require_once('../vendor/autoload.php');
//require_once('./phpgraphlib/phpgraphlib.php');

use Aws\S3\S3Client;

define('AWS_S3_REGION', (getenv('AWS_S3_REGION') ? getenv('AWS_S3_REGION') : ''));
define('AWS_S3_UPLOAD_BUCKET', (getenv('AWS_S3_UPLOAD_BUCKET') ? getenv('AWS_S3_UPLOAD_BUCKET') : ''));
define('AWS_ACCESS_KEY_ID', getenv('AWS_ACCESS_KEY_ID'));
define('AWS_SECRET_ACCESS_KEY', getenv('AWS_SECRET_ACCESS_KEY'));

define('DEMO_ENV', (getenv('STAGE') ? getenv('STAGE') : 'dev'));

define('PHP_OWNER', 'nginx');
define('PHP_GROUP', 'nginx');

define('IMAGE_WIDTH', 440);
define('IMAGE_HEIGHT', 440);

class DiversityRecognition {
	protected $debug = false;

	function __construct(array $options = []){
		if (!empty($options['debug']) && $options['debug'] == true) {
			$this->debug = true;
		}
	}

	function createGraphWithData($new_file, $data)
	{
		$image = new Imagick();

		$width = IMAGE_WIDTH;
		$height = IMAGE_HEIGHT; 

		$image->newImage( $width, $height, new ImagickPixel('#2C3344'));
		$image->setImageOpacity(0.7);

		$drawText = new ImagickDraw();
		$drawText->setFont('./ProximaNova-Semibold.otf');
		$drawText->setFillColor('white');
		$drawText->setGravity(Imagick::GRAVITY_NORTHWEST);
		$drawText->setTextAlignment(\Imagick::ALIGN_RIGHT);

		$drawShape = new ImagickDraw();
		$drawShape->setStrokeColor('transparent');

		// get data ethnicities
		$ethnicities = $data['ethnicities'];

		arsort($ethnicities);

		// config bars/text's width/heights:
		$start_x1 = 105;
		$start_y1 = 30;
		$end_x2 = 40;
		$end_y2 = 30;

		$start_bar_x = 0;
		$pad_bar_x = 62;
		$pad_bar_y = 20;

		$start_text_x = 7;
		$pad_text_x = 63;

		$ethnicity_text_align_pixels = 90;

		// calculate the bar length
		$fill_bar = function($percent = 100, $debug = false) use ($width, $start_x1) {
			if ($debug) { $percent = rand(0, 100); }

			//$percent = ($percent < 1 ? 1 : $percent); // rounds up to one if less than one
			$left_pad = $start_x1;
			$sweet_spot = 130;

			$calc['percent'] = $percent;
			$calc['percent_decimal'] = $percent / 100;
			$calc['label'] = $percent . '%';

			if ($percent == 0) {
				$calc['bar_size'] = 0;
			}
			else {
				$calc['bar_size'] = $left_pad + (($width - $sweet_spot) * $calc['percent_decimal']);
			}
			
			return $calc;
		};

		// display all ethnicities
		foreach ($ethnicities as $ethnicity_name => $ethnicity_percent) {
			$bbb = $fill_bar(round($ethnicity_percent));

			// display individual ethnicity percent bar 
			$start_bar_x = $start_bar_x + $pad_bar_x;
			$drawShape->setFillColor('#209b8a');

			if ($bbb['bar_size'] != 0) {
				$drawShape->rectangle( $start_x1, $start_bar_x, $bbb['bar_size'], ($start_bar_x + $pad_bar_y) );
			}

			// display individual ethnicity percent/label
			$start_text_x = $start_text_x + $pad_text_x;

			// display percent
			$drawText->setFontSize(21);
			$image->annotateImage($drawText, $ethnicity_text_align_pixels, $start_text_x, 0, $bbb['label']);

			// display ethnicity (below percent)
			$drawText->setFontSize(13);
			$image->annotateImage($drawText, $ethnicity_text_align_pixels, $start_text_x + 20, 0, $ethnicity_name);
		}

		// display hashtag
		$drawText->setFont('./ProximaNova-Black.otf');
		$drawText->setFontSize(14);
		$image->annotateImage($drawText, $width - 25, $height - 15, 0, '#DiversityRecognition');

		// display branding
		$image->annotateImage($drawText, 150, $height - 15, 0, 'KAIROS.COM/YOU');

		$image->drawImage($drawShape);
		$image->setImageFormat('png');
		$image->writeImage($new_file);
		$image->destroy();

		// header('Content-type: image/png'); 
		// echo $image;

		return $new_file;
	}

	function recursiveRemoveDirectory($directory)
	{
	    foreach(glob("{$directory}/*") as $file)
	    {
	        if(is_dir($file)) { 
	            $this->recursiveRemoveDirectory($file);
	        } else {
	            unlink($file);
	        }
	    }
	    rmdir($directory);
	}

	function getFileMimeType($file)
	{
	    $finfo = finfo_open(FILEINFO_MIME_TYPE);
	    $get_mime_type = finfo_file($finfo, $file);
	    finfo_close($finfo);

	    return $get_mime_type;
	}

	function validateSupportedContentType($content_type)
	{
	    $content_type = strtolower(trim($content_type));

	    $supported_types = array('image/jpeg', 'image/jpg', 'image/png');

	    if (in_array($content_type, $supported_types, true)) {
	        return true;
	    }

	    return false;
	}

	function downloadRemoteUrl($url, $destination_filepath)
	{
	    $url = trim((string) $url);

		$url = str_replace(" ","%20",$url);
		$fp = fopen($destination_filepath, 'w+');

	    $c = curl_init();
	    curl_setopt($c, CURLOPT_URL, $url);
	    curl_setopt($c, CURLOPT_HEADER, false);
	    curl_setopt($c, CURLOPT_NOBODY, false);
	    curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
	    curl_setopt($c, CURLOPT_FRESH_CONNECT, true);
	    curl_setopt($c, CURLOPT_FAILONERROR, true);
	    curl_setopt($c, CURLOPT_CONNECTTIMEOUT, false);
	    curl_setopt($c, CURLOPT_TIMEOUT, 90);
	    curl_setopt($c, CURLOPT_FOLLOWLOCATION, true);
	    curl_setopt($c, CURLINFO_HEADER_OUT, true);
	    curl_setopt($c, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($c, CURLOPT_FILE, $fp);

	    $data = curl_exec($c);
	    $info = curl_getinfo($c);
	    curl_close($c);
		fclose($fp);

		//changeFilePermission($destination_filepath, 0444);

	    if (empty($info['http_code']) || (!empty($info['http_code']) && $info['http_code'] !== 200)) {
	        throw new Exception('invalid url was sent');
	    }

	    $get_mime_type = $this->getFileMimeType($destination_filepath);

	    if ($this->validateSupportedContentType($get_mime_type) === false) {
	        throw new Exception('an invalid image was sent must be jpg or png format');
	    }

	    return [
			'file_path' => $destination_filepath,
			'content_type' => $get_mime_type
		];
	}
	
	function overlayGraphWithOriginalFile($graph_file, $original_file, $new_file, $opacity = 0.8)
	{
		$watermark = new Imagick($graph_file);
		//$watermark->setImageOpacity($opacity);

		$image = new Imagick($original_file);
		$image->setImageFormat('jpeg');

		$coord_y = $image->getImageHeight() - $watermark->getImageHeight();
		$coord_x = $image->getImageWidth() - $watermark->getImageWidth();

		$image->compositeImage( $watermark, $watermark->getImageCompose(), 0, $coord_y);

		$image->writeImage($new_file);

		$watermark->destroy();
		$image->destroy();

		return $new_file;
	}

	function getFaceDetails($original_data = [], $percentage_decimal = 2)
	{
		$get_eths = ['asian', 'black', 'hispanic', 'white', 'other'];

		$new_data = ['gender'=> 'n/a', 'age' => 'n/a', 'ethnicities' => [] ];

		foreach ($get_eths as $eth) {
			if (isset($original_data[ $eth ])) {
				$new_data['ethnicities'][ strtoupper($eth) ] = round( $original_data[ $eth ] * 100, $percentage_decimal);
			}
		}

		if (!empty($original_data['gender']['type'])) {
			$new_data['gender'] = (strtolower($original_data['gender']['type']) == 'f' ? 'female' : 'male');
		}

		if (!empty($original_data['age'])) {
			$new_data['age'] = $original_data['age'];
		}

		return $new_data;
	}

	function changeFilePermission($files, $permision = 0777)
	{
		return;

		$files = (!is_array($files) ? (array) $files : $files);

		foreach($files as $file) {
			if (file_exists($file)) {
				chown($file, PHP_OWNER);
				chgrp($file, PHP_GROUP);
				chmod($file, $permision);			
			}
		}
	}

	function uploadFileToS3($new_file, $s3_filename)
	{
	    $awsDefaultConfig = [
	        'credentials' => [
	            'region' => AWS_S3_REGION,
	            'version' => 'latest',
	            'credentials' => [
	                'key' => AWS_ACCESS_KEY_ID,
	                'secret' => AWS_SECRET_ACCESS_KEY,
	            ],
	        ],
	        's3_bucket' => AWS_S3_UPLOAD_BUCKET,
	    ];

	    $destFilePath = 'demo/facerace/'.DEMO_ENV.'/'.$s3_filename;
		
	    try {
	    	$s3 = new S3Client($awsDefaultConfig['credentials']);

	        $response = $s3->putObject([
	            'Bucket' => $awsDefaultConfig['s3_bucket'],
	            'Key' => $destFilePath,
	            'Body' => fopen($new_file, 'r'),
	            'ACL' => 'public-read',
	            'ContentType'  => 'image/png',
	        ]);

	        return $response->toArray();
	    } catch (Aws\Exception\S3Exception $e) {
	    	throw new Exception("Diversity: There was an error uploading the file.");
	    	// print $e->getMessage();
	        //exit;
	    }

	    return false;
	}

    function autoRotateImage($image) {
        $orientation = $image->getImageOrientation();

        switch($orientation) {
            case imagick::ORIENTATION_BOTTOMRIGHT:
                $image->rotateimage("#000", 180); // rotate 180 degrees
                break;

            case imagick::ORIENTATION_RIGHTTOP:
                $image->rotateimage("#000", 90); // rotate 90 degrees CW
                break;

            case imagick::ORIENTATION_LEFTBOTTOM:
                $image->rotateimage("#000", -90); // rotate 90 degrees CCW
                break;
        }

        // Now that it's auto-rotated, make sure the EXIF data is correct in case the EXIF gets saved with the image!
        $image->setImageOrientation(imagick::ORIENTATION_TOPLEFT);
    }

	function processEverything($json_data = [], $original_url, $is_image_data = false)
	{
		if (empty($json_data['images'][0]['faces'][0]['attributes']['age'])) {
			throw new Exception("Diversity: unable to find face details");
		}

		// get face attributes
		$original_data = $json_data['images'][0]['faces'][0]['attributes'];

		$source_checksum = sha1(time().'-'.json_encode($original_data));
		$face_dir = __DIR__.'/tmp/'.$source_checksum;

		if (!file_exists($face_dir)) {
			mkdir($face_dir, 0777, true);
			//$this->changeFilePermission($face_dir);
		}

		// save the image to a file if base64
		if ($is_image_data == true  && !empty($original_url)) {	        
	        $base64_file = $face_dir.'/source.jpg';
	        $binary_data = base64_decode($original_url, true);
	        $handle = fopen($base64_file, 'wb');
	        fwrite($handle, $binary_data);
	        fclose($handle);
	        $original_url = $base64_file;
		}

		$url_real_filename = basename(parse_url($original_url, PHP_URL_PATH));
		$source_filename = 'source.'.pathinfo($url_real_filename, PATHINFO_EXTENSION);
		$source_filepath = $face_dir.'/'.$source_filename;
		$scaled_source_filepath = $face_dir.'/scaled.'.$source_filename;

		if ($is_image_data == false && !empty($original_url)) {	
			// download remote file
			$get_remote_file = $this->downloadRemoteUrl($original_url, $source_filepath);
			$original_file = $get_remote_file['file_path'];
		}

		$graph_file = $face_dir.'/graph.png';
		$new_file = $face_dir.'/final.png';
		$s3_filename = $source_checksum.'.png';

		// scale proportionally the source image
		$orig_image = new Imagick($source_filepath);
		$orig_image->resizeImage(IMAGE_WIDTH, IMAGE_HEIGHT, Imagick::FILTER_LANCZOS, 1);
		$this->autoRotateImage($orig_image);
		$orig_image->writeImage($scaled_source_filepath);
		$orig_image->destroy();

		$face_data = $this->getFaceDetails($original_data);

		$this->createGraphWithData($graph_file, $face_data);

		$this->overlayGraphWithOriginalFile($graph_file, $scaled_source_filepath, $new_file);

		// for LOCALHOST testing purposes
		if ($this->debug == true) {
			$get_s3_image_url = "https://media.kairos.com/demo/facerace/".DEMO_DEV."/".$s3_filename;
		}
		else {
			$s3_response = $this->uploadFileToS3($new_file, $s3_filename);

			if (!empty($s3_response['ObjectURL'])) {
				$image_url = $s3_response['ObjectURL'];
				$get_s3_image_url = "https://media.kairos.com/demo/facerace/".explode('/facerace/',$image_url)[1];
			}
			else {
				$get_s3_image_url = null;	
			}
		}

		return [
			'face_dir' => $face_dir,
			'new_file' => $new_file,
			's3_image_url' => $get_s3_image_url
		];
	}

	public static function getFakeData()
	{
		$test[] = 'http://media.kairos.com/kairos-elizabeth2.jpg';
		$test[] = 'http://media.kairos.com/sample/woman-3.jpg';
		$test[] = 'https://www.afterplasticsurgery.com/wp-content/uploads/2015/12/Tom-Cruise-face-lift-after.jpg';

		$original_url = $test[ rand(0, count($test)-1) ];

		$test_data['images'] = [
			[
				'faces' => [
					[
						'attributes' => [
							'age' => rand(18,100),
							'gender' => [
								'type' => 'f'
							],
							'asian' => (rand(1,100) / 100),
							'black' => (rand(1,100) / 100),
							'hispanic' => (rand(1,100) / 100),
							'white' => (rand(1,100) / 100),
							'other' => (rand(1,100) / 100),
						]
					]
				]
			]
		];

		return [
			'original_url' => $original_url,
			'json_data' => $test_data
		];
	}
}

// test take data:
if (!empty($_GET['test_fake_data']) && $_GET['test_fake_data'] == date('Ymd')) {
	// init
	$original_url = 'http://media.kairos.com/kairos-elizabeth2.jpg';
	$json_str = '{"images":[{"status":"Complete","width":500,"height":500,"file":"content_58c0ae2ddd94d","faces":[{"topLeftX":98,"topLeftY":162,"chinTipX":190,"rightEyeCenterX":154,"yaw":15,"chinTipY":382,"confidence":0.99993,"height":204,"rightEyeCenterY":204,"width":204,"leftEyeCenterY":210,"leftEyeCenterX":250,"pitch":-2,"attributes":{"lips":"Apart","asian":0.00155,"gender":{"type":"F"},"age":25,"hispanic":0.02732,"other":0.00253,"black":0.9400,"white":0.0056,"glasses":"None"},"face_id":1,"quality":0.08614,"roll":4}]}]}';

	$json_data = json_decode($json_str, true);

	if (!empty($_GET['test_random'])) {
		$fake_data = DiversityRecognition::getFakeData();
		$original_url = $fake_data['original_url'];
		$json_data = $fake_data['json_data'];
	}

	try {
		$Diversity = new DiversityRecognition([
			'debug' => true
		]);
		$processed = $Diversity->processEverything($json_data, $original_url);

		header('Content-Type: image/png');
		print file_get_contents($processed['new_file']);

		$Diversity->recursiveRemoveDirectory($processed['face_dir']);
	} catch (Exception $e) {
		print 'Error: '.$e->getMessage();
		exit;
	}
}
