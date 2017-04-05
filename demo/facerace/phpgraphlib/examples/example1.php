<?php
include('../phpgraphlib.php');
$graph = new PHPGraphLib(500, 350);
$data = array(12124, 5535, 43373, 22223, 90432, 23332, 15544, 24523, 32778, 
	38878, 28787, 33243, 34832, 32302);
$graph->addData($data);
$graph->setTitle('Widgets Produced');
$graph->setGradient('red', 'maroon');
$graph->createGraph();
