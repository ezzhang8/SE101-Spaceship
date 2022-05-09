import Game from "./game.js";

let game:Game|null; // Initialized properly in DOM.doneLoad().

const windowSize = { // Accessible through game.width and game.height.
	x: 72,
	y: 54,
    border: 2
}
const unit = ((window.innerWidth - windowSize.border * 2) / (window.innerHeight - windowSize.border * 2) > windowSize.x / windowSize.y) ? Math.floor((window.innerHeight - windowSize.border * 2) / windowSize.y) : Math.floor((window.innerWidth - windowSize.border * 2) / windowSize.x);

// Initialize the CSS variables so that the css can do dynamic calculations for displays.
document.body.style.setProperty("--unit", unit + "px");
document.body.style.setProperty("--border", windowSize.border + "px");
document.body.style.setProperty("--width", windowSize.x + "");
document.body.style.setProperty("--height", windowSize.y + "");

let spritePath = "Sprites/";
let imagesLoaded = 0; // Updates as the images load, until all are loaded.
let images:any = {}; // image locations, by name
let contexts:any = {}; // contexts, by name
let galaxies = ["test", "Alpha", "Beta", "Gamma"];
let ships = ["Bebop", "Bismark", "Enterprise", "Event Horizon", "Flying Dutchman", "Galactica", "Milano", "Normandy", "Nostromo", "Pillar Of Autumn", "Planet Express", "Rama", "Red Dwarf", "Serenity", "ssAnne", "Thunderbird III", "Yamato"];

function initializeImages(imageInfo:any) {
    /* Create the images with the given info: [imageName, src]. */
    for (let i = 0; i < imageInfo.length; i++) {
        let image = new Image();
        image.src = spritePath + imageInfo[i][1];
        image.onload = () => iterateLoad(imageInfo.length);
        images[imageInfo[i][0]] = image;
    }
}

function initializeShipSelect(shipNames:string[], active:string) {
    /* Create the ship DOM elements with the given names, in alphabetical order. */
    let activeShipSet = false;
    let firstShip;
    for (let i = 0; i < shipNames.length; i++) {
        let ship = document.createElement("FIGURE");
        ship.id = shipNames[i];
        ship.innerHTML = shipNames[i];
        ship.onclick = function() {console.log(this); DOM.shipActive(this);}
        if (shipNames[i].length >= 12) ship.classList.add("small");
        if (shipNames[i] === active) {
            ship.classList.add("active");
            activeShipSet = true;
        }
        let ShipSelectElement = document.body.querySelector("#ShipSelect");
        if (ShipSelectElement) ShipSelectElement.appendChild(ship);
        else throw Error("Element ShipSelect not found");
        if (i===0) firstShip = ship;
    }
    if (!activeShipSet) {
        if (firstShip) firstShip.classList.add("active");
        else throw Error("firstShip not found");
    }
}

function initializeContexts(contextNames:string[]) {
    /* Create the contexts with the given names: first name is the farthest back. */
    for (let i = 0; i < contextNames.length; i++) {
        let canvas:HTMLCanvasElement = document.createElement("CANVAS") as HTMLCanvasElement;
        canvas.id = contextNames[i];
        canvas.width = unit * windowSize.x;
        canvas.height = unit * windowSize.y;
        let canvasHolderElement = document.body.querySelector(".canvasHolder");
        if (canvasHolderElement) canvasHolderElement.appendChild(canvas);
        else throw Error("Element canvasHolder not found");
        let ctx = canvas.getContext('2d');
        if (ctx){
            ctx.imageSmoothingEnabled = false;
            contexts[contextNames[i]] = ctx;
        } else throw Error("Failed to create context");
    }
}


function iterateLoad(length:number) {
    imagesLoaded++;
    if (imagesLoaded >= length) {

        // **** This begins the whole system! *** //

        DOM.doneLoad();

    }
}

function storageAvailable(type:any) {
    let storage:any;
    try {
        storage = window[type];
        let x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            e.code === 22 ||
            e.code === 1014 ||
            e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
        ) && (storage && storage.length !== 0);
    }
}


// localStorage.setItem('data', JSON.stringify(DOM.data));
// DOM.data = JSON.parse(localStorage.getItem('data'));


let DOM:any = {
    loaded: false,
    gameInitialized: false,
    canStore: false,
    data: {
        "veryFirst": true, // NOT CHANGED BY USER: Haven't ever pressed play on the game before...
        "skipMenu": false, // `true`: skip menu; get right in to the game!
        "defaultShip": "Bebop", // Ship the camera follows
        "devDisplay": true, // The default toggle state of the dev window when starting to play
        "defaultGalaxy": 0, // Galaxy index default
        "manualControls": true, // Use manual controls, not student-programmed systems
        "allShips": false, // Watch all ships?
        "zoom": 1 // zoom aspect ratio (1 vs 2.5)
    },
    elements: {
        "TitleStart": document.querySelector("#Title .start"), // `Start` button on first title screen
        "TitleWarning": document.querySelector("#Title .warning"), // Storage warning on the title screen
        "checkboxes": document.querySelectorAll("input[type='checkbox']"), // An array of the checkboxes
        "Info": document.querySelector("#Info"), // Info button
        "PauseButton": document.querySelector("#PauseButton"),
        "GalaxyName": document.querySelector("#GalaxyName"),
        "SolarSystemName": document.querySelector("#SolarSystemName"),
        "DevTools": document.querySelector("#DevTools"),
        "ShipSelect": document.querySelector("#ShipSelect"), // Ship selection menu holder
        "SolarFade": document.querySelector("#SolarFade"), // `div` for fading between solar systems
        "galaxy1": document.querySelector("#galaxy1"), // First galaxy :)
        "galaxy2": document.querySelector("#galaxy2"),
        "galaxy3": document.querySelector("#galaxy3"),
        "galaxy4": document.querySelector("#galaxy4"),
    } as any,
    menus: {
        "Title": document.querySelector("#Title"), // Very first title screen
        "Game": document.querySelector("#Game"), // Game menu; appears when in the game (dev tools, etc)
        "Main": document.querySelector("#Main"), // Main ship, galaxy, and preference selection page
    },
    previousDamage: [0, 0], // [<previousDamage>, <number of layered animations>]
    initialize() {
        // Event Listeners
        document.addEventListener("click", function (event:any) {
            if (event.target.tagName !== "FIGURE") {
                if (DOM.elements["ShipSelect"]) DOM.elements["ShipSelect"].classList.remove("open");
            }
        });
        this.elements["TitleStart"].onclick = function() {DOM.newMenu("Main");}
        this.elements["PauseButton"].onclick = function() {
            if (game) game.paused = true;
            else throw Error("Game not defined");
            DOM.newMenu("Main");
        }
        this.elements["ShipSelect"].onclick = function() {this.classList.toggle("open");}
        this.elements["Info"].onclick = function() {
            this.classList.toggle("active");
            if (this.classList.contains("active")) {
                this.querySelector("button").innerHTML = "<h3>&#x1F6C8; Info & Tips</h3>&emsp;&emsp;&emsp;Here we write a bit of information and tips the students could benefit from.<br><br>&emsp;&emsp;&emsp;To do with the UI, we'll mention stuff like how the local storage works, and for the game, we'll perhaps give some tips or troubleshooting advice.";
            } else {
                this.querySelector("button").innerHTML = "&#x1F6C8; Info & Tips";
            }
        }
        let galaxyNames = ["galaxy1", "galaxy2", "galaxy3", "galaxy4"];
        galaxyNames.forEach(function (name) {
            let galaxyElement:any = document.querySelector("#" + name + ">.quit")
            galaxyElement.onclick = function(event:any) {
                DOM.resetGame();
                this.classList.add("hidden");
                event.stopPropagation();
            }
        });

        // Set Data
        for (let i = 0; i < 4; i++) {
            this.elements["galaxy" + (i + 1)].onclick = function() {
                if (DOM.data["defaultGalaxy"] !== i) {
                    DOM.data["defaultGalaxy"] = i;
                    DOM.save();
                }
                DOM.startGame(i);

                let galaxyNames = ["galaxy1", "galaxy2", "galaxy3", "galaxy4"];

                let galaxyElement = document.querySelector("#galaxy" + (i + 1) + ">.quit");
                if (galaxyElement) galaxyElement.classList.remove("hidden");
                else throw Error("Element " + "#galaxy" + (i + 1) + ">.quit" + " not found");
            }
        }
        setTimeout(function () {
            document.querySelectorAll(".menu").forEach(function (menu:any) {
                menu.style["transition-duration"] = "0.3s";
                menu.style["-o-transition-duration"] = "0.3s";
                menu.style["-moz-transition-duration"] = "0.3s";
                menu.style["-webkit-transition-duration"] = "0.3s";
            });
        }, 0);
        for (let i = 0; i < this.elements["checkboxes"].length; i++) {
            this.elements["checkboxes"][i].onclick = function() {
                DOM.updatePreference(this.id, this.checked);
            }
        }

        if (storageAvailable("localStorage")) {
            this.canStore = true;
            let possibleData = localStorage.getItem('data');
            if (possibleData) {
                console.log("Updating current choices based on your saved data...");
                this.data = JSON.parse(possibleData);

                // update everything about the game based on these stored values

                if (!this.data["veryFirst"]) {
                    let boxes = this.elements["checkboxes"];
                    for (let i = 0; i < boxes.length; i++) {
                        if (boxes[i].id !== "zoom") boxes[i].checked = this.data[boxes[i].id];
                        else boxes[i].checked = (this.data[boxes[i].id] !== 1);
                    }
                    if (this.data["skipMenu"]) {
                        this.newMenu();
                        this.startGame(this.data["defaultGalaxy"]);
                    } else {
                        this.newMenu("Main");
                    }
                    initializeShipSelect(ships, this.data["defaultShip"]);
                    return; /* Don't forget that I DO return from this function early. */
                }
            }
            console.log("This is your first time playing Intergalactic Adventures!");
            this.newMenu("Title");
            setTimeout(function() {DOM.save();}, 0);
        } else {
            console.log("Your browser doesn't support localStorage.");
            this.newMenu("Title");
            this.elements["TitleWarning"].classList.add("on");
        }
        /* Initialize stuff in the UI */
        let boxes = this.elements["checkboxes"];
        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i].id !== "zoom") boxes[i].checked = this.data[boxes[i].id];
            else boxes[i].checked = (this.data[boxes[i].id] !== 1);
        }
        initializeShipSelect(ships, this.data["defaultShip"]);
    },
    shipActive: function (ship:any) {
        if (ship.classList.contains("active") || !this.elements["ShipSelect"].classList.contains("open")) return;
        this.elements["ShipSelect"].querySelector(".active").classList.remove("active");
        ship.classList.add("active");
        this.updatePreference("defaultShip", ship.id);
    },
    newMenu: function(menu = "Game") {
        for (const key in this.menus) this.menus[key].classList.remove("on");
        if (menu === "Game") {
            if (this.data["devDisplay"]) this.elements["DevTools"].style.display = "block";
            else this.elements["DevTools"].style.display = "none";
        }
        this.menus[menu].classList.add("on");
    },
    save: function() {
        localStorage.setItem('data', JSON.stringify(this.data));
    },
    updatePreference: function(type:string, value:any) {
        if (type === "zoom") this.data[type] = (value) ? 2.5 : 1;
        else this.data[type] = value;
        this.save();
    },
    doneLoad: function() {
        contexts["background"].drawImage(images["background"], 0, 0, windowSize.x * unit, windowSize.y * unit);
        game = new Game(windowSize.x, windowSize.y, images, contexts);
        game.unit = unit;
        this.loaded = true;
        DOM.initialize();
    },
    gameMenuTitle: function (galaxy:string, solarSystem:string) {
        this.elements["GalaxyName"].innerHTML = galaxy;
        this.elements["SolarSystemName"].innerHTML = solarSystem;
    },
    devToolsUpdate: function () {
        let entries = this.elements["DevTools"].querySelectorAll("tr:not(.title)>td");
        if (!game || !game.watchShip) throw Error("Game or game watchship undefined");
        entries[0].innerHTML = "X: " + Math.floor(game.watchShip.speed.x * 1000);
        entries[1].innerHTML = "Y: " + Math.floor(game.watchShip.speed.y * 1000);
        entries[2].innerHTML = "X: " + Math.floor(game.watchShip.pos.x * 10);
        entries[3].innerHTML = "Y: " + Math.floor(game.watchShip.pos.y * 10);
        let angle = Math.floor(Math.atan(-game.watchShip.angle.y / game.watchShip.angle.x) * 180 / Math.PI);
        angle += (game.watchShip.angle.x < 0) ? 180 : ((game.watchShip.angle.y <= 0) ? 0 : 360);
        entries[4].innerHTML = "&theta;: " + angle + "&deg;";
        entries[5].innerHTML = Math.floor(game.watchShip.energyUsed * 100) + " J";
        if (this.previousDamage[0] != Math.floor(game.watchShip.totalDamage * 100)) {
            this.previousDamage[0] = Math.floor(game.watchShip.totalDamage * 100);
            entries[6].innerHTML = this.previousDamage[0] + " Ns";
            this.previousDamage[1]++;
            entries[6].classList.add("blink");
            setTimeout(function () {
                DOM.previousDamage[1]--;
                if (!DOM.previousDamage[1]) {
                    entries[6].classList.remove("blink");
                }
            }, 900);
        }
        for (let i = 0; i < 4/* 4 turrets! */; i++) {
            entries[7].children[0].children[i].style.width = (100 - Math.floor((game.watchShip.turretControls.getTubeCooldown(i).response.tubeCooldown) / game.watchShip.turretControls.cooldownFrames * 100)) + "%";
        }
    },
    fadeInOut: function(func:any, params = [], middletime = 250) {
        let fade = this.elements["SolarFade"].classList;
        if (fade.contains("on")) return;
        fade.add("on");
        setTimeout(function () {
            setTimeout(function () {
                func(...params);
                fade.remove("on");
            }, middletime); 
        }, 400/* transition-duration of the `#SolarFade` */);
    },
    startGame: function(galaxy = 0) {
        if (!game) throw Error("Game not defined");
        if (this.loaded && !this.gameInitialized) {
            game.paused = false;
            game.zoom = this.data["zoom"];
            game.start(galaxies[galaxy], this.data["allShips"], this.data["defaultShip"]);
            this.previousDamage[0] = 0; // Stop the damage from blinking when you start!
            if (!game.galaxy) throw Error("Game galaxy not defined");
            this.gameMenuTitle(galaxies[galaxy], game.galaxy.startingSolarSystem);
            startAnimating();
            this.newMenu();
            this.gameInitialized = true;
            if (this.data["veryFirst"]) {
                this.data["veryFirst"] = false;
                this.save();
            }
        } else if (this.gameInitialized) {
            console.log(game);
            if (!game.galaxy) throw Error("Game galaxy not defined");
            if (galaxies[galaxy] !== game.galaxy.name || game.watchShipName !== this.data["defaultShip"]) {
                this.resetGame();

                game.paused = false;

                // actually initializeing the game!
                this.gameInitialized = true; // Cause this.resetGame(); sets it to false.
                game.start(galaxies[galaxy], this.data["allShips"], this.data["defaultShip"]);
                this.previousDamage[0] = 0; // Stop the damage from blinking when you start!
                this.gameMenuTitle(galaxies[galaxy], game.galaxy.startingSolarSystem);
            }
            game.paused = false;
            this.newMenu();
        }
    },
    resetGame: function() {
        if (!game) throw new Error("Game not defined");
        console.log("Destroying the game object and remaking it!");
        for (let i = 0; i < 4; i++) {
            let galaxyElement = document.querySelector("#galaxy" + (i + 1) + ">.quit")
            if (galaxyElement) galaxyElement.classList.add("hidden");
            else throw Error("Element " + "#galaxy" + (i + 1) + ">.quit" + " not found");
        }
        game.endGame();
        game = new Game(windowSize.x, windowSize.y, images, contexts);
        game.unit = unit;
        game.zoom = this.data["zoom"];
        game.paused = true;
        this.gameInitialized = false;
    }
}


///////////////////////////////////////////////
//////   Full Initialization Functions   //////
///////////////////////////////////////////////


initializeContexts([
    "background", // static background
    "planets", // only drawn once if game.zoom == 1
    "missiles",
    "objects",
    "thrusters",
    "ships",
    "items"
]);

initializeImages([
    //["titleBackground", "UIImages/TitleBackground.png"],
    ["background", "SpaceObjects/Space.png"],
    ["ship", "ShipSprites/ColonyShip.png"],
    ["thruster", "ShipSprites/ThrusterNozzle.png"],
    ["thrusterFlame", "ShipSprites/ThrusterFlame.png"],
    ["turret", "ShipSprites/TurretSprite.png"],
    ["asteroid", "SpaceObjects/SpaceMeteors001.png"],
    ["planet1", "SpaceObjects/CreamVioletPlanet.png"],
    ["planet2", "SpaceObjects/CyanPlanet.png"],
    ["planet3", "SpaceObjects/CyanPlanet1.png"],
    ["planet4", "SpaceObjects/DarkPlanet.png"],
    ["planet5", "SpaceObjects/EarthLikePlanet.png"],
    ["planet6", "SpaceObjects/FrostPlanet.png"],
    ["planet7", "SpaceObjects/IcePlanet.png"],
    ["planet8", "SpaceObjects/OrangePlanet.png"],
    ["planet9", "SpaceObjects/PurplePlanet.png"],
    ["planet10", "SpaceObjects/RedLinesPlanet.png"],
    ["planet11", "SpaceObjects/RedPlanet1.png"],
    ["planet12", "SpaceObjects/RedPlanetSputnik.png"],
    ["planet13", "SpaceObjects/SandPlanet.png"],
    ["planet14", "SpaceObjects/StormPlanet.png"],
    ["warpgate", "SpaceObjects/WhiteDwarfStar.png"],
    ["torpedo", "SpaceObjects/SpaceMissiles040.png"],
    ["explosion0", "Explosions/regularExplosion00.png"],
    ["explosion1", "Explosions/regularExplosion01.png"],
    ["explosion2", "Explosions/regularExplosion02.png"],
    ["explosion3", "Explosions/regularExplosion03.png"],
    ["explosion4", "Explosions/regularExplosion04.png"],
    ["explosion5", "Explosions/regularExplosion05.png"],
    ["explosion6", "Explosions/regularExplosion06.png"],
    ["explosion7", "Explosions/regularExplosion07.png"],
    ["explosion8", "Explosions/regularExplosion08.png"]
]);

let startTime, now, then:number, elapsed;

function startAnimating() {
    then = Date.now();
    startTime = then;
    animate();
}

function animate() {
    if (!game) throw new Error("Game not defined");
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > game.fpsInterval) {
        then = now - (elapsed % game.fpsInterval);
        if (!game.paused) {
            game.update();
            ["missiles", "planets", "objects", "thrusters", "ships", "items"].forEach((object) => {
                //if (object !== "planets" || game.zoom !== 1 || game.initializing || game.drawnProcess.initializing) {
                    if (!game || !game.drawnProcess) throw new Error("Game drawnProcess not defined");
                    game.drawnProcess.contexts[object].setTransform(1, 0, 0, 1, 0, 0);
                    game.drawnProcess.contexts[object].clearRect(0, 0, game.width * game.unit, game.height * game.unit);
                //}
            });
            game.draw();
            DOM.devToolsUpdate();
        }
    }
}