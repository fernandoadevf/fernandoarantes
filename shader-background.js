// Shader Animation Background for About Section
import * as THREE from 'three';

export function initShaderBackground() {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    // Create container for shader
    const shaderContainer = document.createElement('div');
    shaderContainer.id = 'shader-background';
    shaderContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        overflow: hidden;
    `;

    aboutSection.style.position = 'relative';
    aboutSection.insertBefore(shaderContainer, aboutSection.firstChild);

    // Vertex shader
    const vertexShader = `
        void main() {
            gl_Position = vec4( position, 1.0 );
        }
    `;

    // Fragment shader
    const fragmentShader = `
        #define TWO_PI 6.2831853072
        #define PI 3.14159265359

        precision highp float;
        uniform vec2 resolution;
        uniform float time;

        void main(void) {
            vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
            float t = time*0.05;
            float lineWidth = 0.002;

            vec3 color = vec3(0.0);
            for(int j = 0; j < 3; j++){
                for(int i=0; i < 5; i++){
                    color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
                }
            }
            
            gl_FragColor = vec4(color[0],color[1],color[2],1.0);
        }
    `;

    // Initialize Three.js scene
    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() },
    };

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0.3); // Semi-transparent black

    shaderContainer.appendChild(renderer.domElement);

    // Handle window resize
    const onWindowResize = () => {
        const width = shaderContainer.clientWidth;
        const height = shaderContainer.clientHeight;
        renderer.setSize(width, height);
        uniforms.resolution.value.x = renderer.domElement.width;
        uniforms.resolution.value.y = renderer.domElement.height;
    };

    // Initial resize
    onWindowResize();
    window.addEventListener("resize", onWindowResize, false);

    // Parallax effect on scroll
    let scrollY = 0;
    const handleScroll = () => {
        const rect = aboutSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Calculate parallax offset based on section position
        if (rect.top < viewportHeight && rect.bottom > 0) {
            scrollY = (viewportHeight - rect.top) / viewportHeight;
            shaderContainer.style.transform = `translateY(${scrollY * 50}px)`;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animation loop
    let animationId;
    const animate = () => {
        animationId = requestAnimationFrame(animate);
        uniforms.time.value += 0.05;
        renderer.render(scene, camera);
    };

    // Start animation
    animate();

    // Cleanup function (if needed later)
    return () => {
        window.removeEventListener("resize", onWindowResize);
        window.removeEventListener("scroll", handleScroll);
        cancelAnimationFrame(animationId);

        if (shaderContainer && renderer.domElement) {
            shaderContainer.removeChild(renderer.domElement);
        }

        renderer.dispose();
        geometry.dispose();
        material.dispose();
    };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initShaderBackground);
