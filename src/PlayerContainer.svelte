<script>
    import {listenFirebaseKey,dbAllQuestions,dbUsersWhoAnswered,dbUsers,dbUser} from './database';
    import {fly} from 'svelte/transition';

    let playerId = [];
    let usersWhoHaveNotAnsweredArray = [];
    let usersWhoHaveAnsweredArray = [];
    let usersWhoAnswered;
    let users;
    let user;
    let object;
    listenFirebaseKey(dbAllQuestions,(dbAllQuestionsRef)=>{
        dbAllQuestionsRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            object = snap.val();
        })
    })
    $: {
        if(object) {
            playerId = [];
            for(const id in object) {
                playerId.push(id);
            }
        }
    }
    listenFirebaseKey(dbUsersWhoAnswered,(dbUsersWhoAnsweredRef)=>{
        dbUsersWhoAnsweredRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            usersWhoAnswered = snap.val();
        })
    })
    dbUsers.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        users = snap.val();
    })
    
    function processName(name){
        let fname = name?.split(" ")[0];
        if(fname?.length > 10)
        {
            fname = fname.slice(0,8) + "...";
        }
        return fname;
    }
    $: {
        if(object) {
            usersWhoHaveNotAnsweredArray = [];
            usersWhoHaveAnsweredArray = [];
            playerId.forEach(id => {
                if(usersWhoAnswered && !usersWhoAnswered[id]) {
                    usersWhoHaveNotAnsweredArray.push(id);
                }
                else {
                    usersWhoHaveAnsweredArray.push(id);
                }
            });
        }
    }
</script>
<div class="container" in:fly ="{{ y: -20, duration: 1000 }}">
    <div class="heading">
        Players who have answered
    </div>
    <div class="playerContainer">
        {#if users}
            {#each playerId as id}
                <div class="player" class:disabledPlayer = {!usersWhoAnswered  || !usersWhoAnswered[id]}>
                    { processName(users[id]['userName']) }
                </div>
            {/each}
        {/if}
    </div>
</div>
<style>
    .container {
        width : 35%;
        position : relative;
        text-align : center;
        margin : 1rem;
    }
    .heading {
        margin-bottom : 1rem;
        color : #fff;
        font-family : 'Padauk';
        font-size : 1rem;
        font-weight : 700;
    }
    @media screen and (max-width : 1100px) {
        .container {
            width : 40%;
        }
    }
    @media screen and (max-width : 1000px) {
        .container {
            width : 50%;
        }
    }
    @media screen and (max-width : 900px) {
        .container {
            width : 55%;
        }
    }
    @media screen and (max-width : 850) {
        .container {
            width : 60%;
        }
    }
    .playerContainer {
        width : 100%;
        display : flex;
        flex-wrap : wrap;
        justify-content: center;
    }
    .player {
        background: #333333;
        font-family : 'Padauk';
        font-weight : 700;
        font-size : 0.85rem;
        border-radius : 5px;
        color : #fff;
        padding : 10px;
        margin : 5px;
    }
    .disabledPlayer {
        opacity : 0.5;
    }
</style>