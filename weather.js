const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')
const fetch = require('node-fetch');
const config = require('./config.json')
let API_KEY = config.openweatherapikey;
const day = ['Lundi', 'Mardi', 'Mecredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const month = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
require("tools-for-instagram");

uploadWeather();

async function uploadWeather() {
    let ig = await login();

    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${config.city.lat}&lon=${config.city.lon}&appid=${API_KEY}&units=metric&lang=fr`)
    let set = await response.json();
    set.list = set.list.filter(item => parseInt(item.dt_txt.split(' ')[1].split(':')[0]) >= 6 && parseInt(item.dt_txt.split(' ')[1].split(':')[0]) <= 21)
    for (let n = 0; n < 5; n++) {
        let album = [];
        let dayFirstItemSet = parseInt(set.list[0].dt_txt.split(' ')[0].split('-')[2]);
        let activeDay = day[n];
        let activeSetPart = set.list.filter(item => parseInt(item.dt_txt.split(' ')[0].split('-')[2]) == dayFirstItemSet)
        set.list = set.list.filter(item => parseInt(item.dt_txt.split(' ')[0].split('-')[2]) != dayFirstItemSet)
        for (let i = 0; i < activeSetPart.length; i++) {
            let data = activeSetPart[i];
            const width = 1080
            let ratio = 1
            const height = 1080 / ratio

            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext('2d');

            //draw background card
            let gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, "#AACAFA");
            gradient.addColorStop(1, "#5895FD");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(0, 0, width, height, 50);
            ctx.fill();

            //temperature text
            ctx.font = "180px arial";
            let measureText = ctx.measureText("28°")
            let textWidth = measureText.width
            let textHeight = measureText.width

            let gradient2 = ctx.createLinearGradient(400, 50, textWidth, textHeight)
            gradient2.addColorStop(0, "#f3f7ff");
            gradient2.addColorStop(1, "#b6d1ff");
            ctx.fillStyle = gradient2;
            ctx.fillText(`${data.main.temp}°`, 520, 250);

            //feel like temperature text
            ctx.font = "60px arial";
            ctx.fillStyle = "rgba(255, 255, 255, .7)";
            ctx.fillText(`Ressenti ${data.main.feels_like}°`, 610, 320);

            //météo text
            ctx.font = "70px arial";
            ctx.fillStyle = "white";
            ctx.fillText(data.weather[0].description, 100, 420);

            ctx.font = "40px arial";
            ctx.fillStyle = "rgba(255, 255, 255, .7)";

            ctx.fillText(`${activeDay} ${data.dt_txt.split(' ')[0].split('-')[2]} ${month[data.dt_txt.split(' ')[0].split('-')[1]-1]} \nPrévision pour ${parseInt(data.dt_txt.split(' ')[1].split(':')[0])}H\nÀ ${config.city.name}`, 100, 500);

            //draw 4 picto for pressure, humidity, wind speed and wind direction

            //humidity
            ctx.fillStyle = "#9bc0fe";
            ctx.beginPath();
            ctx.roundRect(560, 450, 200, 200, 50)
            ctx.fill();

            ctx.font = "150px arial";
            ctx.fillStyle = "rgba(255, 255, 255, .7)";
            ctx.fillText(data.main.humidity, 580, 600);

            let humidityPicto = await loadImage('./meteoicon/humidity.png');
            ctx.drawImage(humidityPicto, 770, 470, 150, 150);


            //pressure
            ctx.fillStyle = "#9bc0fe";
            ctx.beginPath();
            ctx.roundRect(100, 700, 250, 250, 50);
            ctx.fill();

            let pressurePicto = await loadImage('./meteoicon/pressure.png');
            ctx.drawImage(pressurePicto, 120, 720, 200, 200);

            ctx.font = "40px arial";
            ctx.fillStyle = "rgba(255, 255, 255, .7)";
            ctx.fillText(`${data.main.pressure} hPa`, 140, 1000);

            //wind speed 
            ctx.fillStyle = "#9bc0fe";
            ctx.beginPath();
            ctx.roundRect(400, 700, 250, 250, 50);
            ctx.fill();

            let windSpeedPicto = await loadImage('./meteoicon/windspeed.png');
            ctx.drawImage(windSpeedPicto, 440, 720, 200, 200);


            ctx.font = "40px arial";
            ctx.fillStyle = "rgba(255, 255, 255, .7)";
            ctx.fillText(`${data.wind.speed} m/s`, 440, 1000);

            //wind direction
            ctx.fillStyle = "#9bc0fe";
            ctx.beginPath();
            ctx.roundRect(700, 700, 250, 250, 50);
            ctx.fill();

            let renderName = data.dt_txt.replace(/\:| |\-/gm, '_')

            let windDirectionPicto = await loadImage('./meteoicon/winddirection.png')
            ctx.drawImage(windDirectionPicto, 730, 720, 200, 200);

            ctx.font = "40px arial";
            ctx.fillStyle = "rgba(255, 255, 255, .7)";
            ctx.fillText(`${data.wind.deg} deg`, 750, 1000);

            //draw top-left picture
            let picto = await loadImage(`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`);
            ctx.drawImage(picto, -30, -100, 600, 600)


            const buffer = canvas.toBuffer('image/jpeg')
            fs.writeFileSync(`./render/${renderName}.jpg`, buffer);
            let pictureUrl = './render/' + renderName + '.jpg';
            album.push(pictureUrl);
            if (i == activeSetPart.length - 1) {
                let caption = `Voici les prévisions météo pour ${activeDay} ${data.dt_txt.split(' ')[0].split('-')[2]} ${month[data.dt_txt.split(' ')[0].split('-')[1]-1]} à ${config.city.name}`;
                await uploadAlbum(ig, caption, album);
            }
            if (i == activeSetPart.length - 1 && n == 4) {
                process.exit(1);
            }
        }

    }

}