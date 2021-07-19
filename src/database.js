import firebase from "firebase/app";
import "firebase/database";
import 'firebase/functions';
import { getGameSessionId, getParams,questionArray} from "./utils";

const firebaseConfig = {
    apiKey: "AIzaSyCEGBePNguj6IVlDbRdp1Mo135AK7wXsKo",
    authDomain: "da-quikwik-dev.firebaseapp.com",
    databaseURL: "https://da-quikwik-dev-default-rtdb.firebaseio.com",
    projectId: "da-quikwik-dev",
    storageBucket: "da-quikwik-dev.appspot.com",
    messagingSenderId: "502922511832",
    appId: "1:502922511832:web:d23f92c33f6aa2620d5ead"
};
firebase.initializeApp(firebaseConfig);
var firebaseEmulators = {
    "database": {
      "host": "localhost",
      "port": 9000
    },
    "functions": {
      "host": "localhost",
      "port": 5001
    }
  };
if (firebaseEmulators) {
    console.log("Automatically connecting Firebase SDKs to running emulators:");
    Object.keys(firebaseEmulators).forEach(function(key) {
    console.log('\t' + key + ': http://' +  firebaseEmulators[key].host + ':' + firebaseEmulators[key].port );
    });
    if (firebaseEmulators.database && typeof firebase.database === 'function') {
    firebase.database().useEmulator(firebaseEmulators.database.host, firebaseEmulators.database.port);
    }
    if (firebaseEmulators.firestore && typeof firebase.firestore === 'function') {
    firebase.firestore().useEmulator(firebaseEmulators.firestore.host, firebaseEmulators.firestore.port);
    }
    if (firebaseEmulators.functions && typeof firebase.functions === 'function') {
    firebase.functions().useEmulator(firebaseEmulators.functions.host, firebaseEmulators.functions.port);
    }
    if (firebaseEmulators.auth && typeof firebase.auth === 'function') {
    firebase.auth().useEmulator('http://' + firebaseEmulators.auth.host + ':' + firebaseEmulators.auth.port);
    }
} else {
    console.log("To automatically connect the Firebase SDKs to running emulators, replace '/__/firebase/init.js' with '/__/firebase/init.js?useEmulator=true' in your index.html");
}
  

let roundValue = 1;
function getRoundValue() {
    return roundValue;
}

export const startTimer = firebase.functions().httpsCallable('startTimer');

export const dbRoot = firebase.database().ref('quikwik');
export const dbQuestions = firebase.database().ref('allQuikWikQuestion');
export const dbQuestionsId = firebase.database().ref('allQuikWikQuestionId');
export const dbGameSession = dbRoot.child(getGameSessionId());
export const dbGameSessionRoundValue = dbGameSession.child("roundValue");
export const dbGameSessionRounds = dbGameSession.child("rounds");
export const dbUsers = dbGameSession.child('users');
export const dbUser = dbUsers.child(getParams('userId'));
export const dbHost = dbGameSession.child('host');
export const dbScoreOfUsers = dbGameSession.child('scoreOfUsers');
export const dbScoreOfUser = dbScoreOfUsers.child(getParams('userId'));
export const dbNoOfOnlineUsers = dbGameSession.child('noOfOnlineUsers');

export const dbGameSessionRound = ()=> dbGameSessionRounds.child(getRoundValue());
export const dbPage = ()=> dbGameSessionRound().child('page');
export const dbTimer = ()=> dbGameSessionRound().child('timer');
export const dbVoteTimer = ()=> dbGameSessionRound().child('voteTimer');
export const dbAllQuestions = ()=> dbGameSessionRound().child('allQuestions');
export const dbAllAnswers = ()=> dbGameSessionRound().child('allAnswers');
export const dbNoOfOnlinePlayers = ()=> dbGameSessionRound().child('noOfOnlinePlayers');
export const dbUsersWhoAnswered = ()=> dbGameSessionRound().child('usersWhoAnswered');
export const dbNoOfUsersWhoHaveNotAnswered = ()=> dbGameSessionRound().child('noOfUsersWhoHaveNotAnswered');
export const dbCurrentQuestionNumber = ()=> dbGameSessionRound().child('currentQuestionNumber');
export const dbCurrentQuestionVoters = ()=> dbGameSessionRound().child('currentQuestionVoters');
export const dbNoOfVotersRemaining = ()=> dbGameSessionRound().child('noOfVotersRemaining');

export function listenFirebaseKey(key,callback) {
    roundTimeValuePromise.then(()=>{
        callback(key());
    })
}
const roundTimeValuePromise = new Promise((resolve,reject)=>{
    dbGameSessionRoundValue.once('value',(snap)=>{
        if(!snap.exists()) {
            roundValue = 1;
        }
        else {
            roundValue = snap.val();
        }
        resolve();
    })
})

dbGameSessionRoundValue.on("value", (snap) => {
    if(!snap.exists()) {
        dbGameSessionRoundValue.set(1);
        roundValue = 1;
        return ;
    }
    roundValue = snap.val();
})

var connectedRef = firebase.database().ref('.info/connected');
connectedRef.on('value', (snap) => {
    if (snap.val() === true) {

		dbUser.update({
            online : true,
            isOnline : true
        });

        dbUser.onDisconnect().update({
            online : firebase.database.ServerValue.TIMESTAMP
        });
    }
});
dbScoreOfUser.once('value',(snap)=>{
    if(!snap.exists()) {
        dbScoreOfUser.set(0);
        return;
    }
})
dbUser.update({
    id: getParams('userId'),
    userName: getParams('userName'),
    profilePicture: getParams('userProfilePicture')
});

// Code for adding all questions and allquestionId
function addQuestionAndIdToDatabase() {
    var totalQuestions = questionArray.length;

    var allQuikWikQuestionId = [];
    var allQuikWikQuestion = {};
    var  i = 0;
    for(i; i<totalQuestions ; i++) {
        allQuikWikQuestionId.push(i);
        allQuikWikQuestion[i] = questionArray[i];
    }
    dbQuestions.set(allQuikWikQuestion);
    dbQuestionsId.set(allQuikWikQuestionId);
}
addQuestionAndIdToDatabase();
