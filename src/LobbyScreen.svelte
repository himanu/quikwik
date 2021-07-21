<script>
    let usersArray = [];
    let user;
    let users;
    let userId;
    let noOfOnlineUsers = 0;
    let noOfRequiredUser = 3;
    let questionId = [];
    let gameSessionId;
    let roundValue;
    let scoreOfUser = 0;
    let onlineUsersArray = [];
    let hostName;
    

    import {listenFirebaseKey,dbGameSessionRound,dbGameSessionRoundValue,dbUsers,dbUser,dbQuestionsId,dbScoreOfUser,dbHost} from './database';
    import {getGameSessionId, getParams} from './utils';
    import Tick from './Tick.svelte';
    import LoadingSvg from './svg/LoadingSvg.svelte';
    import DisconnectedSvg from './svg/DisconnectedSvg.svelte';
    import QuikWikSmallIcon from './QuikWikSmallIcon.svelte';
    import CustomButton from './CustomButton.svelte';
    import ScorecardIcon from './ScorecardIcon.svelte';
    import {fly} from 'svelte/transition';

    // addNotification()
    let mapToStringNumber = {
        1 : 'one',
        2 : 'two',
        3 : 'three',
        4 : 'four'
    }
    
    let hostId;
    let isHost = false;
    dbHost.on('value',(snap)=>{
        if(!snap.exists()) {
            isHost = false;
            return;
        }
        if(hostId) {
            const oldHostName = usersArray.find(user => user.id === hostId)?.userName;
			const newHostName = usersArray.find(user => user.id === snap.val())?.userName;
        }
        if(usersArray) {
            usersArray = usersArray;
        }
        hostId = snap.val();
        if(hostId === getParams('userId')) {
            isHost = true;
        }
        else {
            isHost = false;
        }
    })
    dbGameSessionRoundValue.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        roundValue = snap.val();
    })
    let scoreUpdated = false;
    
    dbScoreOfUser.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        if(scoreOfUser) {
            scoreUpdated = true;
        }
        scoreOfUser = snap.val() * 10;
    })
    dbQuestionsId.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        questionId = snap.val();
    })
    dbUsers.on('value',(snap)=>{
        if(!snap.exists()) {
            usersArray = [];
            return ;
        }
        users = snap.val();
        console.log('users ',users);
    })
    $: {
        usersArray = [];
        onlineUsersArray = [];
        for(const id in users) {
            let currUser = users[id];
            if(id === hostId) {
                console.log('Het i am run');
                let name = currUser.userName;
                let fname = name?.split(" ")[0];
                if(fname?.length > 10)
                {
                    fname = name?.split(" ")[0].toUpperCase()
                    
                    if( name?.split(" ")[1].toUpperCase() ) {
                        fname += name?.split(" ")[1].toUpperCase();
                    }
                }
                hostName = fname + " (Host)";
            }
            usersArray.push(currUser);
            if(currUser.isOnline){
                onlineUsersArray.push(currUser);
            }
        }
    }
    $: {
        noOfOnlineUsers = 0;
        for(const id in users) {
            let currUser = users[id];
            if(currUser.isOnline) {
                noOfOnlineUsers += 1;
            }
        }
        noOfRequiredUser = 3 - noOfOnlineUsers;
    }
    dbUser.on('value',(snap)=>{
        if(!snap.exists()) {
            return ;
        }
        user = snap.val();
    })
    $:{
        if(user) {
            userId = user.id;
        }
    } 
    // function keepUpdatingUsersOnlineStatus() {
    //     setInterval(updateUsersOnlineStatus, 1000);
    // }
    // let allUserOnlineStatus = {};
    // function updateUsersOnlineStatus() {
    //     for(const id in users) {
    //         let currUser = users[id];
    //         if( (currUser.online === true) || (Date.now() - currUser.online <= 5000) ) {
    //             allUserOnlineStatus[currUser.id] = true;
    //         }
    //         else {
    //             allUserOnlineStatus[currUser.id] = false;
    //         }
    //     }
    // }
    // updateUsersOnlineStatus();
    // keepUpdatingUsersOnlineStatus();
    
    function validUserProfilePicture(str) {
        try {
            new URL(str);
            return true;
        }
        catch(err){
            return false;
        }
    }
    function processName(user){
        let name = user.userName;
        let fname = name?.split(" ")[0];
        if(fname?.length > 10)
        {
            fname = name?.split(" ")[0].toUpperCase();
            if(name?.split(" ")[1].toUpperCase()) {
                fname += name?.split(" ")[0].toUpperCase();
            }
        }
        if(user.id === hostId) {
            fname = fname + " (Host)";
        }
        else if(user.id === userId) {
            if(!isHost) {
                fname = fname + " (You)";
            }
        }
        return fname;
    }
    
    gameSessionId = getGameSessionId();
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
    function handleStartGameBtn() {
        if(noOfRequiredUser > 0) {
            return;
        }
        postData('/startTimer', {gameSessionId,roundValue,onlineUsersArray,questionId})
        .then((data)=>{
            console.log('postData ',data);
            return;
        })
        .catch(()=> {
            console.log('some error occured');
        });
        // startTimer({gameSessionId,roundValue,usersArray,questionId});
        listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
            dbGameSessionRoundRef.update({
                page : 'Ready Set Go'
            })
        })
    }
    let disableBtn;
    let tooltipMsg
    $: {
        if(noOfRequiredUser > 0) {
            disableBtn = true;
            tooltipMsg = 'Need minimum 3 players to start the game'
        }
        else {
            disableBtn = false;
            tooltipMsg = '';
        }
    }
</script>
<main>
    <QuikWikSmallIcon/>
    <ScorecardIcon/>
    <div class = 'preJoinMsg' in:fly ="{{ y: -20, duration: 1000 }}">
        {#if noOfRequiredUser > 0}
            <pre> Need { mapToStringNumber[noOfRequiredUser] } more player</pre>
            <pre> Waiting for others to join</pre>
        {:else}
            {#if isHost}
                <pre> Start the game </pre>
            {:else}
                <div>
                    <div> Waiting for host </div> 
                    <div> to start the game </div>
                </div>
            {/if}
        {/if}
    </div>
    <div class = 'usersContainer' in:fly ="{{ y: -20, duration: 1000 }}">
        <div class="usersList">
            <div class="users">
                {#each usersArray as currUser}
                    <div class="user">
                        <div class="userDetails">
                            {#if validUserProfilePicture(currUser.profilePicture)}
                                <img class = "profilePicture" src = {currUser.profilePicture} alt = "UserProfilePicture">
                            {:else}
                                <div class="fakeProfilePicture"> {currUser.userName[0].toUpperCase()} </div>
                            {/if}
                            {#if currUser.id === hostId}
                                <div class = "name">
                                    {hostName}
                                </div>
                            {:else}
                                <div class = "name">
                                    {processName(currUser)} 
                                </div>
                            {/if}
                        </div>
                        {#if currUser.isOnline}
                            {#if currUser.online === true}
                                <Tick/>
                            {:else}
                                <LoadingSvg/>
                            {/if}
                        {:else}
                            <DisconnectedSvg/>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>
    {#if isHost}
        <div class="btnDiv" in:fly ="{{ y: -20, duration: 1000 }}">
            <CustomButton on:click = {handleStartGameBtn} btnText = {'Start Game'} disableBtn = {disableBtn} tooltipMsg = {tooltipMsg}/>
        </div>
    {/if}
    
</main>
<style>
    ::-webkit-scrollbar {
        width: 14px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
        background: #fff;
        border-radius : 7px;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
        background: #2A337E;;
        border-radius : 7px;
        border : 4px solid #fff;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #0e1346;
    }
    :global(html) {
        font-size : 20px;
    }
    main {
        width : 100%;
        height : 100%;
        background-color: #0C0030;
        display : flex;
        flex-direction: column;
        align-items : center;
        padding : 1rem;
    }
    .preJoinMsg {
        font-family : 'Padauk';
        font-weight : 700;
        font-size : 1.20rem;
        color : #fff;
        line-height : 1.60rem;
        text-align: center;
        margin : 2rem;
    }
    .usersContainer{
        width : 30%;
        min-height : 100px;
        max-height : 40%;
        border-radius : 18px;
        background-color: #fff;
        margin : auto;
    }
    
    @media screen and (max-width : 1100px) {
        .usersContainer {
            width : 30%;
        }
    }
    @media screen and (max-width : 1000px) {
        .usersContainer {
            width : 35%;
        }
        :global(html) {
            font-size : 18px;
        }
    }
    @media screen and (max-width : 900px) {
        :global(html) {
            font-size : 16px;
        }
        .usersContainer {
            width : 40%;
        }
    }
    @media screen and (max-width : 800px) {
        .usersContainer {
            width : 45%;
        }
    }
    @media screen and (max-width : 700px) {
        .usersContainer {
            width : 50%;
        }
    }
    .usersList {
        width : 100%;
        height : 100%;
        padding : 10px;
    }
    .users{
        max-height : 100%;
        width : 100%;
        overflow-y: auto;
        display : flex;
        flex-direction: column;
    }
    .user {
        display : flex;
        justify-content: space-between;
        align-items: center;
        padding : 10px 5px;
    }
    .userDetails {
        display : flex;
        justify-content: flex-start;
        align-items: center;  
    }
    .profilePicture {
        width : 20px;
        height : 20px;
        border-radius : 50%;
        margin-right : 5px;
    }
    .fakeProfilePicture {
        min-width : 20px;
        min-height : 20px;
        max-width : 20px;
        max-height : 20px;
        font-size : 12px;
        color : white;
        font-weight : 700;
        display : flex;
        font-family : 'Manrope';
        font-weight : 700;
        font-size : 0.75rem;
        justify-content: center;
        align-items : center;
        border-radius : 50%;
        background-color : #343E98;
        margin-right: 5px;
    }
    .name {
		font-family:  'Manrope';
        font-weight : 700;
        font-size : 0.75rem;
        color: #0C0030;
        white-space : nowrap;
    }
</style>
