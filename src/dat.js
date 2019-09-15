
// Debug
const FULLSCREEN = false;

// LANGUAGES
const LANGUAGES = ['eng', 'esp'];

// Version
const VERSION_ANTARCTIC_FUTURES = "Build: 1006";

// Colours
const COLOR_LICORICE = new cc.Color(42, 54, 68, 255); // Dark Grey
const COLOR_ZINC = new cc.Color(123, 133, 143, 255); // Medium Grey
const COLOR_ICE = new cc.Color(214, 225, 227, 255); // Light Grey
const COLOR_OAK = new cc.Color(243, 226, 206, 255); // Beige
const COLOR_UMBER = new cc.Color(154, 136, 124, 255); // Brown
const COLOR_BLACK = new cc.Color(0, 0, 0, 255); // Black
const COLOR_WHITE = new cc.Color(255, 255, 255, 255); // White


// ANTARCTIC CITIES THEME
const COLOR_BACKGROUND = COLOR_BLACK; 
const COLOR_FOREGROUND = COLOR_ICE; 
const COLOR_HIGHLIGHT = COLOR_OAK; 
const COLOR_RESOURCE = new cc.Color(108, 180, 244, 255); // Green, with transparency; COLOR_UMBER; 
const COLOR_POLICY_POINTS = new cc.Color(0, 255, 0, 100); // Green, with transparency
const COLOR_DESTRUCTION_POINTS = new cc.Color(255, 0, 0, 100); // Red, with transparency
const COLOR_BACKGROUND_TRANS = new cc.Color(42, 54, 68, 200); // Black, with transparency

// RESOURCES
const RESOURCES = {
    economic: {
        eng: {
            labelText: "Design your Economic Policy",
            name: "Economy"    
        },
        esp: {
            labelText: "Diseñe su póliza económica",
            name: "Economía"    
        },
        policyOptions: [        
        {
            id: 1,
            domain: 1,
            eng: {
                text: "Free Trade Agreements", 
                text_long: "Free Trade Agreements", 
                description: "This policy may produce additional resources in lower-income countries."
            },
            esp: {
                text: "Acuerdos de libre comercio", 
                text_long: "Acuerdos de libre comercio", 
                description: "Esta política puede producir recursos adicionales en los países de bajos ingresos."
            },
            location: {x: 300, y: 500},
            img_normal: "res/andrea_png/niab/POLICY_ECONOMY_1_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_ECONOMY_1_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0.2,
            effect_on_crises: 0.5,
            effect_on_pop_high: 0,
            effect_on_pop_medium: -0.05,
            effect_on_pop_low: -0.1,
            effect_on_income_low: -0.2,
            effect_on_income_low_medium: -0.15,
            effect_on_income_medium_high: 0.05,
            effect_on_income_high: 0.1,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        },
        {
            id: 2, 
            domain: 1,
            eng: {
                text: "Automate Industry", 
                text_long: "Automate Industry", 
                description: "This policy reduces the carbon footprint of wealthy nations and it may produce additional resources in middle-income countries.",
            },
            esp: {
                text: "Automatizar la industria", 
                text_long: "Automatizar la industria", 
                description: "Esta política reduce la huella de carbono de las naciones ricas y puede producir recursos adicionales en los países de ingresos medios.",
            },
            location: {x: 600, y: 500},
            img_normal: "res/andrea_png/niab/POLICY_ECONOMY_2_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_ECONOMY_2_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0.4,
            effect_on_crises: 0.5,
            effect_on_pop_high: -0.1,
            effect_on_pop_medium: 0,
            effect_on_pop_low: 0.2,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0.1,
            effect_on_income_high: 0.15,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        },
        {
            id: 3,
            domain: 1,
            eng: {
                text: "Reduce Inequality", 
                text_long: "Reduce Inequality", 
                description: "This policy may produce additional resources in lower-income countries."
            },
            esp: {
                text: "Reducir la desigualdad", 
                text_long: "Reducir la desigualdad", 
                description: "Esta política puede producir recursos adicionales en los países de bajos ingresos."
            },
            location: {x: 300, y: 200},
            img_normal: "res/andrea_png/niab/POLICY_ECONOMY_3_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_ECONOMY_3_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0.3,
            effect_on_crises: 0.0,
            effect_on_pop_high: 0.05,
            effect_on_pop_medium: 0,
            effect_on_pop_low: 0,
            effect_on_income_low: 0.15,
            effect_on_income_low_medium: 0.1,
            effect_on_income_medium_high: 0.05,
            effect_on_income_high: 0.01,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        },
        {
            id: 4,
            domain: 1,
            eng: {
                text: "Remove Regulations", 
                text_long: "Remove Regulations", 
                description: "This policy is highly effective in producing additional resources but may worsen carbon footprint globally."    
            },
            esp: {
                text: "Eliminar regulaciones", 
                text_long: "Eliminar regulaciones", 
                description: "Esta política es muy eficaz para producir recursos adicionales, pero puede empeorar la huella de carbono en todo el mundo."    
            },
            location: {x: 600, y: 200},
            img_normal: "res/andrea_png/niab/POLICY_ECONOMY_4_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_ECONOMY_4_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0.2,
            effect_on_crises: 1.0,
            effect_on_pop_high: -0.1,
            effect_on_pop_medium: -0.1,
            effect_on_pop_low: -0.05,
            effect_on_income_low: -0.3,
            effect_on_income_low_medium: -0.15,
            effect_on_income_medium_high: -0.05,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        } ]
    },
    politics: {        
        eng: {
            labelText: "Design your Political Policy",
            name: "Politics"
        },
        esp: {
            labelText: "Diseñe su póliza política",
            name: "Política"
        },
        policyOptions: [ 
        {
            id: 5,
            domain: 2,
            eng: {
                text: "Diplomacy", 
                text_long: "Diplomacy", 
                description: "This policy may allow the renegotiations of climate accords with better targets and stricter conditions."
            },
            esp: {
                text: "Diplomacia", 
                text_long: "Diplomacia", 
                description: "Esta política puede permitir la renegociación de acuerdos climáticos con mejores objetivos y condiciones más estrictas."
            },
            location: {x: 300, y: 500},
            img_normal: "res/andrea_png/niab/POLICY_POLITCS_1_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_POLITCS_1_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0,
            effect_on_crises: -0.5,
            effect_on_pop_high: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_low: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0.1,
            effect_on_income_high: 0.1,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        },
        {
            id: 6,
            domain: 2,
            eng: {
                text: "Promote Democracy", 
                text_long: "Promote Democracy", 
                description: "Democratic institutions may improve the effectiveness of cultural policies."
            },
            esp: {
                text: "Promover la democracia", 
                text_long: "Promover la democracia", 
                description: "Las instituciones democráticas pueden mejorar la eficacia de las políticas culturales."
            },
            location: {x: 600, y: 500},
            img_normal: "res/andrea_png/niab/POLICY_POLITCS_2_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_POLITCS_2_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_high: 0.05,
            effect_on_pop_medium: 0.05,
            effect_on_pop_low: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0.05,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        },
        {
            id: 7,
            domain: 2,
            eng: {
                text: "Global Treaties", 
                text_long: "Global Treaties", 
                description: "This policy allows the creation of global alliances in the reduction of greenhouse emissions."
            },
            esp: {
                text: "Tratados Globales", 
                text_long: "Tratados Globales", 
                description: "Esta política permite la creación de alianzas globales en la reducción de emisiones de gases de efecto invernadero."
            },
            location: {x: 300, y: 200},
            img_normal: "res/andrea_png/niab/POLICY_POLITCS_3_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_POLITCS_3_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0,
            effect_on_crises: 0,
            effect_on_pop_high: 0.05,
            effect_on_pop_medium: 0.05,
            effect_on_pop_low: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0.05,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        },
        {
            id: 8,
            domain: 2,
            eng: {
                text: "Boost Military", 
                text_long: "Boost Military", 
                description: "This policy may produce additional resources and improve the effectiveness of top-down ecological transitions."
            },
            esp: {
                text: "Impulso Militar", 
                text_long: "Impulso Militar", 
                description: "Esta política puede producir recursos adicionales y mejorar la eficacia de las transiciones ecológicas de arriba hacia abajo."
            },
            location: {x: 600, y: 200},
            img_normal: "res/andrea_png/niab/POLICY_POLITCS_4_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_POLITCS_4_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0.1,
            effect_on_crises: 1.0,
            effect_on_pop_high: -0.05,
            effect_on_pop_medium: 0,
            effect_on_pop_low: 0,
            effect_on_income_low: -0.2,
            effect_on_income_low_medium: -0.05,
            effect_on_income_medium_high: 0,
            effect_on_income_high: -0.1,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        } ]
    },
    cultural: {
        eng: {
            labelText: "Design your Cultural Policy",
            name: "Culture"
        },
        esp: {
            labelText: "Diseñe su póliza cultural",
            name: "Cultura"
        },
        policyOptions: [ 
        {
            id: 9,
            domain: 3,
            eng: {
                text: "Social Media", 
                text_long: "Social Media", 
                description: "Through social media, some ecological and political strategies may increase their effectiveness."
            },
            esp: {
                text: "Medios de comunicación social", 
                text_long: "Medios de comunicación social", 
                description: "A través de los medios sociales, algunas estrategias ecológicas y políticas pueden aumentar su eficacia."
            },
            location: {x: 300, y: 500},
            img_normal: "res/andrea_png/niab/POLICY_CULTURE_1_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_CULTURE_1_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0.1,
            effect_on_crises: 0,
            effect_on_pop_high: 0.05,
            effect_on_pop_medium: 0,
            effect_on_pop_low: 0,
            effect_on_income_low: -0.15,
            effect_on_income_low_medium: -0.1,
            effect_on_income_medium_high: 0.1,
            effect_on_income_high: 0.1,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        },
        {
            id: 10,
            domain: 3,
            eng: {
                text: "Global Festivals", 
                text_long: "Global Festivals", 
                description: "Global festivals generate consensus and may add resources to spend on other cultural strategies."
            },
            esp: {
                text: "Festivales Globales", 
                text_long: "Festivales Globales", 
                description: "Los festivales globales generan consenso y pueden añadir recursos para gastar en otras estrategias culturales."
            },
            location: {x: 600, y: 500},
            img_normal: "res/andrea_png/niab/POLICY_CULTURE_2_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_CULTURE_2_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0.2,
            effect_on_crises: 0,
            effect_on_pop_high: 0.1,
            effect_on_pop_medium: 0.05,
            effect_on_pop_low: 0,
            effect_on_income_low: -0.1,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0.1,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        },
        {
            id: 11,
            domain: 3,
            eng: {
                text: "Global Education", 
                text_long: "Global Education", 
                description: "Education strategies may improve climate change awareness as well as resource production in lower and middle-income countries."
            },
            esp: {
                text: "Educación Global", 
                text_long: "Educación Global", 
                description: "Las estrategias de educación pueden mejorar la concienciación sobre el cambio climático, así como la producción de recursos en los países de ingresos bajos y medios."
            },
            location: {x: 300, y: 200},
            img_normal: "res/andrea_png/niab/POLICY_CULTURE_3_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_CULTURE_3_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0.1,
            effect_on_crises: -0.05,
            effect_on_pop_high: 0.05,
            effect_on_pop_medium: 0,
            effect_on_pop_low: 0,
            effect_on_income_low: 0.05,
            effect_on_income_low_medium: 0.05,
            effect_on_income_medium_high: 0.05,
            effect_on_income_high: 0,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        },
        {
            id: 12,
            domain: 3,
            eng: {
                text: "Celebrity Endorsements", 
                text_long: "Celebrity Endorsements", 
                description: "This policy uses film and music stars to raise awareness. Combined with ecological strategies, it may improve their effectiveness."
            },
            esp: {
                text: "Apoyos de celebridades", 
                text_long: "Apoyos de celebridades", 
                description: "Esta política utiliza estrellas de cine y de música para sensibilizar a la opinión pública. Combinado con estrategias ecológicas, puede mejorar su eficacia."
            },
            location: {x: 600, y: 200},
            img_normal: "res/andrea_png/niab/POLICY_CULTURE_4_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_CULTURE_4_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0.1,
            effect_on_crises: 0.1,
            effect_on_pop_high: -0.05,
            effect_on_pop_medium: 0,
            effect_on_pop_low: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0,
            effect_on_income_high: 0.05,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        } ]
    },
    ecology: {
        eng: {
            labelText: "Design your Ecological Policy",
            name: "Ecology"
        },
        esp: {
            labelText: "Diseñe su póliza ecológica",
            name: "Ecología"
        },
        policyOptions: [ 
        {
            id: 13,
            domain: 4,
            eng: {
                text: "Fund Renewable Energy", 
                text_long: "Fund Renewable Energy", 
                description: "This policy is potentially very effective in highly industrialised countries."
            },
            esp: {
                text: "Fondo de Energías Renovables", 
                text_long: "Fondo de Energías Renovables", 
                description: "Esta política es potencialmente muy eficaz en los países altamente industrializados."
            },
            location: {x: 300, y: 500},
            img_normal: "res/andrea_png/niab/POLICY_ECOLOGY_1_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_ECOLOGY_1_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0.2,
            effect_on_crises: -0.2,
            effect_on_pop_high: 0.05,
            effect_on_pop_medium: 0,
            effect_on_pop_low: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0.05,
            effect_on_income_medium_high: 0.15,
            effect_on_income_high: 0.15,
            effect_on_geo_tropic: 0.2,
            effect_on_geo_subtropic: 0.1,
            effect_on_geo_temperate: 0.05,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        },
        {
            id: 14,
            domain: 4,
            eng: {
                text: "Public Transport", 
                text_long: "Public Transport", 
                description: "This policy targets the reduction on greenhouse emissions globally. Particularly effective in urbanised countries."
            },
            esp: {
                text: "Transporte Público", 
                text_long: "Transporte Público", 
                description: "Esta política tiene como objetivo la reducción de las emisiones de gases de efecto invernadero en todo el mundo. Especialmente eficaz en países urbanizados."
            },
            location: {x: 600, y: 500},
            img_normal: "res/andrea_png/niab/POLICY_ECOLOGY_2_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_ECOLOGY_2_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0,
            effect_on_crises: -0.1,
            effect_on_pop_high: 0.1,
            effect_on_pop_medium: 0,
            effect_on_pop_low: 0,
            effect_on_income_low: 0.1,
            effect_on_income_low_medium: 0.2,
            effect_on_income_medium_high: 0.2,
            effect_on_income_high: 0.15,
            effect_on_geo_tropic: 0,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        },
        {
            id: 15,
            domain: 4,
            eng: {
                text: "Green Cities", 
                text_long: "Green Cities", 
                description: "This policy involves the reduction of urban carbon footprint but does not address inequalities."
            },
            esp: {
                text: "Ciudades verdes", 
                text_long: "Ciudades verdes", 
                description: "Esta política implica la reducción de la huella de carbono urbana, pero no aborda las desigualdades."
            },
            location: {x: 300, y: 200},
            img_normal: "res/andrea_png/niab/POLICY_ECOLOGY_3_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_ECOLOGY_3_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0.1,
            effect_on_crises: -0.1,
            effect_on_pop_high: 0.2,
            effect_on_pop_medium: 0,
            effect_on_pop_low: 0,
            effect_on_income_low: 0,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0.1,
            effect_on_income_high: 0.1,
            effect_on_geo_tropic: 0.1,
            effect_on_geo_subtropic: 0.1,
            effect_on_geo_temperate: 0.1,
            effect_on_geo_polar: 0,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        },
        {
            id: 16,
            domain: 4,
            eng: {
                text: "Global Heritage Trust", 
                text_long: "Global Heritage Trust", 
                description: "This policy boots the creation of national parks and produces better awareness about endangered species."
            },
            esp: {
                text: "Fondo del Patrimonio Mundial", 
                text_long: "Fondo del Patrimonio Mundial", 
                description: "Esta política fomenta la creación de parques nacionales y produce una mayor conciencia sobre las especies en peligro de extinción."
            },
            location: {x: 600, y: 200},
            img_normal: "res/andrea_png/niab/POLICY_ECOLOGY_4_NORMAL.png",
            img_on: "res/andrea_png/niab/POLICY_ECOLOGY_4_ON.png",
            levels: 3,
            effect_on_transmissability: 0,
            effect_on_infectivity: 0,
            effect_on_resources: 0,
            effect_on_crises: -0.05,
            effect_on_pop_high: 0,
            effect_on_pop_medium: 0,
            effect_on_pop_low: 0,
            effect_on_income_low: -0.1,
            effect_on_income_low_medium: 0,
            effect_on_income_medium_high: 0.1,
            effect_on_income_high: 0.15,
            effect_on_geo_tropic: 0.1,
            effect_on_geo_subtropic: 0,
            effect_on_geo_temperate: 0.05,
            effect_on_geo_polar: 0.1,
            effect_on_density: 0,
            effect_on_area_large: 0,
            effect_on_area_medium: 0,
            effect_on_area_small: 0,
            cost_1: 3,
            cost_2: 4,
            cost_3: 5
        } ]
    }
};


const RESOURCE_MATRIX = [
    [ 0		                                                                ],
    [ 0 	,0	                                                            ],
    [ 0     ,0	,0						 ],
    [ 0	    ,0	,0	,0						],
    [ 0	    ,0	,0	,0	,0					 ],
    [ 0 	,0	,0	,0	,0	,0				 	],
    [ 0    	,0	,0	,0	,0	,0	,0				 ],
    [ 0 	,0	,0	,0	,0	,0	,0	,0			 	],
    [ 0 	,0	,0	,0	,0	,0	,0	,0	,0			],
    [ 0    	,0	,0	,0	,0	,0	,0	,0	,0	,0			],
    [ 0    	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0		  ],
    [ 0 	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	  	],
    [ 0 	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	  	],
    [ 0 	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	  ],
    [ 0	    ,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	  ],
    [ 0 	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0   ]
];

const RESOURCE_RELATIONS = [
    [0															],
    [0	,0														],
    [0	,0	,0													],
    [1	,0	,0	,0												],
    [0	,0	,0	,0	,0											],
    [0	,0	,0	,0	,0	,0										],
    [0	,0	,0	,0	,0	,0	,0									],
    [0	,0	,0	,0	,0	,0	,0	,0								],
    [0	,0	,0	,0	,0	,0	,0	,0	,0							],
    [0	,0	,0	,0	,0	,0	,0	,0	,0	,0						],
    [1	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0					],
    [0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0				],
    [0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0			],
    [0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0		],
    [0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	],
    [0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0	,0]
];

const CRISES = {
    WATER_SHORTAGE: {
        eng: "Water shortage",
        esp: "Escasez de agua",
        image: "res/andrea_png/NEW_ICONS/ICON_CRISIS_WATER_SHORTAGE.png",
        effect_on_climate: 0,
        effect_on_population: 0,
        effect_on_global_gdp: 0,
        effect_on_transmissability: 0,
        effect_on_infectivity: 0,
        effect_on_resources: -0.2,
        effect_on_environmental_loss: 0.3,
        influence_of_environmental_loss: 2.0,
        influence_of_preparedness: -0.2 
    },
    FINANCIAL_CRISIS: {
        eng: "Financial crisis",
        esp: "Crisis financiera",
        image: "res/andrea_png/NEW_ICONS/ICON_CRISIS_CRASH.png",
        effect_on_climate: 0,
        effect_on_population: 0,
        effect_on_global_gdp: 0,
        effect_on_transmissability: 0,
        effect_on_infectivity: 0,
        effect_on_resources: -1.0,
        effect_on_environmental_loss: 0.0,
        influence_of_environmental_loss: 0.0,
        influence_of_preparedness: 0.0 
    },
    EXTREME_WEATHER_EVENT: {
        eng: "Extreme weather event",
        esp: "Evento meteorológico extremo",
        image: "res/andrea_png/NEW_ICONS/ICON_CRISIS_WEATHER.png",
        effect_on_climate: 0,
        effect_on_population: 0,
        effect_on_global_gdp: 0,
        effect_on_transmissability: 0,
        effect_on_infectivity: 0,
        effect_on_resources: -0.2,
        effect_on_environmental_loss: 0.4,
        influence_of_environmental_loss: 0.5,
        influence_of_preparedness: -0.2 
    },
    FORCED_DISPLACEMENT: {
        eng: "Forced displacement",
        esp: "Desplazamiento forzado",
        image: "res/andrea_png/NEW_ICONS/ICON_CRISIS_DISPLACEMENT.png",
        effect_on_climate: 0,
        effect_on_population: 0,
        effect_on_global_gdp: 0,
        effect_on_transmissability: 0,
        effect_on_infectivity: 0,
        effect_on_resources: -0.5,
        effect_on_environmental_loss: 0.2,
        influence_of_environmental_loss: 0.4,
        influence_of_preparedness: -0.5 
    },
    EPIDEMIC: {
        eng: "Epidemic",
        esp: "Epidémico",
        image: "res/andrea_png/NEW_ICONS/ICON_CRISIS_EPIDEMIC.png",
        effect_on_climate: 0,
        effect_on_population: 0,
        effect_on_global_gdp: 0,
        effect_on_transmissability: 0,
        effect_on_infectivity: 0,
        effect_on_resources: -0.7,
        effect_on_environmental_loss: 0.0,
        influence_of_environmental_loss: 0.2,
        influence_of_preparedness: -0.2 
    },
    WAR: {
        eng: "War",
        esp: "Guerra",
        image: "res/andrea_png/NEW_ICONS/ICON_CRISIS_WAR.png",
        effect_on_climate: 0,
        effect_on_population: 0,
        effect_on_global_gdp: 0,
        effect_on_transmissability: 0,
        effect_on_infectivity: 0,
        effect_on_resources: -0.8,
        effect_on_environmental_loss: -0.1,
        influence_of_environmental_loss: 0.3,
        influence_of_preparedness: -0.2 
    }
};

TUTORIAL_MESSAGES = {
    FIRST_RESOURCE_SHOWN: {
        eng: "Click on the blue icons when they appear. It will add resources to your wallet.",
        esp: "Haga clic en los iconos azules cuando aparezcan. Añadirá recursos a su billetera."
    },
    FIRST_RESOURCE_CLICKED: {
        eng: "Click on the \"POLICY\" button to invest your resources and build your strategy. Remember that not all policies are equally effective in each country and that some policies are only effective if combined with other ones.",
        esp: "Haga clic en el botón \"PÓLIZA\" para invertir sus recursos y construir su estrategia. Recuerde que no todas las políticas son igualmente eficaces en cada país y que algunas sólo lo son si se combinan con otras."
    },
    RANDOM_1: {
        eng: "Click on one country to check the progress of environmental loss and the effectiveness of your policy on the preparedness of that country.",
        esp: "Haga clic en un país para comprobar el progreso de la pérdida medioambiental y la eficacia de su política sobre la preparación de ese país."
    },
    RANDOM_2: {
        eng: "Click on \"STATS\" to check the progress of the game and the global effectiveness of your policy platform.",
        esp: "Haga clic en \"STATS\" para comprobar el progreso del juego y la eficacia global de su plataforma de políticas."
    },
    RANDOM_3: {
        eng: "You can pause or control the speed of the game by clicking on the top-right buttons.",
        esp: "Puedes pausar o controlar la velocidad del juego haciendo clic en los botones de la parte superior derecha."
    },
    RANDOM_4: {
        eng: "Keep an eye on the message bar at the top to be aware of unexpected events and adapt your strategy.",
        esp: "Vigile la barra de mensajes en la parte superior para estar al tanto de los eventos inesperados y adaptar su estrategia."
    },
};

const NARRATIVES = {
    n2048: {
        BAD: {
            loss: 20,
            eng: [
                "Because of the high level of environmental damage globally, surface waters have become corrosive to aragonite shells of pteropods, forever altering the Antarctic sea ecosystem. Act fast to avoid worse consequences to the Antarctic continent."
            ],
            esp: [
                "Debido al alto nivel de daño ambiental a nivel mundial, las aguas superficiales se han vuelto corrosivas para las conchas de aragonita de los pterópodos, alterando para siempre el ecosistema marino antártico. Actuar con rapidez para evitar las peores consecuencias para el continente antártico."
            ]
        },
        VERY_BAD: {
            loss: 40,
            eng: [
                "Sea levels are rising because of the contribution of Antarctic glaciers and ice shelves. Their retreat has exposed new ice-free areas, particularly on the Antarctic Peninsula, the northernmost part of the continent, where new invasive species have arrived. Act fast to avoid worse consequences to the Antarctic continent."
            ],
            esp: [
                "El nivel del mar está subiendo debido a la contribución de los glaciares y las plataformas de hielo de la Antártida. Su retirada ha puesto al descubierto nuevas áreas libres de hielo, particularmente en la Península Antártica, la parte más septentrional del continente, donde han llegado nuevas especies invasoras. Actuar con rapidez para evitar las peores consecuencias para el continente antártico."
            ]
        },
        VERY_VERY_BAD: {
            loss: 60,
            eng: [
                "In response to new phenomena such as transport of soil particles to the ocean by increased run-off of ice melt from the continent, interactions between key species (especially krill, penguins, seals and whales) are unexpectedly changing. Catastrophic declines in some communities prelude to the extinction of many of these species. Act fast to avoid worse consequences to the Antarctic continent."
            ],
            esp: [
                "En respuesta a nuevos fenómenos como el transporte de partículas de suelo al océano por el aumento de la escorrentía del hielo derretido del continente, las interacciones entre especies clave (especialmente el krill, los pingüinos, las focas y las ballenas) están cambiando inesperadamente. Las disminuciones catastróficas en algunas comunidades son el preludio de la extinción de muchas de estas especies. Actuar con rapidez para evitar las peores consecuencias para el continente antártico."
            ]
        },
        VERY_VERY_VERY_BAD: {
            loss: 80,
            eng: [
                "Owing to tremendous pressure for resources to support the world's population, Antarctica is becoming more widely exploited. The Commission for the Conservation of Antarctic Marine Living Resources (CCAMLR), which is responsible for setting the limits on fishing in the region, is weakening. As a result, many new marine species are now being harvested in the Southern Ocean. In addition, several nations are attempting to rescind Article 7 of the Protocol on Environmental Protection to the Antarctic Treaty, which prohibits mineral resource exploitation. The destruction of Antarctica as we know it seems inevitable."
            ],
            esp: [
                "Debido a la tremenda presión por recursos para apoyar a la población mundial, la Antártida se está explotando cada vez más. La Comisión para la Conservación de los Recursos Vivos Marinos Antárticos (CCAMLR), responsable de fijar los límites de pesca en la región, se está debilitando. Como resultado, muchas nuevas especies marinas están siendo capturadas en el Océano Austral. Además, varias naciones están intentando rescindir el Artículo 7 del Protocolo sobre Protección Ambiental del Tratado Antártico, que prohíbe la explotación de recursos minerales. La destrucción de la Antártida tal como la conocemos parece inevitable."
            ]
        },
        GOOD: {
            loss: 0,
            eng: [
                "While some ice shelves in the Antarctic Peninsula and Amundsen Sea appear forever lost, the thinning rates observed in the large ice shelves for the period 1994–2012 remained fairly steady through to 2048. The marine ice cliff instability has mostly been limited to a few outlet glaciers in the Amundsen Sea sector of West Antarctica and has not reached East Antarctica. Keep improving your global policy strategy to save Antarctica.",
                "Although ocean acidification is continuing, the impact is stabilizing as atmospheric CO2 levels are decreasing. Some Antarctic population declines have been recorded in sensitive species, but others adapted, resulting in less change than was initially forecast. Seal and seabird populations will probably be able to adapt to the new ecosystemic conditions if extreme events due to climate change become less frequent.",
                "Thanks to the strong action in mitigation greenhouse emissions globally, changes in the temperature and salinity of the Southern Ocean are reversing. The Antarctic Circumpolar Current is shifting towards the Equator, therefore contributing to cooling  the Southern Ocean. Changes in wind-driven ocean currents are reducing the exposure of the floating ice shelves to basal melt by warm ocean waters. However, the reduction in ocean heat transport to the ice shelf cavities is coming too late to save some West Antarctic ice shelves and ice tongues. Keep acting on your global policy strategy to save Antarctica.",
            ],
            esp: [
                "Mientras que algunas plataformas de hielo en la Península Antártica y el Mar de Amundsen parecen haberse perdido para siempre, las tasas de adelgazamiento observadas en las grandes plataformas de hielo durante el período 1994-2012 se mantuvieron bastante estables hasta 2048. La inestabilidad de los acantilados de hielo marino se ha limitado principalmente a unos pocos glaciares de salida en el sector del Mar de Amundsen de la Antártida occidental y no ha llegado a la Antártida oriental. Sigan mejorando su estrategia de política global para salvar a la Antártida.",
                "Aunque la acidificación de los océanos continúa, el impacto se está estabilizando a medida que disminuyen los niveles de CO2 en la atmósfera. Se han registrado algunas disminuciones de la población antártica en especies sensibles, pero otras se han adaptado, lo que ha dado lugar a menos cambios de los previstos inicialmente. Las poblaciones de focas y aves marinas probablemente podrán adaptarse a las nuevas condiciones del ecosistema si los eventos extremos debidos al cambio climático se vuelven menos frecuentes.",
                "Gracias a las enérgicas medidas de mitigación de las emisiones de gases de efecto invernadero en todo el mundo, los cambios en la temperatura y la salinidad del Océano Austral se están invirtiendo. La Corriente Circumpolar Antártica se desplaza hacia el Ecuador, contribuyendo así a enfriar el Océano Austral. Los cambios en las corrientes oceánicas impulsadas por el viento están reduciendo la exposición de las plataformas de hielo flotante al derretimiento basal por las aguas cálidas del océano. Sin embargo, la reducción en el transporte de calor oceánico a las cavidades de la plataforma de hielo está llegando demasiado tarde para salvar algunas plataformas de hielo y lenguas de hielo de la Antártida Occidental. Sigan actuando en su estrategia de política global para salvar a la Antártida.",
            ]
        }
    },
    n2070: {
        BAD: {
            loss: 80,
            eng: [
                "You lost! Your policy platform did not achieve its aim and an unprecedented environmental catastrophe is leading to a collapse of organised society globally. An international armed conflict over the use of Antarctic water and underground resources has sparked in 2069 with large scale human casualties. Forced human migration has spiked in 2048, when low-rise coastal cities needed to be abandoned and half the species on the planet have gone extinct. Carbon footprint is decreasing, but only due to population loss. Underground and low-orbit settlements for wealthy people are under construction, whilst a large majority of the world’s population will not survive the combination of climate wars and extreme climate events."
            ],
            esp: [
                "¡Perdiste! Su plataforma política no ha alcanzado su objetivo y una catástrofe medioambiental sin precedentes está llevando a un colapso de la sociedad organizada a nivel mundial. Un conflicto armado internacional por el uso del agua de la Antártida y los recursos subterráneos se desencadenó en 2069 con grandes pérdidas humanas. La migración forzada de seres humanos ha aumentado en 2048, cuando las ciudades costeras de baja altura necesitaban ser abandonadas y la mitad de las especies del planeta se han extinguido. La huella de carbono está disminuyendo, pero sólo debido a la pérdida de población. Se están construyendo asentamientos subterráneos y en órbita baja para personas ricas, mientras que una gran mayoría de la población mundial no sobrevivirá a la combinación de guerras climáticas y fenómenos climáticos extremos."
            ]
        },
        MID: {
            loss: 20,
            eng: [
                "You lost! In spite of your efforts, which have curbed climate change and reduced global carbon footprint, your policy platform was not strong enough to avoid environmental catastrophe. Whilst some Antarctic species have adapted to the new habitat conditions, the loss of ice shelves, the change in salinity, temperature and acidity of the Southern Ocean have completely transformed the Antarctic Continent. Mining explorations are taking place in the eastern side of the continent, after a number of states called for a review of the Environmental Protocol to the Antarctic Treaty. Elsewhere in the world, several cities have become inhospitable and climate migrants are causing several political struggles globally. The future of humanity is at risk."
            ],
            esp: [
                "¡Perdiste! A pesar de sus esfuerzos, que han frenado el cambio climático y reducido la huella de carbono global, su plataforma política no era lo suficientemente fuerte como para evitar una catástrofe medioambiental. Mientras que algunas especies antárticas se han adaptado a las nuevas condiciones del hábitat, la pérdida de las plataformas de hielo, el cambio en la salinidad, la temperatura y la acidez del Océano Austral han transformado completamente el continente antártico. Las exploraciones mineras se están llevando a cabo en la parte oriental del continente, después de que varios estados solicitaran una revisión del Protocolo Ambiental del Tratado Antártico. En otras partes del mundo, varias ciudades se han vuelto inhóspitas y los migrantes climáticos están causando varias luchas políticas a nivel mundial. El futuro de la humanidad está en peligro."
            ]
        },
        GOOD: {
            loss: 0,
            eng: [
                "You won! Your global policy platform has arrested climate change and reverted its negative effects on Antarctica. Most polar species have adapted to the new environmental conditions and your policy efforts have allowed a renegotiation of the Antarctic Treaty, which imposes much stricter limitations on human presence and on the exploitation of resources on the continent. Sea level rise has remained contained within 6cm, whilst less than 10% of Antarctic ice has been lost. Congratulations for avoiding an environmental catastrophe."
            ],
            esp: [
                "¡Ganaste! Su plataforma de política global ha detenido el cambio climático y revertido sus efectos negativos en la Antártida. La mayoría de las especies polares se han adaptado a las nuevas condiciones ambientales y sus esfuerzos políticos han permitido una renegociación del Tratado Antártico, que impone limitaciones mucho más estrictas a la presencia humana y a la explotación de recursos en el continente. El aumento del nivel del mar se ha mantenido contenido en 6 cm, mientras que se ha perdido menos del 10% del hielo antártico. Felicitaciones por evitar una catástrofe ambiental."
            ]
        }
    }
};



res.lang = {
    welcome: {
      eng: "Welcome to Antarctic Futures!",
      esp: "¡Bienvenido a Antarctic Futures!"
    },
    about_game: {
      eng: "This game is developed as part of a research project, 'Antarctic Cities and the Global Commons'. As part of our research, we collect your IP address, as well as anonymous data during the game. To learn more, click the 'Learn More' button below.",
      esp: "Este juego se desarrolla como parte de un proyecto de investigación,'Ciudades Antárticas y el Patrimonio Mundial'. Como parte de nuestra investigación, recopilamos su dirección IP, así como datos anónimos durante el juego. Para obtener más información, haga clic en el botón'Learn More' de abajo."
    },
    consent: {
      eng: "I agree to participate in this research project, and understand my gameplay data will be recorded anonymously.",
      esp: "Acepto participar en este proyecto de investigación y entiendo que mis datos de juego se registrarán de forma anónima."
    },
    world_label: {
      eng: "World",
      esp: "Mundo"
    },
    crisis_prefix: {
      eng: "A ",
      esp: "Un "
    },
    crisis_suffix: {
      eng: " is taking place in ",
      esp: " tiene lugar en "
    },
    crisis_explanation: {
      eng: " Crises are unexpected events due to environmental loss. Click on the crisis icon to slow the loss and increase the preparedness of the country to minimise the risk of further crises.",
      esp: " Las crisis son eventos inesperados debido a la pérdida del medio ambiente. Haga clic en el icono de crisis para ralentizar la pérdida y aumentar la preparación del país para minimizar el riesgo de nuevas crisis."
    },
    crisis_alert: {
      eng: "Crisis alert!",
      esp: "¡Alerta de crisis!"
    },
    bulletin: {
      eng: "Antarctic Bulletin, year ",
      esp: "Boletín Antártico, año "
    },
    start_tutorial: {
      eng: "Start Tutorial",
      esp: "Iniciar Tutorial"
    },
    start_tutorial_skip: {
      eng: "Skip Tutorial",
      esp: "Saltar Tutorial"
    },
    start_prepare: {
      eng: "Prepare the world...",
      esp: "Preparar al mundo..."
    },
    start_mission_a: {
      eng: "In 2019, your global policy mission begins in ",
      esp: "En 2019, la misión de su política global comienza en "
    },
    start_mission_b: {
      eng: ". You have until 2070 to save the Antarctic continent. Invest in policies that will reduce the effects of climate change, arrest environmental loss and increase the preparedness of each country.",
      esp: ". Tienes hasta 2070 para salvar el continente antártico. Invertir en políticas que reduzcan los efectos del cambio climático, detengan la pérdida del medio ambiente y aumenten la preparación de cada país."
    },
    crisis_title: {
        eng: "Congratulations!",
        esp: "Felicitaciones!"
    },
    crisis_message: {
        eng: "You have averted the ",
        esp: "Has evitado el "
    },
    policy_platform_title: {
      eng: "Build a policy platform",
      esp: "Construir una plataforma de políticas"
    },
    policy_platform_hint: {
      eng: "<<< Select one of these policies to invest in it!",
      esp: "<<< ¡Seleccione una de estas pólizas para invertir en ella!"
    },
    policy_platform_cost: {
      eng: "Cost: ",
      esp: "Costo: "
    },
    policy_platform_invest: {
      eng: "Invierta en esta política",
      esp: "Policy completed!"
    },
    policy_platform_completed: {
      eng: "Policy completed!",
      esp: "¡Póliza completa!"
    },
    policy_platform_more_resources: {
      eng: "You need more resources!",
      esp: "¡Necesita más recursos!"
    },
    stats_world: {
      eng: "World",
      esp: "Mundo"
    },
    stats_countries: {
      eng: "Countries",
      esp: "Países"
    },
    stats_trends: {
      eng: "Trends",
      esp: "Tendencias"
    },
    stats_country: {
      eng: "Country",
      esp: "País"
    },
    stats_year: {
      eng: "Year ",
      esp: "Año "
    },
    stats_year_message_a: {
      eng: "You have ",
      esp: "Usted tiene "
    },
    stats_year_message_b: {
      eng: " years until the end of the simulation.",
      esp: " años hasta el final de la simulación."
    },
    stats_loss: {
      eng: "Environmental loss",
      esp: "Pérdida ambiental"
    },
    stats_loss_message_a: {
      eng: "Since ",
      esp: "Desde que "
    },
    stats_loss_message_b: {
      eng: ", the global environment has declined by ",
      esp: ", el medio ambiente mundial se ha deteriorado en "
    },
    stats_preparedness: {
      eng: "Preparedness ",
      esp: "Preparación "
    },
    stats_preparedness_message_a: {
      eng: "Thanks to your policy platform, ",
      esp: "Gracias a su plataforma de pólizas, "
    },
    stats_preparedness_message_b: {
      eng: " of the world is now more ready to take action against climate change. ",
      esp: " del mundo está ahora más preparado para tomar medidas contra el cambio climático. "
    },
    stats_track: {
      eng: "Track how the world is doing",
      esp: "Siga la pista de cómo le va al mundo"
    }
   }
  