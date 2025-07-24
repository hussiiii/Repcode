import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        // Your Firebase project's admin SDK configuration
        // Replace these with your actual config values
        project_id: "flashcode-dummy",
        client_email: "firebase-adminsdk-iriei@flashcode-dummy.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCaHY8cTUSv9DGe\nzp7ijABhDnBasigQ9t4SA+bXe98y8r7/iao5Z7lUvm0I8OGF5DX2lKoPeQR5tJqf\nSmsEHfvUnJMbYKr/GiBzLxgxTA2tT+y26xiubUyEKac7UOTZ/SNAJVBt8XE+WnwK\nG7CM5sTEZo6m7KfIoG+x4P0diouoB8WgCMZIIZsNLTbdFbwSdpcD/AUm0wYpPvno\nBhlzHXqFdC0jNa76oRE5sItCldmfHN1nGWZ+gWJAI0uJn9+KtoddxkcyzRldStkk\nfbSyn7PRoc0Rm5LSQPNixnQGnwYDiRqoWqxtFrM0jUb3cr6boKouYGmGXyFNXEH1\nHqs6ze9lAgMBAAECggEABJdAwcujC7uyO+dyxELLC25upRrcXhS7+Z8S/97+qjN+\nwk6MnSHi4/+XgZDG1oIsToupnzQJ1P2d2JXkBRI12UKb1K63EMF0HjTuboaR83Z6\nq0BiLESGXoxKsitGnv4CUD302I7nbS5xLc4r9BYD3lBmC4UbIGXNNXCleIXGPyp1\nVR09P28qtGG6/8vX+pObgWUWFvrx4gG443ccyfe4Ic9ueqSmA3uiamYYj2fXqBtM\nZC3d1aoZtB8gG6ank9mIc0rMgJYQF7yPj0ncWsY1NeKTYek+MmLyaGVPKxzYZgZ5\n02r1XR+KIHMGD+LQge/jIlXJOSdzbHJL4u1RpFWvxwKBgQDLEuf4jufXT/Jy1nJB\nToUXwLR1Pl0QKn3DriEmfk+RE/bWz0q4VdQjycqAAEAnD6IsymUH4yDsInARWacF\nFf1lsa/KxN01qs5d43NwKFMieoNP7/ABnhFlL9nngJDGaga/OnGK9ppVTbuTENrV\noqRKJ4fQ5f0F9P/bI8+zRQnRBwKBgQDCSCXSe5Qhl7ZmO4gUpEFEWW3FiEIGQMrF\nntgIwMQJplloklHiwpHjQuNlaF8UEE4CWF5YYgLBHt0GHRgQOC2ezb4w+ma+6jA8\nzXdvCRUSAx9Iwln51aAN4pqAAsO/H/doUOklcEPuCfOV8dEmY1SA/Yh3i5/DeVr/\nord0RBidMwKBgB5VE5sX1V9ezKsEhwpkLRMQMKQ2jXYFssVQtBjo0v+riLorOlDw\nWQCDeqDF6M8s0Z95F8Am19sNhcnBp2XmE/RlpwlVgGksuyhg+fQtwcUroYOGJkZH\nkveXPygKFxXb7mgP1bfY/9JwCu17ngQ9B+cfonS8dZ+3KaRU5Ag17rJvAoGBAJE/\nJyepRCGpLrBXqXDlK/ZRdYPMTrAmGHKOQqyokOc1+nn3ikihdjgVdbQGx65UUj3m\nmwIwpCaFUHCVp7vYhCLJZntveQkaRF3wrm3QuHPy6ZyX0HS7hSFcXG1/o6Br4aeX\ndfaLa/22aumbE+ZDNJYK9c+KDzMwsxuTJtxBXLWJAoGAdVcRlNBG5R2L389jJhLb\nl4O0ZtejUAk+fto6CC0KeHwH9mSNFQXj4DoEqtTR0n2p8pcmX0F8NpVY+d2+mwwE\nvD8/LIHNF8Udxm9zBUaD+Av+11w8NdrVCMptWo3lD9qaJSmfEppRL2ByzfTCiSxg\ngcpOeR6uCDBgG6ZDXOR+rvU=\n-----END PRIVATE KEY-----\n",

      }),
      // databaseURL: "https://your-database-url.firebaseio.com", // If you are using Firebase Realtime Database
    });
  } catch (error) {
    console.log('Firebase admin initialization error', error.stack);
  }
}
export default admin;