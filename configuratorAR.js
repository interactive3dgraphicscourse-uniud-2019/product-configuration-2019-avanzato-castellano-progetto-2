$(document).ready(function() {

	$('.flash').hide();

	var container, ground, marker;
	var camera, scene, renderer, chair;
	var mouseX = 0, mouseY = 0, dragging = false;
	var lastX = 0, lastY = 0;
	var incrementX = 0, incrementY = 0, inertia = false;
	var centering = false, zoom = 1, scaling = false, scalingValue = 0, fingerDist = 0;

	const DEG = Math.PI/180;
	const INERTIA_FACTOR = 1.1;

	const MIN_CAMERA_Z = 20;
	const MAX_CAMERA_Z = 50;
	const CAMERA_DEFAULT_Z = 30;

	const MAX_ROTATION_X = 45 * DEG;
	const MIN_ROTATION_X = 5 * DEG;
	const DEFAULT_ROTATION_X = 20 * DEG;

	const DEFAULT_ROTATION_Y = 20 * DEG;

	const SIT = ["Object_2"];
	const BASE = ["Object_0"];
	const ARMS = ["Object_1", "Object_3", "Object_4", "Object_5"];
	
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	var currentSnapshot;
	var snapshot_seq_number = 0;
	const STANDARD_DOWNLOAD_MIME = "image/octet-stream";

	var baseMaterial, armsMaterial, sitMaterial;

	var diffuseMap = null;
	var specularMap = null;
	var normalMap = null;
	var aoMap = null;
	var roughnessMap = null;
	var displacementMap = null;

	const sitPreviews = {
		fabric01: { name: "printed fabric", image: "textures/fabric01/diff.jpg" },
		fabric02: { name: "grey fabric", image: "textures/fabric02/diff.jpg" },
		fabric03: { name: "squared blue fabric", image: "textures/fabric03/diff.jpg" },
		fabric04: { name: "squared beige fabric", image: "textures/fabric04/diff.jpg" },
		fabric05: { name: "dark grey rough fabric", image: "textures/fabric05/diff.jpg" },
		leather01: { name: "red copper leather", image: "textures/leather01/diff.jpg" },
		leather02: { name: "flat beige leather", image: "textures/leather02/diff.jpg" },
	}

	const basePreviews = {
		metal01: { name: "regular dark metal", image: "textures/metal01/diff.jpg" },
		metal02: { name: "grey flat metal", image: "textures/metal02/diff.jpg" },
		metal03: { name: "striped grey metal", image: "textures/metal03/diff.jpg" },
		wood01: { name: "refined redwood", image: "textures/wood01/diff.jpg" },
		wood02: { name: "flat polar wood", image: "textures/wood02/diff.jpg" },
	}

	const armsPreviews = {
		metal01: { name: "regular dark metal", image: "textures/metal01/diff.jpg" },
		metal02: { name: "grey flat metal", image: "textures/metal02/diff.jpg" },
		metal03: { name: "striped grey metal", image: "textures/metal03/diff.jpg" },
		wood01: { name: "refined redwood", image: "textures/wood01/diff.jpg" },
		wood02: { name: "flat polar wood", image: "textures/wood02/diff.jpg" },
	}

	const materials = {

		fabric01: { path: "textures/fabric01/", type: "fabric", repetitions: 4 },
		fabric02: { path: "textures/fabric02/", type: "fabric", repetitions: 2 },
		fabric03: { path: "textures/fabric03/", type: "fabric", repetitions: 16 },
		fabric04: { path: "textures/fabric04/", type: "fabric", repetitions: 16 },
		fabric05: { path: "textures/fabric05/", type: "fabric", repetitions: 2 },
		leather01: { path: "textures/leather01/", type: "leather", repetitions: 16 },
		leather02: { path: "textures/leather02/", type: "leather", repetitions: 16 },
		metal01: { path: "textures/metal01/", type: "metal", repetitions: 0.5 },
		metal02: { path: "textures/metal02/", type: "metal", repetitions: 0.02 },
		metal03: { path: "textures/metal03/", type: "metal", repetitions: 0.05 },
		wood01: { path: "textures/wood01/", type: "wood", repetitions: 0.02 },
		wood02: { path: "textures/wood02/", type: "wood", repetitions: 0.05 },

	}

	init();
	animate();

	function init() {

		container = document.createElement( 'div' );
		container.id = "main-canvas";
		container.style.position = "fixed";
		container.style.top = "0";
		container.style.left = "0";
		document.body.appendChild( container );

		camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			1,
			2000
		);

		camera.position.z = CAMERA_DEFAULT_Z;
		camera.position.y = 5;
		camera.lookAt( new THREE.Vector3(2,5,0) );

		let loader = new THREE.ImageLoader();
		loader.load("js/0.png",
			(image) => marker = image,
			undefined,
			(error) => console.log(error)
		);


		// --------------------------- Material selectors ----------------------------

		let sitMaterialsSelector = document.getElementById("sit-materials-container");
		let baseMaterialsSelector = document.getElementById("base-materials-container");
		let armsMaterialsSelector = document.getElementById("arms-materials-container");

		// Creating preview icons for materials
		Object.entries(sitPreviews).map((material, index) => {
			sitMaterialsSelector.appendChild( createTexturePreview( SIT, material, index ));
		});

		// Creating preview icons for materials
		Object.entries(basePreviews).map((material, index) => {
			baseMaterialsSelector.appendChild( createTexturePreview( BASE, material, index ));
		});

		// Creating preview icons for materials
		Object.entries(armsPreviews).map((material, index) => {
			armsMaterialsSelector.appendChild( createTexturePreview( ARMS, material, index ));
		});

		// ---------------------------------------------------------------------------


		// ---------------------------- Scene and lights -----------------------------

		// Scene
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xeeeeee );
		scene.fog = new THREE.Fog(0xeeeeee, 30, 100);

		// Lights
		// Top right
		var spotLight1 = createSpotlight( 0xffffff, 1, true );
		spotLight1.position.set( 30, 80, 50 );
		// Bottom left
		var spotLight2 = createSpotlight( 0xffffff, 1, true );
		spotLight2.position.set( -10, 5, 50 );
		// Top left
		var spotLight3 = createSpotlight( 0xffffff, 1, false );
		spotLight3.position.set( -40, 80, 50 );

		var ambientLight = new THREE.AmbientLight( 0xffffff, 0.6 );
		scene.add( ambientLight );

		// Ground
		var groundMaterial = new THREE.MeshPhongMaterial({
		    color: 0xffffff,
		    bumpScale: 0.0005,
		    shininess: 10,
			specular: 0xffffff,
		    side: THREE.FrontSide
		});

		var geometry = new THREE.PlaneBufferGeometry(2000, 2000);
		ground = new THREE.Mesh(geometry, groundMaterial);
		ground.castShadow = false;
		ground.receiveShadow = true;
		ground.rotation.x = -Math.PI / 2.0 + DEFAULT_ROTATION_X;
		scene.add(ground);

		// ---------------------------------------------------------------------------

		// On model loading controls function
		var onProgress = function ( xhr ) { };
		var onError = function () { };

		// Fade out loading icon
		const loadingManager = new THREE.LoadingManager( () => {
			const loadingScreen = document.getElementById( 'loading-screen' );
			loadingScreen.classList.add( 'fade-out' );
			loadingScreen.addEventListener( 'transitionend', onTransitionEnd );	
		});

		// --------------------------- Model and materials ----------------------------

		// Base material
		baseMaterial = createMaterial(
			materials.metal01.path,
			materials.metal01.type,
			materials.metal01.repetitions
		);
		
		// Arms material
		armsMaterial = createMaterial(
			materials.metal01.path,
			materials.metal01.type,
			materials.metal01.repetitions
		);

		sitMaterial = createMaterial(
			materials.fabric01.path,
			materials.fabric01.type,
			materials.fabric01.repetitions
		);

		// Load model and apply materials
		THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
		new THREE.OBJLoader(loadingManager)
			.setPath( 'obj/Chair_moroso/' )
			.load( 'Chair.obj', function ( object ) {
				chair = new THREE.Mesh();
				let count = 0;
				object.traverse(function (node) {
					if (node.type === 'Mesh') {
						const type = "Object_" + count;
						if ( SIT.includes(type) ) {
							child = new THREE.Mesh( node.geometry, sitMaterial );
						} else if ( ARMS.includes(type) ) {
							child = new THREE.Mesh( node.geometry, armsMaterial );
							child.position.x = -1;
						} else {
							child = new THREE.Mesh( node.geometry, baseMaterial );
						}
						child.name = "Object_" + count;
						child.castShadow = true;
						child.receiveShadow = false;
						child.material.needsUpdate = true;
						chair.add(child);
						count++;
					}
				});
				chair.scale.set(0.2, 0.2, 0.2);
				chair.castShadow = true;
				chair.receiveShadow = false;
				chair.rotation.y = 20 * DEG;
				chair.rotation.x = 20 * DEG;
				scene.add(chair);

				spotLight1.target = chair;
				spotLight2.target = chair;
				spotLight3.target = chair;
				scene.add( spotLight1, spotLight2, spotLight3 );
				
			}, onProgress, onError );

		// ---------------------------------------------------------------------------
		
		renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.BasicShadowMap;
		container.appendChild( renderer.domElement );


		// --------------------------- Event listeners -------------------------------

		// Mouse and touch action start listeners
		['mousedown', 'touchstart'].forEach(
		evt => container.addEventListener( evt, (event) => {
			event.preventDefault();
			if (!centering) {
				if (event.type == 'mousedown') {
					dragging = true;
					lastX = ( event.clientX - windowHalfX ) / 2;
					lastY = ( event.clientY - windowHalfY ) / 2;
				} else {
					if (event.touches.length === 2) {
						scaling = true;
						fingerDist = Math.hypot(
					    	event.touches[0].pageX - event.touches[1].pageX,
							event.touches[0].pageY - event.touches[1].pageY
						);
					} else {
						dragging = true;
						lastX = event.touches[0].clientX;
						lastY = event.touches[0].clientY;
					}
				}
			}
		}, false ));

		// Mouse and touch action stop listeners
		['mouseup', 'touchend', 'touchcancel'].forEach(
		evt => container.addEventListener( evt, (event) => {
			event.preventDefault();
			if (!centering) {
				dragging = false;
				scaling = false;
				scalingValue = 0;
				inertia = true;
			}
		}, false ));

		// Mouse and touch move listeners
		container.addEventListener( 'mousemove', onDocumentMouseMove, false );
		container.addEventListener( 'touchmove', onDocumentMouseMove, false );

		// Scroll weel listener
		container.addEventListener('DOMMouseScroll', wheelZoom, false);
		window.addEventListener( 'resize', onWindowResize, false );

		// Snapshot
		document.getElementById("snapshot-downloader").addEventListener('click', saveAsImage);
		document.getElementById("snapshot-trigger").addEventListener('click', snapshot);

		// Arrow click
		const arrowOpener = document.getElementById("arrow-opener");
		arrowOpener.addEventListener('click', function(e) {
			const materials = document.getElementById("controls-container");
			if (e.target.className === "right") {
				materials.style.left = "100vw";
				arrowOpener.className = "left";
			} else {
				materials.style.left = "80vw";
				arrowOpener.className = "right";
			}
		});

		// Sections navigation
		let configureButton = document.getElementById("configure-button");
		configureButton.addEventListener('click', function() {
			configureButton.className = "section-active";
			orderButton.className = "";
			let order = document.getElementById("order");
			order.style.left = "100%";
			let materials = document.getElementById("materials");
			materials.style.right = "0";
		});

		let orderButton = document.getElementById("order-button");
		orderButton.addEventListener('click', function() {
			orderButton.className = "section-active";
			configureButton.className = "";
			let order = document.getElementById("order");
			order.style.left = "0";
			let materials = document.getElementById("materials");
			materials.style.right = "100%";
		});

		// Center geometry button
		const centeringButton = document.getElementById("center-geometry");
		centeringButton.addEventListener('click', () => { if (chair) centering = true });

		// AR start button
		const arStart = document.getElementById("ar-start");
		arStart.addEventListener('click', () => {
			confirmBox(
			"You must need the marker for AR experience",
			"Please download it and print",
			"Ok",
			"Back",
			downloadMarker
			);
		});

		// AR stop button
		const arStop = document.getElementById("ar-stop");
		arStop.addEventListener('click', stopAR);
	}

	function snapshot() {
		let container = document.getElementById("snapshot");
		let snapshot = document.getElementById("snapshot-image");

		var strMime = "image/jpeg";
        let imgData = renderer.domElement.toDataURL(strMime);
        imgData.replace(strMime, STANDARD_DOWNLOAD_MIME);
        currentSnapshot = imgData;

        flash();

        snapshot.src = imgData;
        container.className = "";
	}

	function saveAsImage() {
        var imgData, imgNode;
        try {
            var strMime = "image/jpeg";
     
            saveFile(
            	currentSnapshot,
            	"Chair_" + snapshot_seq_number + ".jpg"
            );
        } catch (e) {
            console.log(e);
            return;
        }
    }

    var saveFile = function (strData, filename) {
        var link = document.createElement('a');
        if (typeof link.download === 'string') {
            document.body.appendChild(link); //Firefox requires the link to be in the body
            link.download = filename;
            link.href = strData;
            link.click();
            document.body.removeChild(link); //remove the link when done
            snapshot_seq_number++;
        } else {
            location.replace(uri);
        }
    }

	function loadTexture(file, repetitions) {
		var texture = new THREE.TextureLoader().load( file , function ( texture ) {
			texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set( repetitions, repetitions );
	 		texture.offset.set( 0, 0 );
			texture.needsUpdate = true;
			render();
		} );
		return texture;
	}

	function createMaterial(path, type, repetitions) {

		if (type !== "metal" && type !== "wood") {
			displacementMap = loadTexture( path + "disp.jpg", repetitions );
		} else {
			displacementMap = null;
		}

		diffuseMap = loadTexture( path + "diff.jpg", repetitions );
		roughnessMap = loadTexture( path + "rgh.jpg", repetitions );
		normalMap = loadTexture( path + "nrm.jpg", repetitions );

		let newMaterial = new THREE.MeshStandardMaterial({
			normalMap: normalMap,
			map: diffuseMap,
			roughnessMap: roughnessMap,
			displacementMap: displacementMap,
			metalness: 0.0
		});

		return newMaterial;

	}

	function createTexturePreview( part, material, index ) {
		let container = document.createElement("div");
		container.className = "material-container";

		let title = document.createElement("p");
		title.innerText = material[1].name;
		title.className = (index == 0) ? "material-name selected" : "material-name";

		let div = document.createElement("div");
		const url = material[1].image;
		div.className = (index == 0) ? "material-preview selected" : "material-preview";
		div.style.backgroundImage = "url('" + url + "')";
		div.style.backgroundSize = "cover";

		title.onclick = () => {
			changeTexture(part, materials[material[0]]);
			changeSelection(part, div, title);
		};

		div.onclick = () => {
			changeTexture(part, materials[material[0]]);
			changeSelection(part, div, title);
		};

		container.appendChild(title);
		container.appendChild(div);

		return container;
	}

	function changeSelection(part, div, title) {
		let container;
		switch (part) {
			case SIT:
				container = document.getElementById("sit-materials-container");
				break;
			case BASE:
				container = document.getElementById("base-materials-container");
				break;
			case ARMS:
				container = document.getElementById("arms-materials-container");
				break;
			default: break;
		}

		if (container.childNodes) {
			Object.values(container.childNodes).map((child) => {
				Object.values(child.childNodes).map((div) => {
				if (div.nodeName == "DIV") div.className = "material-preview";
				if (div.nodeName == "P") div.className = "material-name";
				});
			});
		};
		div.className = "material-preview selected";
		title.className = "material-name selected";
	}

	function changeTexture( part, material ) {
		let newMaterial = createMaterial(
			material.path,
			material.type,
			material.repetitions
		);

		chair.traverse(function(child) {
			if ( part.includes(child.name) ) {
				child.material = newMaterial;
				child.material.needsUpdate = true;
			}
		});
	}

	function createSpotlight( color, strength, castShadow ) {
		var light = new THREE.SpotLight( color, strength );
		light.castShadow = castShadow;
		light.angle = 0.6;
		light.penumbra = 0.2;
		light.decay = 2;
		light.distance = 130;
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 2048;

		return light;
	}

	function onTransitionEnd( event ) {
		event.preventDefault();
		const element = event.target;
		element.remove();
	}

	function onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function onDocumentMouseMove( event ) {
		event.preventDefault();

		if (!centering) {
			if (dragging) {
				if (event.type == "mousemove") {
					mouseX = ( event.clientX - windowHalfX ) / 2;
					mouseY = ( event.clientY - windowHalfY ) / 2;
				} else {
					mouseX = event.changedTouches[0].clientX;
					mouseY = event.changedTouches[0].clientY;
				}

				incrementX = mouseX - lastX;
				incrementY = mouseY - lastY;

				lastX = mouseX;
				lastY = mouseY;
			}

			if (scaling) {
			    let newDistance = Math.hypot(
			    	event.touches[0].pageX - event.touches[1].pageX,
					event.touches[0].pageY - event.touches[1].pageY
				);
				scalingValue = newDistance - fingerDist;
				fingerDist = newDistance;

				// Bug with finger zoom
				if (camera.position.z < MIN_CAMERA_Z ) {
					if (scalingValue > 0) camera.position.z += Math.floor(scalingValue * 0.05);
				} else if (camera.position.z > MAX_CAMERA_Z) {
					if (scalingValue < 0) camera.position.z += Math.floor(scalingValue * 0.05);
				} else {
					camera.position.z += Math.floor(scalingValue * 0.05);
				}
			}
		}
	}

	function wheelZoom(event) {
		event.preventDefault();

		if (!centering) {
			var delta = 0;

			if (!event) event = window.event; // For IE

			if ( event.clientX < window.innerWidth * 0.8 ) {

				if (event.wheelDelta) {
					delta = event.wheelDelta / 120; // IE, Opera
				} else if (event.detail) {
					delta = -event.detail / 3; // In Mozilla
				}
				// Positive Delta = wheel scrolled up,
				// Negative Delta = wheel scrolled down.
				if (delta) {
					if (camera.position.z < MIN_CAMERA_Z ) {
						if (delta > 0) camera.position.z += delta;
					} else if (camera.position.z > MAX_CAMERA_Z) {
						if (delta < 0) camera.position.z += delta;
					} else {
						camera.position.z += delta;
					}
				}
			}
		}
	}
	
	function animate() {

		if (!centering) {
			// Normal behaviour
			if (chair) {
				if (chair.rotation.x > MAX_ROTATION_X) {
					if ( incrementY < 0 ) {
						chair.rotation.x += ( incrementY * DEG );
						ground.rotation.x += ( incrementY * DEG );
					}
				} else if (chair.rotation.x < MIN_ROTATION_X) {
					if ( incrementY > 0 ) {
						chair.rotation.x += ( incrementY * DEG );
						ground.rotation.x += ( incrementY * DEG );
					}
				} else {
					chair.rotation.x += ( incrementY * DEG );
					ground.rotation.x += ( incrementY * DEG );
				}

				chair.rotation.y += ( incrementX * DEG );
				if (chair.rotation.y > 2*Math.PI) chair.rotation.y = 0;
				if (chair.rotation.y < -2*Math.PI) chair.rotation.y = 0;
			}

			// Apply inertia
			if (inertia) {
				if (incrementX != 0) incrementX = incrementX / INERTIA_FACTOR;
				if (incrementY != 0) incrementY = incrementY / INERTIA_FACTOR;
				if (incrementX == 0 && incrementY == 0) inertia = false;
			}

		} else {
			// Centering animation
			// Return to default camera z
			let z = camera.position.z;
			if (z !== CAMERA_DEFAULT_Z) {
				if (z > CAMERA_DEFAULT_Z) {
					camera.position.z -= 2;
					if (camera.position.z < CAMERA_DEFAULT_Z) {
						camera.position.z = CAMERA_DEFAULT_Z;
					}
				} else {
					camera.position.z += 2;
					if (camera.position.z > CAMERA_DEFAULT_Z) {
						camera.position.z = CAMERA_DEFAULT_Z;
					}
				}
			}

			// Return to default chair rotation x (0)
			let rotX = chair.rotation.x;
			if (rotX !== DEFAULT_ROTATION_X) {
				if (rotX > DEFAULT_ROTATION_X) {
					chair.rotation.x -= 5*DEG;
					ground.rotation.x -= 5*DEG;
					if (chair.rotation.x < DEFAULT_ROTATION_X) {
						chair.rotation.x = DEFAULT_ROTATION_X;
						ground.rotation.x = -Math.PI / 2.0 + DEFAULT_ROTATION_X;
					}
				} else {
					chair.rotation.x += 5*DEG;
					ground.rotation.x += 5*DEG;
					if (chair.rotation.x > DEFAULT_ROTATION_X) {
						chair.rotation.x = DEFAULT_ROTATION_X;
						ground.rotation.x = -Math.PI / 2.0 + DEFAULT_ROTATION_X;
					}
				}
			}

			// Return to default chair rotation y
			let rotY = chair.rotation.y;
			if (rotY !== DEFAULT_ROTATION_Y) {
				let delta = rotY % (2*Math.PI) - DEFAULT_ROTATION_Y;
				if (delta > 0 && delta < Math.PI) {
					chair.rotation.y -= 10*DEG;
					if (chair.rotation.y < DEFAULT_ROTATION_Y) {
						chair.rotation.y = DEFAULT_ROTATION_Y;
					}
				} else {
					chair.rotation.y += 10*DEG;
					if (chair.rotation.y > DEFAULT_ROTATION_Y) {
						chair.rotation.y = DEFAULT_ROTATION_Y;
					}
				}
			}

			centering = !(
				chair.rotation.y === DEFAULT_ROTATION_Y
				&& chair.rotation.x === DEFAULT_ROTATION_X
				&& camera.position.z === CAMERA_DEFAULT_Z
			);
		}

		requestAnimationFrame( animate );
		render();
	}

	function render() {
		renderer.render( scene, camera );
	}

	function flash() {
		$('.flash')
		.show()  //show the hidden div
		.animate({opacity: 0.5}, 300) 
		.fadeOut(300)
		.css({'opacity': 1});
	}

	// AR JsARToolKit ----------------------------------------------
	function startAR() {
		// connect to webcam
		var video = document.getElementById("hiddenVideo");	
		var constraints = {audio: false, video: true};
		navigator.mediaDevices.getUserMedia(constraints)
		.then(function(stream){
			window.localStream = stream;
			video.srcObject = stream;
			video.onloadedmetadata = startProcessing;
		})
		.catch(function(err){
			alert(err.name + ": " + err.message);	
			video.src = "marker.webm";
			return;
		});
	}

	function stopAR() {
		var video = document.getElementById("hiddenVideo");
		var arStop = document.getElementById("ar-stop");
		var arContainer = document.getElementById("ar-container");

		video.srcObject = null;
		arContainer.style.display = "none";
		arStop.style.display = "none";

		localStream.getTracks().forEach(track => track.stop());
	}

	function downloadMarker() {
		try {
			saveFile( marker.src, "Marker.png" );
		} catch (e) {
        	console.log(e);
        	return false;
    	}
    	startAR();
	}

	function startProcessing(event) {

		// Set up video and canvas
		var hvideo = document.getElementById("hiddenVideo");
		var hcanvas = document.getElementById("hiddenCanvas");
		var dcanvas = document.getElementById("drawingCanvas");
		var ocanvas = document.getElementById("outCanvas");
		var arStop = document.getElementById("ar-stop");
		var arContainer = document.getElementById("ar-container");

		hcanvas.width = ocanvas.width = dcanvas.width = 1.5*hvideo.clientWidth;
		hcanvas.height = ocanvas.height = dcanvas.height = 1.5*hvideo.clientHeight;

		arContainer.style.display = "block";

		ocanvas.style.width = ocanvas.width;
		ocanvas.style.height = ocanvas.height;
		ocanvas.style.position = "fixed";
		ocanvas.style.top = (window.innerHeight - ocanvas.height) / 2 + "px";
		ocanvas.style.left = (window.innerWidth - ocanvas.width) / 2 + "px";

		arStop.style.display = "block";
		
		// setup JSARToolKit
		var ART_raster = new NyARRgbRaster_Canvas2D(hcanvas);
		var ART_param = new FLARParam(hcanvas.width, hcanvas.height);
		var ART_detector = new FLARMultiIdMarkerDetector(ART_param, 65);
		ART_detector.setContinueMode(true);
		
		// setup three.js
		var renderer = new THREE.WebGLRenderer({ canvas: dcanvas, antialias: true });
		renderer.autoClear = false;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.BasicShadowMap;
		
		// create the background plane and its own camera
		var bgTexture = new THREE.Texture(hcanvas);
		bgTexture.minFilter = THREE.LinearFilter;
		var bgPlane = new THREE.Mesh(
			new THREE.PlaneGeometry(2,2),
			new THREE.MeshBasicMaterial({
				map: bgTexture,
				depthTest: false,  // disable Z-Buffering
				depthWrite: false
			})
		);

		var bgCamera = new THREE.OrthographicCamera(-1,1,1,-1);
		bgCamera.position.z = 1;
		
		var bgScene = new THREE.Scene();
		bgScene.add(bgPlane);
		bgScene.add(bgCamera);
		
		// set up the main scene and camera with JSART parameters
		var scene = new THREE.Scene();
		var camera = new THREE.Camera();
		camera.position.z = 30;
		var tmp = new Float32Array(16);
		ART_param.copyCameraMatrix(tmp, 1, 10000);
		camera.projectionMatrix = ConvertCameraMatrix(tmp);
		scene.add(camera);
		
		// create a container with some stuff in it
		var container = new THREE.Object3D();
		container.matrixAutoUpdate = false;

		// adding lights
		var light = new THREE.PointLight(0xffffff, 0.6);
		light.position.set(90,50,10);
		//light.castShadow = true;

		var ambientLight = new THREE.AmbientLight( 0xffffff, 0.6 );

		// Copy chair
		var chairAR = chair.clone();
		chairAR.rotation.x = 0;
		chairAR.rotation.y = 0;
		chairAR.scale.set(2, 2, 2);
		chairAR.castShadow = true;

		/*
		// Copy ground
		var shadowMaterial = new THREE.ShadowMaterial();
		shadowMaterial.opacity = 0.5;
		var groundAR = new THREE.Mesh(ground.geometry, shadowMaterial);
		groundAR.rotation.x = -Math.PI / 2;
		groundAR.scale.set(2, 2, 2);
		groundAR.receiveShadow = true;
		container.add(groundAR);
		*/

		scene.add( ambientLight, light );
		container.add(chairAR);
		scene.add(container);
		
		// process each frame
		setInterval(function(){

			render();
		
			// update the hidden canvas 
			hcanvas.getContext("2d").drawImage(hvideo, 0, 0, hcanvas.width, hcanvas.height);
			hcanvas.changed = true;
			bgTexture.needsUpdate = true;
			
			// draw background
			renderer.clear();
			renderer.render(bgScene, bgCamera);
			
			// detect markers
			var markerCount = ART_detector.detectMarkerLite(ART_raster, 128);
			if(markerCount > 0){
				var tmat = new NyARTransMatResult();
				ART_detector.getTransformMatrix(0, tmat);
				
				// we have detected a marker. Use the matrix to position the object and draw it
				container.matrix = ConvertMarkerMatrix(tmat);
				requestAnimationFrame( render );
				renderer.render(scene, camera);
			}
			
			// dcanvas now ready. Copy it to ocanvas to show it
			ocanvas.getContext("2d").drawImage( dcanvas, 0, 0, dcanvas.width, dcanvas.height );
		}, 40);

		function render() {

		}
	}
	
	// convert the camera projection matrix from JSARToolKit to Three.js format
	function ConvertCameraMatrix(m) {
		myMat = new THREE.Matrix4();
		myMat.set(
			m[0], m[4], m[8], m[12],
			-m[1], -m[5], -m[9], -m[13],
			m[2], m[6], m[10], m[14],
			m[3], m[7], m[11], m[15]	
		);
		return myMat;
	}
	
	// convert the marker matrix from JSARToolKit to Three.js format
	function ConvertMarkerMatrix(m){
		myMat = new THREE.Matrix4();
		myMat.set(
			m.m00, m.m02, -m.m01, m.m03,
			m.m10, m.m12, -m.m11, m.m13, 
			m.m20, m.m22, -m.m21, m.m23,
			0, 0, 0, 1	
		);
		return myMat;
	}

	function confirmBox(title, message, okText, cancelText, onOk) {

		let container = document.getElementById('confirm-container');
		container.style.display = "block";

		let titleText = document.getElementById('confirm-title');
		let messageText = document.getElementById('confirm-message');

		let okButton = document.getElementById('confirm-ok-button');
		okButton.onclick = () => {
			hideConfirm();
			if (onOk) onOk();
			return true;
		}

		let cancelButton = document.getElementById('confirm-cancel-button');
		cancelButton.onclick = () => { hideConfirm(); return false; }

		titleText.innerText = (title) ? title : "Confirm";
		messageText.innerText = (message) ? message : "";
		okButton.innerText = (okText) ? okText : "Ok";
		cancelButton.innerText = (cancelText) ? cancelText : "Cancel";

		window.addEventListener('keydown', keyControls, false);

		function keyControls(event) {
			console.log(event.keyCode);
			switch (event.keyCode) {
				case 37:
					document.getElementById("confirm-ok-button").focus();
					break;
				case 39:
					document.getElementById("confirm-cancel-button").focus();
					break;
				default:
					break;
			}
		}

		function hideConfirm() {
			window.removeEventListener('keydown', keyControls, false);
			container.style.display = "none";
		}

	}

});