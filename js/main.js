var camera, scene, mainBox, engine, canvas, 
  keys, targetAngleY, targetAngleX, ANG90, 
  ANG180, angleAdding, slabs, materials, outputplane, outputplaneTexture, context2D;
var pause = false, score = 0;


function init(){
  keys = {letft:0,right:0,up:0,down:0};
  targetAngleY = 0;
  targetAngleX = 0;
  slabs = [];
  ANG90 = 90 * (Math.PI / 180);
  ANG180 = Math.PI;
  canvas = document.querySelector("#render");
  engine = new BABYLON.Engine(canvas, true);

  createScene();

  engine.runRenderLoop(function () {
    renderBefore();
    scene.render();
  });

  registerEvents();
}

function renderBefore(){
  if(pause) return;
  checkHit();
  performKeyActions();
  moveSlabs();
}

function makeMaterial(r,g,b){
  var m = new BABYLON.StandardMaterial("material-" + r + g + b, scene);
  m.diffuseColor=new BABYLON.Color3(r,g,b);


  var rgb = r * 256 + ',' + g * 256 + ',' + b * 256;
  return m;
}

function initMaterials(){
  materials = [];
  materials.push(makeMaterial(1,0,0));
  materials.push(makeMaterial(0,1,0));
  materials.push(makeMaterial(0,0,1));
  materials.push(makeMaterial(1,1,0));
  materials.push(makeMaterial(0,1,1));
  materials.push(makeMaterial(1,0,1));
}

function checkHit(){
  for(var i = 0; i < slabs.length; i++){
    var slabObj = slabs[i];

    var hit = false;
    if(slabObj.axis === "Y"){
      if(slabObj.slab.position.y < 1.1 && mainBox.intersectsMesh(slabObj.slab, false)) {
        hit = true;
      }
    }
    if(slabObj.axis === "-Y"){
      if(slabObj.slab.position.y > -1.1 && mainBox.intersectsMesh(slabObj.slab, false)) {
        hit = true;
      }
    }
    if(slabObj.axis === "X"){
      if(slabObj.slab.position.x < 1.1 && mainBox.intersectsMesh(slabObj.slab, false)) {
        hit = true;
      }
    }
    if(slabObj.axis === "-X"){
      if(slabObj.slab.position.x > -1.1 && mainBox.intersectsMesh(slabObj.slab, false)) {
        hit = true;
      }
    }
    if(slabObj.axis === "Z"){
      if(slabObj.slab.position.z < 1.1 && mainBox.intersectsMesh(slabObj.slab, false)) {
        hit = true;
      }
    }
    if(slabObj.axis === "-Z"){
      if(slabObj.slab.position.z > -1.1 && mainBox.intersectsMesh(slabObj.slab, false)) {
        hit = true;
      }
    }
    if(hit){

      if(isSameColor(slabObj.line, slabObj.slab)){
        score += 1;
      }else{
        score -= 1;
      }
      updateScore(score);
      slabObj.slab.dispose();
      slabObj.line.dispose();
      slabs.splice(i, 1);
      createRandomSlab();
    }
  }
}

function isSameColor(line, slab){
  var slabMaterialId = slab.material.id;
  var m = mainBox.subMeshes;
  for(var i = 0; i < m.length; i++){
    if(line.intersectsMesh(mainBox.subMeshes[i])){
      if(materials[mainBox.subMeshes[i].materialIndex].id == slabMaterialId){
        return true;
      }
    }
  }
  return false;
}


function getMainCubeSideByMaterialId(materialId){
  for(var i = 0; i < mainBox.material.subMaterials.length; i++){
    var m = mainBox.material.subMaterials[i];
    if(materialId === m.id){
      return i;
    }
  }
}


function moveSlabs(){
  var increment = 0.04;
  for(var i = 0; i < slabs.length; i++){
    var slabObj = slabs[i];
    if(slabObj.axis === "Y"){
      slabObj.slab.position.y -= increment;  
    }else if(slabObj.axis === "-Y"){
      slabObj.slab.position.y += increment;  
    }else if(slabObj.axis === "X"){
      slabObj.slab.position.x -= increment;  
    }else if(slabObj.axis === "-X"){
      slabObj.slab.position.x += increment;  
    }else if(slabObj.axis === "Z"){
      slabObj.slab.position.z -= increment;  
    }else if(slabObj.axis === "-Z"){
      slabObj.slab.position.z += increment;  
    }
  }
}

function performKeyActions(){
  var rotateIncrement = 0.1;
  if(keys.left){
    angleAdding = true;
    targetAngleY += ANG90;
    keys.left = 0;
  }
  if(keys.up){
    angleAdding = true;
    targetAngleX += ANG90;
    keys.up = 0;
  }
  if(keys.right){
    angleAdding = false;
    targetAngleY -= ANG90;
    keys.right = 0;
  }
  if(keys.down){
    angleAdding = false;
    targetAngleX -= ANG90;
    keys.down = 0;
  }
  if(angleAdding){
    if(mainBox.rotation.y < targetAngleY){
      mainBox.rotation.y += 0.1;
    }else{
      mainBox.rotation.y = targetAngleY;
    }
    if(mainBox.rotation.x < targetAngleX){
      mainBox.rotation.x += 0.1;
    }else{
      mainBox.rotation.x = targetAngleX;
    }
  }else{
    if(mainBox.rotation.y > targetAngleY){
      mainBox.rotation.y -= 0.1;
    }else{
      mainBox.rotation.y = targetAngleY;
    }
    if(mainBox.rotation.x > targetAngleX){
      mainBox.rotation.x -= 0.1;
    }else{
      mainBox.rotation.x = targetAngleX;
    }
  }
}



function createScoreboard(){
  outputplane = BABYLON.Mesh.CreatePlane("outputplane", 20, scene, false);
  outputplane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
  outputplane.material = new BABYLON.StandardMaterial("outputplane", scene);
  outputplane.position = new BABYLON.Vector3(5, 5, 0);
  outputplane.scaling.x = 0.05;
  outputplane.scaling.y = 0.05;
  outputplane.rotate(BABYLON.Axis.Z, 10 * Math.PI / 180);

  outputplaneTexture = new BABYLON.DynamicTexture("dynamic texture", 512, scene, true);
  outputplane.material.diffuseTexture = outputplaneTexture;
  outputplane.material.specularColor = new BABYLON.Color3(0, 0, 0);
  outputplane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
  outputplane.material.backFaceCulling = false;
  context2D = outputplaneTexture.getContext();

  updateScore("0");

}

function updateScore(data) {
  context2D.clearRect(0, 200, 512, 512);
  outputplaneTexture.drawText(data, null, 380, "bold 220px verdana", "white", null);
}  


function registerEvents(){
  window.addEventListener("resize", function () {
    engine.resize();
  });
  window.addEventListener("keydown", onKeyDown, false); 
  window.addEventListener("keyup", onKeyUp, false); 
}

function onKeyDown(event){    
  if(event.keyCode === 37) keys.left = 1;
  if(event.keyCode === 39) keys.right = 1;
  if(event.keyCode === 38) keys.up = 1;
  if(event.keyCode === 40) keys.down = 1;
  if(event.keyCode === 80){
    pause = !pause;
    console.log("Paused", pause);
  }
}

function onKeyUp(event){    
  if(event.keyCode === 37) keys.left = 0;
  if(event.keyCode === 39) keys.right = 0;
  if(event.keyCode === 38) keys.up = 0;
  if(event.keyCode === 40) keys.down = 0;
}

function createMainBox(){
  mainBox = BABYLON.Mesh.CreateBox("mainBox", 2, scene);
  mainBox.isPickable = true;
  createMaterial();
}


function createSlab(){
  var slabIndex = slabs.length;
  var slab = BABYLON.Mesh.CreateBox("slab-" + slabIndex, 2, scene);
  slab.position = [0,6,0];
  slab.scaling = [1,0.062,1];
  slabs.push({slab: slab, axis: "Y"});
}

function createRandomSlab(){
  var slabAxis = ["Y", "-Y", "X", "-X", "Z", "-Z"];
  var slabDist = 12;
  var slabScale = 0.062;
  var slabPosition = [[0,slabDist,0], [0,-slabDist,0], [slabDist,0,0], [-slabDist,0,0]];
  var slabScaling = [[1,slabScale,1], [1,slabScale,1], [slabScale,1,1], [slabScale,1,1]];
  var rand = getRandomInt(0, 5);
  var materialIndex = getRandomInt(0, materials.length - 1);

  /*
  purple 5
  green 1
  blue 2
  yellow 3
  red 0
  */

  var slabIndex = slabs.length;
  var slab = BABYLON.Mesh.CreateBox("slab-" + slabIndex, 2, scene);
  slab.material = materials[materialIndex];
  slab.materialIndex = materialIndex;


  

  if(slabAxis[rand] === "Y" || slabAxis[rand] === "-Y"){
    slab.position.y = slabAxis[rand] === "Y" ? slabDist : -slabDist;
    slab.scaling.y = slabScale;
  }
  if(slabAxis[rand] === "X" || slabAxis[rand] === "-X"){
    slab.position.x = slabAxis[rand] === "X" ? slabDist : -slabDist;
    slab.scaling.x = slabScale;
  }
  if(slabAxis[rand] === "Z" || slabAxis[rand] === "-Z"){
    slab.position.z = slabAxis[rand] === "Z" ? slabDist : -slabDist;
    slab.scaling.z = slabScale;
  }
  var line = BABYLON.Mesh.CreateLines("line", [slab.position, mainBox.position], scene);
  line.visibility = 0;
  slabs.push({slab: slab, axis: slabAxis[rand], line: line});

}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function createMaterial(){
  var multi = new BABYLON.MultiMaterial("nuggetman",scene);
  multi.subMaterials.push(materials[0]);
  multi.subMaterials.push(materials[1]);
  multi.subMaterials.push(materials[2]);
  multi.subMaterials.push(materials[3]);
  multi.subMaterials.push(materials[4]);
  multi.subMaterials.push(materials[5]);

  mainBox.subMeshes=[];
  var verticesCount=mainBox.getTotalVertices();
  mainBox.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 0, 6, mainBox));
  mainBox.subMeshes.push(new BABYLON.SubMesh(1, 1, verticesCount, 6, 6, mainBox));
  mainBox.subMeshes.push(new BABYLON.SubMesh(2, 2, verticesCount, 12, 6, mainBox));
  mainBox.subMeshes.push(new BABYLON.SubMesh(3, 3, verticesCount, 18, 6, mainBox));
  mainBox.subMeshes.push(new BABYLON.SubMesh(4, 4, verticesCount, 24, 6, mainBox));
  mainBox.subMeshes.push(new BABYLON.SubMesh(5, 5, verticesCount, 30, 6, mainBox));
  mainBox.material=multi;  
}

function createCamera(){
  camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0, 0, BABYLON.Vector3.Zero(), scene);
  camera.setPosition(new BABYLON.Vector3(0, 10, 10));
  camera.alpha = 45 * (Math.PI / 180);
}

function createLight(){
  var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 0, 0), scene);
  light.intensity = 5;
}


function getAnimationKey(frame, x, y, z){
  var targetR = mainBox.rotation.add(new BABYLON.Vector3(
    x,
    y,
    z
  ));
  return {frame: frame, value: targetR};
}

function createSkybox(scene){
  const skyboxMaterial = new BABYLON.StandardMaterial('skyboxMaterial', scene);
  skyboxMaterial.backFaceCulling = false;

  //remove reflections
  skyboxMaterial.specularColor = BABYLON.Color3.Black();
  skyboxMaterial.diffuseColor = BABYLON.Color3.Black();

  //texture
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('/assets/images/skybox/skybox', scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

  const skybox = BABYLON.MeshBuilder.CreateBox('skybox', {
      size:1000
  }, scene)

  //move skybox with camera
  skybox.infiniteDistance = true;

  skybox.material = skyboxMaterial;
}


function createScene() {

  scene = new BABYLON.Scene(engine);
  initMaterials();
  //scene.clearColor = new BABYLON.Color3(0, 0, 0);
  //createSkybox(scene);
  createCamera();
  createLight();
  createMainBox();
  createRandomSlab();
  createScoreboard();
};


document.addEventListener("DOMContentLoaded", init);

