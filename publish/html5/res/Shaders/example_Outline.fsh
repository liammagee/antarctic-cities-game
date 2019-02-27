varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

uniform float u_threshold;
uniform vec3 u_outlineColor1;
uniform vec3 u_outlineColor2;
uniform float u_fill1;
uniform float u_fill2;
uniform float u_radius;
uniform float u_selected;
uniform vec2 resolution;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}


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

    float rnd1 = random1( st );
    float rnd2 = snoise( st );

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
        accum1 *= 0.1 + u_fill1 / 100. * 0.9 ;
        accum1.rgb = u_outlineColor1 * accum1.a;
        accum1.a *= u_fill1 / 100.;
        accum1 *= accum1 * vec4(vec3(rnd1),0.5);

        accum2 += texture2D(CC_Texture0, vec2(v_texCoord.x, v_texCoord.y));
        accum2 *= 0.1 + u_fill2 / 100. * 0.9 ;
        accum2.rgb = u_outlineColor2 * accum2.a;
        accum2.a *= u_fill2 / 100.;
        accum2 *= accum2 * vec4(vec3(rnd2),0.5);
        
        normal = accum1 + accum2;
        //normal = ( accumB * (1.0 - normal.a)) + (normal * 1.0);
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
    // gl_FragColor = v_fragmentColor * normal;
    // accum *= 1.75;
    // accum.rgb = u_outlineColor * accum.a;
    // normal = ( accum * (1.0 - normal.a)) + (normal * normal.a);
    // gl_FragColor = v_fragmentColor * normal;

    // vec4 accum = vec4(0.0);
    // accum += texture2D(CC_Texture0, vec2(v_texCoord.x, v_texCoord.y));
    // //accum *= 1.75;
    // accum *= u_fill;
    // accum.rgb = u_outlineColor * accum.a;
    
    // // normal = ( accum * (1.0 - normal.a)) + (normal * normal.a);
    // normal = accum;
    
    // //gl_FragColor = v_fragmentColor * normal;
    // gl_FragColor = normal * vec4(vec3(rnd),0.5);
}
