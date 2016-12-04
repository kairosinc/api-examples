<?php

//------------------------------------
// purge.php
// calls remove-galleries.php which
// removes selected galleries from KairosId
// created: June 2016
// author: Steve Rucker
//------------------------------------

/*
 *---------------------------------------------------------------
 * GET ALL HEADERS
 *---------------------------------------------------------------
 *
 * Support for Apache's getallheaders() when running on Nginx / PHP-FPM.
 */
if (!function_exists('getallheaders'))
{
    function getallheaders()
    {
           $headers = '';
       foreach ($_SERVER as $name => $value)
       {
           if (substr($name, 0, 5) == 'HTTP_')
           {
               $headers[strtolower(substr($name, 5))] = $value;
           }
       }
       return $headers;
    }
}

require('remove-galleries.php');

?> 

