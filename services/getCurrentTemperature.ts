const getCurrentTemperature = async (args: { location: string }) => {
  const location = args.location;
  const API_KEY = process.env.WEATHER_API_KEY;
  const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}
      `;

  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  console.log("we have an error here");
};

export default getCurrentTemperature;
