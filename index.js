const express = require("express");
const request = require('request');
const app = express();
const port =3000;

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.send("Home Page ");
  });
  
  app.get("/signin", (req, res) => {
    res.render("signin");
  });

  app.get("/signinsubmit", (req, res) => {
    const email = req.query.email;
    const password = req.query.password;

    db.collection("users")
    .where("email", "==", email)
    .where("password", "==", password)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        var usersData = [];
        db.collection("users")
          .get()
          .then((docs) => {
            docs.forEach((doc) => {
              usersData.push(doc.data());
            });
          })
          .then(() => {
            console.log(usersData);
            res.render("home", { userData: usersData });
          });
      } else {
        res.render("login_fail");
      }
    });
  }); 

  app.get("/help",(req,res)=>{
    res.render("signup");
  });

  app.get("/signupsubmit", (req, res) => {
    const first_name = req.query.first_name;
    const last_name = req.query.last_name;
    const email = req.query.email;
    const password = req.query.password;
    const phonenumber = req.query.phno;
  db.collection("users")
  .add({
    name: first_name + last_name,
    email: email,
    password: password,
    phonenumber: phonenumber
  })
  .then(() => {
    res.render("signup_success");
  });
  });

 

  app.get('/locsubmit', (req, res) => {
    res.render("weather");
  });

  
  app.get('/weathersubmit',(req,res) =>{
    const location = req.query.location;
    request(
      "http://api.weatherapi.com/v1/current.json?key=46efdd37f1964cd08ff110639223010&q="+location+"&aqi=no", function (error, response, body){
        if("error" in JSON.parse(body))
        {
          if((JSON.parse(body).error.code.toString()).length > 0)
          {
            res.render("weather");
          }
        }
        else
        {
          const region = JSON.parse(body).location.region;
          const country= JSON.parse(body).location.country;
          const loctime = JSON.parse(body).location.localtime;
          const latitude =JSON.parse(body).location.lat;
          const longitude =JSON.parse(body).location.lon;
          const temp_c = JSON.parse(body).current.temp_c;
          const temp_f = JSON.parse(body).current.temp_f;
          const icon = JSON.parse(body).current.condition.icon;
          const wind_kph = JSON.parse(body).current.wind_kph;
          const humi = JSON.parse(body).current.humidity;
          const feels_c = JSON.parse(body).current.feelslike_c;
          const feels_f = JSON.parse(body).current.feelslike_f;
          res.render('location',{location:location,region:region,country:country,loctime:loctime,latitude:latitude,longitude:longitude,temp_c:temp_c,temp_f:temp_f,icon:icon,wind_kph:wind_kph,feels_c:feels_c,feels_f:feels_f,humi:humi},);
        } 
      }
      );
  });
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });