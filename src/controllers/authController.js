const { supabase, supabaseAdmin } = require('../config/supabase');
const { validateUserSignup } = require('../utils/validation');
const { createUser } = require('../models/User');
const { ApiError } = require('../utils/errorHandler');

const signup = async (req, res, next) => {
  try {
    const { email, password, nom, prenom } = req.body;
    validateUserSignup(email, password, nom);

    if (!supabaseAdmin) {
      throw new ApiError('SUPABASE_SERVICE_ROLE_KEY is required to create users from server', 500);
    }

    // Create user in Supabase Auth (admin)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { nom, prenom },
      email_confirm: true,
    });

    if (error) {
      return res.status(error.status || 400).json({ error: { message: error.message, statusCode: error.status || 400 } });
    }

    const userId = data?.user?.id || data?.id;
    if (!userId) throw new ApiError('Unable to create user', 500);

    // Create profile in utilisateurs table
    await createUser(userId, { nom, prenom, charte_acceptee: false });

    return res.status(201).json({ id: userId, email });
  } catch (err) {
    next(err);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError('Email and password are required', 400);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: { message: 'Email ou mot de passe incorrect', statusCode: 401 } });
    }

    return res.json(data);
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) throw new ApiError('refresh_token is required', 400);

    const { data, error } = await supabase.auth.setSession({ refresh_token });
    if (error) return next(error);

    return res.json(data);
  } catch (err) {
    next(err);
  }
};

const signout = async (req, res) => {
  // Le client supprime déjà ses tokens localement.
  // On essaie d'invalider la session Supabase, mais c'est best-effort.
  try {
    const { user_id } = req.body;
    if (supabaseAdmin && user_id) {
      await supabaseAdmin.auth.admin.signOut(user_id, 'global').catch(() => {});
    }
  } catch { /* ignore */ }
  return res.json({ ok: true });
};

module.exports = {
  signup,
  signin,
  refresh,
  signout,
};
