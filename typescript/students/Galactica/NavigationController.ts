import { Vector2 } from '../helpers.js'
import { MapData, ShipStatus} from '../types.js'

import NavigationController from '../../src/subsystems/navigationController.js'
import YourDefenceController from './DefenseController.js'
import YourPropulsionController from './PropulsionController.js'
import YourSensorsController from './SensorsController.js'

export default class YourNavigationController extends NavigationController {
	// To get other subsystem information, use the attributes below.
	// @ts-ignore
	defence: YourDefenceController // @ts-ignore
	sensors: YourSensorsController // @ts-ignore
	propulsion: YourPropulsionController

	//Add additional attributes here
	angle = 0
	xVelocity=0
	yVelocity=0
	radius=0
	angularVelocity=0
	positionX=0
	positionY=0
	thrusterPowerMain=0
	thrusterPowerBow=0
	thrusterPowerClockwise=0
	thrusterPowerCounterClockwise=0

	navigationUpdate(getShipStatus: (key: keyof ShipStatus) => number, warp: () => Error|null, land: () => Error|null, getMapData: () => MapData) {
		this.angle = getShipStatus ('angle')
		this.xVelocity = getShipStatus ('linearVelocityX')
		this.yVelocity = getShipStatus ('linearVelocityY')
		this.radius = getShipStatus ('radius')
		this.angularVelocity = getShipStatus ('angularVelocity')
		this.positionX = getShipStatus ('positionX')
		this.positionY = getShipStatus ('positionY')
		this.thrusterPowerMain = getShipStatus('thrusterPowerMain')
		this.thrusterPowerBow = getShipStatus('thrusterPowerBow')
		this.thrusterPowerClockwise = getShipStatus('thrusterPowerClockwise')
		this.thrusterPowerCounterClockwise = getShipStatus('thrusterPowerCounterClockwise')
		
		//if good planet:
		land()
		//if good warpgate:
		warp()
	}
}
