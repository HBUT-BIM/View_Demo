	var HBUT = {};
//	var info, stats, renderer, scene, camera, controls;

	var obj, light;

    var lastMeshMaterial, lastMeshID, lastObjectMaterial, lastObjectID;

	HBUT.fname = 'Room.rvt.js';

	var pi = Math.PI, pi05 = pi * 0.5, pi2 = pi + pi;
	var d2r = pi / 180, r2d = 180 / pi;  // degrees / radians

	var projector;
	var targetList = [];

	//初始化&动态加载模型信息
	function init(fname) {
		var geometry, material, mesh;
        lastMeshMaterial = -1;
        lastMeshID = -1;
        lastObjectMaterial = -1;
        lastObjectID = -1;

        //菜单字体
		//document.body.style.cssText = 'font: 600 12pt monospace; margin: 0; overflow: hidden' ;
		HBUT.info = document.body.appendChild( document.createElement( 'div' ) );
		HBUT.info.style.cssText = 'background-color: #ccc; left: 20px; opacity: 0.85; position: absolute; top: 35px; ';//模型信息显示样
        console.log();
		//FPS窗口
		HBUT.stats = new Stats();
		HBUT.stats.domElement.style.cssText = 'bottom: 0; position: absolute; left: 0; zIndex: 100; ';//FPS状态信息图标样式
		document.body.appendChild( HBUT.stats.domElement );

		HBUT.renderer = new THREE.WebGLRenderer( { alpha: 1, antialias: true, clearColor: 0xffffff }  );
		HBUT.renderer.setSize( window.innerWidth, window.innerHeight );
		HBUT.renderer.shadowMapEnabled = true;
		document.body.appendChild( HBUT.renderer.domElement );
		HBUT.scene = new THREE.Scene();

		HBUT.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000000000000 );
		HBUT.camera.position.set( 15000, 15000, 15000 );
		HBUT.controls = new THREE.OrbitControls( HBUT.camera, HBUT.renderer.domElement );

		projector = new THREE.Projector();
		document.addEventListener( 'click', clickHandler, false );

		loadJS( fname );
	}

			
	function loadJS (fname) {
		if ( HBUT.scene ) HBUT.scene.remove( obj );
		targetList = [];
		var loader = new THREE.ObjectLoader();
        loader.load( fname, function( result ){
            HBUT.scene = result;

// lights
		HBUT.scene.add( new THREE.AmbientLight( 0x444444 ) );
		updateLight();

// axes
            HBUT.scene.add( new THREE.ArrowHelper( v(1, 0, 0), v(0, 0, 0), 30, 0xcc0000) );
            HBUT.scene.add( new THREE.ArrowHelper( v(0, 1, 0), v(0, 0, 0), 30, 0x00cc00) );
            HBUT.scene.add( new THREE.ArrowHelper( v(0, 0, 1), v(0, 0, 0), 30, 0x0000cc) );

// ground box
            geometry = new THREE.BoxGeometry( 20000, 100, 20000 );
            material = new THREE.MeshBasicMaterial( { color: 0xaaaaaa } );
            mesh = new THREE.Mesh( geometry, material );
            mesh.position.set( 0, -10, 0 );
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            //HBUT.scene.add( mesh );

            //call compute function
            computeNormalsAndFaces();
        });
	}

	function updateLight() {
			if ( light ) { HBUT.scene.remove( light ); }
            light = new THREE.DirectionalLight( 0xffffff, 1 );
		    var pos = convertPosition(  43, -75, 10000 );

            light.position = pos;
            light.castShadow = true;
            light.shadowMapWidth = 2048;
            light.shadowMapHeight = 2048;
            var d = 10000;
            light.shadowCameraLeft = -d;
            light.shadowCameraRight = d;
            light.shadowCameraTop = d * 2;
            light.shadowCameraBottom = -d * 2;

            light.shadowCameraNear = 1000;
            light.shadowCameraFar = 20000;
//            light.shadowCameraVisible = true;
            HBUT.scene.add( light );
	}

	function convertPosition( lat, lon, radius ) {
		var rc = radius * Math.cos( lat * d2r );
		return v( rc * Math.cos( lon * d2r ), radius * Math.sin( lat * d2r ), rc * Math.sin( lon * d2r) );
	}


	function resetCamera() {
		HBUT.controls.target.set( 0, 0, 0  );
		HBUT.camera.position.set( 15,000, 15000, 15000 );
		HBUT.camera.up = v( 0, 1, 0 );
	}


	function v( x, y, z ){ return new THREE.Vector3( x, y, z ); }

	function animate() {
		requestAnimationFrame( animate );
		HBUT.renderer.render( HBUT.scene, HBUT.camera );
		HBUT.controls.update( );
		HBUT.stats.update();
	}

	function computeNormalsAndFaces() {
		for(var i=0; i<HBUT.scene.children.length; i++){
			if( HBUT.scene.children[i].hasOwnProperty("geometry")){
				HBUT.scene.children[i].geometry.mergeVertices();
				HBUT.scene.children[i].castShadow = true;
				HBUT.scene.children[i].geometry.computeFaceNormals();
                targetList.push( HBUT.scene.children[i] );
			}
            if( HBUT.scene.children[i].children.length > 0 ){
                for (var k=0; k<HBUT.scene.children[i].children.length ; k++){
                    if(HBUT.scene.children[i].children[k].hasOwnProperty("geometry")){
                        targetList.push(HBUT.scene.children[i].children[k]);
                    }
                }
            }
		}
	}

    var selMaterial;

	function displayAttributes( obj ) {
        HBUT.info.innerHTML = '<div id=msg style=font-size:10pt;padding:8px; ></div>';

		msg.innerHTML = '';
		var arr = Object.keys( obj );
		for (var i = 0, len = arr.length; i < len; i++) {
			if ( obj[arr[i]] != undefined) {
				if ( obj[arr[i]].indexOf('http') == 0) {
					msg.innerHTML += '<a href="'+obj[arr[i]]+'">Click here</a><br>';
				} else {
					msg.innerHTML += arr[i] + '： ' + obj[ arr[i] ] + '<br>';
				}
			}
		}
	}


    function clickHandler(event){
// console.log( event );
        event.preventDefault();

        selMaterial = new THREE.MeshBasicMaterial( { color: 'red', side: '2' });   //color for selected mesh element

        //When clicking without selecting object, replace temp material for meshes and object3D
        if(lastMeshMaterial!=-1)
        {
            //reset last material for last lastMeshID
            for(var i = 0; i < HBUT.scene.children.length; i++)
            {
                if (HBUT.scene.children[i].id == lastMeshID)
                {
                    HBUT.scene.children[i].material = lastMeshMaterial;
                }
            }
        }

        if(lastObjectMaterial!=-1)
        {
            //reset last material for last lastObjectID
            for(var i = 0; i < HBUT.scene.children.length; i++)
            {
                if (HBUT.scene.children[i].id == lastObjectID)
                {
                    for (var ii = 0; ii < HBUT.scene.children[i].children.length; ii++)
                    {
                        HBUT.scene.children[i].children[ii].material = lastObjectMaterial;
                    }

                }
            }
        }


        var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
        projector.unprojectVector( vector, HBUT.camera );

        var raycaster = new THREE.Raycaster( HBUT.camera.position, vector.sub( HBUT.camera.position ).normalize() );
        //var raycaster = new THREE.Raycaster( HBUT.camera.position, vector.sub( ).normalize() );

        var intersects = raycaster.intersectObjects( targetList );
        //var intersects = raycaster.intersectObjects( HBUT.scene.children.geometry );

        if ( intersects.length > 0 ) {

         //   intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
         //console.log(intersects[0].object.userData);

         var j =0;
         while(j<intersects.length){
             //FOR MESHES:
             if(!$.isEmptyObject(intersects[j].object.userData)){
                 console.log(intersects[j].object.userData);


                 if(lastMeshMaterial!=-1)
                 {
                     //reset last material for last lastMeshID
                     for(var i = 0; i < HBUT.scene.children.length; i++)
                     {
                         if (HBUT.scene.children[i].id == lastMeshID)
                         {
                             HBUT.scene.children[i].material = lastMeshMaterial;
                         }
                     }
                 }

                 //set lastMaterial
                 lastMeshMaterial = intersects[j].object.material;

                 //set lastMeshID
                 lastMeshID = intersects[j].object.id;

                 //apply SelMaterial
                 intersects[j].object.material = selMaterial;


                displayAttributes( intersects[j].object.userData );

                 break;
             }
             //FOR OBJECT3D
             if(!$.isEmptyObject(intersects[j].object.parent.userData)){
                 console.log(intersects[j].object.parent.userData);

                 if(lastObjectMaterial!=-1)
                 {
                     //reset last material for last lastObjectID
                     for(var i = 0; i < HBUT.scene.children.length; i++)
                     {
                         if (HBUT.scene.children[i].id == lastObjectID)
                         {
                             for (var ii = 0; ii < HBUT.scene.children[i].children.length; ii++)
                             {
                                 HBUT.scene.children[i].children[ii].material = lastObjectMaterial;
                             }

                         }
                     }
                 }

                 //set lastMaterial
                 lastObjectMaterial = intersects[j].object.material;

                 //set lastObjectID
                 lastObjectID = intersects[j].object.parent.id;

                 //apply SelMaterial
                 intersects[j].object.material = selMaterial;

                displayAttributes( intersects[j].object.parent.userData );
                 break;
             }
             j++;
         }

        } else {
			msg.innerHTML = '';
		}
	}
