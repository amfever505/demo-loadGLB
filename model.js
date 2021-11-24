import * as THREE from "./three.module.js";
import { OrbitControls } from "./OrbitControls.js";
import { GLTFLoader } from "./GLTFLoader.js";

let model;

async function init() {
	const canvas = document.querySelector("#c");

	const renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true,
	});
	const scene = new THREE.Scene();
	scene.background = new THREE.Color("black");
	const width = window.innerWidth / 2;
	const height = window.innerHeight / 1.5;

	renderer.setPixelRatio(1);
	renderer.setSize(width, height);

	const camera = new THREE.PerspectiveCamera(45, width / height, 1, 100);

	camera.position.set(0, 0, 50);

	const controls = new OrbitControls(camera, renderer.domElement);

	const light = new THREE.AmbientLight(0xffffff, 1);
	const spotlight = new THREE.SpotLight(0xffffff, 1, 200, Math.PI / 2, 1, 1);
	spotlight.position.set(0, 10, 60);
	scene.add(spotlight);
	scene.add(light);

	const arToolkitSource = new THREEx.ArToolkitSource({
		sourceType: "webcam",
	});

	arToolkitSource.init(() => {
		setTimeout(() => {
			onResize();
		}, 2000);
	});

	addEventListener("resize", () => {
		onResize();
	});

	function onResize() {
		arToolkitSource.onResizeElement();
		arToolkitSource.copyElementSizeTo(renderer.domElement);
		if (arToolkitContext.arController !== null) {
			arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
		}
	}

	const arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: "data/camera_para.dat",
		detectionMode: "mono",
	});

	arToolkitContext.init(() => {
		camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
	});

	const arMarkerControls = new THREEx.ArMarkerControls(
		arToolkitContext,
		camera,
		{
			type: "pattern",
			patternUrl: "data/patt.hiro",
			//
			changeMatrixMode: "cameraTransformMatrix",
		}
	);

	//   const mesh = new THREE.Mesh(
	//     new THREE.CubeGeometry(1, 1, 1),
	//     new THREE.MeshNormalMaterial(),
	//   );
	//   mesh.position.y = 1.0;
	//   scene.add(mesh);

	const clock = new THREE.Clock();
	requestAnimationFrame(function animate() {
		requestAnimationFrame(animate);
		if (arToolkitSource.ready) {
			arToolkitContext.update(arToolkitSource.domElement);
			scene.visible = camera.visible;
		}
		renderer.render(scene, camera);
	});

	// loader
	const loader = new GLTFLoader();
	const url = "./frame2_golden2.glb";
	model = await (() => {
		return new Promise((resolve) => {
			loader.load(
				url,
				(gltf) => {
					resolve(gltf.scene);
				},
				(err) => {
					console.error(err);
				}
			);
		});
	})();
	// カスタマイズ
	const WakuColor = document.querySelector("#waku");
	const UraColor = document.querySelector("#ura");

	model.traverse((object) => {
		if (object.isMesh) {
			// object.material.color.setHex(0xcccccc);
			object.material.transparent = true;
			console.log(object.name);
			const Meshs = new Object();
			model.children
				.filter((child) => child.material)
				.forEach((ele) => {
					Meshs[ele.name] = ele.material.color;
				});
			console.log(Meshs);
		}
		const Waku = model.children.filter((child) => child.material)[0].material;
		const Ura = model.children.filter((child) => child.material)[1].material;

		WakuColor.addEventListener("change", (e) => {
			let color = "0x" + WakuColor.value.slice(1);
			Waku.color.setHex(color);
		});
		UraColor.addEventListener("change", (e) => {
			let color = "0x" + UraColor.value.slice(1);
			Ura.color.setHex(color);
		});
	});
	// 位置設定
	model.position.set(0, -20, -20);
	model.rotation.set(0, 0, 0);
	model.scale.set(0.8, 0.8, 0.8);
	scene.add(model);

	function update() {
		if (arToolkitSource.ready) {
			arToolkitContext.update(arToolkitSource.domElement);
		}

		if (mixer) {
			mixer.update(clock.getDelta());
		}
	}
	renderer.setAnimationLoop(tick);
	// document.body.appendChild(VRButton.createButton(renderer));

	function tick() {
		controls.update();
		update();

		if (model) {
			model.rotation.x += 0;
			model.rotation.y += 0;
			model.rotation.z += 0;
		}
		renderer.render(scene, camera);
	}

	// Mesh であるやつを取得
	console.log(model.children.filter((child) => child.material));
}

window.addEventListener("load", init);

export default model;
