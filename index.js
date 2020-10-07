const fs = require('fs');
const csv = require('csv-parser');
const fetch = require('node-fetch');
const parser = require('node-html-parser');

class Web{

    constructor(name, url) {
        this.name = name;
        this.url = url;
    }
}

let run = async () => {
    let webs = await readWebsitesFile();
    let htmlsSet = await getWebsitesHTML(webs);
    console.log(" ");
    await logFilesLength(htmlsSet);
    console.log(" ");
    let dependenciesCountMap = await logDependenciesAndGetDependenciesCount(htmlsSet);
    console.log(" ");
    logDependenciesCount(dependenciesCountMap);
}

function logDependenciesCount(dependenciesCountMap) {

    dependenciesCountMap.forEach(function (value, key, dependenciesCountMap){
        console.log(key + ", " + value);
    })
}

function logDependenciesAndGetDependenciesCount(htmlsSet) {

    let dependenciesCountMap = new Map();
    let dependencies = []
    htmlsSet.forEach(function (value, key, htmlsSet) {
        let dep = parser.parse(value);
        dep = dep.querySelectorAll("script");
        let srcs = [];
        for (let i = 0; i < dep.length; i++){
            if (dep[i].getAttribute("src") != undefined){
                let src = dep[i].getAttribute("src");
                src = src.split("?")[0];
                src = src.substr(src.lastIndexOf('/') + 1, src.length);
                srcs.push(src);
            }
        }
        let unique = [...new Set(srcs)];
        for (let i = 0; i < unique.length; i++){
            console.log(key + ", " + unique[i]);
            dependenciesCountMap.set(unique[i], (dependenciesCountMap.get(unique[i]) || 0) + 1);
        }
    });
    return dependenciesCountMap;
}

async function getWebsitesHTML(webs) {

    let htmlsSet = new Map();
    for (let i = 0; i < webs.length;i++) {
        if (webs[i].url.startsWith("http")){
            let html = await fetch(webs[i].url)
                .then(res => res.text());
            htmlsSet.set(webs[i].name, html);
        } else {
            htmlsSet.set(webs[i].name, await fs.readFileSync(webs[i].url, { encoding: "utf8" }));
        }
    }
    return htmlsSet;
}

function readWebsitesFile() {

    return new Promise(function (resolve,reject) {
        let webs = [];
        fs.createReadStream('./websites.csv')
            .pipe(csv(['name', 'url']))
            .on('data', function (row) {
                const web = new Web(row.name,row.url);
                webs.push(web);
            })
            .on('end', function () {
                resolve(webs);
            });
    });
}

async function logFilesLength(htmlSet){

    htmlSet.forEach(function (value, key, htmlSet) {
        let prueba = Buffer.byteLength(value);
        console.log(key + ", " + Buffer.byteLength(value));
    })
}

run();
