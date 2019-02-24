// Global parameters
var X_OFFSET = 0, Y_OFFSET = 50;
var MONTH_INTERVAL = 20;
var RESOURCE_CHANCE = 0.5;
var CRISIS_CHANCE = 0.3;
var FONT_FACE_TITLE = "ArvoFont";
var FONT_FACE_BODY = "JosefinSansFont";
// var FONT_FACE_BODY = "Trebuchet MS";
var RESOURCE_SIZE_W = 32; 
var RESOURCE_SIZE_H = 54; 
var RESOURCE_DURATION = 300;
var TAG_SPRITE_BATCH_NODE = 1;


// Game variables
var gameParams = {};
var automateScripts = [];
var gameStates = {
    INITIALISED: 0,
    PREPARED: 1,
    STARTED: 2,
    PAUSED: 3,
    GAME_OVER: 5
};



//------------------------------------------------------------------
//
// ShaderOutline
//
//------------------------------------------------------------------
//FIX ME:
//The renderers of webgl and opengl is quite different now, so we have to use different shader and different js code
//This is a bug, need to be fixed in the future
var ShaderOutlineEffect = cc.LayerGradient.extend({
    ctor:function(node, country, loss) {
        this._super();

        this.node = node;
        this.country = country;
        this.loss = loss;
        this.timeCounter = 0;

        var ccbjs = "res/";
        if( 'opengl' in cc.sys.capabilities ) {
            if(cc.sys.isNative){
                this.shader = new cc.GLProgram(res.shader_outline_vertex_nomvp, res.shader_outline_fragment);
                this.shader.link();
                this.shader.updateUniforms();
            }
            else{
                this.shader = new cc.GLProgram(res.shader_outline_vertex_nomvp, res.shader_outline_fragment);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);

                this.shader.link();
                this.shader.updateUniforms();
                this.shader.use();
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_threshold'), 1.75);
                this.shader.setUniformLocationWith3f(this.shader.getUniformLocationForName('u_outlineColor1'), 255 / 255, 0 / 255, 0 / 255);
                this.shader.setUniformLocationWith3f(this.shader.getUniformLocationForName('u_outlineColor2'), 0 / 255, 255 / 255, 0 / 255);

                var program = this.shader.getProgram();
                this.uniformResolution = gl.getUniformLocation( program, "resolution");
                this.shader.setUniformLocationF32( this.uniformResolution, 256, 256);
            }

            // this.sprite.runAction(cc.sequence(cc.rotateTo(1.0, 10), cc.rotateTo(1.0, -10)).repeatForever());

            if(cc.sys.isNative){
                var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this.shader);
                glProgram_state.setUniformFloat("u_threshold", 1.75);
                glProgram_state.setUniformFloat("u_selected", 0.0);
                glProgram_state.setUniformFloat("u_fill1", 1.0);
                glProgram_state.setUniformFloat("u_fill2", 1.0);
                glProgram_state.setUniformVec3("u_outlineColor1", {x: 255/255, y: 0/255, z: 0/255});
                glProgram_state.setUniformVec3("u_outlineColor2", {x: 0/255, y: 255/255, z: 0/255});
                node.setGLProgramState(glProgram_state);
            }else{
                node.shaderProgram = this.shader;
            }

            this.scheduleUpdate();
        }
    },
    update:function(dt) {  

        if (gameParams.state != gameStates.STARTED)
            return;

        // if (this.timeCounter > 0.2) {
        //     this.timeCounter = 0;
        //     return;
        // }
        // this.timeCounter += dt;

        // if (this.country.iso_a3 == "USA")
        //     console.log(Math.abs(this.node.getRotation() / 500), this.country.loss, dt);

        var selected = this.country.selected ? 1.0 : 0.0;
        if( 'opengl' in cc.sys.capabilities ) {
            if(cc.sys.isNative){
                this.node.getGLProgramState().setUniformFloat(this.shader.getUniformLocationForName('u_selected'), selected);
                this.node.getGLProgramState().setUniformFloat(this.shader.getUniformLocationForName('u_fill1'), 1.0 + (this.country.loss));
                this.node.getGLProgramState().setUniformFloat(this.shader.getUniformLocationForName('u_fill2'), 1.0 + (this.country.pop_prepared_percent));
                this.node.getGLProgramState().setUniformFloat("u_radius", Math.abs(this.node.getRotation() / 500));
            }else{
                this.shader.use();
                this.shader.setUniformLocationF32( this.uniformResolution, 256, 256);
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_selected'), selected);
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_fill1'), (this.country.loss));
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_fill2'), (this.country.pop_prepared_percent));
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_radius'), Math.abs(this.node.getRotation() / 500));
                this.shader.updateUniforms();
            }
        }

    }
});

var initCountries = function() {

        var size = cc.winSize;

        world.collisionDetection = function(points,test) {
            var crossed = false;
            var times = 0;
            
            // Double check the detection is within the widest bounds
            var maxx = Math.max(...points.map(p => p.x));
            for (var i = 0; i < points.length; i++) {
                var p1 = points[i];
                var p2 = (i == points.length - 1) ? points[0] : points[i+1];

                // Make floating, and jitter to avoid boundary issues with integers.
                var x1 = parseFloat(p1.x) + 0.001, y1 = parseFloat(p1.y) - 0.001, 
                    x2 = parseFloat(p2.x) + 0.001, y2 = parseFloat(p2.y) - 0.001;
                
                if ((y1 < test.y && y2 >= test.y) || (y1 > test.y && y2 <= test.y)) {
                    if ((x1 + x2) / 2.0 < test.x && test.x < maxx) {
                        times++;
                        crossed = !crossed;
                    }
                }
            }
            return crossed;
        };


        // Sorts objects by their relative screen position, to avoid overlapping tiles
        world.sortedObjs = world.map.objectGroups[0].getObjects().slice(0).sort(function(a, b) { 
            return (a.points[0].y * size.height + a.points[0].x) > (b.points[0].y * size.height + b.points[0].x);  
        });

        var pointArray = function(name) {
            return world.sortedObjs.filter(so => so.name == name).map(so => so.points);
        };

        // Generates min, max coordinates
        var extremes = function(name) {
            let pa = pointArray(name);
            let extremes = [];
            for (let i = 0; i < pa.length; i++) {
                let p = pa[i];
                let minx = 0, miny = 0, maxx = 0, maxy = 0;
                for (let j = 0; j < p.length; j++) {
                    var point = p[j];
                    if (minx == 0 || minx > parseInt(point.x)) 
                        minx = parseInt(point.x);
                    if (miny == 0 || miny > parseInt(point.y)) 
                        miny = parseInt(point.y);
                    if (maxx < parseInt(point.x)) 
                        maxx = parseInt(point.x);
                    if (maxy < parseInt(point.y)) 
                        maxy = parseInt(point.y);
                }
                extremes.push({ minx: minx, miny: miny, maxx: maxx, maxy: maxy });
            }
            return extremes;
        };


        var regionalArea = function(points) {
            let area = 0;
            for (let j = 0; j < points.length - 1; j++) {
                var pt1 = points[j];
                var pt2 = points[j + 1];
                var xy1 = pt1.x * pt2.y;
                var xy2 = pt1.y * pt2.x;
                area += Math.abs(xy1 - xy2);
            }
            return area / 2;
        };

        // Gauss shoelace algorithm - https://gamedev.stackexchange.com/questions/151034/how-to-compute-the-area-of-an-irregular-shape
        var areas = function(name) { 
            let pa = pointArray(name);
            var area = 0;
            for (let i = 0; i < pa.length; i++) {
                let p = pa[i];
                area += regionalArea(p);
            }
            return area;
        };

        // Create country centroids
        var centroids = function(name) { 
            let pa = pointArray(name);
            let lastArea = 0, thisArea = 0;
            let regionID = -1;
            for (let i = 0; i < pa.length; i++) {
                let p = pa[i];
                thisArea = regionalArea(p);
                if (thisArea > lastArea) {
                    regionID = i;
                    lastArea = thisArea;
                }
            }
            if (regionID == -1)
                return;
            
            let points = pa[regionID];
            let totalX = 0, totalY = 0;
            points.forEach(function(pt) {
                totalX += parseFloat(pt.x);
                totalY += parseFloat(pt.y);
            });
            return { x: totalX / points.length, y: totalY / points.length }
        };

        world.countries = world.map.objectGroups[0].getObjects().reduce((map, obj) => {  
            if (!map[obj.name]) {
                map[obj.name] = {
                    name: obj.NAME,
                    points: pointArray(obj.name),
                    extremes: extremes(obj.name),
                    centroid: centroids(obj.name),
                    area: areas(obj.name),
                    
                    affected_chance: 1.0,
                    pop_est: parseInt(obj.POP_EST),
                    pop_aware: 0,
                    pop_aware_percent: 0,
                    pop_prepared: 0,
                    pop_prepared_percent: 0,

                    gdp_est: parseInt(obj.GDP_MD_EST),
                    gid: obj.GID,
                    iso_a2: obj.ISO_A2,
                    iso_a3: obj.ISO_A3,
                    subregion: obj.SUBREGION,
                    economy: obj.ECONOMY,
                    income_grp: obj.INCOME_GRP,
                    income_grp_num: parseInt(obj.INCOME_GRP.charAt(0)),
                    equator_dist: obj.EQUATOR_DIST,
                    policy: 0,
                    previousLoss: gameParams.previousLoss,
                    loss: 0,
                    neighbours: [],
                    points_shared: 0,
                    points_total: 0,
                    shared_border_percentage: 0,
                    policyPoints: [],
                    policyDots: [],
                    destructionPoints: [],
                    destructionDots: [] ,
                    selected: false   
                };
            } 
            return map; 
        }, {});

        // Add proportion of main land mass with shared borders
        world.countryKeys = Object.keys(world.countries);
        var allPoints = {};
        world.countryKeys.forEach(k => {
            var c = world.countries[k];
            c.points.forEach(p => {
                var pStr = p.x +"-"+p.y;
                if (allPoints[pStr]) {
                    allPoints[pStr].push(c.iso_a3);
                }
                else {
                    allPoints[pStr] = [c.iso_a3];
                }
            });
        });

                
        Object.keys(allPoints).forEach(k => {
            var countries = allPoints[k];
            countries.forEach(c1 => {
                var country = world.countries[c1];
                countries.forEach(c2 => {
                    if (c1 != c2) {
                        if (country.neighbours.indexOf(c2) == -1) {
                            country.neighbours.push(c2);
                        }
                        country.points_shared += 1;
                    }
                });
                country.points_total += 1;
            });
        });
        Object.keys(world.countries).forEach(c => {
            var country = world.countries[c];
            country.shared_border_percentage = country.points_shared / country.points_total;
            if (country.shared_border_percentage > 1.0)
                country.shared_border_percentage = 1.0;
        });
        

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
            // Change the power for more or less points
            country.numPoints = Math.ceil(Math.pow(country.area / world.areaMean, 2));
        });
        // Object.values(world.countries).forEach(c => c.numPoints = c.points.reduce((a, pa) => a + pa.length, 0))

        // Add world populations
        gameParams.populationWorld = Object.keys(world.countries).map(c => { return world.countries[c].pop_est; }).reduce((a, c) => {return a + parseInt(c);}, 0);

}

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
    gameParams.previousDate = gameParams.startDate;
    gameParams.currentDate = gameParams.startDate;
    gameParams.counter = 0;
    gameParams.lastResource = 0;
    gameParams.lastCrisis = 0;
    gameParams.crises = [];
    gameParams.crisisCountry = null;
    gameParams.crisisCount = 0;
    gameParams.policies = {};
    gameParams.policy = 0;
    gameParams.countriedAffected = 0;
    gameParams.populationAware = 0;
    gameParams.populationPrepared = 0;
    gameParams.populationAwarePercent = 0;
    gameParams.populationPreparedPercent = 0;
    gameParams.resources = scenarioData.starting_resources;
    gameParams.alertResources = false;
    gameParams.alertCrisis = false;
    gameParams.resourcesAdded = false;
    gameParams.previousLoss = scenarioData.threat_details.starting_conditions.starting_loss;
    gameParams.rateOfLoss = scenarioData.threat_details.advanced_stats.loss_increase_speed;
    gameParams.minimumLoss = scenarioData.threat_details.advanced_stats.minimum_loss_increase;
    gameParams.totalLoss = 0;
    gameParams.scenarioName = scenarioData.name;
    gameParams.messagesNegative = scenarioData.messages.negative;
    gameParams.messagesPositive = scenarioData.messages.positive;
    gameParams.messageOverride = null;
    gameParams.tutorialMode = false;
    gameParams.tutorialHints = [];
    gameParams.stats = {};

    // Obtain automation setting from parent
    if (world.automateID > -1) {
        gameParams.automateMode = true;
        gameParams.automateScript = automateScripts[world.automateID - 1];
        console.log("Running " + gameParams.automateScript.name);

    }

    updateTimeVars(MONTH_INTERVAL);
    calculatePolicyConnections();
};

/**
 * Fire click on target
 */
var fireClickOnTarget = function(target, callback) {
    
    setTimeout(function() {

        // Assume no more than 4 parents
        let x = target.getPosition().x;
        let y = target.getPosition().y;
        
        if (target.parent != null) {

            x += target.parent.getPosition().x;
            y += target.parent.getPosition().y;
            if (target.parent.parent != null) {
                x += target.parent.parent.getPosition().x;
                y += target.parent.parent.getPosition().y;
                if (target.parent.parent.parent != null) {

                    x += target.parent.parent.parent.getPosition().x;
                    y += target.parent.parent.parent.getPosition().y;
                
                }
            }
        }

        x += target.getContentSize().width / 2;
        y += target.getContentSize().height / 2;

        var e = new cc.EventMouse(cc.EventMouse.UP);
        e.setLocation(x, y);
        cc.eventManager.dispatchEvent(e);
        /*
        var touches = [];
        var touch = new cc.Touch(x, y);
        touch._setPrevPoint(x, y);
        touch._startPoint = cc.p(x, y);
        touches.push(touch)
        var es = new cc.EventTouch(touches);
        es._eventCode = cc.EventTouch.BEGAN;
        var ee = new cc.EventTouch(touches);
        ee._eventCode = cc.EventTouch.ENDED;
        cc.eventManager.dispatchEvent(es);
        cc.eventManager.dispatchEvent(ee);
        */

        if (typeof(callback) !== "undefined")
            callback();

    }, 100);

};

/**
 * Sets up game parameters at the start of play
 */
var calculatePolicyConnections = function() {

    gameParams.policyOptions = {};
    var policyLen = 0;
    Object.keys(RESOURCES).forEach(key => {
        RESOURCES[key].policyOptions.forEach(pol => {
            gameParams.policyOptions[pol.id] = pol;
            if (policyLen < pol.id)
                policyLen = pol.id;
        });
    });
    
    gameParams.policyRelations = {};
    for (var i = 0; i < policyLen; i++){
        var source = gameParams.policyOptions[i+1];
        gameParams.policyRelations[source.id] = {};
        for (var j = i + 1; j < policyLen; j++){
            var target = gameParams.policyOptions[j+1];
            if (typeof(gameParams.policyRelations[target.id]) === "undefined")
                gameParams.policyRelations[target.id] = {};
            var val = RESOURCE_MATRIX[j][i];
            var rel = RESOURCE_RELATIONS[j][i];
            gameParams.policyRelations[source.id][target.id] = val;
            if (rel == 1) {
                gameParams.policyRelations[target.id][source.id] = val;
            }
        }
    }

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
    gameParams.tutorialInterval = gameParams.timeInterval * 6;
    gameParams.resourceInterval = gameParams.timeInterval * 6; 
    gameParams.crisisInterval = gameParams.timeInterval * 30;

};

/**
 * Load external data sources
 * Reference: https://github.com/toddmotto/public-apis#transportation
 */
var loadDataSets = function() {
    cc.loader.loadJson("https://api.openaq.org/v1/cities",function(error, data){
        cc.log(data);
    });   
};

/**
 * Message box
 * @param {*} parent 
 * @param {*} title
 * @param {*} message 
 * @param {*} prompt 
 * @param {*} callback 
 */
var showMessageBoxOK = function(parent, title, message, prompt1, callback1, prompt2, callback2){

    parent.pause(); 

    var winWidth = cc.winSize.width, winHeight = cc.winSize.height;
    var btn1Offset = 0.1, btn2Offset = 0.0;
    if (message === null || typeof(message) === "undefined" || message === "") {
        if (typeof(prompt2) !== "undefined") {
            btn1Offset = 0.5;
            btn2Offset = 0.3;
        }
        else {
            btn1Offset = 0.4;
        }
    }
    else {
        if (typeof(prompt2) !== "undefined") {
            btn1Offset = 0.2;
            btn2Offset = 0.1;
        }
    }

    var layerBackground = new cc.LayerColor(COLOR_LICORICE, winWidth * 0.66, winHeight * 0.66);
    layerBackground.attr({ 
        x: winWidth / 2 - layerBackground.width / 2, 
        y: winHeight / 2 - layerBackground.height / 2});
    parent.addChild(layerBackground, 1);

    var titleText = new ccui.Text(title, FONT_FACE_TITLE, 36);
    titleText.ignoreContentAdaptWithSize(false);
    titleText.setAnchorPoint(cc.p(0.5, 0));
    titleText.setContentSize(cc.size(layerBackground.width * 0.9, layerBackground.height * 0.15));
    titleText.setPosition(cc.p(layerBackground.width * 0.5, layerBackground.height * 0.8));
    titleText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    titleText.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    titleText.setColor(COLOR_WHITE);
    layerBackground.addChild(titleText, 2);

    var contentText = new ccui.Text(message, FONT_FACE_BODY, 24);
    contentText.ignoreContentAdaptWithSize(false);
    contentText.setAnchorPoint(cc.p(0, 0));
    contentText.setContentSize(cc.size(layerBackground.width * 0.9, layerBackground.height * 0.6));
    contentText.setPosition(cc.p(layerBackground.width * 0.05, layerBackground.height * 0.2));
    contentText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
    contentText.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    contentText.setColor(COLOR_WHITE);
    layerBackground.addChild(contentText, 2);

    let buttons = [];
    let btn1 = new ccui.Button();
    btn1.setTouchEnabled(true);
    btn1.setSwallowTouches(false);
    btn1.setTitleText(prompt1);
    btn1.setTitleColor(COLOR_WHITE);
    btn1.setTitleFontSize(36);
    btn1.setTitleFontName(FONT_FACE_BODY);
    btn1.attr({ x: layerBackground.width / 2, y: layerBackground.height * btn1Offset });
    layerBackground.addChild(btn1);

    handleMouseTouchEvent(btn1, function() {
        layerBackground.removeAllChildren(true);
        layerBackground.removeFromParent(true);
        parent.resume(); 
        callback1();
    });

    if (typeof(prompt2) !== "undefined") {

        btn2 = new ccui.Button();
        btn2.setTouchEnabled(true);
        btn2.setSwallowTouches(false);
        btn2.setTitleText(prompt2);
        btn2.setTitleColor(COLOR_ICE);
        btn2.setTitleFontSize(36);
        btn2.setTitleFontName(FONT_FACE_BODY);
        btn2.attr({ x: layerBackground.width / 2, y: layerBackground.height * btn2Offset });
        layerBackground.addChild(btn2);  

        handleMouseTouchEvent(btn2, function() {
            layerBackground.removeAllChildren(true);
            layerBackground.removeFromParent(true);
            parent.resume(); 
            callback2();
        });

    }

    buttons.push(btn1);
    if (typeof(btn2) !== "undefined")
        buttons.push(btn2);

    return buttons;
};

/**
 * Post data to server
 * @param {*} parent 
 * @param {*} message 
 * @param {*} prompt 
 */
var postResultsToServer = function() {
    // Test posting data
    var xhr = cc.loader.getXMLHttpRequest();
    // this.streamXHREventsToLabel(xhr, statusPostLabel, responseLabel, "POST", "sendPostPlainText");

    xhr.open("POST", "http://localhost:8000/game_data");

    //set Content-type "text/plain;charset=UTF-8" to post plain text
    xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8");
    cc.log(JSON.stringify(gameParams))
    xhr.send(JSON.stringify(gameParams));
};


/**
 * Game over dialog
 * @param {*} parent 
 * @param {*} message 
 * @param {*} prompt 
 */
var gameOver = function(parent, message, prompt) {
    
    postResultsToServer();

    var WINDOW_WIDTH = cc.winSize.width;
    var WINDOW_HEIGHT = cc.winSize.height;
    parent.pause(); 
    window.clearTimeout(gameParams.timeoutID );
    gameParams.state = gameStates.PAUSED;

    var layerBackground = new cc.LayerColor(COLOR_LICORICE, WINDOW_WIDTH * 0.66, WINDOW_HEIGHT * 0.66);
    layerBackground.attr({ 
        x: WINDOW_WIDTH / 2 - layerBackground.width / 2, 
        y: WINDOW_HEIGHT / 2 - layerBackground.height / 2
    });
    parent.addChild(layerBackground, 1);

    var titleText = new ccui.Text("Game Over!", FONT_FACE_BODY, 36);
    titleText.ignoreContentAdaptWithSize(false);
    titleText.setAnchorPoint(cc.p(0, 0));
    titleText.setContentSize(cc.size(layerBackground.width * 0.9, layerBackground.height * 0.15));
    titleText.setPosition(cc.p(layerBackground.width * 0.05, layerBackground.height * 0.8));
    titleText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    titleText.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    titleText.setColor(COLOR_WHITE);
    layerBackground.addChild(titleText, 2);

    var contentText = new ccui.Text(message, FONT_FACE_BODY, 24);
    contentText.ignoreContentAdaptWithSize(false);
    contentText.setAnchorPoint(cc.p(0, 0));
    contentText.setContentSize(cc.size(layerBackground.width * 0.9, layerBackground.height * 0.6));
    contentText.setPosition(cc.p(layerBackground.width * 0.05, layerBackground.height * 0.2));
    contentText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
    contentText.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    contentText.setColor(COLOR_WHITE);
    layerBackground.addChild(contentText, 2);

    var menu = this._menu = cc.Menu.create();
    menu.setPosition(cc.p(0, 0));
    layerBackground.addChild(this._menu, 3);

    var btnOK = cc.MenuItemLabel.create(cc.LabelTTF.create(prompt, FONT_FACE_BODY, 36));
    btnOK.attr({
        x: layerBackground.width / 2,
        y: (layerBackground.height * 0.1) 
    });
    handleMouseTouchEvent(btnOK, function() {

        initGameParams(world.scenarioData);
        gameParams.state = gameStates.GAME_OVER;
        gameParams.startCountry = null;
        gameParams.policies = {};
        world.tweetLabel.setString(gameParams.scenarioName);
        world.tweetLabel.attr({ x: world.tweetBackground.width / 2, width: world.tweetBackground.width });
        world.tweetAlertLabel.attr({ x: world.tweetLabel.x });

        cc.director.runScene(new LoadingScene());

    });
    menu.addChild(btnOK);

};


/**
 * A common function for adding mouse/touch events.
 */
var handleMouseTouchEvent = function(target, callback) {
    
    var listenerMouse = cc.EventListener.create({
        event: cc.EventListener.MOUSE,
        onMouseUp : function(event) {
            var target = event.getCurrentTarget();
            var locationInNode = target.convertToNodeSpace(event.getLocation());    
            var s = target.getContentSize();
            var rect = cc.rect(0, 0, s.width, s.height);
            if (cc.rectContainsPoint(rect, locationInNode)) {  
                callback(target);
                event.stopPropagation();
                return true;
            }
            return false;
        }
    });

    var listenerTouch = cc.EventListener.create({
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        onTouchBegan : function(touch, event) {
            var target = event.getCurrentTarget();
            var locationInNode = target.convertToNodeSpace(touch.getLocation());
            var s = target.getContentSize();
            var rect = cc.rect(0, 0, s.width, s.height);
            if (cc.rectContainsPoint(rect, locationInNode)) {  
                target.TOUCHED = true;
                return true;
            }
            return false;

        },
        onTouchEnded : function(touch, event) {

            var target = event.getCurrentTarget();
            if (target.TOUCHED) {
                target.TOUCHED = false;
                callback(target);
            }
            return true;

        }
    });

    if (gameParams.automateMode) {
        cc.eventManager.addListener(listenerMouse, target); 
    }
    else {
        cc.eventManager.addListener(listenerTouch, target);    
    }

};

/**
 * Main screen - shows the world, and various controls for interaction.
 */
var WorldLayer = cc.Layer.extend({
    sprite:null,

    initControls:function() {

        var controlHandler = function(target) {

            if (target == world.btnQuit) {  // Pause
                gameParams.state = gameStates.PAUSED;
                showMessageBoxOK(world, "Options", "", 
                "QUIT GAME", function() {
                    
                    postResultsToServer();

                    gameParams.state = gameStates.GAME_OVER;
                    cc.director.runScene(new LoadingScene());

                }, 
                "RETURN TO GAME", function() {
                    gameParams.state = gameStates.STARTED;
                });
            }
            else if (target == world.btnPause) {  // Pause

                gameParams.state = gameStates.PAUSED;
                world.btnPause.enabled = false;
                world.btnPlay.enabled = true;
                world.btnFF.enabled = true;

            }
            else if (target == world.btnPlay) {  // Play

                updateTimeVars(MONTH_INTERVAL);
                gameParams.state = gameStates.STARTED;
                world.btnPause.enabled = true;
                world.btnPlay.enabled = false;
                world.btnFF.enabled = true;

            }
            else if (target == world.btnFF) {  // Fast Forward

                updateTimeVars(MONTH_INTERVAL / 10);
                gameParams.state = gameStates.STARTED;
                world.btnPause.enabled = true;
                world.btnPlay.enabled = true;
                world.btnFF.enabled = false;

            }
        };

        handleMouseTouchEvent(world.btnQuit, controlHandler);
        handleMouseTouchEvent(world.btnPause, controlHandler);
        handleMouseTouchEvent(world.btnPlay, controlHandler);
        handleMouseTouchEvent(world.btnFF, controlHandler);

    },

    ctor:function (scenarioData, automateID) {
        this._super();

        // Add to global variables to maintain state
        world = this;
        world.scenarioData = scenarioData;
        world.automateID = automateID;

        initGameParams(scenarioData);     

        var size = cc.winSize;
        var WINDOW_WIDTH = cc.winSize.width;
        var WINDOW_HEIGHT = cc.winSize.height;
    
        var layerBackground = new cc.LayerColor(cc.color.WHITE, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        this.addChild(layerBackground, 0);

        // Add controls
        this.controlsBackground = new cc.LayerColor(COLOR_BACKGROUND_TRANS, 126, 72);
        this.controlsBackground.setAnchorPoint(cc.p(0,0));
        this.controlsBackground.x = size.width - 138;
        this.controlsBackground.y = size.height - 84;
        this.addChild(this.controlsBackground, 100);

        this.dayLabel = new cc.LabelTTF("", FONT_FACE_BODY, 18);
        this.dayLabel.setAnchorPoint(cc.p(0, 0));
        this.dayLabel.attr({ x: 14, y: 48 });
        this.dayLabel.color = COLOR_FOREGROUND;
        this.monthLabel = new cc.LabelTTF("", FONT_FACE_BODY, 18);
        this.monthLabel.setAnchorPoint(cc.p(0, 0));
        this.monthLabel.attr({ x: 30, y: 48 });
        this.monthLabel.color = COLOR_FOREGROUND;
        this.yearLabel = new cc.LabelTTF("", FONT_FACE_BODY, 18);
        this.yearLabel.setAnchorPoint(cc.p(0, 0));
        this.yearLabel.attr({ x: 54, y: 48 });
        this.yearLabel.color = COLOR_FOREGROUND;
        // this.controlsBackground.addChild(this.dayLabel, 100);
        this.controlsBackground.addChild(this.monthLabel, 100);
        this.controlsBackground.addChild(this.yearLabel, 100);

        this.btnQuit = new ccui.Button();
        this.btnPause = new ccui.Button();
        this.btnPlay = new ccui.Button();
        this.btnFF = new ccui.Button();

        this.btnQuit.setAnchorPoint(cc.p(0,0));
        this.btnQuit.setTouchEnabled(true);
        this.btnQuit.setSwallowTouches(false);
        this.btnQuit.setScale9Enabled(true);
        this.btnQuit.loadTextures(res.quit_off_png, "", res.quit_on_png);
        this.btnQuit.attr({ x: 21, y: size.height - 63 });
        this.btnQuit.setContentSize(cc.size(105, 105));
        this.btnQuit.setScale(0.4);
        this.addChild(this.btnQuit, 100);
        
        this.btnPause.setTouchEnabled(true);
        this.btnPause.setSwallowTouches(false);
        this.btnPause.setScale9Enabled(true);
        this.btnPause.loadTextures(res.pause_off_png, "", res.pause_on_png);
        this.btnPause.attr({ x: 21, y: 21 });
        this.btnPause.setContentSize(cc.size(105, 105));
        this.btnPause.setScale(0.4);
        this.controlsBackground.addChild(this.btnPause, 100, "pause");
        
        this.btnPlay.setTouchEnabled(true);
        this.btnPlay.setSwallowTouches(false);
        this.btnPlay.setScale9Enabled(true);
        this.btnPlay.loadTextures(res.play_off_png, "", res.play_on_png);
        this.btnPlay.attr({ x: 62, y: 21 });
        this.btnPlay.setContentSize(cc.size(105, 105));
        this.btnPlay.setScale(0.4);
        this.controlsBackground.addChild(this.btnPlay, 100, "play");
        
        this.btnFF.setTouchEnabled(true);
        this.btnFF.setSwallowTouches(false);
        this.btnFF.setScale9Enabled(true);
        this.btnFF.loadTextures(res.playfast_off_png, "", res.playfast_on_png);
        this.btnFF.attr({ x: 103, y: 21 });
        this.btnFF.setContentSize(cc.size(105, 105));
        this.btnFF.setScale(0.4);
        this.controlsBackground.addChild(this.btnFF, 100, "fast");

        this.initControls();

        this.btnPause.enabled = false;
        this.btnPlay.enabled = false;
        this.btnFF.enabled = false;

        // Add tweet area
        // this.tweetBackground = new cc.LayerColor(COLOR_BACKGROUND_TRANS, 600, 36);
        this.tweetBackground2 = new ccui.ScrollView();
        this.tweetBackground2.setDirection(ccui.ScrollView.DIR_VERTICAL);
        //this.tweetBackground2.setTouchEnabled(true);
        this.tweetBackground2.attr({ width: 600, height: 36, x: (size.width / 2) - (WINDOW_WIDTH / 2), y: size.height - 96 });
        this.tweetBackground2.setContentSize(cc.size(600, 36));
        // this.tweetBackground2.setBackGroundColor(COLOR_BACKGROUND_TRANS);
        this.tweetBackground2.setInnerContainerSize(cc.size(WINDOW_WIDTH / 2, 36));
        // this.tweetBackground2.setAnchorPoint(new cc.p(0,0));
        // this.addChild(this.tweetBackground2, 110);

        this.tweetBackground = new cc.ClippingNode();
        this.tweetBackground.setColor(COLOR_BACKGROUND_TRANS);
        this.tweetBackground.attr({ width: WINDOW_WIDTH / 2, height: 36, x: (WINDOW_WIDTH / 4), y: size.height - 48 });
        this.tweetBackground.setContentSize(cc.size(WINDOW_WIDTH / 2, 36));
        var stencil = new cc.DrawNode();
        var rectangle = [cc.p(0, 0),cc.p(this.tweetBackground.width, 0),
            cc.p(this.tweetBackground.width, this.tweetBackground.height),
            cc.p(0, this.tweetBackground.height)];

        var darkGrey = new cc.Color(42, 54, 68, 255);
        stencil.drawPoly(rectangle, darkGrey, 1, darkGrey);
        this.tweetBackground.stencil = stencil;
        this.addChild(this.tweetBackground, 110);

        this.tweetBackgroundLayer = new cc.LayerColor(COLOR_BACKGROUND_TRANS);
        this.tweetBackgroundLayer.attr({ width: this.tweetBackground.width, height: this.tweetBackground.height, x: 0, y: 0});
        this.tweetBackground.addChild(this.tweetBackgroundLayer, 100);

        this.tweetLabel = new cc.LabelTTF(gameParams.scenarioName, FONT_FACE_BODY, 18);
        this.tweetLabel.setAnchorPoint(cc.p(0, 0.5));
        this.tweetLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT)
        this.tweetLabel.attr({ x: this.tweetBackground.width / 2, y: 18, width: this.tweetBackground.width });
        this.tweetLabel.color = COLOR_ICE;
        this.tweetBackground.addChild(this.tweetLabel, 101);
        this.tweetAlertLabel = new cc.LabelTTF("ALERT!", FONT_FACE_BODY, 18);
        this.tweetAlertLabel.setAnchorPoint(cc.p(0, 0.5));
        this.tweetAlertLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT)
        this.tweetAlertLabel.attr({ x: world.tweetLabel.x - 100, y: 18, width: 20 });
        this.tweetAlertLabel.color = COLOR_DESTRUCTION_POINTS;
        this.tweetAlertLabel.setVisible(false);
        this.tweetBackground.addChild(this.tweetAlertLabel, 101);

        // Add resource
        this.resourceScoreBackground = new cc.LayerColor(COLOR_RESOURCE, 160, Y_OFFSET);
        this.resourceScoreBackground.setAnchorPoint(cc.p(0, 0));
        this.resourceScoreBackground.setPosition(cc.p(0, 80));
        this.addChild(this.resourceScoreBackground, 100);

        var antarcticaSmallSprite = new cc.Sprite(res.antarctica_small_png);
        // antarcticaSmallSprite.setAnchorPoint(new cc.p(0., 0.));
        // antarcticaSmallSprite.setContentSize(cc.size(250, 251));
        // antarcticaSmallSprite.setScale(8);
        antarcticaSmallSprite.setAnchorPoint(new cc.p(0.5, 0.5));
        antarcticaSmallSprite.setContentSize(cc.size(50, 51));
        antarcticaSmallSprite.setScale(0.8);
        antarcticaSmallSprite.setPosition(cc.p(40, 25));
        this.resourceScoreBackground.addChild(antarcticaSmallSprite, 100);

        this.resourceScoreLabel = new cc.LabelTTF(gameParams.resources.toString(), FONT_FACE_BODY, 30);
        this.resourceScoreLabel.setAnchorPoint(cc.p(0.5, 0.5));
        this.resourceScoreLabel.setPosition(cc.p(80, 25));
        this.resourceScoreLabel.setColor(COLOR_LICORICE);
        this.resourceScoreBackground.addChild(this.resourceScoreLabel, 100);

        // Add "World" background layer
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

        // Interaction handling
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            // Pan handling
            onMouseMove: function(event){
                if(event.getButton() == cc.EventMouse.BUTTON_LEFT){
                    var node = event.getCurrentTarget(); 
                    var scale = node.getScale();
                    var size = node.getContentSize();
                    var scaledX = scale * size.width;
                    var scaledY = scale * size.height;
                    // Calculate margins adjusted for size
                    var marginX = node.width / (2 / (1e-06 + scale - 1));
                    var marginY = -Y_OFFSET + node.height / (2 / (1e-06 + scale - 1));
                    if (node.x + event.getDeltaX() < marginX && 
                        node.x + event.getDeltaX() > -marginX &&
                        node.y + event.getDeltaY() < marginY && 
                        node.y + event.getDeltaY() > -marginY ) {
                        node.x += event.getDeltaX();
                        node.y += event.getDeltaY();
                    }
                }
            },
            // Zoom handling
            onMouseScroll: function(event){
                var node = event.getCurrentTarget(); 
                var delta = cc.sys.isNative ? event.getScrollY() * 6 : -event.getScrollY();
                var newScale = node.getScale() * (1 + delta / 1000.0);
                // Calculate margins adjusted for size
                var marginX = node.width / (2 / (1e-06 + newScale - 1));
                var marginY = -Y_OFFSET + node.height / (2 / (1e-06 + newScale - 1));
                if (newScale <= 10.0 && newScale >= 1.0 && 
                    node.x < marginX && 
                    node.x > -marginX) {
                    node.setScale(newScale);
                }
            }
        }, this.worldBackground);

        initCountries();

        // for (var i = 0; i < 177; i++) {
        // Peirce projection
        // for (var i = 0; i < 169; i++) {
        // Stereographic projection - 0.9
        // for (var i = 0; i < 160; i++) {
        // Stereographic projection - 0.1
        // for (var i = 0; i < 166; i++) {
        // 50m Stereographic projection - 0.0

        for (var i = 0; i < 225; i++) {
            var gid = (i + 3);
            var l = this.map.getLayer("Tile Layer " + gid);
            var arr = Object.values(world.countries).filter(c => c.gid == gid);
            if (arr.length == 0)
                continue;
            var country = arr[0];
            var shaderNode = new ShaderOutlineEffect(l, country, false);
            shaderNode.width = 1;
            shaderNode.height = 1;
            shaderNode.x = this.width;
            shaderNode.y = this.height;
            world.worldBackground.addChild(shaderNode, 1);

            //l.setTileGID(0,cc.p(0,0))
        }

        layout = new cc.LayerColor(COLOR_BACKGROUND_TRANS, size.width, Y_OFFSET);
        layout.setAnchorPoint(new cc.p(0,0));
        layout.attr({ x: 0, y: 0 });
        this.addChild(layout, 100);

        this.btnDevelopPolicy = new ccui.Button();
        this.btnDevelopPolicy.setTouchEnabled(true);
        this.btnDevelopPolicy.setSwallowTouches(false);
        this.btnDevelopPolicy.setTitleText("POLICY");
        this.btnDevelopPolicy.setTitleFontName(FONT_FACE_BODY);
        this.btnDevelopPolicy.setTitleFontSize(24);
        this.btnDevelopPolicy.setTitleColor(COLOR_ICE);
        this.btnDevelopPolicy.setAnchorPoint(new cc.p(0,0));
        this.btnDevelopPolicy.setContentSize(cc.size(60, Y_OFFSET));
        this.btnDevelopPolicy.attr({ x: 20, y: 10 });
        layout.addChild(this.btnDevelopPolicy);

    
        var countryDetailLayout = new cc.LayerColor(COLOR_BACKGROUND_TRANS);
        countryDetailLayout.setAnchorPoint(new cc.p(0,0));
        countryDetailLayout.setContentSize(cc.size(900, Y_OFFSET));
        countryDetailLayout.attr({ x: this.width / 2 - 900 / 2, y: 0 });        layout.addChild(countryDetailLayout);
        var fontSize = 20;
        var labelOffsetY = Y_OFFSET / 2;// - fontSize / 2;

        this.countryLabel = new cc.LabelTTF("", FONT_FACE_TITLE, fontSize);
        this.countryLabel.setContentSize(cc.size(300, Y_OFFSET));
        this.countryLabel.setPosition(cc.p(20, labelOffsetY));
        this.countryLabel.setColor(COLOR_ICE);
        this.countryLabel.setAnchorPoint(new cc.p(0,0.5));
        this.countryLabel.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        countryDetailLayout.addChild(this.countryLabel);

        var lossLabel = new cc.LabelTTF("Loss", FONT_FACE_TITLE, fontSize);
        lossLabel.setContentSize(cc.size(50, Y_OFFSET));
        lossLabel.setPosition(cc.p(280, labelOffsetY));
        lossLabel.setColor(COLOR_ICE);
        lossLabel.setAnchorPoint(new cc.p(0,0.5));
        lossLabel.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        countryDetailLayout.addChild(lossLabel);

        this.countryLoss = new cc.LabelTTF("0%", FONT_FACE_TITLE, fontSize);
        this.countryLoss.setContentSize(cc.size(20, Y_OFFSET));
        this.countryLoss.setPosition(cc.p(340, labelOffsetY));
        this.countryLoss.setColor(COLOR_DESTRUCTION_POINTS);
        this.countryLoss.setAnchorPoint(new cc.p(0,0.5));
        this.countryLoss.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        countryDetailLayout.addChild(this.countryLoss);

        this.countryLossProgressBase = new ccui.LoadingBar(res.progress_bar, 100);
        this.countryLossProgressBase.setContentSize(cc.size(100, 10));
        this.countryLossProgressBase.setPosition(cc.p(380, Y_OFFSET / 2));
        this.countryLossProgressBase.setAnchorPoint(new cc.p(0,0.5));
        this.countryLossProgress = new ccui.LoadingBar(res.progress_bar, 0);
        this.countryLossProgress.setColor(COLOR_DESTRUCTION_POINTS);
        this.countryLossProgress.setContentSize(cc.size(100, 10));
        this.countryLossProgress.setPosition(cc.p(380, Y_OFFSET / 2));
        this.countryLossProgress.setAnchorPoint(new cc.p(0,0.5));
        countryDetailLayout.addChild(this.countryLossProgressBase, 100);
        countryDetailLayout.addChild(this.countryLossProgress, 101);

        var preparednessLabel = new cc.LabelTTF("Prepared", FONT_FACE_TITLE, fontSize);
        preparednessLabel.setContentSize(cc.size(100, Y_OFFSET));
        preparednessLabel.setPosition(cc.p(580, labelOffsetY));
        preparednessLabel.setColor(COLOR_ICE);
        preparednessLabel.setAnchorPoint(new cc.p(0,0.5));
        preparednessLabel.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        countryDetailLayout.addChild(preparednessLabel);

        this.countryAwarePrepared = new cc.LabelTTF("0%", FONT_FACE_TITLE, fontSize);
        this.countryAwarePrepared.setHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        this.countryAwarePrepared.setContentSize(cc.size(20, Y_OFFSET));
        this.countryAwarePrepared.setPosition(cc.p(680, labelOffsetY));
        this.countryAwarePrepared.setColor(COLOR_POLICY_POINTS);
        this.countryAwarePrepared.setAnchorPoint(new cc.p(0,0.5));
        this.countryAwarePrepared.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        countryDetailLayout.addChild(this.countryAwarePrepared);

        this.countryPreparedProgressBase = new ccui.LoadingBar(res.progress_bar, 100);
        this.countryPreparedProgressBase.setContentSize(cc.size(100, 10));
        this.countryPreparedProgressBase.setPosition(cc.p(720, Y_OFFSET / 2));
        this.countryPreparedProgressBase.setAnchorPoint(new cc.p(0,0.5));
        this.countryPreparedProgress = new ccui.LoadingBar(res.progress_bar, 0);
        this.countryPreparedProgress.setColor(COLOR_POLICY_POINTS);
        this.countryPreparedProgress.setContentSize(cc.size(100, 10));
        this.countryPreparedProgress.setPosition(cc.p(720, Y_OFFSET / 2));
        this.countryPreparedProgress.setAnchorPoint(new cc.p(0,0.5));
        countryDetailLayout.addChild(this.countryPreparedProgressBase, 100);
        countryDetailLayout.addChild(this.countryPreparedProgress, 101);
    
        // Stats button
        this.btnStats = new ccui.Button();
        this.btnStats.setTouchEnabled(true);
        this.btnStats.setSwallowTouches(false);
        this.btnStats.setTitleText("STATS");
        this.btnStats.setTitleFontName(FONT_FACE_BODY);
        this.btnStats.setTitleFontSize(24);
        this.btnStats.setTitleColor(COLOR_ICE);
        this.btnStats.setContentSize(cc.size(120, 80));
        this.btnStats.setAnchorPoint(new cc.p(0,0));
        this.btnStats.attr({ x: this.width - 120 - 20, y: 10 });
        layout.addChild(this.btnStats);

        handleMouseTouchEvent(this.btnDevelopPolicy, function(){
            gameParams.state = gameStates.PAUSED;
            layer = new DesignPolicyLayer(world);
            world.parent.addChild(layer);
            world.setVisible(false);
        });
        handleMouseTouchEvent(this.btnStats, function(){
            gameParams.state = gameStates.PAUSED;
            layer = new StatsLayer(world);
            world.parent.addChild(layer);
            world.setVisible(false);
        });

        var addEmitter = function () {
            world._emitter = new cc.ParticleRain();
            world.worldBackground.addChild(world._emitter, 110);
    
            world._emitter.life = 4;
    
            world._emitter.texture = cc.textureCache.addImage(res.fire_texture);
            world._emitter.shapeType = cc.ParticleSystem.BALL_SHAPE;

            var sourcePos = world._emitter.getSourcePosition();
            if (sourcePos.x === 0 && sourcePos.y === 0)
                world._emitter.x = cc.winSize.width / 2;
                world._emitter.y = cc.winSize.height / 2 - 50;
        };

        // var shaderNode = new ShaderOutlineEffect(antarcticaSmallSprite);
        // shaderNode.x = this.width;
        // shaderNode.y = this.height;
        // world.worldBackground.addChild(shaderNode, 110);
    

        return true;
    },

    onEnter:function () {
        this._super();

        var size = cc.winSize;
        var mappedTiles = {};

        var oldLayers = [];
        var lastLayerID = -1;

        /*
        for (var j = 0; j < this.map.objectGroups[0].getObjects().length; j++) {
            var poly = this.map.objectGroups[0].getObjects()[j];
            var mts = tilelayer.getMapTileSize(), mw = mts.width, mh = mts.height;
            var cs = tilelayer.getContentSize(), cw = cs.width, ch = cs.height;
            for (var k = 0; k < tilelayer.layerWidth; k++){
                for (var l = 0; l < tilelayer.layerHeight; l++){
                    var tx = k * mw + mw / 2 - poly.x;
                    var ty = (l * mh + mh / 2) - (ch - poly.y);
                    var tp = new cc.p(tx, ty);

                    var cd = world.collisionDetection(poly.points, tp);
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
        */
        
        var processResourceSelection = function(target) {
            
            var res = Math.floor(1 + Math.random() * 3);
            gameParams.resources += res;
            target.removeFromParent();
            if (!gameParams.resourcesAdded) {
                gameParams.state = gameStates.PAUSED;
                gameParams.resourcesAdded = true;
                if (gameParams.tutorialMode) {
                    showMessageBoxOK(world, "HINT:", TUTORIAL_MESSAGES.FIRST_RESOURCE_CLICKED.message, "OK!", function() {
                        gameParams.tutorialHints.push(TUTORIAL_MESSAGES.FIRST_RESOURCE_CLICKED.message);
                        gameParams.state = gameStates.STARTED;
                    });
                }
                else {
                    gameParams.state = gameStates.STARTED;
                }
            }

        };

        var processCrisisSelection = function(target) {

            gameParams.crisisCountry = null;
            var crisis = null;
            for (var i = 0; i < gameParams.crises.length; i++) {
                if (gameParams.crises[i].id == target.crisisId) {
                    var crisisInCountry = gameParams.crises[i];
                    crisis = CRISES[crisisInCountry.crisis];
                    gameParams.crises.splice(i, 1);
                    break;
                }
            }
            target.removeFromParent();
            if (!gameParams.alertCrisis && gameParams.tutorialMode) {
                gameParams.state = gameStates.PAUSED;
                gameParams.alertCrisis = true;
                showMessageBoxOK(world, "Congratulations!", "You have averted the " + crisis.name + "!", "OK!", function() {
                    gameParams.state = gameStates.STARTED;
                });
            }

        };
        
        /**
         * Update month / year in the interface
         * @param {*} world 
         */
        var refreshDate = function(world) {

            // world.dayLabel.setString(gameParams.currentDate.getDate());
            world.monthLabel.setString((gameParams.currentDate.getMonth() + 1).toString());
            world.yearLabel.setString((gameParams.currentDate.getFullYear()).toString());

        };

        var generatePoint = function(pointArray, extremes) {
            var minx = extremes.minx, miny = extremes.miny, maxx = extremes.maxx, maxy = extremes.maxy;
            var testx = -1, testy = -1, k = 0, maxTries = 3;
            var cd = false;
            var p  = null;
            do {
                let arrayIndex = 0;
                let dists = pointArray.map(pa => pa.length / pointArray.reduce((t, pa) => t + pa.length, 0))
                let r = Math.random(), accum = 0;
                for (let i = 0; i < dists.length; i++) {
                    accum += dists[i];
                    if (r < accum) {
                        arrayIndex = i;
                        break;
                    }
                }
                let points = pointArray[arrayIndex];
                let extreme = extremes[arrayIndex];
                let minx = extreme.minx, miny = extreme.miny, maxx = extreme.maxx, maxy = extreme.maxy;
                testx = minx + Math.floor(Math.random() * (maxx - minx));
                testy = miny + Math.floor(Math.random() * (maxy - miny));

                cd = world.collisionDetection(points, cc.p(testx, testy));
                if (cd)
                    break;

            } while (! cd && (k++) < maxTries);
            if (cd) {
                testy = (size.height - Y_OFFSET) - testy;
                p = cc.p(testx, testy); 
            }
            return p;
        };

        world.generatePointsForCountry = function(country, policy, min, max) {
            var batchNode = world.spriteBackground.getChildByTag(TAG_SPRITE_BATCH_NODE);
            var pointArray = country.points;
            var extremes = country.extremes;
            var pointsToDraw = []; //country.policyPoints;
            var dots = []; //country.policyDots;
            if (policy) {
                pointsToDraw = country.policyPoints;
                dots = country.policyDots;
            }
            else {
                pointsToDraw = country.destructionPoints;
                dots = country.destructionDots;
            }

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
                // pointsToDraw = pointsToDraw.slice(0, max - 1);

                if (policy) {
                    country.policyPoints = country.policyPoints.slice(0, max);
                }
                else {
                    country.destructionPoints = country.destructionPoints.slice(0, max);
                }
            }
            else {
                var sqrt = Math.pow(country.area, 0.5);
                if (pointsToDraw.length + ( max - min) * country.numPoints > sqrt)
                    return;
                for (var j = min; j < max; j++) {
                    var numPoints = country.numPoints;
                    for (var k  = 0; k < numPoints; k++) {
                        var p = generatePoint(pointArray, extremes);
                        if (p != null && pointsToDraw.indexOf(p) === -1) {
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
                            pointsToDraw.push(p);
                        }
                    }
                }
            }
            return pointsToDraw;
        };

        world.generatePoints = function() {
            for (var i = 0; i < Object.keys(world.countries).length; i++) {
                var country = world.countries[Object.keys(world.countries)[i]];
                var existingConvincedPercentage = country.pop_prepared_percent;
                country.pop_prepared_percent = 100 * country.pop_prepared / country.pop_est;
                // world.generatePointsForCountry(country, true, parseInt(existingConvincedPercentage), parseInt(country.pop_prepared_percent));
                // // world.generatePointsForCountry(country, false, 0, country.loss);
            }
        };
        world.generatePoints();

        var genNormRand = function() {
            // Produce a random value from a normal distribution with a mean of 120.
            // var r = (Math.random() - 0.5) * 2.0;
            // var rr2 = (r * r) / 2.0;
            // return Math.round(20.0 + 100.0 * (0.5 + (r > 0 ? 1.0 : -1.0) * rr2));
            return 100.0;
        };
        var drawPoints = function() {
            if (typeof(world.renderer) === "undefined") {
                var rend = new cc.RenderTexture(size.width, size.height, cc.Texture2D.PIXEL_FORMAT_RGBA4444, gl.DEPTH24_STENCIL8_OES);
                rend.setPosition(size.width/2,size.height/2);
                world.worldBackground.addChild(rend, 99);
                world.renderer = rend;
                world.renderer.setOpacity(100);
            }
            world.renderer.clear(0, 0, 0, 0);

            var dots = [];
            var drawNode = new cc.DrawNode();
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
                    // drawNode.drawDot(p, 3, cc.color(0.0, 255.0, 0.0, Math.random() * 255));
                    drawNode.drawDot(p, 2, COLOR_POLICY_POINTS);
                }
                for (var j = 0; j < country.destructionPoints.length; j++) {
                    var p = country.destructionPoints[j];
                    // With dynamic alpha
                    // drawNode.drawDot(p, 3, cc.color(255.0, 0.0, 0.0, genNormRand()));
                    // With static alpha
                    // drawNode.drawDot(p, 3, cc.color(255.0, 0.0, 0.0, Math.random() * 255));
                    drawNode.drawDot(p, 2, COLOR_DESTRUCTION_POINTS);
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

        var printCountryStats = function(){
            var country = world.countries[gameParams.currentCountry];
            world.countryLabel.setString(country.name);

            var lossPercent = Math.round(country.loss);
            var preparedPercent = Math.round(country.pop_prepared_percent);

            world.countryLoss.setString(lossPercent + "%" );
            world.countryLossProgress.setPercent(lossPercent);
            world.countryAwarePrepared.setString(preparedPercent + "%");
            // world.countryAwarePrepared.setString(aware + "M aware / " + prepared + "M prepared");
            world.countryPreparedProgress.setPercent(preparedPercent);
        };

        var printWorldStats = function(){
            world.countryLabel.setString("World");

            var lossPercent = Math.round(gameParams.totalLoss);
            var preparedPercent = Math.round(gameParams.populationPreparedPercent);

            world.countryLoss.setString(lossPercent + "%" );
            // var aware = (Math.round(gameParams.populationAware / 10000) / 100).toLocaleString()
            // var prepared = (Math.round(gameParams.populationPrepared / 10000) / 100).toLocaleString()
            // world.countryAwarePrepared.setString(aware + "M aware / " + prepared + "M prepared");
            world.countryAwarePrepared.setString(preparedPercent + "%");

            world.countryLossProgress.setPercent(lossPercent);
            world.countryPreparedProgress.setPercent(preparedPercent);
        };

        var doSim =function() {
            if (gameParams.startCountry === null || gameParams.state !== gameStates.PREPARED)
                return;

            var country = world.countries[gameParams.startCountry];
            country.policy = 1.0;
            country.affected_chance = 1.0;
            var buttons = [];

            // Shuffle from https://gist.github.com/guilhermepontes/17ae0cc71fa2b13ea8c20c94c5c35dc4
            const shuffleArray = a => a.sort(() => Math.random() - 0.5);

            startGameParams();
            refreshDate(world);
                                    
            // Add chance of new resource
            var addResource = function() {
                var r = Math.random();
                if (gameParams.counter - gameParams.lastResource >= gameParams.resourceInterval) {
                    if (r < RESOURCE_CHANCE) {
                        var btnRes = new ccui.Button();
                        btnRes.setTouchEnabled(true);
                        btnRes.setSwallowTouches(false);
                        btnRes.setScale9Enabled(true);
                        btnRes.loadTextures(res.resource_icon, "", "");
                        var ind = Math.floor(Math.random() * Object.keys(world.countries).length);
                        var countryRand = world.countries[Object.keys(world.countries)[ind]];
                        var pt = countryRand.centroid;
                        btnRes.attr({ x: pt.x, y: (size.height - Y_OFFSET) - pt.y + RESOURCE_SIZE_H / 2 });
                        btnRes.setContentSize(cc.size(RESOURCE_SIZE_W, RESOURCE_SIZE_H));
                        // btnRes.setColor(COLOR_RESOURCE);
                        btnRes.placedAt = gameParams.counter;
                        world.worldBackground.addChild(btnRes, 101);

                        buttons.push(btnRes);

                        handleMouseTouchEvent(btnRes, processResourceSelection);

                        if (gameParams.automateMode) {
                            
                            let r = Math.random();
                            if (r < parseFloat(gameParams.automateScript.resourcesProb)) {

                                fireClickOnTarget(btnRes);

                            }

                        }
                                        

                        if (!gameParams.alertResources) {
                            if (gameParams.tutorialMode) {
                                gameParams.state = gameStates.PAUSED;
                                gameParams.alertResources = true;
                                showMessageBoxOK(world, "HINT:", TUTORIAL_MESSAGES.FIRST_RESOURCE_SHOWN.message, "OK!", function(that) {
                                    gameParams.tutorialHints.push(TUTORIAL_MESSAGES.FIRST_RESOURCE_SHOWN.message);
                                    gameParams.state = gameStates.STARTED;
                                });
                            }
                        }
                    }
                    gameParams.lastResource = gameParams.counter;
                }
            };
                                    
            /**
             * Calculate the probability distribution of crisis & country
             */ 
            var crisisProbDistribution = function() {
                var probs = [];
                var crisisKeys = Object.keys(CRISES);
                var countryKeys = Object.keys(world.countries);
                var denom = 0;
                crisisKeys.forEach(ck => {
                    var crisis = CRISES[ck];
                    countryKeys.forEach(yk => {
                        var country = world.countries[yk];
                        var lossProp = country.loss / gameParams.totalLoss;
                        var preparedProp = country.pop_prepared_percent / gameParams.populationPreparedPercent;
                        var totalInfluence = 1.0;
                        totalInfluence += lossProp * crisis.influence_of_environmental_loss;
                        totalInfluence += preparedProp * crisis.influence_of_preparedness;
                        if (isNaN(totalInfluence))
                            totalInfluence = 1.0;
                        denom += totalInfluence;
                        probs.push(totalInfluence);
                    });
                });
                for (var i = 0; i < probs.length; i++) {
                    probs[i] /= denom;
                }
                return probs;
            };

            var crisisProbLocation = function(r) {
                var probs = crisisProbDistribution();
                var crisisKeys = Object.keys(CRISES);
                var countryKeys = Object.keys(world.countries);
                var crisisCountry = {};
                var counter = 0;
                for (var i = 0; i < probs.length; i++) {
                    counter += probs[i];
                    if (r < counter) {
                        var crisisID = Math.floor(crisisKeys.length * i / probs.length);
                        var countryID = i % countryKeys.length;
                        crisisCountry.crisis = crisisKeys[crisisID];
                        crisisCountry.country = countryKeys[countryID];
                        crisisCountry.id = i;
                        crisisCountry.counter = gameParams.counter;
                        break;
                    }
                }
                return crisisCountry;
            };

            var addTutorial = function() {
                if (gameParams.tutorialHints.length < 2 || gameParams.tutorialHints.length >= 6)
                    return;

                gameParams.state = gameStates.PAUSED;
                var message = null;
                switch(gameParams.tutorialHints.length) {
                    case 2:
                    default:
                        message = TUTORIAL_MESSAGES.RANDOM_1.message;
                        break;
                    case 3:
                        message = TUTORIAL_MESSAGES.RANDOM_2.message;
                        break;
                    case 4:
                        message = TUTORIAL_MESSAGES.RANDOM_3.message;
                        break;
                    case 5:
                        message = TUTORIAL_MESSAGES.RANDOM_4.message;
                        break;
                }

                showMessageBoxOK(world, "HINT:", message, "OK", function() {
                    gameParams.tutorialHints.push(message);
                    gameParams.state = gameStates.STARTED;
                });
            };

            var addCrisis = function() {
                if (gameParams.counter - gameParams.lastCrisis < gameParams.crisisInterval) 
                    return;

                var r = Math.random();
                if (r < CRISIS_CHANCE) {
                    var r2 = Math.random();
                    var crisisInCountry = crisisProbLocation(r2);
                    gameParams.crisisCountry = crisisInCountry;
                    gameParams.crises.push(crisisInCountry);
                    gameParams.crisisCount++;
                    var crisis = CRISES[crisisInCountry.crisis];
                    var country = world.countries[crisisInCountry.country];

                    var btnCrisis = new ccui.Button();
                    btnCrisis.setTouchEnabled(true);
                    btnCrisis.setSwallowTouches(false);
                    btnCrisis.setScale9Enabled(true);
                    // btnCrisis.loadTextures("res/icons/delapouite/originals/svg/ffffff/transparent/banging-gavel.svg", "", "");
                    btnCrisis.loadTextures(crisis.image, "", "");
                    var pt = country.centroid;
                    btnCrisis.attr({ x: pt.x, y: (size.height - Y_OFFSET) - pt.y + RESOURCE_SIZE_H / 2 });
                    btnCrisis.setContentSize(cc.size(RESOURCE_SIZE_W, RESOURCE_SIZE_H));
                    // btnCrisis.setColor(COLOR_DESTRUCTION_POINTS);
                    btnCrisis.placedAt = gameParams.counter;
                    btnCrisis.crisisId = crisisInCountry.id;
                    btnCrisis.name = "crisis"+crisisInCountry.id;
                    
                    handleMouseTouchEvent(btnCrisis, processCrisisSelection);
                    
                    world.worldBackground.addChild(btnCrisis, 101);

                    // After the third crisis, add notifications to the news feed
                    let message = "A " + crisis.name + " is taking place in " + country.name + "."; 
                    if (gameParams.crisisCount < 4) {

                        gameParams.state = gameStates.PAUSED;
                        message += " Crises are unexpected events due to environmental loss. Click on the crisis icon to slow the loss and increase the preparedness of the country to minimise the risk of further crises.";

                        let buttons = showMessageBoxOK(world, "Crisis alert!", message, "OK!", function(that) {

                            gameParams.state = gameStates.STARTED;
    
                        });

                        if (gameParams.automateMode) {

                            fireClickOnTarget(buttons[0]);
        
                        }                    

                    }
                    else {
                        
                        if (gameParams.messageOverride == null)
                            gameParams.messageOverride = message;

                    }
                    
                }
                gameParams.lastCrisis = gameParams.counter;
            };

            // Evaluates loss
            world.evaluateLoss = function(country) {
                var loss = country.previousLoss;

                var rateOfLoss = gameParams.rateOfLoss * (0.5 + Math.random());
                
                // Calculate loss
                loss = (1 + loss) * (1 + rateOfLoss / MONTH_INTERVAL) - 1;

                // Weaken rate of loss by population prepared for good policy
                var preparednessFactor = 0.1 * country.pop_prepared_percent / 100.0;
                loss /= (1 + preparednessFactor);

                gameParams.crises.forEach(crisisInCountry => {
                    var crisis = CRISES[crisisInCountry.crisis];
                    var country = world.countries[crisisInCountry.country];
                    // Add effects of country / global loss ratio to crisis effect
                    loss *= (1 + crisis.effect_on_environmental_loss) * (1 / (country.loss / gameParams.totalLoss));
                    
                });

                if (loss < gameParams.minimum_loss_increase) {
                    loss = gameParams.minimum_loss_increase;
                }

                if (loss > 100)
                    loss = 100;
                if (loss < 0)
                    loss = 0;

                return loss;
            };

            /**
             * 
             * @param {*} Calculates transmission of policies from 
             */
            var transmitFrom = function(country) {
                var neighbours = country.neighbours;
                var sharedBorder = country.shared_border_percentage;
                var transmissionLand = world.scenarioData.threat_details.transmission.transmission_land;
                var transmissionSea = world.scenarioData.threat_details.transmission.transmission_sea;
                var transmissionAir = world.scenarioData.threat_details.transmission.transmission_air;
                var infectivityMinimumIncrease = world.scenarioData.threat_details.advanced_stats.minimum_infectivity_increase;

                var likelihoodOfTransmission = country.affected_chance; //infectivityIncreaseSpeed / 100.0;

                var popCountry = country.pop_est;
                var popWorld = gameParams.populationWorld;
                var popFactor = Math.log(popCountry) / Math.log(popWorld);
                
                var income = country.income_grp;
                var incomeVal = parseFloat(income.charAt(0)) / 6.0; // 5 income groups + 1, so there are no zeroes
                
                // THE FOLLOWING CODE MAKES USE OF AVAILABLE GEOGRAPHIC INFORMATION TO DEVELOP A PROXY FOR TRANSMISSION

                var landProb = sharedBorder * transmissionLand * likelihoodOfTransmission * popFactor * incomeVal;
                // Sea probability increases with (a) low shared border and (b) high income and (c) high population
                var seaProb = (1  - sharedBorder)  * transmissionSea * likelihoodOfTransmission * popFactor * (1 - incomeVal);
                // Air probability increases with (a) low shared border and (b) high income and (c) high population
                var airProb = sharedBorder * transmissionAir * likelihoodOfTransmission * popFactor * (1 - incomeVal);
                
                var candidateCountry = null;

                // Start with land
                if (Math.random() < landProb && neighbours.length > 0) {
                    var neighbourIndex = Math.floor(Math.random() * neighbours.length);
                    var neighbour = world.countries[neighbours[neighbourIndex]];
                    if (neighbour.policy == 0) {
                        candidateCountry = neighbour;
                    }
                }
                else if (Math.random() < seaProb) {
                    var countriesShuffled = shuffleArray(Object.keys(world.countries));
                    var countryChance = Math.random();
                    for (var i = 0; i < countriesShuffled.length; i++) {
                        var countryCheck = world.countries[countriesShuffled[i]];
                        if (countryChance < ( 1 - countryCheck.shared_border_percentage ) && countryCheck.policy == 0) {
                            candidateCountry = countryCheck;
                            break;
                        }
                    }
                }
                else if (Math.random() < airProb) {
                    var countriesShuffled = shuffleArray(Object.keys(world.countries));
                    var countryChance = Math.random();
                    for (var i = 0; i < countriesShuffled.length; i++) {
                        var countryCheck = world.countries[countriesShuffled[i]];
                        var incomeCheck = countryCheck.income_grp;
                        var incomeValCheck = parseFloat(incomeCheck.charAt(0)) / 6.0; // 5 income groups + 1, so there are no zeroes
                        if (countryChance < ( 1 - incomeValCheck ) && countryCheck.policy == 0) {
                            candidateCountry = countryCheck;
                            break;
                        }
                    }
                }
                if (candidateCountry != null ) {
                    candidateCountry.affected_chance = 0.1;
                    if (country.affected_chance < 1.0)
                        country.affected_chance *= 0.1;
                    candidateCountry.policy = 1.0;
                    candidateCountry.pop_aware = parseInt(candidateCountry.pop_est) * infectivityMinimumIncrease;
                }
            };

            var infectWithin = function(country) {
                if (country.affected_chance == 0)
                    return;

                if (country.pop_aware >= parseInt(country.pop_est))
                    return;

                // Calculate infectivity
                var infectivityIncreaseSpeed = world.scenarioData.threat_details.advanced_stats.infectivity_increase_speed;
                var infectivityMinimumIncrease = world.scenarioData.threat_details.advanced_stats.minimum_infectivity_increase;

                var infectivityRate = infectivityIncreaseSpeed;

                Object.keys(gameParams.policies).forEach(strategy => {
                    var level = gameParams.policies[strategy];
                    switch(strategy.id) {
                        case 1:
                            // Increase infectivity when reducing inequality for low income countries
                            infectivityRate *= (Math.log(1 + country.income_grp_num));
                            break;
                        case 2:
                            // Increase infectivity with free trade countries for high income countries
                            infectivityRate *= (Math.log((((5 + 1) - country.income_grp_num)) * 1.1));
                            break;
                        case 3:
                            // Increase infectivity with regulations for high income countries
                            infectivityRate *= (Math.log((((5 + 1) - country.income_grp_num)) * 1.1));
                            break;
                        case 4:
                            // Increase infectivity with automation for high income countries
                            infectivityRate *= (Math.log((((5 + 1) - country.income_grp_num)) * 1.1));
                            break;
                        case 5:
                            // Increase infectivity 
                            infectivityRate *= 1.1;
                            break;
                        case 6:
                            // Increase infectivity 
                            infectivityRate *= 1.1;
                            break;
                        case 7:
                            // Increase infectivity with boosted military for high income countries
                            infectivityRate *= (Math.log((((5 + 1) - country.income_grp_num)) * 1.1));
                            break;
                        case 8:
                            // Increase infectivity when boosting democracy for low income countries
                            infectivityRate *= (Math.log(2 + country.income_grp_num));
                            break;
                        case 9:
                            // Increase infectivity when boosting democracy for low income countries
                            infectivityRate *= (Math.log(2 + country.income_grp_num));
                            break;
                        case 10:
                            // Increase infectivity with social media for high income countries
                            infectivityRate *= (Math.log((((5 + 2) - country.income_grp_num)) * 0.8));
                            break;
                        case 11:
                            // Increase infectivity with celebrity endorsements for high income countries
                            infectivityRate *= (Math.log(1 + country.income_grp_num));
                            break;
                        case 12:
                            // Increase infectivity with festivals for high income countries
                            infectivityRate *= (Math.log(1 + country.income_grp_num));
                            break;
                        case 13:
                            // Increase infectivity with green cities for high income countries
                            infectivityRate *= (Math.log((((5 + 1) - country.income_grp_num)) * 1.1));
                            break;
                        case 14:
                            infectivityRate *= (Math.log(1 + country.income_grp_num));
                            break;
                        case 15:
                        infectivityRate *= (Math.log((((5 + 1) - country.income_grp_num)) * 1.1));
                            break;
                        case 16:
                            infectivityRate *= (Math.log(1 + country.income_grp_num));
                            break;
                    };
                });

                if ((infectivityRate - 1) < infectivityMinimumIncrease)
                    infectivityRate = 1 + infectivityMinimumIncrease;
                country.pop_aware = (1 + country.pop_aware) * infectivityRate;
                if (country.pop_aware > country.pop_est)
                    country.pop_aware = country.pop_est;
            };

            world.calculatePolicyBalanceOnPreparedness = function() {

                var strategyCount = Object.values(gameParams.policies).reduce((accum, level) => accum + level, 0);
                if (strategyCount == 0)
                    return 1.0;

                var domainMean = strategyCount / 4;
                var ecn = 0, pol = 0, cul = 0, eco = 0;
                Object.keys(gameParams.policies).forEach(policyID => {
                    var policy = gameParams.policyOptions[policyID]
                    var level = gameParams.policies[policyID];
                    switch (policy.domain) {
                        case 1:
                            ecn += level;
                            break;
                        case 2:
                            pol += level;
                            break;
                        case 3:
                            cul += level;
                            break;
                        case 4:
                            eco += level;
                            break;
                    }
                });

                var variances = Math.pow(ecn - domainMean, 2) + Math.pow(pol - domainMean, 2) + Math.pow(cul - domainMean, 2) + Math.pow(eco - domainMean, 2);

                // Suppress the effect of imbalanced resources
                var policyBalance = 1 - Math.pow((variances / Math.pow(strategyCount, 2)), 4);
                
                return policyBalance;

            };


            world.calculateSinglePolicyImpactOnPreparedness = function(country, index) {

                var severityEffect = 1.0;

                var policyID = parseInt(Object.keys(gameParams.policies)[index]);
                var policy = gameParams.policyOptions[policyID];
                var level = gameParams.policies[policyID];

                // Generate a natural log, so that level 1 = 1; level 2 = 1.31; level 3 = 1.55
                var levelMultiplier = Math.log(level + 1.718);

                // Check population
                var pop = parseInt(country.pop_est);
                // https://content.meteoblue.com/en/meteoscool/general-climate-zones
                if (pop < 10000000) {
                    severityEffect *= (1 + policy.effect_on_pop_low * levelMultiplier);
                }
                else if (pop < 100000000) {
                    severityEffect *= (1 + policy.effect_on_pop_medium * levelMultiplier);
                }
                else {
                    severityEffect *= (1 + policy.effect_on_pop_high * levelMultiplier);
                }

                // Check income
                switch (country.income_grp_num ) {
                    case 1:
                    case 2:
                        severityEffect *= (1 + policy.effect_on_income_high * levelMultiplier);
                        break;
                    case 3:
                        severityEffect *= (1 + policy.effect_on_income_medium_high * levelMultiplier);
                        break;
                    case 4:
                        severityEffect *= (1 + policy.effect_on_income_low_medium * levelMultiplier);
                        break;
                    case 5:
                        severityEffect *= (1 + policy.effect_on_income_low * levelMultiplier);
                        break;
                }

                // Check climate zone
                var latitude = parseFloat(country.equator_dist);
                // https://content.meteoblue.com/en/meteoscool/general-climate-zones
                if (latitude > -23.5 && latitude < 23.5) {
                    severityEffect *= (1 + policy.effect_on_geo_tropic * levelMultiplier);
                }
                else if (latitude > -40 && latitude < 40) {
                    severityEffect *= (1 + policy.effect_on_geo_subtropic * levelMultiplier);
                }
                else if (latitude > -60 && latitude < 60) {
                    severityEffect *= (1 + policy.effect_on_geo_temperate * levelMultiplier);
                }
                else {
                    severityEffect *= (1 + policy.effect_on_geo_polar * levelMultiplier);
                }

                // Calculate impact of other strategies

                for (var j = index + 1; j < Object.keys(gameParams.policies).length; j++) {
                    // if (i == j)
                    //     continue;

                    var otherPolicyID = parseInt(Object.keys(gameParams.policies)[j]);
                    var otherLevel = gameParams.policies[otherPolicyID];
                    // Generate a natural log, so that level 1 = 1; level 2 = 1.31; level 3 = 1.55
                    var otherLevelMultiplier = Math.log(otherLevel + 1.718);

                    var relation = gameParams.policyRelations[policyID][otherPolicyID];
                    
                    if (typeof(relation) !== "undefined") {
                    
                        severityEffect *= (1 + relation * otherLevelMultiplier);
                    
                    }

                }

                return severityEffect;

            };

            world.calculatePolicyImpactOnPreparedness = function(country) {
                
                var severityEffect = 1.0;

                for (var i = 0; i < Object.keys(gameParams.policies).length; i++) {

                    severityEffect *= world.calculateSinglePolicyImpactOnPreparedness(country, i);

                }
                
                return severityEffect;

            };

            world.registerPreparednessWithin = function(country) {

                if (country.affected_chance == 0)
                    return;

                // var popAware = country.pop_aware;
                var popAware = country.pop_est;
                var popPrepared = country.pop_prepared;

                // Calculate severity
                var severityIncreaseSpeed = world.scenarioData.threat_details.advanced_stats.severity_increase_speed;
                var severityMinimumIncrease = world.scenarioData.threat_details.advanced_stats.minimum_severity_increase;
                var policyBalance =  world.calculatePolicyBalanceOnPreparedness();
                var policyImpact =  world.calculatePolicyImpactOnPreparedness(country);
                var policyEffect = policyBalance * policyImpact * severityIncreaseSpeed;
                var policyEffectNormalised = 1 + ((policyEffect - 1) / (MONTH_INTERVAL));

                if (severityIncreaseSpeed < severityMinimumIncrease) {

                    severityIncreaseSpeed = severityMinimumIncrease;

                }

                if (popPrepared == 0) {

                    // 1 person
                    popPrepared = 1; //popAware * 0.01;

                }
                else {

                    popPrepared *= (policyEffectNormalised);

                }

                if (popPrepared > popAware) {

                    popPrepared = popAware;

                }

                if (popPrepared > country.pop_est) {

                    popPrepared = country.pop_est;

                }

                country.pop_prepared = popPrepared;

                    
            };
            

            /**
             * Updates the game state at regular intervals
             */
            var updateTime = function() {

                if (gameParams.state !== gameStates.STARTED) {

                    // Refresh the timeout
                    gameParams.timeoutID = setTimeout(updateTime, 10);
                    return;

                }

                gameParams.counter++;


                // Handle automation here
                if (gameParams.automateMode) {

                    // Select resources
                    for (let i = 0 ; i < gameParams.automateScript.policyEvents.length; i++) {

                        let pe = gameParams.automateScript.policyEvents[i];
                        if (gameParams.counter == pe.counter / MONTH_INTERVAL) {

                            fireClickOnTarget(world.btnDevelopPolicy, function() {
                                let resNames = Object.values(RESOURCES).map(res => res.name);
                                let resGrp = Math.floor((pe.policyID - 1) / resNames.length);
                                let element = world.designPolicyLayer.getChildByName(resNames[resGrp]);

                                fireClickOnTarget(element, function() {
                                    let btn = world.designPolicyLayer.policyButtons[pe.policyID - 1];
                                    
                                    fireClickOnTarget(btn, function() {

                                        fireClickOnTarget(world.designPolicyLayer.investButton, function() {

                                            fireClickOnTarget(world.designPolicyLayer.btnExit);

                                        });

                                    });
                                });
                            });
                            break;

                        }
                    };

                    // Select crisis
                    for (let i = 0; i < gameParams.crises.length; i++) {

                        let crisisInCountry = gameParams.crises[i];
                        if (gameParams.counter == crisisInCountry.counter + gameParams.automateScript.crisisDuration) {
                            
                            let target = world.worldBackground.getChildByName("crisis"+crisisInCountry.id);
                            fireClickOnTarget(target);

                        }

                    }

                }

                if (gameParams.counter % gameParams.timeInterval == 0) {

                    gameParams.currentDate = new Date(gameParams.currentDate.valueOf());
                    gameParams.currentDate.setDate(gameParams.currentDate.getDate() + 30.417);

                    // Show message box for each new decade
                    var currentYear = gameParams.currentDate.getFullYear();
                    var previousYear = gameParams.previousDate.getFullYear();
                    
                    // Change of year
                    if (currentYear > previousYear) {

                        gameParams.stats[previousYear] = {
                            loss: gameParams.totalLoss,
                            prepared: gameParams.populationPreparedPercent
                        };

                        // Change of decade
                        if (currentYear % 10 == 0) {

                            var message = "";
                            var showDialog = false;
    
                            // Sort narratives by loss for comparison
                            var narratives = Object.values(NARATIVES.n2040).sort((o1, o2) => {return o2.loss - o1.loss});
    
                            switch (currentYear) {
                                case 2040:
                                    showDialog = true;
                                    for (var i = 0; i < narratives.length; i++) {
                                        var n = narratives[i];
                                        if (gameParams.totalLoss > n.loss) {
                                            var index = Math.floor(Math.random() * n.messages.length);
                                            message = n.messages[index];
                                            break;
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                            
                            if (showDialog) {
    
                                gameParams.state = gameStates.PAUSED;
                                let buttons = showMessageBoxOK(world, 
                                    "Antarctic Bulletin, year " + currentYear, 
                                    message, "OK", function() {
                                        gameParams.state = gameStates.STARTED;
                                    });
    
                                if (gameParams.automateMode) {
    
                                    fireClickOnTarget(buttons[0]);
    
                                }
    
                            }
                        }
    
                    }

                    gameParams.previousDate = gameParams.currentDate;


                    // Add policy robustness and loss
                    var totalPolicy = 0, totalLoss = 0;
                    var countriedAffected = 0, populationAware = 0, populationPrepared = 0;
                    
                    Object.keys(world.countries).forEach( key => {

                        var country = world.countries[key];
                        var loss = world.evaluateLoss(country);

                        if (loss != 0 && country.loss <= 100 && country.loss >= 0) {

                            country.loss = loss;
                            // world.generatePointsForCountry(country, false, country.previousLoss, country.loss);
                            country.previousLoss = country.loss;

                        }

                        if (country.affected_chance) {

                            transmitFrom(country);
                            infectWithin(country);
                            world.registerPreparednessWithin(country);

                            countriedAffected++;
                            populationAware += country.pop_aware;
                            populationPrepared += country.pop_prepared;

                            country.pop_aware_percent = 100 * country.pop_aware / country.pop_est;
                            var existingConvincedPercentage = country.pop_prepared_percent;
                            country.pop_prepared_percent = 100 * country.pop_prepared / country.pop_est;

                            var imin = (existingConvincedPercentage > 0.5) ? parseInt(existingConvincedPercentage) : 0;
                            var imax = (country.pop_prepared_percent > 0.5) ? parseInt(country.pop_prepared_percent) : 0;

                            // world.generatePointsForCountry(country, true, imin, imax);

                        }
                        totalPolicy += country.policy;
                        totalLoss += country.loss;

                    });

                    totalPolicy /= Object.keys(world.countries).length;
                    gameParams.policy = totalPolicy;

                    totalLoss /= Object.keys(world.countries).length;
                    gameParams.previousLoss = totalLoss;
                    gameParams.totalLoss = totalLoss;

                    gameParams.countriedAffected = countriedAffected;
                    gameParams.populationAware = populationAware;
                    gameParams.populationPrepared = populationPrepared;
                    gameParams.populationAwarePercent = 100 * gameParams.populationAware / gameParams.populationWorld;
                    gameParams.populationPreparedPercent = 100 * gameParams.populationPrepared / gameParams.populationWorld;

                    drawPoints();
                    if (gameParams.currentCountry != null)
                        printCountryStats();
                    else {
                        printWorldStats();
                    }

                }
                
                var ri = gameParams.resourceInterval;
                gameParams.crises.forEach(crisisInCountry => {
                    var crisis = CRISES[crisisInCountry.crisis];
                    var country = world.countries[crisisInCountry.country];
                    // Slow down resource production
                    ri *= 1 + -crisis.effect_on_resources;
                    
                });

                // Various events
                if (gameParams.counter % gameParams.crisisInterval == 0) {
                    addCrisis();
                }
                if (gameParams.counter % ri == 0) {
                    addResource();
                }
                if (gameParams.tutorialMode && gameParams.counter % gameParams.tutorialInterval == 0) {
                    addTutorial();
                }

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
                world.resourceScoreLabel.setString(gameParams.resources);
                refreshDate(world);

                // Scroll text
                if (world.tweetLabel.x < -300 || gameParams.messageOverride != null) {
                    var message = gameParams.scenarioName, messageIndex = -1;
                    world.tweetLabel.color = COLOR_ICE;
                    if (gameParams.messageOverride != null) {
                        message = gameParams.messageOverride;
                        gameParams.messageOverride = null;
                        world.tweetAlertLabel.setVisible(true);
                    }
                    // Change label
                    else if (gameParams.totalLoss > 0 || gameParams.populationPreparedPercent > 0) {
                        var weight = gameParams.totalLoss / (gameParams.totalLoss + gameParams.populationPreparedPercent);
                        if (Math.random() < weight) {
                            messageIndex = Math.floor(Math.random() * gameParams.messagesNegative.length);
                            message = gameParams.messagesNegative[messageIndex];
                        }
                        else {
                            messageIndex = Math.floor(Math.random() * gameParams.messagesPositive.length);
                            message = gameParams.messagesPositive[messageIndex];
                        }
                        world.tweetAlertLabel.setVisible(false);
                    }
                    world.tweetLabel.setString(message);
                    world.tweetLabel.setPositionX(world.tweetBackground.width * 1.2);
                    world.tweetAlertLabel.setPositionX(world.tweetLabel.x - 100);
                }
                else {
                    var adjustSpeed = Math.round(20 / gameParams.timeInterval);
                    world.tweetLabel.setPositionX(world.tweetLabel.x - adjustSpeed);
                    world.tweetAlertLabel.setPositionX(world.tweetLabel.x - 100);
                    //world.tweetAlertLabel.setVisible(false);
                }

                // Game over                        
                if (gameParams.totalLoss >= 100) {

                    // Sort narratives by loss for comparison
                    var narratives = Object.values(NARATIVES.n2070).sort((o1, o2) => {return o2.loss - o1.loss});
                    var n = narratives[0];
                    var index = Math.floor(Math.random() * n.messages.length);
                    var message = n.messages[index];
                    gameOver(world, message, "OK");

                }
                // else if (gameParams.currentDate.getFullYear() >= YEAR_TARGET) {
                else if (gameParams.currentDate >= gameParams.targetDate) {

                    var message = "";
                    // Sort narratives by loss for comparison
                    var narratives = Object.values(NARATIVES.n2070).sort((o1, o2) => {return o2.loss - o1.loss});
                    for (var i = 0; i < narratives.length; i++) {
                        var n = narratives[i];
                        if (gameParams.totalLoss > n.loss) {

                            var index = Math.floor(Math.random() * n.messages.length);
                            message = n.messages[index];
                            break;

                        }
                    }

                    gameOver(world, message, "OK");

                }

                // Refresh the timeout
                gameParams.timeoutID = setTimeout(updateTime, 10);

            }; 

            // Run the updates in the background, so interaction is not blocked.
            // cc.async.parallel([
            //     function() {
            //         updateTime();
            //     }
            // ]);
            updateTime();

        };

        var selectCountry = function(event, location) {

            if (gameParams.state !== gameStates.PREPARED && gameParams.state !== gameStates.STARTED && gameParams.state !== gameStates.PAUSED)
                return;
            
            var target = event.getCurrentTarget();
            var locationInNode = target.convertToNodeSpace(location);
            var x = 0, y = 0;

            var layer = target.getLayer("Tile Layer 1");
            gid = layer.getTileGIDAt(x, y);
            if (typeof(layer._texGrids) !== "undefined" && typeof(layer._texGrids[gid]) === "undefined")
                return;

            var start = 0, end = world.sortedObjs.length;
            if (lastLayerID > -1) {
                start = (start < 0) ? 0 : start;
                end = (end > world.sortedObjs.length) ? world.sortedObjs.length : end;
            };

            var ed = function(pt1, pt2) {
                return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
            };
            var minED = -1, selectedCountry = null;
            for (var j = start; j < end; j++) {
                var poly = world.sortedObjs[j];
                var mousePoint = new cc.p(locationInNode.x - poly.x, size.height - locationInNode.y - (size.height - poly.y));
                var cd = world.collisionDetection(poly.points, mousePoint);
                if (cd) {
                    lastLayerID = j;
                    var countryObj = world.countries[poly.name];
                    var ced = ed(countryObj.centroid, mousePoint);
                    if (minED === -1 || ced < minED) {
                        minED = ced;
                        selectedCountry = poly.name;
                        selectedCountry.selected = true;
                    }
                }
            }

            // Pick the match with the closest centroid ID
            var currentLayer = null;
            if (selectedCountry != null) {
                if (gameParams.currentCountry != null)
                    world.countries[gameParams.currentCountry].selected = false;
                gameParams.currentCountry = selectedCountry;
                if (gameParams.currentCountry != null)
                    world.countries[gameParams.currentCountry].selected = true;
                currentCountry = selectedCountry;
                var gid = world.countries[selectedCountry].gid;
                currentLayer = target.getLayer("Tile Layer " + gid);
                // currentLayer.setTileGID((gid),cc.p(0, 0));
                printCountryStats();
            }
            else {
                if (gameParams.currentCountry != null)
                    world.countries[gameParams.currentCountry].selected = false;
                gameParams.currentCountry = null;
                printWorldStats();
            }

            oldLayers.forEach(layer => {
                // var currentGid = -1;
                // if (typeof(gameParams.currentCountry) !== 'undefined')
                //     currentGid = parseInt(world.countries[gameParams.currentCountry].gid);
                // var testGid = layer.getTileGIDAt(cc.p(0,0));
                // cc.log(testGid, currentGid);
                // if (testGid > 0 && testGid === currentGid) {
                //     // Do nothing
                // }
                // else 

                // if ((currentLayer === null || layer != currentLayer))
                //     layer.setTileGID((0),cc.p(0,0));
            });
            oldLayers = [];
            if (currentLayer != null)
                oldLayers.push(currentLayer);

            return true;
        };

        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,

            onMouseMove : function(event) {
             
                selectCountry(event, event.getLocation());

            },

            onMouseUp : function(event) {
             
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());

                gameParams.statsCountry = gameParams.currentCountry;
                // For debugging point generation
                // cc.debug(locationInNode);

            }

        }, this.map);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan : function(touch, event) {

                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {  
                    target.TOUCHED = true;
                    return true;
                }
                return false;

            },
            onTouchEnded : function(touch, event) {

                var target = event.getCurrentTarget();
                if (target.TOUCHED) {

                    target.TOUCHED = false;
                    selectCountry(event, touch.getLocation());

                }
                return true;

            }
        }, this.map);


        var beginSim = function() {

            gameParams.state = gameStates.PREPARED;

            world.btnPause.setBright(true);
            world.btnPlay.setBright(false);
            world.btnFF.setBright(true);

            doSim();
            // Add particle emitter
            //addEmitter();

        };

        var nestedButtons = null;
        let buttons = showMessageBoxOK(world, world.scenarioData.popup_1_title, world.scenarioData.popup_1_description, 
            "Start Tutorial", function(that) {
                gameParams.tutorialMode = true;
                var keys = Object.keys(world.countries);
                gameParams.startCountry = "UGA";
                // gameParams.startCountry = keys[Math.floor(Math.random() * keys.length)]
                gameParams.statsCountry = gameParams.currentCountry;
                gameParams.currentCountry = gameParams.startCountry;
                var countryName = world.countries[gameParams.startCountry].name;
                nestedButtons = showMessageBoxOK(world, "Prepare the world...", 
                    "In 2019, your global policy mission begins in "  + countryName + ". You have until 2070 to save the Antarctic continent. Invest in policies that will reduce the effects of climate change, arrest environemntal loss and increase the preparedness of each country.", world.scenarioData.popup_2_title, 
                    function(that) {
                    beginSim();
                });
            },
            "Skip Tutorial", function(that) {
                gameParams.tutorialMode = false;
                gameParams.startCountry = "UGA";
                // gameParams.startCountry = keys[Math.floor(Math.random() * keys.length)]
                gameParams.statsCountry = gameParams.currentCountry;
                gameParams.currentCountry = gameParams.startCountry;
                var countryName = world.countries[gameParams.startCountry].name;
                nestedButtons = showMessageBoxOK(world, "Prepare the world...", 
                    "In 2019, your global policy mission begins in "  + countryName + ". You have until 2070 to save the Antarctic continent. Invest in policies that will reduce the effects of climate change, arrest environemntal loss and increase the preparedness of each country.", world.scenarioData.popup_2_title, 
                    function(that) {
                       beginSim();
                    });
            }
        );

        if (gameParams.automateMode) {

            fireClickOnTarget(buttons[1], function() {

                fireClickOnTarget(nestedButtons[0], function() {

                    if (gameParams.automateScript.fastForward) {

                        updateTimeVars(MONTH_INTERVAL / 20);
                        gameParams.state = gameStates.STARTED;
                        world.btnPause.enabled = true;
                        world.btnPlay.enabled = true;
                        world.btnFF.enabled = false;

                    }

                });

            });

        }                    

    }
});

var WorldScene = cc.Scene.extend({
    ctor:function (automateID) {
        this._super();

        if (typeof(automateID) !== "undefined")
            this.automateID = automateID;
        else
            this.automateID = -1;
    },

    onEnter:function () {
        this._super();

        var scene = this;
        
        // Add country data 
        cc.loader.loadJson("res/scenario-nature.json",function(error, scenarioData){

            // Add script data 
            cc.loader.loadJson("res/automate.json",function(error, data){
                
                automateScripts = data;

                var layer = new WorldLayer(scenarioData, scene.automateID);
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

        var layout = new ccui.Layout();
        layout.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        layout.setBackGroundColor(COLOR_BACKGROUND);
        layout.setContentSize(cc.size(size.width, size.height / 2));
        var layoutSize = layout.getContentSize();
        layout.setLayoutType(ccui.Layout.RELATIVE);
        layout.attr({ x: size.width / 2 - layoutSize.width / 2, y: size.height / 2 - layoutSize.height / 2 });
        layer.addChild(layout, 1);

        // layer.setTouchEnabled(true);
        // layer.setSwallowTouches(false);
        layout.setTouchEnabled(true);
        layout.setSwallowTouches(true);

        var antarcticaSprite = new cc.Sprite(res.antarctica_large_png);
        antarcticaSprite.setAnchorPoint(new cc.p(0.5,0.5));
        antarcticaSprite.setContentSize(cc.size(100, 101));
        antarcticaSprite.setScale(1.5);
        antarcticaSprite.setPosition(cc.p(size.width / 2, 7 * size.height / 8));
        layer.addChild(antarcticaSprite, 101);
        
        var margin = new ccui.Margin(0, 0, 0, 0);
        var lp0 = new ccui.RelativeLayoutParameter();
        lp0.setMargin(margin);
        lp0.setAlign(ccui.RelativeLayoutParameter.PARENT_TOP_CENTER_HORIZONTAL);
        var lblWelcome = new ccui.Text("Welcome to the Antarctica Futures game!", FONT_FACE_BODY, 36);
        lblWelcome.color = COLOR_FOREGROUND;
        lblWelcome.setLayoutParameter(lp0);
        layout.addChild(lblWelcome);

        var lp1 = new ccui.RelativeLayoutParameter();
        lp1.setMargin(margin);
        lp1.setAlign(ccui.RelativeLayoutParameter.CENTER_IN_PARENT);
        var btnPlay = new ccui.Button();
        btnPlay.setContentSize(cc.size(320, 80));
        btnPlay.setTouchEnabled(true);
        btnPlay.setSwallowTouches(false);
        btnPlay.setPressedActionEnabled(true);
        btnPlay.setScale9Enabled(true);
        btnPlay.loadTextures(res.button_white, res.button_white, res.button_white);
        btnPlay.setTitleText("PLAY");
        btnPlay.setTitleFontName(FONT_FACE_BODY);
        btnPlay.setTitleColor(COLOR_BLACK);
        btnPlay.setTitleFontSize(38);
        // btnPlay.attr({x: size.width / 2, y: size.height / 2});
        btnPlay.setLayoutParameter(lp1);
        layout.addChild(btnPlay, 100);

        var lp2 = new ccui.RelativeLayoutParameter();
        lp2.setMargin(margin);
        lp2.setAlign(ccui.RelativeLayoutParameter.PARENT_BOTTOM_CENTER_HORIZONTAL);
        var btnLearnMore = new ccui.Button();
        btnLearnMore.setContentSize(cc.size(320, 80));
        btnLearnMore.setTouchEnabled(true);
        btnLearnMore.setSwallowTouches(false);
        btnLearnMore.setPressedActionEnabled(true);
        btnLearnMore.setScale9Enabled(true);
        btnLearnMore.loadTextures(res.button_grey, res.button_grey, res.button_grey);
        btnLearnMore.setTitleText("LEARN MORE");
        btnLearnMore.setTitleFontName(FONT_FACE_BODY);
        btnLearnMore.setTitleColor(COLOR_BLACK);
        btnLearnMore.setTitleFontSize(38);
        // btnLearnMore.attr({x: size.width / 2, y: size.height / 2});
        btnLearnMore.setLayoutParameter(lp2);
        layout.addChild(btnLearnMore, 100);

        
        var btnAutomate1 = new ccui.Button();
        btnAutomate1.setContentSize(cc.size(80, 80));
        btnAutomate1.setTouchEnabled(true);
        btnAutomate1.setSwallowTouches(false);
        btnAutomate1.setPressedActionEnabled(true);
        btnAutomate1.setScale9Enabled(true);
        btnAutomate1.setPosition(cc.p(0, 0));
        layer.addChild(btnAutomate1, 100);

        var btnAutomate2 = new ccui.Button();
        btnAutomate2.setContentSize(cc.size(80, 80));
        btnAutomate2.setTouchEnabled(true);
        btnAutomate2.setSwallowTouches(false);
        btnAutomate2.setPressedActionEnabled(true);
        btnAutomate2.setScale9Enabled(true);
        btnAutomate2.setPosition(cc.p(100, 0));
        layer.addChild(btnAutomate2, 100);

        var btnAutomate3 = new ccui.Button();
        btnAutomate3.setContentSize(cc.size(80, 80));
        btnAutomate3.setTouchEnabled(true);
        btnAutomate3.setSwallowTouches(false);
        btnAutomate3.setPressedActionEnabled(true);
        btnAutomate3.setScale9Enabled(true);
        btnAutomate3.setPosition(cc.p(200, 0));
        layer.addChild(btnAutomate3, 100);

        var btnAutomate4 = new ccui.Button();
        btnAutomate4.setContentSize(cc.size(80, 80));
        btnAutomate4.setTouchEnabled(true);
        btnAutomate4.setSwallowTouches(false);
        btnAutomate4.setPressedActionEnabled(true);
        btnAutomate4.setScale9Enabled(true);
        btnAutomate4.setPosition(cc.p(300, 0));
        layer.addChild(btnAutomate4, 100);

        var btnAutomate5 = new ccui.Button();
        btnAutomate5.setContentSize(cc.size(80, 80));
        btnAutomate5.setTouchEnabled(true);
        btnAutomate5.setSwallowTouches(false);
        btnAutomate5.setPressedActionEnabled(true);
        btnAutomate5.setScale9Enabled(true);
        btnAutomate5.setPosition(cc.p(400, 0));
        layer.addChild(btnAutomate5, 100);

        /*
        // Test adding animation effects
        btnLearnMore.attr({x: size.width / 2, y: 0});
        layer.addChild(btnLearnMore, 2);

        var move = cc.moveBy(2, cc.p(0, size.height - 80));
        var move_ease_in = move.clone().easing(cc.easeElasticIn());
        var seq1 = cc.sequence(move_ease_in);

        var a2 = btnLearnMore.runAction(seq1.repeatForever());
        a2.tag = 1;
        */

        var automateHandler1 = function() { 
            cc.director.runScene(new WorldScene(1)); 
        };
        var automateHandler2 = function() { 
            cc.director.runScene(new WorldScene(2)); 
        };
        var automateHandler3 = function() { 
            cc.director.runScene(new WorldScene(3)); 
        };
        var automateHandler4 = function() { 
            cc.director.runScene(new WorldScene(4)); 
        };
        var automateHandler5 = function() { 
            cc.director.runScene(new WorldScene(5)); 
        };
        var playHandler = function() { 
            cc.director.runScene(new WorldScene()); 
            // cc.director.runScene(new cc.TransitionMoveInR(1, new NewGameScene()));
        };
        var learnMoreHandler = function() {
            cc.sys.openURL("https://antarctic-cities.org/the-game/");
        };

        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed:  function(keyCode, event){
                },
                onKeyReleased: function(keyCode, event){
                    var automateID = parseInt(cc.sys.isNative ? that.getNativeKeyName(keyCode) : String.fromCharCode(keyCode)) ;
                    console.log(automateID);
                    if (!isNaN(automateID) && automateID > 0 && automateID < 6 ) {
                        cc.director.runScene(new WorldScene(automateID)); 
                    }
                }
            }, layer);
        }

        // handleMouseTouchEvent(antarcticaSprite, automateHandler1);
        handleMouseTouchEvent(btnAutomate1, automateHandler1);
        handleMouseTouchEvent(btnAutomate2, automateHandler2);
        handleMouseTouchEvent(btnAutomate3, automateHandler3);
        handleMouseTouchEvent(btnAutomate4, automateHandler4);
        handleMouseTouchEvent(btnAutomate5, automateHandler5);
        handleMouseTouchEvent(btnPlay, playHandler);
        handleMouseTouchEvent(btnLearnMore, learnMoreHandler);

    }
});


var NewGameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var layer = this;
        var size = cc.winSize;

        var layerBackground = new cc.LayerColor(COLOR_BACKGROUND, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        layer.addChild(layerBackground, 1);

        var newLabel = new cc.LabelTTF("New Game", FONT_FACE_BODY, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.8})
        this.addChild(newLabel);

        var loadLabel = new cc.LabelTTF("Load Game", FONT_FACE_BODY, 38);
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

        var newLabel = new cc.LabelTTF("Select a Challenge", FONT_FACE_BODY, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.4})
        this.addChild(newLabel);

        var waterLabel = new cc.LabelTTF("Water Challenge", FONT_FACE_BODY, 38);
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

        var layerBackground = new cc.LayerColor(COLOR_BACKGROUND, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        layer.addChild(layerBackground, 1);

        var newLabel = new cc.LabelTTF("Select a game difficulty", FONT_FACE_BODY, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.8})
        this.addChild(newLabel);

        var casualLabel = new cc.LabelTTF("Casual", FONT_FACE_BODY, 38);
        casualLabel.attr({x: size.width * 0.25, y: size.height * 0.5})
        this.addChild(casualLabel);

        var normalLabel = new cc.LabelTTF("Normal", FONT_FACE_BODY, 38);
        normalLabel.attr({x: size.width * 0.5, y: size.height * 0.5})
        this.addChild(normalLabel);

        var brutalLabel = new cc.LabelTTF("Brutal", FONT_FACE_BODY, 38);
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

        var newLabel = new cc.LabelTTF("Enter a name for your policy", FONT_FACE_BODY, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.8});
        this.addChild(newLabel);

        var enterNameLabel = new cc.LabelTTF("Just click for now", FONT_FACE_BODY, 38);
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

        var newLabel = new cc.LabelTTF("Modify Code", FONT_FACE_BODY, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.8})
        this.addChild(newLabel);

        var modifyCodeLabel = new cc.LabelTTF("Just click for now", FONT_FACE_BODY, 38);
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
        world.designPolicyLayer = this;

    },
    onEnter:function () {
        this._super();

        var layer = this;
        var size = cc.winSize;
        var resourceSelected = null;
        var resourceSelectedButton = null;

        // For automation
        layer.policyButtons = [];

        var layerBackground = new cc.LayerColor(COLOR_BLACK, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        layer.addChild(layerBackground, 1);

        var heading = new ccui.Text("Build a policy platform", FONT_FACE_BODY, 38);
        heading.attr({x: size.width * 0.5, y: size.height * 0.9});
        heading.setColor(COLOR_ICE);
        layer.addChild(heading, 101);

        var btnExit = new ccui.Button();
        btnExit.setTouchEnabled(true);
        btnExit.setSwallowTouches(false);
        btnExit.setPosition(cc.p(size.width * 0.9, size.height * 0.9));
        btnExit.setColor(COLOR_ICE);
        btnExit.setTitleFontSize(72);
        btnExit.setTitleText("X");
        handleMouseTouchEvent(btnExit, function() {
            world.setVisible(true);
            layer.removeFromParent();
            gameParams.state = gameStates.STARTED;
        });
        layer.btnExit = btnExit;
        layer.addChild(btnExit, 102);

        var policyDetailsBackground = new cc.LayerColor(COLOR_BLACK, 400, 400);
        policyDetailsBackground.setAnchorPoint(cc.p(0, 0));
        policyDetailsBackground.setPosition(cc.p(800, 200));
        layer.addChild(policyDetailsBackground, 110);

        var policyLabel = new ccui.Text("", FONT_FACE_BODY, 30);
        policyLabel.setColor(COLOR_ICE);
        policyLabel.setAnchorPoint(cc.p(0, 0));
        policyLabel.setPosition(cc.p(20, 340));
        policyDetailsBackground.addChild(policyLabel);

        var policyDescription = new ccui.Text("", FONT_FACE_BODY, 20);
        policyDescription.ignoreContentAdaptWithSize(false);
        policyDescription.setAnchorPoint(cc.p(0, 0));
        policyDescription.setContentSize(cc.size(360,200));
        policyDescription.setPosition(cc.p(20, 120));
        policyDescription.setColor(COLOR_ICE);
        policyDetailsBackground.addChild(policyDescription, 2);

        var policyCostLabel = new ccui.Text("", FONT_FACE_BODY, 30);
        policyCostLabel.setColor(COLOR_ICE);
        policyCostLabel.setAnchorPoint(cc.p(0, 0));
        policyCostLabel.setPosition(cc.p(20, 80));
        policyDetailsBackground.addChild(policyCostLabel);

        var btnPolicyInvest = new ccui.Button(res.button_white);
        btnPolicyInvest.setTouchEnabled(true);
        btnPolicyInvest.setSwallowTouches(false);
        btnPolicyInvest.setSize(cc.size(300, 60));
        btnPolicyInvest.setScale9Enabled(true);
        btnPolicyInvest.setPosition(cc.p(20, 0));
        btnPolicyInvest.setAnchorPoint(cc.p(0, 0));
        btnPolicyInvest.setTitleFontSize(24);
        btnPolicyInvest.setTitleColor(COLOR_BLACK);
        btnPolicyInvest.setTitleText("Invest in this policy");
        
        // For automation
        layer.investButton = btnPolicyInvest;

        var calculateResourceAndCrisisImpacts = function(resource) {

            // Calculate resource-specific effects
            gameParams.resourceInterval /= (1 + resource.effect_on_resources);
            gameParams.resourceInterval = Math.floor(gameParams.resourceInterval);
            gameParams.crisisInterval /= (1 + resource.effect_on_crises);
            gameParams.crisisInterval = Math.floor(gameParams.crisisInterval);

        };

        handleMouseTouchEvent(btnPolicyInvest, function(){

            if (gameParams.resources - resourceSelected.cost_1 >= 0 && 
                typeof(gameParams.policies[resourceSelected.id]) === "undefined") {

                gameParams.resources -= resourceSelected.cost_1;  
                gameParams.policies[resourceSelected.id] = 1;
                resourceSelectedButton.enabled = false;
                layer.resourceScoreLabel.setString(gameParams.resources.toString());
                levelButtons[resourceSelected.id * 100 + 1].texture = res.policy_dot_on_png;

                calculateResourceAndCrisisImpacts(resourceSelected);

            }
            else if (gameParams.resources - resourceSelected.cost_2 >= 0 && 
                gameParams.policies[resourceSelected.id] === 1) {

                gameParams.resources -= resourceSelected.cost_2;  
                gameParams.policies[resourceSelected.id] = 2;
                resourceSelectedButton.enabled = false;
                layer.resourceScoreLabel.setString(gameParams.resources.toString());
                levelButtons[resourceSelected.id * 100 + 2].texture = res.policy_dot_on_png;

                calculateResourceAndCrisisImpacts(resourceSelected);

            }
            else if (gameParams.resources - resourceSelected.cost_3 >= 0 && 
                gameParams.policies[resourceSelected.id] == 2) {

                gameParams.resources -= resourceSelected.cost_3;  
                gameParams.policies[resourceSelected.id] = 3;
                resourceSelectedButton.enabled = false;
                layer.resourceScoreLabel.setString(gameParams.resources.toString());
                levelButtons[resourceSelected.id * 100 + 3].texture = res.policy_dot_on_png;

                calculateResourceAndCrisisImpacts(resourceSelected);
    
            }
        })
        policyDetailsBackground.addChild(btnPolicyInvest, 100);
        policyDetailsBackground.setVisible(false);

        var pageView = new ccui.PageView();
        pageView.setContentSize(cc.size(size.width, size.height - Y_OFFSET));
        pageView.setAnchorPoint(cc.p(0, 0));
        pageView.setPosition(cc.p(X_OFFSET, Y_OFFSET));
        var pageCount = 4;
        var levelButtons = {};
       
        for (var i = 0; i < pageCount; ++i) {
            var layout = new ccui.Layout();
            layout.setContentSize(cc.size(layout.getContentSize().width * 0.5, layout.getContentSize().height * 0.5));

            var resourceGrp = {};
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
            var label = new ccui.Text(resourceGrp.labelText, FONT_FACE_BODY, 30);
            label.setColor(COLOR_ICE);
            label.setAnchorPoint(cc.p(0, 0));
            label.setPosition(cc.p(100, pageView.getContentSize().height * 0.8));

            resourceGrp.policyOptions.forEach(function(opt) {

                var btn = new ccui.Button();
                btn.setName(opt.text);
                btn.setTouchEnabled(true);
                btn.setSwallowTouches(false);
                btn.setAnchorPoint(cc.p(0, 0));
                btn.setScale9Enabled(true);
                btn.loadTextures(opt.img_normal, "", opt.img_on);
                btn.attr(opt.location);
                btn.setContentSize(cc.size(104, 104));
                layer.policyButtons.push(btn);

                btn.cost_1 = opt.cost_1;
                btn.cost_2 = opt.cost_2;
                btn.cost_3 = opt.cost_3;
                btn.option = opt;

                if (typeof(gameParams.policies[opt.id]) !== "undefined")
                    btn.enabled = false;
                
                handleMouseTouchEvent(btn, function(target) {
                    policyDetailsBackground.setVisible(true);
                    resourceSelected = target.option;
                    policyLabel.setString(resourceSelected.text_long);
                    policyDescription.setString(resourceSelected.description);
                    policyCostLabel.setString("Cost: " + resourceSelected.cost_1.toString());
                    resourceSelectedButton = target;
                });
                layout.addChild(btn, 101);

                var btnLabel = new cc.LabelTTF(opt.text, FONT_FACE_TITLE, 20);
                btnLabel.attr({ x: opt.location.x + 26  , y: opt.location.y - 52 });
                btnLabel.setAnchorPoint(cc.p(0.5, 0.0));
                layout.addChild(btnLabel, 101);

                var btnLvl1, btnLvl2, btnLvl3;
                if (typeof(gameParams.policies[opt.id]) === "undefined") {
                    btnLvl1 = new cc.Sprite(res.policy_dot_off_png);
                    btnLvl2 = new cc.Sprite(res.policy_dot_off_png);
                    btnLvl3 = new cc.Sprite(res.policy_dot_off_png);
                }
                else if (gameParams.policies[opt.id] === 1) {
                    btnLvl1 = new cc.Sprite(res.policy_dot_on_png);
                    btnLvl2 = new cc.Sprite(res.policy_dot_off_png);
                    btnLvl3 = new cc.Sprite(res.policy_dot_off_png);
                }
                else if (gameParams.policies[opt.id] === 2) {
                    btnLvl1 = new cc.Sprite(res.policy_dot_on_png);
                    btnLvl2 = new cc.Sprite(res.policy_dot_on_png);
                    btnLvl3 = new cc.Sprite(res.policy_dot_off_png);
                }
                else if (gameParams.policies[opt.id] === 3) {
                    btnLvl1 = new cc.Sprite(res.policy_dot_on_png);
                    btnLvl2 = new cc.Sprite(res.policy_dot_on_png);
                    btnLvl3 = new cc.Sprite(res.policy_dot_on_png);
                }
                btnLvl1.attr({ x: opt.location.x - 52 , y: opt.location.y });
                btnLvl1.setAnchorPoint(cc.p(0.0, 0.0));
                btnLvl2.attr({ x: opt.location.x - 52 , y: opt.location.y + 35 })
                btnLvl2.setAnchorPoint(cc.p(0.0, 0.0));
                btnLvl3.attr({ x: opt.location.x - 52 , y: opt.location.y + 70 })
                btnLvl3.setAnchorPoint(cc.p(0.0, 0.0));
                layout.addChild(btnLvl1, 101);
                layout.addChild(btnLvl2, 101);
                layout.addChild(btnLvl3, 101);

                levelButtons[opt.id * 100 + 1] = btnLvl1;
                levelButtons[opt.id * 100 + 2] = btnLvl2;
                levelButtons[opt.id * 100 + 3] = btnLvl3;
                
            });
            pageView.insertPage(layout, i);
        }
        layer.addChild(pageView, 100);
        pageView.setCurrentPageIndex(0);

        //add buttons to jump to specific page
        var prevButton = null;
        var makeButton = function(text, point, index) {
            var btn = new ccui.Button();
            btn.setTouchEnabled(true);
            btn.setSwallowTouches(false);
            btn.setAnchorPoint(cc.p(0, 0));
            btn.setColor(COLOR_ICE);
            btn.setPosition(point);
            btn.setName(text);
            btn.setTitleText(text);
            btn.setTitleFontSize(36);
            btn.setTitleFontName(FONT_FACE_TITLE);
            handleMouseTouchEvent(btn, function(){
                resourceSelected = null;
                policyDetailsBackground.setVisible(false);
                pageView.setCurrentPageIndex(index);
                btn.setBright(false);
                btn.enabled = false;
                btn.setColor(COLOR_OAK);
                if (prevButton != null && prevButton != btn) {
                    prevButton.setBright(true);
                    prevButton.enabled = true;
                    prevButton.setColor(COLOR_ICE);
                }
                prevButton = btn;
            });
            // Select the first button only
            if (index == 0) {
                btn.setBright(false);
                btn.enabled = false;
                btn.setColor(COLOR_OAK);
                prevButton = btn;
            }
            layer.addChild(btn, 100);
        };

        Object.values(RESOURCES).forEach((res, index) => {
            makeButton(res.name, cc.p(300 + 200 * index, 80), index);
        });

        // Add resource
        this.resourceScoreBackground = new cc.LayerColor(COLOR_RESOURCE, 160, Y_OFFSET);
        this.resourceScoreBackground.setAnchorPoint(cc.p(0, 0));
        this.resourceScoreBackground.setPosition(cc.p(0, 80));
        layer.addChild(this.resourceScoreBackground, 100);

        var antarcticaSmallSprite = new cc.Sprite(res.antarctica_small_png);
        antarcticaSmallSprite.setAnchorPoint(new cc.p(0.5, 0.5));
        antarcticaSmallSprite.setContentSize(cc.size(50, 51));
        antarcticaSmallSprite.setScale(0.8);
        antarcticaSmallSprite.setPosition(cc.p(40, 25));
        this.resourceScoreBackground.addChild(antarcticaSmallSprite, 100);

        this.resourceScoreLabel = new cc.LabelTTF(gameParams.resources.toString(), FONT_FACE_BODY, 30);
        this.resourceScoreLabel.setAnchorPoint(cc.p(0.5, 0.5));
        this.resourceScoreLabel.setPosition(cc.p(80, 25));
        this.resourceScoreLabel.setColor(COLOR_LICORICE);
        this.resourceScoreBackground.addChild(this.resourceScoreLabel, 100);

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
        layer.addChild(layerBackground, 1);

        var heading = new ccui.Text("Track how the world is doing", FONT_FACE_BODY, 38);
        heading.attr({x: size.width * 0.5, y: size.height * 0.9});
        heading.setColor(COLOR_ICE);
        layer.addChild(heading, 101);

        var pageView = new ccui.PageView();
        pageView.setContentSize(cc.size(size.width, size.height - 80));
        pageView.setAnchorPoint(cc.p(0, 0));
        pageView.setPosition(cc.p(0, 0));


        var layoutWorld = new ccui.Layout();
        layoutWorld.setContentSize(size.width * 0.5, size.height * 0.5);
        // pageView.insertPage(layoutWorld, 0);

        var layoutCountries = new ccui.Layout();
        layoutCountries.setContentSize(size.width * 0.5, size.height * 0.5);
        // pageView.insertPage(layoutCountries, 1);

        var layoutTime = new ccui.Layout();
        layoutTime.setContentSize(size.width * 0.5, size.height * 0.5);
        // pageView.insertPage(layoutTime, 2);

        // layer.addChild(pageView, 100);
        layerBackground.addChild(layoutWorld, 100);
        layerBackground.addChild(layoutCountries, 100);
        layerBackground.addChild(layoutTime, 100);
        layoutWorld.setVisible(true);
        layoutCountries.setVisible(false);
        layoutTime.setVisible(false);

        //add buttons to jump to specific page
        var prevButton = null;
        var makeButton = function(text, point, index) {
            var btn = new ccui.Button();
            btn.setTouchEnabled(true);
            btn.setSwallowTouches(false);
            btn.setAnchorPoint(cc.p(0, 0));
            btn.setColor(COLOR_ICE);
            btn.setPosition(point);
            btn.setName(text);
            btn.setTitleText(text);
            btn.setTitleFontSize(36);
            btn.setTitleFontName(FONT_FACE_TITLE);
            handleMouseTouchEvent(btn, function(){
                //pageView.setCurrentPageIndex(index);
                switch(index) {
                    case 0:
                    default:
                        layoutWorld.setVisible(true);
                        layoutCountries.setVisible(false);
                        layoutTime.setVisible(false);
                        break;
                    case 1:
                        layoutWorld.setVisible(false);
                        layoutCountries.setVisible(true);
                        layoutTime.setVisible(false);
                        break;
                    case 2:
                        layoutWorld.setVisible(false);
                        layoutCountries.setVisible(false);
                        layoutTime.setVisible(true);
                        break;
            
                }
                btn.setBright(false);
                btn.enabled = false;
                btn.setColor(COLOR_OAK);
                if (prevButton != null && prevButton != btn) {
                    prevButton.setBright(true);
                    prevButton.enabled = true;
                    prevButton.setColor(COLOR_ICE);
                }
                prevButton = btn;
            });
            // Select the first button only
            if (index == 0) {
                btn.setBright(false);
                btn.enabled = false;
                btn.setColor(COLOR_OAK);
                prevButton = btn;
            }
            layer.addChild(btn, 100);
        };

        makeButton("World", cc.p(300, 80), 0);
        makeButton("Countries", cc.p(600, 80), 1);
        makeButton("Trends", cc.p(900, 80), 2);

        // Add resource
        this.resourceScoreBackground = new cc.LayerColor(COLOR_RESOURCE, 160, Y_OFFSET);
        this.resourceScoreBackground.setAnchorPoint(cc.p(0, 0));
        this.resourceScoreBackground.setPosition(cc.p(0, 80));
        layer.addChild(this.resourceScoreBackground, 100);

        var antarcticaSmallSprite = new cc.Sprite(res.antarctica_small_png);
        antarcticaSmallSprite.setAnchorPoint(new cc.p(0.5, 0.5));
        antarcticaSmallSprite.setContentSize(cc.size(50, 51));
        antarcticaSmallSprite.setScale(0.8);
        antarcticaSmallSprite.setPosition(cc.p(40, 25));
        this.resourceScoreBackground.addChild(antarcticaSmallSprite, 100);

        this.resourceScoreLabel = new cc.LabelTTF(gameParams.resources.toString(), FONT_FACE_BODY, 30);
        this.resourceScoreLabel.setAnchorPoint(cc.p(0.5, 0.5));
        this.resourceScoreLabel.setPosition(cc.p(80, 25));
        this.resourceScoreLabel.setColor(COLOR_LICORICE);
        this.resourceScoreBackground.addChild(this.resourceScoreLabel, 100);

        var makeString = function(num) { return (Math.round(num * 10) / 10).toString() + '%'; };

        // FOR THE WORLD STATISTICS PAGE

        this.yearLabel = new cc.LabelTTF("Year " + gameParams.currentDate.getFullYear(), FONT_FACE_TITLE, 30);
        this.yearLabel.setAnchorPoint(cc.p(0, 0));
        this.yearLabel.setPosition(cc.p(size.width * 0.2, size.height * 0.75));
        layoutWorld.addChild(this.yearLabel, 100);

        this.yearDescriptionLabel = new cc.LabelTTF("You have " + (gameParams.targetDate.getFullYear() - gameParams.currentDate.getFullYear()) + " years until the end of the simulation.", FONT_FACE_BODY, 20);
        this.yearDescriptionLabel.setAnchorPoint(cc.p(0, 0));
        this.yearDescriptionLabel.setPosition(cc.p(size.width * 0.2, size.height * 0.7));
        layoutWorld.addChild(this.yearDescriptionLabel, 100);

        this.destructionLabel = new cc.LabelTTF("Environmental loss", FONT_FACE_TITLE, 30);
        this.destructionLabel.setAnchorPoint(cc.p(0, 0));
        this.destructionLabel.setPosition(cc.p(size.width * 0.2, size.height * 0.55));
        layoutWorld.addChild(this.destructionLabel, 100);

        this.destructionDescriptionLabel = new cc.LabelTTF("Since " + gameParams.startDate.getFullYear() + ", the global environment has declined by " + makeString(gameParams.totalLoss) + "." , FONT_FACE_BODY, 20);
        this.destructionDescriptionLabel.setAnchorPoint(cc.p(0, 0));
        this.destructionDescriptionLabel.setPosition(cc.p(size.width * 0.2, size.height * 0.5));
        layoutWorld.addChild(this.destructionDescriptionLabel, 100);
        
        this.policyLabel = new cc.LabelTTF("Preparedness " + makeString(gameParams.populationPreparedPercent) + " / " + Math.round(gameParams.populationPrepared / 1000000) + "M", FONT_FACE_TITLE, 30);
        this.policyLabel.setAnchorPoint(cc.p(0, 0));
        this.policyLabel.setPosition(cc.p(size.width * 0.2, size.height * 0.35));
        layoutWorld.addChild(this.policyLabel, 100);
        
        this.policyDescriptionLabel = new cc.LabelTTF("Thanks to your policy platform, " + makeString(gameParams.populationPreparedPercent) + " of the world is now more ready to tak action against climate change." , FONT_FACE_BODY, 20);
        this.policyDescriptionLabel.setAnchorPoint(cc.p(0, 0));
        this.policyDescriptionLabel.setPosition(cc.p(size.width * 0.2, size.height * 0.3));
        layoutWorld.addChild(this.policyDescriptionLabel, 100);


        // Country details
        /*
        var countryTag = gameParams.statsCountry;
        if (typeof(countryTag) === "undefined" || countryTag === null)
            countryTag = gameParams.startCountry;

        var country = world.countries[countryTag];
        this.currentCountryLabel = new cc.LabelTTF("Selected Country: ", FONT_FACE_BODY, 24);
        this.currentCountryLabel.setAnchorPoint(cc.p(0, 0));
        this.currentCountryLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.6));
        layoutWorld.addChild(this.currentCountryLabel, 100);

        this.currentCountryIndicatorLabel = new cc.LabelTTF(country.name, FONT_FACE_BODY, 24);
        this.currentCountryIndicatorLabel.setAnchorPoint(cc.p(0, 0));
        this.currentCountryIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.6));
        layoutWorld.addChild(this.currentCountryIndicatorLabel, 100);

        this.regionLabel = new cc.LabelTTF("Country Destruction (%):", FONT_FACE_BODY, 24);
        this.regionLabel.setAnchorPoint(cc.p(0, 0));
        this.regionLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.55));
        layoutWorld.addChild(this.regionLabel, 100);

        this.regionIndicatorLabel = new cc.LabelTTF(makeString(country.loss), FONT_FACE_BODY, 24);
        this.regionIndicatorLabel.setAnchorPoint(cc.p(0, 0));
        this.regionIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.55));
        layoutWorld.addChild(this.regionIndicatorLabel, 100);

        this.regionLabel = new cc.LabelTTF("Country Preparedness (%):", FONT_FACE_BODY, 24);
        this.regionLabel.setAnchorPoint(cc.p(0, 0));
        this.regionLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.5));
        layoutWorld.addChild(this.regionLabel, 100);

        this.regionIndicatorLabel = new cc.LabelTTF(makeString(country.pop_prepared_percent), FONT_FACE_BODY, 24);
        this.regionIndicatorLabel.setAnchorPoint(cc.p(0, 0));
        this.regionIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.5));
        layoutWorld.addChild(this.regionIndicatorLabel, 100);

        this.populationLabel = new cc.LabelTTF("Country Population:", FONT_FACE_BODY, 24);
        this.populationLabel.setAnchorPoint(cc.p(0, 0));
        this.populationLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.45));
        layoutWorld.addChild(this.populationLabel, 100);

        this.populationIndicatorLabel = new cc.LabelTTF(country.pop_est, FONT_FACE_BODY, 24);
        this.populationIndicatorLabel.setAnchorPoint(cc.p(0, 0));
        this.populationIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.45));
        layoutWorld.addChild(this.populationIndicatorLabel, 100);

        this.gdpLabel = new cc.LabelTTF("Country Income Group:", FONT_FACE_BODY, 24);
        this.gdpLabel.setAnchorPoint(cc.p(0, 0));
        this.gdpLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.4));
        layoutWorld.addChild(this.gdpLabel, 100);

        this.gdpIndicatorLabel = new cc.LabelTTF(country.income_grp, FONT_FACE_BODY, 24);
        this.gdpIndicatorLabel.setAnchorPoint(cc.p(0, 0));
        this.gdpIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.4));
        layoutWorld.addChild(this.gdpIndicatorLabel, 100);

        this.regionLabel = new cc.LabelTTF("Country Region:", FONT_FACE_BODY, 24);
        this.regionLabel.setAnchorPoint(cc.p(0, 0));
        this.regionLabel.setPosition(cc.p(size.width * 0.3, size.height * 0.35));
        layoutWorld.addChild(this.regionLabel, 100);

        this.regionIndicatorLabel = new cc.LabelTTF(country.subregion, FONT_FACE_BODY, 24);
        this.regionIndicatorLabel.setAnchorPoint(cc.p(0, 0));
        this.regionIndicatorLabel.setPosition(cc.p(size.width * 0.6, size.height * 0.35));
        layoutWorld.addChild(this.regionIndicatorLabel, 100);
        */

        // Country view
        this.tableCountryLabel = new cc.LabelTTF("Country", FONT_FACE_TITLE, 24);
        this.tableLossLabel = new cc.LabelTTF("Environmental Loss", FONT_FACE_TITLE, 24);
        this.tablePreparednessLabel = new cc.LabelTTF("Preparedness", FONT_FACE_TITLE, 24);
        this.tableCountryLabel.setAnchorPoint(cc.p(0, 0));
        this.tableLossLabel.setAnchorPoint(cc.p(0, 0));
        this.tablePreparednessLabel.setAnchorPoint(cc.p(0, 0));
        this.tableCountryLabel.setPosition(cc.p(size.width * 0.25 + 10, size.height * 0.75));
        this.tableLossLabel.setPosition(cc.p(size.width * 0.5, size.height * 0.75));
        this.tablePreparednessLabel.setPosition(cc.p(size.width * 0.7, size.height * 0.75));
        layoutCountries.addChild(this.tableCountryLabel, 100);
        layoutCountries.addChild(this.tableLossLabel, 100);
        layoutCountries.addChild(this.tablePreparednessLabel, 100);

        // Sort countries
        var countriesSorted = Object.values(world.countries).sort((a, b) => {
            if(a.name < b.name) { return -1; }
            if(a.name > b.name) { return 1; }
            return 0;            
        });

        var CustomTableViewCell = cc.TableViewCell.extend({
            draw:function (ctx) {
                this._super(ctx);
            }
        });

        var TableViewCountriesLayer = cc.Layer.extend({

            ctor:function () {
                this._super();
                this.init();
            },
        
            init:function () {
                var winSize = cc.director.getWinSize();
        
                tableView = new cc.TableView(this, cc.size(size.width * 0.5, size.height * 0.5));
                tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
                tableView.x = size.width * 0.25;
                tableView.y = size.height * 0.25;
                tableView.setDelegate(this);
                tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
                this.addChild(tableView);
                tableView.reloadData();
        
                return true;
            },

        
            scrollViewDidScroll:function (view) {
            },
            scrollViewDidZoom:function (view) {
            },
        
            tableCellTouched:function (table, cell) {
                cc.log("cell touched at index: " + cell.getIdx());
            },
        
            tableCellSizeForIndex:function (table, idx) {
                return cc.size(size.width * 0.5, 30);
            },
        
            tableCellAtIndex:function (table, idx) {
                let country = countriesSorted[idx];
                let color = country.loss > 20 ? COLOR_DESTRUCTION_POINTS : (country.pop_prepared_percent > 20 ? COLOR_POLICY_POINTS : COLOR_ICE);
                var cell = table.dequeueCell();
                var labelCountry, labelLoss, labelPreparedness;
                if (!cell) {
                // if (true) {
                    cell = new CustomTableViewCell();

                    labelCountry = new cc.LabelTTF(country.name, FONT_FACE_BODY, 20.0);
                    labelCountry.color = color;
                    labelCountry.x = 10;
                    labelCountry.y = 0;
                    labelCountry.anchorX = 0;
                    labelCountry.anchorY = 0;
                    labelCountry.tag = 123;
                    cell.addChild(labelCountry);

                    labelLoss = new cc.LabelTTF(makeString(country.loss), FONT_FACE_BODY, 20.0);
                    // labelLoss.color = color;
                    labelLoss.x = size.width * 0.25;
                    labelLoss.y = 0;
                    labelLoss.anchorX = 0;
                    labelLoss.anchorY = 0;
                    labelLoss.tag = 456;
                    cell.addChild(labelLoss);

                    labelPreparedness = new cc.LabelTTF(makeString(country.pop_prepared_percent), FONT_FACE_BODY, 20.0);
                    // labelPreparedness.color = color;
                    labelPreparedness.x = size.width * 0.45;
                    labelPreparedness.y = 0;
                    labelPreparedness.anchorX = 0;
                    labelPreparedness.anchorY = 0;
                    labelPreparedness.tag = 789;
                    cell.addChild(labelPreparedness);


                } else {
                    labelCountry = cell.getChildByTag(123);
                    labelCountry.setString(country.name);
                    labelCountry.color = color;

                    labelLoss = cell.getChildByTag(456);
                    labelLoss.setString(makeString(country.loss));

                    labelPreparedness = cell.getChildByTag(789);
                    labelPreparedness.setString(makeString(country.pop_prepared_percent));
                }
        
                return cell;
            },
        
            numberOfCellsInTableView:function (table) {
                return Object.keys(world.countries).length;
            }
        });
        
        let countriesTable = new TableViewCountriesLayer();
        layoutCountries.addChild(countriesTable);


        // Add graph
        var graphX = size.width * 0.25;
        var graphEndX = graphX + size.width * 0.5;
        var graphY = 200
        var graphEndY = graphY + size.height * 0.5;
        var years = gameParams.targetDate.getFullYear() - gameParams.startDate.getFullYear();
        var graphIncrementX = size.width * 0.5 / years;
        var graphIncrementY = size.height * 0.5 / 100;
        var graphOffset = 40;
        var lblStartYear = cc.LabelTTF.create(gameParams.startDate.getFullYear(), FONT_FACE_BODY, 24);
        var lblEndYear = cc.LabelTTF.create(gameParams.targetDate.getFullYear(), FONT_FACE_BODY, 24);
        lblStartYear.attr({ x: graphX, y: graphY});
        lblEndYear.attr({ x: graphEndX, y: graphY});
        lblStartYear.setAnchorPoint(cc.p(0, 0));
        lblEndYear.setAnchorPoint(cc.p(0, 0));
        layoutTime.addChild(lblStartYear);
        layoutTime.addChild(lblEndYear);

        let drawNode = new cc.DrawNode();
        drawNode.setOpacity(255);
        
        var x_o, yP_o, yL_o, x, yP, yL;
        var colorD =  new cc.Color(COLOR_DESTRUCTION_POINTS.r, 
                                    COLOR_DESTRUCTION_POINTS.g, 
                                    COLOR_DESTRUCTION_POINTS.b, 255);
        var colorP =  new cc.Color(COLOR_POLICY_POINTS.r, 
                                    COLOR_POLICY_POINTS.g, 
                                    COLOR_POLICY_POINTS.b, 255);

        var lineOffset = -10;    
        drawNode.drawSegment(cc.p(0, graphOffset + lineOffset), cc.p(size.width * 0.5, graphOffset + lineOffset), 2, COLOR_ICE);
        drawNode.drawSegment(cc.p(0, graphOffset + lineOffset), cc.p(0, graphOffset + size.height * 0.5), 2, COLOR_ICE);


        for (var i = gameParams.startDate.getFullYear(); i < gameParams.targetDate.getFullYear(); i++) {
            var index = i - gameParams.startDate.getFullYear();
            var stats = gameParams.stats[i];
            if (typeof(stats) === "undefined")
                continue;
            var loss = stats.loss;
            var prepared = stats.prepared;
            x = index * graphIncrementX;
            yL = graphOffset + (100 - Math.round(loss)) * graphIncrementY;
            yP = graphOffset + Math.round(prepared) * graphIncrementY;
            if (index > 0) {

                // Line 
                // drawNode.drawSegment(cc.p(x_o, yL_o), cc.p(x, yL), 2, COLOR_DESTRUCTION_POINTS);
                // drawNode.drawSegment(cc.p(x_o, yP_o), cc.p(x, yP), 2, COLOR_POLICY_POINTS);

                // Staircase
                drawNode.drawSegment(cc.p(x_o, yL_o), cc.p(x - 1, yL_o), 2, colorD);
                drawNode.drawSegment(cc.p(x, yL_o), cc.p(x, yL), 2, colorD);
                drawNode.drawSegment(cc.p(x_o, yP_o), cc.p(x - 1, yP_o), 2, colorP);
                drawNode.drawSegment(cc.p(x, yP_o), cc.p(x, yP), 2, colorP);

            }
            x_o = x, yL_o = yL, yP_o = yP;

        }
        var lblDestructionScore = cc.LabelTTF.create(makeString(gameParams.totalLoss), FONT_FACE_BODY, 24);
        var lblPolicyScore = cc.LabelTTF.create(makeString(gameParams.populationPreparedPercent), FONT_FACE_BODY, 24);
        lblDestructionScore.color = colorD;
        lblPolicyScore.color = colorP;
        lblDestructionScore.attr({x: 4 + graphX + x, y: graphY + yL});
        lblPolicyScore.attr({x: 4 + graphX + x, y: graphY + yP});
        lblDestructionScore.setAnchorPoint(cc.p(0, 0.5));
        lblPolicyScore.setAnchorPoint(cc.p(0, 0.5));
        layoutTime.addChild(lblDestructionScore);
        layoutTime.addChild(lblPolicyScore);

        drawNode.x = graphX;
        drawNode.y = graphY;
        layoutTime.addChild(drawNode, 100);

        var btnExit = new ccui.Button();
        btnExit.setTouchEnabled(true);
        btnExit.setSwallowTouches(false);
        btnExit.setPosition(cc.p(size.width * 0.9, size.height * 0.9));
        btnExit.setColor(COLOR_ICE);
        btnExit.setTitleFontSize(72);
        btnExit.setTitleText("X");
        handleMouseTouchEvent(btnExit, function() {
            world.setVisible(true);
            layer.removeFromParent();
            gameParams.state = gameStates.STARTED;
        });
        layerBackground.addChild(btnExit, 102);

    }
});

