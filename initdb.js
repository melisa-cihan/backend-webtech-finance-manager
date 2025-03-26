const express = require('express');
const client = require('./db');
const initdb = express.Router();
const format = require('pg-format');


initdb.get('/', async(req, res) => {

    // Create Table assets
    let query = `
            DROP TABLE IF EXISTS assets;
            CREATE TABLE assets(id serial PRIMARY KEY, asset VARCHAR(50) NOT NULL, category VARCHAR(50) NOT NULL, current_value NUMERIC(12,2) NOT NULL, purchase_price NUMERIC(12,2) NOT NULL, roi NUMERIC(6,2), location VARCHAR(50), purchase_date date);
            `;

    try {
        await client.query(query)
        console.log("Table created successfully ...")
    } catch (err) {
        console.log(err)
    }

    // fill Table assets
    const values = [
        ["Bitcoin", "Crypto", 25000.00, 20000.00, 25.00, "Binance", "2023-05-10"],
        ["Ethereum", "Crypto", 1800.00, 1500.00, 20.00, "Coinbase", "2023-09-05"],
        ["Apple Stock (AAPL)", "Stocks", 12500.00, 10000.00, 25.00, "NYSE", "2022-08-15"],
        ["Tesla Model 3", "Vehicle", 40000.00, 45000.00, -11.11, "Germany", "2021-06-20"],
        ["Gold Investment", "Commodities", 5500.00, 5000.00, 10.00, "London", "2022-03-11"],
        ["Euro Savings Account", "Cash", 15000.00, 15000.00, 0.00, "Deutsche Bank", "2024-01-01"],
        ["Emergency Fund", "Cash", 5000.00, 5000.00, 0.00, "ING Bank", "2023-12-01"],
        ["Apartment in Berlin", "Real Estate", 300000.00, 250000.00, 20.00, "Berlin, Germany", "2020-07-01"],
        ["Beach House in Spain", "Real Estate", 450000.00, 380000.00, 18.42, "Barcelona, Spain", "2019-06-15"],
        ["Commercial Office in Paris", "Real Estate", 70000.00, 600000.00, 16.67, "Paris, France", "2021-02-20"],
        ["Rolex", "Watch", 20.000, 20000.00, 15.00, "Berlin, Germany", "2025-05-10"],
        ["Richard Mille", "Watch", 204.000, 10000.00, 35.00, "Paris, France", "2025-04-10"],
       
    ];
   
    const paramquery = format('INSERT INTO assets(asset, category, current_value, purchase_price, roi, location, purchase_date) VALUES %L RETURNING *', values);


    try {
        const result = await client.query(paramquery)
        console.log("assets inserted ...")
        res.status(200)
        res.send(result.rows)
    } catch (err) {
        console.log(err)
    }

});


module.exports = initdb;