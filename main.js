import { getWeather } from "./js/getweather";
import { searchcity } from "./js/searchcity";
import { weatherIcons } from "./js/constants";

const searchBar = document.querySelector("input");
searchBar.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    searchcity(searchBar.value).then((data) => {
      console.log(data);
      renderSearchResults(data);
    });
  }
});

const resultsContainer = document.querySelector("table");
function renderSearchResults(results) {
  if (results.length === 0) {
    resultsContainer.classList.add("hide-results");
    searchBar.classList.remove("input-entered");
    return;
  }

  searchBar.classList.add("input-entered");
  resultsContainer.innerHTML = "";
  const header = document.createElement("tr");
  header.classList.add("query-header");
  const cityHeader = document.createElement("th");
  cityHeader.textContent = "City";
  const locationHeader = document.createElement("th");
  locationHeader.textContent = "Located In";
  const countryHeader = document.createElement("th");
  countryHeader.textContent = "Country";
  header.appendChild(cityHeader);
  header.appendChild(locationHeader);
  header.appendChild(countryHeader);
  resultsContainer.appendChild(header);
  resultsContainer.classList.remove("hide-results");

  results.map((result, _) => {
    const query = document.createElement("tr");
    query.classList.add("query-row");
    query.tabIndex = 0;

    const city = document.createElement("td");
    city.textContent = result.city;
    const location = document.createElement("td");
    location.textContent = result.parentLocation;
    const country = document.createElement("td");
    const flag = document.createElement("img");
    flag.src = result.countryFlag;
    flag.alt = `Flag of ${result.countryName}`;
    country.appendChild(flag);

    query.appendChild(city);
    query.appendChild(location);
    query.appendChild(country);
    query.onkeyup = function (event) {
      if (event.key === "Enter") {
        selectedCity(result);
      }
    };
    query.onclick = function () {
      selectedCity(result);
    };
    resultsContainer.appendChild(query);
  });
}

function selectedCity(result) {
  const currentLocation = document.getElementById("current-location");
  currentLocation.textContent = `${result.city}, ${result.parentLocation},`;
  const currentFlag = document.createElement("img");
  currentFlag.src = result.countryFlag;
  currentFlag.alt = `Flag of ${result.countryName}`;
  currentLocation.appendChild(currentFlag);
  searchBar.classList.remove("input-entered");
  resultsContainer.classList.add("hide-results");
  successCallback({
    latitude: result.lat,
    longitude: result.long,
  });
}

const currentTime = new Date();
const currentHour = currentTime.getHours();

function getWeatherIcon(weatherCode) {
  if (weatherCode <= 2) {
    if (currentHour < 6 || currentHour >= 18) {
      return weatherIcons[weatherCode][1];
    } else {
      return weatherIcons[weatherCode][0];
    }
  } else {
    return weatherIcons[weatherCode];
  }
}

function successCallback(coords) {
  const loading = document.createElement("div");
  getWeather(coords.latitude, coords.longitude).then((data) => {
    document.body.appendChild(loading);
    renderCurrentWeather(data.current);
    renderDailyWeather(data.daily);
    renderHourlyWeather(data.hourly);
    document.body.removeChild(loading);
  });
}

function errorCallback() {
  alert("Error in getting current location, using Portland, OR instead");
  getWeather(45.52, -122.68).then((data) => {
    document.body.classList.remove("load");
    renderCurrentWeather(data.current);
    renderDailyWeather(data.daily);
    renderHourlyWeather(data.hourly);
  });
}

function changeText(selector, value, { parent = document } = {}) {
  parent.querySelector(`[data-${selector}]`).textContent = String(value);
}

function renderCurrentWeather(currentWeather) {
  changeText("current-temp", currentWeather.currentTemp + "°");
  changeText("max-temp", currentWeather.highTemp + "°");
  changeText("min-temp", currentWeather.lowTemp + "°");
  changeText("current-precip", currentWeather.precip + `"`);
  changeText("current-feel", currentWeather.feelTemp + "°");
  changeText("current-humidity", currentWeather.humidity + "%");
  changeText("current-wind", currentWeather.windSpeed + "MPH");
  const newIcon = getWeatherIcon(currentWeather.weatherIcon);
  document.querySelector("[data-current-code]").src = `images/${newIcon}.svg`;
  document.querySelector(
    "[data-current-code]"
  ).alt = `current weather: ${String(newIcon)}`;
}

const dailyForecastContainer =
  document.getElementsByClassName("daily-forecast");
const dayContainer = document.getElementById("day-container");

function renderDailyWeather(dailyWeatherList) {
  dailyForecastContainer[0].innerHTML = "";
  dailyForecastContainer[1].innerHTML = "";
  dailyWeatherList.forEach((day) => {
    const element1 = dayContainer.cloneNode(true);
    element1.getElementsByClassName("day-title")[0].textContent = day.day;
    const newIcon = getWeatherIcon(day.weatherIcon);
    element1.querySelector("[data-daily-icon]").src = `images/${newIcon}.svg`;
    element1.querySelector("[data-daily-icon]").alt = `${
      day.day
    }'s weather: ${String(newIcon)}`;
    element1.querySelector(
      "[data-daily-temperatures]"
    ).textContent = `${day.lowTemp}° - ${day.highTemp}°`;
    dailyForecastContainer[0].append(element1);

    const element2 = element1.cloneNode(true);
    element2.id = `day-container`;
    dailyForecastContainer[1].append(element2);
  });
}

const hourlyForecastContainer = document.getElementById("hourly-forecast");
const hourlyContainer = document.getElementById("hourly-row");
function renderHourlyWeather(hourlyWeatherList) {
  hourlyForecastContainer.innerHTML = "";
  hourlyWeatherList.map((hour, idx) => {
    const element = hourlyContainer.cloneNode(true);

    element.getElementsByClassName("hourly-time")[0].textContent =
      idx === 0 ? "Now" : hour.timeStamp;

    const newIcon = getWeatherIcon(hour.weatherIcon);
    console.log(newIcon);
    element.querySelector("[data-hourly-weather").src = `images/${newIcon}.svg`;

    element.querySelector("[data-hourly-weather").alt = `weather ${
      idx === 0 ? "right now" : `at ${hour.timeStamp}`
    }: ${String(newIcon).replace(/-/g, " ")}`;

    element
      .getElementsByClassName("hourly-info")[0]
      .querySelectorAll(
        "p"
      )[0].textContent = `Temperatue: ${hour.temperature}°`;

    element
      .getElementsByClassName("hourly-info")[0]
      .querySelectorAll("p")[1].textContent = `Wind: ${hour.windSpeed}MPH`;

    element
      .getElementsByClassName("hourly-info")[1]
      .querySelectorAll(
        "p"
      )[0].textContent = `Precipitation: ${hour.precipProbability}%`;

    element
      .getElementsByClassName("hourly-info")[1]
      .querySelectorAll("p")[1].textContent = `Feels Like: ${hour.feelTemp}°`;

    hourlyForecastContainer.append(element);
  });
}
