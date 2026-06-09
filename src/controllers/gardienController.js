const { supabase } = require('../config/supabase');
const { NotFoundError } = require('../utils/errorHandler');

// Champs publics renvoyés pour un gardien
const PUBLIC_FIELDS = [
  'id', 'nom', 'prenom', 'ville', 'avatar_url',
  'description_gardien', 'experience_animaux', 'type_logement',
  'jardin', 'animaux_acceptes', 'latitude', 'longitude',
  'note_moyenne', 'nb_avis', 'profil_gardien_verifie'
].join(', ');

// GET /api/users/gardiens — liste filtrée des gardiens
const searchGardiens = async (req, res, next) => {
  try {
    const {
      espece,
      note_min,
      lat,
      lng,
      distance_km = 50,
      verifie,
      limit = 20,
      offset = 0,
    } = req.query;

    let query = supabase
      .from('utilisateurs')
      .select(PUBLIC_FIELDS + ', created_at', { count: 'exact' })
      .eq('est_gardien', true)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (espece) {
      query = query.contains('animaux_acceptes', [espece]);
    }

    if (note_min) {
      query = query.gte('note_moyenne', parseFloat(note_min));
    }

    if (verifie === 'true') {
      query = query.eq('profil_gardien_verifie', true);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    let gardiens = data || [];

    // Filtre géographique approximatif (Haversine côté JS)
    if (lat && lng) {
      const refLat = parseFloat(lat);
      const refLng = parseFloat(lng);
      const maxKm = parseFloat(distance_km);

      gardiens = gardiens.filter(g => {
        if (g.latitude == null || g.longitude == null) return false;
        const dist = haversineKm(refLat, refLng, g.latitude, g.longitude);
        g.distance_km = Math.round(dist * 10) / 10;
        return dist <= maxKm;
      });

      gardiens.sort((a, b) => a.distance_km - b.distance_km);
    }

    res.json({ data: gardiens, total: lat && lng ? gardiens.length : count });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/gardiens/:id — profil public d'un gardien
const getGardienProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('utilisateurs')
      .select(PUBLIC_FIELDS)
      .eq('id', id)
      .eq('est_gardien', true)
      .single();

    if (error || !data) throw new NotFoundError('Gardien', id);

    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Formule Haversine — retourne la distance en km entre deux coordonnées GPS
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

module.exports = { searchGardiens, getGardienProfile };
