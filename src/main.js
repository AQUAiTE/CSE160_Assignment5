import * as THREE from 'three';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/Addons.js';
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
    const groundTexture = loader.load('PokeFloor.png');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.magFilter = THREE.NearestFilter;
    groundTexture.colorSpace = THREE.SRGBColorSpace;
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
    let spotColor = 0x5EA8BA; // Bluish Gray
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
    gui.add(spotLight, 'intensity', 0, 200, 1);
    gui.add(new DegRadHelper(spotLight, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
    gui.add(spotLight, 'penumbra', 0, 1, 0.01);
    makeXYZGUI(gui, spotLight.position, 'position', updateLight);
    makeXYZGUI(gui, spotLight.target.position, 'target', updateLight);
}

function loadCustomObjs(scene, mtlURL, objURL, scale, x, z, rotate) {
    let root;
    const mtlLoader = new MTLLoader();

    mtlLoader.load(mtlURL, (mtl) => {
        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load(objURL, (loadedRoot) => {
            root = loadedRoot;
            root.position.x += x;
            root.position.y += 0.01;
            root.position.z += z;
            root.scale.set(scale, scale, scale);
            root.rotation.set(0.0, rotate, 0.0);
            scene.add(root);
        });
    } );

}

function loadGLTFObj(scene, gltfURL, scale, x, z, rotate) {
    const loader = new GLTFLoader();
    loader.load(gltfURL, (gltf) => {
        const root = gltf.scene;
        root.position.x += x;
        root.position.z += z;
        root.scale.set(scale, scale, scale);
        root.rotation.set(Math.PI / 2, 0.0, rotate);
        scene.add(root);
    }, undefined, (error) => {
        console.error('An error happened while loading the GLTF model', error);
    });
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
    camera.position.set(0, 5, 13);

    useGUI(camera);
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

    // Scene and Lighting
    const scene = new THREE.Scene();
    handleLighting(scene);

    // Loader for any textures
    const loader = new THREE.TextureLoader;

    // Build Box
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const box = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // Dodecahedron
    const dode = new THREE.DodecahedronGeometry(0.75);
    
    // Cylinder
    const cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 15);

    const cubes = [

    ];
    const scoreboardTexture = loadTexture('scoreboard.png');
    const scoreboard = new THREE.Mesh(
        new THREE.BoxGeometry(20, 8, 2),
        [
            new THREE.MeshPhongMaterial({color: 0x0000FF}),
            new THREE.MeshPhongMaterial({color: 0x0000FF}),
            new THREE.MeshPhongMaterial({color: 0x0000FF}),
            new THREE.MeshPhongMaterial({color: 0x0000FF}),
            new THREE.MeshPhongMaterial({color: scoreboardTexture}),
            new THREE.MeshPhongMaterial({color: 0x0000FF}),
        ]
    );
    scoreboard.position.y = 9.05;
    scoreboard.position.z = -9.5;
    scene.add(scoreboard);


    const dodes = [
        makeInstance(dode, 0x00FFFF, -2, 2.5, 0)
    ];
    scene.add(dodes[0]);

    const cylinders = [
        makeInstance(cylinder, 0x44aa88, 9.5, 2.525, -9.5),
        makeInstance(cylinder, 0x44aa88, -9.5, 2.525, -9.5)
    ];
    cylinders[0].scale.set(2, 5, 2);
    cylinders[1].scale.set(2, 5, 2);
    scene.add(cylinders[0]);
    scene.add(cylinders[1]);

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
    loadCustomObjs(scene, 'Ludicolo_Model/M/Ludicolo_M.mtl', 'Ludicolo_Model/M/Ludicolo_M.obj', 2.5, -1.5, 1.5, Math.PI / 2);
    loadCustomObjs(scene, 'Ludicolo_Model/M/Ludicolo_M.mtl', 'Ludicolo_Model/M/Ludicolo_M.obj', 2.5, 1.5, 1.5, 3 * Math.PI / 2);
    loadCustomObjs(scene, 'MirorB_Model/model.mtl', 'MirorB_Model/model.obj', 0.13, -7.5, -2.0, Math.PI / 2.5);
    loadGLTFObj(scene, 'Serena_Model/Pokemon XY/Serena/Serena.glb', 0.025, 7.5, 4.0, 3 * Math.PI / 4);

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



    // In Main Functions ===================================================================================================================
    // Function to help with loading different textures per cube side
    function loadTexture(path) {
        const texture = loader.load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    // Function to generate shapes with a given geometry, color, and x position 
    function makeInstance(geometry, color, x, y, z) {

        const material = new THREE.MeshPhongMaterial({ color });

        const shape = new THREE.Mesh(geometry, material);

        shape.position.x += x;

        shape.position.y += y;

        shape.position.z += z;

        return shape;

    }

    // Function to render the spinning of cubes
    function render(time) {

        time *= 0.001; // convert time to seconds

        /*cubes.forEach((shape, ndx) => {

            const speed = 1 + ndx * .1;
            const rot = time * speed;
            shape.rotation.x = rot;
            shape.rotation.y = rot;

        });*/

        /*dodes.forEach((shape, ndx) => {

            const speed = 10 + ndx * .1;
            const rot = time * speed;
            shape.rotation.x = rot;
            shape.rotation.y = rot;

        });*/
        
        cylinders.forEach((shape, ndx) => {
            const speed = 0.2 + ndx * .05;
            const rot = time * speed + 5;
            shape.rotation.y = rot * 10;

        });

        /*if (root) {
            const speed = 1.5; // Adjust the speed of rotation as needed
            const rot = time * speed;
            root.rotation.x = rot;
            root.rotation.y = rot;
        }*/

        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }
    
    requestAnimationFrame(render);

}

main();
