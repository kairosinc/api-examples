<?php
$configs = include('../config.php');

define('DEMO_ENV', (getenv('STAGE') ? getenv('STAGE') : 'dev'));
define('DEMO_PREVIEW_IMAGE', (getenv('DEMO_PREVIEW_IMAGE') ? getenv('DEMO_PREVIEW_IMAGE') : ""));
define('CACHE_BREAKER', (DEMO_ENV == 'dev' ? time() : date('ymd')));

function getDiversityImageUrl($default_image_url = null)
{
    $find_sha_regex = '@[a-z0-9]{40}@';
    $get_query_sha = (!empty($_GET['i']) && preg_match($find_sha_regex,$_GET['i']) ? (string) $_GET['i']: null);
    $get_cookie_sha = null; //(!empty($_COOKIE['sha']) &&  preg_match($find_sha_regex,$_COOKIE['sha']) ? (string) $_COOKIE['sha'] : null);
    $get_saved_sha = (!empty($get_cookie_sha) ? $get_cookie_sha : $get_query_sha);

    // demo image
    if (!empty($get_saved_sha)) {
        $enable_share_if_loads = 1;
        $demo_image_url = "https://media.kairos.com/demo/facerace/".DEMO_ENV."/".$get_saved_sha.".png";
    }
    else {
        $enable_share_if_loads = 0;
        $demo_image_url = $default_image_url;
    }

    if (!empty($_GET['via']) && strtolower($_GET['via']) == 'twitter') {
        $env_host = 'demo' . (DEMO_ENV == 'prod' ? '' : '-'.DEMO_ENV);
        $demo_image_url = "https://".$env_host.".kairos.com/facerace/resize.php?via=twitter&sha=".$get_saved_sha;
    }

    return [
        'enable_share_if_loads' => $enable_share_if_loads,
        'demo_image_url' => $demo_image_url
    ];
}

$image = getDiversityImageUrl(DEMO_PREVIEW_IMAGE);

?>
<html>
<html lang="en">

<head>
    <title>Kairos Facerace Demo</title>   
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta property="og:locale" content="en_GB" />
    <meta property="og:title" content="Human Analytics, Emotion Analysis & Face Recognition | Kairos" />
    <meta property="og:description" content="Kairos is a Human Analytics platform. Our face analysis algorithms recognize & understand how people feel in video, photos & the real-world." />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://www.kairos.com/" />
    <meta property="og:site_name" content="Kairos" />

    <link href="../images/favicon.ico" rel="shortcut icon" type="image/vnd.microsoft.icon" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
    <link rel="stylesheet" href="../css/fonts.css">
    <link rel="stylesheet" href="../css/main.css">
    <link rel="stylesheet" href="css/facerace.css?_t=<?php echo CACHE_BREAKER; ?>">
    <link rel="stylesheet" href="css/facerace-mediaqueries.css?_t=<?php echo CACHE_BREAKER; ?>">

</head>
<body>

<div id="fb-root"></div>
<script>
window.__enable_share_if_loads = <?php echo $image['enable_share_if_loads']; ?>;
window.__e = '<?php echo DEMO_ENV; ?>';
window.fbAsyncInit = function() {
    FB.init({
      appId      : '',
      xfbml      : true,
      version    : 'v2.8'
    });
    FB.AppEvents.logPageView();
};

(function(d, s, id){
 var js, fjs = d.getElementsByTagName(s)[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement(s); js.id = id;
 js.src = "//connect.facebook.net/en_US/sdk.js";
 fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
</script>

<script>
window.twttr = (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0],
    t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);

  t._e = [];
  t.ready = function(f) {
    t._e.push(f);
  };

  return t;
}(document, "script", "twitter-wjs"));</script>

    <div class="main-container container">
        <div class="row" id="waiting">
            <div class="image-container-template"></div>
        </div>

        <div class="row ui-buttons">

            <div class="col-md-12" id="diversity_image"></div>

            <div class="upload col-md-12">
                <form method="post" enctype="multipart/form-data" id="mediaUploadForm"> 
                    <div class="upload-button btn btn-kairos">
                        <span id="upload_text">TRY MY PHOTO</span>
                        <input type="file" id="upload" name="upload">
                    </div>
                </form>
                <div id="uploadError"></div>
            </div>
        </div>

        <!-- social plugins -->
        <div id="social_plugins">
            <span id="kairos_social_plugin_twitter"></span>
            <span id="kairos_social_plugin_fb"></span>
        </div>
    </div>  

    <script id="image-container-template" type="text/x-handlebars-template">
        <div class="spinner-message-container">
            {{#if spinner}}
              <div class="processing-spinner"></div>
            {{/if}}i 
            {{#if sadFace}}
              <div class="sad-face"></div>
            {{/if}}
            <div class="message-container strong">{{message1}}</div>
            <div class="message-container">{{message2}}</div>
        </div>
    </script>
           

    <!-- hosted libraries -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js"></script>

    <!-- custom libraries -->
    <script src="js/faceraceDemoApp.js?_t=<?php echo CACHE_BREAKER; ?>"></script>
    <script src="js/faceraceUi.js?_t=<?php echo CACHE_BREAKER; ?>"></script>
    <script src="../js/exif.js"></script>
    <script src="../js/utils.js"></script>
    
    <!-- initialize custom libraries if API credentials are valid -->
    <?php
        if (
            (defined("APP_ID") && APP_ID != "") &&
            (defined("APP_KEY") && APP_KEY != "") &&
            (defined("API_URL") && API_URL != "")
        ) {
    ?>
        <script>
            faceraceDemoApp.init({
                "uploadFileSizeImage":<?php echo $configs["uploadFileSizeImage"] ?>,
                "uploadFileTypesImage":<?php echo $configs["uploadFileTypesImage"] ?>,
                "apiCredentials":true
            });
        </script>
    <?php
        }
        else {
    ?>
        <script>
            faceraceDemoApp.init({
                "apiCredentials":false
            });
        </script>
    <?php  
        }
    ?>

<script type="template_text" id="fb_button">
<img id="fb_share_button" src="fb_button.png" rel="__URL__">
</script>

<script type="template_text" id="twitter_template_text">
<a class="twitter-share-button"
  href="https://twitter.com/share"
  data-size="large"
  data-text="custom share text"
  data-url="__URL__"
  data-hashtags="DiversityRecognition"
  data-via="LoveKairos"
  data-related="LoveKairos">
Tweet
</a>
</script>


<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@LoveKairos">
<meta name="twitter:creator" content="@LoveKairos">
<meta name="twitter:title" content="Kairos celebrates diversity by using face recognition">
<meta name="twitter:description" content="@LoveKairos celebrates diversity by using face recognition - Try it kairos.com/you #DiversityRecognition">
<meta name="twitter:image" content="<?php echo $image['demo_image_url']; ?>">

<script>
displayPreviewImage("<?php echo $image['demo_image_url']; ?>");
</script>

</body>
</html>
