/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Property extends Contract {

    async createProperty(ctx, property_id, address, city, property_size, property_type,owner_name) {
        console.info('============= START : Create Property ===========');

        const property = {
            address,
            docType: 'property',
            city,
            property_size,
            property_type,
            owner_name,
        };

        await ctx.stub.putState(property_id, Buffer.from(JSON.stringify(property)));
        console.info('============= END : Create Property ===========');
    }

    async queryAllProperties(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }
   
    async queryPropertyById(ctx, property_id) {
        const propertyAsBytes = await ctx.stub.getState(property_id); 
        if (!propertyAsBytes || propertyAsBytes.length === 0) {
            throw new Error(`Property with ID ${property_id} does not exist`);
        }
        return propertyAsBytes.toString();
    }

    async queryPropertiesByCity(ctx, cityName) {
        const startKey = '';
        const endKey = '';
        const results = [];

        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }

            if (record.city && record.city.toLowerCase() === cityName.toLowerCase()) {
                results.push({ Key: key, Record: record });
            }
        }

        return JSON.stringify(results);
    }

    async updateProperty(ctx, property_id, address, city, property_size, owner_name, property_type) {
        console.info('============= START : Update Property ===========');

        const propertyAsBytes = await ctx.stub.getState(property_id);
        if (!propertyAsBytes || propertyAsBytes.length === 0) {
            throw new Error(`Property with ID ${property_id} does not exist`);
        }

        const property = {
            docType: 'property',
            address,
            city,
            property_size,
            owner_name,
            property_type,
        };

        await ctx.stub.putState(property_id, Buffer.from(JSON.stringify(property)));

        console.info('============= END : Update Property ===========');
    }
    async changePropertyOwner(ctx, property_id, newOwner) {
        console.info('============= START : changeOwner ===========');

        const propertyAsBytes = await ctx.stub.getState(property_id); // get the car from chaincode state
        if (!propertyAsBytes || propertyAsBytes.length === 0) {
            throw new Error(`${property_id} does not exist`);
        }
        const property = JSON.parse(propertyAsBytes.toString());
        property.owner = newOwner;

        await ctx.stub.putState(property_id, Buffer.from(JSON.stringify(property)));
        console.info('============= END : changeOwner ===========');
    }

}

module.exports = Property;
