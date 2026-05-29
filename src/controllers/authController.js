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

    if (error) return next(error);

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

    if (error) return next(error);

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

const signout = async (req, res, next) => {
  try {
    // Prefer invalidating refresh tokens via admin if available
    const { user_id } = req.body;
    if (supabaseAdmin && user_id) {
      const { error } = await supabaseAdmin.auth.admin.invalidateUserRefreshTokens(user_id);
      if (error) return next(error);
      return res.json({ ok: true });
    }

    // Fallback: try to sign out using anon client if access token provided
    const { access_token } = req.body;
    if (access_token) {
      const { error } = await supabase.auth.signOut();
      if (error) return next(error);
      return res.json({ ok: true });
    }

    throw new ApiError('user_id or access_token required to sign out', 400);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  signin,
  refresh,
  signout,
};
