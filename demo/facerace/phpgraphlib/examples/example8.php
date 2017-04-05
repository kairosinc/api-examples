<?php
include('../phpgraphlib.php');
include('../phpgraphlib_pie.php');
$graph = new PHPGraphLibPie(400, 200);
$data = array("CBS" => 6.3, "NBC" => 4.5,"FOX" => 2.8, 
	"ABC" => 2.7, "CW" => 1.4);
$graph->addData($data);
$graph->setTitle('8/29/07 Top 5 TV Networks Market Share');
$graph->setLabelTextColor('50, 50, 50');
$graph->setLegendTextColor('50, 50, 50');
$graph->createGraph();
