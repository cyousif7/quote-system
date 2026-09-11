const logger = require('../config/logger');

async function lookupVehicle(vin) {
    try {
    // Call the NHTSA VIN API 
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);

    // Reformat the API call's response into JS objects and arrays
    // vehicleData is an object holding all the vehicle's data now
    const vehicleData = await response.json();

    const results = vehicleData.Results;

    const year = results.find(item => item.Variable === "Model Year").Value;
    const make = results.find(item => item.Variable === "Make").Value;
    const model = results.find(item => item.Variable === "Model").Value;
    const trim = results.find(item => item.Variable === "Trim").Value;

    // Return all the vehicle data attached to the object
    return {
        vehicle_year: year,
        vehicle_make: make,
        vehicle_model: model,
        vehicle_trim: trim
    };
    }

    catch(error) {
        logger.error(error.message);

        return null;
    }
};

module.exports = lookupVehicle;