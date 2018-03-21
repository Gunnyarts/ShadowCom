<?php

$rand = rand(1, 5);

$file = $rand.'.jpg';
$type = 'image/jpeg';
header('Content-Type:'.$type);
header('Content-Length: ' . filesize($file));
readfile($file);

?>