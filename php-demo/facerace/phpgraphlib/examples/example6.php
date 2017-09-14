<?php
include('../phpgraphlib.php');
$graph = new PHPGraphLib(450,300);
$data = array("Jan" => -10.1, "Feb" => -3.6, "Mar" => 11.0, "Apr" => 30.7, 
	"May" => 48.6, "Jun" => 59.8, "Jul" => 62.5, "Aug" => 56.8, "Sep" => 45.5, 
	"Oct" => 25.1, "Nov" => 2.7, "Dec" => -6.5);
$graph->addData($data);
$graph->setBarColor('navy');
$graph->setupXAxis(20, 'blue');
$graph->setTitle('Average Temperature by Month, in Fairbanks Alaska');
$graph->setTitleColor('blue');
$graph->setGridColor('153,204,255');
$graph->setDataValues(true);
$graph->setDataValueColor('navy');
$graph->setDataFormat('degrees');
$graph->setGoalLine('32');
$graph->setGoalLineColor('red');
$graph->createGraph();
