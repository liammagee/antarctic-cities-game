

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('results.json')
});

let totalLoss = 0;
let counter = 0;
lineReader.on('line', function (line) {
    counter++;
    let obj = JSON.parse(line);
    totalLoss += obj.totalLoss;
    console.log('Line from file:', obj.totalLoss);
});

lineReader.on('close', function () {
    totalLoss /= counter;
    console.log("Average total loss: ", totalLoss);
});


