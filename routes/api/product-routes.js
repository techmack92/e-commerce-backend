const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
// find all products
// be sure to include its associated Category and Tag data
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
          through: ProductTag,
          as: 'tags'
        },
      ],
    });
    res.status(200).json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get one product
// find a single product by its `id`
// be sure to include its associated Category and Tag data
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category
        },
        {
          model: Tag,
          through: ProductTag,
          as: 'tags'
        },
      ],
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found with that id🚫' });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// create new product
/* req.body should look like this...
  {
    product_name: "Basketball",
    price: 200.00,
    stock: 3,
    tagIds: [1, 2, 3, 4]
  }
*/
router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: newProduct.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(newProduct);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});


// update product
router.put('/:id', async (req, res) => {
  try {
    const updateProduct = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (!updateProduct) {
      res.status(404).json({ message: 'Product not found with that id🚫' });
      return;
    }

    // If there are product tags, update pairings in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      await ProductTag.destroy({
        where: { product_id: req.params.id },
      });

      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });

      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(200).json({ message: 'Product updated successfully✅' });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// delete one product by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const deleteProduct = await Product.destroy({
      where: { id: req.params.id },
    });
    
    if (!deleteProduct) {
      res.status(404).json({ message:'Product not found with that id🚫' });
      return;
    }

    // Also delete associated ProductTag entries
    await ProductTag.destroy({
      where: { product_id: req.params.id },
    });

    res.status(200).json({ message: 'Product deleted successfully✅' });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
