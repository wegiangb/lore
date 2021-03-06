const Shader = require('../Core/Shader')
const Uniform = require('../Core/Uniform')

module.exports = new Shader('smoothCircle', 2, { size: new Uniform('size', 5.0, 'float'),
                                                 cutoff: new Uniform('cutoff', 0.0, 'float'),
                                                 clearColor: new Uniform('clearColor', [1.0, 1.0, 1.0, 1.0], 'float_vec4'),
                                                 fogDensity: new Uniform('fogDensity', 6.0, 'float') }, [
    'uniform float size;',
    'uniform float cutoff;',
    'in vec3 position;',
    'in vec3 color;',
    'out vec3 vColor;',
    'out float vDiscard;',
    'vec3 floatToRgb(float n) {',
        'float b = floor(n / 65536.0);',
        'float g = floor((n - b * 65536.0) / 256.0);',
        'float r = floor(n - b * 65536.0 - g * 256.0);',
        'return vec3(r / 255.0, g / 255.0, b / 255.0);',
    '}',
    'void main() {',
        'float point_size = color.b;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        'vec4 mv_pos = modelViewMatrix * vec4(position, 1.0);',
        'vDiscard = 0.0;',
        'if(-mv_pos.z < cutoff || point_size <= 0.0 || mv_pos.z > 0.0) {',
            'vDiscard = 1.0;',
            'return;',
        '}',
        'gl_PointSize = point_size * size;',
        'vColor = floatToRgb(color.r);',
    '}'
], [
    'uniform vec4 clearColor;',
    'uniform float fogDensity;',
    'in vec3 vColor;',
    'in float vDiscard;',
    'out vec4 fragColor;',
    'void main() {',
        'if(vDiscard > 0.5) discard;',
        'float r = 0.0, delta = 0.0, alpha = 1.0;',
        'vec2 cxy = 2.0 * gl_PointCoord - 1.0;',
        'r = dot(cxy, cxy);',
        'delta = fwidth(r);',
        'alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);',
        'float z = gl_FragCoord.z / gl_FragCoord.w;',
        'float fog_factor = clamp(exp2(-fogDensity * fogDensity * z * z * 1.442695), 0.025, 1.0);',
        'fragColor = mix(clearColor, vec4(vColor, alpha), fog_factor);',
        'fragColor.a = alpha;',
        'fragColor.rgb *= fragColor.a;',
    '}'
]);
