

## Generating tile maps

Change to the world-atlas directory:

    cd world-atlas

Convert shape files from [Natural Earth](http://www.naturalearthdata.com/downloads/110m-cultural-vectors/) to GeoJSON format.

High resolution:

    ogr2ogr -f GeoJSON -t_srs crs:84 10m.json ne_10m_admin_0_countries.shp

Medium resolution:

    ogr2ogr -f GeoJSON -t_srs crs:84 50m.json ne_50m_admin_0_countries.shp

Low resolution:

    ogr2ogr -f GeoJSON -t_srs crs:84 110m.json ne_110m_admin_0_countries.shp


Convert to a topology file:

    ndjson-cat 10m.json | ndjson-split 'd.features' > 10m-cat.ndjson
    ndjson-cat 50m.json | ndjson-split 'd.features' > 50m-cat.ndjson
    ndjson-cat 110m.json | ndjson-split 'd.features' > 110m-cat.ndjson

Convert to a topology file:
    
    geo2topo -n tracts=10m-cat.ndjson > 10m-topo.json
    geo2topo -n tracts=50m-cat.ndjson > 50m-topo.json
    geo2topo -n tracts=110m-cat.ndjson > 110m-topo.json

Then to generate the tile map, run:

    node world.js xml 

Or with the full set of images:

    node world.js

Copy the generated tile map to the resources folder:

    cp tmx-test-stereographic.tmx ../res/

