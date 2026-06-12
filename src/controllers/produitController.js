const Produit = require('../models/Produit');

const listProduits = async (req, res, next) => {
  try {
    const { categorie } = req.query;
    const data = await Produit.getAll(categorie || null);
    res.json(data);
  } catch (err) { next(err); }
};

const getProduit = async (req, res, next) => {
  try {
    const data = await Produit.getById(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
};

const createProduit = async (req, res, next) => {
  try {
    const { nom, description = '', prix, categorie = 'accessoires', stock = 0, photo = null, variants = [], ordre = 0 } = req.body;
    if (!nom?.trim() || prix == null) {
      return res.status(400).json({ error: 'nom et prix sont requis' });
    }
    const data = await Produit.create({
      nom: nom.trim(),
      description,
      prix: Number(prix),
      categorie,
      stock: Number(stock),
      photo: photo || null,
      variants: Array.isArray(variants) ? variants : [],
      ordre: Number(ordre),
    });
    res.status(201).json(data);
  } catch (err) { next(err); }
};

const updateProduit = async (req, res, next) => {
  try {
    const ALLOWED = ['nom', 'description', 'prix', 'categorie', 'stock', 'photo', 'variants', 'ordre'];
    const fields = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'Aucun champ valide fourni' });
    }
    const data = await Produit.update(req.params.id, fields);
    res.json(data);
  } catch (err) { next(err); }
};

const deleteProduit = async (req, res, next) => {
  try {
    await Produit.remove(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
};

module.exports = { listProduits, getProduit, createProduit, updateProduit, deleteProduit };
