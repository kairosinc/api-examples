<?php
include('../phpgraphlib.php');
$graph = new PHPGraphLib(500, 450);
$data = array("Jan" => -1324, "Feb" => -1200, "Mar" => -100, "Apr" => -1925, 
	"May" => -1444, "Jun" => -957, "Jul" => -364, "Aug" => -221, 
	"Sep" => -1300, "Oct" => -848, "Nov" => -719, "Dec" => -114);
$graph->addData($data);
$graph->setBarColor('255,255,204');
$graph->setTitle('Money Made at XYZ Corp');
$graph->setTextColor('gray');
$graph->createGraph();
