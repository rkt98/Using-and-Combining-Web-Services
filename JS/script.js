function initialize()
{
    createMap();
}

var mymap; //represents the map
var recent = []; //holds searchs locationObjects


//locaitonObject to store town that has been searched
function locationObject(location){

    var _location = location;
    var _longitude; //these are set after the object is created
    var _latitude;

    //getters for location, longitude and latitude
    this.getLng = function(){
        return _longitude;
    }
    this.getLat = function(){
        return _latitude;
    }
    this.getLoc = function(){
        return _location;
    }

    //setters for longiture and latitude
    this.setLng = function(lng){
        _longitude = lng;
    }
    this.setLat = function(lat){
        _latitude = lat;
    }

}

//requests the longitude and latitude for the searched location
function getLatLng(locationObject)
{
    geocodeKey = config.GeoCode;
    requestLocation = "http://www.mapquestapi.com/geocoding/v1/address";
    requestData = "?key="+geocodeKey+"&location="+locationObject.getLoc()+",NZ&outFormat=json"+"&intlMode=1BOX";
    url = requestLocation+requestData;
    fetch(url)
    .then(response => response.json())
    .then(json => geocodeResponse(json));

    let geocodeResponse = function(json){
        locationObject.setLat(json.results[0].locations[0].latLng.lat);
        locationObject.setLng(json.results[0].locations[0].latLng.lng);
        addToList(_locationObject);
        updateMap(_locationObject);
        getRiseSet(_locationObject);
        getWeather(_locationObject);
    }
}

//method called when search button is pressed
function searchTown()
{
    //get the searched location from the textbox input element on the webpage
    _location = document.getElementById("searchBar").value;
    //if the search isn't blank process it
    if(_location != "")
    {
        //check if the location has been searched
        _exists = checkList(_location);

        //if this is a location that hasnt been searched before create a location object and get its longitude and latitude
        //else update the map and information with the returned locationObject
        if(_exists[0] == false)
        {
            _locationObject = new locationObject(_location);
            getLatLng(_locationObject);
        }
        else
        {
            updateMap(_exists[1]);
            getRiseSet(_exists[1]);
            getWeather(_exists[1]);

        }
    }
}

//checks if location has been searched before
function checkList(location)
{
    //default values set to the location not being searched before
    var exists = false;
    locationobject = null;

    //check the recent searches array only if it contains searches if it doesnt return the default values
    if(recent.length != 0)
    {
        var i;
        //look through the recent searches to see if there is already a locationObject for the searched location
        for(i = 0; i < recent.length; i++)
        {
            if(recent[i].getLoc() == location)
            {
                //get the location object if it already exists and set exists bool to true
                locationObject = recent[i];
                exists = true;
            }
        }
    }
    //return two values a bool saying if the location has already been searched and a location object if it has.
    return [exists,locationObject];
}

//adds the recent search to the list on the webpage and to the array holding the location objects
function addToList(locationObject)
{
    //add the locationObject to the recent searches array
    var _locationObject = locationObject;
    recent.push(_locationObject);

    //get the element that holds the recent searches list
    var list = document.getElementById('list');

    //create the list object to display the recent search as a span element with the value set as the location searched
    var _listItem = document.createElement('span');
    _listItem.className = "listItem";
    _listItem.innerHTML = _locationObject.getLoc();
    _listItem.value = _locationObject.getLoc();
    //set the onclick event to call the listclicked function passing the list objects value as a parameter.
    _listItem.onclick = function(){listClicked(this.value);}

    //add the listobject element to the recent searches list to display it on the webpage
    list.appendChild(_listItem);
}

//called if list item is clicked
function listClicked(location)
{
    var i;
    //loop through the list of recent searches until the clicked search is found
    for(i = 0; i < recent.length; i++)
    {
        //when the locatoin clicked is found in the array
        if(location == recent[i].getLoc())
        {
            //pass the locationObject that matched the clicked location to
            //update the map, get the rise set and weather data and display the information
            updateMap(recent[i]);
            getRiseSet(recent[i]);
            getWeather(recent[i]);
        }
    }
}

//creates map starting with general view of new zealand
function createMap()
{
    //create map and set vew to new zealand with a zoom of 4.25
    mymap = L.map('mapid').setView([-40.9006,174.8860],4.25);

    //specify what tiles to use using the default from the example from mapboz
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token='+ config.MapBox, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: config.MapBox}).addTo(mymap);
}

//updates map with the selected location
function updateMap(locationObject)
{
	//change map coordinates and the zoom to be closer to the town/city
	mymap.setView([locationObject.getLat(),locationObject.getLng()],13);
}

//requests the riseset information converts it to nz time and displays it on the webpage
function getRiseSet(locationObject)
{
    //create the request url with the data needed to complete the request in php
    requestLocation = "../PHP/riseset.php";
    requestData = "?lat="+locationObject.getLat()+"&lng="+locationObject.getLng();
    url = requestLocation+requestData;

    //requests the riseset data with the url created above
    fetch(url)
    .then(response => response.json()) //gets the response as json
    .then(json => risesetResponse(json)); //passes the json data to the response function

    //function that converts the times to nz time and displays the riseset information
    let risesetResponse = function(json){

        //convert time from utc to NZT
        rise = json.results.sunrise;
        rise = rise.replace("PM","AM");
        set = json.results.sunset;
        set = set.replace("AM","PM");

        //adds the riseset information to the webpage
        element = document.getElementById("riseset");
        element.innerHTML = "Sun will rise at " + rise + " and the sun will set at " + set;
    }
}

//defines how we create ajax requests and how to handle the response
function ajaxRequest(url, method, data, callback)
{
    let request = new XMLHttpRequest();
    request.open(method, url, true);
    if(method == "POST")
    {
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }
    request.onreadystatechange = function(){
        if(request.readyState == 4){
            if(request.status == 200)
            {
                response = request.responseXML;
                callback(response);
            }
            else
            {
                handleError(request.statusText);
            }
        }
    };
    request.send(data);
}

//requests the weather information from the php
function getWeather(locationObject)
{
    //create request with the locationObects stored longitude and latitude and use updateWeather as the callback function
    url = "../PHP/weather.php?lat="+locationObject.getLat()+"&lng="+locationObject.getLng();
    ajaxRequest(url,"GET","", updateWeather);
}

//callback function handles the response from the weather request and displays it on the webpage
function updateWeather(response)
{
    //Everything in the root element from the response
    currentTag = response.getElementsByTagName('current');

    //gets the temperature element from the root element
    temperatureTag = currentTag[0].getElementsByTagName('temperature');
    //gets the min, max and current temp values from the attribure of the remperature tag
    minTemp = temperatureTag[0].getAttribute('min');
    maxTemp = temperatureTag[0].getAttribute('max');
    currentTemp = temperatureTag[0].getAttribute('value');

    //gets the weather element from the root element
    weatherTag = currentTag[0].getElementsByTagName('weather');
    currentWeather = weatherTag[0].getAttribute('value');

    //adds the weather information to the webpage
    element = document.getElementById("weather");
    element.innerHTML = "Current weather and temperature is "+currentWeather+" "+currentTemp+"\xB0C,  Outlook: min temperature = "+minTemp+"\xB0C max temperature = "+maxTemp+"\xB0C";
}
