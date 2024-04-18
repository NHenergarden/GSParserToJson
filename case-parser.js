
const axios = require('axios');
const sheetId = '15s7tQOnTBGD6Bfr08IjQU8pXGM0WtH6tYoHpvuP28o8';
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const query = encodeURIComponent('Select *');
const caseName = 'usual_basic_case';

async function fetchData() {
  try {
  let currencyList = await parseTable('843450455','A3:D9');
  let itemsList = await parseTable('843450455','F3:I105');
  let fullList = currencyList.concat(itemsList);
  let group_1 = await parseTable('0','D7:F14');
  let group_2 = await parseTable('0','H7:J11');
  let group_3 = await parseTable('0','L7:N12');
  await finalObjectCreation(caseName,group_1,group_2,group_3,fullList);
     
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

fetchData();

async function parseTable(gid, sheetRange) {
  const url = `${base}&gid=${gid}&range=${sheetRange}&tq=${query}`;
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

function parseGroup(groupId, groupName, groupChance, fullList){
    let groupFinalObject = {};
    groupFinalObject[groupName] = {
        group_chance: groupChance,
        rewards: []
    }

    groupId.forEach((object) => {
        let itemObject = {};
        let newItemObject = {};

        fullList.forEach(el => {
            if (el['Название'] == object['Награда']) {
                itemObject[object['Награда']] = {};
                itemObject[object['Награда']][`type`] = el.type;
                itemObject[object['Награда']][`parameters`] = {
                    'count': object['count'],
                    'item_id': el.item_id,
                    'chance': object['chance'],
                    };
            newItemObject[el['Нейминг']] = itemObject[object['Награда']];
            groupFinalObject[groupName].rewards.push(newItemObject);
            
            }

        })
        
    })

    return groupFinalObject;
}


async function finalObjectCreation(caseName,group_1,group_2,group_3,fullList){
    let finalObject = {};
    finalObject[caseName] = {
            groups: []
    }
    
    finalObject[caseName].groups.push(parseGroup(group_1,'group_1',0.25,fullList));
    finalObject[caseName].groups.push(parseGroup(group_2,'group_2',0.15,fullList));
    finalObject[caseName].groups.push(parseGroup(group_3,'group_3',0.6,fullList));
    
    const fs = require('fs');
    fs.writeFileSync('case.json', (JSON.stringify(finalObject, null, 2)), {encoding: 'utf-8', flag: 'w'});
    console.log('case.json has been created');

}
