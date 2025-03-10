const express = require('express');
const router = express.Router();
const client = require('./db')

//CRUD
// GET all assets
router.get('/assets', async(req, res) => {
    const query = `SELECT * FROM assets ORDER BY id `;

    try {
        const result = await client.query(query)
        console.log(result)
        res.send(result.rows);
    } catch (err) {
        console.log(err.stack)
    }
});

// POST one asset
router.post('/assets', async(req, res) => {
    let asset = (req.body.asset) ? req.body.asset : null;
    let category = (req.body.category) ? req.body.category : null;
    let current_value = (req.body.current_value) ? req.body.current_value : null;
    let purchase_price = (req.body.purchase_price) ? req.body.purchase_price : null;
    let roi = (req.body.roi) ? req.body.roi : null;
    let location = (req.body.location) ? req.body.location : null;
    let purchase_date = (req.body.purchase_date) ? req.body.purchase_date : null;
    

    const query = `INSERT INTO assets(asset, category, current_value, purchase_price, roi, location, purchase_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

    try {
        const result = await client.query(query, [asset, category, current_value, purchase_price, roi, location, purchase_date])
        console.log(res)
        res.send(result.rows[0]);
    } catch (err) {
        console.log(err.stack)
    }
});

// GET one asset via id
router.get('/assets/:id', async(req, res) => {
    const query = `SELECT * FROM assets WHERE id=$1`;

    try {
        const id = req.params.id;
        const result = await client.query(query, [id])
        console.log(result)
        if (result.rowCount == 1)
            res.send(result.rows[0]);
        else
            res.send({ message: "No asset found with id=" + id });
    } catch (err) {
        console.log("error", err.stack)
    }
});

// update one asset (PUT)
router.put('/assets/:id', async(req, res) => {
    const query = `SELECT * FROM assets WHERE id=$1`;

    let id = req.params.id;
    const result = await client.query(query, [id])
    if(result.rowCount > 0)
    {
        let assetNew = result.rows[0];
        let asset = (req.body.asset) ? req.body.asset : assetNew.asset;
        let category = (req.body.category) ? req.body.category : assetNew.category;
        let current_value = (req.body.current_value) ? req.body.current_value : assetNew.current_value;
        let purchase_price = (req.body.purchase_price) ? req.body.purchase_price : assetNew.purchase_price;
        let roi = (req.body.roi) ? req.body.roi : assetNew.roi;
        let location = (req.body.location) ? req.body.location : assetNew.location;
        let purchase_date = (req.body.purchase_date) ? req.body.purchase_date : assetNew.purchase_date;
        
        const updatequery = `UPDATE assets SET 
            asset = $1, 
            category = $2,
            current_value = $3,
            purchase_price = $4,
            roi = $5,
            location = $6,
            purchase_date = $7
            WHERE id=$8;`;
        const updateresult = await client.query(updatequery, [asset, category, current_value, purchase_price, roi, location, purchase_date, id]);
        console.log(updateresult)
        res.send({ id, asset, category, current_value, purchase_price, roi, location, purchase_date });
    } else {
        res.status(404)
        res.send({
            error: "Asset with id=" + id + " does not exist!"
        })
    }
});

// DELETE one asset via id
router.delete('/assets/:id', async(req, res) => {
    const query = `DELETE FROM assets WHERE id=$1`;
    try {
        const id = req.params.id;
        const result = await client.query(query, [id])
        console.log(result)
        if (result.rowCount == 1)
            res.send({ message: "Asset with id=" + id + " deleted" });
        else
            res.send({ message: "No asset found with id=" + id });
    } catch (err) {
        console.log(err.stack)
    }
});

// New route to generate Data for the pie chart 
router.get('/dashboard-test', async (req, res) => {
    try {
        const result = await client.query('SELECT SUM(purchase_price) as total_purchase_price, SUM(current_value) as total_current_value FROM assets');
        const { total_purchase_price, total_current_value } = result.rows[0];

        res.status(200).json({
            total_purchase_price: total_purchase_price || 0,
            total_current_value: total_current_value || 0,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

router.get('/category-distribution', async (req, res) => {
    try {
        const result = await client.query(`
            SELECT category, SUM(current_value) AS total_value
            FROM assets
            GROUP BY category
            ORDER BY total_value DESC
        `);

        const data = result.rows.map(row => ({
            category: row.category,
            total_value: row.total_value
        }));

        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving category distribution');
    }
});

router.get('/asset-growth', async (req, res) => {
    try {
        const result = await client.query(`
            SELECT purchase_date, SUM(current_value) AS total_value
            FROM assets
            GROUP BY purchase_date
            ORDER BY purchase_date;
        `);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching asset growth data:', err);
        res.status(500).send('Error retrieving asset growth data');
    }
});

module.exports = router;