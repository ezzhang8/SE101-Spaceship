import { Vector2 } from '../helpers.js'
import { MapData, ShipStatus} from '../types.js'

import NavigationController from '../../src/subsystems/navigationController.js'
import YourDefenceController from './DefenseController.js'
import YourPropulsionController from './PropulsionController.js'
import YourSensorsController, { SpaceObject } from './SensorsController.js'
import ColonyShip from '../../src/ship/colonyShip.js'

export default class YourNavigationController extends NavigationController {
	// To get other subsystem information, use the attributes below.
	// @ts-ignore
	defence: YourDefenceController // @ts-ignore
	sensors: YourSensorsController // @ts-ignore
	propulsion: YourPropulsionController
	angle: number = 0
	

	//Add additional attributes here
	exploredSystems: string[] = []
	mapData: MapData|null = null

	possibleObjects: SpaceObject[] = []

	scanned: boolean = false
	position: Vector2 = new Vector2(0,0)
	target: Vector2 = new Vector2(0,0)
	targetIsPlanet: boolean | null = null

	landingDistance: number = 50; // change if needed

	navigationUpdate(getShipStatus: (key: keyof ShipStatus) => number, warp: () => Error|null, land: () => Error|null, getMapData: () => MapData) {
		//Student code goes here
		if (!this.scanned) {
			this.mapData = getMapData()
			this.scanned = true;
			
		}
		

		// Constantly update position
		this.position = new Vector2(getShipStatus('positionX'), getShipStatus('positionY'))
		this.angle = getShipStatus('angle')

		if (this.targetIsPlanet !== null) {
			if (this.targetIsPlanet === true) {
				if (this.target.magnitude() !== 0 && this.target.magnitude() <= this.landingDistance) {
					land()
				}
			} else {
				if (this.target.magnitude() !== 0 && this.target.magnitude() <= this.landingDistance) {
					warp()
				}
			}
		}
		
		
	}

	//getter for mapData
	public get getMapData() {
		return this.mapData
	}

	//getter for target, returns target or null
	public get getTarget() {
		return this.target
	}


	// tries to update target
	updateTarget() {
		let d = 100000 // distance to target, used in x and y calculation
		// if target is not set - condition isnt necessary????
		if (this.targetIsPlanet === null) {	
			for (var val of this.possibleObjects) {
				if (val.type === 'Other') {
					// add to list of explored objects?
					if (!(val.distance === undefined)) {
						d = val.distance
					}
					this.target.set(d * Math.cos(val.angle), d * Math.sin(val.angle))
					this.targetIsPlanet = true;
					break;
				} else {
					this.targetIsPlanet = false;
					if (!(val.distance === undefined)) {
						d = val.distance
					}
					this.target.set(d * Math.cos(val.angle), d * Math.sin(val.angle))
				}
			} 
		}
		else if (true){
			//update if target was succesfully scanned, based on habitibility etc. 
			//TODO: get sensors to add uid to objects, which will let us set distance to target
			//without risk of changing target
		}
		else {
			// dont update otherwise
		}
	}


	// Public get function to get x and y coordinates of ship
	public get getPosition() {
		return this.position
	}

	
}