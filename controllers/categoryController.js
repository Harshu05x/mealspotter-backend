// controllers/categoryController.js
const Category = require("../models/categoryModel");
const Toy = require("../models/toyModel");

class CategoryController {
  async getAllCategories(req, res) {
    const {status}=req.query;
    try {
      let categories;
      if(status){
        categories=await Category.find({ status: status });
      }else{
        categories = await Category.find();
      }
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async getCategoryById(req, res) {
    const categoryId = req.params.id;
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async createCategory(req, res) {
    const { name, status } = req.body;

    // Check if a category with the same name already exists
    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res
        .status(400)
        .json({ msg: "Category with the same name already exists." });
    }

    const newCategory = new Category({ name, status });

    try {
      const savedCategory = await newCategory.save();
      res.status(200).json(savedCategory);
    } catch (err) {
      res.status(400).json({ error: "Bad request" });
    }
  }

  async updateCategory(req, res) {
    const categoryId = req.params.id;
    const { name, status } = req.body;
    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { name, status },
        { new: true }
      );
      if (!updatedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(updatedCategory);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async deleteCategory(req, res) {
    const categoryId = req.params.id;

    // Check if the category is used in toys
    const isCategoryUsedInToys = await Toy.exists({ category: categoryId });

    if (isCategoryUsedInToys) {
      return res
        .status(400)
        .json({ error: "Category is used in toys and cannot be deleted." });
    } else {
      try {
        const deletedCategory = await Category.findByIdAndRemove(categoryId);
        if (!deletedCategory) {
          return res.status(404).json({ error: "Category not found" });
        }
        res.json(deletedCategory);
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    }
  }
}

module.exports = new CategoryController();
