/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

var express = require("express");
var bodyParser = require("body-parser");
var awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
var axios = require("axios");

// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
};

const deg2rad = deg => {
  return deg * (Math.PI / 180);
};

/**********************
 * Example get method *
 **********************/

app.get("/mosques", async (req, res) => {
  // Add your code here
  if (req.query.postcode) {
    try {
      const postcode = req.query.postcode;
      const postcodeResponse = await axios.get(
        `https://api.postcodes.io/postcodes/${postcode}`
      );
      const location = postcodeResponse.data.result;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${
          process.env.NEAREST_MOSQUES_GOOGLE_PLACES_API_KEY
        }&rankby=distance&type=mosque&location=${location.latitude},${
          location.longitude
        }`
      );
      let mosques = response.data.results.map(mosque => {
        return {
          location: mosque.geometry.location,
          name: mosque.name
        };
      });
      for (const mosque of mosques) {
        const distance = getDistanceFromLatLonInKm(
          location.latitude,
          location.longitude,
          mosque.location.lat,
          mosque.location.lng
        );
        mosque.distance = distance.toFixed(2);
      }
      mosques = mosques.slice(0, 5);
      res.json({ mosques });
    } catch (error) {
      res.json({ mosques: [], msg: "error has occured", error: error });
    }
  } else {
    res.json({ mosques: [], msg: "no post code supplied" });
  }
});

app.get("/mosques/*", function(req, res) {
  // Add your code here
  res.json({ success: "get call succeed!", url: req.url });
});

/****************************
 * Example post method *
 ****************************/

app.post("/mosques", function(req, res) {
  // Add your code here
  res.json({ success: "post call succeed!", url: req.url, body: req.body });
});

app.post("/mosques/*", function(req, res) {
  // Add your code here
  res.json({ success: "post call succeed!", url: req.url, body: req.body });
});

/****************************
 * Example post method *
 ****************************/

app.put("/mosques", function(req, res) {
  // Add your code here
  res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

app.put("/mosques/*", function(req, res) {
  // Add your code here
  res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

/****************************
 * Example delete method *
 ****************************/

app.delete("/mosques", function(req, res) {
  // Add your code here
  res.json({ success: "delete call succeed!", url: req.url });
});

app.delete("/mosques/*", function(req, res) {
  // Add your code here
  res.json({ success: "delete call succeed!", url: req.url });
});

app.listen(3000, function() {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
