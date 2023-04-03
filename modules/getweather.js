import axios from "axios";

export const getWeather = async (lat, long) => {
  return await axios
    .get(
      "https://api.open-meteo.com/v1/forecast?hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=auto",
      {
        params: {
          latitude: lat,
          longitude: long,
        },
      }
    )
    .then(({ data }) => {
      return {
        current: parseCurrentWeather(data),
        daily: parseDailyWeather(data),
        hourly: parseHourlyWeather(data),
      };
    });
};

function parseCurrentWeather({ current_weather, daily, hourly }) {
  const {
    temperature: currentTemp,
    weathercode: weatherIcon,
    windspeed: windSpeed,
  } = current_weather;

  const {
    temperature_2m_max: [highTemp],
    temperature_2m_min: [lowTemp],
  } = daily;

  const {
    apparent_temperature: [feelTemp],
    precipitation: [precip],
    relativehumidity_2m: [humidity],
  } = hourly;

  return {
    currentTemp: Math.round(currentTemp),
    weatherIcon,
    windSpeed: Math.round(windSpeed),
    highTemp: Math.round(highTemp),
    lowTemp: Math.round(lowTemp),
    precip,
    feelTemp: Math.round(feelTemp),
    humidity,
  };
}

function parseDailyWeather({ daily, current_weather }) {
  const { weathercode: currentWeather } = current_weather;
  const day_formatter = new Intl.DateTimeFormat(undefined, { weekday: "long" });
  return daily.time.map((time, idx) => {
    return {
      day: idx == 0 ? "Today" : day_formatter.format(time * 1000),
      weatherIcon: idx === 0 ? currentWeather : daily.weathercode[idx],
      lowTemp: Math.round(daily.temperature_2m_min[idx]),
      highTemp: Math.round(daily.temperature_2m_max[idx]),
    };
  });
}

function parseHourlyWeather({ hourly, current_weather }) {
  const hour_formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
  });
  return hourly.time
    .map((time, idx) => {
      return {
        timeStamp: time * 1000,
        weatherIcon: hourly.weathercode[idx],
        temperature: Math.round(hourly.temperature_2m[idx]),
        windSpeed: Math.round(hourly.windspeed_10m[idx]),
        precipProbability: hourly.precipitation_probability[idx],
        feelTemp: Math.round(hourly.apparent_temperature[idx]),
      };
    })
    .filter(({ timeStamp }) => timeStamp >= current_weather.time * 1000)
    .slice(0, 12)
    .map(
      (hour) =>
        (hour = { ...hour, timeStamp: hour_formatter.format(hour.timeStamp) })
    );
}
