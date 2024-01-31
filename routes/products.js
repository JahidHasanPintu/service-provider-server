const express = require('express');
const router = express.Router();
const Product = require('../models/products'); // Make sure to adjust the path based on your file structure
const User = require('../models/user');
// Create a new product
router.post('/create', async (req, res) => {
    try {
        const {
            USER_ID,
            productName,
            quantity,
            price,
            imageLinks,
            category,
            brand,
            description,
        } = req.body;

        const product = new Product({
            USER_ID,
            productName,
            quantity,
            price,
            imageLinks,
            category,
            brand,
            description,
        });

        await product.save();

        res.status(201).json({ message: 'Product posted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// GET all products with pagination, searching, and filtering
router.get('/', async (req, res) => {
    try {
        const { page, limit, search, filterCategory, filterBrand } = req.query;
        const skip = (page - 1) * limit;

        const query = {};

        if (search) {
            const orConditions = [
                { productName: { $regex: new RegExp(search, 'i') } },
                { category: { $regex: new RegExp(search, 'i') } },
                { brand: { $regex: new RegExp(search, 'i') } },
                { description: { $regex: new RegExp(search, 'i') } },
            ];

            query.$or = orConditions;
        }

        if (filterCategory) {
            query.category = filterCategory;
        }

        if (filterBrand) {
            query.brand = filterBrand;
        }

        const products = await Product.find(query)
            .skip(skip)
            .limit(limit)
            .populate('USER_ID', 'name'); // Populate the 'USER_ID' field with 'name' from the User model

        const totalProducts = await Product.countDocuments(query);

        res.json({
            success: "true",
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalItem: totalProducts,
            productsOnCurrentPage: products.length,
            products,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a product by ID
router.put('/update/:productId', async (req, res) => {
    try {
        const { productName, quantity, price, imageLinks, category, brand, description } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.productId,
            {
                $set: {
                    productName,
                    quantity,
                    price,
                    imageLinks,
                    category,
                    brand,
                    description,
                },
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a product by ID
router.delete('/delete/:productId', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully', deletedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// View a single product by ID
router.get('/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId).populate('USER_ID', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all products posted by a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const products = await Product.find({ USER_ID: req.params.userId })
            .populate('USER_ID', 'name');

        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
