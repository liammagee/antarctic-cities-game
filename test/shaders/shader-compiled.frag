#ifdef GL_ES
precision mediump float;
#define GLSLIFY 1
#endif

#iChannel0 "file://AUS_equal.png"

const float CELL_SIZE = 20.0;
const float RAND_FACTOR = 0.0;
const float RAND_ALPHA = 0.1;
const float SIZE_POWER = 1.0;
const float SIZE_MULTIPLIER = 1.;
const float STEP_MIN = .9;
const float STEP_MAX = 1.;
const float BORDER_RADIUS = 3.;

float rand(vec2 uv) {
    return fract(sin(dot(uv, vec2(10.894, 73.891)))*43567.81353);
}

float randForCell(vec2 coord, vec2 offset) {
    // Cell location
    vec2 cellCoords = vec2(floor((coord.x + offset.x) / CELL_SIZE), floor((coord.y + offset.y) / CELL_SIZE));
    return rand(cellCoords);
}

float cell(vec2 coord, vec2 offset, vec2 shift) {
    // Cell location
    vec2 cellCoords = vec2(floor((coord.x + offset.x) / CELL_SIZE), floor((coord.y + offset.y) / CELL_SIZE));
    // Relative position in cell
    vec2 cellDist = vec2(mod((coord.x + offset.x), CELL_SIZE), mod((coord.y + offset.y), CELL_SIZE));
    // Get a pseudo random number
    float r = 1.0 - rand(cellCoords + shift) * RAND_FACTOR;

    // Subtract cell cell, with a pseudo random value
    cellDist -= CELL_SIZE / 2.0 * r;
    // Subtract from offset, to allow for overlapping
    cellDist = offset - cellDist;
    // Normalize
    cellDist /= CELL_SIZE / 2.0;
    // Get length
    float cd = length(cellDist);
    // To produce fewer larger dots, exponentiate
    // Since a lower number means a larger size, invert
    float size = 1. / (SIZE_MULTIPLIER * pow(r, SIZE_POWER));
    
    // Adjust alpha

    return 1.-smoothstep(STEP_MIN, STEP_MAX, cd * size * r);
}

// Centre of cell
vec2 cc(vec2 coord) {
    vec2 cellCoords = vec2(floor(coord.x / CELL_SIZE), floor(coord.y / CELL_SIZE));
    return cellCoords * CELL_SIZE + CELL_SIZE / 2.0;
}

// Resolution shortcut
vec2 rs(vec2 coord) {
    return coord.xy / iResolution.xy;
}

float textureAlpha(vec2 coord) {
    float alpha = 1.-randForCell(-coord, vec2(0., 0.))*RAND_ALPHA;
    return alpha * texture(iChannel0, rs(cc(coord))).a;
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
    dotIntensity += cellIntensity(coord, vec2(0., CELL_SIZE), shift);
    dotIntensity += cellIntensity(coord, vec2(0., -CELL_SIZE), shift);
    dotIntensity += cellIntensity(coord, vec2(CELL_SIZE, 0.), shift);
    dotIntensity += cellIntensity(coord, vec2(-CELL_SIZE, 0.), shift);
    dotIntensity += cellIntensity(coord, vec2(CELL_SIZE, CELL_SIZE), shift);
    dotIntensity += cellIntensity(coord, vec2(CELL_SIZE, -CELL_SIZE), shift);
    dotIntensity += cellIntensity(coord, vec2(-CELL_SIZE, CELL_SIZE), shift);
    dotIntensity += cellIntensity(coord, vec2(-CELL_SIZE, -CELL_SIZE), shift);
    // dotIntensity = step(1.-dotIntensity, .5);

    return dotIntensity;
}

vec4 makeBorder(vec2 coord) {
    float radius = BORDER_RADIUS;
    vec3 greyDark = vec3(42.0 / 255.0, 54.0 / 255.0, 68.0 / 255.0);
    vec4 border = texture2D(iChannel0, rs(gl_FragCoord.xy));
    border += texture2D(iChannel0, rs(gl_FragCoord.xy + vec2(0., radius)));
    border += texture2D(iChannel0, rs(gl_FragCoord.xy + vec2(0., - radius)));
    border += texture2D(iChannel0, rs(gl_FragCoord.xy + vec2(radius, 0.)));
    border += texture2D(iChannel0, rs(gl_FragCoord.xy + vec2(- radius, 0.)));
    border += texture2D(iChannel0, rs(gl_FragCoord.xy + vec2(- radius, - radius)));
    border += texture2D(iChannel0, rs(gl_FragCoord.xy + vec2(radius, - radius)));
    border += texture2D(iChannel0, rs(gl_FragCoord.xy + vec2(radius, radius)));
    border += texture2D(iChannel0, rs(gl_FragCoord.xy + vec2(- radius, radius)));
    border /= 9.;
    border = 1.0 - (abs(0.5 - border) * 2.);
    border.rgb = greyDark * border.a;
    return border;
}

vec4 overlay(vec4 under, vec4 over) {
    return over.a * over + ((1.-length(over.rgb)*over.a) * under);
}

void main() {

    // Accumulates various effects
    vec4 mask = vec4(0.);

    // Get the resolution
    vec2 uv = (gl_FragCoord.xy / iResolution.xy);
    // Test wavy effects
    // uv.y += 0.05 * sin(iTime + uv.x * 10.0);
    // uv.x += 0.05 * sin(iTime + uv.y * 10.0);

    // One set of dots
    float di1 = dotIntensity(gl_FragCoord.xy, vec2(0., 0.));
    // Another set of dots
    float di2 = dotIntensity(gl_FragCoord.xy, vec2(CELL_SIZE*0.5, CELL_SIZE*0.5));

    // Illuminate cities
    vec3 cities = vec3(smoothstep(0.42, 0.42, texture(iChannel0, uv)));

    // Do outline
    vec4 border = makeBorder(gl_FragCoord.xy);    

    // Construct the mask
    // Add border
    mask.rgb += border.rgb;
    // Add cities
    mask.rgb += cities;
    // Add random dots
    vec4 color1 = vec4(di1, 0., 0., di1);
    // Add random dots
    vec4 color2 = vec4(0., di2, 0., di2);
    // Add slow pulse affect
    float sf = (1.+sin(iTime*3.)) / 2.;
    color1.a = sf;
    color2.a = 1.-sf;
    // Overlay blend for colours
    mask = overlay(mask, color1);
    mask = overlay(mask, color2);

    // Ouptput mask
    gl_FragColor = mask;
}