// battlesManager.js
// Handles elements related to the interactive part of this project
// Includes: HP (Hitpoints) Management, Player Turns, Battle Clicking

import * as THREE from 'three';

let raycasterEnabled = true;
let damage0 = 0;
let damage1 = 0;

let poke1 = '';
let poke2 = '';
let attack0 = -1;
let attack1 = -1;
let player = 0;
let activeTurn = 0;

const movesets = {
  'Absol' : ['Slash', 'Psycho Cut', 'Aerial Ace', 'Stone Edge'],
  'Aggron' : ['Strength', 'Iron Head', 'Stone Edge', 'Earthquake'],
  'Altaria' : ['Dragon Claw', 'Steel Wing', 'Moonblast', 'Aerial Ace'],
  'Armaldo' : ['X-Scissor', 'Slash', 'Rock Slide', 'Earthquake'],
  'Blaziken' : ['Blaze Kick', 'Sky Uppercut', 'Slash', 'Brave Bird'],
  'Dragonite' : ['Thunder Punch', 'Ice Beam', 'Dragon Claw', 'Earthquake'],
  'Exploud' : ['Boomburst', 'Crunch', 'Ice Fang', 'Surf'],
  'Ludicolo' : ['Giga Drain', 'Ice Beam', 'Surf', 'Fake Out'],
  'Ludicolo1' : ['Giga Drain', 'Ice Beam', 'Surf', 'Fake Out'],
  'Ludicolo2' : ['Giga Drain', 'Ice Beam', 'Surf', 'Fake Out'],
  'Ludicolo3' : ['Giga Drain', 'Ice Beam', 'Surf', 'Fake Out'],
  'Slaking' : ['Hammer Arm', 'Earthquake', 'Shadow Claw', 'Giga Impact'],
};

const weaknesses = {
  'Absol' : ['Fighting', 'Bug', 'Fairy'],
  'Aggron' :['Fighting', 'Ground', 'Water'],
  'Altaria' : ['Ice', 'Rock', 'Dragon', 'Fairy'],
  'Armaldo' : ['Rock', 'Steel', 'Water'],
  'Blaziken' : ['Flying', 'Ground', 'Water', 'Psychic'],
  'Dragonite' : ['Ice', 'Rock', 'Dragon', 'Fairy'],
  'Exploud' : ['Fighting'],
  'Ludicolo' : ['Flying', 'Poison', 'Bug'],
  'Ludicolo1' : ['Flying', 'Poison', 'Bug'],
  'Ludicolo2' : ['Flying', 'Poison', 'Bug'],
  'Ludicolo3' : ['Flying', 'Poison', 'Bug'],
  'Slaking' : ['Fighting'],
}


const resistances = {
  'Absol' : ['Ghost', 'Dark'],
  'Aggron' : ['Rock', 'Bug', 'Psychic', 'Ice', 'Dragon', 'Fairy'],
  'Altaria' : ['Fighting', 'Bug', 'Fire', 'Water'],
  'Armaldo' : ['Normal', 'Poison'],
  'Blaziken' : ['Steel', 'Fire', 'Grass', 'Ice', 'Dark'],
  'Dragonite' : ['Fighting', 'Bug', 'Fire', 'Water'],
  'Exploud' : [],
  'Ludicolo' : ['Ground', 'Steel'],
  'Ludicolo1' : ['Ground', 'Steel'],
  'Ludicolo2' : ['Ground', 'Steel'],
  'Ludicolo3' : ['Ground', 'Steel'],
  'Slaking' : []
}

// Format
// [HP, Physical Atk, Special Atk, Phys Defense, Special Defense, Speed]
const stats = {
  'Absol' : [240, 238, 112, 139, 112, 139],
  'Aggron' :[250, 202, 328, 112, 112, 94],
  'Altaria' : [260, 130, 166, 130, 193, 148],
  'Armaldo' : [260, 229, 184, 130, 148, 85],
  'Blaziken' : [270, 220, 130, 202, 130, 148],
  'Dragonite' : [292, 245, 175, 184, 184, 148],
  'Exploud' : [318, 168, 117, 168, 135, 126],
  'Ludicolo' : [270, 130, 130, 166, 184, 130],
  'Ludicolo1' : [270, 130, 130, 166, 184, 130],
  'Ludicolo2' : [255, 140, 130, 166, 184, 133],
  'Ludicolo3' : [270, 120, 135, 170, 180, 135],
  'Slaking' : [410, 292, 184, 175, 121, 284]
}

// Format
// [Type, Power, Accuracy, Recoil %, Healing %, Physical(0)/Special(1)]
const moveStats = {
  'Aerial Ace' : ['Flying', 60, 101, 0, 0, 0],
  'Blaze Kick' : ['Fire', 85, 90, 0, 0, 0],
  'Boomburst' : ['Normal', 140, 100, 0, 0, 1],
  'Brave Bird' : ['Flying', 120, 100, 0.33, 0, 0],
  'Crunch' : ['Dark', 80, 100, 0, 0, 0],
  'Dragon Claw' : ['Dragon', 80, 100, 0, 0, 0],
  'Earthquake' : ['Earthquake', 100, 100, 0, 0, 0],
  'Fake Out' : ['Normal', 40, 100, 0, 0, 0],
  'Giga Drain' : ['Grass', 75, 100, 0, 50, 1],
  'Giga Impact' : ['Normal', 150, 90, 0, 0, 0],
  'Hammer Arm' : ['Fighting', 100, 90, 0, 0, 0],
  'Ice Beam' : ['Ice', 90, 100, 0, 0, 1],
  'Ice Fang' : ['Ice', 65, 95, 0, 0, 0],
  'Iron Head' : ['Steel', 80, 100, 0, 0, 0],
  'Moonblast' : ['Fairy', 95, 100, 0, 0, 1],
  'Psycho Cut' : ['Psychic', 70, 100, 0, 0, 0],
  'Rock Slide' : ['Rock', 75, 90, 0, 0, 0],
  'Shadow Claw' : ['Ghost', 70, 100, 0, 0, 0],
  'Sky Uppercut' : ['Fighting', 85, 90, 0, 0, 0],
  'Slash' : ['Normal', 70, 100, 0, 0, 0],
  'Steel Wing' : ['Steel', 70, 90, 0, 0, 0],
  'Stone Edge' : ['Rock', 10, 80, 0, 0, 0],
  'Strength' : ['Normal', 80, 100, 0, 0, 0],
  'Surf' : ['Water', 90, 100, 0, 0, 1],
  'Thunder Punch' : ['Electric', 75, 100, 0, 0, 0],
  'X-Scissor' : ['Bug', 80, 100, 0, 0, 0]
}

function createHPBar(maxHP) {
  // Store HP Values
  const currentHP = maxHP;

  // Create Outline
  const outlineGeometry = new THREE.PlaneGeometry(1 + maxHP * 0.001, 0.15); // Want the HP Bar to reflect max HP
  const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);

  // Create Real HP Bar
  const hpBarGeometry = new THREE.PlaneGeometry(1 + maxHP * 0.001, 0.15);
  const hpBarMaterial = new THREE.MeshBasicMaterial({ color: 0x66923d });
  const hpBar = new THREE.Mesh(hpBarGeometry, hpBarMaterial);

  // hpBar Positioning
  hpBar.position.z = 0.01;
  hpBar.position.x = -(1 + maxHP * 0.001) * 0.5;
  hpBar.geometry.translate( (1 + maxHP * 0.001) * 0.5, 0, 0);
  hpBar.scale.x = 1;

  // Building Container
  const hpBarGroup = new THREE.Group();
  hpBarGroup.add(outline);
  hpBarGroup.add(hpBar);
  hpBarGroup.maxHP = maxHP;
  hpBarGroup.currentHP = currentHP;
  hpBarGroup.hpSize = 1;
  hpBarGroup.hpBar = hpBar; // I want to be able to modify this based on current HP

  return hpBarGroup;
}

function updateHPBar(bar, damageDealt) {
  const newHP = bar.currentHP - damageDealt;

  if (newHP <= 0) {
    bar.hpBar.currentHP = 0;
    bar.hpBar.material.color.set(0x000000);
  } else if (newHP <= bar.maxHP * .2) {
    bar.hpBar.material.color.set(0xff0000)
  } else if (newHP <= bar.maxHP * 0.5) {
    bar.hpBar.material.color.set(0xffdc09)
  }
  
  console.log(newHP / bar.maxHP);
  bar.hpBar.scale.x = 1 * (newHP / bar.maxHP);
  bar.currentHP = newHP;

  return;
}

function whichPoke() {
  if (player == 0) {
    return poke1.name;
  }
  
  return poke2.name;
}

function handleAttack(attack) {
  let poke = whichPoke();
  console.log(poke);

  if (player == 0) {
    if (attack == 1) {
      attack0 = movesets[poke][0];
    } else if (attack == 2) {
      attack0 = movesets[poke][1];
    } else if (attack == 3) {
      attack0 = movesets[poke][2];
    } else {
      attack0 = movesets[poke][3];
    }
    console.log('Attack: ' + attack0);
  } else {
    if (attack == 1) {
      attack1 = movesets[poke][0];
    } else if (attack == 2) {
      attack1 = movesets[poke][1];
    } else if (attack == 3) {
      attack1 = movesets[poke][2];
    } else {
      attack1 = movesets[poke][3];
    }
    console.log('Attack: ' + attack1);
  }

  calculateDamage();
  closeMenu();
}

function calculateDamage() {
  let poke = whichPoke();

  // Determine if using physical or special

  let damage = (2 * 100) / 5 + 2;
}

function initTurn(p1, p2, p) {
  console.log("HELLO");
  poke1 = p1;
  poke2 = p2;
  player = p;
  openMenu();
  console.log(player);
}

function switchTurn(turn) {
  player = (turn === 0) ? 1 : 0;
  activeTurn = player;
}

// Menu Handling
function openMenu() {
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('menu').style.display = 'block';
  raycasterEnabled = false;
}

function closeMenu() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('menu').style.display = 'none';
  document.getElementById('attackMenu').style.display = 'none';
  switchTurn();
  raycasterEnabled = true;
}

  
function showAttackOrStats(option) {
  if (option === 'attack') {
    document.getElementById('attackMenu').style.display = 'block';
  } else if (option === 'stats') {
    console.log('Stats Menu');
  }
}

export { createHPBar, updateHPBar, initTurn, openMenu, closeMenu, showAttackOrStats, handleAttack, raycasterEnabled, damage0, damage1, activeTurn };