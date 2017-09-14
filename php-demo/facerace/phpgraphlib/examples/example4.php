<?php
include('../phpgraphlib.php');
$graph = new PHPGraphLib(520,280);
$data = array("Alpha" => 1145, "Beta" => 1202, "Cappa" => 1523, 
	"Delta" => 1437, "Echo" => 949, "Falcon" => 999, "Gamma" => 1188);
$data2 = array("Alpha" => 898, "Beta" => 1498, "Cappa" => 1343, 
	"Delta" => 1345, "Echo" => 1045, "Falcon" => 1343, "Gamma" => 987);
$graph->addData($data, $data2);
$graph->setBarColor('blue', 'green');
$graph->setTitle('Company Production');
$graph->setupYAxis(12, 'blue');
$graph->setupXAxis(20);
$graph->setGrid(false);
$graph->setLegend(true);
$graph->setTitleLocation('left');
$graph->setTitleColor('blue');
$graph->setLegendOutlineColor('white');
$graph->setLegendTitle('Week-37', 'Week-38');
$graph->setXValuesHorizontal(true);
$graph->createGraph();
