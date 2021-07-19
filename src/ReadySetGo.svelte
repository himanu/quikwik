<script>
    import { fly } from "svelte/transition";
    import QuikWikSmallIcon from './QuikWikSmallIcon.svelte';
    import RoundIndicator from './RoundIndicator.svelte';
    import {dbGameSessionRoundValue,dbGameSessionRound,dbUsers, listenFirebaseKey, dbTimer,dbScoreOfUser,dbHost} from './database';
    import {getParams} from './utils';
    import ScorecardIcon from "./ScorecardIcon.svelte";

    let roundValue = 1;
    let users;
    let timer;
    let leftTime = 65;
    let scoreOfUser;
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
    dbScoreOfUser.on('value',(snap)=>{
        if(!snap.exists()) {
            scoreOfUser = 0;
            return;
        }
        scoreOfUser = snap.val()*10;
    })
    dbGameSessionRoundValue.on('value',(snap)=>{
        if(!snap.exists()) {
            roundValue = 1;
            return;
        }
        roundValue = snap.val();
    })
    dbUsers.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        users = snap.val();
    })
    
    let interval;
    listenFirebaseKey(dbTimer,(dbTimerRef)=>{
        dbTimerRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            timer = snap.val();
            leftTime = Math.floor((timer - Date.now())/1000);
            interval = setInterval(()=>{
                leftTime = Math.floor((timer - Date.now())/1000);
                if(leftTime <= 61) {
                    listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
                        dbGameSessionRoundRef.update({
                            page : 'Game Screen'
                        })
                })
                clearInterval(interval);
            }
            },100);
        })
    })
    $: {
        if(leftTime > 65) {
            leftTime = 65;
        }
    }
</script>
<main>
    <QuikWikSmallIcon/>
    <ScorecardIcon/>
    <div class = 'gameStates'>
        {#if leftTime === 65}
            <div class = 'gameState' transition:fly="{{ y: -100, duration: 1000 } }">Ready</div>
        {:else if leftTime === 64}
            <div class = 'gameState' transition:fly="{{ y: -100, duration: 1000 } }">Set</div>
        {:else if leftTime === 63}
            <div class = 'gameState' transition:fly="{{ y: -100, duration: 1000 } }">Go! </div>
        {:else if leftTime === 62}
            <RoundIndicator roundValue = {roundValue}/>
        {/if}
    </div>
</main>
<style>
    :global(html) {
        font-size : 20px;
    }
    @media screen and (max-width : 1000px) {
        :global(html) {
            font-size : 18px;
        }
    }
    @media screen and (max-width : 900px) {
        :global(html) {
            font-size : 16px;
        }
    }
    main {
        background : #0C0030;
        width : 100%;
        height : 100%;
        text-align : center;
        padding : 1rem;
    }
    .gameStates{
        color : #fff;
        font-family : 'Padauk';
        font-weight : 700;
        font-size : 3rem;
    }
    .gameState {
        position : absolute; 
        top : 50%; 
        left : 50%;
        transform : translate(-50%,-50%) 
    }
</style>