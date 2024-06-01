// battlesManager.js
// Handles elements related to the interactive part of this project
// Includes: HP (Hitpoints) Management, Player Turns, Battle Clicking

import * as THREE from 'three';

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


export { createHPBar, updateHPBar };