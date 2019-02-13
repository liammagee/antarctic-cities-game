// Colours
COLOR_LICORICE = new cc.Color(42, 54, 68, 255); // Dark Grey
COLOR_ZINC = new cc.Color(123, 133, 143, 255); // Medium Grey
COLOR_ICE = new cc.Color(214, 225, 227, 255); // Light Grey
COLOR_OAK = new cc.Color(243, 226, 206, 255); // Beige
COLOR_UMBER = new cc.Color(154, 136, 124, 255); // Brown
COLOR_BLACK = new cc.Color(0, 0, 0, 255); // Black
COLOR_WHITE = new cc.Color(255, 255, 255, 255); // White


// ANTARCTIC CITIES THEME
COLOR_BACKGROUND = COLOR_BLACK;
COLOR_FOREGROUND = COLOR_ICE;
COLOR_HIGHLIGHT = COLOR_OAK;
COLOR_RESOURCE = new cc.Color(108, 180, 244, 255); // Green, with transparency; COLOR_UMBER; 
COLOR_POLICY_POINTS = new cc.Color(0, 255, 0, 100); // Green, with transparency
COLOR_DESTRUCTION_POINTS = new cc.Color(255, 0, 0, 100); // Red, with transparency
COLOR_BACKGROUND_TRANS = new cc.Color(42, 54, 68, 200); // Black, with transparency

// RESOURCES
RESOURCES = {
    economic: {
        labelText: "Design your Economic Policy",
        policyOptions: [{
            id: 1,
            domain: 1,
            text: "Free Trade Agreements",
            text_long: "Free Trade Agreements",
            description: "This policy may produce additional resources in lower-income countries.",
            location: { x: 300, y: 500 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_1_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_1_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }, {
            id: 2,
            domain: 1,
            text: "Automate Industry",
            text_long: "Automate Industry",
            description: "This policy reduces the carbon footprint of wealthy nations and it may produce additional resources in middle-income countries.",
            location: { x: 600, y: 500 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_2_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_2_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }, {
            id: 3,
            domain: 1,
            text: "Reduce Inequality",
            text_long: "Reduce Inequality",
            description: "This policy may produce additional resources in lower-income countries.",
            location: { x: 300, y: 200 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_3_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_3_ON.png",
            levels: 3,
            effect_on_resources: 0.1,
            effect_on_crises: -0.1,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0.8,
            effect_on_income_low_medium: -1.5,
            effect_on_income_medium_high: -1.5,
            effect_on_income_high: 0.01,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }, {
            id: 4,
            domain: 1,
            text: "Remove Regulations",
            text_long: "Remove Regulations",
            description: "This policy is highly effective in producing additional resources but may worsen carbon footprint globally.",
            location: { x: 600, y: 200 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_4_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_4_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }]
    },
    politics: {
        labelText: "Design your Political Policy",
        policyOptions: [{
            id: 5,
            domain: 2,
            text: "Diplomacy",
            text_long: "Diplomacy",
            description: "This policy may allow the renegotiations of climate accords with better targets and stricter conditions.",
            location: { x: 300, y: 500 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_1_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_1_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }, {
            id: 6,
            domain: 2,
            text: "Promote Democracy",
            text_long: "Promote Democracy",
            description: "Democratic institutions may improve the effectiveness of cultural policies.",
            location: { x: 600, y: 500 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_2_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_2_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }, {
            id: 7,
            domain: 2,
            text: "Global Treaties",
            text_long: "Global Treaties",
            description: "This policy allows the creation of global alliances in the reduction of greenhouse emissions.",
            location: { x: 300, y: 200 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_3_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_3_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }, {
            id: 8,
            domain: 2,
            text: "Boost Military",
            text_long: "Boost Military",
            description: "This policy may produce additional resources and improve the effectiveness of top-down ecological transitions.",
            location: { x: 600, y: 200 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_4_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_4_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }]
    },
    cultural: {
        labelText: "Design your Cultural Policy",
        policyOptions: [{
            id: 9,
            domain: 3,
            text: "Social Media",
            text_long: "Social Media",
            description: "Through social media, some ecological and political strategies may increase their effectiveness.",
            location: { x: 300, y: 500 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_1_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_1_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }, {
            id: 10,
            domain: 3,
            text: "Global Festivals",
            text_long: "Global Festivals",
            description: "Global festivals generate consensus and may add resources to spend on other cultural strategies.",
            location: { x: 600, y: 500 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_2_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_2_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }, {
            id: 11,
            domain: 3,
            text: "Global Education",
            text_long: "Global Education",
            description: "Education strategies may improve climate change awareness as well as resource production in lower and middle-income countries.",
            location: { x: 300, y: 200 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_3_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_3_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }, {
            id: 12,
            domain: 3,
            text: "Celebrity Endorsements",
            text_long: "Celebrity Endorsements",
            description: "This policy uses film and music stars to raise awareness. Combined with ecological strategies, it may improve their effectiveness.",
            location: { x: 600, y: 200 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_4_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_4_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }]
    },
    ecology: {
        labelText: "Design your Ecological Policy",
        policyOptions: [{
            id: 13,
            domain: 4,
            text: "Fund Renewable Energy",
            text_long: "Fund Renewable Energy",
            description: "This policy is potentially very effective in highly industrialised countries.",
            location: { x: 300, y: 500 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_1_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_1_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }, {
            id: 14,
            domain: 4,
            text: "Public Transport",
            text_long: "Public Transport",
            description: "This policy targets the reduction on greenhouse emissions globally. Particularly effective in urbanised countries.",
            location: { x: 600, y: 500 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_2_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_2_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }, {
            id: 15,
            domain: 4,
            text: "Green Cities",
            text_long: "Green Cities",
            description: "This policy involves the reduction of urban carbon footiprint but does not address inequalities.",
            location: { x: 300, y: 200 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_3_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_3_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }, {
            id: 16,
            domain: 4,
            text: "Global Heritage Trust",
            text_long: "Global Heritage Trust",
            description: "This policy boots the creation of national parks and produces better awareness about endangered species.",
            location: { x: 600, y: 200 },
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_4_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_4_ON.png",
            levels: 3,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_low: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_high: 0,
            effect_on_density: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        }]
    }
};

RESOURCE_MATRIX = [[0], [-0.5, 0], [0, 1, 0], [-0.8, 0, 0, 0], [0, 0, 0, 0, 0], [0.2, 0, 0, 0, 0, 0], [-0.2, 0, 0, 0, 0, 0, 0], [0.5, 0, 0, 0, 0, 0, 0, 0], [0.5, 0, 0, 0, 0, 0, 0, 0, 0], [-0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0], [-0.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

RESOURCE_RELATIONS = [[0], [0, 0], [0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

CRISES = {
    WATER_SHORTAGE: {
        name: "Water shortage",
        image: "res/andrea_png/NEW_ICONS/ICON_CRISIS_WATER_SHORTAGE.png",
        effect_on_climate: 0,
        effect_on_population: 0,
        effect_on_global_gdp: 0,
        effect_on_resources: -3.0,
        effect_on_environmental_loss: 0.3,
        influence_of_environmental_loss: 2.0,
        influence_of_preparedness: -0.2
    },
    FINANCIAL_CRISIS: {
        name: "Financial crisis",
        image: "res/andrea_png/NEW_ICONS/ICON_CRISIS_CRASH.png",
        effect_on_climate: 0,
        effect_on_population: 0,
        effect_on_global_gdp: 0,
        effect_on_resources: -1.0,
        effect_on_environmental_loss: 0.0,
        influence_of_environmental_loss: 0.0,
        influence_of_preparedness: 0.0
    },
    EXTREME_WEATHER_EVENT: {
        name: "Extreme weather event",
        image: "res/andrea_png/NEW_ICONS/ICON_CRISIS_WEATHER.png",
        effect_on_climate: 0,
        effect_on_population: 0,
        effect_on_global_gdp: 0,
        effect_on_resources: -0.2,
        effect_on_environmental_loss: 0.4,
        influence_of_environmental_loss: 0.5,
        influence_of_preparedness: -0.2
    },
    FORCED_DISPLACEMENT: {
        name: "Forced displacement",
        image: "res/andrea_png/NEW_ICONS/ICON_CRISIS_DISPLACEMENT.png",
        effect_on_climate: 0,
        effect_on_population: 0,
        effect_on_global_gdp: 0,
        effect_on_resources: -0.5,
        effect_on_environmental_loss: 0.2,
        influence_of_environmental_loss: 0.4,
        influence_of_preparedness: -0.5
    },
    EPIDEMIC: {
        name: "Epidemic",
        image: "res/andrea_png/NEW_ICONS/ICON_CRISIS_EPIDEMIC.png",
        effect_on_climate: 0,
        effect_on_population: 0,
        effect_on_global_gdp: 0,
        effect_on_resources: -0.7,
        effect_on_environmental_loss: 0.0,
        influence_of_environmental_loss: 0.2,
        influence_of_preparedness: -0.2
    },
    WAR: {
        name: "War",
        image: "res/andrea_png/NEW_ICONS/ICON_CRISIS_WAR.png",
        effect_on_climate: 0,
        effect_on_population: 0,
        effect_on_global_gdp: 0,
        effect_on_resources: -0.8,
        effect_on_environmental_loss: -0.1,
        influence_of_environmental_loss: 0.3,
        influence_of_preparedness: -0.2
    }
};