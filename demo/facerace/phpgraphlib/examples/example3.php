<?php
include('../phpgraphlib.php');
$graph = new PHPGraphLib(350,280);
$data = array("Roger" => 145, "Ralph" => 102, "Rhonda" => 123, 
	"Ronaldo" => 137, "Rosario" => 149, "Robin" => 99, 
	"Robert" => 88, "Rustof" => 111);
$graph->setBackgroundColor("black");
$graph->addData($data);
$graph->setBarColor('255, 255, 204');
$graph->setTitle('IQ Scores');
$graph->setTitleColor('yellow');
$graph->setupYAxis(12, 'yellow');
$graph->setupXAxis(20, 'yellow');
$graph->setGrid(false);
$graph->setGradient('silver', 'gray');
$graph->setBarOutlineColor('white');
$graph->setTextColor('white');
$graph->setDataPoints(true);
$graph->setDataPointColor('yellow');
$graph->setLine(true);
$graph->setLineColor('yellow');
$graph->createGraph();
