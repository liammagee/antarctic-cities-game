
// Global parameters
var WINDOW_WIDTH = cc.director.getWinSize().width;
var WINDOW_HEIGHT = cc.director.getWinSize().height;
var X_OFFSET = 0, Y_OFFSET = 50;
var TIME_INTERVAL = 50;
var DAY_INTERVAL = 20;
var RESOURCE_CHANCE = 0.5;
var FONT_FACE = "Trebuchet MS";
var RESOURCE_SIZE = 60; 
var RESOURCE_DURATION = 100;
var RESOURCES_INITIAL = 8;
var DESTRUCTION_START = 0.0;
var SUSTAINABILITY_TARGET = 2000.0;
var LOSS_INITIAL = 1.1;
var LOSS_RATE_OF = 0.001;
var YEAR_TARGET = 2048;

// Game variables
var gameParams = {};
var gameStates = {
    INITIALISED: 0,
    PREPARED: 1,
    STARTED: 2,
    PAUSED: 3,
    GAME_OVER: 5
};

// Colours

COLOR_LICORICE = new cc.Color(42, 54, 68, 255); // Dark Grey
COLOR_ZINC = new cc.Color(123, 133, 143, 255); // Medium Grey
COLOR_ICE = new cc.Color(214, 225, 227, 255); // Light Grey
COLOR_OAK = new cc.Color(243, 226, 206, 255); // Beige
COLOR_UMBER = new cc.Color(154, 136, 124, 255); // Brown
COLOR_BLACK = new cc.Color(0, 0, 0, 255); // Black
COLOR_WHITE = new cc.Color(255, 255, 255, 255); // White


// B&W THEME

// COLOR_BACKGROUND = new cc.Color(0, 0, 0, 255); // Black
// // COLOR_FOREGROUND = new cc.Color(192, 192, 192, 255); // Light Grey
// COLOR_FOREGROUND = new cc.Color(255, 255, 255, 255); // White
// COLOR_HIGHLIGHT = new cc.Color(0, 255, 0, 255); // Green
// COLOR_RESOURCE = new cc.Color(255, 0, 0, 255); // Red
// COLOR_POLICY_POINTS = new cc.Color(0, 255, 0, 100.); // Green, with transparency
// COLOR_DESTRUCTION_POINTS = new cc.Color(255, 0, 0, 100.); // Red, with transparency
// COLOR_BACKGROUND_TRANS = new cc.Color(0, 0, 0, 160); // Black, with transparency

// ANTARCTIC CITIES THEME

COLOR_BACKGROUND = COLOR_LICORICE; 
COLOR_FOREGROUND = COLOR_ICE; 
COLOR_HIGHLIGHT = COLOR_OAK; 
COLOR_RESOURCE = COLOR_UMBER; 
COLOR_POLICY_POINTS = new cc.Color(0, 255, 0, 100); // Green, with transparency
COLOR_DESTRUCTION_POINTS = new cc.Color(255, 0, 0, 100); // Red, with transparency
COLOR_BACKGROUND_TRANS = new cc.Color(42, 54, 68, 160); // Black, with transparency



/**
 * Initialises the game parameters.
 */
var initGameParams = function(scenarioData) {
    gameParams = {};
    gameParams.state = gameStates.INITIALISED;
    gameParams.startDate = new Date(Date.now());
    gameParams.startDate.setDate(1);
    gameParams.startDate.setMonth(scenarioData.start_month);
    gameParams.startDate.setYear(scenarioData.start_year);
    gameParams.currentDate = gameParams.startDate;
    gameParams.counter = 0;
    gameParams.lastResource = 0;
    gameParams.resources = RESOURCES_INITIAL;
    gameParams.strategies = [];
    gameParams.policy = 0;
    gameParams.destruction = DESTRUCTION_START;
    gameParams.previousLoss = LOSS_INITIAL;
    gameParams.rateOfDecline = LOSS_RATE_OF;
    updateTimeVars(DAY_INTERVAL);
};

/**
 * Sets up game parameters at the start of play
 */
var startGameParams = function() {
    gameParams.state = gameStates.STARTED;
};

/**
 * Update time variables.
 */
var updateTimeVars = function(interval) {
    gameParams.timeInterval = interval;
    gameParams.resourceInterval = (1000 / gameParams.timeInterval);
};

/**
 * Add texture for country virus
 * @param {*} world 
 */
var addGLLayer = function(world) {
    var winSize = cc.director.getWinSize();
    var rend = new cc.RenderTexture(winSize.width, winSize.height, cc.Texture2D.PIXEL_FORMAT_RGBA4444, gl.DEPTH24_STENCIL8_OES);
    rend.setPosition(winSize.width/2,winSize.height/2);
    world.worldBackground.addChild(rend, 99);
    return rend;
};

/**
 * Load external data sources
 * Reference: https://github.com/toddmotto/public-apis#transportation
 */
var loadDataSets = function() {
    cc.loader.loadJson("https://api.openaq.org/v1/cities",function(error, data){
        console.log(data);
    });   
};

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

    var layBackground = new cc.LayerColor(COLOR_BACKGROUND_TRANS, WINDOW_WIDTH / 4, WINDOW_HEIGHT / 4);
    layBackground.attr({ x: WINDOW_WIDTH / 2 - layBackground.width / 2, y: WINDOW_HEIGHT / 2 - layBackground.height / 2});
    parent.addChild(layBackground, 1);

    var lblMessage = new cc.LabelTTF(message, FONT_FACE, 14);
    lblMessage.attr({ x: layBackground.width / 2, y: (layBackground.height / 2) });
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
                parent.resume(); 
                callback();
                return true;
            }
            return false;
        }
    });

    var btnOK = cc.MenuItemLabel.create(cc.LabelTTF.create(prompt, FONT_FACE, 24));
    cc.eventManager.addListener(listener.clone(), btnOK);
    btnOK.attr({ x: layBackground.width / 2, y: (layBackground.height / 2) - lblMessage.getContentSize().height * 2 });
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
    initGameParams(world.scenarioData);
    gameParams.state = gameStates.GAME_OVER;
    gameParams.startCountry = null;
    gameParams.strategies = [];
    gameParams.resources = RESOURCES_INITIAL;
    gameParams.previousLoss = LOSS_INITIAL;
    gameParams.rateOfDecline = LOSS_RATE_OF;

    var layBackground = new cc.LayerColor(COLOR_BACKGROUND, WINDOW_WIDTH / 4, WINDOW_HEIGHT / 4);
    layBackground.attr({ x: WINDOW_WIDTH / 2 - layBackground.width / 2, y: WINDOW_HEIGHT / 2 - layBackground.height / 2
    });
    parent.addChild(layBackground, 1);

    var lblMessage = new cc.LabelTTF(message, FONT_FACE, 14);
    lblMessage.attr({ x: layBackground.width / 2, y: (layBackground.height / 2) });
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

    ctor:function (scenarioData, countryData) {
        this._super();

        initGameParams(scenarioData);     

        var size = cc.winSize;

        var layerBackground = new cc.LayerColor(cc.color.WHITE, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        this.addChild(layerBackground, 0);

        // Add controls
        this.controlsBackground = new cc.LayerColor(COLOR_BACKGROUND_TRANS, 120, 72);
        this.controlsBackground.setAnchorPoint(cc.p(0,0));
        this.controlsBackground.x = size.width - 132;
        this.controlsBackground.y = size.height - 84;
        this.addChild(this.controlsBackground, 100);

        this.dayLabel = new cc.LabelTTF("", FONT_FACE, 18);
        this.dayLabel.setAnchorPoint(cc.p(0, 0));
        this.dayLabel.attr({ x: 14, y: 54 });
        this.dayLabel.color = COLOR_FOREGROUND;
        this.monthLabel = new cc.LabelTTF("", FONT_FACE, 18);
        this.monthLabel.setAnchorPoint(cc.p(0, 0));
        this.monthLabel.attr({ x: 34, y: 54 });
        this.monthLabel.color = COLOR_FOREGROUND;
        this.yearLabel = new cc.LabelTTF("", FONT_FACE, 18);
        this.yearLabel.setAnchorPoint(cc.p(0, 0));
        this.yearLabel.attr({ x: 54, y: 54 });
        this.yearLabel.color = COLOR_FOREGROUND;
        // this.controlsBackground.addChild(this.dayLabel, 100);
        this.controlsBackground.addChild(this.monthLabel, 100);
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
                    btnPause.setColor(COLOR_FOREGROUND);
                    btnPlay.setColor(COLOR_FOREGROUND);
                    btnFF.setColor(COLOR_FOREGROUND);
                    target.setColor(COLOR_HIGHLIGHT);
                    if (target.x == 20) {  // Pause
                        gameParams.state = gameStates.PAUSED;
                    }
                    else if (target.x == 60) {  // Play
                        updateTimeVars(DAY_INTERVAL);
                        gameParams.state = gameStates.STARTED;
                    }
                    else if (target.x == 100) {  // Fast Forward
                        updateTimeVars(DAY_INTERVAL / 2);
                        gameParams.state = gameStates.STARTED;
                    }
                    return true;
                }
                return false;
            }
        });        

        btnPause.setTouchEnabled(true);
        btnPause.setScale9Enabled(true);
        btnPause.loadTextures("res/icons_png/guard13007/originals/png/ffffff/transparent/pause-button.png", "", "");
        btnPause.attr({ x: 20, y: 20 });
        btnPause.setContentSize(cc.size(512, 512));
        btnPause.setScale(0.078125);
        cc.eventManager.addListener(actionsListener.clone(), btnPause);
        this.controlsBackground.addChild(btnPause, 100);
        
        btnPlay.setTouchEnabled(true);
        btnPlay.setScale9Enabled(true);
        btnPlay.loadTextures("res/icons_png/guard13007/originals/png/ffffff/transparent/play-button.png", "", "");
        btnPlay.attr({ x: 60, y: 20 });
        btnPlay.setContentSize(cc.size(512, 512));
        btnPlay.setScale(0.078125);
        cc.eventManager.addListener(actionsListener.clone(), btnPlay);
        this.controlsBackground.addChild(btnPlay, 100);
        
        btnFF.setTouchEnabled(true);
        btnFF.setScale9Enabled(true);
        btnFF.loadTextures("res/icons_png/delapouite/originals/png/ffffff/transparent/resize.png", "", "");
        btnFF.attr({ x: 100, y: 20 });
        btnFF.setContentSize(cc.size(512, 512));
        btnFF.setScale(0.078125);
        cc.eventManager.addListener(actionsListener.clone(), btnFF);
        this.controlsBackground.addChild(btnFF, 100);

        // Add tweet area
        this.tweetBackground = new cc.LayerColor(COLOR_BACKGROUND_TRANS, 600, 36);
        this.tweetBackground.setAnchorPoint(new cc.p(0,0));
        this.tweetBackground.attr({ x: (size.width / 2) - 300, y: size.height - 48 });
        this.addChild(this.tweetBackground, 100);

        this.tweetLabel = new cc.LabelTTF(scenarioData.name, FONT_FACE, 18);
        this.tweetLabel.attr({ x: 300, y: 18 });
        this.tweetLabel.color = new cc.Color(255, 255, 255, 0);
        this.tweetBackground.addChild(this.tweetLabel, 100);

        // Add dna
        this.dnaScoreBackground = new cc.LayerColor(COLOR_BACKGROUND_TRANS, 100, 36);
        this.dnaScoreBackground.setAnchorPoint(new cc.p(0,0));
        this.dnaScoreBackground.attr({ x: 10, y: 70 });
        this.addChild(this.dnaScoreBackground, 100);

        this.dnaScoreLabel = new cc.LabelTTF(RESOURCES_INITIAL, FONT_FACE, 18);
        this.dnaScoreLabel.attr({ x: 50, y: 18 });
        this.dnaScoreLabel.color = COLOR_FOREGROUND;
        this.dnaScoreBackground.addChild(this.dnaScoreLabel, 100);

        // add "World" layer
        this.worldBackground = new cc.LayerColor(cc.color.WHITE, size.width, size.height - Y_OFFSET);
        this.worldBackground.attr({ x: X_OFFSET, y: Y_OFFSET });
        this.addChild(this.worldBackground, 1);

        // add "World" background
        var worldSprite = new cc.Sprite(res.world_png);
        worldSprite.setAnchorPoint(new cc.p(0,0));
        worldSprite.attr({ x: 0, y: 0 });
        this.worldBackground.addChild(worldSprite, 0);

        // Add graticule to background
        var graticuleSprite = new cc.Sprite(res.grat_png);
        graticuleSprite.setAnchorPoint(new cc.p(0,0))
        graticuleSprite.attr({ x: 0, y: 0 });
        this.worldBackground.addChild(graticuleSprite, 1);

        // Add map
        this.map = cc.TMXTiledMap.create(res.world_tilemap_tmx);
        this.map.setAnchorPoint(new cc.p(0,0));
        this.map.attr({ x: 0, y: 0 });
        this.worldBackground.addChild(this.map, 2);
        tilelayer = this.map.getLayer("Tile Layer 1");

        // GLOBAL VARIABLES FOR DEBUGGING
        world = this;
        world.scenarioData = scenarioData;
        world.countryData = countryData;

        // Interaction handling
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            // Pan handling
            onMouseMove: function(event){
                if(event.getButton() == cc.EventMouse.BUTTON_LEFT){
                    var node = event.getCurrentTarget(); 
                    node.x += event.getDeltaX();
                    node.y += event.getDeltaY();
                }
            },
            // Zoom handling
            onMouseScroll: function(event){
                var node = event.getCurrentTarget(); 
                var delta = cc.sys.isNative ? event.getScrollY() * 6 : -event.getScrollY();
                node.setScale(node.getScale() * (1 + delta / 1000.0));
            }
        }, this.worldBackground);

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
                    gameParams.state = gameStates.PAUSED;
                    layer = new DesignPolicyLayer(world);
                    world.parent.addChild(layer);
                    world.setVisible(false);
                    return true;
                }
                return false;
            }
        });
    
        this.controlBackground = new cc.LayerColor(COLOR_BACKGROUND_TRANS, size.width, Y_OFFSET);
        this.controlBackground.setAnchorPoint(new cc.p(0,0));
        this.controlBackground.attr({ x: 0, y: 0 });
        this.addChild(this.controlBackground, 100);


        this.dnaSpend = cc.MenuItemLabel.create(cc.LabelTTF.create("POLICY", FONT_FACE, 24));
        this.dnaSpend.setAnchorPoint(new cc.p(0,0));
        this.dnaSpend.attr({ x: 10, y: 10 });
        this.controlBackground.addChild(this.dnaSpend);
    
        this.worldListener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {       
                    gameParams.state = gameStates.PAUSED;
                    layer = new StatsLayer(world);
                    world.parent.addChild(layer);
                    world.setVisible(false);
                    return true;
                }
                return false;
            }
        });
    
        this.worldStats = cc.MenuItemLabel.create(cc.LabelTTF.create("Statistics", FONT_FACE, 24));
        this.worldStats.setAnchorPoint(new cc.p(0,0));
        this.worldStats.attr({ x: 300, y: 10 });
        this.controlBackground.addChild(this.worldStats);

        var beginSim = function() {
            gameParams.state = gameStates.PREPARED;
            gameParams.startTime = Date.now();
        };

        ShowMessageBoxOK(world, world.scenarioData.popup_1_description, world.scenarioData.popup_1_title, function(that) {
            ShowMessageBoxOK(world, world.scenarioData.popup_2_description, world.scenarioData.popup_2_title, function(that) {
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
    
        var mappedTiles = {}, sortedKeys = {};
        var sortedObjs = world.map.objectGroups[0].getObjects().slice(0).sort(function(a, b) { 
            return (a.points[0].y * size.height + a.points[0].x) > (b.points[0].y * size.height + b.points[0].x);  
        });
        this.map.objectGroups[0].getObjects().forEach(function(obj, index) {
            sortedKeys[obj.name] = index;
        });

        // Generates min, max coordinates
        var generateCoords = function(points) {
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
            };
            return { minx: minx, miny: miny, maxx: maxx, maxy: maxy };
        };
        // Create country centroids
        var centroids = function(points) { 
            var totalX = 0, totalY = 0;
            points.forEach(function(pt) {
                totalX += parseFloat(pt.x);
                totalY += parseFloat(pt.y);
            });
            return { x: totalX / points.length, y: totalY / points.length }
        };
        // Gauss shoelace algorithm - https://gamedev.stackexchange.com/questions/151034/how-to-compute-the-area-of-an-irregular-shape
        var areas = function(points) { 
            var area = 0;
            for (var i = 0; i < points.length - 1; i++) {
                var pt1 = points[i];
                var pt2 = points[i+1];
                var xy1 = pt1.x * pt2.y;
                var xy2 = pt1.y * pt2.x;
                area += Math.abs(xy1 - xy2);
            }
            return area / 2;
        };
        world.countries = world.map.objectGroups[0].getObjects().reduce((map, obj) => (map[obj.name] = { 
            name: obj.name,
            centroid: centroids(obj.points),
            extremes: generateCoords(obj.points),
            area: areas(obj.points),
            points: obj.points,
            pop_est: obj.pop_est,
            gdp_est: obj.gdp_est,
            iso_a2: obj.iso_a2,
            iso_a3: obj.iso_a3,
            policy: 0,
            loss: 0,
            policyPoints: [],
            destructionPoints: []
            // Add other properties here
        }, map), {});
        world.areaMin = 0, world.areaMax = 0, world.areaMean = 0;
        world.areaMinCountry = "", world.areaMaxCountry = "";
        Object.keys(world.countries).forEach(function(c) {
            var country = world.countries[c];
            if (world.areaMin == 0 || world.areaMin > country.area) {
                world.areaMin = country.area;
                world.areaMinCountry = c;
            }
            if (world.areaMax < country.area) {
                world.areaMax = country.area;
                world.areaMaxCountry = c; 
            }
            world.areaMean += country.area;
        });
        world.areaMean /= Object.keys(world.countries).length;
        world.areaRatio = Math.floor(Math.log2(world.areaMax / world.areaMin));
        Object.keys(world.countries).forEach(function(c) {
            var country = world.countries[c];
            country.numPoints = Math.ceil(country.area / world.areaMean);
        });

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
        var currentCountry = null, currentCountryData = null;
        var lastLayerID = -1;

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
        
        var printDate = function(world) {
            // world.dayLabel.setString(gameParams.currentDate.getDate());
            world.monthLabel.setString((gameParams.currentDate.getMonth() + 1).toString());
            world.yearLabel.setString((gameParams.currentDate.getFullYear()).toString());
        };

        var generatePoint = function(points, coords) {
            var minx = coords.minx, miny = coords.miny, maxx = coords.maxx, maxy = coords.maxy;
            var testx = -1, testy = -1, k = 0, maxTries = 3;
            var cd = false;
            var p  = null;
            do {
                testx = minx + Math.floor(Math.random() * (maxx - minx));
                testy = miny + Math.floor(Math.random() * (maxy - miny));
                cd = collisionDetection(points, cc.p(testx, testy));
            } while (! cd && (k++) < maxTries);
            if (cd) {
                testy = (size.height - Y_OFFSET) - testy;
                p = cc.p(testx, testy); 
            }
            return p;
        };

        var generatePointsForCountry = function(country, points, min, max) {
            var coords = country.points;
            var extremes = country.extremes;

            min = Math.round(min);
            max = Math.round(max);
            if (min < 0 || max < 0)
                return;
            if (min > max) {
                points = points.slice(0, max - 1);
            }
            else {
                for (var j = min; j < max; j++) {
                    var numPoints = country.numPoints;
                    for (var k  = 0; k < numPoints; k++) {
                        var p = generatePoint(coords, extremes);
                        if (p != null && points.indexOf(p) === -1) {
                            points.push(p);
                        }
                    }
                }
            }
            return points;
        };
        var generatePoints = function() {
            for (var i = 0; i < Object.keys(world.countries).length; i++) {
                var country = world.countries[Object.keys(world.countries)[i]];
                var policy = country.policy;
                var destruction = country.destruction;
                country.policyPoints = generatePointsForCountry(country, country.policyPoints, 0, policy);
                country.destructionPoints = generatePointsForCountry(country, country.destructionPoints, 0, destruction);
            }
        };
        generatePoints();

        var genNormRand = function() {
            // Produce a random value from a normal distribution with a mean of 120.
            // var r = (Math.random() - 0.5) * 2.0;
            // var rr2 = (r * r) / 2.0;
            // return Math.round(20.0 + 100.0 * (0.5 + (r > 0 ? 1.0 : -1.0) * rr2));
            return 100.0;
        };
        var drawPoints = function() {
            if (typeof(world.renderer) !== "undefined")
                world.renderer.removeFromParent();
            world.renderer = addGLLayer(world);
            var drawNode = new cc.DrawNode();
            world.renderer.setOpacity(genNormRand());
            drawNode.setOpacity(genNormRand());
            for (var i = 0; i < Object.keys(world.countries).length; i++) {
                var country = world.countries[Object.keys(world.countries)[i]];
                world.renderer.begin();
                drawNode.retain();
                for (var j = 0; j < country.policyPoints.length; j++) {
                    var p = country.policyPoints[j];
                    // With dynamic alpha
                    // drawNode.drawDot(p, 3, cc.color(0.0, 255.0, 0.0, genNormRand()));
                    // With static alpha
                    drawNode.drawDot(p, 3, COLOR_POLICY_POINTS);
                }
                for (var j = 0; j < country.destructionPoints.length; j++) {
                    var p = country.destructionPoints[j];
                    // With dynamic alpha
                    // drawNode.drawDot(p, 3, cc.color(255.0, 0.0, 0.0, genNormRand()));
                    // With static alpha
                    drawNode.drawDot(p, 3, COLOR_DESTRUCTION_POINTS);
                }
                drawNode.visit();

                world.renderer.end();
                world.renderer.retain();
                drawNode.release();
            }
        };
        drawPoints();
        world.drawPoints = drawPoints;

        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                if (currentCountry != null && gameParams.startCountry == null && gameParams.state === gameStates.PREPARED) {
                    gameParams.startCountry = currentCountry;
                    gameParams.startCountryData = currentCountryData;
                }
                if (gameParams.startCountry != null && gameParams.state === gameStates.PREPARED) {
                    startGameParams();
                    printDate(world);

                    var buttons = [];
                                            
                    // Add chance of new resource
                    var addResource = function() {
                        var r = Math.random();
                        if (gameParams.counter - gameParams.lastResource >= gameParams.resourceInterval) {
                            if (r < RESOURCE_CHANCE) {
                                var btnRes = new ccui.Button();
                                btnRes.setTouchEnabled(true);
                                btnRes.setScale9Enabled(true);
                                btnRes.loadTextures("res/icons/delapouite/originals/svg/ffffff/transparent/banging-gavel.svg", "", "");
                                var ind = Math.floor(Math.random() * Object.keys(world.countries).length);
                                var countryRand = world.countries[Object.keys(world.countries)[ind]];
                                var pt = countryRand.centroid;
                                btnRes.attr({ x: pt.x, y: (size.height - Y_OFFSET) - pt.y });
                                btnRes.setContentSize(cc.size(RESOURCE_SIZE, RESOURCE_SIZE));
                                btnRes.setColor(COLOR_RESOURCE);
                                btnRes.placedAt = gameParams.counter;
                                cc.eventManager.addListener(resListener.clone(), btnRes);
                                world.worldBackground.addChild(btnRes, 101);
                                buttons.push(btnRes);
                            }
                            gameParams.lastResource = gameParams.counter;
                        }
                    };

                    // Evaluates policy robustness
                    var evaluatePolicy = function() {
                        var strategies = gameParams.strategies;
                        var policy = strategies.length * 0.01;
                        return policy;
                    };

                    // Evaluates loss
                    var evaluateLoss = function() {
                        var loss = gameParams.previousLoss;
                        loss *= (1 + gameParams.rateOfDecline);
                        return loss;
                    };
                    
                    // Updates the game state at regular intervals
                    var updateTime = function() {
                        if (gameParams.state == gameStates.STARTED) {

                            var d = gameParams.currentDate;
                            gameParams.counter++;
                            if (gameParams.counter % gameParams.timeInterval == 0) {
                                gameParams.currentDate = new Date(gameParams.currentDate.valueOf());
                                gameParams.currentDate.setDate(gameParams.currentDate.getDate() + gameParams.timeInterval);
                            }
                            
                            if (gameParams.counter % gameParams.resourceInterval == 0)
                                addResource();

                            var newButtons = [];
                            for (var i = 0; i < buttons.length; i++){
                                var button = buttons[i];
                                if (gameParams.counter > button.placedAt + RESOURCE_DURATION) {
                                    button.removeFromParent();
                                }
                                else {
                                    newButtons.push(button);
                                }
                            }
                            buttons = newButtons;
                            
                            // Update labels
                            world.dnaScoreLabel.setString(gameParams.resources);
                            printDate(world);

                            // Add policy robustness and loss
                            var totalPolicy = 0, totalLoss = 0;
                            var countryKeys = Object.keys(world.countries);
                            for (var j = 0; j < countryKeys.length; j++) {
                                var country = world.countries[countryKeys[j]];
                                var policy = evaluatePolicy();
                                var loss = evaluateLoss() / (1 + policy);
                                if (policy != 0 && country.policy <= 100 && country.policy >= 0) {
                                    country.policy += policy;
                                    generatePointsForCountry(country, country.policyPoints, country.policy - policy, country.policy);
                                }
                                if (loss != 0 && country.loss <= 100 && country.loss >= 0) {
                                    generatePointsForCountry(country, country.destructionPoints, country.loss, loss);
                                    country.loss = loss;
                                }
                                totalPolicy += country.policy;
                                totalLoss += country.loss;
                            }
                            totalPolicy /= countryKeys.length;
                            gameParams.policy = totalPolicy;

                            totalLoss /= countryKeys.length;
                            gameParams.previousLoss = totalLoss;
                            gameParams.destruction = totalLoss;
                            

                            drawPoints();

                            // Game over                        
                            if (gameParams.destruction >= 100) {
                                GameOver(world, "Game Over! The world lasted until " + gameParams.currentDate.getFullYear(), "OK");
                            }
                            else if (gameParams.currentDate.getFullYear() >= YEAR_TARGET) {
                                GameOver(world, "Game Over! You have sustained the world until " + YEAR_TARGET + "!", "OK");
                            }
                        }

                        // Refresh the timeout
                        gameParams.timeoutID = setTimeout(updateTime, gameParams.timeInterval);
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
                if (gameParams.state !== gameStates.PREPARED && gameParams.state !== gameStates.STARTED)
                    return;
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                // if (cc.Intersection.pointInPolygon(locationInNode, this.polygonCollider.world.points)) {
                // if (cc.rectContainsPoint(rect, locationInNode)) {
                if (true) {
                    // var x = parseInt(locationInNode.x / 32);
                    // var y = 24 - 1 - parseInt(locationInNode.y / 32);

                    // Simplifed
                    var x = 0;
                    var y = 0;

                    var layer = target.getLayer("Tile Layer 1");

                    gid = layer.getTileGIDAt(x, y);
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
                                currentCountryData = world.countryData[poly.name];
                                console.log(poly.name +": " + currentCountryData.POP_EST);
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

var WorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var scene = this;

        // Add country data 
        cc.loader.loadJson("res/countryData.json",function(error, data){
            countryData = {}; 
            data.forEach(function(d) { countryData[d["ISO_A3"]] = d; });
            cc.loader.loadJson("res/scenario-nature.json",function(error, scenarioData){
                var layer = new WorldLayer(scenarioData, countryData);
                scene.addChild(layer);
            });
        });
    }
});


var LoadingScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var layer = this;
        var size = cc.winSize;

        var layBackground = new cc.LayerColor(COLOR_BACKGROUND, size.width, size.height);
        layBackground.attr({ x: 0, y: 0 });
        layer.addChild(layBackground, 1);
        
        var playLabel = new cc.LabelTTF("Play", FONT_FACE, 38);
        playLabel.attr({x: size.width * 0.5, y: size.height * 0.6});
        playLabel.setFontFillColor(COLOR_FOREGROUND);
        layBackground.addChild(playLabel);

        var howToPlayLabel = new cc.LabelTTF("How to Play", FONT_FACE, 38);
        howToPlayLabel.attr({x: size.width * 0.5, y: size.height * 0.5});
        howToPlayLabel.setFontFillColor(COLOR_FOREGROUND);
        layBackground.addChild(howToPlayLabel);

        var progressLabel = new cc.LabelTTF("Progress", FONT_FACE, 38);
        progressLabel.attr({x: size.width * 0.5, y: size.height * 0.4});
        progressLabel.setFontFillColor(COLOR_FOREGROUND);
        layBackground.addChild(progressLabel);

        var listenerPlay = cc.EventListener.create({
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

        var listenerDoNothing = cc.EventListener.create({
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

        cc.eventManager.addListener(listenerPlay, playLabel);
        cc.eventManager.addListener(listenerDoNothing.clone(), howToPlayLabel);
        cc.eventManager.addListener(listenerDoNothing.clone(), progressLabel);
    }
});


var NewGameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var layer = this;
        var size = cc.winSize;

        var layBackground = new cc.LayerColor(COLOR_BACKGROUND, size.width, size.height);
        layBackground.attr({ x: 0, y: 0 });
        layer.addChild(layBackground, 1);

        var newLabel = new cc.LabelTTF("New Game", FONT_FACE, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.8})
        this.addChild(newLabel);

        var loadLabel = new cc.LabelTTF("Load Game", FONT_FACE, 38);
        loadLabel.attr({x: size.width * 0.5, y: size.height * 0.4})
        this.addChild(loadLabel);


        var listener1 = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());    
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {       
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
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.4})
        this.addChild(newLabel);

        var waterLabel = new cc.LabelTTF("Water Challenge", FONT_FACE, 38);
        waterLabel.attr({x: size.width * 0.5, y: size.height * 0.4})
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

        var layer = this;
        var size = cc.winSize;

        var layBackground = new cc.LayerColor(COLOR_BACKGROUND, size.width, size.height);
        layBackground.attr({ x: 0, y: 0 });
        layer.addChild(layBackground, 1);

        var newLabel = new cc.LabelTTF("Select a game difficulty", FONT_FACE, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.8})
        this.addChild(newLabel);

        var casualLabel = new cc.LabelTTF("Casual", FONT_FACE, 38);
        casualLabel.attr({x: size.width * 0.25, y: size.height * 0.5})
        this.addChild(casualLabel);

        var normalLabel = new cc.LabelTTF("Normal", FONT_FACE, 38);
        normalLabel.attr({x: size.width * 0.5, y: size.height * 0.5})
        this.addChild(normalLabel);

        var brutalLabel = new cc.LabelTTF("Brutal", FONT_FACE, 38);
        brutalLabel.attr({x: size.width * 0.75, y: size.height * 0.5})
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

        var newLabel = new cc.LabelTTF("Enter a name for your policy", FONT_FACE, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.8});
        this.addChild(newLabel);

        var enterNameLabel = new cc.LabelTTF("Just click for now", FONT_FACE, 38);
        enterNameLabel.attr({x: size.width * 0.5, y: size.height * 0.5});
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
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.8})
        this.addChild(newLabel);


        var modifyCodeLabel = new cc.LabelTTF("Just click for now", FONT_FACE, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.5})
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


var DesignPolicyLayer = cc.Layer.extend({
    ctor:function (world) {
        this._super();
        this.world = world;
    },
    onEnter:function () {
        this._super();

        var layer = this;
        var size = cc.winSize;

        var layBackground = new cc.LayerColor(COLOR_ICE, size.width, size.height);
        layBackground.attr({ x: 0, y: 0 });
        layer.addChild(layBackground, 1);

        var heading = new ccui.Text("Build a Policy Platform", FONT_FACE, 38);
        heading.attr({x: size.width * 0.5, y: size.height * 0.9});
        heading.setColor(COLOR_LICORICE);
        layer.addChild(heading, 101);

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
                        layer.availableResourcesLabel.setString(gameParams.resources.toString());
                    }
                    return true;
                }
                return false;
            }
        });

        var pageView = new ccui.PageView();
        pageView.setContentSize(cc.size(size.width, size.height - Y_OFFSET));
        pageView.setAnchorPoint(cc.p(0, 0));
        pageView.setPosition(cc.p(X_OFFSET, Y_OFFSET));
        var pageCount = 4;
       
        for (var i = 0; i < pageCount; ++i) {
            var layout = new ccui.Layout();
            layout.setContentSize(cc.size(layout.getContentSize().width * 0.5, layout.getContentSize().height * 0.5));

            var labelText = "Economy";
            var policyOptions = [];
            switch(i) {
                case 0: 
                    labelText = "Design your Economic Policy";
                    policyOptions = [ {
                        text: "Reduce Inequality", 
                        location: {x: 200, y: 100},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/histogram.svg",
                        cost: 3
                    },
                    {
                        text: "Free Trade Agreements", 
                        location: {x: 200, y: 500},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/bank.svg",
                        cost: 3
                    },
                    {
                        text: "Remove Regulations", 
                        location: {x: 600, y: 100},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/fire-spell-cast.svg",
                        cost: 3
                    },
                    {
                        text: "Automate Industry", 
                        location: {x: 600, y: 500},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/robot-antennas.svg",
                        cost: 3
                    } ];
                    break;
                case 1: 
                    labelText = "Design your Political Policy";
                    policyOptions = [ {
                        text: "Global Treaties", 
                        location: {x: 200, y: 100},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/hand-ok.svg",
                        cost: 3
                    },
                    {
                        text: "Diplomacy", 
                        location: {x: 200, y: 500},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/smartphone.svg",
                        cost: 3
                    },
                    {
                        text: "Boost Military", 
                        location: {x: 600, y: 100},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/3d-hammer.svg",
                        cost: 3
                    },
                    {
                        text: "Promote Democracy", 
                        location: {x: 600, y: 500},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/microphone.svg",
                        cost: 3
                    } ];
                    break;
                case 2: 
                    labelText = "Design your Cultural Policy";
                    policyOptions = [ {
                        text: "Global Education", 
                        location: {x: 200, y: 100},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/teacher.svg",
                        cost: 3
                    },
                    {
                        text: "Social Media", 
                        location: {x: 200, y: 500},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/megaphone.svg",
                        cost: 3
                    },
                    {
                        text: "Celebrity Endorsements", 
                        location: {x: 600, y: 100},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/person.svg",
                        cost: 3
                    },
                    {
                        text: "Global Festivals", 
                        location: {x: 600, y: 500},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/party-flags.svg",
                        cost: 3
                    } ];
                    break;
                case 3: 
                    labelText = "Design your Ecological Policy";
                    policyOptions = [ {
                        text: "Green Cities", 
                        location: {x: 200, y: 100},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/modern-city.svg",
                        cost: 3
                    },
                    {
                        text: "Fund Renewable Energy", 
                        location: {x: 200, y: 500},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/solar-system.svg",
                        cost: 3
                    },
                    {
                        text: "Global Heritage Trust", 
                        location: {x: 600, y: 100},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/ecology.svg",
                        cost: 3
                    },
                    {
                        text: "Public Transport", 
                        location: {x: 600, y: 500},
                        img: "res/icons/delapouite/originals/svg/ffffff/transparent/bus.svg",
                        cost: 3
                    } ];
                    break;
            }
            var label = new ccui.Text(labelText, FONT_FACE, 30);
            label.setColor(COLOR_UMBER);
            label.setAnchorPoint(cc.p(0, 0));
            label.setPosition(cc.p(100, pageView.getContentSize().height * 0.8));
            layout.addChild(label);

            policyOptions.forEach(function(opt) {
                var btn = new ccui.Button();
                btn.setTouchEnabled(true);
                btn.setAnchorPoint(cc.p(0, 0));
                btn.setScale9Enabled(true);
                btn.loadTextures(opt.img, "", "");
                btn.attr(opt.location);
                btn.setContentSize(cc.size(60, 60));
                btn.setColor(COLOR_RESOURCE);
                btn.setTitleFontSize(20);
                btn.setTitleFontName(FONT_FACE);
                // btn.setTitleColor(new cc.Color(214, 225, 227, 255));
                //new cc.Color(214, 225, 227, 255)
                btn.setTitleColor(COLOR_LICORICE);
                btn.setTitleText(opt.text);
                btn.cost = opt.cost;
                btn.strategy = opt.text;
                cc.eventManager.addListener(resourceListener.clone(), btn);
                layout.addChild(btn, 101);
            });
    
            pageView.insertPage(layout, i);
        }
        layer.addChild(pageView, 100);
        pageView.setCurrentPageIndex(0);

        //add buttons to jump to specific page
        var makeButton = function(text, point, index) {
            var btn = new ccui.Button();
            btn.setAnchorPoint(cc.p(0, 0));
            btn.setColor(COLOR_UMBER);
            btn.setPosition(point);
            btn.setTitleText(text);
            btn.addClickEventListener(function(){
                pageView.setCurrentPageIndex(index);
            });
            layer.addChild(btn, 100);
        };
        makeButton("Economy", cc.p(200, 20), 0);
        makeButton("Politics", cc.p(400, 20), 1);
        makeButton("Culture", cc.p(600, 20), 2);
        makeButton("Ecology", cc.p(800, 20), 3);

        var btn = new ccui.Button();
        btn.setAnchorPoint(cc.p(0, 0));
        btn.setPosition(cc.p(950, 20));
        btn.setColor(COLOR_LICORICE);
        btn.setTitleText("X");
        btn.addClickEventListener(function(){
            layer.removeFromParent();
            world.setVisible(true);
            gameParams.state = gameStates.STARTED;
        });
        layer.addChild(btn, 100);

        this.resourcesLabel = new cc.LabelTTF("Resources:", FONT_FACE, 18);
        this.resourcesLabel.setAnchorPoint(cc.p(0, 0));
        this.resourcesLabel.setPosition(cc.p(20, 20));
        this.resourcesLabel.setColor(COLOR_LICORICE);
        layer.addChild(this.resourcesLabel, 100);

        this.availableResourcesLabel = new cc.LabelTTF(gameParams.resources.toString(), FONT_FACE, 18);
        this.availableResourcesLabel.setAnchorPoint(cc.p(0, 0));
        this.availableResourcesLabel.setPosition(cc.p(120, 20));
        this.availableResourcesLabel.setColor(COLOR_LICORICE);
        layer.addChild(this.availableResourcesLabel, 100);
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

        var layerBackground = new cc.LayerColor(COLOR_BACKGROUND, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        layer.addChild(layerBackground, 100);

        var heading = new cc.LabelTTF("Statistics", FONT_FACE, 38);
        heading.attr({x: size.width * 0.5, y: size.height * 0.8});
        layerBackground.addChild(heading, 101);

        var makeString = function(num) { return (Math.round(num * 10) / 10).toString() + '%'; };

        this.policyLabel = new cc.LabelTTF("Policy Effectiveness: ", FONT_FACE, 24);
        this.policyLabel.setAnchorPoint(cc.p(0, 0));
        this.policyLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.6));
        layerBackground.addChild(this.policyLabel, 100);

        this.policyIndicatorLabel = new cc.LabelTTF(makeString(gameParams.policy), FONT_FACE, 24);
        this.policyIndicatorLabel.setAnchorPoint(cc.p(0, 0));
        this.policyIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.6));
        layerBackground.addChild(this.policyIndicatorLabel, 100);

        this.destructionLabel = new cc.LabelTTF("World Destruction:", FONT_FACE, 24);
        this.destructionLabel.setAnchorPoint(cc.p(0, 0));
        this.destructionLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.4));
        layerBackground.addChild(this.destructionLabel, 100);

        this.destructionIndicatorLabel = new cc.LabelTTF(makeString(gameParams.destruction), FONT_FACE, 24);
        this.destructionIndicatorLabel.setAnchorPoint(cc.p(0, 0));
        this.destructionIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.4));
        layerBackground.addChild(this.destructionIndicatorLabel, 100);

        var btn = new ccui.Button();
        btn.setAnchorPoint(cc.p(0, 0));
        btn.setPosition(cc.p(950, 20));
        btn.setTitleText("X");
        btn.addClickEventListener(function(){
            layer.removeFromParent();
            world.setVisible(true);
            gameParams.state = gameStates.STARTED;
        });
        layerBackground.addChild(btn, 100);

    }
});

