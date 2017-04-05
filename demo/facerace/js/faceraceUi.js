//------------------------------------
// faceraceUi.js
// a collection of javascript functions to enable user interactions
// dependencies: jquery.js
// created: March 2017
// last modified: April 2017 Steve Rucker
// author: Josue Rodriguez
//------------------------------------

$("#upload").change(function(){
	  $("#kairos_social_plugin_fb").empty();
    $('#kairos_social_plugin_twitter').empty();
    $('#diversity_image').hide();
    $('#waiting').show();
    faceraceDemoApp.resetElements();
    $('#mediaUploadForm').submit();
});

$("#diversity_image").click(function(){
  $("#upload").click();
});

$( window ).resize(function() {
  faceraceDemoApp.setElementDimensions();
});

function addUrlToText(url, text) {
	var url_encoded = encodeURIComponent(url);
	return (text || '').replace('__URL__',url).replace('__URL_ENCODED__',url_encoded);	
}

function generateFacebookShare(url) {
	var html_parsed = addUrlToText(url, $('#fb_template_text').text());
	$("#kairos_social_plugin_fb").empty().html(html_parsed);
}

function generateDetailedFacebookShare(url) {
  var html_parsed = addUrlToText(url, $('#fb_button').text());
  $("#kairos_social_plugin_fb").empty().html(html_parsed);
}

function getSha(url) {
  var sha = (url || '').match(/(.*\/facerace\/.*\/|sha=)([a-z0-9]{40})/);
  var sha = sha && sha[2] || '';
  return sha;
}

function generateTwitterShare(url) {
  var demo_url = 'https://'+(window.__e=='prod'?'':window.__e.replace('stage','staging')+'.')+'kairos.com/twitter_card.php?via=twitter&i=' + getSha(url); // via Higgs

  $('#kairos_social_plugin_twitter').empty();

  twttr.widgets.createShareButton(
    demo_url,
    document.getElementById('kairos_social_plugin_twitter'),
    {
      size: 'large',
      text: '@LoveKairos celebrates diversity by using face recognition - Try it kairos.com/you #DiversityRecognition'
    }
  );
}

function openFBShareDialog(url) {
  FB.ui({
    method: 'feed',
    picture: url,
    link: 'https://kairos.com/diversity-recognition',
    description: 'Kairos celebrates diversity by using face recognition - Try it kairos.com/you',
  });
}

function displaySocialPlugins(image) {
  var url = $(image).attr('src') || '';
  if (window.__enable_share_if_loads == 1 && url != '') {
      setTimeout(function(){
        generateDetailedFacebookShare(url);
        generateTwitterShare(url);
      }, 1000);
  }
}

function updateUrlWithSha(url) {
  var sha = getSha(url);
  if (sha != '') {
    window.history.pushState({}, document.title, "/facerace/?i=" + sha);
  }
}

function displayPreviewImage(url) {
  var image = $('<img>',{
    'src': url
  });

  $("#diversity_image").html(image);

  $("#diversity_image img").one("load", function(e){
      displaySocialPlugins(this);
  }).each(function() {
    if(this.complete) $(this).load();
  });
}

$(document).on("click", "#fb_share_button[rel]", function(){
	openFBShareDialog( $(this).attr('rel') );
	return false;
});