
const axios = require('axios');
const sheetId = '15s7tQOnTBGD6Bfr08IjQU8pXGM0WtH6tYoHpvuP28o8';
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const query = encodeURIComponent('Select *');

async function fetchData() {
  try {
  let currencyList = await parseTable('843450455','A3:D9');
  // console.log('Список валют:');
  // console.log(JSON.stringify(currencyList, null, 2));

  let itemsList = await parseTable('843450455','F3:I105');
  // console.log('Список предметов:');
  // console.log(JSON.stringify(itemsList, null, 2));
  


  let group_1 = await parseTable('0','D7:F14');
  // console.log('Группа 1:');
  // console.log(JSON.stringify(group_1, null, 2));



  let group_2 = await parseTable('0','H7:J11');
  // console.log('Группа 2:');
  // console.log(JSON.stringify(group_2, null, 2));


  let group_3 = await parseTable('0','L7:N12');
  // console.log('Группа 3:');
  // console.log(JSON.stringify(group_3, null, 2));
     
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

fetchData();

async function parseTable(gid, sheetRange) {
  const url = `${base}&gid=${gid}&range=${sheetRange}&tq=${query}`;
  console.log(url);
  const response = await axios.get(url);
  const rep = response.data;
  const jsData = JSON.parse(rep.substring(47).slice(0,-2));
  const data = [];
  const colz = [];
  
  jsData.table.cols.forEach((col) => {
      colz.push(col.label || ''); // Добавляем пустую строку, если label отсутствует
  });
  
  jsData.table.rows.forEach((main, rowIndex) => {
      const row = {};
      colz.forEach((el, index) => {
          row[el] = (main.c[index] != null) ? main.c[index].v : '';
          if (rowIndex === 0 && !colz[index]) {
              colz[index] = row[el]; // Используем значения первой строки, если label пустой
          }
      });
      data.push(row);
  });
  
  return data;
}
