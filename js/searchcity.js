import axios from "axios";
import { countries } from "./constants";

export const searchcity = async (input) => {
  return await axios
    .get("https://geocoding-api.open-meteo.com/v1/search?", {
      params: {
        name: input,
      },
    })
    .then(({ data }) => {
      if ("results" in data) {
        return parseQuery(data);
      }
      return [];
    });
};

function parseQuery({ results }) {
  return results.map((location, _) => {
    return {
      city: location.name,
      parentLocation: location.admin1,
      countryName: location.country,
      countryFlag: `https://countryflagsapi.netlify.app/flag/${
        countries[location.country]
      }.svg`,
      lat: location.latitude,
      long: location.longitude,
    };
  });
}
