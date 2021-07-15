const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const { user } = require('firebase-functions/lib/providers/auth');
admin.initializeApp();
const db = admin.database();
const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '1GB'
}
exports.updateIsOnlineKey = functions.database.ref('/quikwik/{gameSessionId}/users/{userId}/online')
  .onUpdate((change,context)=>{
    let userRef = change.after.ref.parent;
    if(change.after.val() === 'online') {
      console.log('user is set online1');
      return userRef.update({
        isOnline : true
      });
    }
    else {
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          userRef.get().then((snap)=>{
            if(!snap.exists()) {
              resolve();
            }
            let isOnline;
            if(snap.val().online === true) {
              console.log('user is set online2');
              isOnline = true;
            }
            else if( Date.now() - snap.val().online > 5000){
              console.log('user is set offline');
              isOnline = false;
            }
            else {
              console.log('user is set online3');
              isOnline = true;
            }
            userRef.update({
              isOnline
            }).then(()=>{
              resolve();
            })
          })
          .catch(()=>{
            console.log('Can get users');
            resolve();
          })
        },5000)
      })
    }
  })

exports.updateNumberOfUsersWhoHaveNotAnswered = functions.database.ref('/quikwik/{gameSessionId}/rounds/{roundValue}/usersWhoAnswered/{bar}')
    .onCreate((snapshot, context) => {
      let noOfUsersWhoHaveNotAnsweredRef = snapshot.ref.parent.parent.child('noOfUsersWhoHaveNotAnswered');
      let pageRef = snapshot.ref.parent.parent.child('page');
      let roundRef = snapshot.ref.parent.parent;
      let noOfUsersWhoHaveNotAnswered;
      return new Promise(async(resolve,reject)=>{
        noOfUsersWhoHaveNotAnsweredRef.get().then((snap)=>{

          if(!snap.exists()) {
            resolve();
          }
          noOfUsersWhoHaveNotAnswered = snap.val();
          let promiseArray = [noOfUsersWhoHaveNotAnsweredRef.transaction((count)=>{
            return count - 1;
          })];
    
          if(noOfUsersWhoHaveNotAnswered === 1) {
            console.log('Change the page to do Voting and remove the timer');
            promiseArray = [ ...promiseArray, pageRef.set('Do Voting'), roundRef.child('timer').remove() ];
          }
          Promise.all(promiseArray).then(()=>{
            console.log('Page is set do voting and timer is removed');
            resolve()
          })
          .catch(()=>{
            console.log('Some error has occured');
            resolve();
          })
        })
        .catch(()=>{
          console.log('No of users who have not answered not exist');
          resolve();
        })
      })
});

exports.updateVotersOnChangeOfQuestion = functions.database.ref('/quikwik/{gameSessionId}/rounds/{roundValue}/currentQuestionNumber/')
  .onWrite((change,context)=>{
    if(!change.after.exists()) {
      return null;
    }
    let allAnswersRef = change.after.ref.parent.child('allAnswers');
    let usersRef = change.after.ref.parent.parent.parent.child('users');
    let allAnswers = {};
    let currentQuestionNumber = change.after.val();
    let currentQuestionId;
    let users;
    let voters = {};
    let noOfVotersRemaining = 0;
    let firstUserId,secondUserId;
    
    // Get allAnswers asynchronously and questionNumber After this get the current QuestionId and firstUserId,secondUserId
    // Get all users and filter them to get only voters and then perform desired task.
    let promiseArray = [allAnswersRef.get(),usersRef.get()];
    return new Promise((resolve,reject)=>{
      Promise.all(promiseArray)
      .then((snapshotArray)=>{
        if(!snapshotArray[0].exists() || !snapshotArray[1].exists()) {
          console.log('All answer or users not exists');
          resolve();
        }
        allAnswers = snapshotArray[0].val();
        users = snapshotArray[1].val();
        console.log('All answers in updatevoters ',allAnswers);

        let i = 0;
        for(const questionId in allAnswers) {
          if(i === currentQuestionNumber) {
            currentQuestionId = questionId;
            console.log('currentQuestionId in updatevoters ',currentQuestionId);
            break;
          }
          i++;
        }
        if(!currentQuestionId) {
          console.log('Current question Id not exists');
          resolve();
        }
        let currentQuestionUsers = allAnswers[currentQuestionId];
        console.log('currentQuestionUsers in updatevoters ',currentQuestionUsers);
        for(const id in currentQuestionUsers) {
          if(!firstUserId) {
            firstUserId = id;
          }
          else if(!secondUserId) {
            secondUserId = id;
            break;
          }
        }

        for(const userId in users) {
          if(userId !== firstUserId && userId !== secondUserId) {
            voters[userId] = false;
            noOfVotersRemaining += 1;
          }
        }


        Promise.all([change.after.ref.parent.child('currentQuestionVoters').set(voters),
        change.after.ref.parent.child('noOfVotersRemaining').set(noOfVotersRemaining)])
        .then(()=>{
          console.log('Page and noOfVotersRemaining is set');
          resolve();
        })
        .catch(()=>{
          console.log('Page and noOfVotersRemaining cannot be set');
          resolve();
        });
      })
      .catch(()=>{
        console.log('All Answers and users cannot be get');
        resolve();
      })
    })
  })

exports.noOfVotersRemainingOnVoting = functions.database.ref('/quikwik/{gameSessionId}/rounds/{roundValue}/currentQuestionVoters/{voterId}')
  .onUpdate((change,context)=>{
    if(!change.before.exists()) {
      return null;
    }
    if(!change.after.exists()) {
      return null;
    }
    console.log(context.params.voterId);
    console.log(change.after.val());
    let noOfVotersRemainingRef = change.after.ref.parent.parent.child('noOfVotersRemaining');
    if(change.after.val() === true) {
      console.log('No of voters remaining is reduced by 1');
      return noOfVotersRemainingRef.transaction((count)=>{
        return count - 1;
      })
    }
    else {
      return Promise.resolve();
    }
  })
//Code when new user joins 
exports.incrementNoOfOnlineUsers = functions.database.ref('/quikwik/{gameSessionId}/users/{id}')
  .onCreate((snapshot,context)=>{
    let noOfOnlineUsersRef = snapshot.ref.parent.parent.child('noOfOnlineUsers');
    return noOfOnlineUsersRef.transaction((count)=> {
      return count + 1
    });
  })
exports.addNewUserToVoterListAndIncrementNumberOfVotersLeft = functions.database.ref('/quikwik/{gameSessionId}/users/{id}')
  .onCreate(async (snapshot,context)=>{
    let userId = context.params.id;
    console.log('id of new user ',userId);
    let usersRef = snapshot.ref.parent;
    let users;
    let currentRoundValue,currentRoundValueSnap;
    let currentRoundValueRef = snapshot.ref.parent.parent.child('roundValue');
    let currentQuestionVotersRef,currentQuestionVotersSnap;
    let currentQuestionVotersObj;
    
    try {
      currentRoundValueSnap = await currentRoundValueRef.get();
      if(!currentRoundValueSnap.exists()) {
        return null;
      }
      currentRoundValue = currentRoundValueSnap.val();
      console.log('current round value ',currentRoundValue);

      currentQuestionVotersRef = snapshot.ref.parent.parent.child('rounds').child(currentRoundValue).child('currentQuestionVoters');
      currentQuestionVotersSnap = await currentQuestionVotersRef.get();
      if(!currentQuestionVotersSnap.exists()) {
        console.log('CUrrent question voters not exists');
        return null;
      }
      currentQuestionVotersObj = currentQuestionVotersSnap.val();
      currentQuestionVotersObj[userId] = false;
      console.log('CUrrent question voters object ',currentQuestionVotersObj);

      return Promise.all([currentQuestionVotersRef.set(currentQuestionVotersObj),currentQuestionVotersRef.parent.child('noOfVotersRemaining').transaction((count)=>{
        return count + 1;
      })])
      .then(()=>{
        console.log('No of voters remaining and current question voters are set');
      })
      .catch(()=>{
        console.log('Unable to set no of voters remaining and current question voters');
      })
    }
    catch(e) {
      console.log('Something went wrong');
      return null;
    }
  })
exports.changeRoundWhenThereAreLessThanThreeUsersInVotingScreen = functions.database.ref('/quikwik/{gameSessionId}/noOfOnlineUsers')
  .onUpdate(async(change,context) => {
    let noOfOnlineUsers = change.after.val();
    console.log('noOfOnlineUsers ',noOfOnlineUsers);
    if(noOfOnlineUsers >= 3) {
      console.log('No of online users are greater than 2');
      return null;
    }
    let currentRoundValueRef = change.after.ref.parent.child('roundValue');
    let roundValue,roundValueSnap;
    let pageRef,pageSnap,page;
    try {
      roundValueSnap = await currentRoundValueRef.get();
      if(!(roundValueSnap).exists()) {
        console.log('Current round value not exists');
        return null;
      } 
      roundValue = roundValueSnap.val();
      console.log('roundValue',roundValue);

      pageRef = change.after.ref.parent.child('rounds').child(roundValue).child('page');
      pageSnap = await pageRef.get();
      if(!(pageSnap).exists()) {
        console.log('page not exists');
        return null;
      }
      page = pageSnap.val();
      console.log('Page ',page);
      if(page === 'Do Voting' && noOfOnlineUsers < 3) {
        console.log('Change round value');
        return currentRoundValueRef.transaction((count)=>{
          return count + 1;
        })
        .then(()=>{
          console.log('Round Value is incremented');
        })
        .catch(()=>{
          console.log('Some error occur while incrementing round value');
        })
      }
      else if(page === 'Leaderboard Screen' && !noOfOnlineUsers) {
        console.log('Change round value when no online users in leaderboard screen');
        return currentRoundValueRef.transaction((count)=>{
          return count + 1;
        })
        .then(()=>{
          console.log('Round Value is incremented');
        })
        .catch(()=>{
          console.log('Some error occur while incrementing round value');
        })
      }
      else {
        console.log('Nothing to change');
        return null;
      }
    }
    catch{
      console.log('Something went wrong');
      return null;
    }
  })
exports.changeRoundWhenThereAreLessThanThreeOnlinePlayerInGameScreen = functions.database.ref('/quikwik/{gameSessionId}/rounds/{roundValue}/noOfOnlinePlayers')
  .onUpdate(async(change,context)=>{
    let noOfOnlinePlayers = change.after.val();
    console.log('NoOfOnlinePlayers ',noOfOnlinePlayers);
    let pageRef = change.after.ref.parent.child('page');
    let page;
    let roundRef = change.after.ref.parent.parent.parent.child('roundValue');
    let roundValue;
    return new Promise((resolve,reject)=>{
      Promise.all([pageRef.get(),roundRef.get()])
      .then((snapshot)=>{

        if(!snapshot[0].exists() || !snapshot[1].exists()) {
          console.log('Page or roundValue not exist');
          resolve();
          return ;
        }
        page = snapshot[0].val();
        roundValue = snapshot[1].val();
        console.log('page ',page, ' roundValue ',roundValue);

        if(page === 'Game Screen' && noOfOnlinePlayers < 3) {
          console.log('Game screen cannot have less than 3 online player and hence round Value is incremented');
          
          return roundRef.set(roundValue + 1).then(()=>{
            resolve();
            console.log('round Value is incremented');
          })
          .catch((e)=>{
            resolve();
            console.log('round Value can not be incremented');
          })
        }
        else {
          console.log('Nothing to change');
          resolve();
        }
      })
      .catch(()=>{
        console.log('Some problem occur');
        resolve();
      })
    })
  })
exports.removeHostWhenOffline = functions.database.ref('/quikwik/{gameSessionId}/users/{id}/isOnline')
  .onUpdate(async(change,context)=>{
    let userOnlineStatus = change.after.val();
    let userId = context.params.id;
    let hostRef = change.after.ref.parent.parent.parent.child('host');
    let hostId;
    let hostSnap;
    if(userOnlineStatus === false) {
      return new Promise(async(resolve,reject)=>{
        hostSnap = await hostRef.get();
        if(!hostSnap.exists()) {
          console.log('Host not exists');
          resolve();
          return;
        } 
        hostId = hostSnap.val();
        console.log('Host Id ',hostId);
        if(hostId === userId) {
          console.log('Host went offline');
          hostRef.remove().then(()=>{
            console.log('Host get removed');
            resolve();
          })
          .catch(()=>{
            console.log('Error occur while removing host');
            resolve();
          });
        }
        else {
          console.log('Current id not equal to hostid');
          resolve();
        }
      })
    }
    else {
      console.log('Nothing to change');
      return null;
    }
  })
exports.changeNoOfOnlineUser = functions.database.ref('/quikwik/{gameSessionId}/users/{id}/isOnline')
  .onUpdate((change,context)=>{
    let userOnlineStatus = change.after.val();
    let noOfOnlineUsersRef = change.after.ref.parent.parent.parent.child('noOfOnlineUsers');
    if(userOnlineStatus === true) {
      return noOfOnlineUsersRef.transaction((count)=>{
        return count + 1;
      })
    }
    else {
      return noOfOnlineUsersRef.transaction((count)=>{
        return count - 1;
      })
    }
  })
exports.changeNoOfOnlinePlayers = functions.database.ref('/quikwik/{gameSessionId}/users/{id}/isOnline')
  .onUpdate(async(change,context)=>{
    let allQuestionsRef;
    let userOnlineStatus = change.after.val();
    let userId = context.params.id;
    let currentRoundValueRef = change.after.ref.parent.parent.parent.child('roundValue');
    let currentRoundValue;
    let allQuestions,allQuestionsSnap;
    let currentRoundValueSnap;
    return new Promise(async(resolve,reject)=>{
      try {
        currentRoundValueSnap = await currentRoundValueRef.get();
        if(!currentRoundValueSnap.exists()) {
          console.log('Current round value not exists');
          resolve();
          return;
        }
        currentRoundValue = currentRoundValueSnap.val();
        console.log('Current round Value ',currentRoundValue);
        allQuestionsRef = currentRoundValueRef.parent.child('rounds').child(currentRoundValue).child('allQuestions');

        allQuestionsSnap = await allQuestionsRef.get();
        if(!allQuestionsSnap.exists()) {
          console.log('Allquestions not exists');
          resolve();
          return;
        }
        else {
          allQuestions = allQuestionsSnap.val();
          console.log('All questions ',allQuestions);
          let noOfOnlinePlayersRef = allQuestionsRef.parent.child('noOfOnlinePlayers');
          if(userId in allQuestions) {
            console.log('userid is of one of the player');
            if(userOnlineStatus === true) {
              console.log('NoOfOnlinePlayer += 1');
              noOfOnlinePlayersRef.transaction((count)=>{
                return count + 1;
              })
              .then(()=>{
                console.log('NoOfOnlinePlayer += 1 is done');
                resolve();
              })
              .catch(()=>{
                console.log('NoOfOnlinePlayer += 1 error occur');
                resolve();
              })
            }
            else {
              noOfOnlinePlayersRef.transaction((count)=>{
                return count - 1;
              })
              .then(()=>{
                console.log('NoOfOnlinePlayer -= 1 is done');
                resolve();
              })
              .catch(()=>{
                console.log('NoOfOnlinePlayer -= 1 error occur');
                resolve();
              })
            }
          }
          else {
            console.log('userid is not of the player');
            resolve();
          }
        }
      }
      catch {
        console.log('Some error occur');
        resolve();
      }
    })
  })
exports.updateNoOfVotersRemainingWhenSomeUserWentOffline = functions.runWith(runtimeOpts).database.ref('/quikwik/{gameSessionId}/users/{id}/isOnline')
  .onUpdate((change,context)=>{
    console.log(change.after.val());
    let userOnlineStatus = change.after.val();
    let userId = context.params.id;
    let currentRoundValueRef = change.after.ref.parent.parent.parent.child('roundValue');
    let currentRoundValue,currentRoundValueSnap;
    let currentQuestionVotersRef,currentQuestionVotersSnap;
    let currentQuestionVoters;
    
    return new Promise(async(resolve,reject)=>{
      try {
        currentRoundValueSnap = await currentRoundValueRef.get();
        if(!(currentRoundValueSnap).exists()) {
          console.log('Current round value not exisits');
          resolve();
        }
        else {
          currentRoundValue = currentRoundValueSnap.val();
          console.log('Current round Value ',currentRoundValue);
          currentQuestionVotersRef = currentRoundValueRef.parent.child('rounds').child(currentRoundValue).child('currentQuestionVoters');
          currentQuestionVotersSnap = await currentQuestionVotersRef.get();
          if(!currentQuestionVotersSnap.exists()) {
            console.log('CurrentquestionVoters not exisits');
            resolve();
            return;
          }
          currentQuestionVoters = currentQuestionVotersSnap.val();
          console.log('Current Question Voters ',currentQuestionVoters);

          if(userId in currentQuestionVoters) {
            isThisUserVoter = true;
            let noOfVotersRemainingRef = currentQuestionVotersRef.parent.child('noOfVotersRemaining');
            if(currentQuestionVoters[userId] === false) {
              if(userOnlineStatus === false) {
                console.log('Voters went offline so reduce the no of noOfVotersRemaining');
                console.log('NoofvotersRemaining -= 1');
                noOfVotersRemainingRef.transaction((count)=>{
                  return count - 1;
                })
                .then(()=>{
                  console.log('NoofvotersRemaining -= 1 successful');
                  resolve();
                })
                .catch(()=>{
                  console.log('NoofvotersRemaining -= 1 failed');
                  resolve();
                })
              }
              else {
                console.log('Voters come online so increment the no of noOfVotersRemaining');
                console.log('NoofvotersRemaining += 1');
                noOfVotersRemainingRef.transaction((count)=>{
                  return count + 1;
                })
                .then(()=>{
                  console.log('NoofvotersRemaining += 1 successful');
                  resolve();
                })
                .catch(()=>{
                  console.log('NoofvotersRemaining += 1 failed');
                  resolve();
                })
              }
            }
            else {
              console.log('User has voted already so no problem');
              resolve();
            }
          }
        }
      }
      catch {
        console.log('Something went wrong');
        resolve();
      }
    })
  })

exports.updateQuestionNumberOnCompleteVoting = functions.database.ref('/quikwik/{gameSessionId}/rounds/{currentRoundValue}/noOfVotersRemaining')
  .onUpdate(async(change,context)=>{
    let noOfVotersRemaining = change.after.val();
    console.log('No of Voters Remaining ',noOfVotersRemaining);
    if(noOfVotersRemaining === 0) {
      let votingTimerRef = change.after.ref.parent.child('voteTimer');
      votingTimerRef.set(Date.now() + 11000);
      //Now we give the points to winner of current question
      let currentQuestionNumberRef = change.after.ref.parent.child('currentQuestionNumber');
      let currentQuestionNumber,currentQuestionNumberSnap;
      let totalNumberOfQuestions = 0;
      let allAnswersRef;
      let allAnswers,allAnswersSnap;
      let currentQuestionId;
      let firstUserScore,secondUserScore,firstUserVotes = 0,secondUserVotes = 0;
      let scoreOfUsersRef = change.after.ref.parent.parent.parent.child('scoreOfUsers');
      let scoreOfUsers,scoreOfUsersSnap;
      let firstUserId,secondUserId;
      allAnswersRef = currentQuestionNumberRef.parent.child('allAnswers');
      return new Promise((resolve,reject)=>{
        Promise.all([ currentQuestionNumberRef.get(), allAnswersRef.get(),scoreOfUsersRef.get() ])
        .then((snapshotArray)=>{
          currentQuestionNumberSnap = snapshotArray[0];
          allAnswersSnap = snapshotArray[1];
          scoreOfUsersSnap = snapshotArray[2];

          currentQuestionNumber = currentQuestionNumberSnap.val();
          console.log('Current Question Number ',currentQuestionNumber);

          allAnswers = allAnswersSnap.val();
          console.log('Allanswers ',allAnswers);

          scoreOfUsers = scoreOfUsersSnap.val();
          console.log('Score of users ',scoreOfUsers);

          totalNumberOfQuestions = 0;
          let i = 0;
          for(const questionId in allAnswers) {
            if(i === currentQuestionNumber) {
              currentQuestionId = questionId;
            }
            totalNumberOfQuestions += 1;
            i += 1;
          }
          console.log('Total Number Of question ',totalNumberOfQuestions);

          setTimeout(async()=>{
            votingTimerRef.remove();
            i = 0;
            //Get the votes of first user and second user
            allAnswersSnap = await allAnswersRef.get();
            allAnswers = allAnswersSnap.val();
            console.log('Allanswers ',allAnswers);

            console.log('Allanswers of current questionId', allAnswers[currentQuestionId]);
            for(const userId in allAnswers[currentQuestionId]) {
              if(i === 0){
                firstUserId = userId;
                console.log('firstUserId ',firstUserId);
                if(allAnswers[currentQuestionId][userId]['votedBy']) {
                  firstUserVotes = allAnswers[currentQuestionId][userId]['votedBy'].length;
                  console.log('FirstUserVotes ',firstUserVotes);
                }
                firstUserScore = scoreOfUsers[firstUserId];
              }
              else if(i === 1) {
                secondUserId = userId;
                console.log('SecondUserId ',secondUserId);
                if(allAnswers[currentQuestionId][userId]['votedBy']) {
                  secondUserVotes = allAnswers[currentQuestionId][userId]['votedBy'].length;
                  console.log('SecondUserVotes ',secondUserVotes);
                }
                secondUserScore = scoreOfUsers[secondUserId];
              }
              i++;
            }
            console.log('FirstUserScore ',firstUserScore);
            console.log('SecondUserScore ',secondUserScore);
            console.log('Change the question');
            new Promise((res,rej)=>{
              if(firstUserVotes > secondUserVotes) {
                firstUserScore += 1;
                scoreOfUsersRef.child(firstUserId).set(firstUserScore)
                .then(()=>{
                  console.log('First users score is set');
                  res();
                })
                .catch(()=>{
                  console.log('First user score cannot be set');
                  res();
                })
              }
              else if(secondUserVotes > firstUserVotes) {
                secondUserScore += 1;
                scoreOfUsersRef.child(secondUserId).set(secondUserScore)
                .then(()=>{
                  console.log('Second users score is set');
                  res();
                })
                .catch(()=>{
                  console.log('Second user score cannot be set');
                  res();
                });
              }
              else {
                res();
              }
            })
            .then(()=>{
              if(currentQuestionNumber < (totalNumberOfQuestions - 1)){
                currentQuestionNumberRef.set(currentQuestionNumber + 1)
                .then(()=>{
                  console.log('Question number is incremented');
                  resolve();
                })
                .catch(()=>{
                  console.log('Error occur in Question number incrementation');
                  resolve();
                });
              }
              else {
                console.log('LeaderBoard screen is set');
                currentQuestionNumberRef.parent.child('page').set('Leaderboard Screen')
                .then(()=>{
                  console.log('Page changed to leaderboard');
                  resolve();
                })
                .catch(()=>{
                  console.log('Error occure on changing Page to leaderboard');
                  resolve();
                });
              }
            })
            .catch(()=>{
              console.log('Some error occure while updating the score of users');
              resolve();
            })
          },11000);
        })
        .catch(()=>{
          console.log('Unable to get allAnswers or currentQuestionNumber');
          resolve();
        })
      })
    }
    else {
      console.log('No of voters remaining is non zero')
      return null;
    }
  })

exports.hostDelete = functions.database.ref("/quikwik/{gameSessionId}/host")
  .onDelete((snap, context) => {
    const oldHostId = snap.val();
    const usersRef = snap.ref.parent.child("users");
    let users,usersSnap;
    return new Promise(async(resolve,reject)=>{
      try {
        usersSnap = await usersRef.get();
        if(!usersSnap.exists()) {
          console.log('Users not exist');
          resolve();
          return;
        }
        users = usersSnap.val();
        console.log('users ',users);
        let usersArray = [];
        for(const id in users) {
          usersArray.push(users[id]);
        }
        console.log('usersArray ',usersArray);
        let onlineUsers = usersArray.filter( user => user.isOnline === true && user.id !== oldHostId);
        console.log('Online users ',onlineUsers);
        onlineUsers.sort(compare);
        const newHost = onlineUsers[0];
        if (newHost) {
          console.log('new host ',newHost);
          snap.ref.set(newHost.id)
          .then(()=>{
            console.log('Host id set success');
            resolve();
          })
          .catch(()=>{
            console.log('Host id set fail');
            resolve();
          });
        }
      }
      catch {
        console.log('Something went wrong');
        resolve();
      }
    })
  });
exports.startTimer = functions.https.onRequest((req, res) => {
  const data = req.body;
  const page = db.ref(`/quikwik/${data.gameSessionId}/rounds/${data.roundValue}/page`);
  const round = db.ref(`/quikwik/${data.gameSessionId}/rounds/${data.roundValue}`);
  const noOfOnlinePlayers = db.ref(`/quikwik/${data.gameSessionId}/rounds/${data.roundValue}/noOfOnlinePlayers`);
  // round.child('timer').set(Date.now() + 66000).then(()=>{
  //   console.log('Timer is set');
  // });
  //Add allQuestions field in database
  let usersArray = data.onlineUsersArray;
  let questionId = data.questionId;
  let allQuestionObject = {};
  let i = 0;
  let numberOfUser = usersArray.length;
  // noOfOnlinePlayers.set(numberOfUser).then(()=>{
  //   console.log('No of online players is set');
  // });
  shuffle(questionId);
  for(i; i<usersArray.length-1 ; i++) {
      allQuestionObject[usersArray[i].id] = [questionId[i],questionId[i + 1]];
  }
  allQuestionObject[usersArray[i].id] = [questionId[numberOfUser - 1], questionId[0]];
  round.update({
    allQuestions : allQuestionObject,
    noOfUsersWhoHaveNotAnswered : numberOfUser,
    timer : Date.now() + 66000,
    noOfOnlinePlayers : numberOfUser
  }).then(()=>{
    console.log('All the required values are set');
  })
  setTimeout(() => {
    page.set('Do Voting');
    round.child('timer').remove();
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
      // Send response to OPTIONS requests
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).json({'text': ''});
    } else {
      res.json({'text':'Hello World!'});
    }
  },65000);
});

function compare( a, b ) {
  return Math.random > 0.5;
}
function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}