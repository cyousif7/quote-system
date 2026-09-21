const logger = require('../config/logger');

async function lookupVehicle(vin) {
    try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);

    const vehicleData = await response.json();

    const results = vehicleData.Results;

    const year = results.find(item => item.Variable === "Model Year").Value;
    const make = results.find(item => item.Variable === "Make").Value;
    const model = results.find(item => item.Variable === "Model").Value;
    const trim = results.find(item => item.Variable === "Trim").Value;
    const engineSize = results.find(item => item.Variable === "Displacement (L)").Value;
    const cylinders = results.find(item => item.Variable === "Engine Number of Cylinders").Value;
    const transmission = results.find(item => item.Variable === "Transmission Style").Value;

    let engineDescription = null;
    if (engineSize && cylinders) {
        engineDescription = `${engineSize}L ${cylinders}-Cylinder`;
    } else if (engineSize) {
        engineDescription = `${engineSize}L`;
    } else if (cylinders) {
        engineDescription = `${cylinders}-Cylinder`;
    }

    return {
        vehicle_year: year,
        vehicle_make: make,
        vehicle_model: model,
        vehicle_trim: trim,
        vehicle_engine: engineDescription,
        vehicle_transmission: transmission
    };
    }

    catch(error) {
        logger.error(error.message);

        return null;
    }
};

module.exports = lookupVehicle;