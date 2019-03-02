
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
uniform vec2 resolution;


//change this to whatever you want
const float DOT_SIZE = 4.0;



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
    float rad = 0.5;
    rad = max(rad, 0.4);
    float smoothness = 0.1;
    return smoothstep(rad, rad - smoothness, length(origin));
}

/*
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
	vec2 uv = fragCoord.xy;// iResolution.xy;
    
    
	vec2 p = fragCoord.xy / iResolution.xy;
	vec2 uv2 = p*vec2(iResolution.x/iResolution.y,1.0);
    float f1 = noise( 32.*uv );
    f1 = 0.5 + 0.5*f1;
	
    vec2 grid = fract(uv / DOT_SIZE) * 2.0 - 1.0;
    vec2 dims = floor(uv2 * 10.);
    float dotMask = makeDotMask(grid);
    vec3 color = yourColorCodeHere(p.x, p.y)  * makeDotMask;
    
    fragColor = vec4(color,grid);
}
*/

void main()
{
    float radius = .0;
    // float radius = u_radius;
    vec4 accumB = vec4(0.0);
    vec4 accum0 = vec4(0.0);
    vec4 accum1 = vec4(0.0);
    vec4 accum2 = vec4(0.0);
    vec4 normal = vec4(0.0);
    vec3 grey = vec3(214.0 / 255.0, 225.0 / 255.0, 227.0 / 255.0);
    vec3 greyDark = vec3(42.0 / 255.0, 54.0 / 255.0, 68.0 / 255.0);



    vec2 st = gl_FragCoord.xy;// / resolution.xy;

	  vec2 p = gl_FragCoord.xy / resolution.xy;
  	vec2 uv2 = p*vec2(resolution.x/resolution.y,1.0);

    float dotSize = DOT_SIZE * u_zoom;
    vec2 grid1 = fract(st / dotSize) * 2.0 - 1.0;
    vec2 grid2 = fract((st + dotSize / 2.) / dotSize) * 2.0 - 1.0;
    float dotMask1 = makeDotMask(grid1);
    float dotMask2 = makeDotMask(grid2);
    vec2 alphaMask = floor(st / dotSize);
    float f1 = noise( 32. * alphaMask );
    f1 = 0.5 + 0.5*f1;


    float rnd1 = random1( st );
    float rnd2 = random2( st );

    normal = texture2D(CC_Texture0, vec2(v_texCoord.x, v_texCoord.y));
    
    if (u_selected == 0.0) {

        accumB += texture2D(CC_Texture0, vec2(v_texCoord.x - radius, v_texCoord.y - radius));
        accumB += texture2D(CC_Texture0, vec2(v_texCoord.x + radius, v_texCoord.y - radius));
        accumB += texture2D(CC_Texture0, vec2(v_texCoord.x + radius, v_texCoord.y + radius));
        accumB += texture2D(CC_Texture0, vec2(v_texCoord.x - radius, v_texCoord.y + radius));
        accumB *= 1.75;
        accumB.rgb = greyDark * accumB.a;

        accum0 += texture2D(CC_Texture0, vec2(v_texCoord.x, v_texCoord.y));
        accum0.rgb *= grey * accum0.a;

        accum1 += texture2D(CC_Texture0, vec2(v_texCoord.x, v_texCoord.y));
        //accum1 *= 0.1 + u_fill1 / 100. * 0.9 ;
        accum1.rgb = u_outlineColor1 * accum1.a;
        accum1 *= accum1 * dotMask1; 
        // accum1.a = 0.;
        accum1 *= f1;
        accum1 *= u_fill1 / 100.;
        
        accum2 += texture2D(CC_Texture0, vec2(v_texCoord.x, v_texCoord.y));
        //accum2 *= 0.1 + u_fill2 / 100. * 0.9 ;
        accum2.rgb = u_outlineColor2 * accum2.a;
        accum2 *= accum2 * dotMask2; 
        accum2 *= f1;
        accum2 *= u_fill2 / 100.;
                
        normal = accum1 + accum2;
        // normal = ( accumB * (1.0 - normal.a)) + (normal * 1.0);
        gl_FragColor = normal;
    }
    else {
        accumB += texture2D(CC_Texture0, vec2(v_texCoord.x - radius, v_texCoord.y - radius));
        accumB += texture2D(CC_Texture0, vec2(v_texCoord.x + radius, v_texCoord.y - radius));
        accumB += texture2D(CC_Texture0, vec2(v_texCoord.x + radius, v_texCoord.y + radius));
        accumB += texture2D(CC_Texture0, vec2(v_texCoord.x - radius, v_texCoord.y + radius));
        accumB *= 1.75;
        accumB.rgb = greyDark * accumB.a;
        normal = ( accumB * (1.0 - normal.a)) + (normal * 0.0);
        gl_FragColor = v_fragmentColor * normal;
    }
}
