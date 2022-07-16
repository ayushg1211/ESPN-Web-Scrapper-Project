const request = require("request");
const Cheerio = require("cheerio");
// const url = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard'
// venue, date, team1, team2, result
const fs = require("fs");
const path = require("path");
const xlsx = require('xlsx');

function processScoreCard(url) {
    // Is Exported at the end
    request(url, cb);
}

function cb(error, response, html) {
    if (error) {
        console.error(error);
    } else {
        extractMatchDetails(html);
    }
}

function extractMatchDetails(html) {
    let $ = Cheerio.load(html);
    let descEle = $(".ds-text-tight-m.ds-font-regular.ds-text-ui-typo-mid");
    let descArr = descEle.text().split(",");

    let venue = descArr[1].trim(); //
    let date = descArr[2].trim() + ", " + descArr[3].trim(); //

    let result = $(
        ".ds-text-tight-m.ds-font-regular.ds-truncate.ds-text-typo-title"
    ).text(); // result html converted into text.

    let innings = $(".ds-bg-fill-content-prime.ds-rounded-lg .ds-mb-4"); // array of Tables Html

    let htmlString = "";
    for (let i = 0; i < innings.length; i++) {
        htmlString += $(innings[i]).html(); // Table i html stored in 'htmlString'.
        let teamName = $(innings[i])
            .find('span[class="ds-text-tight-s ds-font-bold ds-uppercase"]')
            .text(); // Teamname text

        let opponentIndex = i == 0 ? 1 : 0;
        let opponentName = $(innings[opponentIndex])
            .find('span[class="ds-text-tight-s ds-font-bold ds-uppercase"]')
            .text(); //

        console.log(
            `${venue} | ${date} | ${teamName} | ${opponentName} | ${result}`
        ); // ye Cheerio vaala $ nhi hai.
        console.log(
            "............................................................................"
        );

        let cInnings = $(innings[i]); // Current Innings.
        let allRows = cInnings.find(
            ".ds-w-full.ds-table.ds-table-xs.ds-table-fixed.ci-scorecard-table tbody tr"
        ); // Array of all rows of the batting table
        for (let j = 0; j < allRows.length; j++) {
            let allCol = $(allRows[j]).find("td");
            let worth = $(allCol[0]).find("span");
            let isWorthy = $(worth).hasClass("ds-inline-flex"); // To check which row is worthy of scrapping.

            if (isWorthy == true) {
                // player name , runs, balls, fours, sixes, StrikeRate.
                let playerName = $(allCol[0]).text().trim();
                let runs = $(allCol[2]).text().trim();
                let balls = $(allCol[3]).text().trim();
                let fours = $(allCol[5]).text().trim();
                let sixes = $(allCol[6]).text().trim();
                let Str = $(allCol[7]).text().trim();
                console.log(
                    `${playerName} | ${runs} | ${balls} | ${fours} | ${sixes} | ${Str}`
                );

                processPlayer(teamName, playerName, runs, balls, fours, sixes, Str, opponentName, venue, date, result);
            }
        }

        console.log(
            "\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n"
        );
    }
}
//---------------------------------------------------------------------------------------------------------------------------
function processPlayer(teamName, playerName, runs, balls, fours, sixes, Str, opponentName, venue, date, result) {
    let teamPath = path.join(__dirname, "IPL", teamName);
    dirCreator(teamPath);
      let sheetNameArr = playerName.split(' ') ;
      let filePath = path.join(teamPath, playerName+ ".xlsx") ;
      let content = excelReader(filePath, sheetNameArr[0]+sheetNameArr[1]) ;

      let playerObj = {
        teamName,
        playerName,
        runs,
        balls,
        fours,
        sixes,
        Str,
        opponentName,
        venue,
        date,
        result
      }
      content.push(playerObj) ;
      
      excelWriter(filePath, content, sheetNameArr[0]+sheetNameArr[1]) ;
}

//-------------------------------------------------------------------------------------------------------------
function dirCreator(filePath) {
    // Creates a new Directory, if it doesn't exist.
    if (fs.existsSync(filePath) == false) {
        fs.mkdirSync(filePath);
    }
}

// //-------------------------------------------------------------------------------------------------------------
function excelWriter(filePath, jsonData, sheetName) {
    // Write JSON file to Excel

    // Add a new workbook.
    let newWB = xlsx.utils.book_new();
    // This will take jSONS and convert it into SHEET or EXCEL formt.
    let newWS = xlsx.utils.json_to_sheet(jsonData);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, filePath);
}

// //--------------------------------------------------------------------------------------------------------

function excelReader(filePath, sheetName) {

    if (fs.existsSync(filePath) == false) {
        return [];
    }
    // Read an Excel file

    // Which workbook to read.
    let wb = xlsx.readFile(filePath);
    // pass the sheet name.
    let excelData = wb.Sheets[sheetName];
    // COnversion from Excel to JSON.
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

module.exports = {
    ps: processScoreCard
};
