import * as THREE from 'three';

function main() {

    // Canvas and Renderer
    const canvas = document.querySelector('#canvas');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);

    // Camera Setup
    const fov = 90;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    const scene = new THREE.Scene();

    // Light
    {

        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-2, 1, 3);
        scene.add(light);

    }

    // Build Box
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const box = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // Dodecahedron
    const dode = new THREE.DodecahedronGeometry(0.75);
    
    // Cylinder
    const cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 15);

    const cubes = [];

    const dodes = [
        makeInstance(dode, 0x00FFFF, -2)
    ];

    const cylinders = [
        makeInstance(cylinder, 0x44aa88, 0)
    ];

    // Adding Texture to cube
    const loader = new THREE.TextureLoader;

    // Load each side's texture
    const materials = [
        new THREE.MeshBasicMaterial( {map: loadTexture('bulbasaur.jpg')} ),
        new THREE.MeshBasicMaterial( {map: loadTexture('totodile.jpg')} ),
        new THREE.MeshBasicMaterial( {map: loadTexture('torchic.jpg')} ),
        new THREE.MeshBasicMaterial( {map: loadTexture('turtwig.jpg')} ),
        new THREE.MeshBasicMaterial( {map: loadTexture('oshawott.jpg')} ),
        new THREE.MeshBasicMaterial( {map: loadTexture('chespin.jpg')} ),
    ];

	const cube = new THREE.Mesh(box, materials);
    cube.position.x = 2;
	scene.add(cube);
	cubes.push(cube); // add to our list of cubes to rotate

    // Function to help with loading different textures per cube side
    function loadTexture(path) {
        const texture = loader.load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    // Function to generate shapes with a given geometry, color, and x position 
    function makeInstance(geometry, color, x) {

        const material = new THREE.MeshPhongMaterial({ color });

        const shape = new THREE.Mesh(geometry, material);

        scene.add(shape);

        shape.position.x = x;

        return shape;

    }

    // Function to render the spinning of cubes
    function render(time) {

        time *= 0.001; // convert time to seconds

        cubes.forEach((shape, ndx) => {

            const speed = 1 + ndx * .1;
            const rot = time * speed;
            shape.rotation.x = rot;
            shape.rotation.y = rot;

        });

        dodes.forEach((shape, ndx) => {

            const speed = 10 + ndx * .1;
            const rot = time * speed;
            shape.rotation.x = rot;
            shape.rotation.y = rot;

        });
        
        cylinders.forEach((shape, ndx) => {
            const speed = 0.2 + ndx * .05;
            const rot = time * speed + 5;
            shape.rotation.x = rot * 2;
            shape.rotation.y = rot * 10;

        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }

    requestAnimationFrame(render);

}

main();
