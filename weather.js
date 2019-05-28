import './general';

//http://api.openweathermap.org/data/2.5/forecast?zip=97405&units=imperial&appid=c59493e7a8643f49446baf0d5ed9d646  
//https://maps.googleapis.com/maps/api/timezone/json?location=39.6034810,-119.6822510&timestamp=1331161200&key=AIzaSyC7QBEyXbpXf53jPvM4lXfgXEHD5caa61A

class Weather {

  constructor() {
    this.state = {
      timezoneOffset: -7, 
      zipcode: "",
      city: {},
      forecast: [],
      simpleForecast: [], 
      selectedDate: null
    };
    this.url = "http://api.openweathermap.org/data/2.5/forecast?zip=";
    this.apikey = "&units=imperial&appid=c59493e7a8643f49446baf0d5ed9d646";

    this.googleApiKey = "AIzaSyC1HTCZ6mUEKFuuLHPLdE1zM2_Q7j0vxhk";
    this.googleMapsUrl = "https://maps.googleapis.com/maps/api/timezone/json?location=";
    
    this.$form = document.querySelector('#zipForm');
    this.$zipcode = document.querySelector('#zipcode');
    this.$weatherList = document.querySelector('#weatherList');
    this.$currentDay = document.querySelector('#currentDay');

    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.$form.addEventListener("submit", this.onFormSubmit);

    this.parseForecast = this.parseForecast.bind(this);
    this.renderWeatherList = this.renderWeatherList.bind(this);
    this.renderWeatherListItem = this.renderWeatherListItem.bind(this);
    this.addItemClickHandlers = this.addItemClickHandlers.bind(this);
  }

  onFormSubmit(event) {
    event.preventDefault();
    this.state.zipcode = this.$zipcode.value;
    fetch(`${this.url}${this.state.zipcode}${this.apikey}`)
	    .then(response => response.json())
      .then(data => { 
        this.state.city = data.city;
        this.state.forecast = data.list;
        this.state.selectedDate = null;
        fetch(`${this.googleMapsUrl}
          ${this.state.city.coord.lat},${this.state.city.coord.lon}
          &timestamp=${this.state.forecast[0].dt}
          &key=${this.googleApiKey}`)
          .then(response => response.json())
          .then(data => {
            console.log(data);
            this.state.timezoneOffset =  (data.rawOffset + data.dstOffset) / (60 * 60);
            this.state.simpleForecast = this.parseForecast(this.state.forecast, this.state.timezoneOffset);
            this.$zipcode.value = "";        
            this.renderWeatherList(this.state.simpleForecast);
            this.clearCurrentDay();
            this.addItemClickHandlers();
          })
          .catch(googleError => {
            alert('There was a problem getting timezone info!')
          });
      })
      .catch(error => {
        alert('There was a problem getting info!'); 
      });
  }

  getIndexOfMidnight(firstDate, timezoneOffset) {
    let dt = firstDate * 1000;
    let date = new Date(dt);
    let utcHours = date.getUTCHours();
    let localHours = utcHours + timezoneOffset;
    let firstMidnightIndex = (localHours > 2 ) ? 
        Math.round((24 - localHours)/3) : 
        Math.abs(Math.round(localHours / 3));
    return firstMidnightIndex;
  }

  findMinTemp(forecast, indexOfMidnight) {
    let min = forecast[indexOfMidnight].main.temp_min;
    for (let i = indexOfMidnight + 1; i < indexOfMidnight + 8; i++)
      if (forecast[i].main.temp_min < min)
        min = forecast[i].main.temp_min;
    return min;
  }

  findMaxTemp(forecast, indexOfMidnight) {
    let max = forecast[indexOfMidnight].main.temp_max;
    for (let i = indexOfMidnight + 1; i < indexOfMidnight + 8; i++)
      if (forecast[i].main.temp_max > max)
        max = forecast[i].main.temp_max;
    return max;
  }

  parseForecast(forecast, timezoneOffset) {
    let simpleForecast = new Array();
    const MIDNIGHT = this.getIndexOfMidnight(forecast[0].dt, timezoneOffset);
    const NOON = 4;
    const SIXAM = 2;
    const SIXPM = 6;
    const NINEPM = 7;
    const MORNING = SIXAM;
    const DAY = NOON;
    const EVENING = SIXPM;
    const NIGHT = NINEPM;
    const PERDAY = 8;
    const DAYS = 4;
    for (let i = MIDNIGHT; i < forecast.length - NINEPM; i+=PERDAY) {
      let oneDay = new Object();
      oneDay.dt = forecast[i + NOON].dt;
      oneDay.temp = forecast[i + NOON].main.temp;
      oneDay.minTemp = this.findMinTemp(forecast, i);
      oneDay.maxTemp = this.findMaxTemp(forecast, i);
      oneDay.morningTemp = forecast[i + MORNING].main.temp;
      oneDay.dayTemp = forecast[i + DAY].main.temp;
      oneDay.eveningTemp = forecast[i + EVENING].main.temp;
      oneDay.nightTemp = forecast[i + NIGHT].main.temp;
      oneDay.description = forecast[i + NOON].weather[0].description;
      oneDay.icon = forecast[i + NOON].weather[0].icon;
      oneDay.pressure = forecast[i + NOON].main.pressure;
      oneDay.wind = forecast[i + NOON].wind.speed;
      oneDay.humidity = forecast[i + NOON].main.humidity;
      simpleForecast.push(oneDay);
    }
    return simpleForecast;
  }

  getWeekday(date) {
    const dayNames = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = date.getDay();
    return dayNames[weekday];
  }

  renderWeatherListItem(forecastDay, index) {
    const date = new Date(forecastDay.dt * 1000);
    const weekday = this.getWeekday(date);
    const city = this.state.city;
    return `
        <div class="weather-list-item" data-index="${index}">
            <h2>${date.getMonth() + 1} / ${date.getDate()}</h2>
            <h3>${weekday}</h3>
            <h3>${forecastDay.minTemp.toFixed(1)}&deg;F &#124; ${forecastDay.maxTemp.toFixed(1)}&deg;F</h3>
        </div>
    `;
  }

  renderWeatherList(forecast) {
    const itemsHTML = forecast.map((forecastDay, index) => this.renderWeatherListItem(forecastDay, index)).join('');
    this.$weatherList.innerHTML = 
      `<div class="weather-list flex-parent">
          ${itemsHTML}
      </div>`;
  }

  addItemClickHandlers() {
    const items = document.querySelectorAll('.weather-list-item');
    for (let i = 0; i < items.length; i++)
      items[i].onclick = this.renderCurrentDay.bind(this, i);
  }

  renderCurrentDay(index) {
    const city = this.state.city;
    const day = this.state.simpleForecast[index];
    const date = new Date(day.dt * 1000);
    const weekday = this.getWeekday(date);
    const dayHTML = `
      <div class="current-day">
        <h1 class="day-header">${weekday} in ${city.name}</h1>
        <div class="weather">
        <p>
            <img src='http://openweathermap.org/img/w/${day.icon}.png' alt='${day.description}'/>
            ${day.description}
        </p>
      </div>
      <div class="details flex-parent">
        <div class="temperature-breakdown">
          <p>Morning Temperature: ${day.morningTemp}&deg;F</p>
          <p>Day Temperature: ${day.dayTemp}&deg;F</p>
          <p>Evening Temperature: ${day.eveningTemp}&deg;F</p>
          <p>Night Temperature: ${day.nightTemp}&deg;F</p>
        </div>
        <div class="misc-details">
          <p>Atmospheric Pressure: ${day.pressure} hPa</p>
          <p>Humidity: ${day.humidity}%</p>
          <p>Wind Speed: ${day.wind} mph</p>
        </div>
      </div>
    </div>
    `;
    this.$currentDay.innerHTML = dayHTML;
  }

  clearCurrentDay() {
    this.$currentDay.innerHTML = "";
  }
}

window.addEventListener("load", () => new Weather());
/* Create a class called Weather
- Part 1 - Retrieve the weather information when the user clicks the button
  - Create the constructor
    - initialize instance variables for the "state" of the app and the ajax call
        this.state = {
          zipcode: "",
          city: {},
          forecast: [],
          selectedDate: null
        };
        this.url = "http://api.openweathermap.org/data/2.5/forecast?zip=";
        this.apikey = "&units=imperial&appid=c59493e7a8643f49446baf0d5ed9d646";
    - initialize instance variables for UI elements
        the form
        the zipcode input element
        the weather list div
        the current day div
    - write the stub of a method onFormSubmit
    - bind the class to onFormSubmit
    - add a submit handler to the form that calls onFormSubmit
  - Write the method onFormSubmit.  It should
    - prevent the form from being sumbitted to the server
    - get the zip code from the UI and put it in a variable
    - call fetch with the url zipcdoe and apikey
      - when the response comes back THEN parse the json
      - when that finishes THEN 
        - set the city in the state object
        - set the forcast in the state object
        - set the selectedDate to null
        - clear the zipcode from the UI
        - call the method renderWeatherList and pass this.state.forcast as the arg
  - Write a first version of renderWeatherList.  It has forcast (which is an array) as a parameter.
    - console.log the value of forcast.
  - Edit the constructor to bind the class to the method renderWeatherList
END OF PART 1 - TEST AND DEBUG YOUR APP
- Part 2 - Format ONE weather list item and the weather list as a whole
  - Write the method renderWeatherListItem
    - This method returns a template literal containing the html for the weather for ONE day.
      It gets called in renderWeatherList.  It has 2 parameters a weatherDay and an index.
      The weatherDay is a js object from the list part of the return from the weather api.
    - Format the weather information for one day on the html page.  At a minimum it should include
      - the month and day as well as the weekday
      - the high and low temperatures for that day
      - the element should be styled with weather-list-item as well
    - CUT the html for ONE day from your html page into the body of your method.
      - Enclose the html in ``.
      - Replace the hardcoded month and day, weekday, high and low temperatures 
        with template strings that use the properties of the weatherDay object
      - Return the template literal 
  - Edit the body of the method renderWeather list.  It should
    - Create the html for each of the weather list items.  Use the array method map to do this.
      const itemsHTML = weatherDays.map((weatherDay, index) => this.renderWeatherListItem(weatherDay, index)).join('');
    - Set the inner html of the weatherList element on the page to 
      - a div element styled with weather-list flex-parent
      - that contains the itemsHTML from above
END OF PART 2 - TEST AND DEBUG YOUR APP
- Part 3 - Display weather details when the user clicks one weather list item
  - Write the method renderCurrentDay.  It takes the index of the day as it's parameter.
    - Format the detailed weather information for the selected day on the html page. Include at least
      - identifying information for the city as well as the date
      - description and icon for the weather
      - temperatures throughout the day
      - humidity and wind information
    - CUT the html for the weather details and paste it into the body of your method
      - Enclose the html in ``.
      - Replace the hardcoded text with data.  The data is in the state instance variable.
      - Set the innerhtml property of the currentDay element on the page
  - Add a click event handler to each of the weather list items 
    - add a loop to the end of the renderWeatherList method that adds the event handler
    - you'll have to bind the method renderCurrentDay to both the class and the index of the item
  - Write the method clearCurrentDay.  It sets the inner html property of the currentDay element to ""
  - Call clearCurrentDay at the end of onFormSubmit
END OF PART 3 - TEST AND DEBUG YOUR APP
*/

// Don't forget to instantiate the a weather object!
