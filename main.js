
// ----------------------------------------------------------------
// SETUP INSTRUCTIONS
// ----------------------------------------------------------------

// 1. FIREBASE SETUP:
//   - Go to the Firebase console (https://console.firebase.google.com/).
//   - Create a new project.
//   - In your project, go to Project Settings > General.
//   - Under "Your apps", click the web icon (</>) to create a new web app.
//   - Copy the firebaseConfig object and paste it below.

const firebaseConfig = {
  apiKey: "AIzaSyCiXhmeWPpzHciXlxeZ6XkrGp_ltw_97XY",
  authDomain: "producttest-3b71f.firebaseapp.com",
  projectId: "producttest-3b71f",
  storageBucket: "producttest-3b71f.firebasestorage.app",
  messagingSenderId: "686825877099",
  appId: "1:686825877099:web:037d88706a2c6530b50b2e",
  measurementId: "G-X33CDY2RY0"
};


// ----------------------------------------------------------------

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- LANGUAGE & TRANSLATION --- //

const translations = {
    ko: {
        home: '홈',
        feed: '글로벌 피드',
        screener: '주식 스크리너',
        chat: '실시간 채팅',
        market: '시장 현황',
        profile: '내 프로필',
        login: '로그인',
        logout: '로그아웃',
        create_post: '게시물 작성',
        post_button: '게시',
        send_button: '전송',
        title_placeholder: '제목',
        symbol_placeholder: '주식 심볼 (예: AAPL)',
        content_placeholder: '무슨 생각을 하고 계신가요?',
        message_placeholder: '메시지를 입력하세요...',
        dark_mode_text: '다크 모드',
        white_mode_text: '화이트 모드',
    },
    en: {
        home: 'Home',
        feed: 'Global Feed',
        screener: 'Stock Screener',
        chat: 'Live Chat',
        market: 'Market Overview',
        profile: 'My Profile',
        login: 'Login',
        logout: 'Logout',
        create_post: 'Create a Post',
        post_button: 'Post',
        send_button: 'Send',
        title_placeholder: 'Title',
        symbol_placeholder: 'Stock Symbol (e.g., AAPL)',
        content_placeholder: 'What\'s on your mind?',
        message_placeholder: 'Type a message...',
        dark_mode_text: 'Dark mode',
        white_mode_text: 'White mode',
    }
};

async function setLanguage() {
    try {
        // Simple IP-based language detection (using a free service)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const lang = data.country_code.toLowerCase() === 'kr' ? 'ko' : 'en';
        
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
            const key = el.getAttribute('data-lang-placeholder');
            if (translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });

    } catch (error) {
        console.error('Error setting language:', error);
        // Default to Korean if detection fails
        document.documentElement.lang = 'ko'; 
    }
}

// --- THEME SWITCHING (DARK/LIGHT MODE) --- //
const themeToggle = document.getElementById('theme-toggle');

function setTheme(theme) {
    document.body.classList.remove('light-mode', 'dark-mode'); // Remove existing classes
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
    const currentLang = document.documentElement.lang || 'ko'; // Get current language, default to 'ko'
    themeToggle.textContent = theme === 'dark-mode'
        ? translations[currentLang].white_mode_text
        : translations[currentLang].dark_mode_text;
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Check for system preference if no theme is saved
        setTheme('dark-mode');
    } else {
        setTheme('light-mode'); // Default to light mode
    }
}

themeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
        setTheme('light-mode');
    } else {
        setTheme('dark-mode');
    }
});


// --- AUTHENTICATION --- //

auth.onAuthStateChanged(user => {
    const lang = document.documentElement.lang || 'ko';
    const authLink = document.getElementById('auth-link');
    if (user) {
        authLink.textContent = translations[lang].logout;
        authLink.href = '#';
    } else {
        authLink.textContent = translations[lang].login;
        authLink.href = '#';
    }
});

document.getElementById('auth-link').addEventListener('click', (e) => {
    e.preventDefault();
    if (auth.currentUser) {
        auth.signOut();
    } else {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(error => console.error("Auth Error:", error));
    }
});


// --- REAL-TIME CHAT --- //

const globalChatRef = db.collection('globalChat');
const chatMessages = document.getElementById('chat-messages');

globalChatRef.onSnapshot(snapshot => {
    chatMessages.innerHTML = '';
    snapshot.docs.reverse().forEach(doc => {
        const message = doc.data();
        const messageEl = document.createElement('div');
        messageEl.innerHTML = `<b>${message.username || 'Anonymous'}:</b> ${message.message}`;
        chatMessages.appendChild(messageEl);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
});


document.getElementById('send-message-btn').addEventListener('click', () => {
    console.log('Send message button clicked.');
    const user = auth.currentUser;
    const messageInput = document.getElementById('message-input');
    // Allow anonymous chat: if no user, use "Anonymous"
    const username = user ? user.displayName : 'Anonymous';

    const message = messageInput.value.trim();
    if (message) {
        console.log('Attempting to send message:', { username, message });
        globalChatRef.add({
            username: username,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log('Message successfully added to Firestore.');
            messageInput.value = '';
        })
        .catch(error => {
            console.error('Error adding message to Firestore:', error);
            alert('메시지 전송 실패: ' + error.message); // User-friendly alert
        });
    } else {
        console.log('Message input is empty. Not sending.');
    }
});



// --- POST SYSTEM --- //

const postsRef = db.collection('posts');
const createPostForm = document.getElementById('create-post-form');

createPostForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    // Allow anonymous posting: if no user, use "Anonymous"
    const username = user ? user.displayName : 'Anonymous';

    postsRef.add({
        user: username,
        title: document.getElementById('post-title').value,
        content: document.getElementById('post-content').value,
        stockSymbol: document.getElementById('stock-symbol').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        likes: 0,
    });

    createPostForm.reset();
});

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    setLanguage();
    loadTheme(); // Load theme on page load
});
