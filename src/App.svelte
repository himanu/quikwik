<script>
    import {getGameSessionId,getParams} from './utils';
	import { dbGameSessionRoundValue,dbGameSessionRounds,listenFirebaseKey, dbPage,dbScoreOfUsers,dbUsers,dbUser, dbHost,dbAllQuestions,dbNoOfOnlinePlayers,dbNoOfOnlineUsers,dbQuestionsId} from './database';
	import QuikWikIcon from './QuikWikIcon.svelte';
	import CustomButton from './CustomButton.svelte';
	import LobbyScreen from './LobbyScreen.svelte';
    import ReadySetGo from './ReadySetGo.svelte';
    import Game from './Game.svelte';
    import DoVoting from './DoVotingTest.svelte';
    import LeaderBoard from './LeaderBoard.svelte';
    import Notifications from './Notification.svelte';
    import {info} from './Notifier';
    import {fly} from 'svelte/transition';

	let page;
	var dbGameSessionRound;
	let roundValue;
    let userId = getParams('userId');
    let users;
    let user;
    let hostId;
    let noOfOnlineUsers;
    let gameSessionId = getGameSessionId();
    let onlineUsersArray = [];
    let questionId = [];

    const isHost = getParams("isHost") === "true";
	if (getParams("isHost") === "true") {
		dbHost.get().then(snap => {
			if (!snap.val()) {
				dbHost.set(getParams('userId'));
			}
		}).catch(()=>{
            dbHost.set(getParams('userId'));
        });
	}
    function processName(name) {
        let fname = name?.split(" ")[0];
        if(fname?.length > 8)
        {
            fname = fname.slice(0,5) + "...";
        }
        return fname;
    }
    let allQuestions;
    listenFirebaseKey(dbAllQuestions,(dbAllQuestionsRef)=>{
        dbAllQuestionsRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            allQuestions = snap.val();
        })
    })
    listenFirebaseKey(dbNoOfOnlinePlayers,(dbNoOfOnlinePlayersRef)=>{
        dbNoOfOnlinePlayersRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            if(snap.val() < 3 && page === 'Game Screen') {
                info(`Game can't be continued due to less number of online players`,'RoundChanged',5000);
            }
        })
    })
    let usersArray = [];
    let usersOnlineStatus = {};
    dbUsers.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        users = snap.val();
        usersArray = Object.values(users);
    })
    $: {
        if(users) {
            onlineUsersArray = [];
            for(const id in users) {
                let currUser = users[id];
                if(currUser.isOnline) {
                    onlineUsersArray.push(currUser);
                }
                if(users[id].isOnline === false) {
                    if(id in usersOnlineStatus && usersOnlineStatus[id] === true) {
                        if(id === userId) {
                            info('You have been disconnected, please check your internet connection','Disconnected',5000);
                        }
                        else {
                            info(`${users[id]['userName']} is disconnected. Waiting for ${users[id]['userName']} to connect again`,'Disconnected',5000);
                        }
                    }
                    usersOnlineStatus[id] = false;
                }
                else {
                    if((id in usersOnlineStatus) && usersOnlineStatus[id] === false) {
                        if(id === userId) {
                            info('You are reconnected','Reconnected',5000);
                        }
                        else {
                            info(`${users[id]['userName']} is reconnected`,'Reconnected',5000);
                        }
                    }
                    usersOnlineStatus[id] = true;
                }
            }
        }
    }
    dbUser.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        user = snap.val();
    })
    // $: {
    //     if(user?.isOnline === false) {
    //         info('You have been disconnected, please check your internet connection',5000);
    //     }
    // }
    $: {
        if(user && allQuestions) {
            if(! (user.id in allQuestions) ) {
                if( user.id === getParams('userId') ) {
                    info('You are spectator, you can do voting only.','Reconnected',5000);
                }
            }
        }
    }
    dbHost.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        if(hostId) {
            const oldHostName = processName( usersArray.find(user => user.id === hostId)?.userName );
			const newHostName = processName( usersArray.find(user => user.id === snap.val())?.userName );
            let message = '';
            if (snap.val() === getParams('userId')) {
				message = `${oldHostName || "Old Host"} has left the game and you are the new host`;
			} 
            else {
				if (newHostName) {
					message = `${oldHostName || "Old Host"} has left the game and new host is ${newHostName}`;
				} else {
					message = `${oldHostName || "Old Host"} has left the game and new host has been assigned`;
				}
			}
            info(message,"HostDisconnected",5000);
        }
        hostId = snap.val();
    })
    dbNoOfOnlineUsers.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        noOfOnlineUsers = snap.val();
        if((noOfOnlineUsers < 3 && (page === 'Do Voting')) || (!noOfOnlineUsers && page === 'Leaderboard Screen')) {
            info(`Game can't be continued due to less number of online players`,'RoundChanged',5000);
        }
    })
	function handleClick() {
        listenFirebaseKey(dbPage,(dbPageRef)=>{
            dbPageRef.set('Lobby Screen')
        })
    }
    dbQuestionsId.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        questionId = snap.val();
    })
    async function postData(url = '', data = {}) {
    // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
    }
    function handleNextRoundBtn() {
        postData('/startTimer', {gameSessionId,roundValue,onlineUsersArray,questionId})
        .then((data)=>{
            console.log('postData ',data);
            return;
        })
        .catch(()=> {
            console.log('some error occured');
        });
        
    }
    
	const snapFun = function(snap){
        if(!snap.exists()) {
            if(roundValue !== 1) {
                handleNextRoundBtn();
                dbGameSessionRound.update({
                    page : 'Ready Set Go'
                })
            }
            else {
                page = 'Welcome'
            }
            return;
        }
        page = snap.val().page;
        if(!page) {
            page = 'Welcome'
        }
    }
    dbGameSessionRoundValue.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        roundValue = snap.val();
        if(dbGameSessionRound){
            dbGameSessionRound.off('value',snapFun);
        }

        dbGameSessionRound = dbGameSessionRounds.child(roundValue);
        dbGameSessionRound.on('value',snapFun);
    })
	$: console.log('Page ',page);
    $: console.log('RoundValue ',roundValue);
</script>
{#if  page === 'Welcome'}
	<div class = 'welcomeScreen'>
        <div class="container" in:fly ="{{ y: -20, duration: 1000 }}">
            <QuikWikIcon/>
            <CustomButton on:click = {handleClick} btnText = {"Start Game "} disableBtn = {false}/>
        </div>
	</div>
{:else if page === 'Lobby Screen'}
	<LobbyScreen />
{:else if page === 'Ready Set Go'}
    <ReadySetGo/>
{:else if page === 'Game Screen'}
    <Game/>
{:else if page === 'Do Voting'}
    <DoVoting/>
{:else if page === 'Leaderboard Screen'}
    <LeaderBoard/>
{:else}
    <div class = 'welcomeScreen'>
		<QuikWikIcon/>
	</div>
{/if}
<Notifications/>
<style>
	:global(*){
        box-sizing: border-box;
		padding : 0;
		margin : 0;
        outline : 0;
    }
	.welcomeScreen {
		width : 100%;
		height : 100%;
		background-color: #532D71;
        padding : 1rem;
        display : flex;
        flex-direction: column;
        align-items : center;
	}
    .container {
		width : 100%;
		height : 100%;
        display : flex;
        flex-direction: column;
        align-items : center;
    }
    
</style>