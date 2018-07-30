
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
var SUSTAINABILITY_TARGET = 2000.0;
var TAG_SPRITE_BATCH_NODE = 1;

// Game variables
var gameParams = {};
var gameStates = {
    INITIALISED: 0,
    PREPARED: 1,
    STARTED: 2,
    PAUSED: 3,
    GAME_OVER: 5
};

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
    gameParams.targetDate = new Date(Date.now());
    gameParams.targetDate.setDate(1);
    gameParams.targetDate.setMonth(scenarioData.target_month);
    gameParams.targetDate.setYear(scenarioData.target_year);
    gameParams.currentDate = gameParams.startDate;
    gameParams.counter = 0;
    gameParams.lastResource = 0;
    gameParams.strategies = [];
    gameParams.policy = 0;
    gameParams.resources = scenarioData.starting_resources;
    gameParams.destruction = scenarioData.threat_details.starting_conditions.starting_destruction;
    gameParams.previousLoss = scenarioData.threat_details.starting_conditions.starting_degradation;
    gameParams.rateOfDecline = scenarioData.threat_details.advanced_stats.destruction_increase_speed;
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
    console.log(interval);
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
 * Add texture for country virus
 * @param {*} world 
 */
var addGLLayer_withShader = function(world) {
    var winSize = cc.director.getWinSize();
    var rend = new cc.RenderTexture(winSize.width, winSize.height, cc.Texture2D.PIXEL_FORMAT_RGBA4444, gl.DEPTH24_STENCIL8_OES);
    if( 'opengl' in cc.sys.capabilities ) {
        //var glnode = new cc.GLNode();
        var shaderNode = new ShaderNode("res/Shaders/example_ColorBars.vsh", "res/Shaders/example_ColorBars.fsh");
        this.addChild(shaderNode,10);
        shaderNode.x = winSize.width/2;
        shaderNode.y = winSize.height/2;
    }
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

    ctor:function (scenarioData) {
        this._super();

        initGameParams(scenarioData);     

        var size = cc.winSize;

        var layerBackground = new cc.LayerColor(cc.color.WHITE, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        this.addChild(layerBackground, 0);

        // Add controls
        this.controlsBackground = new cc.LayerColor(COLOR_BACKGROUND_TRANS, 126, 72);
        this.controlsBackground.setAnchorPoint(cc.p(0,0));
        this.controlsBackground.x = size.width - 138;
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
                    if (target == btnPause) {  // Pause
                        gameParams.state = gameStates.PAUSED;
                        btnPause.enabled = false;
                        btnPlay.enabled = true;
                        btnFF.enabled = true;
                    }
                    else if (target == btnPlay) {  // Play
                        updateTimeVars(DAY_INTERVAL);
                        gameParams.state = gameStates.STARTED;
                        btnPause.enabled = true;
                        btnPlay.enabled = false;
                        btnFF.enabled = true;
                    }
                    else if (target == btnFF) {  // Fast Forward
                        updateTimeVars(DAY_INTERVAL / 10);
                        gameParams.state = gameStates.STARTED;
                        btnPause.enabled = true;
                        btnPlay.enabled = true;
                        btnFF.enabled = false;
                    }
                    return true;
                }
                return false;
            }
        });        

        btnPause.setTouchEnabled(true);
        btnPause.setScale9Enabled(true);
        btnPause.loadTextures("res/andrea_png/BUTTONS/BUTTON_PAUSE_NORMAL.png", "", "res/andrea_png/BUTTONS/BUTTON_PAUSE_ON.png");
        btnPause.attr({ x: 21, y: 21 });
        btnPause.setContentSize(cc.size(105, 105));
        btnPause.setScale(0.4);
        cc.eventManager.addListener(actionsListener.clone(), btnPause);
        this.controlsBackground.addChild(btnPause, 100, "pause");
        
        btnPlay.setTouchEnabled(true);
        btnPlay.setScale9Enabled(true);
        btnPlay.loadTextures("res/andrea_png/BUTTONS/BUTTON_PLAY_NORMAL.png", "", "res/andrea_png/BUTTONS/BUTTON_PLAY_ON.png");
        btnPlay.attr({ x: 62, y: 21 });
        btnPlay.setContentSize(cc.size(105, 105));
        btnPlay.setScale(0.4);
        cc.eventManager.addListener(actionsListener.clone(), btnPlay);
        this.controlsBackground.addChild(btnPlay, 100, "play");
        
        btnFF.setTouchEnabled(true);
        btnFF.setScale9Enabled(true);
        btnFF.loadTextures("res/andrea_png/BUTTONS/BUTTON_PLAYFAST_NORMAL.png", "", "res/andrea_png/BUTTONS/BUTTON_PLAYFAST_ON.png");
        btnFF.attr({ x: 103, y: 21 });
        btnFF.setContentSize(cc.size(105, 105));
        btnFF.setScale(0.4);
        cc.eventManager.addListener(actionsListener.clone(), btnFF);
        this.controlsBackground.addChild(btnFF, 100, "fast");

        btnPause.enabled = false;
        btnPlay.enabled = false;
        btnFF.enabled = false;

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

        this.dnaScoreLabel = new cc.LabelTTF(gameParams.resources, FONT_FACE, 18);
        this.dnaScoreLabel.attr({ x: 50, y: 18 });
        this.dnaScoreLabel.color = COLOR_FOREGROUND;
        this.dnaScoreBackground.addChild(this.dnaScoreLabel, 100);

        // add "World" background layer
        this.spriteBackground = new cc.LayerColor(cc.color.WHITE, size.width, size.height - Y_OFFSET);
        this.spriteBackground.attr({ x: X_OFFSET, y: Y_OFFSET });
        this.addChild(this.spriteBackground, 1);

        var dotSpriteBatch = new cc.SpriteBatchNode(res.dot_png, 1000);
        dotSpriteBatch.setAnchorPoint(new cc.p(0,0));
        dotSpriteBatch.attr({ x: 0, y: 0 });
        this.spriteBackground.addChild(dotSpriteBatch, 100, TAG_SPRITE_BATCH_NODE);

        // add "World" background layer
        this.worldBackground = new cc.LayerColor(cc.color.WHITE, size.width, size.height - Y_OFFSET);
        this.worldBackground.attr({ x: X_OFFSET, y: Y_OFFSET });
        this.addChild(this.worldBackground, 1);

        var worldSprite = new cc.Sprite(res.world_png);
        worldSprite.setAnchorPoint(new cc.p(0,0));
        worldSprite.attr({ x: 0, y: 0 });
        // this.worldBackground.addChild(worldSprite, 0);

        // Add graticule to background
        var graticuleSprite = new cc.Sprite(res.grat_png);
        graticuleSprite.setAnchorPoint(new cc.p(0,0))
        graticuleSprite.attr({ x: 0, y: 0 });
        // this.worldBackground.addChild(graticuleSprite, 1);

        // Add map
        this.map = cc.TMXTiledMap.create(res.world_tilemap_tmx);
        this.map.setAnchorPoint(new cc.p(0,0));
        this.map.attr({ x: 0, y: 0 });
        this.worldBackground.addChild(this.map, 2);
        tilelayer = this.map.getLayer("Tile Layer 1");

        // GLOBAL VARIABLES FOR DEBUGGING
        world = this;
        world.scenarioData = scenarioData;

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
        // Stereographic projection - 0.9
        // for (var i = 0; i < 160; i++) {
        // Stereographic projection - 0.1
        // for (var i = 0; i < 166; i++) {
        // 50m Stereographic projection - 0.0
        for (var i = 0; i < 225; i++) {
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

        var addEmitter = function () {
            world._emitter = new cc.ParticleRain();
            world.worldBackground.addChild(world._emitter, 110);
    
            world._emitter.life = 4;
    
            world._emitter.texture = cc.textureCache.addImage("res/Images/fire.png");
            world._emitter.shapeType = cc.ParticleSystem.BALL_SHAPE;

            var sourcePos = world._emitter.getSourcePosition();
            if (sourcePos.x === 0 && sourcePos.y === 0)
                world._emitter.x = cc.director.getWinSize().width / 2;
                world._emitter.y = cc.director.getWinSize().height / 2 - 50;
        };

        var beginSim = function() {
            gameParams.state = gameStates.PREPARED;

            // Add particle emitter
            //addEmitter();
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

        var collisionDetection = function(points,test) {
            var crossed = false;
            var times = 0;
            // Double check the detection is within the widest bounds
            var maxx = Math.max(...points.map(p => parseInt(p.x)));
            for (var i = 0; i < points.length; i++) {
                var p1 = points[i];
                var p2 = (i == points.length - 1) ? points[0] : points[i+1];
                var x1 = parseFloat(p1.x), y1 = parseFloat(p1.y), x2 = parseFloat(p2.x), y2 = parseFloat(p2.y);
                if ((y1 < test.y && y2 >= test.y) || (y1 > test.y && y2 <= test.y)) {
                    if ((x1 + x2) / 2.0 < test.x && test.x < maxx) {
                        times++;
                        crossed = !crossed;
                    }
                }
            }
            return crossed;
        };
    
        var mappedTiles = {};

        // Sorts objects by their relative screen position, to avoid overlapping tiles
        var sortedObjs = world.map.objectGroups[0].getObjects().slice(0).sort(function(a, b) { 
            return (a.points[0].y * size.height + a.points[0].x) > (b.points[0].y * size.height + b.points[0].x);  
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
        world.countries = world.map.objectGroups[0].getObjects().reduce(function(map, obj) {  
            if (!map[obj.name]) {
                map[obj.name] = {
                    name: obj.NAME,
                    centroid: centroids(obj.points),
                    extremes: generateCoords(obj.points),
                    area: areas(obj.points),
                    points: obj.points,
                    pop_est: obj.POP_EST,
                    gdp_est: obj.GDP_MD_EST,
                    gid: obj.GID,
                    iso_a2: obj.ISO_A2,
                    iso_a3: obj.ISO_A3,
                    subregion: obj.SUBREGION,
                    economy: obj.ECONOMY,
                    income_grp: obj.INCOME_GRP,
                    equator_dist: obj.EQUATOR_DIST,
                    policy: 0,
                    loss: 0,
                    policyPoints: [],
                    policyDots: [],
                    destructionPoints: [],
                    destructionDots: []    
                };
            } 
            return map; 
        }, {});

        // Add proportion of main land mass with shared borders
        /*
        var countryKeys = Object.keys(world.countries);
        for (var i = 0; i < countryKeys.length; i++) {
            var c1 = world.countries[countryKeys[i]];
            var counter = 0;
            var matches = 0;
            var neighbours = [];
            for (var j = 0; j < countryKeys.length; j++) {
                if (i == j)
                    continue;
                var c2 = world.countries[countryKeys[j]];
                for (var k = 0; k < c1.points.length; k++) {
                    for (var l = 0; l < c2.points.length; l++) {
                        var p1 = c1.points[k];
                        var p2 = c2.points[l];
                        if (p1[0] == p2[0] && p1[1] == p2[1]) {
                            matches++;
                            if (neighbours.indexOf(countryKeys[j]) == -1) 
                                neighbours.push(countryKeys[j]);
                        }
                        counter++;
                    }
                }
            }
            c1.landmassProportion = matches / counter;
            c1.neighbours = neighbours;
        }
        */

        // Add population density
        Object.keys(world.countries).forEach(c => { 
            var country = world.countries[c];
            country.density = country.pop_est / country.area;
        } );
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

        var generatePointsForCountry = function(country, policy, min, max) {
            var batchNode = world.spriteBackground.getChildByTag(TAG_SPRITE_BATCH_NODE);
            var coords = country.points;
            var points = []; //country.policyPoints;
            var dots = []; //country.policyDots;
            if (policy) {
                points = country.policyPoints;
                dots = country.policyDots;
            }
            else {
                points = country.destructionPoints;
                dots = country.destructionDots;
            }
            var extremes = country.extremes;

            min = Math.round(min);
            max = Math.round(max);
            if (min < 0 || max < 0)
                return;
            if (min > max) {
                // Sprite-based dots
                /*
                for (var i = max; i < min; i++) {
                    var sprite = dots[i];
                    if (sprite != null)
                        sprite.removeFromParent();
                }
                */
                points = points.slice(0, max - 1);
            }
            else {
                for (var j = min; j < max; j++) {
                    var numPoints = country.numPoints;
                    for (var k  = 0; k < numPoints; k++) {
                        var p = generatePoint(coords, extremes);
                        if (p != null && points.indexOf(p) === -1) {
                            /*
                            // Sprite-based dots
                            var sprite = new cc.Sprite(batchNode.texture, cc.rect(0, 0, 60, 60));
                            //sprite.setScale(0.1);
                            if (policy) {
                                sprite.setColor(new cc.Color(0, 255, 0));
                            }
                            else {
                                sprite.setColor(new cc.Color(255, 0, 0));
                            }
                            // sprite.attr({x: p.x, y: p.y});
                            sprite.setAnchorPoint(cc.p(0, 0));
                            sprite.setPosition(p);

                            batchNode.addChild(sprite, 1);
                            dots.push(sprite);
                            */
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
                country.policyPoints = generatePointsForCountry(country, true, 0, country.policy);
                country.destructionPoints = generatePointsForCountry(country, false, 0, country.destruction);
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

            var rend = new cc.RenderTexture(size.width, size.height, cc.Texture2D.PIXEL_FORMAT_RGBA4444, gl.DEPTH24_STENCIL8_OES);
            rend.setPosition(size.width/2,size.height/2);
            world.worldBackground.addChild(rend, 99);
            world.renderer = rend;
            world.renderer.setOpacity(genNormRand());

            var drawNode = new cc.DrawNode();
            drawNode.setOpacity(genNormRand());
            var dots = [];
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
                // dots.push(drawNode);
                drawNode.visit();

                world.renderer.end();
                world.renderer.retain();
                drawNode.release();
            }
            // world.renderer.begin();
            // for (var i = 0; i < dots.length; i++) {
            //     var dot = dots[i];
            //     dot.visit();
            // }
            // world.renderer.end();
            // world.renderer.retain();
        };
        drawPoints();
        world.drawPoints = drawPoints;

        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseUp : function(event) {
                if (currentCountry != null && gameParams.startCountry == null && gameParams.state === gameStates.PREPARED) {
                    gameParams.startCountry = currentCountry;
                    gameParams.currentCountry = currentCountry;
                }
                if (currentCountry != null && gameParams.state === gameStates.STARTED) {
                    gameParams.currentCountry = currentCountry;
                    var country = world.countries[currentCountry];
                    console.log(country.name +": " + country.pop_est);
                }
                if (gameParams.startCountry != null && gameParams.state === gameStates.PREPARED) {
                    var country = world.countries[currentCountry];
                    country.policy = 1.0;
                    startGameParams();
                    printDate(world);

                    world.controlsBackground.getChildByName('pause').enabled = true;
                    world.controlsBackground.getChildByName('play').enabled = true;
                    world.controlsBackground.getChildByName('fast').enabled = true;

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
                    var evaluatePolicy = function(country) {
                        var strategies = gameParams.strategies;
                        var policy = strategies.length * 0.01;
                        policy *= country.policy;
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
                                gameParams.currentDate.setDate(gameParams.currentDate.getDate() + 30.417);

                                // Add policy robustness and loss
                                var totalPolicy = 0, totalLoss = 0;
                                var countryKeys = Object.keys(world.countries);
                                for (var j = 0; j < countryKeys.length; j++) {
                                    var country = world.countries[countryKeys[j]];
                                    var policy = evaluatePolicy(country);
                                    var loss = evaluateLoss() / (1 + policy);
                                    if (policy != 0 && country.policy <= 100 && country.policy >= 0) {
                                        country.policy += policy;
                                        generatePointsForCountry(country, true, country.policy - policy, country.policy);
                                    }
                                    if (loss != 0 && country.loss <= 100 && country.loss >= 0) {
                                        generatePointsForCountry(country, false, country.loss, loss);
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


                            // Game over                        
                            if (gameParams.destruction >= 100) {
                                GameOver(world, "Game Over! The world lasted until " + gameParams.currentDate.getFullYear(), "OK");
                            }
                            // else if (gameParams.currentDate.getFullYear() >= YEAR_TARGET) {
                            else if (gameParams.currentDate >= gameParams.targetDate) {
                                GameOver(world, "Game Over! You have sustained the world until " + gameParams.targetDate.getFullYear() + "!", "OK");
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
                var x = 0, y = 0;

                var layer = target.getLayer("Tile Layer 1");
                gid = layer.getTileGIDAt(x, y);
                if (typeof(layer._texGrids) !== "undefined" && typeof(layer._texGrids[gid]) === "undefined")
                    return;

                var start = 0, end = sortedObjs.length;
                if (lastLayerID > -1) {
                    start = (start < 0) ? 0 : start;
                    end = (end > sortedObjs.length) ? sortedObjs.length : end;
                };

                var ed = function(pt1, pt2) {
                    return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
                };
                var minED = -1, selectedCountry = null;
                for (var j = start; j < end; j++) {
                    var poly = sortedObjs[j];
                    var mousePoint = new cc.p(locationInNode.x - poly.x, size.height - locationInNode.y - (size.height - poly.y));
                    var cd = collisionDetection(poly.points, mousePoint);
                    if (cd) {
                        lastLayerID = j;
                        var countryObj = world.countries[poly.name];
                        var ced = ed(countryObj.centroid, mousePoint);
                        if (minED === -1 || ced < minED) {
                            minED = ced;
                            selectedCountry = poly.name;
                        }
                    }
                }

                // Pick the match with the closest centroid ID
                var currentLayer = null;
                if (selectedCountry != null) {
                    currentCountry = selectedCountry;
                    var gid = world.countries[selectedCountry].gid;
                    currentLayer = target.getLayer("Tile Layer " + gid);
                    currentLayer.setTileGID((gid),cc.p(0, 0));
                }
                oldLayers.forEach(layer => {
                    if (currentLayer === null || layer != currentLayer)
                        layer.setTileGID((0),cc.p(0,0));
                });
                oldLayers = [];
                if (currentLayer != null)
                    oldLayers.push(currentLayer);

                return true;
            }
        }, this.map);
    }
});

var WorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var scene = this;

        // Add country data 
        cc.loader.loadJson("res/scenario-nature.json",function(error, scenarioData){
            var layer = new WorldLayer(scenarioData);
            scene.addChild(layer);
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
                    if (gameParams.resources - target.cost > 0 && 
                        gameParams.strategies.indexOf(target.strategy) == -1) {
                        gameParams.resources -= target.cost;  
                        gameParams.strategies.push(target.strategy);
                        target.enabled = false;
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

            var resourceGrp = {};
            var labelText = "Economy";
            var policyOptions = [];
            switch(i) {
                case 0: 
                    resourceGrp = RESOURCES.economic;
                    break;
                case 1: 
                    resourceGrp = RESOURCES.politics;
                break;
                case 2: 
                    resourceGrp = RESOURCES.cultural;
                break;
                case 3: 
                    resourceGrp = RESOURCES.ecology;
                    break;
            }
            var label = new ccui.Text(resourceGrp.labelText, FONT_FACE, 30);
            label.setColor(COLOR_UMBER);
            label.setAnchorPoint(cc.p(0, 0));
            label.setPosition(cc.p(100, pageView.getContentSize().height * 0.8));
            layout.addChild(label);

            resourceGrp.policyOptions.forEach(function(opt) {
                var btn = new ccui.Button();
                btn.setTouchEnabled(true);
                btn.setAnchorPoint(cc.p(0, 0));
                btn.setScale9Enabled(true);
                btn.loadTextures(opt.img_normal, "", opt.img_on);
                btn.attr(opt.location);
                btn.setContentSize(cc.size(60, 60));
                btn.setTitleFontSize(20);
                btn.setTitleFontName(FONT_FACE);
                // btn.setTitleColor(new cc.Color(214, 225, 227, 255));
                //new cc.Color(214, 225, 227, 255)
                btn.setTitleColor(COLOR_LICORICE);
                btn.setTitleText(opt.text);
                btn.cost = opt.cost;
                btn.strategy = opt.text;
                if (gameParams.strategies.indexOf(opt.text) > -1)
                    btn.enabled = false;
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
        heading.attr({x: size.width * 0.5, y: size.height * 0.9});
        layerBackground.addChild(heading, 101);

        var makeString = function(num) { return (Math.round(num * 10) / 10).toString() + '%'; };

        this.policyLabel = new cc.LabelTTF("Policy Effectiveness: ", FONT_FACE, 24);
        this.policyLabel.setAnchorPoint(cc.p(0, 0));
        this.policyLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.8));
        layerBackground.addChild(this.policyLabel, 100);

        this.policyIndicatorLabel = new cc.LabelTTF(makeString(gameParams.policy), FONT_FACE, 24);
        this.policyIndicatorLabel.setAnchorPoint(cc.p(0, 0));
        this.policyIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.8));
        layerBackground.addChild(this.policyIndicatorLabel, 100);

        this.destructionLabel = new cc.LabelTTF("World Destruction:", FONT_FACE, 24);
        this.destructionLabel.setAnchorPoint(cc.p(0, 0));
        this.destructionLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.7));
        layerBackground.addChild(this.destructionLabel, 100);

        this.destructionIndicatorLabel = new cc.LabelTTF(makeString(gameParams.destruction), FONT_FACE, 24);
        this.destructionIndicatorLabel.setAnchorPoint(cc.p(0, 0));
        this.destructionIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.7));
        layerBackground.addChild(this.destructionIndicatorLabel, 100);

        // Country details
        if (gameParams.currentCountry !== null) {
            var country = world.countries[gameParams.currentCountry];
            this.currentCountryLabel = new cc.LabelTTF("Selected Country: ", FONT_FACE, 24);
            this.currentCountryLabel.setAnchorPoint(cc.p(0, 0));
            this.currentCountryLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.6));
            layerBackground.addChild(this.currentCountryLabel, 100);
    
            this.currentCountryIndicatorLabel = new cc.LabelTTF(country.name, FONT_FACE, 24);
            this.currentCountryIndicatorLabel.setAnchorPoint(cc.p(0, 0));
            this.currentCountryIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.6));
            layerBackground.addChild(this.currentCountryIndicatorLabel, 100);
    
            this.populationLabel = new cc.LabelTTF("Country Population:", FONT_FACE, 24);
            this.populationLabel.setAnchorPoint(cc.p(0, 0));
            this.populationLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.5));
            layerBackground.addChild(this.populationLabel, 100);
    
            this.populationIndicatorLabel = new cc.LabelTTF(country.pop_est, FONT_FACE, 24);
            this.populationIndicatorLabel.setAnchorPoint(cc.p(0, 0));
            this.populationIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.5));
            layerBackground.addChild(this.populationIndicatorLabel, 100);
    
            this.gdpLabel = new cc.LabelTTF("Country GDP:", FONT_FACE, 24);
            this.gdpLabel.setAnchorPoint(cc.p(0, 0));
            this.gdpLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.4));
            layerBackground.addChild(this.gdpLabel, 100);
    
            this.gdpIndicatorLabel = new cc.LabelTTF(country.gdp_est, FONT_FACE, 24);
            this.gdpIndicatorLabel.setAnchorPoint(cc.p(0, 0));
            this.gdpIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.4));
            layerBackground.addChild(this.gdpIndicatorLabel, 100);
    
            this.incomeGrpLabel = new cc.LabelTTF("Country GDP:", FONT_FACE, 24);
            this.incomeGrpLabel.setAnchorPoint(cc.p(0, 0));
            this.incomeGrpLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.3));
            layerBackground.addChild(this.incomeGrpLabel, 100);
    
            this.incomeGrpIndicatorLabel = new cc.LabelTTF(country.income_grp, FONT_FACE, 24);
            this.incomeGrpIndicatorLabel.setAnchorPoint(cc.p(0, 0));
            this.incomeGrpIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.3));
            layerBackground.addChild(this.incomeGrpIndicatorLabel, 100);
    
            this.regionLabel = new cc.LabelTTF("Country Region:", FONT_FACE, 24);
            this.regionLabel.setAnchorPoint(cc.p(0, 0));
            this.regionLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.2));
            layerBackground.addChild(this.regionLabel, 100);
    
            this.regionIndicatorLabel = new cc.LabelTTF(country.subregion, FONT_FACE, 24);
            this.regionIndicatorLabel.setAnchorPoint(cc.p(0, 0));
            this.regionIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.2));
            layerBackground.addChild(this.regionIndicatorLabel, 100);
        }

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

