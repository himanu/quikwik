<script>
    import CustomButton from './CustomButton.svelte';
    import QuikWikSmallIcon from './QuikWikSmallIcon.svelte';
    import ScorecardIcon from './ScorecardIcon.svelte';
    import {dbUsers, dbQuestions, dbAllQuestions, dbUser, dbAllAnswers, listenFirebaseKey, dbUsersWhoAnswered,dbScoreOfUser,dbHost} from './database';
    import {getParams} from './utils'; 
    import RoundIndicatorAndTimer from './RoundIndicatorAndTimer.svelte';
    import PlayerContainer from './PlayerContainer.svelte';
    import {fly} from 'svelte/transition';

    let ans1,ans2;
    let users;
    let allQuikWikQuestions;
    let allQuestions;
    let firstQuestionId,secondQuestionId;
    let firstQuestion, secondQuestion;
    let user;
    let userId = getParams('userId');
    let isThisUserHaveAnswered = false;
    let usersWhoAnswered = {};
    let scoreOfUser = 0;

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
    dbQuestions.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        allQuikWikQuestions = snap.val();
        
        firstQuestion = allQuikWikQuestions[firstQuestionId];
        secondQuestion = allQuikWikQuestions[secondQuestionId];
        console.log('firstQuestion ',firstQuestion);
        console.log('secondQuestion ',secondQuestion);
    })
    $: {
        if(allQuikWikQuestions ) {
            if(firstQuestionId){
                firstQuestion = allQuikWikQuestions[firstQuestionId];
                console.log('firstQuestion ',firstQuestion);
            }
            if(secondQuestionId) {
                secondQuestion = allQuikWikQuestions[secondQuestionId];
                console.log('secondQuestion ',secondQuestion);
            }
        }
    
    }
    dbUser.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        user = snap.val();
    })
   let isVisitor = false; 
    listenFirebaseKey(dbAllQuestions,(dbAllQuestionsRef)=>{
        dbAllQuestionsRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            allQuestions = snap.val();
            if(!(userId in allQuestions)) {
                isVisitor = true;
            }
            if(allQuestions[userId]){
                firstQuestionId = allQuestions[userId][0];
                secondQuestionId = allQuestions[userId][1];
            }
        })
    })
    $: {
        if(firstQuestionId) {
            listenFirebaseKey(dbAllAnswers,(dbAllAnswersRef)=>{
                let ansTextRef = dbAllAnswersRef.child(firstQuestionId).child(userId).child('ansText');
                ansTextRef.on('value',(snap)=>{
                    if(!snap.exists()) {
                        ansTextRef.set('...');
                    }
                    else return;
                })
            })
        }
        if(secondQuestionId) {
            listenFirebaseKey(dbAllAnswers,(dbAllAnswersRef)=>{
                let ansTextRef = dbAllAnswersRef.child(secondQuestionId).child(userId).child('ansText');
                ansTextRef.on('value',(snap)=>{
                    if(!snap.exists()) {
                        ansTextRef.set('...');
                    }
                    else return;
                })
            })
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
    $: {
        isThisUserHaveAnswered = usersWhoAnswered[userId];
    }
    dbUsers.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        users = snap.val();
    })

    function updateAllAnswers() {
        listenFirebaseKey(dbAllAnswers,(dbAllAnswersRef)=>{
            dbAllAnswersRef.child(firstQuestionId).child(userId).child('ansText').set(ans1);
            dbAllAnswersRef.child(secondQuestionId).child(userId).child('ansText').set(ans2);
        })
    }
    function handleAnswerBtn() {
        isThisUserHaveAnswered = true;
        listenFirebaseKey(dbUsersWhoAnswered,(dbUsersWhoAnsweredRef)=>{
            dbUsersWhoAnsweredRef.child(userId).set(true);
        })
        updateAllAnswers();
    }
    function updateAnswer1(e) {
        listenFirebaseKey(dbAllAnswers,(dbAllAnswersRef)=>{
            dbAllAnswersRef.child(firstQuestionId).child(userId).child('ansText').set(e.target.value);
        })
    }
    function dbounce1(executor,wait) {
        let timeout;
        return (...args)=>{
            if(timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(()=>executor(...args),wait);
        }
    }
    function updateAnswer2(e) {
        listenFirebaseKey(dbAllAnswers,(dbAllAnswersRef)=>{
            dbAllAnswersRef.child(secondQuestionId).child(userId).child('ansText').set(e.target.value);
        })
    }
    function dbounce2(executor,wait) {
        let timeout;
        return (...args)=>{
            if(timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(()=>executor(...args),wait);
        }
    }
    
    var dbounceReturnFun1 = dbounce1((e)=>updateAnswer1(e),500);
    var dbounceReturnFun2 = dbounce2((e)=>updateAnswer2(e),500);
</script>
<main>
    <QuikWikSmallIcon/>
    <ScorecardIcon/>
    <RoundIndicatorAndTimer message = {'ANSWER NOW'} timerType = {'GameScreenTimer'} />

    {#if !isThisUserHaveAnswered && !isVisitor}
        <div class = 'formBox' in:fly ="{{ y: -20, duration: 1000 }}">
            <form class = 'form'>
                <label for = 'input1'>
                    {#if !firstQuestion}
                        'Question1...'
                    {:else}
                        {firstQuestion}
                    {/if}
                </label>
                <input placeholder = 'Write your witty answer ...' id = 'input1' on:keyup = {dbounceReturnFun1} bind:value = {ans1} autocomplete = "off">
                <label for = 'input2'>
                    {#if !secondQuestion}
                        'Question.2..'
                    {:else}
                        {secondQuestion}
                    {/if}
                </label>
                <input placeholder = 'Write your witty answer ...' id = 'input2' on:keyup = {dbounceReturnFun2} bind:value = {ans2} autocomplete = "off">
            </form>
        </div>
        <div class="btnDiv" in:fly ="{{ y: -20, duration: 1000 }}">
            {#if ans1 && ans2}
                <CustomButton on:click = {handleAnswerBtn} btnText = {`Answer`} disableBtn = {false}/>
            {:else}
                <CustomButton on:click = {handleAnswerBtn} btnText = {`Answer`} disableBtn = {true}/>
            {/if}
        </div>
        
    {:else}
        <div class = 'waitingForOtherAnswer' in:fly ="{{ y: -20, duration: 1000 }}">
            {#if !isVisitor}
                Players are submitting their answers. <br/>
                Get ready to vote!
            {:else}
                You are spectator.<br/>Players are submitting their answers. <br/>
                Get ready to vote!
            {/if}
        </div>
        <PlayerContainer/>
    {/if}
</main>
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
    .formBox {
        width : 35%;
        position : relative;
        margin : auto;
    }
    @media screen and (max-width : 1100px) {
        .formBox {
            width : 40%;
        }
    }
    @media screen and (max-width : 1000px) {
        .formBox {
            width : 50%;
        }
    }
    @media screen and (max-width : 900px) {
        .formBox {
            width : 55%;
        }
    }
    @media screen and (max-width : 850) {
        .formBox {
            width : 60%;
        }
    }
    
    .form {
        width : 100%;
        text-align : center;
        display : flex;
        flex-direction : column;
        align-items : center;
    }
    label {
        max-width : 70%;
        color : #fff;
        font-family : 'Manrope';
        font-weight : 900;
        font-size : 0.9rem;
        letter-spacing: 1.25px;
        line-height: 1.25rem;
    }
    #input1,#input2 {
        display : block;
        margin : 20px 0px;
        width : 100%;
        padding : 10px;
        font-family : 'Padauk';
        font-weight : 400;
        font-size : 1rem;
        border-radius : 0.5rem;
    }
    .waitingForOtherAnswer {
        color : #fff;
        font-family : 'Manrope';
        font-weight : 900;
        font-size : 0.9rem;
        letter-spacing: 1.25px;
        line-height: 1.5rem;
        margin : auto;
    }
</style>