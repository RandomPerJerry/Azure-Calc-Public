import propulsionSvg from "../pages/BaseScreenComp/singleLineDiagram/svg/propulsionSvg";
const testSystem = {
  "id": "6d69c021-94f7-467a-9344-734f0b5951ad",
  "data": {
      "description": "123",
      "propulsionMode": "electric",
      "motor": {
          "id": "07802454-27d1-49cc-8311-9b33433c4059",
          "version": 1,
          "data": {
              "validDataPoints": [
                  {
                      "power": 100,
                      "speed": 1000
                  },
                  {
                      "power": 1022,
                      "speed": 2500
                  }
              ],
              "description": "EM-PMI540-T4000-2400",
              "voltage": "",
              "weight": "",
              "motorType": "",
              "ipRating": "",
              "price": "",
              "manufacturer": "",
              "model": ""
          },
          "output": {}
      },
      "dieselEngine": {},
      "dcAcConverter": {
          "id": "04be6a4f-9535-44a4-a542-733d4d4655b3",
          "version": 1,
          "data": {
              "nominalCurrent": 123,
              "description": "123"
          },
          "output": {}
      },
      "numberOfUnits": 12,
      "propulsionDevice": "gearBox",
      "propulsorType": "Azimuth CRP",
      "power": 12264,
      "hybridPower": {
          "motor": null,
          "diesel": null
      }
  },
  "barNumber": null
}

function Test() { // Also capitalize component name
  return (
    <div>
      {propulsionSvg({ 
        propulsionSystem: testSystem
      })}
    </div>
  );
}

export default Test;