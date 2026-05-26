const express = require('express');
const router = express.Router();
const {
    getAllTiers,
    getTierById,
    createTier,
    updateTier,
    deleteTier,
    deleteManyTiers
} = require('../controller/tierController');

// GET    /api/tier        → semua tier
// GET    /api/tier/:id    → tier by id
// POST   /api/tier        → tambah tier baru
// PUT    /api/tier/:id    → update tier
// DELETE /api/tier/bulk   → hapus banyak tier (bulk)
// DELETE /api/tier/:id    → hapus 1 tier

router.get('/',          getAllTiers);
router.get('/:id',       getTierById);
router.post('/',         createTier);
router.put('/:id',       updateTier);
router.delete('/bulk',   deleteManyTiers);  // ← HARUS sebelum /:id
router.delete('/:id',    deleteTier);

module.exports = router;