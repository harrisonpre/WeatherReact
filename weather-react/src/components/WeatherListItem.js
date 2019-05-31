import React, { Component } from 'react';


class WeatherListItem extends Component {
  constructor (props) {
    super(props);
    this.state = {};

    this.onClick = this.onClick.bind(this);
  }

  render() {
    const { forecastDay } = this.props;
    const date = new Date(forecastDay.dt * 1000);
    const weekday = this.getWeekday(date);
    const month = this.writeMonth(date);
    return (
        <div className="weather-list-item" onClick={this.onClick}>
            <h3>{weekday}</h3>
            <h2>{month} {date.getDate()}</h2>
            <h3>{forecastDay.minTemp.toFixed(1)}&deg;F &#124; {forecastDay.maxTemp.toFixed(1)}&deg;F</h3>
        </div>
    );
  }

  onClick () {
    const { onDayClicked, index } = this.props;
    onDayClicked(index);
}

  getWeekday(date) {
    const dayNames = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = date.getDay();
    return dayNames[weekday];
  }

  writeMonth(date) {
    let m = date.getMonth();
    let monthArray = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return monthArray[m];
  }

}

export default WeatherListItem;