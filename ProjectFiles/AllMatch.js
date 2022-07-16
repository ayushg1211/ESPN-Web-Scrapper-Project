const request = require('request') ;
const Cheerio = require('cheerio') ;
const xlsx = require("xlsx");

const scoreCardObj = require('./scorecard') ;

function getAllMatchLink(url)
{
    request(url, function(error, response, html)
    {
        if(error)
        {
            console.error(error) ;
        }
        else{
            extractAllMatchLink(html) ;
        }
    })

}

function extractAllMatchLink(url)
{
    let $ = Cheerio.load(url) ;

    let scoreCardEleArr = $('.ds-flex.ds-mx-4.ds-pt-2.ds-pb-3.ds-space-x-4.ds-border-t.ds-border-line-default-translucent .ds-inline-flex.ds-items-center.ds-leading-none .ds-text-ui-typo.ds-underline-offset-4') ;

    
    let mrk=0
    let scoreCardEleArr2 = [] ;  // ScoreCards Link Array
    for(let i=0 ; i<scoreCardEleArr.length ; i++)
    {
        if(i==2)
        {
           mrk = i ;
           scoreCardEleArr2.push(scoreCardEleArr[i]) ;
        }

        if(i-mrk == 4)
        {
           scoreCardEleArr2.push(scoreCardEleArr[i]) ;
           mrk = i ;
        }   
    }
    
    for(let i=0 ; i<scoreCardEleArr2.length ; i++)
    {
        let scoreCardLink = $(scoreCardEleArr2[i]).attr('href') ;
        let fullLink = 'https://www.espncricinfo.com/' + scoreCardLink ;
        console.log(fullLink) ;

        scoreCardObj.ps(fullLink) ;
    }

}

module.exports = {
    getAllMatch : getAllMatchLink
}