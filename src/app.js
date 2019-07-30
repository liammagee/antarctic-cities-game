// Global constants
const VERSION_ANTARCTIC_FUTURES = "Build: 1004";

const FONT_FACE_TITLE = "ArvoFont";
const FONT_FACE_BODY = "JosefinSansFont";

const X_OFFSET = 0, Y_OFFSET = 50;

const MONTH_INTERVAL = 20;
const RESOURCE_CHANCE = 0.1;
const CRISIS_CHANCE = 0.05;
const RESOURCE_SIZE_W = 64; 
const RESOURCE_SIZE_H = 72; 
const TAG_SPRITE_BATCH_NODE = 1;
const TUTORIAL_INTERVAL_MULTIPLIER = 6; 
const RESOURCE_INTERVAL_MULTIPLIER = 10; 
const CRISIS_INTERVAL_MULTIPLIER = 20; 
const RESOURCE_DURATION = 300;
const GAME_STATES = {
    INITIALISED: 0,
    PREPARED: 1,
    STARTED: 2,
    PAUSED: 3,
    GAME_OVER: 5
};

// Game variables
let gameParams = {};
let automateScripts = [];


//------------------------------------------------------------------
//
// ShaderOutline
//
//------------------------------------------------------------------
//FIX ME:
//The renderers of webgl and opengl is quite different now, so we have to use different shader and different js code
//This is a bug, need to be fixed in the future
const ShaderOutlineEffect = cc.LayerGradient.extend({

    ctor: function(node, country, loss) {

        this._super();

        this.node = node;
        this.country = country;
        this.loss = loss;
        this.timeCounter = 0;

        const ccbjs = "res/";

        if( 'opengl' in cc.sys.capabilities ) {

            if(cc.sys.isNative){

                this.shader = new cc.GLProgram(res.shader_outline_vertex_nomvp, res.shader_outline_fragment);
                this.shader.link();
                this.shader.updateUniforms();

            }
            else {

                this.shader = new cc.GLProgram(res.shader_outline_vertex_nomvp, res.shader_outline_fragment);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);

                this.shader.link();
                this.shader.updateUniforms();
                this.shader.use();
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_threshold'), 1.75);
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_zoom'), 1.0);
                this.shader.setUniformLocationWith2f(this.shader.getUniformLocationForName('u_location'), parseFloat(this.node.x), parseFloat(this.node.y));
                this.shader.setUniformLocationWith2f(this.shader.getUniformLocationForName('u_mouse'), 0.0, 0.0);
                this.shader.setUniformLocationWith3f(this.shader.getUniformLocationForName('u_outlineColor1'), 255 / 255, 0 / 255, 0 / 255);
                this.shader.setUniformLocationWith3f(this.shader.getUniformLocationForName('u_outlineColor2'), 0 / 255, 255 / 255, 0 / 255);

                const program = this.shader.getProgram();
                this.uniformResolution = gl.getUniformLocation( program, "resolution");
                this.shader.setUniformLocationF32( this.uniformResolution, 256, 256);
            
            }

            // this.sprite.runAction(cc.sequence(cc.rotateTo(1.0, 10), cc.rotateTo(1.0, -10)).repeatForever());

            if (cc.sys.isNative){

                const glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this.shader);
                glProgram_state.setUniformFloat("u_threshold", 1.75);
                glProgram_state.setUniformFloat("u_zoom", 1.0);
                glProgram_state.setUniformFloat("u_selected", 0.0);
                glProgram_state.setUniformFloat("u_fill1", 1.0);
                glProgram_state.setUniformFloat("u_fill2", 1.0);
                glProgram_state.setUniformVec2("u_location", {x: this.node.x, y: this.node.y});
                glProgram_state.setUniformVec2("u_mouse", {x: 0.0, y: 0.0});
                glProgram_state.setUniformVec3("u_outlineColor1", {x: 255/255, y: 0/255, z: 0/255});
                glProgram_state.setUniformVec3("u_outlineColor2", {x: 0/255, y: 255/255, z: 0/255});
                node.setGLProgramState(glProgram_state);

            }
            else {

                node.shaderProgram = this.shader;

            }

            this.scheduleUpdate();

        }
    },

    update: function(dt) {  

        // if (gameParams.state != GAME_STATES.STARTED || gameParams.state != GAME_STATES.PAUSED)
        //     return;
        let mouseX = -1.0, mouseY = -1.0;

        if (world.mouse.x > this.node.x && world.mouse.x < this.node.x + this.node.width &&
            world.mouse.y > this.node.y && world.mouse.y < this.node.y + this.node.height) {

            mouseX = ((world.mouse.x - this.node.x) / this.node.width );
            mouseY = ((world.mouse.y - (2 * Y_OFFSET) - this.node.y) / this.node.height );

        }

        let selected = this.country.selected ? 1.0 : 0.0;

        if ('opengl' in cc.sys.capabilities) {

            if (cc.sys.isNative) {

                this.node.getGLProgramState().setUniformFloat(this.shader.getUniformLocationForName('u_selected'), selected);
                this.node.getGLProgramState().setUniformFloat(this.shader.getUniformLocationForName('u_zoom'), world.worldBackground.getScale());
                this.node.getGLProgramState().setUniformFloat(this.shader.getUniformLocationForName('u_fill1'), (this.country.loss));
                this.node.getGLProgramState().setUniformFloat(this.shader.getUniformLocationForName('u_fill2'), (this.country.pop_prepared_percent));
                this.node.getGLProgramState().setUniformVec2(this.shader.getUniformLocationForName('u_mouse'), {x: (mouseX), y: (mouseY)});
                this.node.getGLProgramState().setUniformFloat("u_radius", Math.abs(this.node.getRotation() / 500));
            
            }
            else {

                this.shader.use();
                this.shader.setUniformLocationF32( this.uniformResolution, 256, 256);
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_selected'), selected);
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_zoom'), world.worldBackground.getScale());
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_fill1'), (this.country.loss));
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_fill2'), (this.country.pop_prepared_percent));
                this.shader.setUniformLocationWith2f(this.shader.getUniformLocationForName('u_mouse'), (mouseX), (mouseY));
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_radius'), Math.abs(this.node.getRotation() / 500));
                this.shader.updateUniforms();

            }

        }

    }

});

/**
 * Initialises a set of countries.
 */
const initCountries = () => {

        const size = cc.winSize;

        /**
         * Tests whether a point is inside the points that outline a given geometric shape.
         */
        world.collisionDetection = (points,test) => {

            let crossed = false;
            let times = 0;
            
            // Double check the detection is within the widest bounds
            let maxx = Math.max(...points.map(p => p.x));

            for (let i = 0; i < points.length; i++) {

                let p1 = points[i];
                let p2 = (i == points.length - 1) ? points[0] : points[i+1];

                // Make floating, and jitter to avoid boundary issues with integers.
                let x1 = parseFloat(p1.x) + 0.001, y1 = parseFloat(p1.y) - 0.001, 
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

        /**
         * Sorts objects by their relative screen position, to avoid overlapping tiles.
         */
        world.sortedObjs = world.map.objectGroups[0].getObjects().slice(0).sort((a, b) => { 

            return (a.points[0].y * size.height + a.points[0].x) > (b.points[0].y * size.height + b.points[0].x);  

        });

        /**
         * Returns an array of points associated with a country.
         */
        const pointArray = (name) => {

            return world.sortedObjs.filter(so => so.name == name).map(so => so.points);

        };

        /**
         * Generates min, max coordinates
         */
        const extremes = (name) => {
            
            let pa = pointArray(name);
            let extremes = [];
            
            for (let i = 0; i < pa.length; i++) {

                let p = pa[i];
                let minx = 0, miny = 0, maxx = 0, maxy = 0;
                
                for (let j = 0; j < p.length; j++) {

                    let point = p[j];
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


        const regionalArea = (points) => {
            
            let area = 0;

            for (let j = 0; j < points.length - 1; j++) {

                let pt1 = points[j];
                let pt2 = points[j + 1];
                let xy1 = pt1.x * pt2.y;
                let xy2 = pt1.y * pt2.x;
                area += Math.abs(xy1 - xy2);

            }

            return area / 2;

        };

        /*
         * Gauss shoelace algorithm - https://gamedev.stackexchange.com/questions/151034/how-to-compute-the-area-of-an-irregular-shape
         */
        const areas = (name) => { 

            let pa = pointArray(name);
            let area = 0;
            
            for (let i = 0; i < pa.length; i++) {

                let p = pa[i];
                area += regionalArea(p);

            }

            return area;

        };

        /**
         * Create country centroids.
         */
        const centroids = (name) => { 

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
            
            points.forEach( (pt) => {
            
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
                    offsetX: obj.OFFSET_X,
                    offsetY: obj.OFFSET_Y,

                    policy: 0,
                    previousLoss: gameParams.previousLoss,
                    loss: gameParams.previousLoss,
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
        let allPoints = {};
        
        world.countryKeys.forEach(k => {
            
            const c = world.countries[k];
            
            c.points.forEach(p => {
            
                const pStr = p.x +"-"+p.y;

                if (allPoints[pStr]) {
            
                    allPoints[pStr].push(c.iso_a3);
            
                }
                else {
            
                    allPoints[pStr] = [c.iso_a3];
            
                }
            
            });

        });

                
        Object.keys(allPoints).forEach(k => {

            let countries = allPoints[k];

            countries.forEach(c1 => {

                const country = world.countries[c1];
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
        
            let country = world.countries[c];
            country.shared_border_percentage = country.points_shared / country.points_total;
            
            if (country.shared_border_percentage > 1.0) {

                country.shared_border_percentage = 1.0;
                
            }

        });
        

        // Add population density
        Object.keys(world.countries).forEach(c => { 
        
            const country = world.countries[c];
            country.density = country.pop_est / country.area;

        } );

        world.areaMin = 0, world.areaMax = 0, world.areaMean = 0;
        world.areaMinCountry = "", world.areaMaxCountry = "";
        
        Object.keys(world.countries).forEach((c) => {

            const country = world.countries[c];
            
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

        Object.keys(world.countries).forEach((c) => {

            const country = world.countries[c];
            // Change the power for more or less points
            country.numPoints = Math.ceil(Math.pow(country.area / world.areaMean, 2));

        });

        // Add world populations
        gameParams.populationWorld = Object.keys(world.countries).map(c => { return world.countries[c].pop_est; }).reduce((a, c) => {return a + parseInt(c);}, 0);

}

/**
 * Initialises the game parameters.
 */
const initGameParams = (scenarioData) => {

    gameParams = {};
    gameParams.state = GAME_STATES.INITIALISED;
    gameParams.modal = false;
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
    // First crisis will take twice as long
    gameParams.lastCrisis = CRISIS_INTERVAL_MULTIPLIER;
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
const fireClickOnTarget = (target, callback) => {
    
    /**
     * Allow a small wait before calling the callback.
     */
    setTimeout(() => {

        // Assume no more than 4 parents
        let x = target.getPosition().x;
        let y = target.getPosition().y;
        
        // Adjust for up to the great-grandparent's position offset
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

        const e = new cc.EventMouse(cc.EventMouse.UP);
        e.setLocation(x, y);
        cc.eventManager.dispatchEvent(e);

        if (callback !== undefined) 
            callback();

    }, 100);

};

/**
 * Sets up game parameters at the start of play
 */
const calculatePolicyConnections = () => {

    gameParams.policyOptions = {};
    let policyLen = 0;

    Object.keys(RESOURCES).forEach(key => {

        RESOURCES[key].policyOptions.forEach(pol => {

            gameParams.policyOptions[pol.id] = pol;
            if (policyLen < pol.id)
                policyLen = pol.id;

        });
    });
    
    gameParams.policyRelations = {};
    
    for (let i = 0; i < policyLen; i++){

        const source = gameParams.policyOptions[i+1];
        gameParams.policyRelations[source.id] = {};

        for (let j = i + 1; j < policyLen; j++){

            const target = gameParams.policyOptions[j+1];
            if (gameParams.policyRelations[target.id] === undefined)
                gameParams.policyRelations[target.id] = {};
            
            const val = RESOURCE_MATRIX[j][i];
            const rel = RESOURCE_RELATIONS[j][i];
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
const startGameParams = () => {
    
    gameParams.state = GAME_STATES.STARTED;

};


/**
 * Update time variables.
 */
const updateTimeVars = (interval) => {

    gameParams.timeInterval = interval;
    gameParams.tutorialInterval = gameParams.timeInterval * TUTORIAL_INTERVAL_MULTIPLIER;
    gameParams.resourceInterval = gameParams.timeInterval * RESOURCE_INTERVAL_MULTIPLIER; 
    gameParams.crisisInterval = gameParams.timeInterval * CRISIS_INTERVAL_MULTIPLIER;

};

/**
 * Load external data sources
 * Reference: https://github.com/toddmotto/public-apis#transportation
 */
const loadDataSets = () => {
  
    cc.loader.loadJson("https://api.openaq.org/v1/cities", (error, data) => {

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
const showMessageBoxOK = (parent, title, message, prompt1, callback1, prompt2, callback2) => {

    parent.pause(); 

    let winWidth = cc.winSize.width, 
        winHeight = cc.winSize.height;
    let btn1Offset = 0.1, btn2Offset = 0.0;

    if (message === null || typeof(message) === "undefined" || message === "") {
    
        if (prompt2 !== undefined) {

            btn1Offset = 0.5;
            btn2Offset = 0.3;

        }
        else {

            btn1Offset = 0.4;

        }
    }
    else {

        if (prompt2 !== undefined) {

            btn1Offset = 0.2;
            btn2Offset = 0.1;

        }

    }
    
    let layerBackground = new cc.LayerColor(COLOR_LICORICE, winWidth * 0.66, winHeight * 0.66);
    layerBackground.attr({ 
        x: winWidth / 2 - layerBackground.width / 2, 
        y: winHeight / 2 - layerBackground.height / 2});
    parent.addChild(layerBackground, 1);

    let titleText = new ccui.Text(title, FONT_FACE_TITLE, 36);
    titleText.ignoreContentAdaptWithSize(false);
    titleText.setAnchorPoint(cc.p(0.5, 0));
    titleText.setContentSize(cc.size(layerBackground.width * 0.9, layerBackground.height * 0.15));
    titleText.setPosition(cc.p(layerBackground.width * 0.5, layerBackground.height * 0.8));
    titleText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    titleText.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    titleText.setColor(COLOR_WHITE);
    layerBackground.addChild(titleText, 2);

    let contentText = new ccui.Text(message, FONT_FACE_BODY, 24);
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

    handleMouseTouchEvent(btn1, () => {

        layerBackground.removeAllChildren(true);
        layerBackground.removeFromParent(true);
        parent.resume(); 
        callback1();

    });

    if (prompt2 !== undefined) {

        btn2 = new ccui.Button();
        btn2.setTouchEnabled(true);
        btn2.setSwallowTouches(false);
        btn2.setTitleText(prompt2);
        btn2.setTitleColor(COLOR_ICE);
        btn2.setTitleFontSize(36);
        btn2.setTitleFontName(FONT_FACE_BODY);
        btn2.attr({ x: layerBackground.width / 2, y: layerBackground.height * btn2Offset });
        layerBackground.addChild(btn2);  

        handleMouseTouchEvent(btn2, () => {
            
            layerBackground.removeAllChildren(true);
            layerBackground.removeFromParent(true);
            parent.resume(); 
            callback2();

        });

    }

    buttons.push(btn1);
    
    if (btn2 !== undefined)
        buttons.push(btn2);

    return buttons;

};

/**
 * Post data to server
 * @param {*} parent 
 * @param {*} message 
 * @param {*} prompt 
 */
const postResultsToServer = () => {

    // Test posting data
    const xhr = cc.loader.getXMLHttpRequest();

    xhr.open("POST", "http://43.240.98.94/game_data");
    // xhr.open("POST", "http://localhost:8000/game_data");

    // Set Content-type "text/plain;charset=UTF-8" to post plain text
    xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8");
    const gameLog = Object.assign({}, gameParams, { 

        policyOptions: undefined,
        policyRelations: undefined,
        messagesNegative: undefined,
        messagesPositive: undefined,
        timeoutID: undefined,
        tutorialHints: undefined,
        tutorialInterval: undefined,

    });

    let countries = {};
    Object.values(world.countries).forEach(c => { 
        countries[c.iso_a3] = Object.assign({}, c, {
        
            points: undefined, 
            points_shared: undefined, 
            points_total: undefined, 
            selected: undefined, 
            shared_border_percentage: undefined, 
            subregion: undefined, 
            destructionPoints: undefined, 
            destructionDots: undefined, 
            policyPoints: undefined, 
            policyDots: undefined, 
            offsetX: undefined, 
            offsetY: undefined, 
            neighbours: undefined, 
            income_grp: undefined, 
            income_grp_num: undefined, 
            iso_a2: undefined, 
            gid: undefined, 
            gdp: undefined, 
            extremes: undefined, 
            equator_dist: undefined, 
            centroid: undefined, 
            area: undefined, 
            density: undefined, 
            economy: undefined
 
    }) });
    
    gameLog.countries = countries;
    
    cc.log(JSON.stringify(gameLog))
    xhr.send(JSON.stringify(gameLog));

};


/**
 * Game over dialog
 * @param {*} parent 
 * @param {*} message 
 * @param {*} prompt 
 */
const gameOver = (parent, message, prompt) => {
    
    postResultsToServer();

    const WINDOW_WIDTH = cc.winSize.width;
    const WINDOW_HEIGHT = cc.winSize.height;
    parent.pause(); 
    window.clearTimeout(gameParams.timeoutID );
    gameParams.state = GAME_STATES.PAUSED;

    const layerBackground = new cc.LayerColor(COLOR_LICORICE, WINDOW_WIDTH * 0.66, WINDOW_HEIGHT * 0.66);
    layerBackground.attr({ 
        x: WINDOW_WIDTH / 2 - layerBackground.width / 2, 
        y: WINDOW_HEIGHT / 2 - layerBackground.height / 2
    });
    parent.addChild(layerBackground, 1);

    const titleText = new ccui.Text("Game Over!", FONT_FACE_BODY, 36);
    titleText.ignoreContentAdaptWithSize(false);
    titleText.setAnchorPoint(cc.p(0, 0));
    titleText.setContentSize(cc.size(layerBackground.width * 0.9, layerBackground.height * 0.15));
    titleText.setPosition(cc.p(layerBackground.width * 0.05, layerBackground.height * 0.8));
    titleText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    titleText.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    titleText.setColor(COLOR_WHITE);
    layerBackground.addChild(titleText, 2);

    const contentText = new ccui.Text(message, FONT_FACE_BODY, 24);
    contentText.ignoreContentAdaptWithSize(false);
    contentText.setAnchorPoint(cc.p(0, 0));
    contentText.setContentSize(cc.size(layerBackground.width * 0.9, layerBackground.height * 0.6));
    contentText.setPosition(cc.p(layerBackground.width * 0.05, layerBackground.height * 0.2));
    contentText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
    contentText.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    contentText.setColor(COLOR_WHITE);
    layerBackground.addChild(contentText, 2);

    const menu = cc.Menu.create();
    menu.setPosition(cc.p(0, 0));
    layerBackground.addChild(menu, 3);

    const btnOK = cc.MenuItemLabel.create(cc.LabelTTF.create(prompt, FONT_FACE_BODY, 36));
    btnOK.attr({
        x: layerBackground.width / 2,
        y: (layerBackground.height * 0.1) 
    });

    handleMouseTouchEvent(btnOK, () => {

        initGameParams(world.scenarioData);
        gameParams.state = GAME_STATES.GAME_OVER;
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
const handleMouseTouchEvent = (target, callback) => {
    
    const listenerMouse = cc.EventListener.create({

        event: cc.EventListener.MOUSE,

        onMouseUp : (event) => {

            const target = event.getCurrentTarget();
            const locationInNode = target.convertToNodeSpace(event.getLocation());    
            const s = target.getContentSize();
            const rect = cc.rect(0, 0, s.width, s.height);

            if (cc.rectContainsPoint(rect, locationInNode)) {  

                callback(target);
                event.stopPropagation();
                return true;

            }

            return false;

        }

    });

    const listenerTouch = cc.EventListener.create({

        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: true,
        
        onTouchBegan: (touch, event) => {

            const target = event.getCurrentTarget();
            const locationInNode = target.convertToNodeSpace(touch.getLocation());
            const s = target.getContentSize();
            const rect = cc.rect(0, 0, s.width, s.height);

            if (cc.rectContainsPoint(rect, locationInNode)) {  

                target.TOUCHED = true;
                return true;

            }

            return false;

        },

        onTouchEnded : (touch, event) => {

            const target = event.getCurrentTarget();

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
const WorldLayer = cc.Layer.extend({

    sprite:null,

    initControls: () => {

        const controlHandler = (target) => {

            if (target == world.btnQuit) {  // Pause

                gameParams.state = GAME_STATES.PAUSED;
                showMessageBoxOK(world, "Options", "", 
                    "QUIT GAME", () => {
                    
                        postResultsToServer();

                        gameParams.state = GAME_STATES.GAME_OVER;
                        cc.director.runScene(new LoadingScene());

                }, 
                "RETURN TO GAME", () => {

                    gameParams.state = GAME_STATES.STARTED;

                });
            }
            else if (target == world.btnPause) {  // Pause

                gameParams.state = GAME_STATES.PAUSED;
                world.btnPause.enabled = false;
                world.btnPlay.enabled = true;
                world.btnFF.enabled = true;

            }
            else if (target == world.btnPlay) {  // Play

                updateTimeVars(MONTH_INTERVAL);
                gameParams.state = GAME_STATES.STARTED;
                world.btnPause.enabled = true;
                world.btnPlay.enabled = false;
                world.btnFF.enabled = true;

            }
            else if (target == world.btnFF) {  // Fast Forward

                updateTimeVars(MONTH_INTERVAL / 10);
                gameParams.state = GAME_STATES.STARTED;
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

    ctor: function(scenarioData, automateID) {

        this._super();

        // Add to global variables to maintain state
        world = this;
        world.scenarioData = scenarioData;
        world.automateID = automateID;
        world.mouse = { x: 0, y: 0 };

        initGameParams(scenarioData);     

        const size = cc.winSize;
        const WINDOW_WIDTH = cc.winSize.width;
        const WINDOW_HEIGHT = cc.winSize.height;
    
        const layerBackground = new cc.LayerColor(COLOR_ICE, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        this.addChild(layerBackground, 0);

        layout = new cc.LayerColor(COLOR_LICORICE, size.width, Y_OFFSET);
        layout.setAnchorPoint(new cc.p(0,0));
        layout.attr({ x: 0, y: 0 });
        this.addChild(layout, 2);

        // add "World" background layer
        this.worldBackground = new cc.LayerColor(COLOR_ICE, size.width, size.height - 2 * Y_OFFSET);
        this.worldBackground.attr({ x: X_OFFSET, y: Y_OFFSET });
        this.worldBackground.setContentSize(cc.size(cc.winSize.width, cc.winSize.height - 2 * Y_OFFSET));
        this.addChild(this.worldBackground, 1);

        // Interaction handling
        cc.eventManager.addListener({

            event: cc.EventListener.MOUSE,
            // Pan handling
            onMouseMove: (event) => {

                if (gameParams.modal)
                    return false;

                if(event.getButton() == cc.EventMouse.BUTTON_LEFT){
                    const node = event.getCurrentTarget(); 
                    const scale = node.getScale();
                    const size = node.getContentSize();
                    const scaledX = scale * size.width;
                    const scaledY = scale * size.height;
                    // Calculate margins adjusted for size
                    const marginX = node.width / (2 / (1e-06 + scale - 1));
                    const marginY = -Y_OFFSET + node.height / (2 / (1e-06 + scale - 1));
                    const allowance = 200;

                    if (node.x + event.getDeltaX() < (marginX + allowance)  && 
                        node.x + event.getDeltaX() > (-marginX - allowance) &&
                        node.y + event.getDeltaY() < (marginY + allowance) && 
                        node.y + event.getDeltaY() > (-marginY - allowance) ) {

                        node.x += event.getDeltaX();
                        node.y += event.getDeltaY();

                    }

                }

            },
            // Zoom handling
            onMouseScroll: (event) => {

                if (gameParams.modal)
                    return false;

                const node = event.getCurrentTarget(); 
                const delta = cc.sys.isNative ? event.getScrollY() * 6 : -event.getScrollY();
                const newScale = node.getScale() * (1 + delta / 1000.0);
                // Calculate margins adjusted for size
                const marginX = node.width / (2 / (1e-06 + newScale - 1));
                const marginY = -Y_OFFSET + node.height / (2 / (1e-06 + newScale - 1));
                const allowance = 200;
            
                if (newScale <= 10.0 && newScale >= 0.9 && 
                    node.x < (marginX + allowance) && 
                    node.x > (-marginX - allowance)) {
                    
                    node.setScale(newScale);

                }

            }

        }, this.worldBackground);

        // Add map
        this.map = cc.TMXTiledMap.create(res.world_tilemap_tmx);
        // this.map.setAnchorPoint(new cc.p(0,0));
        // this.map.attr({ x: 0, y: 0 });
        this.worldBackground.addChild(this.map, 2);
        tilelayer = this.map.getLayer("Tile Layer 1");

        initCountries();

        // for (let i = 0; i < 177; i++) {
        // Peirce projection
        // for (let i = 0; i < 169; i++) {
        // Stereographic projection - 0.9
        // for (let i = 0; i < 160; i++) {
        // Stereographic projection - 0.1
        // for (let i = 0; i < 166; i++) {
        // 50m Stereographic projection - 0.0
        world.spriteCountries = {};
        
        for (let i = 0; i < 168; i++) {

            const gid = (i + 3);
            const l = this.map.getLayer("Tile Layer " + gid);
            const arr = Object.values(world.countries).filter(c => c.gid == gid);
            if (arr.length == 0)
                continue;
            const country = arr[0];

            const sprite = new cc.Sprite(l.tileset.sourceImage);

            sprite.setPosition(cc.p(parseInt(country.offsetX), 
                parseInt(cc.winSize.height - ( 2 * Y_OFFSET ) - country.offsetY)));
            sprite.setAnchorPoint(cc.p(0., 0.));
            world.worldBackground.addChild(sprite, 3);

            world.spriteCountries[country.iso_a3] = sprite;

            const shaderNode = new ShaderOutlineEffect(sprite, country, false);
            shaderNode.width = 1;
            shaderNode.height = 1;
            shaderNode.x = this.width;
            shaderNode.y = this.height;
            world.worldBackground.addChild(shaderNode, 3);

        }

        // TOP BAR  
        this.topBarLayout = new cc.LayerColor(COLOR_ZINC);
        this.topBarLayout.setAnchorPoint(new cc.p(0,0));
        this.topBarLayout.setPosition(cc.p(0, cc.winSize.height - Y_OFFSET));
        this.topBarLayout.setContentSize(cc.size(cc.winSize.width, Y_OFFSET));
        layout.addChild(this.topBarLayout);

        // Add controls
        this.controlsBackground = new cc.Layer();
        this.controlsBackground.setAnchorPoint(cc.p(0.0,0.0));
        this.controlsBackground.x = cc.winSize.width * 5 / 6;
        this.controlsBackground.y = 0;
        this.controlsBackground.setContentSize(cc.size(cc.winSize.width * 6,Y_OFFSET));
        const controlsBackgroundSprite = new cc.Sprite(res.ctrls_background);
        controlsBackgroundSprite.setAnchorPoint(new cc.p(0.0, 0.0));
        controlsBackgroundSprite.setContentSize(cc.size(cc.winSize.width * 6,Y_OFFSET));
        controlsBackgroundSprite.setPosition(cc.p(0, 0));
        controlsBackgroundSprite.setOpacity(200);
        // this.controlsBackground.addChild(controlsBackgroundSprite, 1); 
        this.topBarLayout.addChild(this.controlsBackground, 1);

        // this.dateBackground = new cc.LayerColor(COLOR_BACKGROUND_TRANS, 126, 30);
        this.dateBackground = new cc.Layer();
        this.dateBackground.setAnchorPoint(cc.p(0,0));
        this.dateBackground.attr({ x: 0, y: 0 });
        this.dateBackground.setContentSize(cc.size(126, 30));
        this.dateBackground.setColor(COLOR_BACKGROUND_TRANS);
        this.dayLabel = new cc.LabelTTF("", FONT_FACE_BODY, 24);
        this.dayLabel.setAnchorPoint(cc.p(0, 0));
        this.dayLabel.attr({ x: 0, y: 10 });
        this.dayLabel.color = COLOR_WHITE;
        this.monthLabel = new cc.LabelTTF("", FONT_FACE_BODY, 24);
        this.monthLabel.setAnchorPoint(cc.p(0, 0));
        this.monthLabel.attr({ x: 4, y: 10 });
        this.monthLabel.color = COLOR_WHITE;
        this.yearLabel = new cc.LabelTTF("", FONT_FACE_BODY, 24);
        this.yearLabel.setAnchorPoint(cc.p(0, 0));
        this.yearLabel.attr({ x: 30, y: 10 });
        this.yearLabel.color = COLOR_WHITE;
        // this.controlsBackground.addChild(this.dayLabel, 1);
        this.controlsBackground.addChild(this.monthLabel, 2);
        this.controlsBackground.addChild(this.yearLabel, 2);
        this.controlsBackground.addChild(this.dateBackground, 2);

        this.btnQuit = new ccui.Button();
        this.btnPause = new ccui.Button();
        this.btnPlay = new ccui.Button();
        this.btnFF = new ccui.Button();

        this.btnQuit.setAnchorPoint(cc.p(0,0));
        this.btnQuit.setTouchEnabled(true);
        this.btnQuit.setSwallowTouches(false);
        this.btnQuit.setScale9Enabled(true);
        this.btnQuit.loadTextures(res.quit_off_png, "", res.quit_off_png);
        this.btnQuit.attr({ x: 0, y: 0 });
        this.btnQuit.setContentSize(cc.size(105, 105));
        this.btnQuit.setScale(0.48);
        this.topBarLayout.addChild(this.btnQuit, 102);
        
        this.btnPause.setTouchEnabled(true);
        this.btnPause.setSwallowTouches(false);
        this.btnPause.setScale9Enabled(true);
        this.btnPause.loadTextures(res.pause_off_png, "", res.pause_on_png);
        this.btnPause.setAnchorPoint(cc.p(0.0, 0.0));
        this.btnPause.attr({ x: 84, y: 0 });
        this.btnPause.setContentSize(cc.size(105, 105));
        this.btnPause.setScale(0.48);
        this.controlsBackground.addChild(this.btnPause, 2, "pause");
        
        this.btnPlay.setTouchEnabled(true);
        this.btnPlay.setSwallowTouches(false);
        this.btnPlay.setScale9Enabled(true);
        this.btnPlay.loadTextures(res.play_off_png, "", res.play_on_png);
        this.btnPlay.setAnchorPoint(cc.p(0.0, 0.0));
        this.btnPlay.attr({ x: 126, y: 0 });
        this.btnPlay.setContentSize(cc.size(105, 105));
        this.btnPlay.setScale(0.48);
        this.controlsBackground.addChild(this.btnPlay, 2, "play");
        
        this.btnFF.setTouchEnabled(true);
        this.btnFF.setSwallowTouches(false);
        this.btnFF.setScale9Enabled(true);
        this.btnFF.loadTextures(res.playfast_off_png, "", res.playfast_on_png);
        this.btnFF.setAnchorPoint(cc.p(0.0, 0.0));
        this.btnFF.attr({ x: 168, y: 0 });
        this.btnFF.setContentSize(cc.size(105, 105));
        this.btnFF.setScale(0.48);
        this.controlsBackground.addChild(this.btnFF, 2, "fast");

        this.initControls();

        this.btnPause.enabled = false;
        this.btnPlay.enabled = false;
        this.btnFF.enabled = false;

        // Add tweet area
        this.tweetBackground = new cc.ClippingNode();
        this.tweetBackground.setColor(COLOR_BACKGROUND_TRANS);
        this.tweetBackground.attr({ width: WINDOW_WIDTH * 0.66, height: Y_OFFSET, x: (WINDOW_WIDTH / 6), y: 0 });
        this.tweetBackground.setContentSize(cc.size(WINDOW_WIDTH * 0.66, Y_OFFSET));
        const stencil = new cc.DrawNode();
        const rectangle = [cc.p(0, 0),cc.p(this.tweetBackground.width, 0),
            cc.p(this.tweetBackground.width, this.tweetBackground.height),
            cc.p(0, this.tweetBackground.height)];

        const darkGrey = new cc.Color(42, 54, 68, 255);
        stencil.drawPoly(rectangle, darkGrey, 1, darkGrey);
        this.tweetBackground.stencil = stencil;
        this.topBarLayout.addChild(this.tweetBackground, 110);

        this.tweetBackgroundLayer = new cc.LayerColor(COLOR_BACKGROUND_TRANS);
        this.tweetBackgroundLayer.attr({ width: this.tweetBackground.width, height: this.tweetBackground.height, x: 0, y: 0});
        this.tweetBackground.addChild(this.tweetBackgroundLayer, 100);

        this.tweetLabel = new cc.LabelTTF(gameParams.scenarioName, FONT_FACE_BODY, 18);
        this.tweetLabel.setAnchorPoint(cc.p(0, 0.5));
        this.tweetLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT)
        this.tweetLabel.attr({ x: this.tweetBackground.width / 2, y: Y_OFFSET / 2, width: this.tweetBackground.width, height: this.tweetBackground.height });
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

        const antarcticaSmallSprite = new cc.Sprite(res.antarctica_small_png);
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


        // BOTTOM BAR  
        this.statusLayout = new cc.LayerColor(COLOR_BACKGROUND_TRANS);
        this.statusLayout.setAnchorPoint(new cc.p(0,0));
        this.statusLayout.setPosition(cc.p(0, 0));
        this.statusLayout.setContentSize(cc.size(cc.winSize.width, Y_OFFSET));
        layout.addChild(this.statusLayout);

        this.btnDevelopPolicy = new ccui.Button(res.status_button, res.status_button, res.status_button);
        this.btnDevelopPolicy.setTouchEnabled(true);
        this.btnDevelopPolicy.setSwallowTouches(false);
        this.btnDevelopPolicy.setTitleText("POLICY");
        this.btnDevelopPolicy.setTitleFontName(FONT_FACE_BODY);
        this.btnDevelopPolicy.setTitleFontSize(24);
        this.btnDevelopPolicy.setTitleColor(COLOR_ICE);
        this.btnDevelopPolicy.setAnchorPoint(new cc.p(0,0));
        this.btnDevelopPolicy.setContentSize(cc.size(Math.ceil(cc.winSize.width * (1 / 6)), Y_OFFSET));
        this.btnDevelopPolicy.setPosition(cc.p(0, 0));
        this.statusLayout.addChild(this.btnDevelopPolicy, 1);

    
        const countryDetailLayout = new cc.Layer();
        countryDetailLayout.setAnchorPoint(new cc.p(0,0));
        countryDetailLayout.setContentSize(cc.size(cc.winSize.width * (4 / 6), Y_OFFSET));
        countryDetailLayout.attr({ x: cc.winSize.width * (1 / 6), y: 0 });        
        this.statusLayout.addChild(countryDetailLayout);
        const fontSize = 20;
        const labelOffsetY = Y_OFFSET / 2;

        this.countryLabel = new cc.LabelTTF("", FONT_FACE_TITLE, fontSize);
        this.countryLabel.setContentSize(cc.size(300, Y_OFFSET));
        this.countryLabel.setPosition(cc.p(20, labelOffsetY));
        this.countryLabel.setColor(COLOR_ICE);
        this.countryLabel.setAnchorPoint(new cc.p(0,0.5));
        this.countryLabel.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        countryDetailLayout.addChild(this.countryLabel);

        const lossLabel = new cc.LabelTTF("Loss", FONT_FACE_TITLE, fontSize);
        lossLabel.setContentSize(cc.size(50, Y_OFFSET));
        lossLabel.setPosition(cc.p(280, labelOffsetY));
        lossLabel.setColor(COLOR_ICE);
        lossLabel.setAnchorPoint(new cc.p(0,0.5));
        lossLabel.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        countryDetailLayout.addChild(lossLabel);

        this.countryLoss = new cc.LabelTTF("0%", FONT_FACE_TITLE, fontSize);
        this.countryLoss.setContentSize(cc.size(20, Y_OFFSET));
        this.countryLoss.setPosition(cc.p(334, labelOffsetY));
        this.countryLoss.setColor(COLOR_DESTRUCTION_POINTS);
        this.countryLoss.setAnchorPoint(new cc.p(0,0.5));
        this.countryLoss.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.countryLoss.setHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
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

        const preparednessLabel = new cc.LabelTTF("Prepared", FONT_FACE_TITLE, fontSize);
        preparednessLabel.setContentSize(cc.size(100, Y_OFFSET));
        preparednessLabel.setPosition(cc.p(570, labelOffsetY));
        preparednessLabel.setColor(COLOR_ICE);
        preparednessLabel.setAnchorPoint(new cc.p(0,0.5));
        preparednessLabel.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        countryDetailLayout.addChild(preparednessLabel);

        this.countryAwarePrepared = new cc.LabelTTF("0%", FONT_FACE_TITLE, fontSize);
        this.countryAwarePrepared.setHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        this.countryAwarePrepared.setContentSize(cc.size(20, Y_OFFSET));
        this.countryAwarePrepared.setPosition(cc.p(664, labelOffsetY));
        this.countryAwarePrepared.setColor(COLOR_POLICY_POINTS);
        this.countryAwarePrepared.setAnchorPoint(new cc.p(0,0.5));
        this.countryAwarePrepared.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.countryAwarePrepared.setHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        countryDetailLayout.addChild(this.countryAwarePrepared);

        this.countryPreparedProgressBase = new ccui.LoadingBar(res.progress_bar, 100);
        this.countryPreparedProgressBase.setContentSize(cc.size(100, 10));
        this.countryPreparedProgressBase.setPosition(cc.p(710, Y_OFFSET / 2));
        this.countryPreparedProgressBase.setAnchorPoint(new cc.p(0,0.5));
        this.countryPreparedProgress = new ccui.LoadingBar(res.progress_bar, 0);
        this.countryPreparedProgress.setColor(COLOR_POLICY_POINTS);
        this.countryPreparedProgress.setContentSize(cc.size(100, 10));
        this.countryPreparedProgress.setPosition(cc.p(710, Y_OFFSET / 2));
        this.countryPreparedProgress.setAnchorPoint(new cc.p(0,0.5));
        countryDetailLayout.addChild(this.countryPreparedProgressBase, 100);
        countryDetailLayout.addChild(this.countryPreparedProgress, 101);
    
        // Stats button
        this.btnStats = new ccui.Button(res.status_button, res.status_button, res.status_button);
        this.btnStats.setTouchEnabled(true);
        this.btnStats.setSwallowTouches(false);
        this.btnStats.setTitleText("STATS");
        this.btnStats.setTitleFontName(FONT_FACE_BODY);
        this.btnStats.setTitleFontSize(24);
        this.btnStats.setTitleColor(COLOR_ICE);
        this.btnStats.setContentSize(cc.size(Math.ceil(cc.winSize.width * (1 / 6)), Y_OFFSET));
        this.btnStats.setAnchorPoint(new cc.p(1.0,0));
        this.btnStats.setPosition(cc.p(cc.winSize.width , 0));
        this.statusLayout.addChild(this.btnStats);

        handleMouseTouchEvent(this.btnDevelopPolicy, () => {

            gameParams.state = GAME_STATES.PAUSED;
            layer = new DesignPolicyLayer(world);
            world.parent.addChild(layer);
            world.setVisible(false);
            gameParams.modal = true;

        });

        handleMouseTouchEvent(this.btnStats, () => {

            gameParams.state = GAME_STATES.PAUSED;
            layer = new StatsLayer(world);
            world.parent.addChild(layer);
            world.setVisible(false);
            gameParams.modal = true;

        });

        this.addEmitter = () => {

            world._emitter = new cc.ParticleRain();
            world.worldBackground.addChild(world._emitter, 110);
    
            world._emitter.life = 4;
    
            world._emitter.texture = cc.textureCache.addImage(res.fire_texture);
            world._emitter.shapeType = cc.ParticleSystem.BALL_SHAPE;
            world._emitter.color = COLOR_DESTRUCTION_POINTS;

            world._emitter.setStartColor(cc.color(179, 0, 0, 255));
            world._emitter.setStartColorVar(cc.color(0, 0, 0, 0));
            world._emitter.setEndColor(cc.color(179, 0, 0, 128));
            world._emitter.setEndColorVar(cc.color(0, 0, 0, 0));   
            world._emitter.setSpeed(0);
            world._emitter.setSpeedVar(0);
            world._emitter.setGravity(cc.p(0, 0));

            // Gravity Mode: radial
            world._emitter.setRadialAccel(0);
            world._emitter.setRadialAccelVar(0);

            // Gravity Mode: tangential
            world._emitter.setTangentialAccel(0);
            world._emitter.setTangentialAccelVar(0);
            let x = cc.winSize.width * 0.25 + Math.random() * cc.winSize.width * 0.5;
            let y = cc.winSize.height * 0.25 + Math.random() * cc.winSize.height * 0.5;

            world._emitter.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
            world._emitter.setPosVar(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));

            const sourcePos = world._emitter.getSourcePosition();
            /*
            if (sourcePos.x === 0 && sourcePos.y === 0) {

                world._emitter.x = cc.winSize.width / 2;
                world._emitter.y = cc.winSize.height / 2 - 50;

            }
            */

        };

        return true;
    },

    onEnter:function () {

        this._super();

        const size = cc.winSize;
        const mappedTiles = {};

        let oldLayers = [];
        let lastLayerID = -1;
        
        const processResourceSelection = (target) => {
            
            const res = Math.floor(1 + Math.random() * 3);

            gameParams.resources += res;
            target.removeFromParent();

            if (!gameParams.resourcesAdded) {
                
                gameParams.state = GAME_STATES.PAUSED;
                gameParams.resourcesAdded = true;
                
                if (gameParams.tutorialMode) {
                    
                    showMessageBoxOK(world, "HINT:", TUTORIAL_MESSAGES.FIRST_RESOURCE_CLICKED.message, "OK!", function() {
                        gameParams.tutorialHints.push(TUTORIAL_MESSAGES.FIRST_RESOURCE_CLICKED.message);
                        gameParams.state = GAME_STATES.STARTED;
                    });

                }
                else {
                    
                    gameParams.state = GAME_STATES.STARTED;

                }
            }

        };

        const processCrisisSelection = (target) => {

            gameParams.crisisCountry = null;
            let crisis = null;

            for (let i = 0; i < gameParams.crises.length; i++) {

                if (gameParams.crises[i].id == target.crisisId) {

                    const crisisInCountry = gameParams.crises[i];
                    crisis = CRISES[crisisInCountry.crisis];
                    gameParams.crises.splice(i, 1);
                    break;

                }
            }

            target.removeFromParent();
            
            if (!gameParams.alertCrisis && gameParams.tutorialMode) {

                gameParams.state = GAME_STATES.PAUSED;
                gameParams.alertCrisis = true;
                
                showMessageBoxOK(world, "Congratulations!", "You have averted the " + crisis.name + "!", "OK!", function() {

                    gameParams.state = GAME_STATES.STARTED;

                });

            }

        };
        
        /**
         * Update month / year in the interface
         * @param {*} world 
         */
        const refreshDate = (world) => {

            // world.dayLabel.setString(gameParams.currentDate.getDate());
            world.monthLabel.setString((gameParams.currentDate.getMonth() + 1).toString());
            world.yearLabel.setString((gameParams.currentDate.getFullYear()).toString());

        };

        /**
         * Show country-level stats.
         */
        const printCountryStats = () => {

            const country = world.countries[gameParams.currentCountry];
            world.countryLabel.setString(country.name);

            const lossPercent = Math.floor(country.loss);
            const preparedPercent = Math.floor(country.pop_prepared_percent);

            world.countryLoss.setString(lossPercent + "%" );
            world.countryLossProgress.setPercent(lossPercent);
            world.countryAwarePrepared.setString(preparedPercent + "%");
            world.countryPreparedProgress.setPercent(preparedPercent);

        };

        /**
         * Show world-level stats.
         */
        const printWorldStats = () => {

            world.countryLabel.setString("World");

            const lossPercent = Math.round(gameParams.totalLoss);
            const preparedPercent = Math.round(gameParams.populationPreparedPercent);

            world.countryLoss.setString(lossPercent + "%" );
            world.countryAwarePrepared.setString(preparedPercent + "%");

            world.countryLossProgress.setPercent(lossPercent);
            world.countryPreparedProgress.setPercent(preparedPercent);

        };

        world.generateResourceDistribution = () => {

            let dists = [];
            let total = 0;

            for (let i = 0; i < 16; i++) {

                let weight = 1;
                if (gameParams.policies[i + 1] !== undefined) 
                    weight += gameParams.policies[i + 1];
                
                total += weight;
                dists.push(weight);

            }

            let counter = 0;

            for (let i = 0; i < dists.length; i++) {

                dists[i] /= total;

            }

            return dists;

        };

        const doSim = () => {

            if (gameParams.startCountry === null || gameParams.state !== GAME_STATES.PREPARED)
                return;

            let buttons = [];

            const country = world.countries[gameParams.startCountry];
            country.policy = 1.0;
            country.affected_chance = 1.0;

            // Shuffle from https://gist.github.com/guilhermepontes/17ae0cc71fa2b13ea8c20c94c5c35dc4
            const shuffleArray = a => a.sort(() => Math.random() - 0.5);

            startGameParams();
            refreshDate(world);

            const generateWeightedPolicyIndex = (r) => {

                let dists = world.generateResourceDistribution();
                let counter = 0;
                let chosenPolicy = 0;

                for (let i = 0; i < dists.length; i++) {

                    let prob = dists[i];
                    counter += prob;

                    if (counter > r) {

                        chosenPolicy = i;
                        break;
                    
                    }

                }

                return chosenPolicy;

            };

            /**
             * Generate a policy icon, based on a weighted average of existing policies.
             */
            const generatePolicyIcon = () => {

                let policyIndex = generateWeightedPolicyIndex(Math.random());
                let icon = "";

                switch(policyIndex) {
                    case 0:
                        icon = res.resource_economy_1;
                        break;
                    case 1:
                        icon = res.resource_economy_2;
                        break;
                    case 2:
                        icon = res.resource_economy_3;
                        break;
                    case 3:
                        icon = res.resource_economy_4;
                        break;
                    case 4:
                        icon = res.resource_politics_1;;
                        break;
                    case 5:
                        icon = res.resource_politics_2;;
                        break;
                    case 6:
                        icon = res.resource_politics_3;;
                        break;
                    case 7:
                        icon = res.resource_politics_4;;
                        break;
                    case 8:
                        icon = res.resource_culture_1;;
                        break;
                    case 9:
                        icon = res.resource_culture_2;;
                        break;
                    case 10:
                        icon = res.resource_culture_3;;
                        break;
                    case 11:
                        icon = res.resource_culture_4;;
                        break;
                    case 12:
                        icon = res.resource_ecology_1;;
                        break;
                    case 13:
                        icon = res.resource_ecology_2;;
                        break;
                    case 14:
                        icon = res.resource_ecology_3;;
                        break;
                    case 15:
                        icon = res.resource_ecology_4;;
                        break;
                }

                return icon;
            };
                                    
            // Add chance of new resource
            const addResource = () => {

                const btnRes = new ccui.Button();
                btnRes.setTouchEnabled(true);
                btnRes.setSwallowTouches(false);
                btnRes.setScale9Enabled(true);
                
                const policyIcon = generatePolicyIcon();
                btnRes.loadTextures(policyIcon, "", "");

                const ind = Math.floor(Math.random() * Object.keys(world.countries).length);
                const countryRand = world.countries[Object.keys(world.countries)[ind]];
                const pt = countryRand.centroid;
                btnRes.attr({ x: pt.x, y: (size.height - (2 * Y_OFFSET) ) - pt.y + RESOURCE_SIZE_H / 2 });
                btnRes.setContentSize(cc.size(RESOURCE_SIZE_W, RESOURCE_SIZE_H));
                // btnRes.setColor(COLOR_RESOURCE);
                btnRes.placedAt = gameParams.counter;
                world.worldBackground.addChild(btnRes, 101);

                buttons.push(btnRes);

                handleMouseTouchEvent(btnRes, processResourceSelection);

                if (gameParams.automateMode) {
                    
                    const r = Math.random();
                    if (r < parseFloat(gameParams.automateScript.resourcesProb)) {

                        fireClickOnTarget(btnRes);

                    }

                }

                if (!gameParams.alertResources) {

                    if (gameParams.tutorialMode) {
                        
                        gameParams.state = GAME_STATES.PAUSED;
                        gameParams.alertResources = true;
                        showMessageBoxOK(world, "HINT:", TUTORIAL_MESSAGES.FIRST_RESOURCE_SHOWN.message, "OK!", function(that) {
                        
                            gameParams.tutorialHints.push(TUTORIAL_MESSAGES.FIRST_RESOURCE_SHOWN.message);
                            gameParams.state = GAME_STATES.STARTED;

                        });

                    }

                }

                gameParams.lastResource = gameParams.counter;

            };
                                    
            /**
             * Calculate the probability distribution of crisis & country
             */ 
            world.crisisProbDistribution = function() {
                
                const probs = [];
                const crisisKeys = Object.keys(CRISES);
                const countryKeys = Object.keys(world.countries);
                let denom = 0;
                
                crisisKeys.forEach(ck => {

                    const crisis = CRISES[ck];
                    
                    countryKeys.forEach(yk => {
                    
                        const country = world.countries[yk];
                        const lossProp = country.loss / gameParams.totalLoss;
                        const preparedProp = country.pop_prepared_percent / gameParams.populationPreparedPercent;
                        
                        let totalInfluence = 1.0;
                        totalInfluence += lossProp * crisis.influence_of_environmental_loss;
                        totalInfluence += preparedProp * crisis.influence_of_preparedness;
                        
                        if (isNaN(totalInfluence))
                            totalInfluence = 0.0;
                        
                        if (totalInfluence > 0) {
                        
                            denom += totalInfluence;
                            probs.push(totalInfluence);
                        
                        }

                    });

                });
                
                for (let i = 0; i < probs.length; i++) {
                
                    probs[i] /= denom;
                
                }
                
                return probs;

            };

            world.crisisProbLocation = function(r) {

                const probs = world.crisisProbDistribution();
                const crisisKeys = Object.keys(CRISES);
                const countryKeys = Object.keys(world.countries);
                let crisisCountry = {};
                let counter = 0;
                
                for (let i = 0; i < probs.length; i++) {
                
                    counter += probs[i];

                    if (r < counter) {

                        const crisisID = Math.floor(crisisKeys.length * i / probs.length);
                        const countryID = i % countryKeys.length;
                        crisisCountry.crisis = crisisKeys[crisisID];
                        crisisCountry.country = countryKeys[countryID];
                        crisisCountry.id = i;
                        crisisCountry.counter = gameParams.counter;
                        break;

                    }
                
                }

                return crisisCountry;

            };

            /**
             * Add a new crisis.
             */
            const addCrisis = () => {

                const r2 = Math.random();
                const crisisInCountry = world.crisisProbLocation(r2);
                gameParams.crisisCountry = crisisInCountry;
                gameParams.crises.push(crisisInCountry);
                gameParams.crisisCount++;
                const crisis = CRISES[crisisInCountry.crisis];
                const country = world.countries[crisisInCountry.country];

                const btnCrisis = new ccui.Button();
                btnCrisis.setTouchEnabled(true);
                btnCrisis.setSwallowTouches(false);
                btnCrisis.setScale9Enabled(true);
                btnCrisis.loadTextures(crisis.image, "", "");
                const pt = country.centroid;
                console.log(country.name, pt.y)
                btnCrisis.attr({ x: pt.x, y: (size.height - (2 * Y_OFFSET) ) - pt.y + RESOURCE_SIZE_H / 2 });
                btnCrisis.setContentSize(cc.size(RESOURCE_SIZE_W, RESOURCE_SIZE_H));
                // btnCrisis.setColor(COLOR_DESTRUCTION_POINTS);
                btnCrisis.placedAt = gameParams.counter;
                btnCrisis.crisisId = crisisInCountry.id;
                btnCrisis.name = "crisis" + crisisInCountry.id;
                
                handleMouseTouchEvent(btnCrisis, processCrisisSelection);
                
                world.worldBackground.addChild(btnCrisis, 101);

                // After the third crisis, add notifications to the news feed
                let message = "A " + crisis.name + " is taking place in " + country.name + "."; 
                // btnCrisis.setTitleColor(COLOR_LICORICE);
                // btnCrisis.setTitleText(crisis.name);

                if (gameParams.crisisCount < 4) {

                    gameParams.state = GAME_STATES.PAUSED;
                    message += " Crises are unexpected events due to environmental loss. Click on the crisis icon to slow the loss and increase the preparedness of the country to minimise the risk of further crises.";

                    let buttons = showMessageBoxOK(world, "Crisis alert!", message, "OK!", function(that) {

                        gameParams.state = GAME_STATES.STARTED;

                    });

                    if (gameParams.automateMode) {

                        fireClickOnTarget(buttons[0]);
    
                    }                    

                }
                else {
                    
                    // if (gameParams.messageOverride == null)
                    //     gameParams.messageOverride = message;

                }
                
                gameParams.lastCrisis = gameParams.counter;

            };

            /**
             * Add tutorial.
             */
            const addTutorial = () => {

                if (gameParams.tutorialHints.length < 2 || gameParams.tutorialHints.length >= 6)
                    return;

                gameParams.state = GAME_STATES.PAUSED;
                let message = null;
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
                    gameParams.state = GAME_STATES.STARTED;

                });

            };

            world.sigmoidalPercent = (percent, inflectionPoint) => {

                if (inflectionPoint === undefined)
                    inflectionPoint = 50;

                // Some value between -1.0 and 1.0
                let normedPercent = ( percent - inflectionPoint ) / inflectionPoint;
                let normedPercentWithFactor = normedPercent * 1.0;
                // Some value between e (2.78...) and 1 / e (0.367) 
                let sigmoidalPercent = 1 / Math.pow(Math.E, normedPercentWithFactor);

                return sigmoidalPercent;

            };

            // Evaluates loss
            world.evaluateLoss = (country) => {

                const lossCurrent = country.loss;

                // Add random amount to default rate of loss
                const rateOfLoss = gameParams.rateOfLoss * (0.5 + Math.random());
                const rateOfLossMonthly = rateOfLoss;
                let rateOfLossFactor = 1 + rateOfLossMonthly;

                // Weaken rate of loss by population prepared for good policy
                const preparednessFactor = 1 + 0.1 * country.pop_prepared_percent / 100.0;
                rateOfLossFactor /= preparednessFactor;

                //let crisis = CRISES[gameParams.crises[0].crisis];
                gameParams.crises.forEach(crisisInCountry => {
                    
                    const crisis = CRISES[crisisInCountry.crisis];
                    // Add effects of country / global loss ratio to crisis effect
                    // Take the square root of the ratio of country to world loss, and multiply this by the crisis effect
                    rateOfLossFactor *= (1 + crisis.effect_on_environmental_loss * (Math.pow(lossCurrent / gameParams.totalLoss, 0.5)));
                    
                });

                const sigmoidalLossFactor = ( 1 + (rateOfLossFactor - 1) * world.sigmoidalPercent(lossCurrent) );
                let lossNew = lossCurrent + (sigmoidalLossFactor - 1);

                if (lossNew > 100)
                    lossNew = 100;
                if (lossNew < 0)
                    lossNew = 0;

                return lossNew;

            };

            /**
             * Transmit policy effects from a country
             * @param {*} Calculates transmission of policies from 
             */
            const transmitFrom = (country) => {
                
                const neighbours = country.neighbours;
                const sharedBorder = country.shared_border_percentage;
                const transmissionLand = world.scenarioData.threat_details.transmission.transmission_land;
                const transmissionSea = world.scenarioData.threat_details.transmission.transmission_sea;
                const transmissionAir = world.scenarioData.threat_details.transmission.transmission_air;
                const infectivityMinimumIncrease = world.scenarioData.threat_details.advanced_stats.minimum_infectivity_increase;

                const likelihoodOfTransmission = country.affected_chance; //infectivityIncreaseSpeed / 100.0;

                const popCountry = country.pop_est;
                const popWorld = gameParams.populationWorld;
                const popFactor = Math.log(popCountry) / Math.log(popWorld);
                
                const income = country.income_grp;
                const incomeVal = parseFloat(income.charAt(0)) / 6.0; // 5 income groups + 1, so there are no zeroes
                
                // THE FOLLOWING CODE MAKES USE OF AVAILABLE GEOGRAPHIC INFORMATION TO DEVELOP A PROXY FOR TRANSMISSION

                const landProb = sharedBorder * transmissionLand * likelihoodOfTransmission * popFactor * incomeVal;
                // Sea probability increases with (a) low shared border and (b) high income and (c) high population
                const seaProb = (1  - sharedBorder)  * transmissionSea * likelihoodOfTransmission * popFactor * (1 - incomeVal);
                // Air probability increases with (a) low shared border and (b) high income and (c) high population
                const airProb = sharedBorder * transmissionAir * likelihoodOfTransmission * popFactor * (1 - incomeVal);
                
                let candidateCountry = null;

                // Start with land
                if (Math.random() < landProb && neighbours.length > 0) {
                    
                    const neighbourIndex = Math.floor(Math.random() * neighbours.length);
                    const neighbour = world.countries[neighbours[neighbourIndex]];
                    if (neighbour.policy == 0) {
                    
                        candidateCountry = neighbour;
                    
                    }

                }
                else if (Math.random() < seaProb) {
                    
                    const countriesShuffled = shuffleArray(Object.keys(world.countries));
                    const countryChance = Math.random();
                    
                    for (let i = 0; i < countriesShuffled.length; i++) {
                        
                        const countryCheck = world.countries[countriesShuffled[i]];
                        
                        if (countryChance < ( 1 - countryCheck.shared_border_percentage ) && countryCheck.policy == 0) {

                            candidateCountry = countryCheck;
                            break;

                        }
                    
                    }

                }
                else if (Math.random() < airProb) {
                    const countriesShuffled = shuffleArray(Object.keys(world.countries));
                    const countryChance = Math.random();
                    
                    for (let i = 0; i < countriesShuffled.length; i++) {
                    
                        const countryCheck = world.countries[countriesShuffled[i]];
                        const incomeCheck = countryCheck.income_grp;
                        const incomeValCheck = parseFloat(incomeCheck.charAt(0)) / 6.0; // 5 income groups + 1, so there are no zeroes
                    
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

            const infectWithin = (country) => {
                
                if (country.affected_chance == 0)
                    return;

                if (country.pop_aware >= parseInt(country.pop_est))
                    return;

                // Calculate infectivity
                const infectivityIncreaseSpeed = world.scenarioData.threat_details.advanced_stats.infectivity_increase_speed;
                const infectivityMinimumIncrease = world.scenarioData.threat_details.advanced_stats.minimum_infectivity_increase;

                let infectivityRate = infectivityIncreaseSpeed;

                Object.keys(gameParams.policies).forEach(strategy => {
                    const level = gameParams.policies[strategy];
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

            world.calculatePolicyBalanceOnPreparedness = () => {

                const strategyCount = Object.values(gameParams.policies).reduce((accum, level) => accum + level, 0);
                if (strategyCount == 0)
                    return 1.0;

                const domainMean = strategyCount / 4;
                let ecn = 0, pol = 0, cul = 0, eco = 0;
                Object.keys(gameParams.policies).forEach(policyID => {
                    const policy = gameParams.policyOptions[policyID]
                    const level = gameParams.policies[policyID];
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

                const variances = Math.pow(ecn - domainMean, 2) + Math.pow(pol - domainMean, 2) + Math.pow(cul - domainMean, 2) + Math.pow(eco - domainMean, 2);

                // Suppress the effect of imbalanced resources
                const policyBalance = 1 - Math.pow((variances / Math.pow(strategyCount, 2)), 4);
                
                return policyBalance;

            };


            world.calculateSinglePolicyImpactOnPreparedness = (country, index) => {

                let severityEffect = 1.0;

                const policyID = parseInt(Object.keys(gameParams.policies)[index]);
                const policy = gameParams.policyOptions[policyID];
                const level = gameParams.policies[policyID];

                // Generate a natural log, so that level 1 = 1; level 2 = 1.31; level 3 = 1.55
                const levelMultiplier = Math.log(level + 1.718);

                // Check population
                const pop = parseInt(country.pop_est);
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
                const latitude = parseFloat(country.equator_dist);
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
                for (let j = index + 1; j < Object.keys(gameParams.policies).length; j++) {
                    // if (i == j)
                    //     continue;

                    const otherPolicyID = parseInt(Object.keys(gameParams.policies)[j]);
                    const otherLevel = gameParams.policies[otherPolicyID];
                    // Generate a natural log, so that level 1 = 1; level 2 = 1.31; level 3 = 1.55
                    const otherLevelMultiplier = Math.log(otherLevel + 1.718);

                    const relation = gameParams.policyRelations[policyID][otherPolicyID];
                    
                    if (typeof(relation) !== "undefined") {
                    
                        severityEffect *= (1 + relation * otherLevelMultiplier);
                    
                    }

                }

                return severityEffect;

            };

            world.calculatePolicyImpactOnPreparedness = (country) => {
                
                let severityEffect = 1.0;

                for (let i = 0; i < Object.keys(gameParams.policies).length; i++) {

                    severityEffect *= world.calculateSinglePolicyImpactOnPreparedness(country, i);

                }
                
                // Add sigmoidal effect
                let sigmoidalInfluence = world.sigmoidalPercent(country.pop_prepared_percent, 5) + 0.5;

                return severityEffect * sigmoidalInfluence;

            };

            world.registerPreparednessWithin = (country) => {

                if (country.affected_chance == 0)
                    return;

                // const popAware = country.pop_aware;
                const popAware = country.pop_est;
                let popPrepared = country.pop_prepared;

                // Calculate severity
                let severityIncreaseSpeed = world.scenarioData.threat_details.advanced_stats.severity_increase_speed;
                const severityMinimumIncrease = world.scenarioData.threat_details.advanced_stats.minimum_severity_increase;
                const policyBalance =  world.calculatePolicyBalanceOnPreparedness();
                const policyImpact =  world.calculatePolicyImpactOnPreparedness(country);
                const policyEffect = policyBalance * policyImpact * severityIncreaseSpeed;
                const policyEffectNormalised = 1 + ((policyEffect - 1) / (MONTH_INTERVAL));

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
            const updateTime = () => {

                if (gameParams.state !== GAME_STATES.STARTED) {

                    // Refresh the timeout
                    gameParams.timeoutID = setTimeout(updateTime, 20);
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
                    const currentYear = gameParams.currentDate.getFullYear();
                    const previousYear = gameParams.previousDate.getFullYear();
                    
                    // Change of year
                    if (currentYear > previousYear) {

                        gameParams.stats[previousYear] = {
                            loss: gameParams.totalLoss,
                            prepared: gameParams.populationPreparedPercent
                        };

                        // Change of decade
                        let message = "";
                        let showDialog = false;

                        // Sort narratives by loss for comparison
                        const narratives = Object.values(NARRATIVES.n2048).sort((o1, o2) => {return o2.loss - o1.loss});

                        switch (currentYear) {
                            case 2048:
                                showDialog = true;
                                
                                for (let i = 0; i < narratives.length; i++) {
                                
                                    const n = narratives[i];
                                
                                    if (gameParams.totalLoss > n.loss) {
                                        
                                        let index = Math.floor(Math.random() * n.messages.length);
                                        message = n.messages[index];
                                        break;

                                    }

                                }
                                break;
                            default:
                                break;
                        }
                            
                        if (showDialog) {

                            gameParams.state = GAME_STATES.PAUSED;
                            let buttons = showMessageBoxOK(world, 
                                "Antarctic Bulletin, year " + currentYear, 
                                message, "OK", function() {
                                    gameParams.state = GAME_STATES.STARTED;
                                });

                            if (gameParams.automateMode) {

                                fireClickOnTarget(buttons[0]);

                            }

                        }
    
                    }

                    gameParams.previousDate = gameParams.currentDate;


                    // Add policy robustness and loss
                    let totalPolicy = 0, totalLoss = 0;
                    let countriedAffected = 0, populationAware = 0, populationPrepared = 0;
                    
                    Object.keys(world.countries).forEach( key => {

                        const country = world.countries[key];
                        const loss = world.evaluateLoss(country);

                        if (loss >= 0.1) {
                            country.previousLoss = country.loss;
                            country.loss = loss;
                        }

                        if (country.affected_chance) {

                            transmitFrom(country);
                            infectWithin(country);
                            world.registerPreparednessWithin(country);

                            countriedAffected++;
                            populationAware += country.pop_aware;
                            populationPrepared += country.pop_prepared;

                            country.pop_aware_percent = 100 * country.pop_aware / country.pop_est;
                            let existingConvincedPercentage = country.pop_prepared_percent;
                            country.pop_prepared_percent = 100 * country.pop_prepared / country.pop_est;

                            let imin = (existingConvincedPercentage > 0.5) ? parseInt(existingConvincedPercentage) : 0;
                            let imax = (country.pop_prepared_percent > 0.5) ? parseInt(country.pop_prepared_percent) : 0;

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

                    if (gameParams.currentCountry != null) {

                        printCountryStats();

                    }
                    else {

                        printWorldStats();

                    }

                }


                // Various events
                let ci = gameParams.crisisInterval;
                Object.keys(gameParams.policies).forEach(policyID => {

                    const policy = gameParams.policyOptions[policyID];
                    const policyLevel = gameParams.policies[policyID];
                    ci /= 1 + (policy.effect_on_crises * Math.log(policyLevel + 1.718));
                    
                });         

                // Check enough time has elapsed to generate a new resource with some probability (1 / RESOURCE_CHANCE)
                if (gameParams.counter - gameParams.lastCrisis >= ci  && Math.random() < CRISIS_CHANCE) {

                    addCrisis();

                }
                
                let ri = gameParams.resourceInterval;
                gameParams.crises.forEach(crisisInCountry => {
                    
                    let crisis = CRISES[crisisInCountry.crisis];
                    let country = world.countries[crisisInCountry.country];
                    ri /= (1 + crisis.effect_on_resources);
                    
                }); 

                Object.keys(gameParams.policies).forEach(policyID => {

                    let policy = gameParams.policyOptions[policyID];
                    let policyLevel = gameParams.policies[policyID];
                    ri /= (1 + (policy.effect_on_resources * Math.log(policyLevel + 1.718)));
                    
                }); 

                // Check enough time has elapsed to generate a new resource with some probability (1 / RESOURCE_CHANCE)
                if (gameParams.counter - gameParams.lastResource >= ri) {

                    addResource();
                    gameParams.resourceInterval *= 1.1;

                }
               
                if (gameParams.tutorialMode && gameParams.counter % gameParams.tutorialInterval == 0) {
                    addTutorial();
                }

                // Add buttons
                const newButtons = [];
                for (let i = 0; i < buttons.length; i++) {

                    const button = buttons[i];
                    if (gameParams.counter > button.placedAt + RESOURCE_DURATION) 
                        button.removeFromParent();
                    else 
                        newButtons.push(button);

                }
                buttons = newButtons;
                
                // Update labels
                world.resourceScoreLabel.setString(gameParams.resources);
                refreshDate(world);

                // Scroll text
                if (world.tweetLabel.x < -300 || gameParams.messageOverride != null) {
                    
                    let message = gameParams.scenarioName, 
                        messageIndex = -1;
                    world.tweetLabel.color = COLOR_ICE;
                    
                    if (gameParams.messageOverride != null) {
                    
                        message = gameParams.messageOverride;
                        gameParams.messageOverride = null;
                        world.tweetAlertLabel.setVisible(true);
                    
                    }
                    // Change label
                    else if (gameParams.totalLoss > 0 || gameParams.populationPreparedPercent > 0) {
                        
                        const weight = gameParams.totalLoss / (gameParams.totalLoss + gameParams.populationPreparedPercent);
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

                    const adjustSpeed = Math.round(20 / gameParams.timeInterval);
                    world.tweetLabel.setPositionX(world.tweetLabel.x - adjustSpeed);
                    world.tweetAlertLabel.setPositionX(world.tweetLabel.x - 100);
                    
                }

                // Game over                        
                if (gameParams.totalLoss >= 100) {

                    // Sort narratives by loss for comparison
                    const narratives = Object.values(NARRATIVES.n2070).sort((o1, o2) => {return o2.loss - o1.loss});
                    const n = narratives[0];
                    const index = Math.floor(Math.random() * n.messages.length);
                    const message = n.messages[index];
                    gameOver(world, message, "OK");

                }
                // else if (gameParams.currentDate.getFullYear() >= YEAR_TARGET) {
                else if (gameParams.currentDate >= gameParams.targetDate) {

                    let message = "";
                    // Sort narratives by loss for comparison
                    const narratives = Object.values(NARRATIVES.n2070).sort((o1, o2) => {return o2.loss - o1.loss});
                    
                    for (let i = 0; i < narratives.length; i++) {

                        const n = narratives[i];
                        if (gameParams.totalLoss > n.loss) {

                            const index = Math.floor(Math.random() * n.messages.length);
                            message = n.messages[index];
                            break;

                        }

                    }

                    gameOver(world, message, "OK");

                }

                // Refresh the timeout
                gameParams.timeoutID = setTimeout(updateTime, 20);

            }; 

            // Run the updates in the background, so interaction is not blocked.
            // cc.async.parallel([
            //     function() {
            //         updateTime();
            //     }
            // ]);
            updateTime();

        };

        const selectCountry = (event, location) => {

            if (gameParams.state !== GAME_STATES.PREPARED && gameParams.state !== GAME_STATES.STARTED && gameParams.state !== GAME_STATES.PAUSED)
                return;
            
            const target = event.getCurrentTarget();
            const locationInNode = target.convertToNodeSpace(location);
            let x = 0, y = 0;

            const layer = target.getLayer("Tile Layer 1");
            gid = layer.getTileGIDAt(x, y);

            if (typeof(layer._texGrids) !== "undefined" && typeof(layer._texGrids[gid]) === "undefined")
                return;

            let start = 0, end = world.sortedObjs.length;
            if (lastLayerID > -1) {

                start = (start < 0) ? 0 : start;
                end = (end > world.sortedObjs.length) ? world.sortedObjs.length : end;

            };

            const ed = (pt1, pt2) => {
                return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
            };

            let minED = -1, selectedCountry = null;
            for (let j = start; j < end; j++) {

                const poly = world.sortedObjs[j];
                const mousePoint = new cc.p(locationInNode.x, size.height - locationInNode.y - (2 * Y_OFFSET));
                const cd = world.collisionDetection(poly.points, mousePoint);

                if (cd) {

                    lastLayerID = j;
                    const countryObj = world.countries[poly.name];
                    const ced = ed(countryObj.centroid, mousePoint);
                    if (minED === -1 || ced < minED) {

                        minED = ced;
                        selectedCountry = poly.name;
                        selectedCountry.selected = true;
                        break;

                    }

                }

            }

            // Pick the match with the closest centroid ID
            let currentLayer = null;
            if (selectedCountry != null) {

                if (gameParams.currentCountry != null)
                    world.countries[gameParams.currentCountry].selected = false;
                gameParams.currentCountry = selectedCountry;

                if (gameParams.currentCountry != null)
                    world.countries[gameParams.currentCountry].selected = true;
                currentCountry = selectedCountry;
                
                printCountryStats();

            }
            else {
                
                if (gameParams.currentCountry != null)
                    world.countries[gameParams.currentCountry].selected = false;
                gameParams.currentCountry = null;

                printWorldStats();

            }

            return true;
        };


        cc.eventManager.addListener({

            event: cc.EventListener.MOUSE,

            onMouseMove: (event) => {
             
                if (gameParams.modal)
                    return false;

                selectCountry(event, event.getLocation());

            },

            onMouseUp: (event) => {
             
                if (gameParams.modal)
                    return false;
             
                const target = event.getCurrentTarget();
                const locationInNode = target.convertToNodeSpace(event.getLocation());

                gameParams.statsCountry = gameParams.currentCountry;

            }

        }, this.map);

        cc.eventManager.addListener({

            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan : (touch, event) => {

                if (gameParams.modal)
                    return false;

                const target = event.getCurrentTarget();
                const locationInNode = target.convertToNodeSpace(touch.getLocation());
                const s = target.getContentSize();
                const rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {  

                    target.TOUCHED = true;
                    return true;

                }

                return false;

            },
            onTouchEnded: (touch, event) => {

                if (gameParams.modal)
                    return false;

                const target = event.getCurrentTarget();
                if (target.TOUCHED) {

                    target.TOUCHED = false;
                    selectCountry(event, touch.getLocation());

                }

                return true;

            }
        }, this.map);


        const beginSim = () => {

            gameParams.state = GAME_STATES.PREPARED;

            world.btnPause.setBright(true);
            world.btnPlay.setBright(false);
            world.btnFF.setBright(true);

            doSim();
            
            // Add particle emitter
            // world.addEmitter();

        };

        let nestedButtons = null;
        let keys = Object.keys(world.countries);

        let antCountries = ["NZL", "AUS", "ZAF", "ARG", "CHL"];
        let startCountry = antCountries[Math.floor(Math.random() * antCountries.length)];
        let buttons = showMessageBoxOK(world, world.scenarioData.popup_1_title, world.scenarioData.popup_1_description, 
            "Start Tutorial", (that) => {

                gameParams.tutorialMode = true;
                gameParams.startCountry = startCountry;
                // gameParams.startCountry = keys[Math.floor(Math.random() * keys.length)]
                gameParams.statsCountry = startCountry;
                gameParams.currentCountry = startCountry;
                const countryName = world.countries[gameParams.startCountry].name;
                nestedButtons = showMessageBoxOK(world, "Prepare the world...", 
                    "In 2019, your global policy mission begins in "  + countryName + ". You have until 2070 to save the Antarctic continent. Invest in policies that will reduce the effects of climate change, arrest environmental loss and increase the preparedness of each country.", world.scenarioData.popup_2_title, 
                    (that) => {
                    
                    beginSim();

                });

            },
            "Skip Tutorial", (that) => {

                gameParams.tutorialMode = false;
                gameParams.startCountry = startCountry;
                // gameParams.startCountry = keys[Math.floor(Math.random() * keys.length)]
                gameParams.statsCountry = startCountry;
                gameParams.currentCountry = startCountry;
                const countryName = world.countries[gameParams.startCountry].name;

                nestedButtons = showMessageBoxOK(world, "Prepare the world...", 
                    "In 2019, your global policy mission begins in "  + countryName + ". You have until 2070 to save the Antarctic continent. Invest in policies that will reduce the effects of climate change, arrest environemntal loss and increase the preparedness of each country.", world.scenarioData.popup_2_title, 
                    (that) => {

                       beginSim();

                    });
            }
        );

        if (gameParams.automateMode) {

            fireClickOnTarget(buttons[1], function() {

                fireClickOnTarget(nestedButtons[0], function() {

                    if (gameParams.automateScript.fastForward) {

                        updateTimeVars(MONTH_INTERVAL / 20);
                        gameParams.state = GAME_STATES.STARTED;
                        world.btnPause.enabled = true;
                        world.btnPlay.enabled = true;
                        world.btnFF.enabled = false;

                    }

                });

            });

        }                    

    }

});

const WorldScene = cc.Scene.extend({
    
    ctor:function (automateID) {
        this._super();

        if (typeof(automateID) !== "undefined")
            this.automateID = automateID;
        else
            this.automateID = -1;
    },

    onEnter:function () {
        this._super();

        const scene = this;
        
        // Add country data 
        cc.loader.loadJson("res/scenario-nature.json",function(error, scenarioData){

            // Add script data 
            cc.loader.loadJson("res/automate.json",function(error, data){
                
                automateScripts = data;

                const layer = new WorldLayer(scenarioData, scene.automateID);
                scene.addChild(layer);

            });
                
        });

    }
});


const LoadingScene = cc.Scene.extend({

    onEnter:function () {
        this._super();

        const layer = this;
        const size = cc.winSize;

        const layout = new ccui.Layout();
        layout.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        layout.setBackGroundColor(COLOR_LICORICE);
        layout.setContentSize(cc.size(size.width, size.height));
        const layoutSize = layout.getContentSize();
        layout.setLayoutType(ccui.Layout.RELATIVE);
        layout.attr({ x: size.width / 2 - layoutSize.width / 2, y: size.height / 2 - layoutSize.height / 2 });
        layer.addChild(layout, 1);

        layout.setTouchEnabled(true);
        layout.setSwallowTouches(true);

        const antarcticaSprite = new cc.Sprite(res.antarctica_large_png);
        antarcticaSprite.setAnchorPoint(new cc.p(0.5,0.5));
        antarcticaSprite.setContentSize(cc.size(100, 101));
        antarcticaSprite.setScale(1.5);
        antarcticaSprite.setPosition(cc.p(size.width / 2, 7 * size.height / 8));
        layer.addChild(antarcticaSprite, 101);
        
        const margin = new ccui.Margin(0, 0, 0, 0);
        const lp0 = new ccui.RelativeLayoutParameter();
        lp0.setMargin(margin);
        lp0.setAlign(ccui.RelativeLayoutParameter.PARENT_TOP_CENTER_HORIZONTAL);
        const lblWelcome = new ccui.Text("Welcome to Antarctic Futures!", FONT_FACE_BODY, 36);
        lblWelcome.color = COLOR_FOREGROUND;
        lblWelcome.setAnchorPoint(new cc.p(0.5,0.5));
        lblWelcome.setPosition(cc.p(size.width / 2, 5 * size.height / 8));
        layer.addChild(lblWelcome, 101);

        const lblAbout = new ccui.Text("This game is developed as part of a research project, 'Antarctic Cities and the Global Commons'. As part of our research, we collect your IP address, as well as anonymous data during the game. To learn more, click the 'Learn More' button below.", FONT_FACE_BODY, 20);
        lblAbout.setAnchorPoint(cc.p(0.0,1.0));
        lblAbout.ignoreContentAdaptWithSize(false);
        lblAbout.setPosition(cc.p(1 * size.width / 8, 4 * size.height / 8));
        lblAbout.setContentSize(cc.size(6 * size.width / 8, 1 * size.height / 8));
        layer.addChild(lblAbout, 101);


        const btnPlay = new ccui.Button();
        btnPlay.setContentSize(cc.size(320, 80));
        btnPlay.setSwallowTouches(false);
        btnPlay.setPressedActionEnabled(true);
        btnPlay.setScale9Enabled(true);
        btnPlay.loadTextures(res.button_white, res.button_grey, res.button_grey);
        btnPlay.setTitleText("PLAY");
        btnPlay.setTitleFontName(FONT_FACE_BODY);
        btnPlay.setTitleColor(COLOR_BLACK);
        btnPlay.setTitleFontSize(38);
        btnPlay.setAnchorPoint(cc.p(0.5,0.5));
        btnPlay.setPosition(cc.p(3 * size.width / 8, 1 * size.height / 8));
        if (cc.sys.localStorage.content === "true") {

            btnPlay.setTouchEnabled(true);
            btnPlay.setBright(true);
            btnPlay.setEnabled(true);
        
        }
        else {
            btnPlay.setTouchEnabled(false);
            btnPlay.setBright(false);
            btnPlay.setEnabled(false);
        }
        layer.addChild(btnPlay, 101);

        const btnLearnMore = new ccui.Button();
        btnLearnMore.setContentSize(cc.size(320, 80));
        btnLearnMore.setTouchEnabled(true);
        btnLearnMore.setSwallowTouches(false);
        btnLearnMore.setPressedActionEnabled(true);
        btnLearnMore.setScale9Enabled(true);
        btnLearnMore.loadTextures(res.button_white, res.button_grey, res.button_grey);
        btnLearnMore.setTitleText("LEARN MORE");
        btnLearnMore.setTitleFontName(FONT_FACE_BODY);
        btnLearnMore.setTitleColor(COLOR_BLACK);
        btnLearnMore.setTitleFontSize(38);
        btnLearnMore.setAnchorPoint(cc.p(0.5,0.5));
        btnLearnMore.setPosition(cc.p(5 * size.width / 8, 1 * size.height / 8));
        layer.addChild(btnLearnMore, 101);
        
        const selectedStateEvent = (sender, type) => {
            switch (type) {
                case  ccui.CheckBox.EVENT_UNSELECTED:
                    btnPlay.setBright(false);
                    btnPlay.setEnabled(false);
                    btnPlay.setTouchEnabled(false);
                    cc.sys.localStorage.content = false;
                    break;
                case ccui.CheckBox.EVENT_SELECTED:
                    btnPlay.setBright(true);
                    btnPlay.setEnabled(true);
                    btnPlay.setTouchEnabled(true);
                    cc.sys.localStorage.content = true;
                    break;

                default:
                    break;
            }
        }

        const chbAgree = new ccui.CheckBox();
        chbAgree.setColor(COLOR_WHITE);
        chbAgree.setTouchEnabled(true);
        chbAgree.setSwallowTouches(false);
        chbAgree.loadTextures("res/ccs-res/cocosui/check_box_normal.png",
                "res/ccs-res/cocosui/check_box_normal_press.png",
                "res/ccs-res/cocosui/check_box_active.png",
                "res/ccs-res/cocosui/check_box_normal_disable.png",
                "res/ccs-res/cocosui/check_box_active_disable.png");
        chbAgree.setAnchorPoint(cc.p(0.0,1.0));
        chbAgree.setPosition(cc.p(1 * size.width / 8, 3 * size.height / 8));
        chbAgree.setSelected(cc.sys.localStorage.content === "true");
        chbAgree.addEventListener(selectedStateEvent, this);

        const lblAgreeTerms = new ccui.Text("I agree to participate in this research project, and understand my gameplay data will be recorded anonymously.", FONT_FACE_BODY, 20);
        lblAgreeTerms.ignoreContentAdaptWithSize(false);
        lblAgreeTerms.setPosition(cc.p(40 + 1 * size.width / 8, 3 * size.height / 8));
        lblAgreeTerms.setAnchorPoint(cc.p(0.0,1.0));
        lblAgreeTerms.setContentSize(cc.size( 6 * size.width / 8, size.height / 8));
        layer.addChild(chbAgree, 101);
        layer.addChild(lblAgreeTerms, 101);

        const lblVersion = new ccui.Text(VERSION_ANTARCTIC_FUTURES, FONT_FACE_BODY, 14);
        lblVersion.setAnchorPoint(cc.p(1.0,0.0));
        lblVersion.setColor(COLOR_POLICY_POINTS);
        lblVersion.ignoreContentAdaptWithSize(false);
        lblVersion.setPosition(cc.p(size.width, 10));
        lblVersion.setContentSize(cc.size(100, 20));
        layer.addChild(lblVersion, 101);
        
        const btnAutomate1 = new ccui.Button();
        btnAutomate1.setContentSize(cc.size(80, 80));
        btnAutomate1.setTouchEnabled(true);
        btnAutomate1.setSwallowTouches(false);
        btnAutomate1.setPressedActionEnabled(true);
        btnAutomate1.setScale9Enabled(true);
        btnAutomate1.setPosition(cc.p(0, 0));
        layer.addChild(btnAutomate1, 100);

        const btnAutomate2 = new ccui.Button();
        btnAutomate2.setContentSize(cc.size(80, 80));
        btnAutomate2.setTouchEnabled(true);
        btnAutomate2.setSwallowTouches(false);
        btnAutomate2.setPressedActionEnabled(true);
        btnAutomate2.setScale9Enabled(true);
        btnAutomate2.setPosition(cc.p(100, 0));
        layer.addChild(btnAutomate2, 100);

        const btnAutomate3 = new ccui.Button();
        btnAutomate3.setContentSize(cc.size(80, 80));
        btnAutomate3.setTouchEnabled(true);
        btnAutomate3.setSwallowTouches(false);
        btnAutomate3.setPressedActionEnabled(true);
        btnAutomate3.setScale9Enabled(true);
        btnAutomate3.setPosition(cc.p(200, 0));
        layer.addChild(btnAutomate3, 100);

        const btnAutomate4 = new ccui.Button();
        btnAutomate4.setContentSize(cc.size(80, 80));
        btnAutomate4.setTouchEnabled(true);
        btnAutomate4.setSwallowTouches(false);
        btnAutomate4.setPressedActionEnabled(true);
        btnAutomate4.setScale9Enabled(true);
        btnAutomate4.setPosition(cc.p(300, 0));
        layer.addChild(btnAutomate4, 100);

        const btnAutomate5 = new ccui.Button();
        btnAutomate5.setContentSize(cc.size(80, 80));
        btnAutomate5.setTouchEnabled(true);
        btnAutomate5.setSwallowTouches(false);
        btnAutomate5.setPressedActionEnabled(true);
        btnAutomate5.setScale9Enabled(true);
        btnAutomate5.setPosition(cc.p(400, 0));
        layer.addChild(btnAutomate5, 100);

        const automateHandler1 = function() { 
            cc.director.runScene(new WorldScene(1)); 
        };
        const automateHandler2 = function() { 
            cc.director.runScene(new WorldScene(2)); 
        };
        const automateHandler3 = function() { 
            cc.director.runScene(new WorldScene(3)); 
        };
        const automateHandler4 = function() { 
            cc.director.runScene(new WorldScene(4)); 
        };
        const automateHandler5 = function() { 
            cc.director.runScene(new WorldScene(5)); 
        };
        const playHandler = function() { 
        
            if (cc.sys.localStorage.content === "true") {

                // if (cc.sys.platform != cc.sys.IPAD && cc.sys.platform != cc.sys.IPHONE) {
                if (cc.sys.os != cc.sys.OS_IOS) {
                    var el = document.getElementById('gameCanvas');
                    cc.screen.requestFullScreen(document.documentElement).catch(err => {
                        //alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                    });
                 } 
        
                cc.director.runScene(new WorldScene()); 
                // cc.director.runScene(new cc.TransitionMoveInR(1, new NewGameScene()));

            }
        };
        const learnMoreHandler = function() {
            cc.sys.openURL("https://antarctic-cities.org/the-game/");
        };

        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed:  (keyCode, event) => {},
                onKeyReleased: (keyCode, event) => {

                    const automateID = parseInt(cc.sys.isNative ? that.getNativeKeyName(keyCode) : String.fromCharCode(keyCode)) ;
                    if (!isNaN(automateID) && automateID > 0 && automateID < 7 ) {
                    
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


const NewGameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        const layer = this;
        const size = cc.winSize;

        const layerBackground = new cc.LayerColor(COLOR_BACKGROUND, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        layer.addChild(layerBackground, 1);

        const newLabel = new cc.LabelTTF("New Game", FONT_FACE_BODY, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.8})
        this.addChild(newLabel);

        const loadLabel = new cc.LabelTTF("Load Game", FONT_FACE_BODY, 38);
        loadLabel.attr({x: size.width * 0.5, y: size.height * 0.4})
        this.addChild(loadLabel);


        const listener1 = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : (event) => {

                const target = event.getCurrentTarget();
                const locationInNode = target.convertToNodeSpace(event.getLocation());    
                const s = target.getContentSize();
                const rect = cc.rect(0, 0, s.width, s.height);
                
                if (cc.rectContainsPoint(rect, locationInNode)) {       

                    cc.director.runScene(new cc.TransitionMoveInR(1, new SelectChallengeScene()));
                    return true;

                }

                return false;

            }

        });

        const listener2 = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : (event) => {

                const target = event.getCurrentTarget();
                const locationInNode = target.convertToNodeSpace(event.getLocation());    
                const s = target.getContentSize();
                const rect = cc.rect(0, 0, s.width, s.height);
            
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


const SelectChallengeScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        const size = cc.winSize;

        const newLabel = new cc.LabelTTF("Select a Challenge", FONT_FACE_BODY, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.4})
        this.addChild(newLabel);

        const waterLabel = new cc.LabelTTF("Water Challenge", FONT_FACE_BODY, 38);
        waterLabel.attr({x: size.width * 0.5, y: size.height * 0.4})
        this.addChild(waterLabel);

        const listener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp : (event) => {
                const target = event.getCurrentTarget();
                const locationInNode = target.convertToNodeSpace(event.getLocation());    
                const s = target.getContentSize();
                const rect = cc.rect(0, 0, s.width, s.height);
                
                if (cc.rectContainsPoint(rect, locationInNode)) {     
                
                    cc.log(target)  
                    cc.director.runScene(new cc.TransitionMoveInR(1, new SelectDifficultyScene()));
                    return true;
                
                }
                
                return false;

            }

        });

        cc.eventManager.addListener(listener, waterLabel);
    }

});


const SelectDifficultyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        const layer = this;
        const size = cc.winSize;

        const layerBackground = new cc.LayerColor(COLOR_BACKGROUND, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        layer.addChild(layerBackground, 1);

        const newLabel = new cc.LabelTTF("Select a game difficulty", FONT_FACE_BODY, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.8})
        this.addChild(newLabel);

        const casualLabel = new cc.LabelTTF("Casual", FONT_FACE_BODY, 38);
        casualLabel.attr({x: size.width * 0.25, y: size.height * 0.5})
        this.addChild(casualLabel);

        const normalLabel = new cc.LabelTTF("Normal", FONT_FACE_BODY, 38);
        normalLabel.attr({x: size.width * 0.5, y: size.height * 0.5})
        this.addChild(normalLabel);

        const brutalLabel = new cc.LabelTTF("Brutal", FONT_FACE_BODY, 38);
        brutalLabel.attr({x: size.width * 0.75, y: size.height * 0.5})
        this.addChild(brutalLabel);

        const listener = cc.EventListener.create({

            event: cc.EventListener.MOUSE,
            onMouseUp : (event) => {

                const target = event.getCurrentTarget();
                const locationInNode = target.convertToNodeSpace(event.getLocation());    
                const s = target.getContentSize();
                const rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {       

                    gameParams.level = target.getString();
                    cc.director.runScene(new cc.TransitionMoveInR(1, new EnterNameScene()));
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


const EnterNameScene = cc.Scene.extend({
    
    onEnter:function () {

        this._super();

        const size = cc.winSize;

        const newLabel = new cc.LabelTTF("Enter a name for your policy", FONT_FACE_BODY, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.8});
        this.addChild(newLabel);

        const enterNameLabel = new cc.LabelTTF("Just click for now", FONT_FACE_BODY, 38);
        enterNameLabel.attr({x: size.width * 0.5, y: size.height * 0.5});
        this.addChild(enterNameLabel);

        const listener = cc.EventListener.create({

            event: cc.EventListener.MOUSE,
            onMouseUp : (event) => {

                const target = event.getCurrentTarget();
                const locationInNode = target.convertToNodeSpace(event.getLocation());    
                const s = target.getContentSize();
                const rect = cc.rect(0, 0, s.width, s.height);
                
                if (cc.rectContainsPoint(rect, locationInNode)) {       

                    gameParams.name = target.getString();
                    cc.director.runScene(new cc.TransitionMoveInR(1, new ModifyCodeScene()));
                    return true;

                }
                return false;

            }

        });

        cc.eventManager.addListener(listener.clone(), enterNameLabel);
    
    }

});


const ModifyCodeScene = cc.Scene.extend({

    onEnter:function () {
        this._super();

        const size = cc.winSize;

        const newLabel = new cc.LabelTTF("Modify Code", FONT_FACE_BODY, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.8})
        this.addChild(newLabel);

        const modifyCodeLabel = new cc.LabelTTF("Just click for now", FONT_FACE_BODY, 38);
        newLabel.attr({x: size.width * 0.5, y: size.height * 0.5})
        this.addChild(modifyCodeLabel);

        const listener1 = cc.EventListener.create({

            event: cc.EventListener.MOUSE,
            onMouseUp : (event) => {
                
                const target = event.getCurrentTarget();
                const locationInNode = target.convertToNodeSpace(event.getLocation());    
                const s = target.getContentSize();
                const rect = cc.rect(0, 0, s.width, s.height);

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


const DesignPolicyLayer = cc.Layer.extend({

    ctor:function (world) {
        
        this._super();
        this.world = world;
        world.designPolicyLayer = this;

    },
    onEnter:function () {

        this._super();

        const layer = this;
        const size = cc.winSize;
        let policySelected = null;
        let policySelectedButton = null;

        // For automation
        layer.policyButtons = [];

        const layerBackground = new cc.LayerColor(COLOR_BLACK, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        layer.addChild(layerBackground, 1);

        const heading = new ccui.Text("Build a policy platform", FONT_FACE_BODY, 38);
        heading.attr({x: size.width * 0.5, y: size.height * 0.9});
        heading.setColor(COLOR_ICE);
        layer.addChild(heading, 101);

        const btnExit = new ccui.Button();
        btnExit.setTouchEnabled(true);
        btnExit.setSwallowTouches(false);
        btnExit.setPosition(cc.p(size.width * 0.9, size.height * 0.9));
        btnExit.setColor(COLOR_ICE);
        btnExit.setTitleFontSize(72);
        btnExit.setTitleText("X");

        handleMouseTouchEvent(btnExit, () => {
            
            world.setVisible(true);
            layer.removeFromParent();
            gameParams.state = GAME_STATES.STARTED;
            gameParams.modal = false;

        });

        layer.btnExit = btnExit;
        layer.addChild(btnExit, 102);

        const policyDetailsBackground = new cc.LayerColor(COLOR_BLACK, 400, 400);
        policyDetailsBackground.setAnchorPoint(cc.p(0, 0));
        policyDetailsBackground.setPosition(cc.p(800, 200));
        layer.addChild(policyDetailsBackground, 110);

        const policyLabel = new ccui.Text("", FONT_FACE_TITLE, 30);
        policyLabel.setColor(COLOR_ICE);
        policyLabel.setAnchorPoint(cc.p(0, 0));
        policyLabel.setPosition(cc.p(20, 310));
        policyDetailsBackground.addChild(policyLabel);

        const policyGeneralLabel = "<<< Select one of these policies to invest in it!";
        const policyDescription = new ccui.Text("", FONT_FACE_BODY, 24);
        policyDescription.ignoreContentAdaptWithSize(false);
        policyDescription.setAnchorPoint(cc.p(0, 0));
        policyDescription.setContentSize(cc.size(360,170));
        policyDescription.setPosition(cc.p(20, 120));
        policyDescription.setColor(COLOR_ICE);
        policyDescription.setString(policyGeneralLabel);
        policyDetailsBackground.addChild(policyDescription, 2);

        const policyCostLabel = new ccui.Text("", FONT_FACE_BODY, 30);
        policyCostLabel.setColor(COLOR_ICE);
        policyCostLabel.setAnchorPoint(cc.p(0, 0));
        policyCostLabel.setPosition(cc.p(20, 80));
        policyDetailsBackground.addChild(policyCostLabel);

        const btnPolicyInvest = new ccui.Button(res.button_white, "", res.button_grey);
        btnPolicyInvest.setTouchEnabled(true);
        btnPolicyInvest.setSwallowTouches(false);
        btnPolicyInvest.setSize(cc.size(300, 60));
        btnPolicyInvest.setScale9Enabled(true);
        btnPolicyInvest.setPosition(cc.p(20, 0));
        btnPolicyInvest.setAnchorPoint(cc.p(0, 0));
        btnPolicyInvest.setTitleFontSize(24);
        btnPolicyInvest.setTitleColor(COLOR_BLACK);
        btnPolicyInvest.setTitleFontName(FONT_FACE_BODY);
        btnPolicyInvest.setTitleText("Invest in this policy");
        
        // For automation
        layer.investButton = btnPolicyInvest;

        const costCalculation = (policySelected) => {
            
            let policyLevel = gameParams.policies[policySelected.id];
            let cost = policySelected.cost_1;

            if (policyLevel !== undefined) {

                switch(policyLevel) {
                    case 1:
                        cost = policySelected.cost_2;
                        break;
                    case 2:
                        cost = policySelected.cost_3;
                        break;
                    case 3:
                        cost = 0;
                        break;
                }

            }

            let dists = world.generateResourceDistribution();
            let policyCategory = Math.floor((policySelected.id - 1) / 4);
            let weights = [];

            for (let i = 0; i < dists.length; i++) {

                if (i % 4 == 0) {

                    weights.push(dists[i] * 4);
                    
                }
                else {

                    let wi = Math.floor(i / 4);
                    weights[wi] += dists[i] * 4;

                }

            }

            if (weights[policyCategory] > 1)
                cost *= weights[policyCategory];
            
            cost = Math.round(cost);

            return cost;

        };

        handleMouseTouchEvent(btnPolicyInvest, () => {

            const cost = costCalculation(policySelected);
            
            if (gameParams.resources - cost >= 0 && 
                gameParams.policies[policySelected.id] === undefined) {

                gameParams.resources -= cost;  
                gameParams.policies[policySelected.id] = 1;
                policySelectedButton.enabled = false;
                layer.resourceScoreLabel.setString(gameParams.resources.toString());
                levelButtons[policySelected.id * 100 + 1].texture = res.policy_dot_on_png;
                layer.policyButtons[policySelected.id - 1].enabled = false;

            }
            else if (gameParams.resources - cost >= 0 && 
                gameParams.policies[policySelected.id] === 1) {

                gameParams.resources -= cost;  
                gameParams.policies[policySelected.id] = 2;
                policySelectedButton.enabled = false;
                layer.resourceScoreLabel.setString(gameParams.resources.toString());
                levelButtons[policySelected.id * 100 + 2].texture = res.policy_dot_on_png;
                layer.policyButtons[policySelected.id - 1].enabled = false;

            }
            else if (gameParams.resources - cost >= 0 && 
                gameParams.policies[policySelected.id] == 2) {

                gameParams.resources -= cost;  
                gameParams.policies[policySelected.id] = 3;
                policySelectedButton.enabled = false;
                layer.resourceScoreLabel.setString(gameParams.resources.toString());
                levelButtons[policySelected.id * 100 + 3].texture = res.policy_dot_on_png;
                layer.policyButtons[policySelected.id - 1].enabled = false;

            }

            let newCost = costCalculation(policySelected);
            policyCostLabel.setString("Cost: " + newCost.toString());

            if (gameParams.policies[policySelected.id] == 3) {

                btnPolicyInvest.setBright(false);
                btnPolicyInvest.setEnabled(false);
                btnPolicyInvest.setTitleText("Policy completed!");

            }
            else if (cost < gameParams.resources) {

                btnPolicyInvest.setBright(true);
                btnPolicyInvest.setEnabled(true);
                btnPolicyInvest.setTitleText("Invest in this policy");

            }
            else {

                btnPolicyInvest.setBright(false);
                btnPolicyInvest.setEnabled(false);
                btnPolicyInvest.setTitleText("You need more resources!");

            }

        });

        policyDetailsBackground.addChild(btnPolicyInvest, 100);

        const pageView = new ccui.PageView();
        pageView.setContentSize(cc.size(size.width, size.height - Y_OFFSET));
        pageView.setAnchorPoint(cc.p(0, 0));
        pageView.setPosition(cc.p(X_OFFSET, Y_OFFSET));
        const pageCount = 4;
        const levelButtons = {};
       
        for (let i = 0; i < pageCount; ++i) {

            const layout = new ccui.Layout();
            layout.setContentSize(cc.size(layout.getContentSize().width * 0.5, layout.getContentSize().height * 0.5));

            let resourceGrp = {};
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
            
            const label = new ccui.Text(resourceGrp.labelText, FONT_FACE_BODY, 30);
            label.setColor(COLOR_ICE);
            label.setAnchorPoint(cc.p(0, 0));
            label.setPosition(cc.p(100, pageView.getContentSize().height * 0.8));

            let xLoc = 0, yLoc = 0, policyOptionCounter = 0; 
            
            resourceGrp.policyOptions.forEach((opt) => {

                xLoc = (1 + policyOptionCounter % 2) * 300 - 52;
                yLoc = (1 - Math.floor(policyOptionCounter / 2)) * 200 + 140;
                policyOptionCounter++;

                const btnLayer = new cc.Layer();
                btnLayer.setAnchorPoint(cc.p(0, 0));
                btnLayer.attr({x: xLoc, y: yLoc});
                btnLayer.setContentSize(cc.size(200, 200));
                layout.addChild(btnLayer, 101);

                const btn = new ccui.Button();
                btn.setName(opt.text);
                btn.setTouchEnabled(true);
                btn.setSwallowTouches(false);
                btn.setAnchorPoint(cc.p(0, 0));
                btn.setScale9Enabled(true);
                btn.loadTextures(opt.img_normal, "", opt.img_on);
                btn.attr({x: 52, y: 52});
                btn.setContentSize(cc.size(104, 104));
                layer.policyButtons.push(btn);

                btn.cost_1 = opt.cost_1;
                btn.cost_2 = opt.cost_2;
                btn.cost_3 = opt.cost_3;
                btnLayer.option = opt;
                btn.option = opt;

                if (gameParams.policies[opt.id] !== undefined)
                    btn.enabled = false;

                btnLayer.addChild(btn, 101);

                const btnLabel = new cc.LabelTTF(opt.text, FONT_FACE_TITLE, 20);
                btnLabel.attr({ x: 78  , y: 0 });
                btnLabel.setAnchorPoint(cc.p(0.5, 0.0));
                btnLayer.addChild(btnLabel, 101);

                let btnLvl1, btnLvl2, btnLvl3;

                if (gameParams.policies[opt.id] === undefined) {
                    
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
                
                btnLvl1.attr({ x: 0 , y: 52 });
                btnLvl1.setAnchorPoint(cc.p(0.0, 0.0));
                btnLvl2.attr({ x: 0 , y: btnLvl1.y + 35 })
                btnLvl2.setAnchorPoint(cc.p(0.0, 0.0));
                btnLvl3.attr({ x: 0 , y: btnLvl2.y + 35 })
                btnLvl3.setAnchorPoint(cc.p(0.0, 0.0));
                btnLayer.addChild(btnLvl1, 101);
                btnLayer.addChild(btnLvl2, 101);
                btnLayer.addChild(btnLvl3, 101);

                levelButtons[opt.id * 100 + 1] = btnLvl1;
                levelButtons[opt.id * 100 + 2] = btnLvl2;
                levelButtons[opt.id * 100 + 3] = btnLvl3;

                const policySelector = (target) => {

                    policySelected = target.option;
                    policyLabel.setString(policySelected.text_long);
                    policyDescription.setString(policySelected.description);
                    
                    const cost = costCalculation(policySelected);
                    policyCostLabel.setString("Cost: " + cost.toString());

                    if (gameParams.policies[opt.id] == 3) {

                        btnPolicyInvest.setBright(false);
                        btnPolicyInvest.setEnabled(false);
                        btnPolicyInvest.setTitleText("Policy completed!");

                    }
                    else if (cost < gameParams.resources) {

                        btnPolicyInvest.setBright(true);
                        btnPolicyInvest.setEnabled(true);
                        btnPolicyInvest.setTitleText("Invest in this policy");

                    }
                    else {

                        btnPolicyInvest.setBright(false);
                        btnPolicyInvest.setEnabled(false);
                        btnPolicyInvest.setTitleText("You need more resources!");

                    }

                    policySelectedButton = target;

                    policyLabel.setVisible(true);
                    policyCostLabel.setVisible(true);
                    btnPolicyInvest.setVisible(true);

                };
                
                handleMouseTouchEvent(btnLayer, policySelector);

            });
            pageView.insertPage(layout, i);
        }

        layer.addChild(pageView, 100);
        pageView.setCurrentPageIndex(0);

        // Add buttons to jump to specific page
        let prevButton = null;
        const makeButton = function(text, point, index) {

            const btn = new ccui.Button();
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

                policySelected = null;
                pageView.setCurrentPageIndex(index);
                btn.setBright(false);
                btn.enabled = false;
                btn.setColor(COLOR_UMBER);

                if (prevButton != null && prevButton != btn) {
                    
                    prevButton.setBright(true);
                    prevButton.enabled = true;
                    prevButton.setColor(COLOR_ICE);

                }
                
                prevButton = btn;

                policyLabel.setVisible(false);
                policyDescription.setString(policyGeneralLabel);
                policyCostLabel.setVisible(false);
                btnPolicyInvest.setVisible(false);

            });

            // Select the first button only
            if (index == 0) {
            
                btn.setBright(false);
                btn.enabled = false;
                btn.setColor(COLOR_UMBER);
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

        const antarcticaSmallSprite = new cc.Sprite(res.antarctica_small_png);
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


const StatsLayer = cc.Layer.extend({

    ctor:function (world) {
    
        this._super();
        this.world = world;
    
    },

    onEnter:function () {

        this._super();

        const layer = this;
        const size = cc.winSize;

        const layerBackground = new cc.LayerColor(COLOR_BACKGROUND, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        layer.addChild(layerBackground, 1);

        const heading = new ccui.Text("Track how the world is doing", FONT_FACE_BODY, 38);
        heading.attr({x: size.width * 0.5, y: size.height * 0.9});
        heading.setColor(COLOR_ICE);
        layer.addChild(heading, 101);

        const pageView = new ccui.PageView();
        pageView.setContentSize(cc.size(size.width, size.height - 80));
        pageView.setAnchorPoint(cc.p(0, 0));
        pageView.setPosition(cc.p(0, 0));

        const layoutWorld = new ccui.Layout();
        layoutWorld.setContentSize(size.width * 0.5, size.height * 0.5);

        const layoutCountries = new ccui.Layout();
        layoutCountries.setContentSize(size.width * 0.5, size.height * 0.5);

        const layoutTime = new ccui.Layout();
        layoutTime.setContentSize(size.width * 0.5, size.height * 0.5);

        layerBackground.addChild(layoutWorld, 100);
        layerBackground.addChild(layoutCountries, 100);
        layerBackground.addChild(layoutTime, 100);
        layoutWorld.setVisible(true);
        layoutCountries.setVisible(false);
        layoutTime.setVisible(false);

        // add buttons to jump to specific page
        let prevButton = null;

        const makeButton = (text, point, index) => {
            
            const btn = new ccui.Button();
            btn.setTouchEnabled(true);
            btn.setSwallowTouches(false);
            btn.setAnchorPoint(cc.p(0, 0));
            btn.setColor(COLOR_ICE);
            btn.setPosition(point);
            btn.setName(text);
            btn.setTitleText(text);
            btn.setTitleFontSize(36);
            btn.setTitleFontName(FONT_FACE_TITLE);

            handleMouseTouchEvent(btn, () => {
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
                btn.setColor(COLOR_UMBER);
                
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
                btn.setColor(COLOR_UMBER);
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

        const antarcticaSmallSprite = new cc.Sprite(res.antarctica_small_png);
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

        const makeString = function(num) { return (Math.round(num * 10) / 10).toString() + '%'; };

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
        
        this.policyDescriptionLabel = new cc.LabelTTF("Thanks to your policy platform, " + makeString(gameParams.populationPreparedPercent) + " of the world is now more ready to take action against climate change." , FONT_FACE_BODY, 20);
        this.policyDescriptionLabel.setAnchorPoint(cc.p(0, 0));
        this.policyDescriptionLabel.setPosition(cc.p(size.width * 0.2, size.height * 0.3));
        layoutWorld.addChild(this.policyDescriptionLabel, 100);

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
        const countriesSorted = Object.values(world.countries).sort((a, b) => {
            if(a.name < b.name) { return -1; }
            if(a.name > b.name) { return 1; }
            return 0;            
        });

        const CustomTableViewCell = cc.TableViewCell.extend({
            draw:function (ctx) {
                this._super(ctx);
            }
        });

        const TableViewCountriesLayer = cc.Layer.extend({

            ctor:function () {
                this._super();
                this.init();
            },
        
            init:function () {
                const winSize = cc.director.getWinSize();
        
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

        
            scrollViewDidScroll: (view) => {},
            scrollViewDidZoom: (view) => {},
        
            tableCellTouched: (table, cell) => {
                cc.log("cell touched at index: " + cell.getIdx());
            },
        
            tableCellSizeForIndex: (table, idx) => {

                return cc.size(size.width * 0.5, 30);

            },
        
            tableCellAtIndex: (table, idx) => {

                let country = countriesSorted[idx];
                let color = country.loss > 20 ? COLOR_DESTRUCTION_POINTS : (country.pop_prepared_percent > 20 ? COLOR_POLICY_POINTS : COLOR_ICE);
                let cell = table.dequeueCell();
                let labelCountry, labelLoss, labelPreparedness;

                if (!cell) {
                
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

                } 
                else {

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
        
            numberOfCellsInTableView: (table) => {

                return Object.keys(world.countries).length;

            }

        });
        
        let countriesTable = new TableViewCountriesLayer();
        layoutCountries.addChild(countriesTable);

        // Add graph
        const graphX = size.width * 0.25;
        const graphEndX = graphX + size.width * 0.5;
        const graphY = 200;
        const graphEndY = graphY + size.height * 0.5;
        const years = gameParams.targetDate.getFullYear() - gameParams.startDate.getFullYear();
        const graphIncrementX = size.width * 0.5 / years;
        const graphIncrementY = size.height * 0.5 / 100;
        const graphOffset = 40;
        const lblStartYear = cc.LabelTTF.create(gameParams.startDate.getFullYear(), FONT_FACE_BODY, 24);
        const lblEndYear = cc.LabelTTF.create(gameParams.targetDate.getFullYear(), FONT_FACE_BODY, 24);
        lblStartYear.attr({ x: graphX, y: graphY});
        lblEndYear.attr({ x: graphEndX, y: graphY});
        lblStartYear.setAnchorPoint(cc.p(0, 0));
        lblEndYear.setAnchorPoint(cc.p(0, 0));
        layoutTime.addChild(lblStartYear);
        layoutTime.addChild(lblEndYear);

        let drawNode = new cc.DrawNode();
        drawNode.setOpacity(255);
        
        let x_o, yP_o, yL_o, x, yP, yL;
        const colorD =  new cc.Color(COLOR_DESTRUCTION_POINTS.r, 
                                    COLOR_DESTRUCTION_POINTS.g, 
                                    COLOR_DESTRUCTION_POINTS.b, 255);
        const colorP =  new cc.Color(COLOR_POLICY_POINTS.r, 
                                    COLOR_POLICY_POINTS.g, 
                                    COLOR_POLICY_POINTS.b, 255);

        const lineOffset = -10;    
        drawNode.drawSegment(cc.p(0, graphOffset + lineOffset), cc.p(size.width * 0.5, graphOffset + lineOffset), 2, COLOR_ICE);
        drawNode.drawSegment(cc.p(0, graphOffset + lineOffset), cc.p(0, graphOffset + size.height * 0.5), 2, COLOR_ICE);

        for (let i = gameParams.startDate.getFullYear(); i < gameParams.targetDate.getFullYear(); i++) {

            const index = i - gameParams.startDate.getFullYear();
            
            const stats = gameParams.stats[i];
            if (stats === undefined)
                continue;

            const loss = stats.loss;
            const prepared = stats.prepared;
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

        const lblDestructionScore = cc.LabelTTF.create(makeString(gameParams.totalLoss), FONT_FACE_BODY, 24);
        const lblPolicyScore = cc.LabelTTF.create(makeString(gameParams.populationPreparedPercent), FONT_FACE_BODY, 24);
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

        const btnExit = new ccui.Button();
        btnExit.setTouchEnabled(true);
        btnExit.setSwallowTouches(false);
        btnExit.setPosition(cc.p(size.width * 0.9, size.height * 0.9));
        btnExit.setColor(COLOR_ICE);
        btnExit.setTitleFontSize(72);
        btnExit.setTitleText("X");
        
        handleMouseTouchEvent(btnExit, function() {
        
            world.setVisible(true);
            layer.removeFromParent();
            gameParams.state = GAME_STATES.STARTED;
            gameParams.modal = false;
        
        });

        layerBackground.addChild(btnExit, 102);

    }

});

