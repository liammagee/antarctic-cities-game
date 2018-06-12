
var fs = require('fs');
var Canvas = require('canvas');
var d3 = require('d3');
var topojson = require('topojson-client');
var topojson_simplify = require('topojson-simplify');



var width = 1334, height = 750;
// width = 960, height = 960;

var Image = Canvas.Image, 
  canvas = new Canvas(width, height), 
  context = canvas.getContext('2d');

var d3 = Object.assign({}, require('d3'), require('d3-geo'), require('d3-geo-projection'))
var topojson = Object.assign({}, require('topojson-client'), require('topojson-simplify'))

var data = JSON.parse(fs.readFileSync("./world/110m2-topo.json", 'utf8'));
// var data = JSON.parse(fs.readFileSync(__dirname +"/world/110m2-topo.json", 'utf8'));
var tracts = topojson.feature(data, data.objects.tracts);
var data2 = topojson.simplify(topojson.presimplify(data), 0.9);
var tracts2 = topojson.feature(data2, data2.objects.tracts);
// var land = topojson.feature(data, data.objects.land);
// var countries = topojson.feature(data, data.objects.countries);
var proj = d3.geoPeirceQuincuncial().precision(.01).translate([width  / 2, height / 2]).rotate([240,90,0]);



// Create and configure a geographic projection
var projection1 = d3.geoMercator()
    .translate([width  / 2, height / 2])
    // .scale(width / 2 / Math.PI)
    .rotate([0, 90]);

var projection2 = d3.geoEquirectangular()
    .translate([width  / 2, height / 2])
    .rotate([0, 90])
    // .scale(340);

var projection3 = d3
      .geoPeirceQuincuncial()
      .precision(.01)
      // // .clipAngle(90 - 1e-3)
      .translate([width  / 2, height / 2])
      // .scale(150)
      // // .rotate([100,90,-190])
      .rotate([240,90,0]);

var projection4 = d3.geoPatterson()
    .translate([width / 2, height / 2])
    .precision(0.1)
         .rotate([0,90,0]);


var projection5 = d3.geoStereographic()
    .translate([width / 2, height / 2])
    .precision(0.1)
         .rotate([0,90,0]);

var projection6 = d3.geoGuyou()
    .translate([width / 2, height / 2])
    .precision(0.1)
         .rotate([0,90,0]);


var xmlOnly = false;

function makeContext(canvas, proj) {
  var context = canvas.getContext('2d');

  // context.fillStyle = '#fff';
  // context.fillRect(0, 0, width, height);


  var path = d3.geoPath(proj,
        context);

  var bounds = path.bounds(topojson.mesh(data)),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width, dy / height),
        scalex = width / dx, 
        scaley = height  / dy,
        translate = [-bounds[0][0], -bounds[0][1]];
        translate = [width / 2 - scale * x, height / 2 - scale * y];

  context.scale(scalex, scaley);
  context.translate(translate[0], translate[1]);
  return { path: path, context: context };
}

function writeProj(proj, file) {  

  // File names
  var background = 'background-' + file + '.png';
  var foreground = 'foreground-' + file + '.png';

  var canvas = new Canvas(width, height);
      // var _ = makeContext(canvas, proj),
      // context = _.context,
      // path = _.path;

  var context = canvas.getContext('2d');
  context.clearRect();

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);

  var path = d3.geoPath(proj, context);
  var bounds = path.bounds(topojson.mesh(data)),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width, dy / height),
        scalex = width / dx, 
        scaley = height  / dy,
        translate = [-bounds[0][0], -bounds[0][1]];
        // translate = [width / 2 - scale * x, height / 2 - scale * y];

  context.scale(scalex, scaley);
  context.translate(translate[0], translate[1]);



  context.strokeStyle = '#fff';
  context.lineWidth = 3.0;
  context.fillStyle = '#000';

  // context.beginPath();
  // path(topojson.mesh(data));
  // context.stroke();

  context.beginPath();
  path(tracts);
  context.fill();

  context.beginPath();
  path(tracts);
  context.stroke();


  // Graticule
  var graticule = d3.geoGraticule();
  context.beginPath();
  context.strokeStyle = '#ccc';
  path(graticule());
  // context.stroke();


  // d3.json("https://unpkg.com/world-atlas@1/world/50m.json", function(error, world) {
  //   if (error) throw error;

  //   context.beginPath();
  //   path(topojson.mesh(world));
  //   context.stroke();
  // });

  var out = fs.createWriteStream('./' + background);
  var stream = canvas.pngStream();
  stream.on('data', function(chunk){
    out.write(chunk);
  });

  stream.on('end', function(){
    console.log('saved png');
  });

  

  // ADD COUNTRIES
  var countries = [], country_files = [], frags = [];
  var writing = false;
  var f = function(i ) {

    country = tracts.features[i].properties['SOVEREIGNT'].replace(' ', '_')
    country_file = country + '_' + file + '.png';

    if (!xmlOnly) {
      canvas = new Canvas(width, height);
      var context = canvas.getContext('2d');
      path = d3.geoPath(proj, context);

      bounds = path.bounds(topojson.mesh(data)),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = .9 / Math.max(dx / width, dy / height),
            scalex = width / dx, 
            scaley = height  / dy,
            translate = [-bounds[0][0], -bounds[0][1]];
            // translate = [width / 2 - scale * x, height / 2 - scale * y];

      context.scale(scalex, scaley);
      context.translate(translate[0], translate[1]);

      context.strokeStyle = '#f00';
      context.lineWidth = 3.0;
      context.fillStyle = '#000';

      context.beginPath();
      path(tracts.features[i]);
      context.fill();

      context.beginPath();
      path(tracts.features[i]);
      context.stroke();


      var out2 = fs.createWriteStream('./countries/' + country_file);
      var stream2 = canvas.pngStream();
      stream2.on('data', function(chunk){
        out2.write(chunk);
      });

      stream2.on('end', function(){
        console.log('saved png');
        
      });
    }


    path = d3.geoPath(proj);
    bounds = path.bounds(topojson.mesh(data)),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          scale = .9 / Math.max(dx / width, dy / height),
          scalex = width / dx, 
          scaley = height  / dy,
          translatex = -bounds[0][0], 
          translatey = -bounds[0][1],
          translate = [-bounds[0][0], -bounds[0][1]];
    

    svg_text = path(tracts2.features[i]);
    if (svg_text == null)
      return;

    // Converts SVG to TMX code
    t = svg_text.split(/[LMZ]/).
      map(function(p){ p = p.split(','); return parseInt(p[0]) })
    s = svg_text.split(/[LMZ]/).
      // map(function(p){ p = p.split(','); return [parseInt((parseFloat(p[0]) + translatex) * scalex), parseInt((parseFloat(p[1]) + translatey) * scaley)].join(',') }).
      map(function(p){ p = p.split(','); return [parseInt((parseFloat(p[0]) + translatex) * scalex), parseInt((parseFloat(p[1]) + translatey) * scaley)].join(',') }).
      filter(function(p) { return p != "NaN,NaN"; })
    s = [...new Set(s)]
    s = s.join(' ')

    // Simplified
    s_simp = path.bounds(tracts2.features[i]).map(function(p){ return [parseInt((parseFloat(p[0]) + translatex) * scalex),parseInt((parseFloat(p[1]) + translatey) * scaley)];});
    s_simp = [s_simp[0], [s_simp[0][0],s_simp[1][1]], s_simp[1],[s_simp[1][0],s_simp[0][1]]]
    s_simp = s_simp.join(' ')


    // console.log(s)
    tmx_frag = "<polygon points=\"" + s + "\"/>";

    countries.push(country);
    country_files.push(country_file);
    frags.push(tmx_frag);
  };
  // for (let i = 0; i < 10; i++) {
  for (var i = 0; i < tracts.features.length; i++) {
      f(i);
  }

  obj_id = 1
  xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<map version="1.0" tiledversion="1.1.2" orientation="orthogonal" renderorder="right-down" width="1" height="1" tilewidth="1334" tileheight="750" infinite="0" nextobjectid="16">\n'
  xml += '   <tileset firstgid="' + (obj_id++) + '" name="background" tilewidth="1334" tileheight="750" tilecount="1" columns="1">\n'
  xml += '    <image source="' + background + '" trans="ff00ff" width="1334" height="750"/>\n'
  xml += '   </tileset>\n'
  xml += '   <tileset firstgid="' + (obj_id++) + '" name="foreground" tilewidth="1334" tileheight="750" tilecount="1" columns="1">\n'
  xml += '    <image source="' + foreground + '" trans="ff00ff" width="1334" height="750"/>\n'
  xml += '   </tileset>\n'

  for (var i = 0; i < country_files.length; i++) {
    country_file = country_files[i]
    country = countries[i]
    xml += '   <tileset firstgid="' + (obj_id++) + '" name="' + country + '" tilewidth="1334" tileheight="750" tilecount="1" columns="1">\n'
    xml += '    <image source="countries/' + country_file + '" trans="ff00ff" width="1334" height="750"/>\n'
    xml += '   </tileset>\n'
  }

  xml += '   <layer name="Tile Layer 1" width="1" height="1">\n'
  xml += '    <data encoding="csv">\n'
  xml += '      1\n'
  xml += '    </data>\n'
  xml += '   </layer>\n'
  xml += '   <layer name="Tile Layer 2" width="1" height="1">\n'
  xml += '    <data encoding="csv">\n'
  xml += '      2\n'
  xml += '    </data>\n'
  xml += '   </layer>\n'

  for (var i = 0; i < country_files.length; i++) {
    xml += '   <layer name="Tile Layer ' + (i + 3) + '" width="1" height="1">\n'
    xml += '    <data encoding="csv">\n'
    xml += '      ' + (i + 3) + '\n'
    xml += '    </data>\n'
    xml += '   </layer>\n'
  }
  
  xml += '  <objectgroup name="Object Layer 1">\n'
  for (var i = 0; i < country_files.length; i++) {
    country = countries[i]
    tmx_frag = frags[i]
    xml += '    <object id="' + (obj_id++) + '" name="' + country + '" x="0" y="0" visible="0">'
    xml += tmx_frag + '\n'
    xml += '    </object>\n'
  }
  xml += '  </objectgroup>\n'
  xml += '</map>\n'


  fs.writeFile("./tmx-"+file+".tmx", xml, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
  });

  // GRATICULE
  canvas = new Canvas(width, height);
  context = canvas.getContext('2d');
  
  path = d3.geoPath(proj,
        context);

  bounds = path.bounds(topojson.mesh(data)),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width, dy / height),
        scalex = width / dx, 
        scaley = height  / dy,
        translate = [-bounds[0][0], -bounds[0][1]];
        // translate = [width / 2 - scale * x, height / 2 - scale * y];

  context.scale(scalex, scaley);
  context.translate(translate[0], translate[1]);

  // Graticule
  var graticule = d3.geoGraticule();
  context.beginPath();
  context.lineWidth = 1.0;
  context.strokeStyle = '#ccc';
  path(graticule());
  context.stroke();

  var out3 = fs.createWriteStream('./' + foreground);
  var stream3 = canvas.pngStream();
  stream3.on('data', function(chunk){
    out3.write(chunk);
  });

  stream3.on('end', function(){
    console.log('saved png');
  });

}

args = process.argv.slice(2)
if (args[0] == 'xml')
  xmlOnly = true


// Generates projections for various D3 geo projections

// writeProj(projection1, 'test-mercator');
// writeProj(projection2, 'test-equirectangular');
// writeProj(projection3, 'test-peirce');
// writeProj(projection4, 'test-patterson');
writeProj(projection5, 'test-stereographic');
// writeProj(projection6, 'test-guyou');

