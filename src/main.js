import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { cameraGUI } from './cameraGUI.js';
import { createHPBar, updateHPBar } from './battleManager.js';

function updateCamera(c) {
    c.updateProjectionMatrix();
}

function useGUI(c) {
    const gui = new GUI();
    gui.add(c, 'fov', 15, 120).onChange(updateCamera.bind(null, c));
    const guiControl = new cameraGUI(c, 'near', 'far', 0.1);
    gui.add(guiControl, 'min', 0.1, 50, 0.1 ).name( 'near' ).onChange(updateCamera.bind(null, c));
	gui.add(guiControl, 'max', 0.1, 50, 0.1 ).name( 'far' ).onChange(updateCamera.bind(null, c));
}

function buildGround(loader) {
    const planeSize = 20;
    const groundTexture = loader.load('images/PokeFloor.png');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.magFilter = THREE.NearestFilter;
    groundTexture.colorSpace = THREE.SRGBColorSpace;
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial( {
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
    const groundColor = 0xC2B280; // Gray
    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(hemiLight);

    // Spotlight Light
    let spotColor = 0xFFFFFF; // White
    intensity = 150;
    const spotLight = new THREE.SpotLight(spotColor, intensity);
    spotLight.position.set(0, 7.25, 1.14);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);
}

function loadCustomObjs(scene, mtlURL, objURL, scale, x, z, rotate) {
    return new Promise((resolve, reject) => {
        const mtlLoader = new MTLLoader();
        mtlLoader.load(mtlURL, (mtl) => {
            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load(objURL, (loadedRoot) => {
                loadedRoot.position.set(x, 0.01, z);
                loadedRoot.scale.set(scale, scale, scale);
                loadedRoot.rotation.set(0.0, rotate, 0.0);
                scene.add(loadedRoot);
                resolve(loadedRoot); // Resolve the promise with the loaded object
            });
        }, undefined, reject); // Reject the promise if there's an error
    });
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

function buildPokeball(scene, pokeballs, pokeballTexture, x, y, z) {
    const sphere = new THREE.SphereGeometry(0.5, 32, 16);
    const pokeball = new THREE.Mesh(sphere, pokeballTexture);
    pokeball.position.x = x;
    pokeball.position.y = y;
    pokeball.position.z = z;
    pokeball.rotation.y = 3 * Math.PI / 2;
    pokeballs.push(pokeball);
    scene.add(pokeball);
}

async function main() {
    const teamMirorB = [];
    const teamSerena = [];
    const pokePositions = [];
    const pokeNames = ['Ludicolo', 'Absol', 'Altaria', 'Blaziken', 'Slaking', 'Aggron', 'Ludicolo1', 'Ludicolo2', 'Armaldo', 'Dragonite', 'Exploud', 'Ludicolo3'];

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

    const loader = new THREE.TextureLoader;

    // Initialize default shapes
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const box = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    //const dode = new THREE.DodecahedronGeometry(0.75);
    const cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 15);

    const cylinders = [];
    const cubes = [];
    const pokeballs = [];

    // Build Ground, Skybox, Scoreboard
    const scoreboardTexture = loadTexture('images/pokeScoreboard.jpg');
    const scoreboard = new THREE.Mesh(
        new THREE.BoxGeometry(20, 8, 2),
        [
            new THREE.MeshPhongMaterial( {color: 0x0000FF} ),
            new THREE.MeshPhongMaterial( {color: 0x0000FF} ),
            new THREE.MeshPhongMaterial( {color: 0x0000FF} ),
            new THREE.MeshPhongMaterial( {color: 0x0000FF} ),
            new THREE.MeshPhongMaterial( {map: scoreboardTexture} ),
            new THREE.MeshPhongMaterial( {color: 0x0000FF} ),
        ]
    );
    scoreboard.position.y = 9.05;
    scoreboard.position.z = -9.5;
    scene.add(scoreboard);

    {
        const backgroundTexture = loader.load(
            'images/PokeCenter.png',
            () => {
                backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;
                backgroundTexture.magFilter = THREE.SRGBColorSpace;
                scene.background = backgroundTexture;
            });
    }

    let mesh = buildGround(loader);
    scene.add(mesh);

    // Pillars for Scoreboard
    cylinders.push(makeInstance(cylinder, 0x44aa88, 9.5, 2.525, -9.5));
    cylinders.push(makeInstance(cylinder, 0x44aa88, -9.5, 2.525, -9.5));
    cylinders[0].scale.set(2, 5, 2);
    cylinders[1].scale.set(2, 5, 2);
    scene.add(cylinders[0]);
    scene.add(cylinders[1]);

    // Pokeballs on Scoreboard
    const pokeballTexture = new THREE.MeshPhongMaterial( {map: loadTexture('images/pokeball.png')} );
    buildPokeball(scene, pokeballs, pokeballTexture, -8.65, 12.3, -8.2);
    buildPokeball(scene, pokeballs, pokeballTexture, -8.65, 11.0, -8.2);
    buildPokeball(scene, pokeballs, pokeballTexture, -8.65, 9.7, -8.2);
    buildPokeball(scene, pokeballs, pokeballTexture, -8.65, 8.4, -8.2);
    buildPokeball(scene, pokeballs, pokeballTexture, -8.65, 7.1, -8.2);
    buildPokeball(scene, pokeballs, pokeballTexture, -8.65, 5.85, -8.2);
    // Right Side
    buildPokeball(scene, pokeballs, pokeballTexture, 8.65, 12.3, -8.2);
    buildPokeball(scene, pokeballs, pokeballTexture, 8.65, 11.0, -8.2);
    buildPokeball(scene, pokeballs, pokeballTexture, 8.65, 9.7, -8.2);
    buildPokeball(scene, pokeballs, pokeballTexture, 8.65, 8.4, -8.2);
    buildPokeball(scene, pokeballs, pokeballTexture, 8.65, 7.1, -8.2);
    buildPokeball(scene, pokeballs, pokeballTexture, 8.65, 5.85, -8.2);

    // Build PokeCube
    const materials = [
        new THREE.MeshPhongMaterial( {map: loadTexture('images/bulbasaur.jpg')} ),
        new THREE.MeshPhongMaterial( {map: loadTexture('images/totodile.jpg')} ),
        new THREE.MeshPhongMaterial( {map: loadTexture('images/torchic.jpg')} ),
        new THREE.MeshPhongMaterial( {map: loadTexture('images/turtwig.jpg')} ),
        new THREE.MeshPhongMaterial( {map: loadTexture('images/oshawott.jpg')} ),
        new THREE.MeshPhongMaterial( {map: loadTexture('images/chespin.jpg')} ),
    ];

    // Create PokeCube
	const cube = new THREE.Mesh(box, materials);
    cube.position.x = -9.5;
    cube.position.y = 0.55;
    cube.position.z = 9.5;
	scene.add(cube);
	cubes.push(cube);

    // Loading Pokemon Models Async
    // Reason: I want to be able to tie other elements to their models later
    const promisedPokes = [
        // Adding 3D Pokemon Models
        // Serena's Team
        loadCustomObjs(scene, 'Ludicolo_Model/M/Ludicolo_M.mtl', 'Ludicolo_Model/M/Ludicolo_M.obj', 2.5, 1.5, 1.5, 3 * Math.PI / 2),
        loadCustomObjs(scene, 'Absol/Normal/Absol_Normal.mtl', 'Absol/Normal/Absol_Normal.obj', 3.0, 5.5, -3.5, 7 * Math.PI / 4),
        loadCustomObjs(scene, 'Altaria/Normal/Altaria_Normal.mtl', 'Altaria/Normal/Altaria_Normal.obj', 2.5, 5.5, -0.5, 11 * Math.PI / 7),
        loadCustomObjs(scene, 'Blaziken/Mega/Blaziken_Mega.mtl', 'Blaziken/Mega/Blaziken_Mega.obj', 2.5, 5.5, 2.0, 3 * Math.PI / 2),
        loadCustomObjs(scene, 'Slaking/Slaking.mtl', 'Slaking/Slaking.obj', 2.5, 5.5, 4.75, 4 * Math.PI / 3),
        loadCustomObjs(scene, 'Aggron/Normal/Aggron_Normal.mtl', 'Aggron/Normal/Aggron_Normal.obj', 2.5, 5.5, 7.5, 5 * Math.PI / 4),

        // Miror B's Team
        loadCustomObjs(scene, 'Ludicolo_Model/M/Ludicolo_M.mtl', 'Ludicolo_Model/M/Ludicolo_M.obj', 2.5, -1.5, 1.5, Math.PI / 2),
        loadCustomObjs(scene, 'Ludicolo_Model/M/Ludicolo_M.mtl', 'Ludicolo_Model/M/Ludicolo_M.obj', 2.5, -4.5, -3.5, Math.PI / 4),
        loadCustomObjs(scene, 'Armaldo/Armaldo.mtl', 'Armaldo/Armaldo.obj', 2.5, -4.5, -0.5, Math.PI / 3),
        loadCustomObjs(scene, 'Dragonite/Dragonite.mtl', 'Dragonite/Dragonite.obj', 2.5, -4.5, 2.0, Math.PI / 2),
        loadCustomObjs(scene, 'Exploud/Exploud.mtl', 'Exploud/Exploud.obj', 2.5, -4.5, 4.75, 11 * Math.PI / 18),
        loadCustomObjs(scene, 'Ludicolo_Model/M/Ludicolo_M.mtl', 'Ludicolo_Model/M/Ludicolo_M.obj', 2.5, -4.5, 7.5, 3 * Math.PI / 4)
    ];

    const loadedPokes = await Promise.all(promisedPokes);
    loadedPokes.forEach((poke, index) => {
        const pos = new THREE.Vector3();
        poke.name = pokeNames[index];
        if (index < 6) {
            teamSerena.push(poke);
        } else {
            teamMirorB.push(poke);
        }
        pokePositions.push(poke.getWorldPosition(pos));
    });

    // Trainer Models
    loadCustomObjs(scene, 'MirorB_Model/model.mtl', 'MirorB_Model/model.obj', 0.13, -7.5, 4.5, 11 * Math.PI / 17);
    loadGLTFObj(scene, 'Serena_Model/Pokemon XY/Serena/Serena.glb', 0.025, 7.5, -2.0, Math.PI / 4);

    // Battle Sequence ===================================================================================================================

    // Initialize Current Pokemon Battling
    let currentPokeSerena = 0;
    let currentPokeMirorB = 0;

    const serenaHP = createHPBar(300);
    const mirorBHP = createHPBar(200);
    

    teamSerena[currentPokeSerena].add(serenaHP);
    teamMirorB[currentPokeMirorB].add(mirorBHP);

    serenaHP.position.set(0, 1.5, 0);
    mirorBHP.position.set(0, 1.5, 0);

    updateHPBar(serenaHP, 150);
    updateHPBar(mirorBHP, 165);

    // In Main Functions ===================================================================================================================
    // Function to help with loading different textures per cube side
    function loadTexture(path) {
        const texture = loader.load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    // Function to generate shapes with a given geometry, color, and x position 
    function makeInstance(geometry, color, x, y, z) {

        const material = new THREE.MeshPhongMaterial( { color } );

        const shape = new THREE.Mesh(geometry, material);

        shape.position.x += x;

        shape.position.y += y;

        shape.position.z += z;

        return shape;

    }

    // Function to render the spinning of cubes
    function render(time) {

        time *= 0.001; // convert time to seconds

        pokeballs.forEach((shape, ndx) => {
            let speed;
            if (ndx < 6) {
                speed = 1.8;
            } else {
                speed = 1.0;
            }
            const rot = time * speed;
            shape.rotation.y = rot;
        });
        
        cylinders.forEach((shape, ndx) => {
            const speed = 0.2 + ndx * .05;
            const rot = time * speed + 5;
            shape.rotation.y = rot * 10;
        });

        updateHPBarFacingCamera(serenaHP, camera);
        updateHPBarFacingCamera(mirorBHP, camera);

        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }
    
    requestAnimationFrame(render);

}

function updateHPBarFacingCamera(hpBar, camera) {
    // Get the direction from the HP bar to the camera
    const direction = new THREE.Vector3();
    camera.getWorldPosition(direction);

    // Apply rotation to face the camera
    hpBar.lookAt(direction);
}

main();
