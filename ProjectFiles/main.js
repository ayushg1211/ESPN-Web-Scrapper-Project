const request = require('request') ;
const Cheerio = require('cheerio') ;
const allMatchObj = require('./AllMatch') ;
const fs = require('fs') ;
const path = require('path') ;
const xlsx = require("xlsx");
const url = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595' ;

let iplPath = path.join(__dirname, "IPL") ;  // __dirname gives full path of the current directory.
dirCreator(iplPath) ;

request(url, cb) ;

function cb(error, response, html)
{
    if(error)
    {
        console.error(error) ;
    }
    else
    {
        extractLink(html) ;
    }
}

function extractLink(html)
{
    let $ = Cheerio.load(html) ;
    let anchorEle = $('.ds-px-3.ds-py-2') ;
    let link = $(anchorEle[1]).attr('href') ;
    // console.log(link) ;

    let fullLink = 'https://www.espncricinfo.com/' + link ;
    // console.log(fullLink) ;

    allMatchObj.getAllMatch(fullLink) ;  // Modularity
}


function dirCreator(filePath)  // Creates a new Directory, if it doesn't exist.
{
    if(fs.existsSync(filePath)==false)
    {
        fs.mkdirSync(filePath) ;
    }
}