import React, { Component } from 'react';
import './App.css';
import ZipForm from './ZipForm';
import WeatherList from './WeatherList';
import CurrentDay from './CurrentDay';

class App extends Component {
  constructor (props) {
    super(props);
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

    this.googleMapsUrl = "https://maps.googleapis.com/maps/api/timezone/json?location=";
    this.googleApiKey = "AIzaSyC1HTCZ6mUEKFuuLHPLdE1zM2_Q7j0vxhk";

  }

  render() {
    return (
        <div>App
          <ZipForm />
          <WeatherList />
          <CurrentDay />
        </div>
    );
  }
}

export default App;