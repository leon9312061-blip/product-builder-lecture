
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
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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

globalChatRef.orderBy('timestamp', 'desc').limit(200).onSnapshot(snapshot => {
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
    const user = auth.currentUser;
    const messageInput = document.getElementById('message-input');
    if (!user) {
        alert("Please log in to chat.");
        return;
    }

    const message = messageInput.value.trim();
    if (message) {
        globalChatRef.add({
            username: user.displayName,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        messageInput.value = '';
    }
});


// --- POST SYSTEM --- //

const postsRef = db.collection('posts');
const createPostForm = document.getElementById('create-post-form');

createPostForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to create a post.");
        return;
    }

    postsRef.add({
        user: user.displayName,
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
});
