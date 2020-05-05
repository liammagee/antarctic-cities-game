#ifdef GL_ES
  precision mediump float;
#endif
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;


//change this to whatever you want
const float CELL_SIZE = 5.0;
const float RAND_FACTOR = 0.5;
const float RAND_ALPHA = .3;
const float SIZE_POWER = 4.0;
const float SIZE_MULTIPLIER = 1.8;
const float STEP_MIN = .9;
const float STEP_MAX = 1.;
const float BORDER_RADIUS = 10.;

uniform float u_threshold;
uniform vec3 u_colorForLoss;
uniform vec3 u_colorForPreparedness;
uniform float u_percentageLoss;
uniform float u_percentagePreparedness;
uniform float u_selected;
uniform vec2 u_location;
uniform float u_zoom;
uniform float u_dotSize;

uniform float u_cellSize;
uniform float u_randFactor;
uniform float u_randAlpha;
uniform float u_sizePower;
uniform float u_sizeMultiplier;
uniform float u_stepMin;
uniform float u_stepMax;
uniform float u_borderRadius;

uniform vec2 resolution;




float rand(vec2 st) {
    return fract(sin(dot(st, vec2(12.839, 78.149))) * 43758.5453);
}

float randForCell(vec2 coord, vec2 offset) {
    // Cell location
    vec2 cellCoords = vec2(floor((coord.x + offset.x) / u_cellSize), floor((coord.y + offset.y) / u_cellSize));
    return rand(cellCoords);
}

float cell(vec2 coord, vec2 offset, vec2 shift) {
    // Cell location
    vec2 cellCoords = vec2(floor((coord.x + offset.x) / u_cellSize), floor((coord.y + offset.y) / u_cellSize));
    // Relative position in cell
    vec2 cellDist = vec2(mod((coord.x + offset.x), u_cellSize), mod((coord.y + offset.y), u_cellSize));
    // Get a pseudo random number
    float r = 1.0 - rand(cellCoords + shift) * u_randFactor;
    // Subtract cell cell, with a pseudo random value
    cellDist -= u_cellSize / 2.0 * r;
    // Subtract from offset, to allow for overlapping
    cellDist = offset - cellDist;
    // Normalize
    cellDist /= u_cellSize / 2.0;
    // Get length
    float cd = length(cellDist);
    // To produce fewer larger dots, exponentiate
    // Since a lower number means a larger size, invert
    float size = 1. / (u_sizeMultiplier * pow(r, u_sizePower));
    
    // Adjust alpha
    return 1. - smoothstep(u_stepMin, u_stepMax, cd * size * r);
}

// Centre of cell
vec2 cc(vec2 coord) {
    vec2 cellCoords = vec2(floor(coord.x / u_cellSize), floor(coord.y / u_cellSize));
    return cellCoords * u_cellSize + u_cellSize / 2.0;
}

// Resolution shortcut
vec2 rs(vec2 coord) {
    return coord.xy / resolution.xy;
}

float textureAlpha(vec2 coord) {
    float alpha = 1.-randForCell(-coord, vec2(0., 0.)) * u_randAlpha;
    return alpha * texture2D(CC_Texture0, v_texCoord).a;
}
float cellIntensity(vec2 coord, vec2 offset, vec2 shift) {
    return cell(coord, offset, shift) * textureAlpha(coord + offset);
}
// Intensity of the dot
float dotIntensity(vec2 coord, vec2 shift) {
    coord -= shift;
    
    // Get a float value representing dot intensity 
    float dotIntensity = 0.;
    dotIntensity += cellIntensity(coord, vec2(0., 0.), shift);
    // To allow for dots to spill over into neighbouring cells,
    // accumulate neighbouring cell values
    dotIntensity += cellIntensity(coord, vec2(0., u_cellSize), shift);
    dotIntensity += cellIntensity(coord, vec2(0., -u_cellSize), shift);
    dotIntensity += cellIntensity(coord, vec2(u_cellSize, 0.), shift);
    dotIntensity += cellIntensity(coord, vec2(-u_cellSize, 0.), shift);
    dotIntensity += cellIntensity(coord, vec2(u_cellSize, u_cellSize), shift);
    dotIntensity += cellIntensity(coord, vec2(u_cellSize, -u_cellSize), shift);
    dotIntensity += cellIntensity(coord, vec2(-u_cellSize, u_cellSize), shift);
    dotIntensity += cellIntensity(coord, vec2(-u_cellSize, -u_cellSize), shift);
    // dotIntensity = step(1.-dotIntensity, .5);

    return dotIntensity;
}


vec4 makeBorder(vec2 coord) {
    float radius = (u_borderRadius * u_borderRadius) / (resolution.x * resolution.y);
    vec3 greyDark = vec3(42.0 / 255.0, 54.0 / 255.0, 68.0 / 255.0);
    vec4 accum = texture2D(CC_Texture0, (v_texCoord.xy));
    // vec4 accum = vec4(0.);
    accum += texture2D(CC_Texture0, (v_texCoord.xy + vec2(0., radius)));
    accum += texture2D(CC_Texture0, (v_texCoord.xy + vec2(0., - radius)));
    accum += texture2D(CC_Texture0, (v_texCoord.xy + vec2(radius, 0.)));
    accum += texture2D(CC_Texture0, (v_texCoord.xy + vec2(- radius, 0.)));
    accum += texture2D(CC_Texture0, (v_texCoord.xy + vec2(- radius, - radius)));
    accum += texture2D(CC_Texture0, (v_texCoord.xy + vec2(radius, - radius)));
    accum += texture2D(CC_Texture0, (v_texCoord.xy + vec2(radius, radius)));
    accum += texture2D(CC_Texture0, (v_texCoord.xy + vec2(- radius, radius)));
    accum /= 9.;
    accum = 1.0 - (abs(0.5 - accum) * 2.);
    accum.rgb = greyDark * accum.a;
    accum *= u_selected;
    return accum;
}

vec4 overlay(vec4 under, vec4 over) {
    return over.a * over + ((1.-length(over.rgb)*over.a) * under);
}


void main() {
    // Accumulates various effects
    vec4 mask = vec4(0., 0., 0., 0.);

    // Get the resolution
    vec2 uv = (gl_FragCoord.xy / resolution.xy);
    // Test wavy effects
    // uv.y += 0.05 * sin(iTime + uv.x * 10.0);
    // uv.x += 0.05 * sin(iTime + uv.y * 10.0);

    // Do outline
    vec4 border = makeBorder(v_texCoord.xy);    

    // Illuminate cities
    vec3 cities = vec3(smoothstep(0.42, 0.42, texture2D(CC_Texture0, v_texCoord.xy)));


    // Get coordinates offset by map location pan & zoom
    vec2 st = gl_FragCoord.xy - u_location.xy / u_zoom;
    // One set of dots
    float di1 = dotIntensity(st, vec2(0., 0.));
    // Another set of dots
    float di2 = dotIntensity(st, vec2(u_cellSize*0.5, u_cellSize*0.5));

    // Fill values
    float v1 = ( 1.0 - u_percentageLoss / 100.0 );
    v1 = v1 * v1 * v1;
    float v2 = ( 1.0 - u_percentagePreparedness / 100.0 );
    v2 = v2 * v2 * v2;

    // Construct the mask
    // Add border
    mask = border;
    // Add cities
    //mask.rgb += cities;
    // Add random dots
    vec4 color1 = vec4(di1, 0., 0., di1);
    color1 *= 1. - v1;
    // Add random dots
    vec4 color2 = vec4(0., di2, 0., di2);
    color2 *= 1. - v2;
    
    // Add slow pulse affect
    // float sf = (1.+sin(iTime*3.)) / 2.;
    // color1.a = sf;
    // color2.a = 1.-sf;

    // Overlay blend for colours
    mask = overlay(mask, color1);
    mask = overlay(mask, color2);

    gl_FragColor = mask;
}
