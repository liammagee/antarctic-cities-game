function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Global constants
var VERSION_ANTARCTIC_FUTURES = "Build: 1004";

var FONT_FACE_TITLE = "ArvoFont";
var FONT_FACE_BODY = "JosefinSansFont";

var X_OFFSET = 0,
    Y_OFFSET = 50;

var MONTH_INTERVAL = 20;
var RESOURCE_CHANCE = 0.1;
var CRISIS_CHANCE = 0.05;
var RESOURCE_SIZE_W = 64;
var RESOURCE_SIZE_H = 72;
var TAG_SPRITE_BATCH_NODE = 1;
var TUTORIAL_INTERVAL_MULTIPLIER = 6;
var RESOURCE_INTERVAL_MULTIPLIER = 10;
var CRISIS_INTERVAL_MULTIPLIER = 20;
var RESOURCE_DURATION = 300;
var GAME_STATES = {
    INITIALISED: 0,
    PREPARED: 1,
    STARTED: 2,
    PAUSED: 3,
    GAME_OVER: 5
};

// Game variables
var gameParams = {};
var automateScripts = [];

//------------------------------------------------------------------
//
// ShaderOutline
//
//------------------------------------------------------------------
//FIX ME:
//The renderers of webgl and opengl is quite different now, so we have to use different shader and different js code
//This is a bug, need to be fixed in the future
var ShaderOutlineEffect = cc.LayerGradient.extend({

    ctor: function ctor(node, country, loss) {

        this._super();

        this.node = node;
        this.country = country;
        this.loss = loss;
        this.timeCounter = 0;

        var ccbjs = "res/";

        if ('opengl' in cc.sys.capabilities) {

            if (cc.sys.isNative) {

                this.shader = new cc.GLProgram(res.shader_outline_vertex_nomvp, res.shader_outline_fragment);
                this.shader.link();
                this.shader.updateUniforms();
            } else {

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

                var program = this.shader.getProgram();
                this.uniformResolution = gl.getUniformLocation(program, "resolution");
                this.shader.setUniformLocationF32(this.uniformResolution, 256, 256);
            }

            // this.sprite.runAction(cc.sequence(cc.rotateTo(1.0, 10), cc.rotateTo(1.0, -10)).repeatForever());

            if (cc.sys.isNative) {

                var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this.shader);
                glProgram_state.setUniformFloat("u_threshold", 1.75);
                glProgram_state.setUniformFloat("u_zoom", 1.0);
                glProgram_state.setUniformFloat("u_selected", 0.0);
                glProgram_state.setUniformFloat("u_fill1", 1.0);
                glProgram_state.setUniformFloat("u_fill2", 1.0);
                glProgram_state.setUniformVec2("u_location", { x: this.node.x, y: this.node.y });
                glProgram_state.setUniformVec2("u_mouse", { x: 0.0, y: 0.0 });
                glProgram_state.setUniformVec3("u_outlineColor1", { x: 255 / 255, y: 0 / 255, z: 0 / 255 });
                glProgram_state.setUniformVec3("u_outlineColor2", { x: 0 / 255, y: 255 / 255, z: 0 / 255 });
                node.setGLProgramState(glProgram_state);
            } else {

                node.shaderProgram = this.shader;
            }

            this.scheduleUpdate();
        }
    },

    update: function update(dt) {

        // if (gameParams.state != GAME_STATES.STARTED || gameParams.state != GAME_STATES.PAUSED)
        //     return;
        var mouseX = -1.0,
            mouseY = -1.0;

        if (world.mouse.x > this.node.x && world.mouse.x < this.node.x + this.node.width && world.mouse.y > this.node.y && world.mouse.y < this.node.y + this.node.height) {

            mouseX = (world.mouse.x - this.node.x) / this.node.width;
            mouseY = (world.mouse.y - 2 * Y_OFFSET - this.node.y) / this.node.height;
        }

        var selected = this.country.selected ? 1.0 : 0.0;

        if ('opengl' in cc.sys.capabilities) {

            if (cc.sys.isNative) {

                this.node.getGLProgramState().setUniformFloat(this.shader.getUniformLocationForName('u_selected'), selected);
                this.node.getGLProgramState().setUniformFloat(this.shader.getUniformLocationForName('u_zoom'), world.worldBackground.getScale());
                this.node.getGLProgramState().setUniformFloat(this.shader.getUniformLocationForName('u_fill1'), this.country.loss);
                this.node.getGLProgramState().setUniformFloat(this.shader.getUniformLocationForName('u_fill2'), this.country.pop_prepared_percent);
                this.node.getGLProgramState().setUniformVec2(this.shader.getUniformLocationForName('u_mouse'), { x: mouseX, y: mouseY });
                this.node.getGLProgramState().setUniformFloat("u_radius", Math.abs(this.node.getRotation() / 500));
            } else {

                this.shader.use();
                this.shader.setUniformLocationF32(this.uniformResolution, 256, 256);
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_selected'), selected);
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_zoom'), world.worldBackground.getScale());
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_fill1'), this.country.loss);
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_fill2'), this.country.pop_prepared_percent);
                this.shader.setUniformLocationWith2f(this.shader.getUniformLocationForName('u_mouse'), mouseX, mouseY);
                this.shader.setUniformLocationWith1f(this.shader.getUniformLocationForName('u_radius'), Math.abs(this.node.getRotation() / 500));
                this.shader.updateUniforms();
            }
        }
    }

});

/**
 * Initialises a set of countries.
 */
var initCountries = function initCountries() {

    var size = cc.winSize;

    /**
     * Tests whether a point is inside the points that outline a given geometric shape.
     */
    world.collisionDetection = function (points, test) {

        var crossed = false;
        var times = 0;

        // Double check the detection is within the widest bounds
        var maxx = Math.max.apply(Math, _toConsumableArray(points.map(function (p) {
            return p.x;
        })));

        for (var i = 0; i < points.length; i++) {

            var p1 = points[i];
            var p2 = i == points.length - 1 ? points[0] : points[i + 1];

            // Make floating, and jitter to avoid boundary issues with integers.
            var x1 = parseFloat(p1.x) + 0.001,
                y1 = parseFloat(p1.y) - 0.001,
                x2 = parseFloat(p2.x) + 0.001,
                y2 = parseFloat(p2.y) - 0.001;

            if (y1 < test.y && y2 >= test.y || y1 > test.y && y2 <= test.y) {

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
    world.sortedObjs = world.map.objectGroups[0].getObjects().slice(0).sort(function (a, b) {

        return a.points[0].y * size.height + a.points[0].x > b.points[0].y * size.height + b.points[0].x;
    });

    /**
     * Returns an array of points associated with a country.
     */
    var pointArray = function pointArray(name) {

        return world.sortedObjs.filter(function (so) {
            return so.name == name;
        }).map(function (so) {
            return so.points;
        });
    };

    /**
     * Generates min, max coordinates
     */
    var extremes = function extremes(name) {

        var pa = pointArray(name);
        var extremes = [];

        for (var i = 0; i < pa.length; i++) {

            var p = pa[i];
            var minx = 0,
                miny = 0,
                maxx = 0,
                maxy = 0;

            for (var j = 0; j < p.length; j++) {

                var point = p[j];
                if (minx == 0 || minx > parseInt(point.x)) minx = parseInt(point.x);
                if (miny == 0 || miny > parseInt(point.y)) miny = parseInt(point.y);
                if (maxx < parseInt(point.x)) maxx = parseInt(point.x);
                if (maxy < parseInt(point.y)) maxy = parseInt(point.y);
            }

            extremes.push({ minx: minx, miny: miny, maxx: maxx, maxy: maxy });
        }

        return extremes;
    };

    var regionalArea = function regionalArea(points) {

        var area = 0;

        for (var j = 0; j < points.length - 1; j++) {

            var pt1 = points[j];
            var pt2 = points[j + 1];
            var xy1 = pt1.x * pt2.y;
            var xy2 = pt1.y * pt2.x;
            area += Math.abs(xy1 - xy2);
        }

        return area / 2;
    };

    /*
     * Gauss shoelace algorithm - https://gamedev.stackexchange.com/questions/151034/how-to-compute-the-area-of-an-irregular-shape
     */
    var areas = function areas(name) {

        var pa = pointArray(name);
        var area = 0;

        for (var i = 0; i < pa.length; i++) {

            var p = pa[i];
            area += regionalArea(p);
        }

        return area;
    };

    /**
     * Create country centroids.
     */
    var centroids = function centroids(name) {

        var pa = pointArray(name);
        var lastArea = 0,
            thisArea = 0;
        var regionID = -1;

        for (var i = 0; i < pa.length; i++) {

            var p = pa[i];
            thisArea = regionalArea(p);

            if (thisArea > lastArea) {

                regionID = i;
                lastArea = thisArea;
            }
        }

        if (regionID == -1) return;

        var points = pa[regionID];
        var totalX = 0,
            totalY = 0;

        points.forEach(function (pt) {

            totalX += parseFloat(pt.x);
            totalY += parseFloat(pt.y);
        });

        return { x: totalX / points.length, y: totalY / points.length };
    };

    world.countries = world.map.objectGroups[0].getObjects().reduce(function (map, obj) {

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
                destructionDots: [],
                selected: false
            };
        }

        return map;
    }, {});

    // Add proportion of main land mass with shared borders
    world.countryKeys = Object.keys(world.countries);
    var allPoints = {};

    world.countryKeys.forEach(function (k) {

        var c = world.countries[k];

        c.points.forEach(function (p) {

            var pStr = p.x + "-" + p.y;

            if (allPoints[pStr]) {

                allPoints[pStr].push(c.iso_a3);
            } else {

                allPoints[pStr] = [c.iso_a3];
            }
        });
    });

    Object.keys(allPoints).forEach(function (k) {

        var countries = allPoints[k];

        countries.forEach(function (c1) {

            var country = world.countries[c1];
            countries.forEach(function (c2) {

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

    Object.keys(world.countries).forEach(function (c) {

        var country = world.countries[c];
        country.shared_border_percentage = country.points_shared / country.points_total;

        if (country.shared_border_percentage > 1.0) {

            country.shared_border_percentage = 1.0;
        }
    });

    // Add population density
    Object.keys(world.countries).forEach(function (c) {

        var country = world.countries[c];
        country.density = country.pop_est / country.area;
    });

    world.areaMin = 0, world.areaMax = 0, world.areaMean = 0;
    world.areaMinCountry = "", world.areaMaxCountry = "";

    Object.keys(world.countries).forEach(function (c) {

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

    Object.keys(world.countries).forEach(function (c) {

        var country = world.countries[c];
        // Change the power for more or less points
        country.numPoints = Math.ceil(Math.pow(country.area / world.areaMean, 2));
    });

    // Add world populations
    gameParams.populationWorld = Object.keys(world.countries).map(function (c) {
        return world.countries[c].pop_est;
    }).reduce(function (a, c) {
        return a + parseInt(c);
    }, 0);
};

/**
 * Initialises the game parameters.
 */
var initGameParams = function initGameParams(scenarioData) {

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
var fireClickOnTarget = function fireClickOnTarget(target, callback) {

    /**
     * Allow a small wait before calling the callback.
     */
    setTimeout(function () {

        // Assume no more than 4 parents
        var x = target.getPosition().x;
        var y = target.getPosition().y;

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

        var e = new cc.EventMouse(cc.EventMouse.UP);
        e.setLocation(x, y);
        cc.eventManager.dispatchEvent(e);

        if (callback !== undefined) callback();
    }, 100);
};

/**
 * Sets up game parameters at the start of play
 */
var calculatePolicyConnections = function calculatePolicyConnections() {

    gameParams.policyOptions = {};
    var policyLen = 0;

    Object.keys(RESOURCES).forEach(function (key) {

        RESOURCES[key].policyOptions.forEach(function (pol) {

            gameParams.policyOptions[pol.id] = pol;
            if (policyLen < pol.id) policyLen = pol.id;
        });
    });

    gameParams.policyRelations = {};

    for (var i = 0; i < policyLen; i++) {

        var source = gameParams.policyOptions[i + 1];
        gameParams.policyRelations[source.id] = {};

        for (var j = i + 1; j < policyLen; j++) {

            var target = gameParams.policyOptions[j + 1];
            if (gameParams.policyRelations[target.id] === undefined) gameParams.policyRelations[target.id] = {};

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
var startGameParams = function startGameParams() {

    gameParams.state = GAME_STATES.STARTED;
};

/**
 * Update time variables.
 */
var updateTimeVars = function updateTimeVars(interval) {

    gameParams.timeInterval = interval;
    gameParams.tutorialInterval = gameParams.timeInterval * TUTORIAL_INTERVAL_MULTIPLIER;
    gameParams.resourceInterval = gameParams.timeInterval * RESOURCE_INTERVAL_MULTIPLIER;
    gameParams.crisisInterval = gameParams.timeInterval * CRISIS_INTERVAL_MULTIPLIER;
};

/**
 * Load external data sources
 * Reference: https://github.com/toddmotto/public-apis#transportation
 */
var loadDataSets = function loadDataSets() {

    cc.loader.loadJson("https://api.openaq.org/v1/cities", function (error, data) {

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
var showMessageBoxOK = function showMessageBoxOK(parent, title, message, prompt1, callback1, prompt2, callback2) {

    parent.pause();

    var winWidth = cc.winSize.width,
        winHeight = cc.winSize.height;
    var btn1Offset = 0.1,
        btn2Offset = 0.0;

    if (message === null || typeof message === "undefined" || message === "") {

        if (prompt2 !== undefined) {

            btn1Offset = 0.5;
            btn2Offset = 0.3;
        } else {

            btn1Offset = 0.4;
        }
    } else {

        if (prompt2 !== undefined) {

            btn1Offset = 0.2;
            btn2Offset = 0.1;
        }
    }

    var layerBackground = new cc.LayerColor(COLOR_LICORICE, winWidth * 0.66, winHeight * 0.66);
    layerBackground.attr({
        x: winWidth / 2 - layerBackground.width / 2,
        y: winHeight / 2 - layerBackground.height / 2 });
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

    var buttons = [];
    var btn1 = new ccui.Button();
    btn1.setTouchEnabled(true);
    btn1.setSwallowTouches(false);
    btn1.setTitleText(prompt1);
    btn1.setTitleColor(COLOR_WHITE);
    btn1.setTitleFontSize(36);
    btn1.setTitleFontName(FONT_FACE_BODY);
    btn1.attr({ x: layerBackground.width / 2, y: layerBackground.height * btn1Offset });
    layerBackground.addChild(btn1);

    handleMouseTouchEvent(btn1, function () {

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

        handleMouseTouchEvent(btn2, function () {

            layerBackground.removeAllChildren(true);
            layerBackground.removeFromParent(true);
            parent.resume();
            callback2();
        });
    }

    buttons.push(btn1);

    if (btn2 !== undefined) buttons.push(btn2);

    return buttons;
};

/**
 * Post data to server
 * @param {*} parent 
 * @param {*} message 
 * @param {*} prompt 
 */
var postResultsToServer = function postResultsToServer() {

    // Test posting data
    var xhr = cc.loader.getXMLHttpRequest();

    xhr.open("POST", "http://43.240.98.94/game_data");
    // xhr.open("POST", "http://localhost:8000/game_data");

    // Set Content-type "text/plain;charset=UTF-8" to post plain text
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var gameLog = Object.assign({}, gameParams, {

        policyOptions: undefined,
        policyRelations: undefined,
        messagesNegative: undefined,
        messagesPositive: undefined,
        timeoutID: undefined,
        tutorialHints: undefined,
        tutorialInterval: undefined

    });

    var countries = {};
    Object.values(world.countries).forEach(function (c) {
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

        });
    });

    gameLog.countries = countries;

    cc.log(JSON.stringify(gameLog));
    xhr.send(JSON.stringify(gameLog));
};

/**
 * Game over dialog
 * @param {*} parent 
 * @param {*} message 
 * @param {*} prompt 
 */
var gameOver = function gameOver(parent, message, prompt) {

    postResultsToServer();

    var WINDOW_WIDTH = cc.winSize.width;
    var WINDOW_HEIGHT = cc.winSize.height;
    parent.pause();
    window.clearTimeout(gameParams.timeoutID);
    gameParams.state = GAME_STATES.PAUSED;

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

    var menu = cc.Menu.create();
    menu.setPosition(cc.p(0, 0));
    layerBackground.addChild(menu, 3);

    var btnOK = cc.MenuItemLabel.create(cc.LabelTTF.create(prompt, FONT_FACE_BODY, 36));
    btnOK.attr({
        x: layerBackground.width / 2,
        y: layerBackground.height * 0.1
    });

    handleMouseTouchEvent(btnOK, function () {

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
var handleMouseTouchEvent = function handleMouseTouchEvent(target, callback) {

    var listenerMouse = cc.EventListener.create({

        event: cc.EventListener.MOUSE,

        onMouseUp: function onMouseUp(event) {

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

        onTouchBegan: function onTouchBegan(touch, event) {

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

        onTouchEnded: function onTouchEnded(touch, event) {

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
    } else {

        cc.eventManager.addListener(listenerTouch, target);
    }
};

/**
 * Main screen - shows the world, and various controls for interaction.
 */
var WorldLayer = cc.Layer.extend({

    sprite: null,

    initControls: function initControls() {

        var controlHandler = function controlHandler(target) {

            if (target == world.btnQuit) {
                // Pause

                gameParams.state = GAME_STATES.PAUSED;
                showMessageBoxOK(world, "Options", "", "QUIT GAME", function () {

                    postResultsToServer();

                    gameParams.state = GAME_STATES.GAME_OVER;
                    cc.director.runScene(new LoadingScene());
                }, "RETURN TO GAME", function () {

                    gameParams.state = GAME_STATES.STARTED;
                });
            } else if (target == world.btnPause) {
                // Pause

                gameParams.state = GAME_STATES.PAUSED;
                world.btnPause.enabled = false;
                world.btnPlay.enabled = true;
                world.btnFF.enabled = true;
            } else if (target == world.btnPlay) {
                // Play

                updateTimeVars(MONTH_INTERVAL);
                gameParams.state = GAME_STATES.STARTED;
                world.btnPause.enabled = true;
                world.btnPlay.enabled = false;
                world.btnFF.enabled = true;
            } else if (target == world.btnFF) {
                // Fast Forward

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

    ctor: function ctor(scenarioData, automateID) {
        var _this = this;

        this._super();

        // Add to global variables to maintain state
        world = this;
        world.scenarioData = scenarioData;
        world.automateID = automateID;
        world.mouse = { x: 0, y: 0 };

        initGameParams(scenarioData);

        var size = cc.winSize;
        var WINDOW_WIDTH = cc.winSize.width;
        var WINDOW_HEIGHT = cc.winSize.height;

        var layerBackground = new cc.LayerColor(COLOR_ICE, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        this.addChild(layerBackground, 0);

        layout = new cc.LayerColor(COLOR_LICORICE, size.width, Y_OFFSET);
        layout.setAnchorPoint(new cc.p(0, 0));
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
            onMouseMove: function onMouseMove(event) {

                if (gameParams.modal) return false;

                if (event.getButton() == cc.EventMouse.BUTTON_LEFT) {
                    var node = event.getCurrentTarget();
                    var scale = node.getScale();
                    var _size = node.getContentSize();
                    var scaledX = scale * _size.width;
                    var scaledY = scale * _size.height;
                    // Calculate margins adjusted for size
                    var marginX = node.width / (2 / (1e-06 + scale - 1));
                    var marginY = -Y_OFFSET + node.height / (2 / (1e-06 + scale - 1));
                    var allowance = 200;

                    if (node.x + event.getDeltaX() < marginX + allowance && node.x + event.getDeltaX() > -marginX - allowance && node.y + event.getDeltaY() < marginY + allowance && node.y + event.getDeltaY() > -marginY - allowance) {

                        node.x += event.getDeltaX();
                        node.y += event.getDeltaY();
                    }
                }
            },
            // Zoom handling
            onMouseScroll: function onMouseScroll(event) {

                if (gameParams.modal) return false;

                var node = event.getCurrentTarget();
                var delta = cc.sys.isNative ? event.getScrollY() * 6 : -event.getScrollY();
                var newScale = node.getScale() * (1 + delta / 1000.0);
                // Calculate margins adjusted for size
                var marginX = node.width / (2 / (1e-06 + newScale - 1));
                var marginY = -Y_OFFSET + node.height / (2 / (1e-06 + newScale - 1));
                var allowance = 200;

                if (newScale <= 10.0 && newScale >= 0.9 && node.x < marginX + allowance && node.x > -marginX - allowance) {

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

        var _loop = function _loop(i) {

            var gid = i + 3;
            var l = _this.map.getLayer("Tile Layer " + gid);
            var arr = Object.values(world.countries).filter(function (c) {
                return c.gid == gid;
            });
            if (arr.length == 0) return "continue";
            var country = arr[0];

            var sprite = new cc.Sprite(l.tileset.sourceImage);

            sprite.setPosition(cc.p(parseInt(country.offsetX), parseInt(cc.winSize.height - 2 * Y_OFFSET - country.offsetY)));
            sprite.setAnchorPoint(cc.p(0., 0.));
            world.worldBackground.addChild(sprite, 3);

            world.spriteCountries[country.iso_a3] = sprite;

            var shaderNode = new ShaderOutlineEffect(sprite, country, false);
            shaderNode.width = 1;
            shaderNode.height = 1;
            shaderNode.x = _this.width;
            shaderNode.y = _this.height;
            world.worldBackground.addChild(shaderNode, 3);
        };

        for (var i = 0; i < 168; i++) {
            var _ret = _loop(i);

            if (_ret === "continue") continue;
        }

        // TOP BAR  
        this.topBarLayout = new cc.LayerColor(COLOR_ZINC);
        this.topBarLayout.setAnchorPoint(new cc.p(0, 0));
        this.topBarLayout.setPosition(cc.p(0, cc.winSize.height - Y_OFFSET));
        this.topBarLayout.setContentSize(cc.size(cc.winSize.width, Y_OFFSET));
        layout.addChild(this.topBarLayout);

        // Add controls
        this.controlsBackground = new cc.Layer();
        this.controlsBackground.setAnchorPoint(cc.p(0.0, 0.0));
        this.controlsBackground.x = cc.winSize.width * 5 / 6;
        this.controlsBackground.y = 0;
        this.controlsBackground.setContentSize(cc.size(cc.winSize.width * 6, Y_OFFSET));
        var controlsBackgroundSprite = new cc.Sprite(res.ctrls_background);
        controlsBackgroundSprite.setAnchorPoint(new cc.p(0.0, 0.0));
        controlsBackgroundSprite.setContentSize(cc.size(cc.winSize.width * 6, Y_OFFSET));
        controlsBackgroundSprite.setPosition(cc.p(0, 0));
        controlsBackgroundSprite.setOpacity(200);
        // this.controlsBackground.addChild(controlsBackgroundSprite, 1); 
        this.topBarLayout.addChild(this.controlsBackground, 1);

        // this.dateBackground = new cc.LayerColor(COLOR_BACKGROUND_TRANS, 126, 30);
        this.dateBackground = new cc.Layer();
        this.dateBackground.setAnchorPoint(cc.p(0, 0));
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

        this.btnQuit.setAnchorPoint(cc.p(0, 0));
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
        this.tweetBackground.attr({ width: WINDOW_WIDTH * 0.66, height: Y_OFFSET, x: WINDOW_WIDTH / 6, y: 0 });
        this.tweetBackground.setContentSize(cc.size(WINDOW_WIDTH * 0.66, Y_OFFSET));
        var stencil = new cc.DrawNode();
        var rectangle = [cc.p(0, 0), cc.p(this.tweetBackground.width, 0), cc.p(this.tweetBackground.width, this.tweetBackground.height), cc.p(0, this.tweetBackground.height)];

        var darkGrey = new cc.Color(42, 54, 68, 255);
        stencil.drawPoly(rectangle, darkGrey, 1, darkGrey);
        this.tweetBackground.stencil = stencil;
        this.topBarLayout.addChild(this.tweetBackground, 110);

        this.tweetBackgroundLayer = new cc.LayerColor(COLOR_BACKGROUND_TRANS);
        this.tweetBackgroundLayer.attr({ width: this.tweetBackground.width, height: this.tweetBackground.height, x: 0, y: 0 });
        this.tweetBackground.addChild(this.tweetBackgroundLayer, 100);

        this.tweetLabel = new cc.LabelTTF(gameParams.scenarioName, FONT_FACE_BODY, 18);
        this.tweetLabel.setAnchorPoint(cc.p(0, 0.5));
        this.tweetLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        this.tweetLabel.attr({ x: this.tweetBackground.width / 2, y: Y_OFFSET / 2, width: this.tweetBackground.width, height: this.tweetBackground.height });
        this.tweetLabel.color = COLOR_ICE;
        this.tweetBackground.addChild(this.tweetLabel, 101);
        this.tweetAlertLabel = new cc.LabelTTF("ALERT!", FONT_FACE_BODY, 18);
        this.tweetAlertLabel.setAnchorPoint(cc.p(0, 0.5));
        this.tweetAlertLabel.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
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
        this.statusLayout.setAnchorPoint(new cc.p(0, 0));
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
        this.btnDevelopPolicy.setAnchorPoint(new cc.p(0, 0));
        this.btnDevelopPolicy.setContentSize(cc.size(Math.ceil(cc.winSize.width * (1 / 6)), Y_OFFSET));
        this.btnDevelopPolicy.setPosition(cc.p(0, 0));
        this.statusLayout.addChild(this.btnDevelopPolicy, 1);

        var countryDetailLayout = new cc.Layer();
        countryDetailLayout.setAnchorPoint(new cc.p(0, 0));
        countryDetailLayout.setContentSize(cc.size(cc.winSize.width * (4 / 6), Y_OFFSET));
        countryDetailLayout.attr({ x: cc.winSize.width * (1 / 6), y: 0 });
        this.statusLayout.addChild(countryDetailLayout);
        var fontSize = 20;
        var labelOffsetY = Y_OFFSET / 2;

        this.countryLabel = new cc.LabelTTF("", FONT_FACE_TITLE, fontSize);
        this.countryLabel.setContentSize(cc.size(300, Y_OFFSET));
        this.countryLabel.setPosition(cc.p(20, labelOffsetY));
        this.countryLabel.setColor(COLOR_ICE);
        this.countryLabel.setAnchorPoint(new cc.p(0, 0.5));
        this.countryLabel.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        countryDetailLayout.addChild(this.countryLabel);

        var lossLabel = new cc.LabelTTF("Loss", FONT_FACE_TITLE, fontSize);
        lossLabel.setContentSize(cc.size(50, Y_OFFSET));
        lossLabel.setPosition(cc.p(280, labelOffsetY));
        lossLabel.setColor(COLOR_ICE);
        lossLabel.setAnchorPoint(new cc.p(0, 0.5));
        lossLabel.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        countryDetailLayout.addChild(lossLabel);

        this.countryLoss = new cc.LabelTTF("0%", FONT_FACE_TITLE, fontSize);
        this.countryLoss.setContentSize(cc.size(20, Y_OFFSET));
        this.countryLoss.setPosition(cc.p(334, labelOffsetY));
        this.countryLoss.setColor(COLOR_DESTRUCTION_POINTS);
        this.countryLoss.setAnchorPoint(new cc.p(0, 0.5));
        this.countryLoss.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.countryLoss.setHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        countryDetailLayout.addChild(this.countryLoss);

        this.countryLossProgressBase = new ccui.LoadingBar(res.progress_bar, 100);
        this.countryLossProgressBase.setContentSize(cc.size(100, 10));
        this.countryLossProgressBase.setPosition(cc.p(380, Y_OFFSET / 2));
        this.countryLossProgressBase.setAnchorPoint(new cc.p(0, 0.5));
        this.countryLossProgress = new ccui.LoadingBar(res.progress_bar, 0);
        this.countryLossProgress.setColor(COLOR_DESTRUCTION_POINTS);
        this.countryLossProgress.setContentSize(cc.size(100, 10));
        this.countryLossProgress.setPosition(cc.p(380, Y_OFFSET / 2));
        this.countryLossProgress.setAnchorPoint(new cc.p(0, 0.5));
        countryDetailLayout.addChild(this.countryLossProgressBase, 100);
        countryDetailLayout.addChild(this.countryLossProgress, 101);

        var preparednessLabel = new cc.LabelTTF("Prepared", FONT_FACE_TITLE, fontSize);
        preparednessLabel.setContentSize(cc.size(100, Y_OFFSET));
        preparednessLabel.setPosition(cc.p(570, labelOffsetY));
        preparednessLabel.setColor(COLOR_ICE);
        preparednessLabel.setAnchorPoint(new cc.p(0, 0.5));
        preparednessLabel.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        countryDetailLayout.addChild(preparednessLabel);

        this.countryAwarePrepared = new cc.LabelTTF("0%", FONT_FACE_TITLE, fontSize);
        this.countryAwarePrepared.setHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        this.countryAwarePrepared.setContentSize(cc.size(20, Y_OFFSET));
        this.countryAwarePrepared.setPosition(cc.p(664, labelOffsetY));
        this.countryAwarePrepared.setColor(COLOR_POLICY_POINTS);
        this.countryAwarePrepared.setAnchorPoint(new cc.p(0, 0.5));
        this.countryAwarePrepared.setVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.countryAwarePrepared.setHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        countryDetailLayout.addChild(this.countryAwarePrepared);

        this.countryPreparedProgressBase = new ccui.LoadingBar(res.progress_bar, 100);
        this.countryPreparedProgressBase.setContentSize(cc.size(100, 10));
        this.countryPreparedProgressBase.setPosition(cc.p(710, Y_OFFSET / 2));
        this.countryPreparedProgressBase.setAnchorPoint(new cc.p(0, 0.5));
        this.countryPreparedProgress = new ccui.LoadingBar(res.progress_bar, 0);
        this.countryPreparedProgress.setColor(COLOR_POLICY_POINTS);
        this.countryPreparedProgress.setContentSize(cc.size(100, 10));
        this.countryPreparedProgress.setPosition(cc.p(710, Y_OFFSET / 2));
        this.countryPreparedProgress.setAnchorPoint(new cc.p(0, 0.5));
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
        this.btnStats.setAnchorPoint(new cc.p(1.0, 0));
        this.btnStats.setPosition(cc.p(cc.winSize.width, 0));
        this.statusLayout.addChild(this.btnStats);

        handleMouseTouchEvent(this.btnDevelopPolicy, function () {

            gameParams.state = GAME_STATES.PAUSED;
            layer = new DesignPolicyLayer(world);
            world.parent.addChild(layer);
            world.setVisible(false);
            gameParams.modal = true;
        });

        handleMouseTouchEvent(this.btnStats, function () {

            gameParams.state = GAME_STATES.PAUSED;
            layer = new StatsLayer(world);
            world.parent.addChild(layer);
            world.setVisible(false);
            gameParams.modal = true;
        });

        this.addEmitter = function () {

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
            var x = cc.winSize.width * 0.25 + Math.random() * cc.winSize.width * 0.5;
            var y = cc.winSize.height * 0.25 + Math.random() * cc.winSize.height * 0.5;

            world._emitter.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
            world._emitter.setPosVar(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));

            var sourcePos = world._emitter.getSourcePosition();
            /*
            if (sourcePos.x === 0 && sourcePos.y === 0) {
                 world._emitter.x = cc.winSize.width / 2;
                world._emitter.y = cc.winSize.height / 2 - 50;
             }
            */
        };

        return true;
    },

    onEnter: function onEnter() {

        this._super();

        var size = cc.winSize;
        var mappedTiles = {};

        var oldLayers = [];
        var lastLayerID = -1;

        var processResourceSelection = function processResourceSelection(target) {

            var res = Math.floor(1 + Math.random() * 3);

            gameParams.resources += res;
            target.removeFromParent();

            if (!gameParams.resourcesAdded) {

                gameParams.state = GAME_STATES.PAUSED;
                gameParams.resourcesAdded = true;

                if (gameParams.tutorialMode) {

                    showMessageBoxOK(world, "HINT:", TUTORIAL_MESSAGES.FIRST_RESOURCE_CLICKED.message, "OK!", function () {
                        gameParams.tutorialHints.push(TUTORIAL_MESSAGES.FIRST_RESOURCE_CLICKED.message);
                        gameParams.state = GAME_STATES.STARTED;
                    });
                } else {

                    gameParams.state = GAME_STATES.STARTED;
                }
            }
        };

        var processCrisisSelection = function processCrisisSelection(target) {

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

                gameParams.state = GAME_STATES.PAUSED;
                gameParams.alertCrisis = true;

                showMessageBoxOK(world, "Congratulations!", "You have averted the " + crisis.name + "!", "OK!", function () {

                    gameParams.state = GAME_STATES.STARTED;
                });
            }
        };

        /**
         * Update month / year in the interface
         * @param {*} world 
         */
        var refreshDate = function refreshDate(world) {

            // world.dayLabel.setString(gameParams.currentDate.getDate());
            world.monthLabel.setString((gameParams.currentDate.getMonth() + 1).toString());
            world.yearLabel.setString(gameParams.currentDate.getFullYear().toString());
        };

        /**
         * Show country-level stats.
         */
        var printCountryStats = function printCountryStats() {

            var country = world.countries[gameParams.currentCountry];
            world.countryLabel.setString(country.name);

            var lossPercent = Math.floor(country.loss);
            var preparedPercent = Math.floor(country.pop_prepared_percent);

            world.countryLoss.setString(lossPercent + "%");
            world.countryLossProgress.setPercent(lossPercent);
            world.countryAwarePrepared.setString(preparedPercent + "%");
            world.countryPreparedProgress.setPercent(preparedPercent);
        };

        /**
         * Show world-level stats.
         */
        var printWorldStats = function printWorldStats() {

            world.countryLabel.setString("World");

            var lossPercent = Math.round(gameParams.totalLoss);
            var preparedPercent = Math.round(gameParams.populationPreparedPercent);

            world.countryLoss.setString(lossPercent + "%");
            world.countryAwarePrepared.setString(preparedPercent + "%");

            world.countryLossProgress.setPercent(lossPercent);
            world.countryPreparedProgress.setPercent(preparedPercent);
        };

        world.generateResourceDistribution = function () {

            var dists = [];
            var total = 0;

            for (var i = 0; i < 16; i++) {

                var weight = 1;
                if (gameParams.policies[i + 1] !== undefined) weight += gameParams.policies[i + 1];

                total += weight;
                dists.push(weight);
            }

            var counter = 0;

            for (var _i = 0; _i < dists.length; _i++) {

                dists[_i] /= total;
            }

            return dists;
        };

        var doSim = function doSim() {

            if (gameParams.startCountry === null || gameParams.state !== GAME_STATES.PREPARED) return;

            var buttons = [];

            var country = world.countries[gameParams.startCountry];
            country.policy = 1.0;
            country.affected_chance = 1.0;

            // Shuffle from https://gist.github.com/guilhermepontes/17ae0cc71fa2b13ea8c20c94c5c35dc4
            var shuffleArray = function shuffleArray(a) {
                return a.sort(function () {
                    return Math.random() - 0.5;
                });
            };

            startGameParams();
            refreshDate(world);

            var generateWeightedPolicyIndex = function generateWeightedPolicyIndex(r) {

                var dists = world.generateResourceDistribution();
                var counter = 0;
                var chosenPolicy = 0;

                for (var i = 0; i < dists.length; i++) {

                    var prob = dists[i];
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
            var generatePolicyIcon = function generatePolicyIcon() {

                var policyIndex = generateWeightedPolicyIndex(Math.random());
                var icon = "";

                switch (policyIndex) {
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
            var addResource = function addResource() {

                var btnRes = new ccui.Button();
                btnRes.setTouchEnabled(true);
                btnRes.setSwallowTouches(false);
                btnRes.setScale9Enabled(true);

                var policyIcon = generatePolicyIcon();
                btnRes.loadTextures(policyIcon, "", "");

                var ind = Math.floor(Math.random() * Object.keys(world.countries).length);
                var countryRand = world.countries[Object.keys(world.countries)[ind]];
                var pt = countryRand.centroid;
                btnRes.attr({ x: pt.x, y: size.height - 2 * Y_OFFSET - pt.y + RESOURCE_SIZE_H / 2 });
                btnRes.setContentSize(cc.size(RESOURCE_SIZE_W, RESOURCE_SIZE_H));
                // btnRes.setColor(COLOR_RESOURCE);
                btnRes.placedAt = gameParams.counter;
                world.worldBackground.addChild(btnRes, 101);

                buttons.push(btnRes);

                handleMouseTouchEvent(btnRes, processResourceSelection);

                if (gameParams.automateMode) {

                    var r = Math.random();
                    if (r < parseFloat(gameParams.automateScript.resourcesProb)) {

                        fireClickOnTarget(btnRes);
                    }
                }

                if (!gameParams.alertResources) {

                    if (gameParams.tutorialMode) {

                        gameParams.state = GAME_STATES.PAUSED;
                        gameParams.alertResources = true;
                        showMessageBoxOK(world, "HINT:", TUTORIAL_MESSAGES.FIRST_RESOURCE_SHOWN.message, "OK!", function (that) {

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
            world.crisisProbDistribution = function () {

                var probs = [];
                var crisisKeys = Object.keys(CRISES);
                var countryKeys = Object.keys(world.countries);
                var denom = 0;

                crisisKeys.forEach(function (ck) {

                    var crisis = CRISES[ck];

                    countryKeys.forEach(function (yk) {

                        var country = world.countries[yk];
                        var lossProp = country.loss / gameParams.totalLoss;
                        var preparedProp = country.pop_prepared_percent / gameParams.populationPreparedPercent;

                        var totalInfluence = 1.0;
                        totalInfluence += lossProp * crisis.influence_of_environmental_loss;
                        totalInfluence += preparedProp * crisis.influence_of_preparedness;

                        if (isNaN(totalInfluence)) totalInfluence = 0.0;

                        if (totalInfluence > 0) {

                            denom += totalInfluence;
                            probs.push(totalInfluence);
                        }
                    });
                });

                for (var i = 0; i < probs.length; i++) {

                    probs[i] /= denom;
                }

                return probs;
            };

            world.crisisProbLocation = function (r) {

                var probs = world.crisisProbDistribution();
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

            /**
             * Add a new crisis.
             */
            var addCrisis = function addCrisis() {

                var r2 = Math.random();
                var crisisInCountry = world.crisisProbLocation(r2);
                gameParams.crisisCountry = crisisInCountry;
                gameParams.crises.push(crisisInCountry);
                gameParams.crisisCount++;
                var crisis = CRISES[crisisInCountry.crisis];
                var country = world.countries[crisisInCountry.country];

                var btnCrisis = new ccui.Button();
                btnCrisis.setTouchEnabled(true);
                btnCrisis.setSwallowTouches(false);
                btnCrisis.setScale9Enabled(true);
                btnCrisis.loadTextures(crisis.image, "", "");
                var pt = country.centroid;
                console.log(country.name, pt.y);
                btnCrisis.attr({ x: pt.x, y: size.height - 2 * Y_OFFSET - pt.y + RESOURCE_SIZE_H / 2 });
                btnCrisis.setContentSize(cc.size(RESOURCE_SIZE_W, RESOURCE_SIZE_H));
                // btnCrisis.setColor(COLOR_DESTRUCTION_POINTS);
                btnCrisis.placedAt = gameParams.counter;
                btnCrisis.crisisId = crisisInCountry.id;
                btnCrisis.name = "crisis" + crisisInCountry.id;

                handleMouseTouchEvent(btnCrisis, processCrisisSelection);

                world.worldBackground.addChild(btnCrisis, 101);

                // After the third crisis, add notifications to the news feed
                var message = "A " + crisis.name + " is taking place in " + country.name + ".";
                // btnCrisis.setTitleColor(COLOR_LICORICE);
                // btnCrisis.setTitleText(crisis.name);

                if (gameParams.crisisCount < 4) {

                    gameParams.state = GAME_STATES.PAUSED;
                    message += " Crises are unexpected events due to environmental loss. Click on the crisis icon to slow the loss and increase the preparedness of the country to minimise the risk of further crises.";

                    var _buttons = showMessageBoxOK(world, "Crisis alert!", message, "OK!", function (that) {

                        gameParams.state = GAME_STATES.STARTED;
                    });

                    if (gameParams.automateMode) {

                        fireClickOnTarget(_buttons[0]);
                    }
                } else {

                    // if (gameParams.messageOverride == null)
                    //     gameParams.messageOverride = message;

                }

                gameParams.lastCrisis = gameParams.counter;
            };

            /**
             * Add tutorial.
             */
            var addTutorial = function addTutorial() {

                if (gameParams.tutorialHints.length < 2 || gameParams.tutorialHints.length >= 6) return;

                gameParams.state = GAME_STATES.PAUSED;
                var message = null;
                switch (gameParams.tutorialHints.length) {
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

                showMessageBoxOK(world, "HINT:", message, "OK", function () {

                    gameParams.tutorialHints.push(message);
                    gameParams.state = GAME_STATES.STARTED;
                });
            };

            world.sigmoidalPercent = function (percent, inflectionPoint) {

                if (inflectionPoint === undefined) inflectionPoint = 50;

                // Some value between -1.0 and 1.0
                var normedPercent = (percent - inflectionPoint) / inflectionPoint;
                var normedPercentWithFactor = normedPercent * 1.0;
                // Some value between e (2.78...) and 1 / e (0.367) 
                var sigmoidalPercent = 1 / Math.pow(Math.E, normedPercentWithFactor);

                return sigmoidalPercent;
            };

            // Evaluates loss
            world.evaluateLoss = function (country) {

                var lossCurrent = country.loss;

                // Add random amount to default rate of loss
                var rateOfLoss = gameParams.rateOfLoss * (0.5 + Math.random());
                var rateOfLossMonthly = rateOfLoss;
                var rateOfLossFactor = 1 + rateOfLossMonthly;

                // Weaken rate of loss by population prepared for good policy
                var preparednessFactor = 1 + 0.1 * country.pop_prepared_percent / 100.0;
                rateOfLossFactor /= preparednessFactor;

                //let crisis = CRISES[gameParams.crises[0].crisis];
                gameParams.crises.forEach(function (crisisInCountry) {

                    var crisis = CRISES[crisisInCountry.crisis];
                    // Add effects of country / global loss ratio to crisis effect
                    // Take the square root of the ratio of country to world loss, and multiply this by the crisis effect
                    rateOfLossFactor *= 1 + crisis.effect_on_environmental_loss * Math.pow(lossCurrent / gameParams.totalLoss, 0.5);
                });

                var sigmoidalLossFactor = 1 + (rateOfLossFactor - 1) * world.sigmoidalPercent(lossCurrent);
                var lossNew = lossCurrent + (sigmoidalLossFactor - 1);

                if (lossNew > 100) lossNew = 100;
                if (lossNew < 0) lossNew = 0;

                return lossNew;
            };

            /**
             * Transmit policy effects from a country
             * @param {*} Calculates transmission of policies from 
             */
            var transmitFrom = function transmitFrom(country) {

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
                var seaProb = (1 - sharedBorder) * transmissionSea * likelihoodOfTransmission * popFactor * (1 - incomeVal);
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
                } else if (Math.random() < seaProb) {

                    var countriesShuffled = shuffleArray(Object.keys(world.countries));
                    var countryChance = Math.random();

                    for (var i = 0; i < countriesShuffled.length; i++) {

                        var countryCheck = world.countries[countriesShuffled[i]];

                        if (countryChance < 1 - countryCheck.shared_border_percentage && countryCheck.policy == 0) {

                            candidateCountry = countryCheck;
                            break;
                        }
                    }
                } else if (Math.random() < airProb) {
                    var _countriesShuffled = shuffleArray(Object.keys(world.countries));
                    var _countryChance = Math.random();

                    for (var _i2 = 0; _i2 < _countriesShuffled.length; _i2++) {

                        var _countryCheck = world.countries[_countriesShuffled[_i2]];
                        var incomeCheck = _countryCheck.income_grp;
                        var incomeValCheck = parseFloat(incomeCheck.charAt(0)) / 6.0; // 5 income groups + 1, so there are no zeroes

                        if (_countryChance < 1 - incomeValCheck && _countryCheck.policy == 0) {

                            candidateCountry = _countryCheck;
                            break;
                        }
                    }
                }
                if (candidateCountry != null) {

                    candidateCountry.affected_chance = 0.1;

                    if (country.affected_chance < 1.0) country.affected_chance *= 0.1;

                    candidateCountry.policy = 1.0;
                    candidateCountry.pop_aware = parseInt(candidateCountry.pop_est) * infectivityMinimumIncrease;
                }
            };

            var infectWithin = function infectWithin(country) {

                if (country.affected_chance == 0) return;

                if (country.pop_aware >= parseInt(country.pop_est)) return;

                // Calculate infectivity
                var infectivityIncreaseSpeed = world.scenarioData.threat_details.advanced_stats.infectivity_increase_speed;
                var infectivityMinimumIncrease = world.scenarioData.threat_details.advanced_stats.minimum_infectivity_increase;

                var infectivityRate = infectivityIncreaseSpeed;

                Object.keys(gameParams.policies).forEach(function (strategy) {
                    var level = gameParams.policies[strategy];
                    switch (strategy.id) {
                        case 1:
                            // Increase infectivity when reducing inequality for low income countries
                            infectivityRate *= Math.log(1 + country.income_grp_num);
                            break;
                        case 2:
                            // Increase infectivity with free trade countries for high income countries
                            infectivityRate *= Math.log((5 + 1 - country.income_grp_num) * 1.1);
                            break;
                        case 3:
                            // Increase infectivity with regulations for high income countries
                            infectivityRate *= Math.log((5 + 1 - country.income_grp_num) * 1.1);
                            break;
                        case 4:
                            // Increase infectivity with automation for high income countries
                            infectivityRate *= Math.log((5 + 1 - country.income_grp_num) * 1.1);
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
                            infectivityRate *= Math.log((5 + 1 - country.income_grp_num) * 1.1);
                            break;
                        case 8:
                            // Increase infectivity when boosting democracy for low income countries
                            infectivityRate *= Math.log(2 + country.income_grp_num);
                            break;
                        case 9:
                            // Increase infectivity when boosting democracy for low income countries
                            infectivityRate *= Math.log(2 + country.income_grp_num);
                            break;
                        case 10:
                            // Increase infectivity with social media for high income countries
                            infectivityRate *= Math.log((5 + 2 - country.income_grp_num) * 0.8);
                            break;
                        case 11:
                            // Increase infectivity with celebrity endorsements for high income countries
                            infectivityRate *= Math.log(1 + country.income_grp_num);
                            break;
                        case 12:
                            // Increase infectivity with festivals for high income countries
                            infectivityRate *= Math.log(1 + country.income_grp_num);
                            break;
                        case 13:
                            // Increase infectivity with green cities for high income countries
                            infectivityRate *= Math.log((5 + 1 - country.income_grp_num) * 1.1);
                            break;
                        case 14:
                            infectivityRate *= Math.log(1 + country.income_grp_num);
                            break;
                        case 15:
                            infectivityRate *= Math.log((5 + 1 - country.income_grp_num) * 1.1);
                            break;
                        case 16:
                            infectivityRate *= Math.log(1 + country.income_grp_num);
                            break;

                    };
                });

                if (infectivityRate - 1 < infectivityMinimumIncrease) infectivityRate = 1 + infectivityMinimumIncrease;
                country.pop_aware = (1 + country.pop_aware) * infectivityRate;
                if (country.pop_aware > country.pop_est) country.pop_aware = country.pop_est;
            };

            world.calculatePolicyBalanceOnPreparedness = function () {

                var strategyCount = Object.values(gameParams.policies).reduce(function (accum, level) {
                    return accum + level;
                }, 0);
                if (strategyCount == 0) return 1.0;

                var domainMean = strategyCount / 4;
                var ecn = 0,
                    pol = 0,
                    cul = 0,
                    eco = 0;
                Object.keys(gameParams.policies).forEach(function (policyID) {
                    var policy = gameParams.policyOptions[policyID];
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
                var policyBalance = 1 - Math.pow(variances / Math.pow(strategyCount, 2), 4);

                return policyBalance;
            };

            world.calculateSinglePolicyImpactOnPreparedness = function (country, index) {

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

                    severityEffect *= 1 + policy.effect_on_pop_low * levelMultiplier;
                } else if (pop < 100000000) {

                    severityEffect *= 1 + policy.effect_on_pop_medium * levelMultiplier;
                } else {

                    severityEffect *= 1 + policy.effect_on_pop_high * levelMultiplier;
                }

                // Check income
                switch (country.income_grp_num) {
                    case 1:
                    case 2:
                        severityEffect *= 1 + policy.effect_on_income_high * levelMultiplier;
                        break;
                    case 3:
                        severityEffect *= 1 + policy.effect_on_income_medium_high * levelMultiplier;
                        break;
                    case 4:
                        severityEffect *= 1 + policy.effect_on_income_low_medium * levelMultiplier;
                        break;
                    case 5:
                        severityEffect *= 1 + policy.effect_on_income_low * levelMultiplier;
                        break;
                }

                // Check climate zone
                var latitude = parseFloat(country.equator_dist);
                // https://content.meteoblue.com/en/meteoscool/general-climate-zones
                if (latitude > -23.5 && latitude < 23.5) {

                    severityEffect *= 1 + policy.effect_on_geo_tropic * levelMultiplier;
                } else if (latitude > -40 && latitude < 40) {

                    severityEffect *= 1 + policy.effect_on_geo_subtropic * levelMultiplier;
                } else if (latitude > -60 && latitude < 60) {

                    severityEffect *= 1 + policy.effect_on_geo_temperate * levelMultiplier;
                } else {

                    severityEffect *= 1 + policy.effect_on_geo_polar * levelMultiplier;
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

                    if (typeof relation !== "undefined") {

                        severityEffect *= 1 + relation * otherLevelMultiplier;
                    }
                }

                return severityEffect;
            };

            world.calculatePolicyImpactOnPreparedness = function (country) {

                var severityEffect = 1.0;

                for (var i = 0; i < Object.keys(gameParams.policies).length; i++) {

                    severityEffect *= world.calculateSinglePolicyImpactOnPreparedness(country, i);
                }

                // Add sigmoidal effect
                var sigmoidalInfluence = world.sigmoidalPercent(country.pop_prepared_percent, 5) + 0.5;

                return severityEffect * sigmoidalInfluence;
            };

            world.registerPreparednessWithin = function (country) {

                if (country.affected_chance == 0) return;

                // const popAware = country.pop_aware;
                var popAware = country.pop_est;
                var popPrepared = country.pop_prepared;

                // Calculate severity
                var severityIncreaseSpeed = world.scenarioData.threat_details.advanced_stats.severity_increase_speed;
                var severityMinimumIncrease = world.scenarioData.threat_details.advanced_stats.minimum_severity_increase;
                var policyBalance = world.calculatePolicyBalanceOnPreparedness();
                var policyImpact = world.calculatePolicyImpactOnPreparedness(country);
                var policyEffect = policyBalance * policyImpact * severityIncreaseSpeed;
                var policyEffectNormalised = 1 + (policyEffect - 1) / MONTH_INTERVAL;

                if (severityIncreaseSpeed < severityMinimumIncrease) {

                    severityIncreaseSpeed = severityMinimumIncrease;
                }

                if (popPrepared == 0) {

                    // 1 person
                    popPrepared = 1; //popAware * 0.01;
                } else {

                    popPrepared *= policyEffectNormalised;
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
            var updateTime = function updateTime() {

                if (gameParams.state !== GAME_STATES.STARTED) {

                    // Refresh the timeout
                    gameParams.timeoutID = setTimeout(updateTime, 20);
                    return;
                }

                gameParams.counter++;

                // Handle automation here
                if (gameParams.automateMode) {
                    var _loop2 = function _loop2(i) {

                        var pe = gameParams.automateScript.policyEvents[i];

                        if (gameParams.counter == pe.counter / MONTH_INTERVAL) {

                            fireClickOnTarget(world.btnDevelopPolicy, function () {

                                var resNames = Object.values(RESOURCES).map(function (res) {
                                    return res.name;
                                });
                                var resGrp = Math.floor((pe.policyID - 1) / resNames.length);
                                var element = world.designPolicyLayer.getChildByName(resNames[resGrp]);

                                fireClickOnTarget(element, function () {
                                    var btn = world.designPolicyLayer.policyButtons[pe.policyID - 1];

                                    fireClickOnTarget(btn, function () {

                                        fireClickOnTarget(world.designPolicyLayer.investButton, function () {

                                            fireClickOnTarget(world.designPolicyLayer.btnExit);
                                        });
                                    });
                                });
                            });
                            return "break";
                        }
                    };

                    // Select resources
                    for (var i = 0; i < gameParams.automateScript.policyEvents.length; i++) {
                        var _ret2 = _loop2(i);

                        if (_ret2 === "break") break;
                    };

                    // Select crisis
                    for (var i = 0; i < gameParams.crises.length; i++) {

                        var crisisInCountry = gameParams.crises[i];

                        if (gameParams.counter == crisisInCountry.counter + gameParams.automateScript.crisisDuration) {

                            var target = world.worldBackground.getChildByName("crisis" + crisisInCountry.id);
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
                        var message = "";
                        var showDialog = false;

                        // Sort narratives by loss for comparison
                        var narratives = Object.values(NARRATIVES.n2048).sort(function (o1, o2) {
                            return o2.loss - o1.loss;
                        });

                        switch (currentYear) {
                            case 2048:
                                showDialog = true;

                                for (var _i3 = 0; _i3 < narratives.length; _i3++) {

                                    var n = narratives[_i3];

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

                            gameParams.state = GAME_STATES.PAUSED;
                            var _buttons2 = showMessageBoxOK(world, "Antarctic Bulletin, year " + currentYear, message, "OK", function () {
                                gameParams.state = GAME_STATES.STARTED;
                            });

                            if (gameParams.automateMode) {

                                fireClickOnTarget(_buttons2[0]);
                            }
                        }
                    }

                    gameParams.previousDate = gameParams.currentDate;

                    // Add policy robustness and loss
                    var totalPolicy = 0,
                        totalLoss = 0;
                    var countriedAffected = 0,
                        populationAware = 0,
                        populationPrepared = 0;

                    Object.keys(world.countries).forEach(function (key) {

                        var country = world.countries[key];
                        var loss = world.evaluateLoss(country);

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
                            var existingConvincedPercentage = country.pop_prepared_percent;
                            country.pop_prepared_percent = 100 * country.pop_prepared / country.pop_est;

                            var imin = existingConvincedPercentage > 0.5 ? parseInt(existingConvincedPercentage) : 0;
                            var imax = country.pop_prepared_percent > 0.5 ? parseInt(country.pop_prepared_percent) : 0;
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
                    } else {

                        printWorldStats();
                    }
                }

                // Various events
                var ci = gameParams.crisisInterval;
                Object.keys(gameParams.policies).forEach(function (policyID) {

                    var policy = gameParams.policyOptions[policyID];
                    var policyLevel = gameParams.policies[policyID];
                    ci /= 1 + policy.effect_on_crises * Math.log(policyLevel + 1.718);
                });

                // Check enough time has elapsed to generate a new resource with some probability (1 / RESOURCE_CHANCE)
                if (gameParams.counter - gameParams.lastCrisis >= ci && Math.random() < CRISIS_CHANCE) {

                    addCrisis();
                }

                var ri = gameParams.resourceInterval;
                gameParams.crises.forEach(function (crisisInCountry) {

                    var crisis = CRISES[crisisInCountry.crisis];
                    var country = world.countries[crisisInCountry.country];
                    ri /= 1 + crisis.effect_on_resources;
                });

                Object.keys(gameParams.policies).forEach(function (policyID) {

                    var policy = gameParams.policyOptions[policyID];
                    var policyLevel = gameParams.policies[policyID];
                    ri /= 1 + policy.effect_on_resources * Math.log(policyLevel + 1.718);
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
                var newButtons = [];
                for (var _i4 = 0; _i4 < buttons.length; _i4++) {

                    var button = buttons[_i4];
                    if (gameParams.counter > button.placedAt + RESOURCE_DURATION) button.removeFromParent();else newButtons.push(button);
                }
                buttons = newButtons;

                // Update labels
                world.resourceScoreLabel.setString(gameParams.resources);
                refreshDate(world);

                // Scroll text
                if (world.tweetLabel.x < -300 || gameParams.messageOverride != null) {

                    var _message = gameParams.scenarioName,
                        messageIndex = -1;
                    world.tweetLabel.color = COLOR_ICE;

                    if (gameParams.messageOverride != null) {

                        _message = gameParams.messageOverride;
                        gameParams.messageOverride = null;
                        world.tweetAlertLabel.setVisible(true);
                    }
                    // Change label
                    else if (gameParams.totalLoss > 0 || gameParams.populationPreparedPercent > 0) {

                            var weight = gameParams.totalLoss / (gameParams.totalLoss + gameParams.populationPreparedPercent);
                            if (Math.random() < weight) {

                                messageIndex = Math.floor(Math.random() * gameParams.messagesNegative.length);
                                _message = gameParams.messagesNegative[messageIndex];
                            } else {

                                messageIndex = Math.floor(Math.random() * gameParams.messagesPositive.length);
                                _message = gameParams.messagesPositive[messageIndex];
                            }

                            world.tweetAlertLabel.setVisible(false);
                        }

                    world.tweetLabel.setString(_message);
                    world.tweetLabel.setPositionX(world.tweetBackground.width * 1.2);
                    world.tweetAlertLabel.setPositionX(world.tweetLabel.x - 100);
                } else {

                    var adjustSpeed = Math.round(20 / gameParams.timeInterval);
                    world.tweetLabel.setPositionX(world.tweetLabel.x - adjustSpeed);
                    world.tweetAlertLabel.setPositionX(world.tweetLabel.x - 100);
                }

                // Game over                        
                if (gameParams.totalLoss >= 100) {

                    // Sort narratives by loss for comparison
                    var _narratives = Object.values(NARRATIVES.n2070).sort(function (o1, o2) {
                        return o2.loss - o1.loss;
                    });
                    var _n = _narratives[0];
                    var _index = Math.floor(Math.random() * _n.messages.length);
                    var _message2 = _n.messages[_index];
                    gameOver(world, _message2, "OK");
                }
                // else if (gameParams.currentDate.getFullYear() >= YEAR_TARGET) {
                else if (gameParams.currentDate >= gameParams.targetDate) {

                        var _message3 = "";
                        // Sort narratives by loss for comparison
                        var _narratives2 = Object.values(NARRATIVES.n2070).sort(function (o1, o2) {
                            return o2.loss - o1.loss;
                        });

                        for (var _i5 = 0; _i5 < _narratives2.length; _i5++) {

                            var _n2 = _narratives2[_i5];
                            if (gameParams.totalLoss > _n2.loss) {

                                var _index2 = Math.floor(Math.random() * _n2.messages.length);
                                _message3 = _n2.messages[_index2];
                                break;
                            }
                        }

                        gameOver(world, _message3, "OK");
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

        var selectCountry = function selectCountry(event, location) {

            if (gameParams.state !== GAME_STATES.PREPARED && gameParams.state !== GAME_STATES.STARTED && gameParams.state !== GAME_STATES.PAUSED) return;

            var target = event.getCurrentTarget();
            var locationInNode = target.convertToNodeSpace(location);
            var x = 0,
                y = 0;

            var layer = target.getLayer("Tile Layer 1");
            gid = layer.getTileGIDAt(x, y);

            if (typeof layer._texGrids !== "undefined" && typeof layer._texGrids[gid] === "undefined") return;

            var start = 0,
                end = world.sortedObjs.length;
            if (lastLayerID > -1) {

                start = start < 0 ? 0 : start;
                end = end > world.sortedObjs.length ? world.sortedObjs.length : end;
            };

            var ed = function ed(pt1, pt2) {
                return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
            };

            var minED = -1,
                selectedCountry = null;
            for (var j = start; j < end; j++) {

                var poly = world.sortedObjs[j];
                var mousePoint = new cc.p(locationInNode.x, size.height - locationInNode.y - 2 * Y_OFFSET);
                var cd = world.collisionDetection(poly.points, mousePoint);

                if (cd) {

                    lastLayerID = j;
                    var countryObj = world.countries[poly.name];
                    var ced = ed(countryObj.centroid, mousePoint);
                    if (minED === -1 || ced < minED) {

                        minED = ced;
                        selectedCountry = poly.name;
                        selectedCountry.selected = true;
                        break;
                    }
                }
            }

            // Pick the match with the closest centroid ID
            var currentLayer = null;
            if (selectedCountry != null) {

                if (gameParams.currentCountry != null) world.countries[gameParams.currentCountry].selected = false;
                gameParams.currentCountry = selectedCountry;

                if (gameParams.currentCountry != null) world.countries[gameParams.currentCountry].selected = true;
                currentCountry = selectedCountry;

                printCountryStats();
            } else {

                if (gameParams.currentCountry != null) world.countries[gameParams.currentCountry].selected = false;
                gameParams.currentCountry = null;

                printWorldStats();
            }

            return true;
        };

        cc.eventManager.addListener({

            event: cc.EventListener.MOUSE,

            onMouseMove: function onMouseMove(event) {

                if (gameParams.modal) return false;

                selectCountry(event, event.getLocation());
            },

            onMouseUp: function onMouseUp(event) {

                if (gameParams.modal) return false;

                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());

                gameParams.statsCountry = gameParams.currentCountry;
            }

        }, this.map);

        cc.eventManager.addListener({

            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function onTouchBegan(touch, event) {

                if (gameParams.modal) return false;

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
            onTouchEnded: function onTouchEnded(touch, event) {

                if (gameParams.modal) return false;

                var target = event.getCurrentTarget();
                if (target.TOUCHED) {

                    target.TOUCHED = false;
                    selectCountry(event, touch.getLocation());
                }

                return true;
            }
        }, this.map);

        var beginSim = function beginSim() {

            gameParams.state = GAME_STATES.PREPARED;

            world.btnPause.setBright(true);
            world.btnPlay.setBright(false);
            world.btnFF.setBright(true);

            doSim();

            // Add particle emitter
            // world.addEmitter();
        };

        var nestedButtons = null;
        var keys = Object.keys(world.countries);

        var antCountries = ["NZL", "AUS", "ZAF", "ARG", "CHL"];
        var startCountry = antCountries[Math.floor(Math.random() * antCountries.length)];
        var buttons = showMessageBoxOK(world, world.scenarioData.popup_1_title, world.scenarioData.popup_1_description, "Start Tutorial", function (that) {

            gameParams.tutorialMode = true;
            gameParams.startCountry = startCountry;
            // gameParams.startCountry = keys[Math.floor(Math.random() * keys.length)]
            gameParams.statsCountry = startCountry;
            gameParams.currentCountry = startCountry;
            var countryName = world.countries[gameParams.startCountry].name;
            nestedButtons = showMessageBoxOK(world, "Prepare the world...", "In 2019, your global policy mission begins in " + countryName + ". You have until 2070 to save the Antarctic continent. Invest in policies that will reduce the effects of climate change, arrest environmental loss and increase the preparedness of each country.", world.scenarioData.popup_2_title, function (that) {

                beginSim();
            });
        }, "Skip Tutorial", function (that) {

            gameParams.tutorialMode = false;
            gameParams.startCountry = startCountry;
            // gameParams.startCountry = keys[Math.floor(Math.random() * keys.length)]
            gameParams.statsCountry = startCountry;
            gameParams.currentCountry = startCountry;
            var countryName = world.countries[gameParams.startCountry].name;

            nestedButtons = showMessageBoxOK(world, "Prepare the world...", "In 2019, your global policy mission begins in " + countryName + ". You have until 2070 to save the Antarctic continent. Invest in policies that will reduce the effects of climate change, arrest environemntal loss and increase the preparedness of each country.", world.scenarioData.popup_2_title, function (that) {

                beginSim();
            });
        });

        if (gameParams.automateMode) {

            fireClickOnTarget(buttons[1], function () {

                fireClickOnTarget(nestedButtons[0], function () {

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

var WorldScene = cc.Scene.extend({

    ctor: function ctor(automateID) {
        this._super();

        if (typeof automateID !== "undefined") this.automateID = automateID;else this.automateID = -1;
    },

    onEnter: function onEnter() {
        this._super();

        var scene = this;

        // Add country data 
        cc.loader.loadJson("res/scenario-nature.json", function (error, scenarioData) {

            // Add script data 
            cc.loader.loadJson("res/automate.json", function (error, data) {

                automateScripts = data;

                var layer = new WorldLayer(scenarioData, scene.automateID);
                scene.addChild(layer);
            });
        });
    }
});

var LoadingScene = cc.Scene.extend({

    onEnter: function onEnter() {
        this._super();

        var layer = this;
        var size = cc.winSize;

        var layout = new ccui.Layout();
        layout.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        layout.setBackGroundColor(COLOR_LICORICE);
        layout.setContentSize(cc.size(size.width, size.height));
        var layoutSize = layout.getContentSize();
        layout.setLayoutType(ccui.Layout.RELATIVE);
        layout.attr({ x: size.width / 2 - layoutSize.width / 2, y: size.height / 2 - layoutSize.height / 2 });
        layer.addChild(layout, 1);

        layout.setTouchEnabled(true);
        layout.setSwallowTouches(true);

        var antarcticaSprite = new cc.Sprite(res.antarctica_large_png);
        antarcticaSprite.setAnchorPoint(new cc.p(0.5, 0.5));
        antarcticaSprite.setContentSize(cc.size(100, 101));
        antarcticaSprite.setScale(1.5);
        antarcticaSprite.setPosition(cc.p(size.width / 2, 7 * size.height / 8));
        layer.addChild(antarcticaSprite, 101);

        var margin = new ccui.Margin(0, 0, 0, 0);
        var lp0 = new ccui.RelativeLayoutParameter();
        lp0.setMargin(margin);
        lp0.setAlign(ccui.RelativeLayoutParameter.PARENT_TOP_CENTER_HORIZONTAL);
        var lblWelcome = new ccui.Text("Welcome to Antarctic Futures!", FONT_FACE_BODY, 36);
        lblWelcome.color = COLOR_FOREGROUND;
        lblWelcome.setAnchorPoint(new cc.p(0.5, 0.5));
        lblWelcome.setPosition(cc.p(size.width / 2, 5 * size.height / 8));
        layer.addChild(lblWelcome, 101);

        var lblAbout = new ccui.Text("This game is developed as part of a research project, 'Antarctic Cities and the Global Commons'. As part of our research, we collect your IP address, as well as anonymous data during the game. To learn more, click the 'Learn More' button below.", FONT_FACE_BODY, 20);
        lblAbout.setAnchorPoint(cc.p(0.0, 1.0));
        lblAbout.ignoreContentAdaptWithSize(false);
        lblAbout.setPosition(cc.p(1 * size.width / 8, 4 * size.height / 8));
        lblAbout.setContentSize(cc.size(6 * size.width / 8, 1 * size.height / 8));
        layer.addChild(lblAbout, 101);

        var btnPlay = new ccui.Button();
        btnPlay.setContentSize(cc.size(320, 80));
        btnPlay.setSwallowTouches(false);
        btnPlay.setPressedActionEnabled(true);
        btnPlay.setScale9Enabled(true);
        btnPlay.loadTextures(res.button_white, res.button_grey, res.button_grey);
        btnPlay.setTitleText("PLAY");
        btnPlay.setTitleFontName(FONT_FACE_BODY);
        btnPlay.setTitleColor(COLOR_BLACK);
        btnPlay.setTitleFontSize(38);
        btnPlay.setAnchorPoint(cc.p(0.5, 0.5));
        btnPlay.setPosition(cc.p(3 * size.width / 8, 1 * size.height / 8));
        if (cc.sys.localStorage.content === "true") {

            btnPlay.setTouchEnabled(true);
            btnPlay.setBright(true);
            btnPlay.setEnabled(true);
        } else {
            btnPlay.setTouchEnabled(false);
            btnPlay.setBright(false);
            btnPlay.setEnabled(false);
        }
        layer.addChild(btnPlay, 101);

        var btnLearnMore = new ccui.Button();
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
        btnLearnMore.setAnchorPoint(cc.p(0.5, 0.5));
        btnLearnMore.setPosition(cc.p(5 * size.width / 8, 1 * size.height / 8));
        layer.addChild(btnLearnMore, 101);

        var selectedStateEvent = function selectedStateEvent(sender, type) {
            switch (type) {
                case ccui.CheckBox.EVENT_UNSELECTED:
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
        };

        var chbAgree = new ccui.CheckBox();
        chbAgree.setColor(COLOR_WHITE);
        chbAgree.setTouchEnabled(true);
        chbAgree.setSwallowTouches(false);
        chbAgree.loadTextures("res/ccs-res/cocosui/check_box_normal.png", "res/ccs-res/cocosui/check_box_normal_press.png", "res/ccs-res/cocosui/check_box_active.png", "res/ccs-res/cocosui/check_box_normal_disable.png", "res/ccs-res/cocosui/check_box_active_disable.png");
        chbAgree.setAnchorPoint(cc.p(0.0, 1.0));
        chbAgree.setPosition(cc.p(1 * size.width / 8, 3 * size.height / 8));
        chbAgree.setSelected(cc.sys.localStorage.content === "true");
        chbAgree.addEventListener(selectedStateEvent, this);

        var lblAgreeTerms = new ccui.Text("I agree to participate in this research project, and understand my gameplay data will be recorded anonymously.", FONT_FACE_BODY, 20);
        lblAgreeTerms.ignoreContentAdaptWithSize(false);
        lblAgreeTerms.setPosition(cc.p(40 + 1 * size.width / 8, 3 * size.height / 8));
        lblAgreeTerms.setAnchorPoint(cc.p(0.0, 1.0));
        lblAgreeTerms.setContentSize(cc.size(6 * size.width / 8, size.height / 8));
        layer.addChild(chbAgree, 101);
        layer.addChild(lblAgreeTerms, 101);

        var lblVersion = new ccui.Text(VERSION_ANTARCTIC_FUTURES, FONT_FACE_BODY, 14);
        lblVersion.setAnchorPoint(cc.p(1.0, 0.0));
        lblVersion.setColor(COLOR_POLICY_POINTS);
        lblVersion.ignoreContentAdaptWithSize(false);
        lblVersion.setPosition(cc.p(size.width, 10));
        lblVersion.setContentSize(cc.size(100, 20));
        layer.addChild(lblVersion, 101);

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

        var automateHandler1 = function automateHandler1() {
            cc.director.runScene(new WorldScene(1));
        };
        var automateHandler2 = function automateHandler2() {
            cc.director.runScene(new WorldScene(2));
        };
        var automateHandler3 = function automateHandler3() {
            cc.director.runScene(new WorldScene(3));
        };
        var automateHandler4 = function automateHandler4() {
            cc.director.runScene(new WorldScene(4));
        };
        var automateHandler5 = function automateHandler5() {
            cc.director.runScene(new WorldScene(5));
        };
        var playHandler = function playHandler() {

            if (cc.sys.localStorage.content === "true") {

                // if (cc.sys.os != cc.sys.OS_IOS) {
                var el = document.getElementById('gameCanvas');
                cc.screen.requestFullScreen(el).catch(function (err) {
                    //alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
                // } 

                cc.director.runScene(new WorldScene());
                // cc.director.runScene(new cc.TransitionMoveInR(1, new NewGameScene()));
            }
        };
        var learnMoreHandler = function learnMoreHandler() {
            cc.sys.openURL("https://antarctic-cities.org/the-game/");
        };

        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function onKeyPressed(keyCode, event) {},
                onKeyReleased: function onKeyReleased(keyCode, event) {

                    var automateID = parseInt(cc.sys.isNative ? that.getNativeKeyName(keyCode) : String.fromCharCode(keyCode));
                    if (!isNaN(automateID) && automateID > 0 && automateID < 7) {

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
    onEnter: function onEnter() {
        this._super();

        var layer = this;
        var size = cc.winSize;

        var layerBackground = new cc.LayerColor(COLOR_BACKGROUND, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        layer.addChild(layerBackground, 1);

        var newLabel = new cc.LabelTTF("New Game", FONT_FACE_BODY, 38);
        newLabel.attr({ x: size.width * 0.5, y: size.height * 0.8 });
        this.addChild(newLabel);

        var loadLabel = new cc.LabelTTF("Load Game", FONT_FACE_BODY, 38);
        loadLabel.attr({ x: size.width * 0.5, y: size.height * 0.4 });
        this.addChild(loadLabel);

        var listener1 = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp: function onMouseUp(event) {

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
            onMouseUp: function onMouseUp(event) {

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
    onEnter: function onEnter() {
        this._super();

        var size = cc.winSize;

        var newLabel = new cc.LabelTTF("Select a Challenge", FONT_FACE_BODY, 38);
        newLabel.attr({ x: size.width * 0.5, y: size.height * 0.4 });
        this.addChild(newLabel);

        var waterLabel = new cc.LabelTTF("Water Challenge", FONT_FACE_BODY, 38);
        waterLabel.attr({ x: size.width * 0.5, y: size.height * 0.4 });
        this.addChild(waterLabel);

        var listener = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseUp: function onMouseUp(event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(event.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {

                    cc.log(target);
                    cc.director.runScene(new cc.TransitionMoveInR(1, new SelectDifficultyScene()));
                    return true;
                }

                return false;
            }

        });

        cc.eventManager.addListener(listener, waterLabel);
    }

});

var SelectDifficultyScene = cc.Scene.extend({
    onEnter: function onEnter() {
        this._super();

        var layer = this;
        var size = cc.winSize;

        var layerBackground = new cc.LayerColor(COLOR_BACKGROUND, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        layer.addChild(layerBackground, 1);

        var newLabel = new cc.LabelTTF("Select a game difficulty", FONT_FACE_BODY, 38);
        newLabel.attr({ x: size.width * 0.5, y: size.height * 0.8 });
        this.addChild(newLabel);

        var casualLabel = new cc.LabelTTF("Casual", FONT_FACE_BODY, 38);
        casualLabel.attr({ x: size.width * 0.25, y: size.height * 0.5 });
        this.addChild(casualLabel);

        var normalLabel = new cc.LabelTTF("Normal", FONT_FACE_BODY, 38);
        normalLabel.attr({ x: size.width * 0.5, y: size.height * 0.5 });
        this.addChild(normalLabel);

        var brutalLabel = new cc.LabelTTF("Brutal", FONT_FACE_BODY, 38);
        brutalLabel.attr({ x: size.width * 0.75, y: size.height * 0.5 });
        this.addChild(brutalLabel);

        var listener = cc.EventListener.create({

            event: cc.EventListener.MOUSE,
            onMouseUp: function onMouseUp(event) {

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

        cc.eventManager.addListener(listener.clone(), casualLabel);
        cc.eventManager.addListener(listener.clone(), normalLabel);
        cc.eventManager.addListener(listener.clone(), brutalLabel);
    }

});

var EnterNameScene = cc.Scene.extend({

    onEnter: function onEnter() {

        this._super();

        var size = cc.winSize;

        var newLabel = new cc.LabelTTF("Enter a name for your policy", FONT_FACE_BODY, 38);
        newLabel.attr({ x: size.width * 0.5, y: size.height * 0.8 });
        this.addChild(newLabel);

        var enterNameLabel = new cc.LabelTTF("Just click for now", FONT_FACE_BODY, 38);
        enterNameLabel.attr({ x: size.width * 0.5, y: size.height * 0.5 });
        this.addChild(enterNameLabel);

        var listener = cc.EventListener.create({

            event: cc.EventListener.MOUSE,
            onMouseUp: function onMouseUp(event) {

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

        cc.eventManager.addListener(listener.clone(), enterNameLabel);
    }

});

var ModifyCodeScene = cc.Scene.extend({

    onEnter: function onEnter() {
        this._super();

        var size = cc.winSize;

        var newLabel = new cc.LabelTTF("Modify Code", FONT_FACE_BODY, 38);
        newLabel.attr({ x: size.width * 0.5, y: size.height * 0.8 });
        this.addChild(newLabel);

        var modifyCodeLabel = new cc.LabelTTF("Just click for now", FONT_FACE_BODY, 38);
        newLabel.attr({ x: size.width * 0.5, y: size.height * 0.5 });
        this.addChild(modifyCodeLabel);

        var listener1 = cc.EventListener.create({

            event: cc.EventListener.MOUSE,
            onMouseUp: function onMouseUp(event) {

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

    ctor: function ctor(world) {

        this._super();
        this.world = world;
        world.designPolicyLayer = this;
    },
    onEnter: function onEnter() {

        this._super();

        var layer = this;
        var size = cc.winSize;
        var policySelected = null;
        var policySelectedButton = null;

        // For automation
        layer.policyButtons = [];

        var layerBackground = new cc.LayerColor(COLOR_BLACK, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        layer.addChild(layerBackground, 1);

        var heading = new ccui.Text("Build a policy platform", FONT_FACE_BODY, 38);
        heading.attr({ x: size.width * 0.5, y: size.height * 0.9 });
        heading.setColor(COLOR_ICE);
        layer.addChild(heading, 101);

        var btnExit = new ccui.Button();
        btnExit.setTouchEnabled(true);
        btnExit.setSwallowTouches(false);
        btnExit.setPosition(cc.p(size.width * 0.9, size.height * 0.9));
        btnExit.setColor(COLOR_ICE);
        btnExit.setTitleFontSize(72);
        btnExit.setTitleText("X");

        handleMouseTouchEvent(btnExit, function () {

            world.setVisible(true);
            layer.removeFromParent();
            gameParams.state = GAME_STATES.STARTED;
            gameParams.modal = false;
        });

        layer.btnExit = btnExit;
        layer.addChild(btnExit, 102);

        var policyDetailsBackground = new cc.LayerColor(COLOR_BLACK, 400, 400);
        policyDetailsBackground.setAnchorPoint(cc.p(0, 0));
        policyDetailsBackground.setPosition(cc.p(800, 200));
        layer.addChild(policyDetailsBackground, 110);

        var policyLabel = new ccui.Text("", FONT_FACE_TITLE, 30);
        policyLabel.setColor(COLOR_ICE);
        policyLabel.setAnchorPoint(cc.p(0, 0));
        policyLabel.setPosition(cc.p(20, 310));
        policyDetailsBackground.addChild(policyLabel);

        var policyGeneralLabel = "<<< Select one of these policies to invest in it!";
        var policyDescription = new ccui.Text("", FONT_FACE_BODY, 24);
        policyDescription.ignoreContentAdaptWithSize(false);
        policyDescription.setAnchorPoint(cc.p(0, 0));
        policyDescription.setContentSize(cc.size(360, 170));
        policyDescription.setPosition(cc.p(20, 120));
        policyDescription.setColor(COLOR_ICE);
        policyDescription.setString(policyGeneralLabel);
        policyDetailsBackground.addChild(policyDescription, 2);

        var policyCostLabel = new ccui.Text("", FONT_FACE_BODY, 30);
        policyCostLabel.setColor(COLOR_ICE);
        policyCostLabel.setAnchorPoint(cc.p(0, 0));
        policyCostLabel.setPosition(cc.p(20, 80));
        policyDetailsBackground.addChild(policyCostLabel);

        var btnPolicyInvest = new ccui.Button(res.button_white, "", res.button_grey);
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

        var costCalculation = function costCalculation(policySelected) {

            var policyLevel = gameParams.policies[policySelected.id];
            var cost = policySelected.cost_1;

            if (policyLevel !== undefined) {

                switch (policyLevel) {
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

            var dists = world.generateResourceDistribution();
            var policyCategory = Math.floor((policySelected.id - 1) / 4);
            var weights = [];

            for (var i = 0; i < dists.length; i++) {

                if (i % 4 == 0) {

                    weights.push(dists[i] * 4);
                } else {

                    var wi = Math.floor(i / 4);
                    weights[wi] += dists[i] * 4;
                }
            }

            if (weights[policyCategory] > 1) cost *= weights[policyCategory];

            cost = Math.round(cost);

            return cost;
        };

        handleMouseTouchEvent(btnPolicyInvest, function () {

            var cost = costCalculation(policySelected);

            if (gameParams.resources - cost >= 0 && gameParams.policies[policySelected.id] === undefined) {

                gameParams.resources -= cost;
                gameParams.policies[policySelected.id] = 1;
                policySelectedButton.enabled = false;
                layer.resourceScoreLabel.setString(gameParams.resources.toString());
                levelButtons[policySelected.id * 100 + 1].texture = res.policy_dot_on_png;
                layer.policyButtons[policySelected.id - 1].enabled = false;
            } else if (gameParams.resources - cost >= 0 && gameParams.policies[policySelected.id] === 1) {

                gameParams.resources -= cost;
                gameParams.policies[policySelected.id] = 2;
                policySelectedButton.enabled = false;
                layer.resourceScoreLabel.setString(gameParams.resources.toString());
                levelButtons[policySelected.id * 100 + 2].texture = res.policy_dot_on_png;
                layer.policyButtons[policySelected.id - 1].enabled = false;
            } else if (gameParams.resources - cost >= 0 && gameParams.policies[policySelected.id] == 2) {

                gameParams.resources -= cost;
                gameParams.policies[policySelected.id] = 3;
                policySelectedButton.enabled = false;
                layer.resourceScoreLabel.setString(gameParams.resources.toString());
                levelButtons[policySelected.id * 100 + 3].texture = res.policy_dot_on_png;
                layer.policyButtons[policySelected.id - 1].enabled = false;
            }

            var newCost = costCalculation(policySelected);
            policyCostLabel.setString("Cost: " + newCost.toString());

            if (gameParams.policies[policySelected.id] == 3) {

                btnPolicyInvest.setBright(false);
                btnPolicyInvest.setEnabled(false);
                btnPolicyInvest.setTitleText("Policy completed!");
            } else if (cost < gameParams.resources) {

                btnPolicyInvest.setBright(true);
                btnPolicyInvest.setEnabled(true);
                btnPolicyInvest.setTitleText("Invest in this policy");
            } else {

                btnPolicyInvest.setBright(false);
                btnPolicyInvest.setEnabled(false);
                btnPolicyInvest.setTitleText("You need more resources!");
            }
        });

        policyDetailsBackground.addChild(btnPolicyInvest, 100);

        var pageView = new ccui.PageView();
        pageView.setContentSize(cc.size(size.width, size.height - Y_OFFSET));
        pageView.setAnchorPoint(cc.p(0, 0));
        pageView.setPosition(cc.p(X_OFFSET, Y_OFFSET));
        var pageCount = 4;
        var levelButtons = {};

        var _loop3 = function _loop3(i) {

            var layout = new ccui.Layout();
            layout.setContentSize(cc.size(layout.getContentSize().width * 0.5, layout.getContentSize().height * 0.5));

            var resourceGrp = {};
            switch (i) {
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

            var xLoc = 0,
                yLoc = 0,
                policyOptionCounter = 0;

            resourceGrp.policyOptions.forEach(function (opt) {

                xLoc = (1 + policyOptionCounter % 2) * 300 - 52;
                yLoc = (1 - Math.floor(policyOptionCounter / 2)) * 200 + 140;
                policyOptionCounter++;

                var btnLayer = new cc.Layer();
                btnLayer.setAnchorPoint(cc.p(0, 0));
                btnLayer.attr({ x: xLoc, y: yLoc });
                btnLayer.setContentSize(cc.size(200, 200));
                layout.addChild(btnLayer, 101);

                var btn = new ccui.Button();
                btn.setName(opt.text);
                btn.setTouchEnabled(true);
                btn.setSwallowTouches(false);
                btn.setAnchorPoint(cc.p(0, 0));
                btn.setScale9Enabled(true);
                btn.loadTextures(opt.img_normal, "", opt.img_on);
                btn.attr({ x: 52, y: 52 });
                btn.setContentSize(cc.size(104, 104));
                layer.policyButtons.push(btn);

                btn.cost_1 = opt.cost_1;
                btn.cost_2 = opt.cost_2;
                btn.cost_3 = opt.cost_3;
                btnLayer.option = opt;
                btn.option = opt;

                if (gameParams.policies[opt.id] !== undefined) btn.enabled = false;

                btnLayer.addChild(btn, 101);

                var btnLabel = new cc.LabelTTF(opt.text, FONT_FACE_TITLE, 20);
                btnLabel.attr({ x: 78, y: 0 });
                btnLabel.setAnchorPoint(cc.p(0.5, 0.0));
                btnLayer.addChild(btnLabel, 101);

                var btnLvl1 = void 0,
                    btnLvl2 = void 0,
                    btnLvl3 = void 0;

                if (gameParams.policies[opt.id] === undefined) {

                    btnLvl1 = new cc.Sprite(res.policy_dot_off_png);
                    btnLvl2 = new cc.Sprite(res.policy_dot_off_png);
                    btnLvl3 = new cc.Sprite(res.policy_dot_off_png);
                } else if (gameParams.policies[opt.id] === 1) {

                    btnLvl1 = new cc.Sprite(res.policy_dot_on_png);
                    btnLvl2 = new cc.Sprite(res.policy_dot_off_png);
                    btnLvl3 = new cc.Sprite(res.policy_dot_off_png);
                } else if (gameParams.policies[opt.id] === 2) {

                    btnLvl1 = new cc.Sprite(res.policy_dot_on_png);
                    btnLvl2 = new cc.Sprite(res.policy_dot_on_png);
                    btnLvl3 = new cc.Sprite(res.policy_dot_off_png);
                } else if (gameParams.policies[opt.id] === 3) {

                    btnLvl1 = new cc.Sprite(res.policy_dot_on_png);
                    btnLvl2 = new cc.Sprite(res.policy_dot_on_png);
                    btnLvl3 = new cc.Sprite(res.policy_dot_on_png);
                }

                btnLvl1.attr({ x: 0, y: 52 });
                btnLvl1.setAnchorPoint(cc.p(0.0, 0.0));
                btnLvl2.attr({ x: 0, y: btnLvl1.y + 35 });
                btnLvl2.setAnchorPoint(cc.p(0.0, 0.0));
                btnLvl3.attr({ x: 0, y: btnLvl2.y + 35 });
                btnLvl3.setAnchorPoint(cc.p(0.0, 0.0));
                btnLayer.addChild(btnLvl1, 101);
                btnLayer.addChild(btnLvl2, 101);
                btnLayer.addChild(btnLvl3, 101);

                levelButtons[opt.id * 100 + 1] = btnLvl1;
                levelButtons[opt.id * 100 + 2] = btnLvl2;
                levelButtons[opt.id * 100 + 3] = btnLvl3;

                var policySelector = function policySelector(target) {

                    policySelected = target.option;
                    policyLabel.setString(policySelected.text_long);
                    policyDescription.setString(policySelected.description);

                    var cost = costCalculation(policySelected);
                    policyCostLabel.setString("Cost: " + cost.toString());

                    if (gameParams.policies[opt.id] == 3) {

                        btnPolicyInvest.setBright(false);
                        btnPolicyInvest.setEnabled(false);
                        btnPolicyInvest.setTitleText("Policy completed!");
                    } else if (cost < gameParams.resources) {

                        btnPolicyInvest.setBright(true);
                        btnPolicyInvest.setEnabled(true);
                        btnPolicyInvest.setTitleText("Invest in this policy");
                    } else {

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
        };

        for (var i = 0; i < pageCount; ++i) {
            _loop3(i);
        }

        layer.addChild(pageView, 100);
        pageView.setCurrentPageIndex(0);

        // Add buttons to jump to specific page
        var prevButton = null;
        var makeButton = function makeButton(text, point, index) {

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

            handleMouseTouchEvent(btn, function () {

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

        Object.values(RESOURCES).forEach(function (res, index) {

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

    ctor: function ctor(world) {

        this._super();
        this.world = world;
    },

    onEnter: function onEnter() {

        this._super();

        var layer = this;
        var size = cc.winSize;

        var layerBackground = new cc.LayerColor(COLOR_BACKGROUND, size.width, size.height);
        layerBackground.attr({ x: 0, y: 0 });
        layer.addChild(layerBackground, 1);

        var heading = new ccui.Text("Track how the world is doing", FONT_FACE_BODY, 38);
        heading.attr({ x: size.width * 0.5, y: size.height * 0.9 });
        heading.setColor(COLOR_ICE);
        layer.addChild(heading, 101);

        var pageView = new ccui.PageView();
        pageView.setContentSize(cc.size(size.width, size.height - 80));
        pageView.setAnchorPoint(cc.p(0, 0));
        pageView.setPosition(cc.p(0, 0));

        var layoutWorld = new ccui.Layout();
        layoutWorld.setContentSize(size.width * 0.5, size.height * 0.5);

        var layoutCountries = new ccui.Layout();
        layoutCountries.setContentSize(size.width * 0.5, size.height * 0.5);

        var layoutTime = new ccui.Layout();
        layoutTime.setContentSize(size.width * 0.5, size.height * 0.5);

        layerBackground.addChild(layoutWorld, 100);
        layerBackground.addChild(layoutCountries, 100);
        layerBackground.addChild(layoutTime, 100);
        layoutWorld.setVisible(true);
        layoutCountries.setVisible(false);
        layoutTime.setVisible(false);

        // add buttons to jump to specific page
        var prevButton = null;

        var makeButton = function makeButton(text, point, index) {

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

            handleMouseTouchEvent(btn, function () {
                //pageView.setCurrentPageIndex(index);
                switch (index) {
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

        var makeString = function makeString(num) {
            return (Math.round(num * 10) / 10).toString() + '%';
        };

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

        this.destructionDescriptionLabel = new cc.LabelTTF("Since " + gameParams.startDate.getFullYear() + ", the global environment has declined by " + makeString(gameParams.totalLoss) + ".", FONT_FACE_BODY, 20);
        this.destructionDescriptionLabel.setAnchorPoint(cc.p(0, 0));
        this.destructionDescriptionLabel.setPosition(cc.p(size.width * 0.2, size.height * 0.5));
        layoutWorld.addChild(this.destructionDescriptionLabel, 100);

        this.policyLabel = new cc.LabelTTF("Preparedness " + makeString(gameParams.populationPreparedPercent) + " / " + Math.round(gameParams.populationPrepared / 1000000) + "M", FONT_FACE_TITLE, 30);
        this.policyLabel.setAnchorPoint(cc.p(0, 0));
        this.policyLabel.setPosition(cc.p(size.width * 0.2, size.height * 0.35));
        layoutWorld.addChild(this.policyLabel, 100);

        this.policyDescriptionLabel = new cc.LabelTTF("Thanks to your policy platform, " + makeString(gameParams.populationPreparedPercent) + " of the world is now more ready to take action against climate change.", FONT_FACE_BODY, 20);
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
        var countriesSorted = Object.values(world.countries).sort(function (a, b) {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        var CustomTableViewCell = cc.TableViewCell.extend({
            draw: function draw(ctx) {
                this._super(ctx);
            }
        });

        var TableViewCountriesLayer = cc.Layer.extend({

            ctor: function ctor() {
                this._super();
                this.init();
            },

            init: function init() {
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

            scrollViewDidScroll: function scrollViewDidScroll(view) {},
            scrollViewDidZoom: function scrollViewDidZoom(view) {},

            tableCellTouched: function tableCellTouched(table, cell) {
                cc.log("cell touched at index: " + cell.getIdx());
            },

            tableCellSizeForIndex: function tableCellSizeForIndex(table, idx) {

                return cc.size(size.width * 0.5, 30);
            },

            tableCellAtIndex: function tableCellAtIndex(table, idx) {

                var country = countriesSorted[idx];
                var color = country.loss > 20 ? COLOR_DESTRUCTION_POINTS : country.pop_prepared_percent > 20 ? COLOR_POLICY_POINTS : COLOR_ICE;
                var cell = table.dequeueCell();
                var labelCountry = void 0,
                    labelLoss = void 0,
                    labelPreparedness = void 0;

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

            numberOfCellsInTableView: function numberOfCellsInTableView(table) {

                return Object.keys(world.countries).length;
            }

        });

        var countriesTable = new TableViewCountriesLayer();
        layoutCountries.addChild(countriesTable);

        // Add graph
        var graphX = size.width * 0.25;
        var graphEndX = graphX + size.width * 0.5;
        var graphY = 200;
        var graphEndY = graphY + size.height * 0.5;
        var years = gameParams.targetDate.getFullYear() - gameParams.startDate.getFullYear();
        var graphIncrementX = size.width * 0.5 / years;
        var graphIncrementY = size.height * 0.5 / 100;
        var graphOffset = 40;
        var lblStartYear = cc.LabelTTF.create(gameParams.startDate.getFullYear(), FONT_FACE_BODY, 24);
        var lblEndYear = cc.LabelTTF.create(gameParams.targetDate.getFullYear(), FONT_FACE_BODY, 24);
        lblStartYear.attr({ x: graphX, y: graphY });
        lblEndYear.attr({ x: graphEndX, y: graphY });
        lblStartYear.setAnchorPoint(cc.p(0, 0));
        lblEndYear.setAnchorPoint(cc.p(0, 0));
        layoutTime.addChild(lblStartYear);
        layoutTime.addChild(lblEndYear);

        var drawNode = new cc.DrawNode();
        drawNode.setOpacity(255);

        var x_o = void 0,
            yP_o = void 0,
            yL_o = void 0,
            x = void 0,
            yP = void 0,
            yL = void 0;
        var colorD = new cc.Color(COLOR_DESTRUCTION_POINTS.r, COLOR_DESTRUCTION_POINTS.g, COLOR_DESTRUCTION_POINTS.b, 255);
        var colorP = new cc.Color(COLOR_POLICY_POINTS.r, COLOR_POLICY_POINTS.g, COLOR_POLICY_POINTS.b, 255);

        var lineOffset = -10;
        drawNode.drawSegment(cc.p(0, graphOffset + lineOffset), cc.p(size.width * 0.5, graphOffset + lineOffset), 2, COLOR_ICE);
        drawNode.drawSegment(cc.p(0, graphOffset + lineOffset), cc.p(0, graphOffset + size.height * 0.5), 2, COLOR_ICE);

        for (var i = gameParams.startDate.getFullYear(); i < gameParams.targetDate.getFullYear(); i++) {

            var index = i - gameParams.startDate.getFullYear();

            var stats = gameParams.stats[i];
            if (stats === undefined) continue;

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
        lblDestructionScore.attr({ x: 4 + graphX + x, y: graphY + yL });
        lblPolicyScore.attr({ x: 4 + graphX + x, y: graphY + yP });
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

        handleMouseTouchEvent(btnExit, function () {

            world.setVisible(true);
            layer.removeFromParent();
            gameParams.state = GAME_STATES.STARTED;
            gameParams.modal = false;
        });

        layerBackground.addChild(btnExit, 102);
    }

});