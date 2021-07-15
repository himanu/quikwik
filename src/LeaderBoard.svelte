<script>
    import QuikWikSmallIcon from './QuikWikSmallIcon.svelte';
    import ScorecardIcon from './ScorecardIcon.svelte';
    import {getParams} from './utils';
    import {listenFirebaseKey,dbScoreOfUsers,dbUsers,dbGameSession,dbGameSessionRoundValue,dbHost} from './database';
    import CustomButton from './CustomButton.svelte';
    import RoundIndicator from './RoundIndicator.svelte';
    let myScore;
    let scoreOfUsers;
    let scoreOfUsersArray = [];
    let roundValue;
    let hostId;
    let isHost = false;

    dbHost.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        hostId = snap.val();
        if(hostId === getParams('userId')) {
            isHost = true;
        }
    })
    dbGameSessionRoundValue.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        roundValue = snap.val();
    })
    let opacityOfContainer;
    let time = 0;
    setInterval(()=>time+=1,1000);
    $: {
        if(time === 0) {
            opacityOfContainer = 0.5;
        }
        else if(time) {
            opacityOfContainer = 1;
        }
    }
    // to set the score to 0 if not exists
    // listenFirebaseKey(dbScoreOfUsers,(dbScoreOfUsersRef)=>{
    //     dbScoreOfUsersRef.child(getParams('userId')).on('value',(snap)=>{
    //         if(!snap.exists) {
    //             dbScoreOfUsersRef.child(getParams('userId')).set(0);
    //         }
    //         if(!snap.val()) {
    //             dbScoreOfUsersRef.child(getParams('userId')).set(0);
    //         }
    //     })
    // })

    
    dbScoreOfUsers.on('value',(snap)=>{
        if(!snap.exists()) {
            myScore = 0;
            return;
        }
        scoreOfUsers = snap.val();
        myScore = scoreOfUsers[getParams('userId')]*10;
    })
    
    $: {
        if(scoreOfUsers) {
            scoreOfUsersArray = [];
            for(const id in scoreOfUsers) {
                scoreOfUsersArray.push([id,scoreOfUsers[id]]);
            }
            scoreOfUsersArray.sort( (a,b)=>{
               return  b[1] - a[1];
            })
            scoreOfUsersArray = scoreOfUsersArray;
            console.log('scoreOfUsersArray ',scoreOfUsersArray);
        }
    }
    let users;
    let leaderBoardLeader = 'Loading ...';
    dbUsers.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        users = snap.val();
    })
    
    $: {
        if(users && scoreOfUsersArray.length) {
            console.log('users ',users, ' socreofUsersArray ',scoreOfUsersArray)
            leaderBoardLeader = users[scoreOfUsersArray[0][0]]['userName'];
        }
    }
    $:{
        if(!myScore) {
            myScore = 0;
        }
    }
    function processName(name) {
        let fname = name?.split(" ")[0];
        if(fname?.length > 8)
        {
            fname = fname.slice(0,5) + "...";
        }
        return fname;
    }
    function validUserProfilePicture(str) {
        try {
            new URL(str);
            return true;
        }
        catch(err){
            return false;
        }
    }
    
    function handleNextRoundBtn() {
        dbGameSession.update({
            roundValue : roundValue + 1,
        })
    }
</script>
<main>
    {#if time === 0} 
        <RoundIndicator roundValue = {roundValue}/>
    {/if}
    <QuikWikSmallIcon/>
    <ScorecardIcon score = {myScore} />
    <div class = 'leaderBoard'>
        LEADERBOARD
    </div>
    <div class = 'leaderBoardLeader'>
        {processName(leaderBoardLeader)} is leading!
    </div>
    <div class = 'usersContainer' style = 'opacity : {opacityOfContainer}'>
        <div class="usersList">
            <div class="users">
                {#if users}
                    {#each scoreOfUsersArray as userWithScore}
                        <div class="user">
                            <div class="userDetails">
                                {#if validUserProfilePicture(users[userWithScore[0]].profilePicture)}
                                    <img class = "profilePicture" src = {users[userWithScore[0]].profilePicture} alt = "UserProfilePicture">
                                {:else}
                                    <div class="fakeProfilePicture"> {users[userWithScore[0]].userName[0].toUpperCase()} </div>
                                {/if}
                                <div class = "name">
                                    {processName(users[userWithScore[0]].userName)} 
                                </div>
                            </div>
                            <div class="score">
                                {#if scoreOfUsers[users[userWithScore[0]].id]*10}
                                    {scoreOfUsers[users[userWithScore[0]].id]*10}
                                {:else}
                                    -
                                {/if}
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
    {#if isHost === true}
        <CustomButton btnText = 'Next Round' disableBtn = {false} on:click = {handleNextRoundBtn}/>
    {:else}
        <div class = 'waitingForOtherAnswer'>
            Waiting for host to continue the game.
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
    main {
        width : 100%;
        height : 100%;
        background-color: #0C0030;
        text-align : center;
        padding : 1rem;
        position : relative;
        display : flex;
        flex-direction : column;
        align-items : center;
    }
    :global(html) {
        font-size : 20px;
        background-color: #0C0030;
    }
    @media screen and (max-width : 1000px) {
        :global(html) {
            font-size : 18px;
        }
        .usersContainer {
            width : 35%;
        }
    }
    @media screen and (max-width : 900px) {
        :global(html) {
            font-size : 16px;
        }
    }
    .leaderBoard {
        color : #fff;
        margin : 1rem;
        font-family : 'Manrope';
        font-weight : 900;
        font-size : 2rem;
        letter-spacing: 1.25px;
    }
    .leaderBoardLeader {
        color : #fff;
        margin : 1rem;
        font-family : 'Manrope';
        font-weight : 900;
        font-size : 0.9rem;
        letter-spacing: 1.25px;
    }
    .usersContainer{
        width : 25%;
        min-height : 100px;
        max-height : 30%;
        border-radius : 18px;
        background-color: #fff;
        margin : auto;
    }
    .waitingForOtherAnswer {
        color : #fff;
        font-family : 'Padauk';
        font-weight : 900;
        font-size : 0.9rem;
        letter-spacing: 0.5px;
        line-height: 1.5rem;
        margin : 1rem;
    }
    @media screen and (max-width : 1100px) {
        .usersContainer {
            width : 30%;
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
    .score {
        font-family:  'Manrope';
        font-weight : 700;
        font-size : 0.75rem;
        color: #0C0030;
        white-space : nowrap;

    }
</style>