const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')
const fetch = require('node-fetch');
const config = require('./config.json')
let API_KEY = config.newsapikey;
const day = ['Lundi', 'Mardi', 'Mecredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const month = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
require("tools-for-instagram");

uploadNews();

async function uploadNews() {
    let ig = await login();

    const response = await fetch(``)

}