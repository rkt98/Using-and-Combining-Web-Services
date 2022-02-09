<?php
//apiKey
include('config.php');

//store values passed with GET for request from JS
$longitude = $_GET['lng'];
$latitude = $_GET['lat'];

//Define the URL with request parameters
$request = "api.openweathermap.org/data/2.5/weather?lat=".$latitude."&lon=".$longitude."&units=metric&mode=xml&appid=".$OpenWeather;

//initialise the connection for the given URL
$connection = curl_init($request);

//configure the connection
curl_setopt($connection, CURLOPT_RETURNTRANSFER, true);

//make the request and get the response
$response = curl_exec($connection);

//create XML from xml string returned from curl request
$xml=simplexml_load_string($response)or die("Error: Cannot create object");
header('Content-type: text/xml');

//close the connection
curl_close($connection);

//return the xml response
echo $xml->asXML();
?>
