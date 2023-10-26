const fs = require('fs'); 
const parse = require('./parser.js');

const csvData=[]
const trimSpaces = string => string.replace(/(^\s+)|(\s+$)/g, '')

fs.createReadStream('./test.csv')
  .pipe(parse.parse({delimiter: ','}))
  .on('data', function(csvrow) { 
    if (!checkIsEmptyRow(csvrow, 0)) {
      csvData.push(csvrow)
    }
  })
  .on('end',function() {
    writeResult(csvData)
})

const writeResult = csvData => {

  const langsObj = convertArrToObj(getLangArr(csvData))
  const contentKeyRange = csvData[0].length - Object.keys(langsObj).length
  mapDataToLangObj(csvData, langsObj, contentKeyRange)

  var file = fs.createWriteStream('result.json');
  file.on('error', function(err) { console.log('Something wrong!') });
  file.write(JSON.stringify(langsObj,null, 2))
  file.end();
}

const checkIsEmptyRow = (rowArr, currentIndex) => {
  if (rowArr.length == (currentIndex + 1)) {return true}
  if (rowArr[currentIndex] == '') {
    return checkIsEmptyRow(rowArr, currentIndex + 1)
  } else {
    return false
  }
}

const getLangArr = arr => arr.shift().filter(item => item != '')

const convertArrToObj = arr => arr.reduce((a, v) => ({ ...a, [v]: {}}), {})

const mapDataToLangObj = (csvData, langsObj, contentKeyRange) => {
  csvData.forEach(row => {
    const contentKey = row.slice(0,contentKeyRange).filter(x=>x).join('.').replace(/\s+/g,'_').toLowerCase()
    Object.keys(langsObj).forEach(langKey => {
      langsObj[langKey][contentKey] = row[Number(contentKeyRange + Object.keys(langsObj).indexOf(langKey))]
    })
  })
}
