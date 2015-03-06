// JavaScript Document
var startApp = true;
var refreshCache = false;



$(document).ready(function () {


		var startHour = new Date().getHours();
		var startMinutes = new Date().getMinutes();
		var startTime = new Array(startHour,startMinutes);
		var totalStart = startHour * 60 + startMinutes;

	if(localStorageAvailable)
	{
		localStorage.removeItem("chosenLoc");

		if(localStorage.getItem("startTime") === null)
		{
			refreshCache = false;
			localStorage.setItem("startTime", startTime);
			
		}
		
		else if(totalStart - ((localStorage.getItem("startTime")[0]*60) +localStorage.getItem("startTime")[1] < 60))
		{
			refreshCache = false;
		
		}
		else
		{
			var startHour = new Date().getHours();
			var startMinutes = new Date().getMinutes();
			var startTime = new Array(startHour,startMinutes);
			clearLocalStorage();
			localStorage.setItem("startTime", startTime);
			refreshCache = true;
			
		}
	}

	$("#adjustLoc").on('click', function()
	{

				$(this).addClass('clicked');
				var loc = $("#weatherLoc").val();
				if(localStorageAvailable)
				{
					localStorage.setItem('chosenLoc',loc);
				}
				var currentLoc = null;
				var lookUpCoordinatesURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + loc + "&sensor=true&key=AIzaSyDUIM8sdw7oiw5UlzVPHOm84Xmaue3rl4g";
				

				var request = $.ajax({
									  url: lookUpCoordinatesURL,
									  type: "GET",
									  
									  dataType: "json"
									});


				request.done(function(msg) {

						console.log(msg);
						currentLat = msg.results[0].geometry.location.lat;
						currentLon = msg.results[0].geometry.location.lng;
						

						var locWeather = Array();
						locWeather.push(currentLat,currentLon );

						var newUrl = "https://api.forecast.io/forecast/54317a33b94f022482a2bc22463cc986/" + currentLat + "," + currentLon + "?callback=?&units=si";
						locWeather.push(newUrl);
						getApiData(locWeather);
				});

				request.fail(function(jqXHR, textStatus) {
					   console.log("Request failed: " + textStatus );
					   console.log("Request exceeded");
				});	

	});



		if($('#adjustLoc').hasClass('clicked') == false)
		 {
		       requestCurrentPosition();
		 }



});
function requestCurrentPosition() 
{ 
	if (navigator.geolocation) 
	{ 
		navigator.geolocation.getCurrentPosition(useGeoData);
	} 
	else
	{
		console.log("Geolocation is not supported by this browser.");
	} 
}


function useGeoData(position) 
{ 
	var longitude = position.coords.longitude; 
	var latitude = position.coords.latitude; 


	var locData = new Array();
	locData.push(latitude, longitude);


	var apiUrl = "https://api.forecast.io/forecast/54317a33b94f022482a2bc22463cc986/" + latitude + "," + longitude + "?callback=?&units=si";
	locData.push(apiUrl);
	getApiData(locData);

}


function fillInFields(weatherInfo, address)
{
	if(localStorage.getItem('chosenLoc') != null)
	{
		var today = new WeatherToday(weatherInfo, localStorage.getItem('chosenLoc'));
	}
	else
	{
		var today = new WeatherToday(weatherInfo, address);
	}

	$("#currentLocation").html(capitaliseFirstLetter(today.location));
	$("#currentDate").html(today.date);
	$("#currentTemp").html(today.currentTemp);
	$("#currentDesc").html(today.summary);
	$("#currentDesc").html(today.currentDesc);


	WeatherTomorrow.prototype = new WeatherToday(weatherInfo, address);
	var tomorrow = new WeatherTomorrow(today.tomorrow);

	$("#tomorrowLocation").html(capitaliseFirstLetter(today.location));
	$("#tomorrowDate").html(tomorrow.date);
	$("#tomorrowTemp").html(tomorrow.currentTemp);
	$("#tomorrowDesc").html(tomorrow.summary);

}
var WeatherToday = function(information,location)
{

	this.location = location;
	var convertedDayDate = convertWeatherDate(information.currently.time);
	this.date = convertedDayDate;
	this.currentTemp = Math.round(information.currently.apparentTemperature) + ' Graden';
	this.currentDesc = information.currently.summary;
	this.tomorrow = information.daily.data[1];


}


var WeatherTomorrow = function(tomorrowInfo)
{

	this.date = convertWeatherDate(tomorrowInfo.time);
	this.currentTemp = Math.round(tomorrowInfo.apparentTemperatureMax) + ' Graden';
	this.currentDesc = tomorrowInfo.summary;
	this.summary = tomorrowInfo.summary;
	this.windspeed = tomorrowInfo.windSpeed;
	this.humidity = tomorrowInfo.humidity;
}






function localStorageAvailable()
{
	var LSsupport = !(typeof window.localStorage == 'undefined');
	var result  = false;

	if (LSsupport) {
		console.log( "localStorage is available" );
		result = true;
	}

	return result;
}

function clearLocalStorage()
{
	localStorage.clear();
}


function getApiData(locData)
{

		var longitude = locData[1];
		var latitude = locData[0];
		var apiUrl = locData[2];
		console.log(locData[1]);

// CHECK OF DE LOCALSTORAGE GESUPPORTEERD IS OF DAT DE LOCALSTORAGE LEEG/NOG NIET GESET IS
// DAN HET WEER OPHALEN VIA DE API
// ANDERS UIT DE LOCALSTORAGE HALEN
// HIERBIJ NOG EEN TIMER PLAATSEN VAN NA HOELANG HET WEER OPNIEUW OPGEHAALD MOET WORDEN, MET COURANTERE DATA !!!!!!!!!!
	if(!localStorageAvailable() || $('#adjustLoc').hasClass('clicked') || (localStorage.getItem('weatherObj') === null || startApp == true )
		/*|| localStorage.getItem('startHour')*/)
	{
		var request = $.ajax({
							  url: apiUrl,
							  type: "GET",
							  /*data: {latitude : latitude, longitude :longitude}, */
							  dataType: "jsonp",
							  jsonpCallback:"weather"
							});


		request.done(function(msg) {
			if(localStorageAvailable)
			{
				localStorage.setItem('weatherObj',JSON.stringify(msg));
				console.log(msg);
				// HIER EEN KEY IN LOCALSTORAGE ZETTEN WNR HET EERST IN LOCALSTORAGE GEZET WERD, DAN LATER CHECKEN OF ER
				// EEN UUR VOORBIJ GING EN DAN TERUG IN DEZE LUS GAAN ANDERS IN DE ELSE
				console.log();
			}
			else
			{
				console.log(msg);
			}

			var geocoder = new google.maps.Geocoder();
			//console.log(JSON.parse(localStorage.getItem('weatherObj')));
		 	var latlng = new google.maps.LatLng(latitude, longitude);
		  	geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) 
			{
			  if (results[1]) 
			  {
				startApp = false;
				if(localStorageAvailable && localStorage.getItem('chosenLoc') != null)
				{
					fillInFields(msg,localStorage.getItem('chosenLoc'));
				}
				else
				{
					fillInFields(msg,results[4].address_components[0].long_name);
				}


			  } 
			  else 
			  {
				alert('No known address found');
			  }
			} 
			else 
			{
			  alert('Could not fetch requested address');
			}
		  });
		});
	
	request.fail(function(jqXHR, textStatus) {
			   console.log("Request failed: " + textStatus );
			   console.log("Request exceeded");
		});	

	}
	// WNR LOCALSTORAGE WEL AVAILABLE IS, HET UIT DE LOCALSTORAGE HALEN
	// EN HET ADRES VAN DE COORDINATEN OPHALEN
	else
	{
		var geocoder = new google.maps.Geocoder();
		//console.log(JSON.parse(localStorage.getItem('weatherObj')));
		 var latlng = new google.maps.LatLng(latitude, longitude);
		  geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) 
			{
			  if (results[1]) 
			  {
				console.log(JSON.parse(localStorage.getItem('weatherObj')));
				if(localStorage.getItem('chosenLoc') != null)
				{
					fillInFields(JSON.parse(localStorage.getItem('weatherObj')),localStorage.getItem('chosenLoc'));
				}
				else
				{
					fillInFields(JSON.parse(localStorage.getItem('weatherObj')),results[4].address_components[0].long_name);
				}
				//fillInFields(JSON.parse(localStorage.getItem('weatherObj')),results[0].address_components[results[0].address_components.length-1].long_name);
				startApp = false;
			  } 
			  else 
			  {
				alert('No known address found');
			  }
			} 
			else 
			{
			  alert('Could not fetch requested address');
			}
		  });
	}
}


function convertWeatherDate(currentDate)
{
	var weekday=new Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
	var months = new Array("January","February","March","April","May","June","July","August","September","October","November","December");

	var now = new Date(currentDate *1000); 
	var convertedDt = weekday[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()]
	//console.log(convertedDt);
	return convertedDt;
}

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}
