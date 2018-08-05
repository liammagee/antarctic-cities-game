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
        policyOptions: [ {
            id: 1,
            domain: 1,
            text: "Reduce Inequality", 
            text_long: "Reduce Inequality", 
            description: "Increase taxation on corporations and high-net worth individuals to increase incomes for the poor.",
            location: {x: 300, y: 200},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_1_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_1_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        },
        {
            id: 2,
            domain: 1,
            text: "Free Trade Agreements", 
            text_long: "Free Trade Agreements", 
            description: "Free Trade Agreements reduced tariffs on goods being bought and sold between countries. May not benefit low income countries...",
            location: {x: 300, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_2_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_2_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        },
        {
            id: 3,
            domain: 1,
            text: "Remove Regulations", 
            text_long: "Remove Regulations", 
            description: "",
            location: {x: 600, y: 200},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_3_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_3_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        },
        {
            id: 4, 
            domain: 1,
            text: "Automate Industry", 
            text_long: "Automate Industry", 
            description: "",
            location: {x: 600, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_4_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_4_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        } ]
    },
    politics: {        
        labelText: "Design your Political Policy",
        policyOptions: [ {
            id: 5,
            domain: 2,
            text: "Global Treaties", 
            text_long: "Global Treaties", 
            description: "",
            location: {x: 300, y: 200},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_1_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_1_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        },
        {
            id: 6,
            domain: 2,
            text: "Diplomacy", 
            text_long: "Diplomacy", 
            description: "",
            location: {x: 300, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_2_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_2_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        },
        {
            id: 7,
            domain: 2,
            text: "Boost Military", 
            text_long: "Boost Military", 
            description: "",
            location: {x: 600, y: 200},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_3_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_3_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        },
        {
            id: 8,
            domain: 2,
            text: "Promote Democracy", 
            text_long: "Promote Democracy", 
            description: "",
            location: {x: 600, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_4_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_4_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        } ]
    },
    cultural: {
        labelText: "Design your Cultural Policy",
        policyOptions: [ {
            id: 9,
            domain: 3,
            text: "Global Education", 
            text_long: "Global Education", 
            description: "",
            location: {x: 300, y: 200},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_1_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_1_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        },
        {
            id: 10,
            domain: 3,
            text: "Social Media", 
            text_long: "Social Media", 
            description: "",
            location: {x: 300, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_2_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_2_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        },
        {
            id: 11,
            domain: 3,
            text: "Celebrity Endorsements", 
            text_long: "Celebrity Endorsements", 
            description: "",
            location: {x: 600, y: 200},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_3_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_3_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        },
        {
            id: 12,
            domain: 3,
            text: "Global Festivals", 
            text_long: "Global Festivals", 
            description: "",
            location: {x: 600, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_4_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_4_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        } ]
    },
    ecology: {
        labelText: "Design your Ecological Policy",
        policyOptions: [ {
            id: 13,
            domain: 4,
            text: "Green Cities", 
            text_long: "Green Cities", 
            description: "",
            location: {x: 300, y: 200},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_1_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_1_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        },
        {
            id: 14,
            domain: 4,
            text: "Fund Renewable Energy", 
            text_long: "Fund Renewable Energy", 
            description: "",
            location: {x: 300, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_2_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_2_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        },
        {
            id: 15,
            domain: 4,
            text: "Global Heritage Trust", 
            text_long: "Global Heritage Trust", 
            description: "",
            location: {x: 600, y: 200},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_3_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_3_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        },
        {
            id: 16,
            domain: 4,
            text: "Public Transport", 
            text_long: "Public Transport", 
            description: "",
            location: {x: 600, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_4_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_4_ON.png",
            cost_1: 3,
            cost_2: 3,
            cost_3: 3
        } ]
    }
};
