import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

//for loading GLTF files
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
//for loading FBX files
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
//for debugging
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';


class BasicWorldDemo {
  constructor() {
    this._Initialize();
  }
  //constructor 
  _Initialize() {
    //create the renderer
    this._threejs = new THREE.WebGLRenderer({
      antialias: true, //smooths out the edges of the objects
    });
    this._threejs.shadowMap.enabled = true; //enables shadows
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap; //soft shadows
    this._threejs.setPixelRatio(window.devicePixelRatio); //sets the pixel ratio
    this._threejs.setSize(window.innerWidth, window.innerHeight); //sets the size of the renderer to screen size

    document.body.appendChild(this._threejs.domElement); //adds the renderer to the DOM

    window.addEventListener('resize', () => {
      this._OnWindowResize(); //resize the window on change
    }, false);

    const fov = 60; //field of view
    const aspect = 1920 / 1080; //aspect ratio
    const near = 1.0; //near clipping plane 
    const far = 1000.0; //far clipping plane render distance from camera 
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far); //creates the camera
    this._camera.position.set(75, 20, 0); //sets the position of the camera

    this._scene = new THREE.Scene(); //creates the scene


    //create the light
    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0); //color, intensity
    light.position.set(20, 100, 30);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.0001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);

    //create the ambient light
    light = new THREE.AmbientLight(0x101010,30.0); //color, intensity
    this._scene.add(light);

    //debugging controls
    const controls = new OrbitControls(
      this._camera, this._threejs.domElement);
    controls.target.set(0, 2, 0);
    controls.update();

    //load the skybox
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        './resources/posx.jpg',
        './resources/negx.jpg',
        './resources/posy.jpg',
        './resources/negy.jpg',
        './resources/posz.jpg',
        './resources/negz.jpg',
    ]);
    this._scene.background = texture; //sets the background to the skybox


    //create the plane
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 10, 10), //width, height, width segments, height segments
        new THREE.MeshStandardMaterial({
            color: 0x555555,
          }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);

    //create the zombie
    this._LoadModel();

    //create the animation mixer
    this._mixers = [];
    this._previousRAF = null;

    //start rendering after everything is loaded
    this._RAF();
  }
  //constructor end

    _LoadModel() {
        const loader = new FBXLoader();
        loader.load('./resources/zombie/Zombiegirl.fbx', (fbx) => {
        fbx.scale.setScalar(0.07);
        fbx.traverse(c => { 
          c.castShadow = true;
        });
        fbx.position.copy(new THREE.Vector3(2, 0, 2));
        
        const anim = new FBXLoader();
        anim.load('./resources/zombie/Zombie_Walk.fbx', (anim) => {
          const m = new THREE.AnimationMixer(fbx);
          this._mixers.push(m);
          const idle = m.clipAction(anim.animations[0]);
          idle.play();
        });

        this._scene.add(fbx);
      },
      (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
      },
      (error) => {
          console.log(error)
      }
      );  
        // const loader = new GLTFLoader();
        // loader.load("./resources/model/scene.gltf", (gltf) => {
        // gltf.scene.traverse(c => {
        //     c.castShadow = true;
        // });
        // this._scene.add(gltf.scene);
        // });
    }

  //resize the window on change
  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }
//update the animation
  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001; //convert to seconds
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS)); //update the animation
    }
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) { //first frame
        this._previousRAF = t;
      }

      this._RAF(); //request the next frame

      this._threejs.render(this._scene, this._camera); //render the scene
      this._Step(t - this._previousRAF); //update the animation
      this._previousRAF = t; //update the previous time
    });
  }
}


let _APP = null;

//after the DOM is loaded, initialize the app
window.addEventListener('DOMContentLoaded', () => {
  _APP = new BasicWorldDemo();
});