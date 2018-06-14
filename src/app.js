
// Global parameters
var WINDOW_WIDTH = cc.director.getWinSize().width;
var WINDOW_HEIGHT = cc.director.getWinSize().height;
var X_OFFSET = 0, Y_OFFSET = 50;
var TIME_INTERVAL = 50;
var YEAR_INTERVAL = (1000 / TIME_INTERVAL) * 10;
var RESOURCE_INTERVAL = (1000 / TIME_INTERVAL) * 1;
var RESOURCE_CHANCE = 0.5;
var FONT_FACE = "Trebuchet MS";
var RESOURCE_SIZE = 60; 
                    

/**
 * Add texture for country virus
 * @param {*} world 
 */
var addGLLayer = function(world) {
    var winSize = cc.director.getWinSize();
    var rend = new cc.RenderTexture(winSize.width, winSize.height, cc.Texture2D.PIXEL_FORMAT_RGBA4444, gl.DEPTH24_STENCIL8_OES);
    rend.setPosition(winSize.width/2,winSize.height/2);
    world.addChild(rend, 99);
    return rend;
}

/**
 * Message box
 * @param {*} parent 
 * @param {*} message 
 * @param {*} prompt 
 * @param {*} callback 
 */
var ShowMessageBoxOK = function(parent, message, prompt, callback){
    var WINDOW_WIDTH = cc.director.getWinSize().width;
    var WINDOW_HEIGHT = cc.director.getWinSize().height;
    parent.pause(); 

    var layBackground = new cc.LayerColor(new cc.Color(1, 1, 1, 200), WINDOW_WIDTH / 4, WINDOW_HEIGHT / 4);
    layBackground.attr({
        x: WINDOW_WIDTH / 2 - layBackground.width / 2,
        y: WINDOW_HEIGHT / 2 - layBackground.height / 2
    });
    parent.addChild(layBackground, 100);

    var lblMessage = new cc.LabelTTF(message, FONT_FACE, 14);
    lblMessage.attr({
        x: layBackground.width / 2,
        y: (layBackground.height / 2)
    });
    layBackground.addChild(lblMessage, 2);

    var menu = this._menu = cc.Menu.create();
    menu.setPosition(cc.p(0, 0));
    layBackground.addChild(this._menu, 3);

    var listener = cc.EventListener.create({
        event: cc.EventListener.MOUSE,
        onMouseUp : function(event) {
            var target = event.getCurrentTarget();
            var locationInNode = target.convertToNodeSpace(event.getLocation());    
            var s = target.getContentSize();
            var rect = cc.rect(0, 0, s.width, s.height);
            if (cc.rectContainsPoint(rect, locationInNode)) {       
                layBackground.removeAllChildren(true);
                layBackground.removeFromParent(true);
                parent.resume(); //it'd be beautiful if this worked wouldn't it? Sadly, it doesn't seem to do anything..
                callback();
                return true;
            }
            return false;
        }
    });

    var btnOK = cc.MenuItemLabel.create(cc.LabelTTF.create(prompt, FONT_FACE, 24));
    cc.eventManager.addListener(listener.clone(), btnOK);
    btnOK.attr({
        x: layBackground.width / 2,
        y: (layBackground.height / 2) - lblMessage.getContentSize().height * 2
    });
    menu.addChild(btnOK);
};

/**
 * Game over dialog
 * @param {*} parent 
 * @param {*} message 
 * @param {*} prompt 
 */
var GameOver = function(parent, message, prompt) {
    var WINDOW_WIDTH = cc.director.getWinSize().width;
    var WINDOW_HEIGHT = cc.director.getWinSize().height;
    parent.pause(); 
    window.clearTimeout(gameParams.timeoutID );
    gameParams.state = "Game Over";
    gameParams.startCountry = null;
    gameParams.resources = 0;
    gameParams.strategies = [];

    var layBackground = new cc.LayerColor(new cc.Color(1, 1, 1, 200), WINDOW_WIDTH / 4, WINDOW_HEIGHT / 4);
    layBackground.attr({
        x: WINDOW_WIDTH / 2 - layBackground.width / 2,
        y: WINDOW_HEIGHT / 2 - layBackground.height / 2
    });
    parent.addChild(layBackground, 100);

    var lblMessage = new cc.LabelTTF(message, FONT_FACE, 14);
    lblMessage.attr({
        x: layBackground.width / 2,
        y: (layBackground.height / 2)
    });
    layBackground.addChild(lblMessage, 2);

    var menu = this._menu = cc.Menu.create();
    menu.setPosition(cc.p(0, 0));
    layBackground.addChild(this._menu, 3);

    var listener = cc.EventListener.create({
        event: cc.EventListener.MOUSE,
        onMouseUp : function(event) {
            var target = event.getCurrentTarget();
            var locationInNode = target.convertToNodeSpace(event.getLocation());    
            var s = target.getContentSize();
            var rect = cc.rect(0, 0, s.width, s.height);
            if (cc.rectContainsPoint(rect, locationInNode)) {
                cc.director.runScene(new LoadingScene());
                return true;
            }
            return false;
        }
    });

    var btnOK = cc.MenuItemLabel.create(cc.LabelTTF.create(prompt, FONT_FACE, 24));
    cc.eventManager.addListener(listener.clone(), btnOK);
    btnOK.attr({
        x: layBackground.width / 2,
        y: (layBackground.height / 2) - lblMessage.getContentSize().height * 2
    });
    menu.addChild(btnOK);
};

/**
 * Main screen - shows the world, and various controls for interaction.
 */
var WorldLayer = cc.Layer.extend({
    sprite:null,

    ctor:function (scenario) {
        this._super();

        var size = cc.winSize;

        // Make the background white
        gl.clearColor(1.0, 1.0, 1.0, 1.0);

        // Add controls
        this.controlsBackground = new cc.LayerColor(new cc.Color(0, 0, 0, 160), 120, 72);
        this.controlsBackground.setAnchorPoint(new cc.p(0,0));
        this.controlsBackground.x = size.width - 132;
        this.controlsBackground.y = size.height - 84;
        this.addChild(this.controlsBackground, 100);

        this.yearLabel = new cc.LabelTTF("YEAR", FONT_FACE, 18);
        this.yearLabel.x = 54;
        this.yearLabel.y = 54;
        this.yearLabel.color = new cc.Color(255, 255, 255, 0);
        this.controlsBackground.addChild(this.yearLabel, 100);

        btnPause = new ccui.Button();
        var btnPlay = new ccui.Button();
        var btnFF = new ccui.Button();

        var actionsListener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {
                    btnPause.setColor(cc.color.WHITE);
                    btnPlay.setColor(cc.color.WHITE);
                    btnFF.setColor(cc.color.WHITE);
                    target.setColor(cc.color.GREEN);
                    if (target.x == 20) {  // Pause
                        gameParams.state = "Paused";
                    }
                    else if (target.x == 60) {  // Pause
                        TIME_INTERVAL = 50;
                        gameParams.state = "Started";
                    }
                    else if (target.x == 100) {  // Pause
                        TIME_INTERVAL = 25;
                        gameParams.state = "Started";
                    }
                    console.log(target.x);
                    return true;
                }
                return false;
            }
        });        

        btnPause.setTouchEnabled(true);
        btnPause.setScale9Enabled(true);
        btnPause.loadTextures("res/icons_png/guard13007/originals/png/ffffff/transparent/pause-button.png", "", "");
        btnPause.x = 20;
        btnPause.y = 20;
        btnPause.setContentSize(cc.size(512, 512));
        btnPause.setScale(0.078125);
        cc.eventManager.addListener(actionsListener.clone(), btnPause);
        this.controlsBackground.addChild(btnPause, 100);
        
        btnPlay.setTouchEnabled(true);
        btnPlay.setScale9Enabled(true);
        btnPlay.loadTextures("res/icons_png/guard13007/originals/png/ffffff/transparent/play-button.png", "", "");
        btnPlay.x = 60;
        btnPlay.y = 20;
        btnPlay.setContentSize(cc.size(512, 512));
        btnPlay.setScale(0.078125);
        cc.eventManager.addListener(actionsListener.clone(), btnPlay);
        this.controlsBackground.addChild(btnPlay, 100);
        
        btnFF.setTouchEnabled(true);
        btnFF.setScale9Enabled(true);
        btnFF.loadTextures("res/icons_png/delapouite/originals/png/ffffff/transparent/resize.png", "", "");
        btnFF.x = 100;
        btnFF.y = 20;
        btnFF.setContentSize(cc.size(512, 512));
        btnFF.setScale(0.078125);
        cc.eventManager.addListener(actionsListener.clone(), btnFF);
        this.controlsBackground.addChild(btnFF, 100);

        // Add tweet area
        this.tweetBackground = new cc.LayerColor(new cc.Color(0, 0, 0, 160), 600, 36);
        this.tweetBackground.setAnchorPoint(new cc.p(0,0));
        this.tweetBackground.x = (size.width / 2) - 300;
        this.tweetBackground.y = size.height - 48;
        this.addChild(this.tweetBackground, 100);

        this.tweetLabel = new cc.LabelTTF("[MESSAGES GO HERE]", FONT_FACE, 18);
        this.tweetLabel.x = 300;
        this.tweetLabel.y = 18;
        this.tweetLabel.color = new cc.Color(255, 255, 255, 0);
        this.tweetBackground.addChild(this.tweetLabel, 100);

        // Add dna
        this.dnaScoreBackground = new cc.LayerColor(new cc.Color(0, 0, 0, 160), 100, 36);
        this.dnaScoreBackground.setAnchorPoint(new cc.p(0,0));
        this.dnaScoreBackground.x = 10;
        this.dnaScoreBackground.y = 70;
        this.addChild(this.dnaScoreBackground, 100);

        this.dnaScoreLabel = new cc.LabelTTF("0", FONT_FACE, 18);
        this.dnaScoreLabel.x = 50;
        this.dnaScoreLabel.y = 18;
        this.dnaScoreLabel.color = new cc.Color(255, 255, 255, 0);
        this.dnaScoreBackground.addChild(this.dnaScoreLabel, 100);

        // add "World" background
        this.world_sprite = new cc.Sprite(res.world_png);
        this.world_sprite.setAnchorPoint(new cc.p(0,0))
        this.world_sprite.attr({ x: X_OFFSET, y: Y_OFFSET });
        this.addChild(this.world_sprite, 0);

        // Add graticule to background
        this.graticule_sprite = new cc.Sprite(res.grat_png);
        this.graticule_sprite.setAnchorPoint(new cc.p(0,0))
        this.graticule_sprite.attr({ x: X_OFFSET, y: Y_OFFSET });
        this.addChild(this.graticule_sprite, 99);

        // Add map
        this.map = cc.TMXTiledMap.create(res.world_tilemap_tmx);
        this.map.setAnchorPoint(new cc.p(0,0));
        this.map.attr({ x: X_OFFSET, y: Y_OFFSET });
        this.addChild(this.map, 0);
        tilelayer = this.map.getLayer("Tile Layer 1");

        // for (var i = 0; i < 177; i++) {
        // Peirce projection
        // for (var i = 0; i < 169; i++) {
        // Stereographic projection
        for (var i = 0; i < 160; i++) {
            var l = this.map.getLayer("Tile Layer " + (i + 3));
            l.setTileGID(0,cc.p(0,0))
        }

        this.dnaListener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {       
                    gameParams.state = "Paused";
                    layer = new ConfigureLayer(world);
                    world.parent.addChild(layer);
                    world.removeFromParent();
                    return true;
                }
                return false;
            }
        });
    
        this.dnaSpend = cc.MenuItemLabel.create(cc.LabelTTF.create("DNA", FONT_FACE, 24));
        this.dnaSpend.setAnchorPoint(new cc.p(0,0));
        this.dnaSpend.attr({ x: 10, y: 10 });
        this.addChild(this.dnaSpend);
    
        this.worldListener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {       
                    gameParams.state = "Paused";
                    layer = new StatsLayer(world);
                    world.parent.addChild(layer);
                    return true;
                }
                return false;
            }
        });
    
        this.worldStats = cc.MenuItemLabel.create(cc.LabelTTF.create("World", FONT_FACE, 24));
        this.worldStats.setAnchorPoint(new cc.p(0,0));
        this.worldStats.attr({ x: 300, y: 10 });
        this.addChild(this.worldStats);

        // GLOBAL VAIRABLES FOR DEBUGGING
        world = this;

        var beginSim = function() {
            gameParams.state = "Prepared";
            gameParams.startTime = Date.now();
        }

        var container = this;
        ShowMessageBoxOK(container, "Welcome to Polarised Cities!", "Next", function(that) {
            ShowMessageBoxOK(container, "Click on any country to begin!", "OK", function(that) {
                beginSim();
            });
        });

        return true;
    },

    onEnter:function () {
        this._super();

        var size = cc.winSize;

        cc.eventManager.addListener(this.dnaListener, this.dnaSpend);
        cc.eventManager.addListener(this.worldListener, this.worldStats);

        var oldTile;
        var oldColor;
        var oldPoint;

        var collisionDetection = function(points,test) {
            var crossed = false;
            var times = 0;
            for (var i = 0; i < points.length; i++) {
                var p1 = points[i];
                var p2 = (i == points.length - 1) ? points[0] : points[i+1];
                var x1 = parseFloat(p1.x), y1 = parseFloat(p1.y), x2 = parseFloat(p2.x), y2 = parseFloat(p2.y);
                if ((y1 < test.y && y2 >= test.y) || (y1 > test.y && y2 <= test.y)) {
                    if ((x1 + x2) / 2.0 < test.x) {
                        times++;
                        crossed = !crossed;
                    }
                }
            }
            return crossed;
        };

        
        mappedTiles = {};
        sortedObjs = this.map.objectGroups[0].getObjects().slice(0).sort(function(a, b) { return (a.points[0].y * size.height + a.points[0].x) > (b.points[0].y * size.height + b.points[0].x)  } )
        sortedKeys = {};
        this.map.objectGroups[0].getObjects().forEach(function(obj, index) {
            sortedKeys[obj.name] = index;
        });

        // Map objects - polygons and names
        var objs = world.map.objectGroups[0].getObjects();

        // Create country dictionary
        var centroids = function(obj) { 
            var totalX = 0, totalY = 0;
            obj.points.forEach(function(pt) {
                totalX += parseFloat(pt.x);
                totalY += parseFloat(pt.y);
            });
            return { x: totalX / obj.points.length, y: totalY / obj.points.length }
        };
        world.countries = world.map.objectGroups[0].getObjects().reduce((map, obj) => (map[obj.name] = { 
            name: obj.name,
            centroid: centroids(obj)
            // Add other properties here
        }, map), {});

        for (var j = 0; j < this.map.objectGroups[0].getObjects().length; j++) {
            var poly = this.map.objectGroups[0].getObjects()[j];
            var mts = tilelayer.getMapTileSize(), mw = mts.width, mh = mts.height;
            var cs = tilelayer.getContentSize(), cw = cs.width, ch = cs.height;
            for (var k = 0; k < tilelayer.layerWidth; k++){
                for (var l = 0; l < tilelayer.layerHeight; l++){
                    var tx = k * mw + mw / 2 - poly.x;
                    var ty = (l * mh + mh / 2) - (ch - poly.y);
                    var tp = new cc.p(tx, ty);

                    var cd = collisionDetection(poly.points, tp);
                    if (cd) { 
                        if (typeof(mappedTiles[poly]) === "undefined") {
                            mappedTiles[poly] = [];
                        }
                        var p = new cc.p(k, l);
                        mappedTiles[poly].push(p);
                    }
                }
            }
        }

        var oldPoints;
        var oldLayers = [];
        var currentCountry = null;
        var lastLayerID = -1;

        if (typeof(world.renderer) !== "undefined")
            world.renderer.removeFromParent()
        world.renderer = addGLLayer(world);

        var drawNode = new cc.DrawNode();
        var red = cc.color(255.0, 0.0, 0.0, 50.0);
        drawnPoints = [];

        var resListener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {
                    var res = Math.floor(1 + Math.random() * 3);
                    gameParams.resources += res;
                    target.removeFromParent();
                    return true;
                }
                return false;
            }
        });        

        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                if (currentCountry != null && gameParams.startCountry == null)
                    gameParams.startCountry = currentCountry;
                if (gameParams.startCountry != null && gameParams.state === "Prepared") {
                    gameParams.startDate = new Date(Date.now());
                    gameParams.currentDate = gameParams.startDate;
                    gameParams.state = "Started";
                    gameParams.counter = 0;
                    gameParams.lastResource = 0;
                    gameParams.resources = 0;
                    gameParams.strategies = [];
                    gameParams.sustainability = 1000.0;
                    world.yearLabel.setString(gameParams.currentDate.getFullYear());

                    var buttons = [];
                                            
                    // Add chance of new resource
                    var addResource = function() {
                        var r = Math.random();
                        if (gameParams.counter - gameParams.lastResource >= RESOURCE_INTERVAL) {
                            if (r < RESOURCE_CHANCE) {
                                var btnRes = new ccui.Button();
                                btnRes.setTouchEnabled(true);
                                btnRes.setScale9Enabled(true);
                                //btnRes.setAnchorPoint(cc.p(0, 0));
                                btnRes.loadTextures("res/icons/delapouite/originals/svg/ffffff/transparent/banging-gavel.svg", "", "");
                                var ind = Math.floor(Math.random() * Object.keys(world.countries).length);
                                var countryRand = world.countries[Object.keys(world.countries)[ind]];
                                var pt = countryRand.centroid;
                                console.log(countryRand.name);

                                btnRes.x = pt.x;
                                btnRes.y = size.height - pt.y;
                                btnRes.setContentSize(cc.size(RESOURCE_SIZE, RESOURCE_SIZE));
                                btnRes.setColor(cc.color.GREEN);
                                btnRes.placedAt = gameParams.counter;
                                cc.eventManager.addListener(resListener.clone(), btnRes);
                                world.addChild(btnRes, 101);
                                buttons.push(btnRes);
                            }
                            gameParams.lastResource = gameParams.counter;
                        }
                    };

                    // Evaluates loss
                    var evaluateLoss = function() {
                        var strategies = gameParams.strategies;
                        var loss = 1.0;
                        // if (strategies
                        return loss;
                    };

                    // Generates candidate points for drawing
                    var generatePoint = function(points) {
                        var minx = 0, miny = 0, maxx = 0, maxy = 0;
                        for (var i = 0; i < points.length; i++) {
                            var point = points[i];
                            if (minx == 0 || minx > parseInt(point.x)) 
                                minx = parseInt(point.x);
                            if (miny == 0 || miny > parseInt(point.y)) 
                                miny = parseInt(point.y);
                            if (maxx < parseInt(point.x)) 
                                maxx = parseInt(point.x);
                            if (maxy < parseInt(point.y)) 
                                maxy = parseInt(point.y);
                        }
                        var testx = -1, testy = -1, i = 0, maxTries = 3;
                        var cd = false;
                        do {
                            testx = minx + Math.floor(Math.random() * (maxx - minx));
                            testy = miny + Math.floor(Math.random() * (maxy - miny));
                            cd = collisionDetection(points, cc.p(testx, testy));
                        } while (! cd && (i++) < maxTries);
                        if (cd) {
                            testy = size.height - testy;
                            var p = cc.p(testx, testy); 
                            var np = 10000 * Math.floor(testx / 1) + Math.floor(testy / 1);
                            if (drawnPoints.indexOf(np) == -1) {
                                drawnPoints.push(np);
                                var op = cc.p(testx - 2, testy - 2);
                                var dp = cc.p(testx + 2, testy + 2);

                                world.renderer.begin();
                                
                                drawNode.retain();
                                drawNode.drawDot(p, 3, cc.color(255.0, 0.0, 0.0, 150.0));
                                drawNode.visit();

                                world.renderer.end();
                                world.renderer.retain();
                                drawNode.release();
                            }
                        }
                    }
                    var generatePoints = function() {
                        for (var i = 0; i < sortedObjs.length; i++) {
                            var points = sortedObjs[i].points;
                            generatePoint(points);
                        }
                    };
                    
                    // Updates the game state at regular intervals
                    var updateTime = function() {
                        if (gameParams.state == "Started") {

                            var d = gameParams.currentDate;
                            gameParams.counter++;
                            if (gameParams.counter % YEAR_INTERVAL == 0)
                                d.setFullYear(d.getFullYear()+1);

                            
                            if (gameParams.counter % RESOURCE_INTERVAL == 0)
                                addResource();

                            var newButtons = [];
                            for (var i = 0; i < buttons.length; i++){
                                var button = buttons[i];
                                if (gameParams.counter > button.placedAt + TIME_INTERVAL) {
                                    button.removeFromParent();
                                }
                                else {
                                    newButtons.push(button);
                                }
                            }
                            buttons = newButtons;
                            
                            // Update labels
                            world.dnaScoreLabel.setString(gameParams.resources);
                            world.yearLabel.setString(gameParams.currentDate.getFullYear());

                            // Add loss
                            gameParams.sustainability -= evaluateLoss();

                            // Generate points
                            generatePoints();

                            // Game over                        
                            if (gameParams.sustainability <= 0) {
                                GameOver(world, "Game Over! The world lasted until " + gameParams.currentDate.getFullYear(), "OK");
                            }
                        }

                        // Refresh the timeout
                        gameParams.timeoutID = setTimeout(updateTime, TIME_INTERVAL);
                    } 

                    // Run the updates in the background, so interaction is not blocked.
                    cc.async.parallel([
                        function() {
                            updateTime();
                        }
                    ]);
                }
            },

            onMouseMove : function(event) {
              var target = event.getCurrentTarget();
              var locationInNode = target.convertToNodeSpace(event.getLocation());
              var s = target.getContentSize();
              var rect = cc.rect(0, 0, s.width, s.height);

              // if (cc.Intersection.pointInPolygon(locationInNode, this.polygonCollider.world.points)) {
              // if (cc.rectContainsPoint(rect, locationInNode)) {
              if (true) {
                var x = parseInt(locationInNode.x / 32);
                var y = 24 - 1 - parseInt(locationInNode.y / 32);

                // Simplifed
                var x = 0;
                var y = 0;

                var layer = target.getLayer("Tile Layer 1");
                gid = layer.getTileGIDAt(x, y)
                if (typeof(layer._texGrids) !== "undefined" && typeof(layer._texGrids[gid]) === "undefined")
                    return;
                var tile = layer.getTileAt(x, y);
                var gid = layer.getTileGIDAt(x, y);
                for (var j = 0; j < oldLayers.length; j++) {
                    oldLayers[j].setTileGID((0),cc.p(0,0))
                }
                oldLayers = [];
                var start = 0, end = sortedObjs.length;
                if (lastLayerID > -1) {
                    // start = lastLayerID - 20;
                    // end = lastLayerID + 20;
                    start = (start < 0) ? 0 : start;
                    end = (end > sortedObjs.length) ? sortedObjs.length : end;
                }
                for (var j = start; j < end; j++) {
                    var poly = sortedObjs[j];
                    var ny = size.height - poly.y;
                    var mousePoint = new cc.p(locationInNode.x - poly.x, size.height - locationInNode.y - (size.height - poly.y));
                    var cd = collisionDetection(poly.points, mousePoint);
                    if (cd) {
                        var showPoints = mappedTiles[poly];
                        var fp = (showPoints != null) ? showPoints[0] : null;
                        var update = true;
                        if (oldPoints != null && typeof(oldPoints) !== "undefined") {
                            oldPoint = oldPoints[0];
                            if (oldPoint.x == fp.x && oldPoint.y == fp.y) {
                                    update = false;
                            }
                        }
                        if (update) {
                            var tgid = layer.getTileGIDAt(fp.x, fp.y);
                            for (var k = 0; k < showPoints.length; k++) {
                                var p = showPoints[k];
                                var tgid = layer.getTileGIDAt(p.x, p.y);
                                tgid = (tgid < 944) ? tgid + 1 : tgid - 1;

                                // Simplifed
                                // tgid = 1;
                                // layer.removeTileAt(p.x, p.y);
                                // layer.setTileGID(tgid, p);
                                // layer.opacity=0;
                                // layer2.opacity=255;
                                currentCountry = poly.name;
                                lastLayerID = j;
                                var lid = sortedKeys[poly.name];
                                var l = target.getLayer("Tile Layer " + (lid + 3));
                                l.setTileGID((lid + 3),cc.p(0, 0));
                                oldLayers.push(l);
                            }
                            oldPoints = showPoints;
                        }
                    }
                    else {
                        if (oldPoints != null && typeof(oldPoints) !== "undefined") {
                            for (var k = 0; k < oldPoints.length; k++) {
                                var p = oldPoints[k];
                                var tgid = layer.getTileGIDAt(p.x, p.y);
                                tgid = (tgid < 944) ? tgid : tgid - 1;
                                // layer.setTileGID(tgid, p);

                                // Simplifed
                                // tgid = 3;
                                // layer.setTileGID(tgid, cc.p(0,0));
                                // layer2.setTileGID(0,cc.p(0,0))

                                var l = target.getLayer("Tile Layer " + (j + 3));
                                l.setTileGID((0),cc.p(0, 0))
                            }
                            oldPoints = null;
                        }
                    }
                }

                return true;
              } else {
                return false;
              }
          }
        }, this.map);
    }
});

var gameParams = {};

var WorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var scene = this;
        cc.loader.loadJson("res/scenario-water.json",function(error, data){
            layer = new WorldLayer(data);
            scene.addChild(layer);
        });
    }
});



// https://github.com/plter/Cocos2d-x-js-3-docs/blob/master/Cocos2d-JS/Features/event-manager/en.md

var LoadingScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var size = cc.winSize;
        
        var playLabel = new cc.LabelTTF("Play", FONT_FACE, 38);
        // position the label on the center of the screen
        playLabel.x = size.width / 2;
        playLabel.y = size.height * 0.6;
        // add the label as a child to this layer
        this.addChild(playLabel);

        var howToPlayLabel = new cc.LabelTTF("How to Play", FONT_FACE, 38);
        // position the label on the center of the screen
        howToPlayLabel.x = size.width / 2;
        howToPlayLabel.y = size.height * 0.5;
        // add the label as a child to this layer
        this.addChild(howToPlayLabel);

        var progressLabel = new cc.LabelTTF("Progress", FONT_FACE, 38);
        // position the label on the center of the screen
        progressLabel.x = size.width / 2;
        progressLabel.y = size.height * 0.4;
        // add the label as a child to this layer
        this.addChild(progressLabel);

        var listener1 = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {       
                    cc.director.runScene(new WorldScene());
                    // cc.director.runScene(new cc.TransitionMoveInR(1, new NewGameScene()));
                    return true;
                }
                return false;
            }
        });

        var listener2 = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {       
                    alert("Not yet implemented.");
                    return true;
                }
                return false;
            }
        });

        cc.eventManager.addListener(listener1, playLabel);
        cc.eventManager.addListener(listener2.clone(), howToPlayLabel);
        cc.eventManager.addListener(listener2.clone(), progressLabel);
    }
});


var NewGameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var size = cc.winSize;

        var newLabel = new cc.LabelTTF("New Game", FONT_FACE, 38);
        // position the label on the center of the screen
        newLabel.x = size.width / 2;
        newLabel.y = size.height * 0.6;
        // add the label as a child to this layer
        this.addChild(newLabel);

        var loadLabel = new cc.LabelTTF("Load Game", FONT_FACE, 38);
        // position the label on the center of the screen
        loadLabel.x = size.width / 2;
        loadLabel.y = size.height * 0.4;
        // add the label as a child to this layer
        this.addChild(loadLabel);


        var listener1 = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {       
                    gameParams = {};
                    cc.director.runScene(new cc.TransitionMoveInR(1, new SelectChallengeScene()));
                    return true;
                }
                return false;
            }
        });

        var listener2 = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {       
                    alert("Not yet implemented.");
                    return true;
                }
                return false;
            }
        });

        cc.eventManager.addListener(listener1, newLabel);
        cc.eventManager.addListener(listener2, loadLabel);

    }
});



var SelectChallengeScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var size = cc.winSize;

        var newLabel = new cc.LabelTTF("Select a Challenge", FONT_FACE, 38);
        // position the label on the center of the screen
        newLabel.x = size.width / 2;
        newLabel.y = size.height * 0.8;
        // add the label as a child to this layer
        this.addChild(newLabel);

        var waterLabel = new cc.LabelTTF("Water Challenge", FONT_FACE, 38);
        // position the label on the center of the screen
        waterLabel.x = size.width / 2;
        waterLabel.y = size.height * 0.4;
        // add the label as a child to this layer
        this.addChild(waterLabel);


        var listener1 = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {     
                    cc.log(target)  
                    cc.director.runScene(new cc.TransitionMoveInR(1, new SelectDifficultyScene()));
                    return true;
                }
                return false;
            }
        });

        cc.eventManager.addListener(listener1, waterLabel);

    }
});


var SelectDifficultyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var size = cc.winSize;

        var newLabel = new cc.LabelTTF("Select a game difficulty", FONT_FACE, 38);
        // position the label on the center of the screen
        newLabel.x = size.width / 2;
        newLabel.y = size.height * 0.8;
        // add the label as a child to this layer
        this.addChild(newLabel);

        var casualLabel = new cc.LabelTTF("Casual", FONT_FACE, 38);
        // position the label on the center of the screen
        casualLabel.x = size.width * 0.25;
        casualLabel.y = size.height * 0.5;
        // add the label as a child to this layer
        this.addChild(casualLabel);

        var normalLabel = new cc.LabelTTF("Normal", FONT_FACE, 38);
        // position the label on the center of the screen
        normalLabel.x = size.width * 0.5;
        normalLabel.y = size.height * 0.5;
        // add the label as a child to this layer
        this.addChild(normalLabel);

        var brutalLabel = new cc.LabelTTF("Brutal", FONT_FACE, 38);
        // position the label on the center of the screen
        brutalLabel.x = size.width * 0.75;
        brutalLabel.y = size.height * 0.5;
        // add the label as a child to this layer
        this.addChild(brutalLabel);


        var listener1 = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {       
                    gameParams.level = target.getString();
                    cc.director.runScene(new cc.TransitionMoveInR(1, new EnterNameScene()));
                    return true;
                }
                return false;
            }
        });


        cc.eventManager.addListener(listener1.clone(), casualLabel);
        cc.eventManager.addListener(listener1.clone(), normalLabel);
        cc.eventManager.addListener(listener1.clone(), brutalLabel);

    }
});



var EnterNameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var size = cc.winSize;

        var newLabel = new cc.LabelTTF("Enter a name", FONT_FACE, 38);
        // position the label on the center of the screen
        newLabel.x = size.width / 2;
        newLabel.y = size.height * 0.8;
        // add the label as a child to this layer
        this.addChild(newLabel);


        var enterNameLabel = new cc.LabelTTF("Just click for now", FONT_FACE, 38);
        // position the label on the center of the screen
        enterNameLabel.x = size.width * 0.5;
        enterNameLabel.y = size.height * 0.5;
        // add the label as a child to this layer
        this.addChild(enterNameLabel);



        var listener1 = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {       
                    gameParams.name = target.getString();
                    cc.director.runScene(new cc.TransitionMoveInR(1, new ModifyCodeScene()));
                    return true;
                }
                return false;
            }
        });

        cc.eventManager.addListener(listener1.clone(), enterNameLabel);

    }
});



var ModifyCodeScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var size = cc.winSize;

        var newLabel = new cc.LabelTTF("Modify Code", FONT_FACE, 38);
        // position the label on the center of the screen
        newLabel.x = size.width / 2;
        newLabel.y = size.height * 0.8;
        // add the label as a child to this layer
        this.addChild(newLabel);


        var modifyCodeLabel = new cc.LabelTTF("Just click for now", FONT_FACE, 38);
        // position the label on the center of the screen
        modifyCodeLabel.x = size.width * 0.5;
        modifyCodeLabel.y = size.height * 0.5;
        // add the label as a child to this layer
        this.addChild(modifyCodeLabel);


        var listener1 = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {       
                    gameParams.code = target.getString();
                    cc.director.runScene(new WorldScene());
                    return true;
                }
                return false;
            }
        });

        cc.eventManager.addListener(listener1.clone(), modifyCodeLabel);
    }
});


var ConfigureLayer = cc.Layer.extend({
    ctor:function (world) {
        this._super();
        this.world = world;
    },
    onEnter:function () {
        this._super();

        var layer = this;
        var size = cc.winSize;

        var layBackground = new cc.LayerColor(new cc.Color(1, 1, 1, 255), size.width, size.height);
        layBackground.attr({ x: 0, y: 0 });
        layer.addChild(layBackground, 100);

        var resourceListener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {  
                    if (gameParams.resources - target.cost > 0) {
                        gameParams.resources -= target.cost;  
                        gameParams.strategies.push(target.strategy);
                        layer.configDnaScoreLabel.setString(gameParams.resources.toString());
                        console.log(target.cost);
                    }
                    return true;
                }
                return false;
            }
        });

        var pageView = new ccui.PageView();
        pageView.setContentSize(cc.size(size.width, size.height - 50));
        pageView.setAnchorPoint(cc.p(0, 0));
        pageView.setPosition(cc.p(X_OFFSET, Y_OFFSET));
        var pageCount = 4;
       
        for (var i = 0; i < pageCount; ++i) {
            var layout = new ccui.Layout();
            layout.setContentSize(cc.size(layout.getContentSize().width / 2.0, layout.getContentSize().height / 2.0));

            var label = new ccui.Text("page " + (i+1) , "Marker Felt", 30);
            label.setColor(cc.color(192, 192, 192));
            label.setPosition(cc.p(100, layout.getH));
            layout.addChild(label);

            var btnBanking = new ccui.Button();
            btnBanking.setTouchEnabled(true);
            btnBanking.setScale9Enabled(true);
            btnBanking.loadTextures("res/icons/delapouite/originals/svg/ffffff/transparent/bank.svg", "", "");
            btnBanking.x = 100 * (i + 1);
            btnBanking.y = 100;
            btnBanking.setContentSize(cc.size(60, 60));
            btnBanking.setColor(cc.color.GREEN);
            btnBanking.cost = i+1;
            btnBanking.strategy = "Water Mining";
            cc.eventManager.addListener(resourceListener.clone(), btnBanking);
            // add the label as a child to this layer
            layout.addChild(btnBanking, 101);
    
            pageView.insertPage(layout, i);
        }
        layer.addChild(pageView, 100);
        pageView.setCurrentPageIndex(0);

        //add buttons to jump to specific page
        var makeButton = function(text, point, index) {
            var btn = new ccui.Button();
            btn.setAnchorPoint(cc.p(0, 0));
            btn.setPosition(point);
            btn.setTitleText(text);
            btn.addClickEventListener(function(){
                pageView.setCurrentPageIndex(index);
            });
            layer.addChild(btn, 100);
        };
        makeButton("Economy", cc.p(150, 20), 0);
        makeButton("Politics", cc.p(350, 20), 1);
        makeButton("Culture", cc.p(550, 20), 2);
        makeButton("Ecology", cc.p(750, 20), 3);

        var btn = new ccui.Button();
        btn.setAnchorPoint(cc.p(0, 0));
        btn.setPosition(cc.p(950, 20));
        btn.setTitleText("X");
        btn.addClickEventListener(function(){
            layer.parent.addChild(world);
            layer.removeFromParent();
            gameParams.state = "Started";
        });
        layer.addChild(btn, 100);

        this.configDnaScoreLabel = new cc.LabelTTF(gameParams.resources.toString(), FONT_FACE, 18);
        this.configDnaScoreLabel.setAnchorPoint(cc.p(0, 0));
        this.configDnaScoreLabel.setPosition(cc.p(50, 20));
        // this.configDnaScoreLabel.color = new cc.Color(255, 255, 255, 0);
        dna = this.configDnaScoreLabel;
        layer.addChild(this.configDnaScoreLabel, 100);
    }
});


var StatsLayer = cc.Layer.extend({
    ctor:function (world) {
        this._super();
        this.world = world;
    },
    onEnter:function () {
        this._super();

        var layer = this;
        var size = cc.winSize;

        var layBackground = new cc.LayerColor(new cc.Color(1, 1, 1, 200), size.width, size.height);
        layBackground.attr({ x: 0, y: 0 });
        this.addChild(layBackground, 100);
    
        var newLabel = new cc.LabelTTF("Statistics", FONT_FACE, 38);
        // position the label on the center of the screen
        newLabel.x = size.width / 2;
        newLabel.y = size.height * 0.8;
        // add the label as a child to this layer
        this.addChild(newLabel, 101);

        var casualLabel = new cc.LabelTTF("Casual", FONT_FACE, 38);
        // position the label on the center of the screen
        casualLabel.x = size.width * 0.25;
        casualLabel.y = size.height * 0.5;
        // add the label as a child to this layer
        this.addChild(casualLabel, 101);

        var normalLabel = new cc.LabelTTF("Normal", FONT_FACE, 38);
        // position the label on the center of the screen
        normalLabel.x = size.width * 0.5;
        normalLabel.y = size.height * 0.5;
        // add the label as a child to this layer
        this.addChild(normalLabel, 101);

        var brutalLabel = new cc.LabelTTF("Brutal", FONT_FACE, 38);
        // position the label on the center of the screen
        brutalLabel.x = size.width * 0.75;
        brutalLabel.y = size.height * 0.5;
        // add the label as a child to this layer
        this.addChild(brutalLabel, 101);


        var listener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {       
                    layer.parent.addChild(world);
                    layer.removeFromParent();
                    gameParams.state = "Started";
                    return true;
                }
                return false;
            }
        });

        cc.eventManager.addListener(listener.clone(), casualLabel);
        cc.eventManager.addListener(listener.clone(), normalLabel);
        cc.eventManager.addListener(listener.clone(), brutalLabel);
    }
});
