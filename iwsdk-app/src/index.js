import {
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  PlaneGeometry
  SessionMode,
  World,
} from '@iwsdk/core';

import {
  Interactable,
  PanelUI,
  ScreenSpace
} from '@iwsdk/core';

import { PanelSystem } from './panel.js'; // system for displaying "Enter VR" panel on Quest 1

const assets = { };

World.create(document.getElementById('scene-container'), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: 'always',
    features: { }
  },

  features: { },

}).then((world) => {

  const { camera } = world;

  //Add all my objects here
  // Floor /////////////////////////////////////////////////////////////////////////////////
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Forest green
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; // Rotate to lie flat
  floor.position.y = 0; // At ground level
  const floorEntity = world.createTransformEntity(floor);

  // Tree importing /////////////////////////////////////////////////////////////////////////
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

  const loader = new GLTFLoader();
  loader.load('path/to/fur_tree.glb', (gltf) => {
    const treeModel = gltf.scene;
    treeModel.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed

    const spacing = 8;
    const gridSize = 100;
    const halfSize = gridSize / 2;

    for (let x = -halfSize; x <= halfSize; x += spacing) {
      for (let z = -halfSize; z <= halfSize; z += spacing) {
        const tree = treeModel.clone();
        tree.position.set(x, 0, z);
        world.createTransformEntity(tree);
      }
    }
  });












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
