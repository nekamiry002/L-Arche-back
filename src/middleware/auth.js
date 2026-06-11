const { supabaseAdmin, supabase } = require('../config/supabase');

// Vérifie le JWT Supabase (compatible ECC P-256 et HS256) via l'API Admin,
// puis charge le rôle applicatif depuis la table utilisateurs.
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const client = supabaseAdmin || supabase;
    const { data, error } = await client.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const supabaseUser = data.user;

    // Charger le rôle applicatif depuis la table utilisateurs
    const { data: profile } = await (supabaseAdmin || supabase)
      .from('utilisateurs')
      .select('role')
      .eq('id', supabaseUser.id)
      .single();

    req.user = {
      id: supabaseUser.id,
      sub: supabaseUser.id,
      email: supabaseUser.email,
      role: profile?.role || 'utilisateur',
      user_metadata: supabaseUser.user_metadata,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

module.exports = { authenticateToken };
