<?php

require __DIR__ . '/vendor/autoload.php';
use RapidApi\RapidApiConnect;

// setup Kairos and RapidApi credentials:
define('KAIROS_APP_ID', 'xxxxxxxxxxxxxxxxx');
define('KAIROS_APP_KEY', 'xxxxxxxxxxxxxxxxx');

define('RAPIDAPI_API', 'KairosAPI');
define('RAPIDAPI_APP_ID', 'kairosapi');
define('RAPIDAPI_APP_KEY', 'xxxxxxxxxxxxxxxxx');

// other params
define('GALLERY_NAME', 'model-photography');

// connect to RapidApi
$rapid = new RapidApiConnect(RAPIDAPI_APP_ID, RAPIDAPI_APP_KEY);

print "\n===== Detect face from image url, and extract features:\n";

// check if faces detected in a given image.
$image_url = 'https://media.kairos.com/kairos-elizabeth.jpg';

$result = $rapid->call(RAPIDAPI_API, 'detectFaces', [ 
	'appId' => KAIROS_APP_ID,
	'appKey' => KAIROS_APP_KEY,
	'image' => $image_url
]);

if (!empty($result['success']['images'][0]['faces'][0])) {
	$image = $result['success']['images'][0];
	$face_attr = $image['faces'][0]['attributes'];
	$gender = ($face_attr['gender']['type'] == 'F' ? 'female' : 'male');

	// get enthinicites
	$ethnicities = ['asian', 'hispanic', 'black', 'white', 'other'];
	$eth_arr = [];
	foreach ($ethnicities as $from) {
		$eth_arr[] = round($face_attr[$from] * 100).'% '.ucwords($from);
	}
	sort($eth_arr, SORT_NATURAL);
	$eth_str = implode(', ', array_reverse($eth_arr));

	print sprintf("- Image URL: %s\n", $image_url);
	print sprintf("- Detected as '%s' with %s years of age.\n", $gender, $face_attr['age']);
	print sprintf("- Ethnicity matching: %s\n", $eth_str);
}

print "\n===== Enroll Images:\n";

// enroll several images with faces using the Kairos API:
$enrolled[] = $rapid->call(RAPIDAPI_API, 'addFacesToGallery', [ 
	'appId' => KAIROS_APP_ID,
	'appKey' => KAIROS_APP_KEY,
	'image' => 'https://media.kairos.com/test1.jpg',
	'subjectId' => 'elizabeth',
	'galleryName' => GALLERY_NAME
]);

$enrolled[] = $rapid->call(RAPIDAPI_API, 'addFacesToGallery', [ 
	'appId' => KAIROS_APP_ID,
	'appKey' => KAIROS_APP_KEY,
	'image' => 'https://media.kairos.com/sample/woman-1.jpg',
	'subjectId' => 'becky',
	'galleryName' => GALLERY_NAME
]);

$enrolled[] = $rapid->call(RAPIDAPI_API, 'addFacesToGallery', [ 
	'appId' => KAIROS_APP_ID,
	'appKey' => KAIROS_APP_KEY,
	'image' => 'https://media.kairos.com/sample/woman-3.jpg',
	'subjectId' => 'kathy',
	'galleryName' => GALLERY_NAME
]);

$enrolled[] = $rapid->call(RAPIDAPI_API, 'addFacesToGallery', [ 
	'appId' => KAIROS_APP_ID,
	'appKey' => KAIROS_APP_KEY,
	'image' => 'https://media.kairos.com/test2.jpg',
	'subjectId' => 'elizabeth-2',
	'galleryName' => GALLERY_NAME
]);

$enrolled[] = $rapid->call(RAPIDAPI_API, 'addFacesToGallery', [ 
	'appId' => KAIROS_APP_ID,
	'appKey' => KAIROS_APP_KEY,
	'image' => 'https://media.kairos.com/test3.jpg',
	'subjectId' => 'elizabeth-3',
	'galleryName' => GALLERY_NAME
]);

// iterate thru each result for enrollments
foreach ($enrolled as $image) {
	if (!empty($image['success']['images'][0]['transaction']['status']) && 
		$image['success']['images'][0]['transaction']['status'] == 'success')
	{
		print sprintf("- Enrolled '%s' into gallery '%s'\n", 
			$image['success']['images'][0]['transaction']['subject_id'], 
			$image['success']['images'][0]['transaction']['gallery_name']
		); 
	}
}

print "\n===== Verify Image:\n";

// verify if an image matches a specific person in an existing gallery you enrolled before.
$result = $rapid->call(RAPIDAPI_API, 'compareFaces', [ 
	'appId' => KAIROS_APP_ID,
	'appKey' => KAIROS_APP_KEY,
	'image' => 'https://media.kairos.com/test2.jpg',
	'subjectId' => 'elizabeth',
	'galleryName' => GALLERY_NAME
]);

// check if model was found in gallery
if (!empty($result['success']['images'][0]['transaction']['status'])) {
	print sprintf("- Successfully verified model '%s' was found in gallery '%s' \n", 'elizabeth', GALLERY_NAME);
}
else {
	print sprintf("- Error: Unable to verify '%s' was found in gallery '%s' \n", 'elizabeth', GALLERY_NAME);
}

print "\n===== Recognize Image In Existing Gallery:\n";

// check if an image is recognized in an existing gallery you enrolled before.
$result = $rapid->call(RAPIDAPI_API, 'recognizeFaces', [ 
	'appId' => KAIROS_APP_ID,
	'appKey' => KAIROS_APP_KEY,
	'image' => 'https://media.kairos.com/test2.jpg',
	'galleryName' => GALLERY_NAME
]);

if (!empty($result['success']['images'][0]['candidates'])) {
	$candidates = $result['success']['images'][0]['candidates'];

	print sprintf("----> %s models recognized in gallery '%s':\n", count($candidates), GALLERY_NAME);

	foreach ($result['success']['images'][0]['candidates'] as $candidate) {
		print sprintf("..... Matched '%s' with %s%% confidence\n", $candidate['subject_id'], round($candidate['confidence'] * 100));
	}
}
else {
	print sprintf("--- Error: Unable to recognize any models in gallery '%s' \n", GALLERY_NAME);
}

print "\n===== List Galleries:\n";

$result = $rapid->call(RAPIDAPI_API, 'getGalleries', [ 
	'appId' => KAIROS_APP_ID,
	'appKey' => KAIROS_APP_KEY,
]);

if (!empty($result['success']['gallery_ids'])) {
	print "---- Galleries found:\n";

	foreach ($result['success']['gallery_ids'] as $gallery) {
		print sprintf("----> %s\n", $gallery);
	}
}
else {
	print "- Error: No galleries exist.\n";
}

print "\n===== Remove Gallery:\n";

$result = $rapid->call(RAPIDAPI_API, 'deleteSingleGallery', [ 
	'appId' => KAIROS_APP_ID,
	'appKey' => KAIROS_APP_KEY,
	'galleryName' => GALLERY_NAME
]);

if (!empty($result['success']['status']) && $result['success']['status'] == 'Complete') {
	print sprintf("- Successfully removed gallery '%s' \n", GALLERY_NAME);
}
else {
	print sprintf("- Error: Unable to remove gallery '%s' \n", GALLERY_NAME);
}

print PHP_EOL;
