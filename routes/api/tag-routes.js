const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// find all tags
// be sure to include its associated Product data
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: Product,
    });
    res.status(200).json(tags);  
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// find a single tag by its `id`
// be sure to include its associated Product data
router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id, {
      include: Product,
    });

    if (!tag) {
      res.status(404).json({ message:'Tag not found with that id🚫' });
      return;
    }

    res.status(200).json(tag);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// create a new tag
router.post('/', async (req, res) => {
  try {
    const newTag = await Tag.create(req.body);
    res.status(201).json(newTag);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// update a tag's name by its `id` value
router.put('/:id', async (req, res) => {
  try {
    const updateTag = await Tag.update(
      { tag_name: req.body.tag_name },
      { 
        where: { id: req.params.id },
      }
    );

    if (!updateTag) {
      res.status(404).json({ message:'Tag not found with that id🚫' });
      return;
    }
    res.status(200).json({ message: 'Tag updated successfully✅' });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// delete on tag by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const deleteTag = await Tag.destroy({
      where: { id: req.params.id },
    });

    if (!deleteTag) {
      res.status(404).json({ message: 'Tag not found with that id🚫' });
      return;
    }

    // Also delete associated ProductTag entries
    await ProductTag.destroy({
      where: { tag_id: req.params.id },
    });

    res.status(200).json({ message: 'Tag deleted successfully✅' });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
