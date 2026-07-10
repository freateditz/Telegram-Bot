const asyncHandler = require("../utils/asyncHandler");
const categoryService = require("../services/categoryService");

const listCategories = asyncHandler(async (req, res) => {
  const items = await categoryService.listCategories();
  res.json({ ok: true, items });
});

const getCategory = asyncHandler(async (req, res) => {
  const item = await categoryService.getCategory(Number(req.params.id));

  if (!item) {
    return res.status(404).json({ ok: false, error: "Category not found" });
  }

  res.json({ ok: true, item });
});

const createCategory = asyncHandler(async (req, res) => {
  const item = await categoryService.createCategory(req.body || {});
  res.status(201).json({ ok: true, item });
});

const updateCategory = asyncHandler(async (req, res) => {
  const item = await categoryService.updateCategory(Number(req.params.id), req.body || {});
  res.json({ ok: true, item });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(Number(req.params.id));
  res.status(204).send();
});

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};