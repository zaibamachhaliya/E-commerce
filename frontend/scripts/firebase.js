const firebaseConfig = {

    apiKey: "AIzaSyA16yqEP8cO0MGJpPZMlqZH5Y4A48FopvU",

    authDomain: "anthropicbots-ecommerce.firebaseapp.com",

    projectId: "anthropicbots-ecommerce",

    storageBucket: "anthropicbots-ecommerce.firebasestorage.app",

    messagingSenderId: "145313639441",

    appId: "1:145313639441:web:994a71088a3ed3c46d15b0"
};

firebase.initializeApp(
    firebaseConfig
);

const auth =
    firebase.auth();

const googleProvider =
    new firebase.auth.GoogleAuthProvider();