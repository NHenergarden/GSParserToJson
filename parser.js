const axios = require('axios');

const sheetId = '1t1bveuMPVhGsz4tKbhGbcIGhQjk9UbInuxsQiH1wxyM';
const sheetName = 'Balance';
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const query = encodeURIComponent('Select *');
const url = `${base}&sheet=${sheetName}&tq=${query}`;

async function fetchData() {
    try {
        const response = await axios.get(url);
        const rep = response.data;
        const jsData = JSON.parse(rep.substring(47).slice(0,-2));
        const data = [];
        const colz = [];
        jsData.table.cols.forEach ((heading) => {
            if (heading.label && heading.label != 'GachaBalanceType' && heading.label != 'RouletteBalanceType' ) {
               if (heading.label.toLowerCase() === 'date') {
                colz.push(heading.label.toLowerCase());
               } else 
               colz.push(`${heading.label}_Balance`);
            }
        }) 
        jsData.table.rows.forEach((main)=> {
            const row = {};
            colz.forEach((el,index) => {
                row[el] = (main.c[index] != null) ? main.c[index].v : '';
            })
            data.push(row);
        })
        sorting(data);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
    

}

fetchData();

function sorting(rawData) {
  
function parseBalances(str, startDate, endDate) {
    return str.split(',')
              .map(val => val.trim())
              .filter(val => val !== '')
              .map(val => ({ start_date: formatDate(startDate), end_date: formatDate(endDate), balance: val }));
  }
  
  function formatDate(date) {
    newDate = date.replace('Date(','').replace(')', '');
    dateArray = newDate.split(',');

    const day = dateArray[2];
    const month = Number(dateArray[1])+1;
    const year = dateArray[0]
    return `${month}/${day}/${year}`;
  }

  const jsonData = {};
  
  rawData.forEach(entry => {
    for (const key in entry) {
      if (key !== 'date' && entry.hasOwnProperty(key)) {
        if (entry[key] !== '') {
          if (!jsonData[key]) {
            jsonData[key] = [];
          }
          const balances = parseBalances(entry[key], entry.date, entry.date);
          jsonData[key].push(...balances);
        }
      }
    }
  });
  
  for (const key in jsonData) {
    if (jsonData.hasOwnProperty(key)) {
      const combinedData = {};
      jsonData[key].forEach(entry => {
        if (!combinedData[entry.balance]) {
          combinedData[entry.balance] = { start_date: entry.start_date, end_date: entry.end_date, balance: entry.balance };
        } else {
          combinedData[entry.balance].end_date = entry.end_date;
        }
      });
      jsonData[key] = Object.values(combinedData);
    }
  }

const fs = require('fs');
fs.writeFileSync('balance.json', (JSON.stringify(jsonData, null, 2)), {encoding: 'utf-8', flag: 'w'});
console.log('balance.json has been created');

}


