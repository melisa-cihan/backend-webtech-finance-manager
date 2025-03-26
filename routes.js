const express = require('express');
const router = express.Router();
const client = require('./db')

//CRUD
// GET all assets
/**
 * @swagger
 * /assets:
 *   get:
 *     summary: Get all assets
 *     description: Fetches all available assets from the database.
 *     responses:
 *       200:
 *         description: A list of assets
 */
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
/**
 * @swagger
 * /assets:
 *   post:
 *     summary: Add a new asset
 *     description: Creates a new asset entry in the database.
 *     responses:
 *       201:
 *         description: Asset successfully created
 */
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
/**
 * @swagger
 * /assets/{id}:
 *   get:
 *     summary: Get an asset by ID
 *     description: Retrieves a specific asset using its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The asset ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asset data
 *       404:
 *         description: Asset not found
 */
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

// UPDATE one asset (PUT)
/**
 * @swagger
 * /assets/{id}:
 *   put:
 *     summary: Update an asset
 *     description: Updates an asset's details using its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The asset ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asset successfully updated
 *       404:
 *         description: Asset not found
 */
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
/**
 * @swagger
 * /assets/{id}:
 *   delete:
 *     summary: Delete an asset
 *     description: Deletes an asset by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The asset ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asset successfully deleted
 *       404:
 *         description: Asset not found
 */
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

//GET Endpoint with Aggregation for Pie-Chart Data
/**
 * @swagger
 * /category-distribution:
 *   get:
 *     summary: Get category distribution
 *     description: Retrieves the total asset value grouped by category.
 *     responses:
 *       200:
 *         description: Data for pie chart
 */
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

//GET Endpoint with Aggregation for Line-Chart Data
/**
 * @swagger
 * /asset-growth:
 *   get:
 *     summary: Get asset growth over time
 *     description: Retrieves aggregated asset growth based on purchase date.
 *     responses:
 *       200:
 *         description: Data for line chart
 */
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

//GET Ednpoint for Polar-Chart Data
/**
 * @swagger
 * /asset-location-count:
 *   get:
 *     summary: Get asset location count
 *     description: Retrieves the number of assets per location.
 *     responses:
 *       200:
 *         description: Data for polar chart
 */
router.get('/asset-location-count', async (req, res) => {
    try {
        const result = await client.query(`
            SELECT location, COUNT(*) AS asset_count 
            FROM assets 
            GROUP BY location
            ORDER BY asset_count DESC;
        `);

        const data = result.rows.map(row => ({
            location: row.location,
            asset_count: row.asset_count
        }));

        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching asset location count:', err);
        res.status(500).send('Error retrieving asset location data');
    }
});

/**
 * @swagger
 * /asset-profitability:
 *   get:
 *     summary: Get asset profitability
 *     description: Retrieves the return on investment (ROI) and current value of each asset.
 *     responses:
 *       200:
 *         description: Data for bubble chart
 */
//GET Endpoint for Bubble-Chart Data
router.get('/asset-profitability', async (req, res) => {
    try {
        const result = await client.query(`
            SELECT asset, roi, current_value
            FROM assets
            ORDER BY roi DESC;
        `);

        const data = result.rows.map((row, index) => ({
            index: index, 
            asset: row.asset,
            roi: row.roi,
            current_value: row.current_value
        }));

        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching profitability data:', err);
        res.status(500).send('Error retrieving profitability data');
    }
});



module.exports = router;