import { supabase } from './supabase.js';

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userAvatar = document.getElementById('user-avatar');

// Google Login
loginBtn.addEventListener('click', async () => {
   const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: window.location.origin
            + '/html/login-test.html',

        queryParams: {
            prompt: 'select_account'
        }
    }
});

    if (error) {
        alert(error.message);
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert(error.message);
    }
});

// Menampilkan informasi pengguna
function updateUI(session) {
    const user = session?.user;

    if (user) {
        loginBtn.hidden = true;
        userInfo.hidden = false;

        userName.textContent =
            user.user_metadata.full_name || 'User';

        userEmail.textContent = user.email;

        userAvatar.src =
            user.user_metadata.avatar_url || '';

    } else {
        loginBtn.hidden = false;
        userInfo.hidden = true;
    }
}

// Memantau perubahan sesi login
supabase.auth.onAuthStateChange((event, session) => {
    updateUI(session);
});