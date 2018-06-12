// http://www.cocos2d-iphone.org

attribute vec4 a_position;

uniform vec2 []u_point_pos;
varying vec2 []v_point_pos;

void main()
{
    gl_Position = CC_MVPMatrix * a_position;
    v_point_pos = u_point_pos;
}