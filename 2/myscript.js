var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
var width = window.innerWidth;
var height = window.innerHeight

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, transparent: true, opacity: 0.85 });
var matterialUser = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, transparent: true, opacity: 0.85 });

var LEFT = false;
var RIGHT = false;
var UP = false;
var DOWN = false;

var points = 0;

function positiveOrNegative() {
    if (Math.random() > 0.5)
        return 1;
    else
        return -1;
}

function setUp(userX, userY, userZ) {
    points = 0;

    LEFT = false;
    RIGHT = false;
    UP = false;
    DOWN = false;

    camera.position.z = 5;
    var userCube = new THREE.Mesh(geometry, matterialUser);
    userCube.position.set(userX, userY, userZ);
    scene.add(userCube)

    for (var i = 0; i < 30; i++) {
        var cube = new THREE.Mesh(geometry, material);
        var z = (-Math.floor(Math.random() * 10)) - 10
        var x = positiveOrNegative() * Math.floor(Math.random() * 15)
        var y = positiveOrNegative() * Math.floor(Math.random() * 15)
        cube.position.set(x, y, z)
        scene.add(cube)
    }

}

function ifObjectIntersetcsUser(index, userX, userY, userZ) {
    o1x = scene.children[index].position.x
    o1y = scene.children[index].position.y
    o1z = scene.children[index].position.z
    if (Math.abs(o1x - userX) <= 1 && Math.abs(o1y - userY) <= 1 && Math.abs(o1z - userZ) <= 1)
        return true
    else
        return false
}

function render() {
    points++



    if (LEFT && (scene.children[0].position.x - camera.position.x) > -6) {
        scene.children[0].position.x -= 0.05
        camera.position.x -= 0.04;
    }

    if (RIGHT && (scene.children[0].position.x - camera.position.x) < 6) {
        scene.children[0].position.x += 0.05
        camera.position.x += 0.04
    }

    if (UP && (scene.children[0].position.y - camera.position.y) < 3) {
        scene.children[0].position.y += 0.05
        camera.position.y += 0.04
    }

    if (DOWN && (scene.children[0].position.y - camera.position.y) > -3) {
        scene.children[0].position.y -= 0.05
        camera.position.y -= 0.04
    }

    var userX = scene.children[0].position.x
    var userY = scene.children[0].position.y
    var userZ = scene.children[0].position.z

    scene.children.forEach(function(value, index, arr) {
        if (index > 0) {
            value.position.z += 0.05;
            if (value.position.z >= 5) {
                value.position.z = -Math.floor(Math.random() * 16)
                value.position.x = positiveOrNegative() * Math.floor(Math.random() * 15) + scene.children[0].position.x
                value.position.y = positiveOrNegative() * Math.floor(Math.random() * 15) + scene.children[0].position.y
            }
            if (ifObjectIntersetcsUser(index, userX, userY, userZ)) {
                alert("Game over! Points:" + points)

                while (scene.children.length > 0) {
                    scene.remove(scene.children[0]);
                }
                setUp(userX, userY, userZ)
            }
        }
    })

    if (points > 1000) {
        alert("You've won! Points:" + points)

        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
        setUp(userX, userY, userZ)
    }
    requestAnimationFrame(render)
    renderer.render(scene, camera);
}

document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            LEFT = true;
            break;
        case 39:
            RIGHT = true;
            break;
        case 38:
            UP = true;
            break;
        case 40:
            DOWN = true;
            break;
    }
}

document.onkeyup = function(e) {
    switch (e.keyCode) {
        case 37:
            LEFT = false;
            break;
        case 39:
            RIGHT = false;
            break;
        case 38:
            UP = false;
            break;
        case 40:
            DOWN = false;
            break;
    }
}

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
setUp(0, 0, 0)
render()