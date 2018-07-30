// Colours
COLOR_LICORICE = new cc.Color(42, 54, 68, 255); // Dark Grey
COLOR_ZINC = new cc.Color(123, 133, 143, 255); // Medium Grey
COLOR_ICE = new cc.Color(214, 225, 227, 255); // Light Grey
COLOR_OAK = new cc.Color(243, 226, 206, 255); // Beige
COLOR_UMBER = new cc.Color(154, 136, 124, 255); // Brown
COLOR_BLACK = new cc.Color(0, 0, 0, 255); // Black
COLOR_WHITE = new cc.Color(255, 255, 255, 255); // White


// ANTARCTIC CITIES THEME
COLOR_BACKGROUND = COLOR_LICORICE; 
COLOR_FOREGROUND = COLOR_ICE; 
COLOR_HIGHLIGHT = COLOR_OAK; 
COLOR_RESOURCE = new cc.Color(0, 255, 0, 100); // Green, with transparency; COLOR_UMBER; 
COLOR_POLICY_POINTS = new cc.Color(0, 255, 0, 100); // Green, with transparency
COLOR_DESTRUCTION_POINTS = new cc.Color(255, 0, 0, 100); // Red, with transparency
COLOR_BACKGROUND_TRANS = new cc.Color(42, 54, 68, 160); // Black, with transparency

// RESOURCES
RESOURCES = {
    economic: {
        labelText: "Design your Economic Policy",
        policyOptions: [ {
            id: 1,
            text: "Reduce Inequality", 
            location: {x: 200, y: 100},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_1_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_1_ON.png",
            cost: 3
        },
        {
            id: 2,
            text: "Free Trade Agreements", 
            location: {x: 200, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_2_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_2_ON.png",
            cost: 3
        },
        {
            id: 3,
            text: "Remove Regulations", 
            location: {x: 600, y: 100},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_3_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_3_ON.png",
            cost: 3
        },
        {
            id: 4, 
            text: "Automate Industry", 
            location: {x: 600, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_4_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECONOMY_4_ON.png",
            cost: 3
        } ]
    },
    politics: {        
        labelText: "Design your Political Policy",
        policyOptions: [ {
            id: 5,
            text: "Global Treaties", 
            location: {x: 200, y: 100},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_1_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_1_ON.png",
            cost: 3
        },
        {
            id: 6,
            text: "Diplomacy", 
            location: {x: 200, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_2_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_2_ON.png",
            cost: 3
        },
        {
            id: 7,
            text: "Boost Military", 
            location: {x: 600, y: 100},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_3_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_3_ON.png",
            cost: 3
        },
        {
            id: 8,
            text: "Promote Democracy", 
            location: {x: 600, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_4_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_POLITCS_4_ON.png",
            cost: 3
        } ]
    },
    cultural: {
        labelText: "Design your Cultural Policy",
        policyOptions: [ {
            id: 9,
            text: "Global Education", 
            location: {x: 200, y: 100},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_1_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_1_ON.png",
            cost: 3
        },
        {
            id: 10,
            text: "Social Media", 
            location: {x: 200, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_2_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_2_ON.png",
            cost: 3
        },
        {
            id: 11,
            text: "Celebrity Endorsements", 
            location: {x: 600, y: 100},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_3_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_3_ON.png",
            cost: 3
        },
        {
            id: 12,
            text: "Global Festivals", 
            location: {x: 600, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_4_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_CULTURE_4_ON.png",
            cost: 3
        } ]
    },
    ecology: {
        labelText: "Design your Ecological Policy",
        policyOptions: [ {
            id: 13,
            text: "Green Cities", 
            location: {x: 200, y: 100},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_1_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_1_ON.png",
            cost: 3
        },
        {
            id: 14,
            text: "Fund Renewable Energy", 
            location: {x: 200, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_2_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_2_ON.png",
            cost: 3
        },
        {
            id: 15,
            text: "Global Heritage Trust", 
            location: {x: 600, y: 100},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_3_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_3_ON.png",
            cost: 3
        },
        {
            id: 16,
            text: "Public Transport", 
            location: {x: 600, y: 500},
            img_normal: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_4_NORMAL.png",
            img_on: "res/andrea_png/POLICY_ICONS/POLICY_ECOLOGY_4_ON.png",
            cost: 3
        } ]
    }
};
