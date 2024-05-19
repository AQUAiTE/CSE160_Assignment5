import * as THREE from 'three';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import { OrbitControls} from 'three/examples/jsm/Addons.js';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js';
import {cameraGUI} from './cameraGUI.js';

class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

class DegRadHelper {
    constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop;
    }
    get value() {
        return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
        this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
}

function updateCamera(c) {
    c.updateProjectionMatrix();
}

function useGUI(c) {
    const gui = new GUI();
    gui.add(c, 'fov', 45, 180).onChange(updateCamera.bind(null, c));
    const guiControl = new cameraGUI(c, 'near', 'far', 0.1);
    gui.add(guiControl, 'min', 0.1, 50, 0.1 ).name( 'near' ).onChange(updateCamera.bind(null, c));
	gui.add(guiControl, 'max', 0.1, 50, 0.1 ).name( 'far' ).onChange(updateCamera.bind(null, c));
}

function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
    folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
    folder.open();
  }

function buildGround(loader) {
    const planeSize = 20;
    const groundTexture = loader.load('checker.png');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.magFilter = THREE.NearestFilter;
    groundTexture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    groundTexture.repeat.set(repeats, repeats);
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
        map: groundTexture,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    return mesh;
}

function handleLighting(scene) {
    // Directional Light
    const color = 0xFFFFFF;
    let intensity = 2.5;
    const dirLight = new THREE.DirectionalLight(color, intensity);
    dirLight.position.set(6, 9.5, 4);
    dirLight.target.position.set(0.66, 0, -0.58);
    scene.add(dirLight);
    scene.add(dirLight.target);

    // Hemisphere Light
    intensity = 1;
    const skyColor = 0x00FFFF; // Aqua
    const groundColor = 0x849fb3; // Gray
    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(hemiLight);

    // Spotlight Light
    let spotColor = 0xFFFFFF; // Yelow
    intensity = 100;
    const spotLight = new THREE.SpotLight(spotColor, intensity);
    spotLight.position.set(0, 5, 1.14);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    const helper = new THREE.SpotLightHelper(spotLight);
    scene.add(helper); 

    function updateLight() {
        spotLight.target.updateMatrixWorld();
        helper.update();
      }
    updateLight();

    const gui = new GUI();
    gui.addColor(new ColorGUIHelper(spotLight, 'color'), 'value').name('color');
    gui.add(spotLight, 'intensity', 0, 2, 0.01);
    gui.add(new DegRadHelper(spotLight, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
    gui.add(spotLight, 'penumbra', 0, 1, 0.01);
    makeXYZGUI(gui, spotLight.position, 'position', updateLight);
    makeXYZGUI(gui, spotLight.target.position, 'target', updateLight);
}

function main() {

    // Canvas and Renderer
    const canvas = document.querySelector('#canvas');
    const renderer = new THREE.WebGLRenderer( {
		canvas,
		alpha: true,
		antialias: true
	} );
    renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);

    // Camera Setup
    const fov = 80;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 5, 2);

    useGUI(camera);
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

    // Scene and Lighting
    const scene = new THREE.Scene();
    handleLighting(scene);

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
        makeInstance(dode, 0x00FFFF, -2, 2.5)
    ];

    const cylinders = [
        makeInstance(cylinder, 0x44aa88, 0, 0.55)
    ];

    // Loader for any textures
    const loader = new THREE.TextureLoader;

    // Build Ground Plane
    let mesh = buildGround(loader);
    scene.add(mesh);

    // Build PokeCube
    const materials = [
        new THREE.MeshPhongMaterial( {map: loadTexture('bulbasaur.jpg')} ),
        new THREE.MeshPhongMaterial( {map: loadTexture('totodile.jpg')} ),
        new THREE.MeshPhongMaterial( {map: loadTexture('torchic.jpg')} ),
        new THREE.MeshPhongMaterial( {map: loadTexture('turtwig.jpg')} ),
        new THREE.MeshPhongMaterial( {map: loadTexture('oshawott.jpg')} ),
        new THREE.MeshPhongMaterial( {map: loadTexture('chespin.jpg')} ),
    ];

	const cube = new THREE.Mesh(box, materials);
    cube.position.x = 2;
    cube.position.y = 2.5;
	scene.add(cube);
	cubes.push(cube); // add to our list of cubes to rotate

    // Adding Custom 3D Object
    let root;
    const mtlLoader = new MTLLoader();
    mtlLoader.load('Ludicolo_Model/M/Ludicolo_M.mtl', (mtl) => {
        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load('Ludicolo_Model/M/Ludicolo_M.obj', (loadedRoot) => {
            root = loadedRoot;
            root.position.y = 2.0;
            scene.add(root);
        });
    } );

    // Background Cubemap
    {
        const backgroundTexture = loader.load(
            'PokeCenter.png',
            () => {
                backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;
                backgroundTexture.magFilter = THREE.SRGBColorSpace;
                scene.background = backgroundTexture;
            });
    }

    // Function to help with loading different textures per cube side
    function loadTexture(path) {
        const texture = loader.load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    // Function to generate shapes with a given geometry, color, and x position 
    function makeInstance(geometry, color, x, y) {

        const material = new THREE.MeshPhongMaterial({ color });

        const shape = new THREE.Mesh(geometry, material);

        scene.add(shape);

        shape.position.x = x;

        shape.position.y = shape.position.y + y;

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
            shape.rotation.y = rot * 10;

        });

        if (root) {
            const speed = 1.5; // Adjust the speed of rotation as needed
            const rot = time * speed;
            root.rotation.x = rot;
            root.rotation.y = rot;
        }

        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }
    
    requestAnimationFrame(render);

}

main();
