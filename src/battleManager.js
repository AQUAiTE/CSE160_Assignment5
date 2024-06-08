// battlesManager.js
// Handles elements related to the interactive part of this project
// Includes: HP (Hitpoints) Management, Player Turns, Battle Clicking

import * as THREE from 'three';

let raycasterEnabled = true;

let poke1 = '';
let poke2 = '';
let attack0 = -1;
let attack1 = -1;
let hp1 = -1;
let hp2 = -1;
let player = 0;
let activeTurn = 0;
let faintedPokemon = '';
let sPokes = 6;
let mPokes = 6;

const movesets = {
  'Absol' : ['Slash', 'Psycho Cut', 'Night Slash', 'Stone Edge'],
  'Aggron' : ['Strength', 'Iron Head', 'Stone Edge', 'Earthquake'],
  'Altaria' : ['Dragon Claw', 'Steel Wing', 'Moonblast', 'Aerial Ace'],
  'Armaldo' : ['X-Scissor', 'Slash', 'Rock Slide', 'Earthquake'],
  'Blaziken' : ['Blaze Kick', 'Sky Uppercut', 'Slash', 'Brave Bird'],
  'Dragonite' : ['Thunder Punch', 'Hurricane', 'Dragon Claw', 'Earthquake'],
  'Exploud' : ['Boomburst', 'Crunch', 'Ice Fang', 'Surf'],
  'Ludicolo' : ['Giga Drain', 'Ice Beam', 'Surf', 'Facade'],
  'Ludicolo1' : ['Giga Drain', 'Ice Beam', 'Hydro Pump', 'Facade'],
  'Ludicolo2' : ['Giga Drain', 'Ice Beam', 'Waterfall', 'Facade'],
  'Ludicolo3' : ['Giga Drain', 'Blizzard', 'Surf', 'Facade'],
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

const moveColors = {
	'Normal': '#A8A77A',
	'Fire': '#EE8130',
	'Water': '#6390F0',
	'Electric': '#F7D02C',
	'Grass': '#7AC74C',
	'Ice': '#96D9D6',
	'Fighting': '#C22E28',
	'Poison': '#A33EA1',
	'Ground': '#E2BF65',
	'Flying': '#A98FF3',
	'Psychic': '#F95587',
	'Bug': '#A6B91A',
	'Rock': '#B6A136',
	'Ghost': '#735797',
	'Dragon': '#6F35FC',
	'Dark': '#705746',
	'Steel': '#B7B7CE',
	'Fairy': '#D685AD',
};

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
  'Ludicolo2' : [255, 155, 130, 145, 184, 133],
  'Ludicolo3' : [270, 120, 135, 175, 180, 135],
  'Slaking' : [410, 292, 184, 175, 121, 284]
}

// Format
// [Type, Power, Accuracy, Recoil %, Healing %, Physical(0)/Special(1), Flinch%]
const moveStats = {
  'Aerial Ace' : ['Flying', 60, 101, 0, 0, 0, 0],
  'Blaze Kick' : ['Fire', 85, 90, 0, 0, 0, 0],
  'Blizzard' : ['Ice', 110, 70, 0, 0, 1, 0],
  'Boomburst' : ['Normal', 140, 100, 0, 0, 1, 0],
  'Brave Bird' : ['Flying', 120, 100, 0.33, 0, 0, 0],
  'Crunch' : ['Dark', 80, 100, 0, 0, 0, 0],
  'Dragon Claw' : ['Dragon', 80, 100, 0, 0, 0, 0],
  'Earthquake' : ['Ground', 100, 100, 0, 0, 0, 0],
  'Facade' : ['Normal', 70, 100, 0, 0, 0, 0],
  'Giga Drain' : ['Grass', 75, 100, 0, 0.5, 1, 0],
  'Giga Impact' : ['Normal', 150, 90, 0, 0, 0, 0],
  'Hammer Arm' : ['Fighting', 100, 90, 0, 0, 0, 0],
  'Hurricane' : ['Flying', 110, 70, 0, 0, 1, 0],
  'Hydro Pump' : ['Water', 110, 80, 0, 0, 1, 0],
  'Ice Beam' : ['Ice', 90, 100, 0, 0, 1, 0],
  'Ice Fang' : ['Ice', 65, 95, 0, 0, 0, 0.10],
  'Iron Head' : ['Steel', 80, 100, 0, 0, 0, 0.3],
  'Moonblast' : ['Fairy', 95, 100, 0, 0, 1, 0],
  'Night Slash' : ['Dark', 70, 100, 0, 0, 0, 0.2],
  'Psycho Cut' : ['Psychic', 70, 100, 0, 0, 0, 0],
  'Rock Slide' : ['Rock', 75, 90, 0, 0, 0, 1],
  'Shadow Claw' : ['Ghost', 70, 100, 0, 0, 0, 0],
  'Sky Uppercut' : ['Fighting', 85, 90, 0, 0, 0, 0],
  'Slash' : ['Normal', 70, 100, 0, 0, 0, 0],
  'Steel Wing' : ['Steel', 70, 90, 0, 0, 0, 0],
  'Stone Edge' : ['Rock', 100, 80, 0, 0, 0, 0],
  'Strength' : ['Normal', 80, 100, 0, 0, 0, 0],
  'Surf' : ['Water', 90, 100, 0, 0, 1, 0],
  'Thunder Punch' : ['Electric', 75, 100, 0, 0, 0, 0],
  'Waterfall' : ['Water', 80, 100, 0, 0, 0, 0.2],
  'X-Scissor' : ['Bug', 80, 100, 0, 0, 0, 0]
}


// Handling Healthbars
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
  // Healing may be applied, don't let it go above the maxHP
  const newHP = Math.min(Math.max(bar.currentHP - damageDealt, 0), bar.maxHP);

  if (newHP <= 0) {
    bar.hpBar.currentHP = 0;
    bar.hpBar.material.color.set(0x000000);
  } else if (newHP <= bar.maxHP * .2) {
    bar.hpBar.material.color.set(0xff0000)
  } else if (newHP <= bar.maxHP * 0.5) {
    bar.hpBar.material.color.set(0xffdc09)
  }
  
  bar.hpBar.scale.x = 1 * (newHP / bar.maxHP);
  bar.currentHP = newHP;

  return;
}

// Handling Attacks
function whichPokemon() {
  if (player == 0) {
    return poke1;
  }
  
  return poke2;
}

function handleAttack(attack) {
  const pokemon = whichPokemon();

  if (player == 0) {
    if (attack == 1) {
      attack0 = movesets[pokemon][0];
    } else if (attack == 2) {
      attack0 = movesets[pokemon][1];
    } else if (attack == 3) {
      attack0 = movesets[pokemon][2];
    } else {
      attack0 = movesets[pokemon][3];
    }
  } else {
    if (attack == 1) {
      attack1 = movesets[pokemon][0];
    } else if (attack == 2) {
      attack1 = movesets[pokemon][1];
    } else if (attack == 3) {
      attack1 = movesets[pokemon][2];
    } else {
      attack1 = movesets[pokemon][3];
    }
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

  return Math.floor(damage);
}


// Handling Turns and Fainted Pokemon
function initTurn(p1, p2, p, hp) {
  poke1 = p1.name;
  poke2 = p2.name;
  player = p;
  if (player == 0) {
    hp1 = hp;
  } else {
    hp2 = hp;
  }
  openMenu();
}

function processTurn() {
  let first = poke1;

  let dmg1 = calculateDamage(poke1, poke2, attack0);
  let dmg2 = calculateDamage(poke2, poke1, attack1);

  if (dmg1 == 0) {
    alert(`${attack0} doesn't affect ${poke2}...`);
  } else if (dmg2 == 0) {
    alert(`${attack1} doesn't affect ${poke1}...`);
  }

  let acc1 = Math.random() * 100;
  let acc2 = Math.random() * 100;

  if (acc1 >= moveStats[attack0][2]) {
    dmg1 = 0;
    alert(`${poke1}'s Attack Missed!`);
  }

  if (acc2 >= moveStats[attack1][2]) {
    dmg2 = 0;
    alert(`${poke2}'s Attack Missed!`);
  }

  // Determine turn order
  if (stats[poke1][5] > stats[poke2][5]) {
    first = poke1;
  } else if (stats[poke2][5] > stats[poke1][5]) {
    first = poke2;
  } else {
    let coinflip = Math.random() * 100;
    first = (coinflip > 50) ? poke1 : poke2;
  }

  if (first == poke1) {
    let flinch = Math.random() * 100;
    if (flinch <= moveStats[attack0][6]) {
      dmg2 = 0;
      alert(`${poke2} flinched and couldn't move!`);
    }
  } else if (first == poke2) {
    let flinch = Math.random();
    if (flinch <= moveStats[attack1][6]) {
      dmg1 = 0;
      alert(`${poke1} flinched and couldn't move!`);
    }
  }

  // Determine if any healing/recoil is involved
  let heal1 = 0;
  let heal2 = 0;
  let recoil1 = 0;
  let recoil2 = 0;
  let isHealRecoil1 = false;
  let isHealRecoil2 = false;

  if (moveStats[attack0][3] > 0) {
    recoil1 = dmg1 * moveStats[attack0][3];
    isHealRecoil1 = true;
  } 
  
  if (moveStats[attack1][3] > 0) {
    recoil2 = dmg2 * moveStats[attack1][3];
    isHealRecoil2 = true;
  }

  if (moveStats[attack0][4] > 0) {
    heal1 = dmg1 * moveStats[attack0][4];
    isHealRecoil1 = true;
  }
  
  if (moveStats[attack1][4] > 0) {
    heal2 = dmg2 * moveStats[attack1][4];
    isHealRecoil2 = true;
  }

  // Damage pokemon 2 first, then check if it fainted
  if (first === poke1) {
    let newHP = hp2.currentHP - dmg1;
    let selfHPUpdate = -heal1 + recoil1;

    updateHPBar(hp2, dmg1);
    if (isHealRecoil1) {
      updateHPBar(hp1, selfHPUpdate); 
    }

    if (newHP > 0) {
      newHP = hp1.currentHP - dmg2;
      setTimeout(() => { updateHPBar(hp1, dmg2); }, 500); 
      if (isHealRecoil2) {
        updateHPBar(hp2, -heal2 + recoil2);
      }
      if (newHP <= 0) {
        activeTurn = 2;
        faintedPokemon = poke1;
        sPokes--;
        if (sPokes == 0) {
          alert("MirorB Wins!");
          activeTurn = -1;
          return;
        }
        alert('Serena, please swap out your fainted Pokemon!');
      }
    } else {
      activeTurn = 2;
      faintedPokemon = poke2;
      mPokes--;
      if (mPokes == 0) {
        alert("Serena Wins!");
        activeTurn = -2;
        return;
      }
      alert('MirorB, please swap out your fainted Pokemon!');
    }

  }
  // Damage pokemon 1 first then check if it fainted
  else {
    let newHP = hp1.currentHP - dmg2;
    let selfHPUpdate = -heal2 + recoil2;

    updateHPBar(hp1, dmg2);
    if (isHealRecoil2) {
      updateHPBar(hp2, selfHPUpdate);
    }

    if (newHP > 0) {
      newHP = hp2.currentHP - dmg1;
      setTimeout(() => { updateHPBar(hp2, dmg1); }, 500); 
      if (isHealRecoil1) {
        updateHPBar(hp1, -heal1 + recoil1);
      }
      if (newHP <= 0) {
        activeTurn = 2;
        faintedPokemon = poke2;
        mPokes--;
        if (mPokes == 0) {
          alert("Serena Wins!");
          activeTurn = -2;
          return;
        }
        alert('MirorB, please swap out your fainted Pokemon!');
      }
    } else {
      activeTurn = 2;
      faintedPokemon = poke1;
      sPokes--;
      if (sPokes == 0) {
        alert("MirorB Wins!");
        activeTurn = -1;
        return;
      }
      alert('Serena, please swap out your fainted Pokemon!');
    }
  }

  setTimeout(() => {  raycasterEnabled = true; }, 100);
}

function switchTurn(turn) {
  player = (turn === 0) ? 1 : 0;
  activeTurn = player;
}

function newPokemonSelected() {
  activeTurn = 0;
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
  document.getElementById('attackMenu0').style.display = 'none';
  document.getElementById('attackMenu1').style.display = 'none';
  if (!isCancel) {
    if (activeTurn != 2) {
      switchTurn(player);
    }
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

function backtrackMenu(isActive) {
  document.getElementById('attackMenu0').style.display = 'none';
  document.getElementById('attackMenu1').style.display = 'none';
  document.getElementById('statsMenu').style.display = 'none';
  document.getElementById('statsMenu2').style.display = 'none';
  document.getElementById('stats1').style.display = 'none';
  document.getElementById('stats2').style.display = 'none';
  if (isActive)
  {  
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('menu').style.display = 'block';
    raycasterEnabled = false;
  } else {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('menu').style.display = 'none';
    setTimeout(() => {  raycasterEnabled = true; }, 100);
  }
}

function generateAttackMenu(pokemon, player) {
  const moveset = movesets[pokemon];
  for (let i = 0; i < moveset.length; i++) {
    const button = document.getElementById(`attack${i + 1}-${player}`);
    const move = moveset[i];
    const movePower = moveStats[move][1];
    const moveAccuracy = moveStats[move][2];
    const color = moveColors[moveStats[move][0]];
    button.style.backgroundImage = `linear-gradient(to top right, white, ${color})`;
    button.innerHTML = `<span class="name">${move}</span><span class="details">Power: ${movePower}<br> Accuracy: ${moveAccuracy}<br> Type: ${moveStats[move][0]}</span>`;
  }

}

function generateStatsMenu(pokemon) {
  const hp = stats[pokemon][0];
  const physAtk = stats[pokemon][1];
  const physDef = stats[pokemon][2];
  const spAtk = stats[pokemon][3];
  const spDef = stats[pokemon][4];
  const speed = stats[pokemon][5];
  const type1 = types[pokemon][0];
  const typeColor1 = moveColors[type1];
  let typeColor2, spanColor;
  let type2 = types[pokemon][1];
  if (!type2) {
    type2 = "";
    spanColor = `background-image: linear-gradient(to top right, ${typeColor1}, white)`;
  } else {
    typeColor2 = moveColors[type2];
    type2 = "/" + type2;
    spanColor = `background-image: linear-gradient(to top right, ${typeColor1}, ${typeColor2})`;
  }

  const stats1 = document.getElementById("stats1");
  const stats2 = document.getElementById("stats2");

  stats1.innerHTML = 
  `
  <span class="name">${pokemon}</span>
  <br>
  <span class="type" style ="${spanColor}">${type1}${type2}</span>
  <br>
  <span class="stats">
  HP: ${hp}
  <br>
  ATTACK: ${physAtk}
  <br>
  DEFENSE: ${physDef}
  <br>
  SP. ATK: ${spAtk}
  <br>
  SP. DEF: ${spDef}
  <br>
  SPEED: ${speed}
  </span>
  <br>`;

  stats2.innerHTML = 
  `
  <span class="name">${pokemon}</span>
  <br>
  <span class="type" style ="${spanColor}">${type1}${type2}</span>
  <br>
  <span class="stats">
  HP: ${hp}
  <br>
  ATTACK: ${physAtk}
  <br>
  DEFENSE: ${physDef}
  <br>
  SP. ATK: ${spAtk}
  <br>
  SP. DEF: ${spDef}
  <br>
  SPEED: ${speed}
  </span>
  <br>`;

}

  
function showAttackOrStats(option, menuNum) {
  raycasterEnabled = false;
  document.getElementById('menu').style.display = 'none';
  if (option === 'attack') {
    document.getElementById(`attackMenu${menuNum}`).style.display = 'block';
  } else if (option === 'stats') {
    document.getElementById(`statsMenu`).style.display = 'block';
    document.getElementById('stats1').style.display = 'block';
  } else if (option === 'stats2') {
    document.getElementById(`statsMenu2`).style.display = 'block';
    document.getElementById('stats2').style.display = 'block';
  }
}

export { createHPBar, updateHPBar, initTurn, openMenu, closeMenu, backtrackMenu, generateAttackMenu, generateStatsMenu, showAttackOrStats, handleAttack, newPokemonSelected, raycasterEnabled, faintedPokemon, activeTurn };