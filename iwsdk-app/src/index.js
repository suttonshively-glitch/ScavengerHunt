import {
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  PlaneGeometry,
  AmbientLight,
  DirectionalLight,
  EnvironmentType,
  LocomotionEnvironment,
  SessionMode,
  World,
  AssetType,
  AssetManager,

} from '@iwsdk/core';

import {
  Interactable,
  PanelUI,
  ScreenSpace
} from '@iwsdk/core';

import { PanelSystem } from './panel.js'; // system for displaying "Enter VR" panel on Quest 1

const assets = {
  furtree: {                                // <----------------------- added plant model
    url: '/gltf/plantSansevieria/oak_tree.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },

 };//import 3d here

World.create(document.getElementById('scene-container'), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: 'always',
    features: { }
  },

  features: { 
    locomotion: {
      smooth: true,
      teleport: true,
    }
  },

}).then((world) => {

  const { camera } = world;

  //Add all my objects here
  // Floor /////////////////////////////////////////////////////////////////////////////////
  const floorGeometry = new PlaneGeometry(110, 110);
  const floorMaterial = new MeshStandardMaterial({ color: 0x228B22 }); // Forest green
  const floor = new Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; // Rotate to lie flat
  floor.position.y = 0; // At ground level
  const floorEntity = world.createTransformEntity(floor);
  floorEntity.addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });

  // treasure /////////////////////////////////////////////////////////////////////////////////
  const sphereGeometry = new SphereGeometry(0.5, 32, 32);
  const sphereMaterial = new MeshStandardMaterial({ color: 0xC89D7C }); // brown
  const sphere = new Mesh(sphereGeometry, sphereMaterial);
  const sphereEntity = world.createTransformEntity(sphere);

  sphereEntity.object3D.position.set(50, 0.25, -50);

  const sphere1 = new Mesh(sphereGeometry, sphereMaterial);
  const sphere1Entity = world.createTransformEntity(sphere1);

  sphere1Entity.object3D.position.set(-30, 0.95, -10);

  const sphere2 = new Mesh(sphereGeometry, sphereMaterial);
  const sphere2Entity = world.createTransformEntity(sphere2);

  sphere2Entity.object3D.position.set(10, 0.75, 30);

  // Tree importing /////////////////////////////////////////////////////////////////////////
  const treeModel = AssetManager.getGLTF('furtree').scene;
  const spacing = 5;
  const gridSize = 100;
  const halfSize = gridSize / 2;

  for (let x = -halfSize; x <= halfSize; x += spacing) {
    for (let z = -halfSize; z <= halfSize; z += spacing) {
      const tree = treeModel.clone(true);

      // Add random offset to position
      const offsetX = (Math.random() - 0.5) * spacing * 0.6; // ±2.4m
      const offsetZ = (Math.random() - 0.5) * spacing * 0.6;

      tree.position.set(x + offsetX, -.2, z + offsetZ);

      // Optional: random rotation for variety
      tree.rotation.y = Math.random() * Math.PI * 2;

      world.createTransformEntity(tree);
    }
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////














  // vvvvvvvv EVERYTHING BELOW WAS ADDED TO DISPLAY A BUTTON TO ENTER VR FOR QUEST 1 DEVICES vvvvvv
  //          (for some reason IWSDK doesn't show Enter VR button on Quest 1)
  world.registerSystem(PanelSystem);
  
  if (isMetaQuest1()) {
    const panelEntity = world
      .createTransformEntity()
      .addComponent(PanelUI, {
        config: '/ui/welcome.json',
        maxHeight: 0.8,
        maxWidth: 1.6
      })
      .addComponent(Interactable)
      .addComponent(ScreenSpace, {
        top: '20px',
        left: '20px',
        height: '40%'
      });
    panelEntity.object3D.position.set(0, 1.29, -1.9);
  } else {
    // Skip panel on non-Meta-Quest-1 devices
    // Useful for debugging on desktop or newer headsets.
    console.log('Panel UI skipped: not running on Meta Quest 1 (heuristic).');
  }
  function isMetaQuest1() {
    try {
      const ua = (navigator && (navigator.userAgent || '')) || '';
      const hasOculus = /Oculus|Quest|Meta Quest/i.test(ua);
      const isQuest2or3 = /Quest\s?2|Quest\s?3|Quest2|Quest3|MetaQuest2|Meta Quest 2/i.test(ua);
      return hasOculus && !isQuest2or3;
    } catch (e) {
      return false;
    }
  }

});
