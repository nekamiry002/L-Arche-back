require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erreur : les variables SUPABASE_URL et SUPABASE_KEY doivent être définies dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;
const useAdmin = Boolean(serviceRoleKey);

async function main() {
  console.log('👉 Test de connexion à Supabase');

  if (useAdmin) {
    console.log('Utilisation de SUPABASE_SERVICE_ROLE_KEY pour tester la connexion admin.');
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ limit: 1 });
    if (error) {
      console.error('Connexion Supabase échouée :', error.message);
      return;
    }

    const userCount = Array.isArray(data?.users) ? data.users.length : 0;
    console.log('Connexion Supabase réussie. Nombre d’utilisateurs récupérés :', userCount);
    return;
  }

  console.log('Aucun SUPABASE_SERVICE_ROLE_KEY détecté, test basique via la table utilisateurs.');
  const { data, error } = await supabase.from('utilisateurs').select('id').limit(1);

  if (error) {
    if (error.message && error.message.includes('relation "utilisateurs" does not exist')) {
      console.log('Connexion Supabase réussie, mais la table utilisateurs n’existe pas encore.');
      return;
    }
    console.error('Connexion Supabase échouée :', error.message);
    return;
  }

  console.log('Connexion Supabase réussie. Table utilisateurs accessible.');
  console.log('Exemple de résultat :', data);
}

main().catch((error) => {
  console.error('Erreur inattendue :', error);
});
