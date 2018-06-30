

## Generating tile maps

Change to the world-atlas directory:

    cd world-atlas

Convert shape files from [Natural Earth](http://www.naturalearthdata.com/downloads/110m-cultural-vectors/) to GeoJSON format.

    ogr2ogr -f GeoJSON -t_srs crs:84 110m2.json ne_110m_admin_0_countries.shp

Then to generate the tile map, run:

    node world.js xml

Or with the full set of images:

    node world.js

Copy the generated tile map to the resources folder:

    cp tmx-test-stereographic.tmx ../res/