<?php
/*

PHPGraphLib Graphing Library

The first version PHPGraphLib was written in 2007 by Elliott Brueggeman to
deliver PHP generated graphs quickly and easily. It has grown in both features
and maturity since its inception, but remains PHP 4.04+ compatible. Originally
available only for paid commerial use, PHPGraphLib was open-sourced in 2013 
under the MIT License. Please visit http://www.ebrueggeman.com/phpgraphlib 
for more information.

---

The MIT License (MIT)

Copyright (c) 2013 Elliott Brueggeman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
class PHPGraphLibStacked extends PHPGraphLib {
	function PHPGraphLibStacked($width = '', $height = '', $output_file = NULL) {
		PHPGraphLib::PHPGraphLib($width, $height, $output_file);	
	}
	function generateBars() {
		$this->finalizeColors();
		$barCount = 0;
		$adjustment = 0;
		$last_y1 = array();
		$last_y2 = array();
		if ($this->bool_user_data_range && $this->data_min >= 0) {
			$adjustment = $this->data_min * $this->unit_scale;
		}
		$this->data_array = array_reverse($this->data_array);
		foreach ($this->data_array as $data_set_num => $data_set) {
			$lineX2 = NULL;
			$xStart = $this->y_axis_x1 + ($this->space_width / 2);
			foreach ($data_set as $key => $item) {
				$hideBarOutline = false;
				$x1 = round($xStart);
				$x2 = round($xStart + $this->bar_width);
				if ($data_set_num > 0) {
					//find last set valid value for this dataset incase prior values were not set
					$found = false;
					$i = 1;
					//default last to base in case none are found
					$last = $this->x_axis_y1;
					while ($found == false && ($data_set_num - $i) >= 0) {
						if (isset($last_y1[$data_set_num - $i][$key])) {
							$last = $last_y1[$data_set_num - $i][$key];
							$found = true;
						}
						$i++;
					}
					$y2 = round($last);
					$y1 = round(($y2 - ($item * $this->unit_scale) + $adjustment));
				}
				else {
					$y2 = round($this->x_axis_y1);
					$y1 = round((($this->x_axis_y1 - ($item * $this->unit_scale) + $adjustment)));
				}
				//if we are using a user specified data range, need to limit what's displayed
				if ($this->bool_user_data_range) {
					if ($item <= $this->data_range_min) {
						//don't display, we are out of our allowed display range!
						$y1 = $y2;
						$hideBarOutline = true;
					}
					else if ($item >= $this->data_range_max) {
						//display, but cut off display above range max
						$y1 = $this->x_axis_y1 - ($this->true_displayed_max_value * $this->unit_scale) + $adjustment;	
					}
				}
				//draw bar and outline if nonzero
				if ($this->bool_bars && $item != 0) {
					if ($this->bool_gradient) {
						$this->drawGradientBar($x1, $y1, $x2, $y2, $this->multi_gradient_colors_1[$data_set_num], $this->multi_gradient_colors_2[$data_set_num], $data_set_num);
					}
					else {
						imagefilledrectangle($this->image, $x1, $y1,$x2, $y2,  $this->multi_bar_colors[$data_set_num]);
					}
					//draw bar outline
					if ($this->bool_bar_outline && !$hideBarOutline) {
						imagerectangle($this->image,  $x1, $y1, $x2, $y2, $this->outline_color); 
					}
				}
				// display data values
				if ($this->bool_data_values) {
					$dataX = ($x1 + ($this->bar_width) / 2) - ((strlen($item) * $this->data_value_text_width) / 2);
					//value to be graphed is equal/over 0
					if ($item >= 0) {
						$dataY=$y1-$this->data_value_padding-$this->data_value_text_height;
					}
					else {
						//check for item values below user spec'd range
						if ($this->bool_user_data_range && $item <= $this->data_range_min) {
							$dataY = $y1 - $this->data_value_padding - $this->data_value_text_height;
						}
						else {
							$dataY = $y1 + $this->data_value_padding;
						}
					}
					//add currency sign, formatting etc
					if ($this->data_format_array) {
						$item = $this->applyDataFormats($item);
					}
					if ($this->data_currency) {
						$item = $this->applyDataCurrency($item);
					}
					//recenter data position if necessary
					$dataX -= ($this->data_additional_length * $this->data_value_text_width) / 2;
					imagestring($this->image, 2, $dataX, $dataY, $item,  $this->data_value_color);
				}
				//write x axis value 
				if ($this->bool_x_axis_values) {
					if ($data_set_num == $this->data_set_count - 1) {
						if ($this->bool_x_axis_values_vert) {
							if ($this->bool_all_negative) {
								//we must put values above 0 line
								$textVertPos = round($this->y_axis_y2 - $this->axis_value_padding);
							}
							else {
								//mix of both pos and neg numbers
								//write value y axis bottom value (will be under bottom of grid even if x axis is floating due to
								$textVertPos = round($this->y_axis_y1 + (strlen($key) * $this->text_width) + $this->axis_value_padding);
							}
							$textHorizPos = round($xStart + ($this->bar_width / 2) - ($this->text_height / 2));
							imagestringup($this->image, 2, $textHorizPos, $textVertPos, $key,  $this->x_axis_text_color);
						}
						else {
							if ($this->bool_all_negative) {
								//we must put values above 0 line
								$textVertPos = round($this->y_axis_y2 - $this->text_height - $this->axis_value_padding);
							}
							else {
								//mix of both pos and neg numbers
								//write value y axis bottom value (will be under bottom of grid even if x axis is floating
								$textVertPos=round($this->y_axis_y1 + ($this->text_height * 2 / 3)-$this->axis_value_padding);
							}
							//horizontal data keys
							$textHorizPos = round($xStart + ($this->bar_width / 2) - ((strlen($key) * $this->text_width) / 2));
							imagestring($this->image, 2, $textHorizPos, $textVertPos, $key,  $this->x_axis_text_color);
						}
					}
				}
				$xStart += $this->bar_width + $this->space_width;
				$last_y1[$data_set_num][$key] = $y1;
			}
		}
	}
	function addData($data, $data2 = '', $data3 = '', $data4 = '', $data5 = '') {
		if (is_array($data)){ $this->data_array[]=$data; }
		if (is_array($data2)){ $this->data_array[]=$data2; }
		if (is_array($data3)){ $this->data_array[]=$data3; }
		if (is_array($data4)){ $this->data_array[]=$data4; }
		if (is_array($data5)){ $this->data_array[]=$data5; }
		//assess data
		$min = $this->data_max_allowable;
		$max = $this->data_min_allowable;
		$this->data_count=0;
		$key_max = array();
		//loop through each row, adding values to keyed arrays to find combined max
		foreach ($this->data_array as $data_set_num => $data_set) {
			foreach ($data_set as $key => $item) {
				if (!is_numeric($item)) {
					unset($this->data_array[$data_set_num][$key]);
				}
				else {
					$key_max[$key] = isset($key_max[$key]) ? $key_max[$key] + $item : $item;
					if($key_max[$key] < $min){ $min = $key_max[$key]; }
					if($key_max[$key] > $max){ $max = $key_max[$key]; }
				}
			}
			//find the count of the dataset with the most data points
			$count = count($this->data_array[$data_set_num]);
			$count > $this->data_count ? $this->data_count = $count : NULL; 
		}
		//number of valid data sets
		$this->data_set_count = count($this->data_array);
		if ($this->data_set_count == 0) {
			$this->error[] = "No valid datasets added in adddata() function.";
		}
		else {
			$this->calcMinMax($min, $max);
		}
	}
	function setLine($bool) { $this->error[] = __function__ . '() function not allowed in PHPGraphLib Stacked extension.'; }
	function setDataPointSize($bool) { $this->error[] = __function__ . '() function not allowed in PHPGraphLib Stacked extension.'; }
	function setDataPoints($bool) { $this->error[] = __function__ . '() function not allowed in PHPGraphLib Stacked extension.'; }
	function setDataValues($bool) { $this->error[] = __function__ . '() function not allowed in PHPGraphLib Stacked extension.'; }
}
?>