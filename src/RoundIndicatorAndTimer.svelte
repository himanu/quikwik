<script>
    import {fly} from 'svelte/transition';
    import {dbGameSessionRoundValue,listenFirebaseKey,dbTimer,dbVoteTimer,dbCurrentQuestionNumber,dbAllAnswers} from './database';
    export let message;
    export let timerType;
    export let isThisLastQuestion;
    export let noOfVotersRemaining;
    // export let round;
    let roundValue;
    let timer;
    let interval;
    let leftTime;
    let maxTimeValue;
    let dbCurrentTimer;
    let nextQuestionIndicatorMsg;
    if(timerType === 'GameScreenTimer') {
        maxTimeValue = 60;
        dbCurrentTimer = dbTimer;
    }
    else {
        maxTimeValue = 30;
        dbCurrentTimer = dbVoteTimer;
    }
    
    dbGameSessionRoundValue.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        roundValue = snap.val();
    })
    let timerExists = false;
    let leftTimeString;
    let strokeDashOffset
    let leftTimeReal;
    listenFirebaseKey(dbCurrentTimer,(dbTimerRef)=>{
        dbTimerRef.on('value',(snap)=>{
            if(!snap.exists()) {
                timerExists = false;
                return;
            }
            timerExists = true;
            timer = snap.val();
            leftTimeReal = ((timer - Date.now())/1000);
            leftTime = Math.floor(leftTimeReal);
            if(leftTime > maxTimeValue) {
                leftTime = maxTimeValue;
            }
            
            leftTimeString = leftTime.toString() + 's';
            strokeDashOffset = '0px';
            interval = setInterval(()=>{
                leftTimeReal = ((timer - Date.now())/1000);
                strokeDashOffset = ((113*(maxTimeValue - leftTimeReal))/maxTimeValue).toString() + 'px';
                leftTime = Math.floor(leftTimeReal);
                leftTimeString = leftTime.toString() + 's';
                if(leftTime <= 0) {
                    console.log('Clear the interval');
                    leftTime = 0;
                    clearInterval(interval);
                }
                else if(leftTime > maxTimeValue) {
                    leftTime = maxTimeValue;
                }
            },100);
        })
    })
    $:{
        if(isThisLastQuestion) {
            nextQuestionIndicatorMsg = 'LEADERBOARD IN';
        }
        else {
            nextQuestionIndicatorMsg = 'NEXT QUESTION IN'
        }
    }
   
</script>

{#key message}
    <div class = 'roundIndicatorAndTimer' style = '--strokeDashOffset : {strokeDashOffset}' in:fly ="{{ y: -20, duration: 1000 }}">
        {#if timerExists}
            <div class = 'timer'>
                <div id="countdown-number">{ leftTime }</div>
                <svg  style = '--leftTimeString : {leftTimeString}'>
                    <circle class = 'timerCircle' r="18" cx="20" cy="20"></circle>
                </svg>
            </div>
            {#if timerType === 'votingScreenTimer'}
                <div class = "round">
                    ROUND {roundValue} | {nextQuestionIndicatorMsg} {leftTime}
                </div>
            {:else if timerType === 'GameScreenTimer'}
                <div class="round">
                    ROUND {roundValue} | {message}
                </div>
            {/if}
        {:else if noOfVotersRemaining}
            <div class="round">
                ROUND {roundValue} | {message}
            </div>
        {/if}

    </div>
{/key}

<style>
    :global(html) {
        font-size : 20px;
        background-color: #0C0030;
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
    .roundIndicatorAndTimer {
        position : relative;
        display : flex;
        flex-direction: column;
        align-items : center;
        margin : 1rem;
    }
    .round{
        font-family : 'Padauk';
        font-weight : 700;
        font-size : 0.75rem;
        color : #B49BFF;
        margin-top : 1rem;
        letter-spacing: 1px;
    }
    .timer {
        position : relative;
        height: 40px;
        width: 40px;
        display : flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    #countdown-number {
        color: white;
        display: inline-block;
        line-height: 40px;
        font-family : 'Padauk';
        font-weight : 700;
        font-size : 0.75rem;
    }
    
    svg {
        position: absolute;
        top: 0;
        right: 0;
        width: 40px;
        height: 40px;
        transform: rotateY(-180deg) rotateZ(-90deg);
    }
    .timerCircle {
        stroke-dasharray: 113px;
        stroke-dashoffset : var(--strokeDashOffset);
        stroke-linecap: round;
        stroke-width: 3px;
        stroke: #3FAB8B;
        fill: none;
    }

</style>