
#ifdef GL_ES
  precision mediump float;
#endif
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

uniform float u_threshold;
uniform vec3 u_outlineColor1;
uniform vec3 u_outlineColor2;
uniform float u_fill1;
uniform float u_fill2;
uniform float u_radius;
uniform float u_zoom;
uniform float u_selected;
uniform vec2 u_location;
uniform vec2 u_mouse;
uniform vec2 resolution;


//change this to whatever you want
const float DOT_SIZE = 1.0;



float random1 (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}
float random2 (vec2 st) {
    return fract(sin(dot(vec2(st.y, st.x),
                         vec2(12.9898,78.233)))*
        43758.5453123);
}


float hash(vec2 p)  // replace this by something better
{
    p  = 50.0*fract( p*0.3183099 + vec2(0.71,0.113));
    return -1.0+2.0*fract( p.x*p.y*(p.x+p.y) );
}

float noise( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );
	
	vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( hash( i + vec2(0.0,0.0) ), 
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ), 
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

float makeDotMask(vec2 origin) {
    //Just a quick example to look like "https://www.shadertoy.com/view/MtlGRs", change this whatever you like.
    return smoothstep(1.0, 0.9, length(origin));
}



void main()
{
    float radius = .0;
    // float radius = u_radius;
    vec4 accumB = vec4(0.0);
    vec4 accum0 = vec4(0.0);
    vec4 accum1 = vec4(0.0);
    vec4 accum2 = vec4(0.0);
    vec4 normal = vec4(0.0);
    vec4 mouse = vec4(0.0);
    vec3 grey = vec3(214.0 / 255.0, 225.0 / 255.0, 227.0 / 255.0);
    vec3 greyDark = vec3(42.0 / 255.0, 54.0 / 255.0, 68.0 / 255.0);



    vec2 st = gl_FragCoord.xy;// / resolution.xy;

	vec2 p = gl_FragCoord.xy / resolution.xy;
  	vec2 uv2 = p*vec2(resolution.x/resolution.y,1.0);

    float dotSize = DOT_SIZE * u_zoom;
    vec2 grid1 = fract(st / dotSize) * 2.0 - 1.0;
    vec2 grid2 = fract((st + dotSize / 2.) / dotSize) * 2.0 - 1.0;
    float dotMask1 = makeDotMask(grid1);
    float dotMask2 = makeDotMask(grid1);
    vec2 alphaMask = floor(st / dotSize);
    float f1 = noise( 32. * alphaMask );
    f1 = 0.5 + 0.5 * f1;
    float f2 = noise( 16. * alphaMask );
    f2 = 0.5 + 0.5 * f2;


    //float rnd1 = random1( st );
    //float rnd2 = random2( st );

    normal = texture2D(CC_Texture0, vec2(v_texCoord.x, v_texCoord.y));
    
    // float selected = 0.0;
    // // mouse = texture2D(CC_Texture0, vec2(0.,0.));
    // mouse = texture2D(CC_Texture0, vec2(u_mouse.x, u_mouse.y) );
    // // mouse = texture2D(CC_Texture0, vec2(0.5, 0.5));
    // selected = mouse.a * 1.0;
    
    accumB += texture2D(CC_Texture0, vec2(v_texCoord.x - radius, v_texCoord.y - radius));
    accumB += texture2D(CC_Texture0, vec2(v_texCoord.x + radius, v_texCoord.y - radius));
    accumB += texture2D(CC_Texture0, vec2(v_texCoord.x + radius, v_texCoord.y + radius));
    accumB += texture2D(CC_Texture0, vec2(v_texCoord.x - radius, v_texCoord.y + radius));
    accumB *= 1.75;
    accumB.rgb = greyDark * accumB.a;
    // accumB *= (1.0 - normal.a) * selected;
    accumB *= (1.0 - normal.a) * u_selected;

    accum0 += texture2D(CC_Texture0, vec2(v_texCoord.x, v_texCoord.y));
    accum0.rgb *= grey * accum0.a;

    // Fill values
    float v1 = ( 1.0 - u_fill1 / 100.0 );
    v1 = v1 * v1 * v1;
    float v2 = ( 1.0 - u_fill2 / 100.0 );
    v2 = v2 * v2 * v2;


    accum1 = vec4(u_outlineColor1 * accum0.a, accum0.a);
    accum1 *= accum1 * dotMask1; 
    //accum1 *= f1;
    accum1 *= 1.0 - v1;
    accum1.a = clamp(accum1.a, 0.0, 1.0);
    
    accum2 = vec4(u_outlineColor2 * accum0.a, accum0.a);
    accum2 *= accum2 * dotMask2; 
    accum2 *= f2;
    accum2 *= 1.0 - v2;
    accum2.a = clamp(accum2.a, 0.0, 1.0);
     
    normal = max( accum1, accum2 );
    normal = ( accumB * (1.0 - normal.a)) + (normal * normal.a);
    gl_FragColor = normal;

}
