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
let hp1 = -1;
let hp2 = -1;
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
  'Aggron' :['Water'],
  'Altaria' : ['Rock', 'Dragon', 'Fairy'],
  'Armaldo' : ['Rock', 'Steel', 'Water'],
  'Blaziken' : ['Flying', 'Ground', 'Water', 'Psychic'],
  'Dragonite' : ['Rock', 'Dragon', 'Fairy'],
  'Exploud' : ['Fighting'],
  'Ludicolo' : ['Flying', 'Poison', 'Bug'],
  'Ludicolo1' : ['Flying', 'Poison', 'Bug'],
  'Ludicolo2' : ['Flying', 'Poison', 'Bug'],
  'Ludicolo3' : ['Flying', 'Poison', 'Bug'],
  'Slaking' : ['Fighting'],
}

const doubleWeaknesses = {
  'Absol' : [],
  'Aggron' : ['Fighting', 'Ground'],
  'Altaria' : ['Ice'],
  'Armaldo' : [],
  'Blaziken' : [],
  'Dragonite' : ['Ice'],
  'Exploud' : [],
  'Ludicolo' : [],
  'Ludicolo1' : [],
  'Ludicolo2' : [],
  'Ludicolo3' : [],
  'Slaking' : []
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

const doubleResistances = {
  'Absol' : ['Psychic'],
  'Aggron' : ['Normal', 'Flying'],
  'Altaria' : ['Grass'],
  'Armaldo' : [],
  'Blaziken' : ['Bug'],
  'Dragonite' : ['Grass'],
  'Exploud' : [],
  'Ludicolo' : ['Water'],
  'Ludicolo1' : ['Water'],
  'Ludicolo2' : ['Water'],
  'Ludicolo3' : ['Water'],
  'Slaking' : ['Ghost']
}

const immunities = {
  'Absol' : ['Psychic'],
  'Aggron' : ['Poison'],
  'Altaria' : ['Ground'],
  'Armaldo' : [],
  'Blaziken' : [],
  'Dragonite' : ['Ground'],
  'Exploud' : ['Ghost'],
  'Ludicolo' : [],
  'Ludicolo1' : [],
  'Ludicolo2' : [],
  'Ludicolo3' : [],
  'Slaking' : ['Ghost']
}

const types = {
  'Absol' : ['Dark'],
  'Aggron' : ['Steel', 'Rock'],
  'Altaria' : ['Dragon', 'Flying'],
  'Armaldo' : ['Rock', 'Bug'],
  'Blaziken' : ['Fire', 'Fighting'],
  'Dragonite' : ['Dragon', 'Flying'],
  'Exploud' : ['Normal'],
  'Ludicolo' : ['Water', 'Grass'],
  'Ludicolo1' : ['Water', 'Grass'],
  'Ludicolo2' : ['Water', 'Grass'],
  'Ludicolo3' : ['Water', 'Grass'],
  'Slaking' : ['Normal']
}

// Format
// [HP, Physical Atk, Phys Defense, Special Atk, Special Defense, Speed]
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

function createHPBar(pokemon) {
  // Store HP Values
  const currentHP = stats[pokemon][0];
  const maxHP = stats[pokemon][0];

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
    return poke1;
  }
  
  return poke2;
}

function handleAttack(attack) {
  const poke = whichPoke();
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

  closeMenu(0);
}

function calculateDamage(attacker, defender, atk) {
  // Determine multipliers and stats to use
  let atkStat, defStat, rand, adRatio;
  let typeEffect = 1;
  let stab = 1;
  let power = moveStats[atk][1];

  // First determine if using special/physical stats 
  const isSpecial = moveStats[atk][5];
  if (isSpecial) {
    atkStat = stats[attacker][3];
    defStat = stats[defender][4];
  } else {
    atkStat = stats[attacker][1];
    defStat = stats[defender][2];
  }

  // Next determine type effectiveness
  const type = moveStats[atk][0];
  if (doubleWeaknesses[defender].includes(type)) { // Super Effective
    typeEffect = 4;
  } else if (weaknesses[defender].includes(type)) {
    typeEffect = 2;
  } else if (resistances[defender].includes(type)) { // Not Very Effective
    typeEffect = 0.5;
  } else if (doubleResistances[defender].includes(type)) {
    typeEffect = 0.25;
  } else if (immunities[defender].includes(type)) {
    return 0;
  }

  // Next determine if STAB
  if (types[attacker].includes(type)) {
    stab = 1.5;
  }

  // Stat Ratio (Attack / Defense)
  adRatio = atkStat / defStat;

  // Vary the damage slightly
  rand = Math.floor(Math.random() * 15 + 85) / 100;

  // Verify Everything is set
  /*console.log(atkStat);
  console.log(defStat);
  console.log(adRatio);
  console.log(power);
  console.log(typeEffect);
  console.log(stab);
  console.log(rand);
  */

  // Base Damage
  let damage = ( (2 * 100) / 5) + 2;
  // Apply power and ratio and add 2
  damage *= power * adRatio;
  // Divide by 50 add 2
  damage /= 50;
  damage += 2;
  // Apply STAB, Type Effectivness, and Variability
  damage *= rand * stab  * typeEffect;

  console.log(Math.floor(damage));

  return Math.floor(damage);
}

function initTurn(p1, p2, p, hp) {
  console.log("HELLO");
  poke1 = p1.name;
  poke2 = p2.name;
  player = p;
  if (player == 0) {
    hp1 = hp;
  } else {
    hp2 = hp;
  }
  openMenu();
  console.log(player);
}

function processTurn() {
  let first = poke1;
  let second = poke2;

  const dmg1 = calculateDamage(poke1, poke2, attack0);
  const dmg2 = calculateDamage(poke2, poke1, attack1);

  // Determine turn order
  if (stats[poke1][5] > stats[poke2][5]) {
    first = poke1;
    second = poke2;
  } else if (stats[poke2][5] > stats[poke1][5]) {
    first = poke2;
    second = poke1;
  } else {
    let coinflip = Math.random() * 100;
    first = (coinflip > 50) ? poke1 : poke2;
    second = (coinflip > 50) ? poke2 : poke1;
  }

  console.log(hp1.currentHP);
  console.log(hp2.currentHP);

  // Damage pokemon 2 first, then check if it fainted
  if (first === poke1) {
    updateHPBar(hp2, dmg1);

    if (hp2.currentHP - dmg2 > 0) {
      setTimeout(() => { updateHPBar(hp1, dmg2); }, 500); 
    }
  }
  // Damage pokemon 1 first then check if it fainted
  else {
    updateHPBar(hp1, dmg2);
    if (hp1.currentHP - dmg1 > 0) {
      setTimeout(() => { updateHPBar(hp2, dmg1); }, 500); 
    }
  }

  setTimeout(() => {  raycasterEnabled = true; }, 100);
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

function closeMenu(isCancel) {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('menu').style.display = 'none';
  document.getElementById('attackMenu').style.display = 'none';
  if (!isCancel) {
    switchTurn(player);
    // Avoid situation where clicking attack overlapping with other pokemon opens the other menu immediately
    if (player == 1) {
      setTimeout(() => {  raycasterEnabled = true; }, 100);
    } else {
      processTurn();
    }
  } else {
    setTimeout(() => {  raycasterEnabled = true; }, 100);
  }
}

  
function showAttackOrStats(option) {
  if (option === 'attack') {
    document.getElementById('attackMenu').style.display = 'block';
  } else if (option === 'stats') {
    console.log('Stats Menu');
  }
}

export { createHPBar, updateHPBar, initTurn, openMenu, closeMenu, showAttackOrStats, handleAttack, raycasterEnabled, damage0, damage1, activeTurn };