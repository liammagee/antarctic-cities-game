#ifdef GL_ES
precision highp float;
#endif

uniform vec2 center;
uniform vec2 resolution;

varying vec2 []v_point_pos;

void main(void)
{
    vec2 p = 2.0 * (gl_FragCoord.xy - center.xy) / resolution.xy;
	p.x *= resolution.x/resolution.y;

	float co = 0.0;
	vec2 ppp = vec2(50.0, 50.0);
	float dist = sqrt(pow(float(gl_FragCoord.x) - float(ppp.x), 2.0) + pow(float(gl_FragCoord.y) - float(ppp.y), 2.0));
	float diag = sqrt(pow(float(resolution.x), 2.0) + pow(float(resolution.y), 2.0));
	dist = dist / diag;
	//float dist = sqrt(pow(float(gl_FragCoord.x) - float(v_point_pos.x), 2.0) + pow(float(gl_FragCoord.y) - float(v_point_pos.y), 2.0));
	dist = (gl_FragCoord.x - center.x) / 256.0;
	co = 1.0 - dist;
	gl_FragColor = vec4( co, 0.0, 0.0,
						1.0 );
}