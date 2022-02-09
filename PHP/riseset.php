<?php

//store values passed with GET for request from JS
$longitude = $_GET['lng'];
$latitude = $_GET['lat'];
//$date = "today";

//Define the URL for rise and set times with json response
$request = 'https://api.sunrise-sunset.org/json?lat='.$latitude.'&lng='.$longitude;

//initialise the connection for the given URL
$connection = curl_init($request);

//configure the connection
curl_setopt($connection, CURLOPT_RETURNTRANSFER, true);

//make the request and get the response
$response = curl_exec($connection);

//close the connection
curl_close($connection);

//return the JSON resposne
echo $response;
?>
