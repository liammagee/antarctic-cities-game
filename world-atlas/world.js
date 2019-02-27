
// Imports
var fs = require('fs');
var Canvas = require('canvas');
var d3 = require('d3');
var topojson = require('topojson-client');

// Augment d3 and topojson libraries
var d3 = Object.assign({}, require('d3'), require('d3-geo'), require('d3-geo-projection'));
var topojson = Object.assign({}, require('topojson-client'), require('topojson-simplify'));

// Global parameters
var width = 1334, height = 750;
var xmlOnly = false, jsonOnly = false;

// Revise parameters, based on command-line arguments
args = process.argv.slice(2)
if (args[0] == 'xml')
  xmlOnly = true;
else if (args[0] == 'json')
  jsonOnly = true;

jsonFile = '50m-topo.json';
if (typeof(args[1]) !== 'undefined') {
  jsonFile = args[1];
  console.log(jsonFile);
}

// Colours
var COUNTRY_GREY = '#D8E1E3';
  


var Image = Canvas.Image, canvas = new Canvas(width, height), context = canvas.getContext('2d');


//  Extract data from the topology file
// Taken from: https://github.com/topojson/world-atlas
// https://unpkg.com/world-atlas@1/

// var data = JSON.parse(fs.readFileSync("./world/110m2-topo.json", 'utf8'));
// var data = JSON.parse(fs.readFileSync("./world/50m.json", 'utf8'));
var data = JSON.parse(fs.readFileSync("./world/" + jsonFile, 'utf8'));

// Extract features
var tracts = topojson.feature(data, data.objects.tracts);

// Simplify the data
//var data_sim = topojson.simplify(topojson.presimplify(data), 0.9);
var tracts_sim = tracts; //topojson.feature(data_sim, data_sim.objects.tracts);
// var land = topojson.feature(data, data.objects.land);
// var countries = topojson.feature(data, data.objects.countries);

// Create and configure various projections
var proj = d3.geoPeirceQuincuncial().precision(.01).translate([width  / 2, height / 2]).rotate([240,90,0]);

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

var projection4 = d3.geoPatterson().translate([width / 2, height / 2]).precision(0.1).rotate([0,90,0]);
var projection5 = d3.geoStereographic().translate([width / 2, height / 2]).precision(0.1).rotate([0,90,0]);
var projection6 = d3.geoGuyou().translate([width / 2, height / 2]).precision(0.1).rotate([0,90,0]);


/**
 * Makes a graphics context
 * @param {*} canvas 
 * @param {*} proj 
 */
function makeContext(canvas, proj) {
  var context = canvas.getContext('2d');
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
        translate = [width / 2 - scale * x, height / 2 - scale * y];

  context.scale(scalex, scaley);
  context.translate(translate[0], translate[1]);
  return { path: path, context: context };
}

/**
 * Writes out a complete projection to a tilemap
 * @param {} proj 
 * @param {*} file 
 */
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
  context.lineWidth = 2.0;
  context.fillStyle = COUNTRY_GREY;

  context.beginPath();
  path(topojson.mesh(data));
  context.stroke();

/*
  tracts.features.forEach((feature, index) => { 

    var props = tracts.features[index].properties;
    var col = (100 + parseInt(props.MAPCOLOR7) * 20);
    if (col > 255)
      col = 255;
    context.fillStyle = '#' + col.toString(16)  + 'AA00';
    console.log(props.MAPCOLOR7 +":"+ col +":"+context.fillStyle);
    console.log(path.bounds(tracts.features[index]))
    context.beginPath();
    ///path(tracts.features[index]);
    context.fill();
    context.stroke();
    context.closePath();
  } );
  */

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
  context.stroke();


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
  var countries = [], country_files = [], frags = [], iso_a3s = [];
  var writing = false;

  var featureGenerator = function(i, gid) {

    var props = tracts.features[i].properties;
    country = {};
    country.iso_a3 = props['ISO_A3'];
    if (country.iso_a3 == "-99")
      country.iso_a3 = props['ADM0_A3_IS'];
    country.NAME = props.NAME;
    country.ECONOMY = props.ECONOMY;
    country.INCOME_GRP = props.INCOME_GRP;
    country.ISO_A2 = props.ISO_A2;
    country.POP_EST = props.POP_EST;
    country.SUBREGION = props.SUBREGION;
    country.GDP_MD_EST = props.GDP_MD_EST;
    country.MAPCOLOR7 = props.MAPCOLOR7;
    country.MAPCOLOR8 = props.MAPCOLOR8;
    country.MAPCOLOR9 = props.MAPCOLOR9;
    country.MAPCOLOR13 = props.MAPCOLOR13;

    country_file = country.iso_a3 + '_' + file + '.png';
    if (iso_a3s.indexOf(country.iso_a3) !== -1)
      return gid;

    if (!xmlOnly) {
      canvas = new Canvas(width, height);
      var context = canvas.getContext('2d');
      path = d3.geoPath(proj, context);

      var bounds_world = path.bounds(topojson.mesh(data)),
            dx = bounds_world[1][0] - bounds_world[0][0],
            dy = bounds_world[1][1] - bounds_world[0][1],
            x = (bounds_world[0][0] + bounds_world[1][0]) / 2,
            y = (bounds_world[0][1] + bounds_world[1][1]) / 2,
            scale = .9 / Math.max(dx / width, dy / height),
            scalex = width / dx, 
            scaley = height  / dy,
            translate = [-bounds_world[0][0], -bounds_world[0][1]];

      var bounds_country = path.bounds(tracts.features[i]),
            dx_country = bounds_country[1][0] - bounds_country[0][0],
            dy_country = bounds_country[1][1] - bounds_country[0][1],
            scale = .9 / Math.max(dy_country / width, dy_country / height),
            scalex_country = 1.0,
            scaley_country = height / width,
            translate_country = [-bounds_country[0][0], -bounds_country[0][1]];

      var canvasCountry = new Canvas(parseInt(dx_country * scalex_country), parseInt(dy_country * scaley_country));
      // var canvasCountry = new Canvas(width / 2, height / 2);
      var contextCountry = canvasCountry.getContext('2d');
      var pathCountry = d3.geoPath(proj, contextCountry);
      // contextCountry.clearRect();
      // contextCountry.fillStyle = '#000';
      // contextCountry.fillRect(0, 0, width, height);

      console.log(canvasCountry.width, canvasCountry.height)
      console.log(tracts.features[i])
            
      contextCountry.scale(scalex_country, scaley_country);
      contextCountry.translate(translate_country[0], translate_country[1]);
      // console.log(translate)

      //  Draw smaller images
      // canvas = new Canvas(dx, dy);
      // context = canvas.getContext('2d');

      contextCountry.strokeStyle = '#f00';
      contextCountry.lineWidth = 3.0;
      
      // contextCountry.fillStyle = '#F00';
      contextCountry.fillStyle = COUNTRY_GREY;

      contextCountry.beginPath();
      pathCountry(tracts.features[i]);
      contextCountry.fill();
      

      // Toggle off border
      // contextCountry.beginPath();
      // path(tracts.features[i]);
      // contextCountry.stroke();


      var out2 = fs.createWriteStream('./countries/' + country_file);
      var stream2 = canvasCountry.pngStream();
      stream2.on('data', function(chunk){
        out2.write(chunk);
      });

      stream2.on('end', function(){
        console.log('saved png: ' + country_file);
        
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
    

    svg_text = path(tracts_sim.features[i]);
    if (svg_text == null)
      return gid;

    // MULTIPOLYGON VERSION
    zones = svg_text.split(/[Z]/);
    tmx_frag = "";
    var internalCounter = 0;
  
    // Parses the SVG comma-delimited pairs to builds an array of arrays of coordinate pairs
    var coords = zones.map(z => {
      s = z.split(/[ML]/). 
        map((p) => { p = p.split(','); return [parseInt((parseFloat(p[0]) + translatex) * scalex), parseInt((parseFloat(p[1]) + translatey) * scaley)].join(',') }).
        filter((p) => { return p != "NaN,NaN"; });

      // Remove non-unique points 
      s = [...new Set(s)];
      // s = s.sort((a, b) => { return a.length - b.length; });
      // if (country.NAME == "Russia")
      //   console.log(s[0])
      return s;
    }).filter(s => { return s.length > 0; }).sort((a, b) => { return b.length - a.length; });
    // Filter is useful, but creates problems determining min/max coords
    //.filter(s => { return s.length > 3; });

    // Calculate the approximate distance of the country's largest land mass from the equator
    var orig_coords = tracts_sim.features[i].geometry.coordinates.sort((a, b) => { return b[0].length - a[0].length;})
    var mainland_coords = orig_coords[0];
    // When there are multiple polygons, i.e. land masses
    if (coords.length > 1)
      mainland_coords = orig_coords[0][0];
    var sumOfLongitudes = mainland_coords.map(c => { return c[1]; }).reduce((accumulator, c) => { return accumulator + c; }, 0 );
    var meanLongitudes = sumOfLongitudes / mainland_coords.length;
    var minX = 0, maxY = 0;
    coords.forEach(s => {
      s.forEach(s2 => {
        var s3 = s2.split(',');
        var testX = parseInt(s3[0]);
        var testY = parseInt(s3[1]);
        if (testX < minX || minX == 0) {
          minX = testX;
        }
        if (testY > maxY || maxY == 0) {
          maxY = testY;
        }
      })
    });
    console.log("mins:", minX, maxY)
    // For each element in the array, i.e. land mass, construct a TMX object
    coords.forEach(s => {
      s = s.join(' ');

      /*
      s_simp = path.bounds(tracts_sim.features[i]).map(function(p){ return [parseInt((parseFloat(p[0]) + translatex) * scalex),parseInt((parseFloat(p[1]) + translatey) * scaley)];});
      s_simp = [s_simp[0], [s_simp[0][0],s_simp[1][1]], s_simp[1],[s_simp[1][0],s_simp[0][1]]]
      s_simp = s_simp.join(' ');
      */

      tmx_frag += '\t<object id="' + (228 + i + internalCounter++) + '" name="' + country.iso_a3 + '" x="0" y="0" visible="0">\n'
      tmx_frag += "\t\t<polygon points=\"" + s + "\"/>\n";
      tmx_frag += "\t\t<properties>\n";
      if (internalCounter == 1) {
        tmx_frag += "\t\t\t<property name=\"GID\" value=\"" + (gid + 3) + "\"/>\n";
        tmx_frag += "\t\t\t<property name=\"NAME\" value=\"" + country.NAME + "\"/>\n";
        tmx_frag += "\t\t\t<property name=\"ECONOMY\" value=\"" + country.ECONOMY + "\"/>\n";
        tmx_frag += "\t\t\t<property name=\"INCOME_GRP\" value=\"" + country.INCOME_GRP + "\"/>\n";
        tmx_frag += "\t\t\t<property name=\"ISO_A2\" value=\"" + country.ISO_A2 + "\"/>\n";
        tmx_frag += "\t\t\t<property name=\"POP_EST\" value=\"" + country.POP_EST + "\"/>\n";
        tmx_frag += "\t\t\t<property name=\"SUBREGION\" value=\"" + country.SUBREGION + "\"/>\n";
        tmx_frag += "\t\t\t<property name=\"GDP_MD_EST\" value=\"" + country.GDP_MD_EST + "\"/>\n";
        tmx_frag += "\t\t\t<property name=\"ISO_A3\" value=\"" + country.iso_a3 + "\"/>\n";
        tmx_frag += "\t\t\t<property name=\"EQUATOR_DIST\" value=\"" + meanLongitudes + "\"/>\n";
        tmx_frag += "\t\t\t<property name=\"OFFSET_X\" value=\"" + minX + "\"/>\n";
        tmx_frag += "\t\t\t<property name=\"OFFSET_Y\" value=\"" + maxY + "\"/>\n";
      }
      tmx_frag += "\t\t</properties>\n";
      tmx_frag += '\t</object>\n';
    });

    countries.push(country);
    iso_a3s.push(country.iso_a3);
    country_files.push(country_file);
    frags.push(tmx_frag);

    return gid + 1;
  };

  var counter = 0;
  tracts.features.forEach((feature, index) => { 
    console.log(counter);
    // if (index == 225)
      counter = featureGenerator(index, counter);
  } );

  obj_id = 1;
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
    xml += '   <tileset firstgid="' + (obj_id++) + '" name="' + country.iso_a3 + '" tilewidth="1334" tileheight="750" tilecount="1" columns="1">\n'
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
    // xml += '    <object id="' + (obj_id++) + '" name="' + country.iso_a3 + '" x="0" y="0" visible="0">'
    xml += tmx_frag + '\n'
    // xml += '    </object>\n'
  }
  xml += '  </objectgroup>\n'
  xml += '</map>\n'

  tmx_file = "./tmx-"+file+".tmx"
  fs.writeFile(tmx_file, xml, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file '" + tmx_file + "' was saved!");
  });
  res_js = `
  var res = {
    world_png : "res/world-stereographic-perspective.png",
    dot_png : "res/Images/dot.png",
    grat_png : "res/graticule-stereographic-perspective.png",
    world_tilemap_tmx : "res/tmx-stereographic.tmx",
    world_tilemap_background : "res/background-stereographic.png",
    world_tilemap_foreground : "res/foreground-stereographic.png",
  `;

  for (var i = 0; i < countries.length; i++) {
    country = countries[i];
    country_file = country_files[i];
    if (country.iso_a3 == "-99")
      continue;
    res_js = res_js + country.iso_a3 + '_png:\"res/countries/'+country_file+'\",\n'
  }
  res_js += `
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
`; 
  res_file = "./resource.js"
  fs.writeFile(res_file, res_js, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file '" + res_file + "' was saved!");
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


// Generates projections for various D3 geo projections

// writeProj(projection1, 'mercator');
// writeProj(projection2, 'equirectangular');
// writeProj(projection3, 'peirce');
// writeProj(projection4, 'patterson');
writeProj(projection5, 'stereographic');
// writeProj(projection6, 'guyou');

