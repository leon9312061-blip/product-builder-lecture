


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



        stock_board: '주식판',



        master_invest: '대가의투자',



        free_board: '자유게시판',



        chat: '실시간 채팅', // Keep chat for chat header



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



        developing: '구현중입니다', // New translation for 'developing'



    },



    en: {



        home: 'Home',



        stock_board: 'Stock Board',



        master_invest: 'Master\'s Investment',



        free_board: 'Free Board',



        chat: 'Live Chat', // Keep chat for chat header



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



        developing: 'Currently being implemented', // New translation for 'developing'



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

const messageInput = document.getElementById('message-input'); // Get message input element

const sendMessageBtn = document.getElementById('send-message-btn'); // Get send button element





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





sendMessageBtn.addEventListener('click', () => { // Modified to use sendMessageBtn

    console.log('Send message button clicked.');

    const user = auth.currentUser;

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

    

    

    // Add event listener for Enter key on the message input

    messageInput.addEventListener('keydown', (e) => {

        if (e.key === 'Enter') {

            e.preventDefault(); // Prevent default behavior (e.g., new line in textarea, form submission)

            sendMessageBtn.click(); // Trigger the click event on the send button

        }

    });

    

    

    // --- MOBILE MODE DETECTION --- //

    function detectMobileAndApplyClass() {

        const isMobile = window.matchMedia("only screen and (max-width: 768px)").matches ||

                         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {

            document.body.classList.add('mobile-mode');

        } else {

            document.body.classList.remove('mobile-mode');

        }

    }

    

    

    

    // --- POST SYSTEM --- //

    

    

    

    const postsRef = db.collection('posts');

    

    

    

    // Helper function for client-side password hashing (for demonstration purposes)

    

    // NOTE: For production, password hashing should always be done server-side for security.

    

    async function hashString(str) {

    

        const textEncoder = new TextEncoder();

    

        const data = textEncoder.encode(str);

    

        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    

        const hashArray = Array.from(new Uint8Array(hashBuffer));

    

        const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    

        return hashedPassword;

    

    }

    

    

    

    

    

    // Reusable function to render posts

    

    function renderPosts(targetElementSelector, query) {

    

        const targetElement = document.querySelector(targetElementSelector);

    

        if (!targetElement) {

    

            console.error(`Target element not found: ${targetElementSelector}`);

    

            return;

    

        }

    

    

    

        query.onSnapshot(snapshot => {

    

            targetElement.innerHTML = ''; // Clear existing posts

    

            snapshot.forEach(doc => {

    

                const post = doc.data();

    

                const postId = doc.id;

    

                const postElement = document.createElement('div');

    

                postElement.classList.add('post-item');

    

                postElement.innerHTML = `

    

                    <h4>${post.title}</h4>

    

                    <p>${post.content}</p>

    

                    <small>작성자: ${post.postAuthorId || post.user || 'Anonymous'} | 심볼: ${post.stockSymbol || 'N/A'} | ${post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : '날짜 없음'}</small>

    

                `;

    

                targetElement.appendChild(postElement);

    

            });

    

        });

    

    }

    

    

    

    

    

    

    

    // --- POST SYSTEM --- //

    

    

    

    

    

    

    

    const postsRef = db.collection('posts');

    

    

    

    

    

    

    

    // Helper function for client-side password hashing (for demonstration purposes)

    

    

    

    // NOTE: For production, password hashing should always be done server-side for security.

    

    

    

    async function hashString(str) {

    

    

    

        const textEncoder = new TextEncoder();

    

    

    

        const data = textEncoder.encode(str);

    

    

    

        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    

    

    

        const hashArray = Array.from(new Uint8Array(hashBuffer));

    

    

    

        const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    

    

    

        return hashedPassword;

    

    

    

    }

    

    

    

    

    

    

    

    

    

    

    

    // Reusable function to render posts

    

    

    

    function renderPosts(targetElementSelector, query) {

    

    

    

        const targetElement = document.querySelector(targetElementSelector);

    

    

    

        if (!targetElement) {

    

    

    

            console.error(`Target element not found: ${targetElementSelector}`);

    

    

    

            return;

    

    

    

        }

    

    

    

    

    

    

    

        query.onSnapshot(snapshot => {

    

    

    

            targetElement.innerHTML = ''; // Clear existing posts

    

    

    

            snapshot.forEach(doc => {

    

    

    

                const post = doc.data();

    

    

    

                const postId = doc.id;

    

    

    

                const postElement = document.createElement('div');

    

    

    

                postElement.classList.add('post-item');

    

    

    

                postElement.innerHTML = `

    

    

    

                    <h4>${post.title}</h4>

    

    

    

                    <p>${post.content}</p>

    

    

    

                    <small>작성자: ${post.postAuthorId || post.user || 'Anonymous'} | 심볼: ${post.stockSymbol || 'N/A'} | ${post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : '날짜 없음'}</small>

    

    

    

                `;

    

    

    

                targetElement.appendChild(postElement);

    

    

    

            });

    

    

    

        });

    

    

    

    }

    

    

    

    

    

    

    

    

    

    

    

    const createPostForm = document.getElementById('create-post-form');

    

    

    

    

    

    

    

    createPostForm.addEventListener('submit', async (e) => { // Made async to await hash

    

    

    

        e.preventDefault();

    

    

    

    

    

    

    

        const postId = document.getElementById('post-id').value.trim();

    

    

    

        const postPassword = document.getElementById('post-password').value.trim();

    

    

    

        const postTitle = document.getElementById('post-title').value.trim();

    

    

    

        const postContent = document.getElementById('post-content').value.trim();

    

    

    

        const stockSymbol = document.getElementById('stock-symbol').value.trim();

    

    

    

    

    

    

    

        if (!postId || !postPassword || !postTitle || !postContent) {

    

    

    

            alert('아이디, 암호, 제목, 내용을 모두 입력해주세요.');

    

    

    

            return;

    

    

    

        }

    

    

    

    

    

    

    

        const hashedPassword = await hashString(postPassword); // Hash the password

    

    

    

    

    

    

    

        postsRef.add({

    

    

    

            postAuthorId: postId, // Store the user-defined ID

    

    

    

            postPasswordHash: hashedPassword, // Store the hashed password

    

    

    

            title: postTitle,

    

    

    

            content: postContent,

    

    

    

            stockSymbol: stockSymbol,

    

    

    

            createdAt: firebase.firestore.FieldValue.serverTimestamp(),

    

    

    

            likes: 0,

    

    

    

            // Removed original 'user' field as we are now using postAuthorId

    

    

    

        })

    

    

    

        .then(() => {

    

    

    

            alert('게시물이 성공적으로 작성되었습니다!');

    

    

    

            createPostForm.reset();

    

    

    

        })

    

    

    

        .catch(error => {

    

    

    

            console.error("Error adding post: ", error);

    

    

    

            alert('게시물 작성 중 오류가 발생했습니다: ' + error.message);

    

    

    

        });

    

    

    

    });

    

    

    

    

    

    

    

    

    

    

    

    // --- INITIALIZATION ---

    

    

    

    document.addEventListener('DOMContentLoaded', () => {

    

    

    

        setLanguage();

    

    

    

        loadTheme(); // Load theme on page load

    

    

    

        detectMobileAndApplyClass(); // Detect mobile and apply class on load

    

    

    

    

    

    

    

        // Get references to content sections

    

    

    

        const homeChatPanel = document.getElementById('homepage-chat-panel');

    

    

    

        const postBoardSection = document.getElementById('post-board-section');

    

    

    

        const masterInvestmentSection = document.getElementById('master-investment-section');

    

    

    

    

    

    

    

        // Function to hide all content sections

    

    

    

        function hideAllSections() {

    

    

    

            homeChatPanel.classList.add('hidden');

    

    

    

            postBoardSection.classList.add('hidden');

    

    

    

            masterInvestmentSection.classList.add('hidden');

    

    

    

        }

    

    

    

    

    

    

    

        // Function to show specific sections based on navigation

    

    

    

        function showContent(sectionName) {

    

    

    

            hideAllSections(); // Hide all sections first

    

    

    

    

    

    

    

            switch (sectionName) {

    

    

    

                case 'home':

    

    

    

                    homeChatPanel.classList.remove('hidden');

    

    

    

                    break;

    

    

    

                case 'stock_board':

    

    

    

                case 'free_board': // Both boards will use the same post board section for now

    

    

    

                    postBoardSection.classList.remove('hidden');

    

    

    

                    // You might add logic here later to differentiate between stock_board and free_board

    

    

    

                    // For now, load all posts in the main feed area

    

    

    

                    renderPosts('#post-board-section .feed', postsRef.orderBy('createdAt', 'desc'));

    

    

    

                    break;

    

    

    

                case 'master_invest':

    

    

    

                    masterInvestmentSection.classList.remove('hidden');

    

    

    

                    // Check if user is logged in

    

    

    

                    const user = auth.currentUser;

    

    

    

                    if (user) {

    

    

    

                        alert(translations[document.documentElement.lang].developing); // Show "Developing" popup

    

    

    

                    } else {

    

    

    

                        alert(translations[document.documentElement.lang].login); // Prompt to log in

    

    

    

                    }

    

    

    

                    break;

    

    

    

                default:

    

    

    

                    homeChatPanel.classList.remove('hidden');

    

    

    

                    break;

    

    

    

            }

    

    

    

        }

    

    

    

    

    

    

    

        // Attach event listeners to new navigation links

    

    

    

        document.getElementById('nav-home').addEventListener('click', (e) => {

    

    

    

            e.preventDefault();

    

    

    

            showContent('home');

    

    

    

        });

    

    

    

    

    

    

    

        document.getElementById('nav-stock-board').addEventListener('click', (e) => {

    

    

    

            e.preventDefault();

    

    

    

            showContent('stock_board');

    

    

    

        });

    

    

    

    

    

    

    

        document.getElementById('nav-master-invest').addEventListener('click', (e) => {

    

    

    

            e.preventDefault();

    

    

    

            showContent('master_invest');

    

    

    

        });

    

    

    

    

    

    

    

        document.getElementById('nav-free-board').addEventListener('click', (e) => {

    

    

    

            e.preventDefault();

    

    

    

            showContent('free_board');

    

    

    

        });

    

    

    

    

    

    

    

        // Initially show the home content

    

    

    

        showContent('home');

    

    

    

    });

    

    

    

    

    

    

    

    window.addEventListener('resize', detectMobileAndApplyClass); // Re-evaluate on resize

    

    

    

    

    

    

    














