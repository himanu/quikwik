<script>
    import QuikWikSmallIcon from './QuikWikSmallIcon.svelte';
    import RoundIndicatorAndTimer from './RoundIndicatorAndTimer.svelte';
    import ScorecardIcon from './ScorecardIcon.svelte';
    import {listenFirebaseKey,dbAllAnswers,dbQuestions,dbUsers,dbPage,dbScoreOfUsers,dbScoreOfUser,dbCurrentQuestionNumber,dbCurrentQuestionVoters,dbVoteTimer,dbGameSessionRoundValue,dbHost} from './database';
    import {getParams} from './utils';
    import CustomButton from './CustomButton.svelte';
    import RoundIndicator from './RoundIndicator.svelte';

    let allAnswers;
    let questionNumber;
    let questionIds = [];
    let allQuikWikQuestions;
    let currentQuestionId;
    let currentQuestion = 'Loading ...';
    let spectator = true;
    let voter = false;
    let users;
    let userId = getParams('userId');
    let totalNumberOfQuestion;
    let myScore;
    let votingTimerHasStarted = false;
    let leftTime = 5;
    let timer;
    let interval;
    let scoreOfUsers;
    let time; //For round animation
    let roundValue;
    let opacityOfContainer;

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
        else {
            isHost = false;
        }
    })
    listenFirebaseKey(dbVoteTimer,(dbVoteTimerRef)=>{
        dbVoteTimerRef.on('value',(snap)=>{
            if(!snap.exists()) {
                votingTimerHasStarted = false;
                console.log('TImer not exists ',snap.val());
                return;
            }
            votingTimerHasStarted = true;
            console.log('voting timer has started');
            timer = snap.val();
            interval = setInterval(()=>{
                leftTime = Math.floor((timer - Date.now())/1000);
                if(leftTime <= 0) {
                    console.log('Clear the interval');
                    leftTime = 0;
                    clearInterval(interval);
                    votingTimerHasStarted = false;
                }
                else if(leftTime > 5) {
                    leftTime = 5;
                }
            },100);
        })
    })
    dbScoreOfUser.on('value',(snap)=>{
        if(!snap.exists()) {
            myScore = 0;
            return;
        }
        myScore = snap.val();
    })
    dbScoreOfUsers.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        scoreOfUsers = snap.val();
    })
    let questionNumberHasChanged = false;
    listenFirebaseKey(dbCurrentQuestionNumber,(dbCurrentQuestionNumberRef)=>{
        dbCurrentQuestionNumberRef.on('value',(snap)=>{
            if(!snap.exists()) {
                currentQuestion = 0;
                dbCurrentQuestionNumberRef.set(0);
                questionNumberHasChanged = false;
                return;
            }
            questionNumber = snap.val();
            questionNumberHasChanged = true;
            console.log('I am getting called');
            time = 0;
            setTimeout(()=>{
                time = time + 1;
                console.log('time ',time);
            },1000);
        })
    })
    $: {
        if(time === 0) {
            opacityOfContainer = 0.5;
        }
        else if(time) {
            opacityOfContainer = 1;
        }
    }
    dbQuestions.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        allQuikWikQuestions = snap.val();
    })
    dbUsers.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        users = snap.val();
        console.log(users);
    })
    listenFirebaseKey(dbAllAnswers,(dbAllAnswersRef)=>{
        dbAllAnswersRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            allAnswers = snap.val();
        })
    })
    let currentQuestionVoters;
    listenFirebaseKey(dbCurrentQuestionVoters,(dbCurrentQuestionVotersRef)=>{
        dbCurrentQuestionVotersRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            currentQuestionVoters = snap.val();
            voter = (getParams('userId') in currentQuestionVoters);
            console.log("voter ",voter);
            if(voter === true)
            {
                spectator = false;
            }
        })
    })
    let currentQuestionUsers;
    let currentQuestionFirstUser,currentQuestionSecondUser;
    let firstAnswer,secondAnswer;
    $:{
        if(allAnswers) {
            questionIds = [];
            for(const id in allAnswers) {
                questionIds.push(id);
            }
            questionIds = questionIds;
            console.log('Question Id ',questionIds);
            totalNumberOfQuestion = questionIds.length;
            currentQuestionId = questionIds[questionNumber];
            currentQuestionUsers = allAnswers[currentQuestionId];
            let temp = 1;
            for(const id in currentQuestionUsers) {
                if(temp === 1) {
                    currentQuestionFirstUser = id;
                    firstAnswer = currentQuestionUsers[id]['ansText'];
                }
                else if(temp === 2) {
                    currentQuestionSecondUser = id;
                    secondAnswer = currentQuestionUsers[id]['ansText'];
                }
                temp += 1;
            }
            
            getVoters();
        }
    }

    $:{
        if(allQuikWikQuestions) {
            currentQuestion = allQuikWikQuestions[currentQuestionId];
        }
    }
    let message;
    $:{
        if(voter) {
            message = 'VOTE THE ANSWER';
        }
        else if(spectator) {
            message = 'PLAYERS ARE VOTING...'
        }
    }
    let firstAnswerVoters = [];
    let secondAnswerVoters = [];
    function getVoters() {
        listenFirebaseKey(dbAllAnswers,(dbAllAnswersRef)=>{
            console.log('current Question Id ',currentQuestionId, ' currentQuestionFirstUser ',currentQuestionFirstUser);
            dbAllAnswersRef.child(currentQuestionId).child(currentQuestionFirstUser).child('votedBy').on('value',(snap)=>{
                if(!snap.exists()) {
                    firstAnswerVoters = [];
                }
                firstAnswerVoters = snap.val();
            })
            dbAllAnswersRef.child(currentQuestionId).child(currentQuestionSecondUser).child('votedBy').on('value',(snap)=>{
                if(!snap.exists()) {
                    secondAnswerVoters = [];
                }
                secondAnswerVoters = snap.val();
            })
        })
    }
    $: {
        if(!firstAnswerVoters) {
            firstAnswerVoters = [];
        }
        if(!secondAnswerVoters) {
            secondAnswerVoters = [];
        }
    }
    $: {
        console.log('First Answer Voters ',firstAnswerVoters);
        console.log('second Answer Voters ',secondAnswerVoters)
    }
    function voteFirstAnswer() {
        if(spectator) {
            return;
        }
        let currUserId = getParams('userId');
        listenFirebaseKey(dbCurrentQuestionVoters,(dbCurrentQuestionVotersRef)=>{
            dbCurrentQuestionVotersRef.update({
                [currUserId] : true
            })
        })
        listenFirebaseKey(dbAllAnswers,(dbAllAnswersRef)=>{
            getVoters();
            if(secondAnswerVoters){
                secondAnswerVoters = secondAnswerVoters.filter( voterId => voterId !== userId);
            }
            else {
                secondAnswerVoters = [];
            }
            if(firstAnswerVoters){
                firstAnswerVoters = firstAnswerVoters.filter( voterId => voterId !== userId);
            }
            else {
                firstAnswerVoters = []
            }
            firstAnswerVoters.push(userId);
            dbAllAnswersRef.child(currentQuestionId).child(currentQuestionFirstUser).child('votedBy').set(firstAnswerVoters);
            dbAllAnswersRef.child(currentQuestionId).child(currentQuestionSecondUser).child('votedBy').set(secondAnswerVoters);
        })
    }
    function voteSecondAnswer() {
        if(spectator) {
            return true;
        }
        let currUserId = getParams('userId');
        listenFirebaseKey(dbCurrentQuestionVoters,(dbCurrentQuestionVotersRef)=>{
            dbCurrentQuestionVotersRef.update({
                [currUserId] : true
            })
        })
        listenFirebaseKey(dbAllAnswers,(dbAllAnswersRef)=>{
            getVoters();
            if(secondAnswerVoters){
                secondAnswerVoters = secondAnswerVoters.filter( voterId => voterId !== userId);
            }
            else {
                secondAnswerVoters = [];
            }
            if(firstAnswerVoters){
                firstAnswerVoters = firstAnswerVoters.filter( voterId => voterId !== userId);
            }
            else {
                firstAnswerVoters = [];
            }
            secondAnswerVoters.push(userId);
            dbAllAnswersRef.child(currentQuestionId).child(currentQuestionFirstUser).child('votedBy').set(firstAnswerVoters);
            dbAllAnswersRef.child(currentQuestionId).child(currentQuestionSecondUser).child('votedBy').set(secondAnswerVoters);
        })
    }
    function processName(name) {
        let fname = name?.split(" ")[0];
        if(fname?.length > 8)
        {
            fname = fname.slice(0,5) + "...";
        }
        return fname;
    }
    $: {
        if(!firstAnswer) {
            firstAnswer = '...'
        }
        if(!secondAnswer) {
            secondAnswer = '...'
        }
    }
    
    let btnText;
    let isThisLastQuestion
    $:{
        if(questionNumber < (totalNumberOfQuestion - 1)) {
            btnText = 'Next Question';
            isThisLastQuestion = false;
        }
        else if(questionNumber === (totalNumberOfQuestion - 1)) {
            btnText = 'LeaderBoard';
            isThisLastQuestion = true;
        }
    }
    $: {
        if(voter === false) {
            spectator = true;
        }
    }
    function incrementFirstUserScore() {
        // return new Promise((resolve,reject)=>{
                let firstUserScore = scoreOfUsers[currentQuestionFirstUser];
                firstUserScore +=  1;
                dbScoreOfUsers.child(currentQuestionFirstUser).set(firstUserScore);
        //         resolve();
        // })
    }
    function incrementSecondUserScore() {
        // return new Promise((resolve,reject)=>{
            let secondUserScore  = scoreOfUsers[currentQuestionSecondUser];
            secondUserScore += 1;
            dbScoreOfUsers.child(currentQuestionSecondUser).set(secondUserScore);
            // resolve();
        // })
    }

    function updateScore() {
        console.log('I am called');
        
        listenFirebaseKey(dbAllAnswers,(dbAllAnswersRef)=>{
            let firstUserVotedByRef = dbAllAnswersRef.child(currentQuestionId).child(currentQuestionFirstUser).child('votedBy');
            let secondUserVotedByRef = dbAllAnswersRef.child(currentQuestionId).child(currentQuestionSecondUser).child('votedBy');
            let firstUserVotes = 0,secondUserVotes = 0;
            firstUserVotedByRef.on('value',(snap)=>{
                if(!snap.exists()) {
                    firstUserVotes = 0;
                    return;
                }
                firstUserVotes = snap.val().length;
            })
            secondUserVotedByRef.on('value',(snap)=>{
                if(!snap.exists()) {
                    secondUserVotes = 0;
                    return;
                }
                secondUserVotes = snap.val().length;
                
            })
            console.log('firstUserVotes ',firstUserVotes);
            console.log('secondUserVotes ',secondUserVotes);
            if(firstUserVotes > secondUserVotes) {
                incrementFirstUserScore();
                // .then(()=>{
                    nextQuestion();
                // })
            }
            else if(firstUserVotes < secondUserVotes) {
                incrementSecondUserScore();
                // .then(()=>{
                    nextQuestion();
                // })
            }
            else {
                nextQuestion();
            }
        })
    }
    function nextQuestion() {
        console.log('Next question should come');
        if(questionNumber < (totalNumberOfQuestion - 1)) {
            listenFirebaseKey(dbCurrentQuestionNumber,(dbCurrentQuestionNumberRef)=>{
                dbCurrentQuestionNumberRef.set(questionNumber + 1);
            })
        }
        else {
            listenFirebaseKey(dbPage,(dbPageRef)=>{
                dbPageRef.set('Leaderboard Screen');
            })
        }
    }
    function handleNextQuestion() {
        if(isHost !== true) {
            return ;
        }
        updateScore();
    }
    $: {
        if(!myScore) {
            myScore = 0;
        }
    }
    
    dbGameSessionRoundValue.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        roundValue = snap.val();
    })
</script>
<main>
    {#if time === 0} 
        <RoundIndicator roundValue = {roundValue}/>
    {/if}
    <QuikWikSmallIcon/>
    <ScorecardIcon/>
    <RoundIndicatorAndTimer message = {message} timerType = {'votingScreenTimer'} isThisLastQuestion = {isThisLastQuestion}/>
    <div class="container" style = 'opacity : {opacityOfContainer}'>
        <div class="question">
            {currentQuestion}
        </div>
        <div class = 'answers'>

            <div class:firstAnswerContainer = {voter} class:disabledFirstAnswerContainer = {spectator} on:click = {voteFirstAnswer}>
                <svg class = 'upperSvg' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 15L0 0H15V15Z" fill="#6C44A8"/>
                </svg>     
                <div class="voters">
                    {#each firstAnswerVoters as firstAnswerVoter}
                        <div class="voter">
                            {#if users}
                                <div class="profilePicture"> <img src = { users[firstAnswerVoter]['profilePicture'] } alt = 'profilePicture'></div>
                                <div class="name"> {processName(users[firstAnswerVoter]['userName'])} </div>
                            {/if}
                        </div>
                    {/each}
                </div>
                <div class="firstAnswer"> {firstAnswer} </div>
            </div>
            
            <div class:secondAnswerContainer = {voter} class:disabledSecondAnswerContainer = {spectator} on:click = {voteSecondAnswer}>
                <svg class = 'downSvg' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0L15 15H0V0Z" fill="#A84480"/>
                </svg>   
                <div class="voters">
                    {#each secondAnswerVoters as secondAnswerVoter}
                        <div class="voter">
                            {#if users}
                                <div class="profilePicture"> <img src = { users[secondAnswerVoter]['profilePicture'] } alt = 'profilePicture'></div>
                                <div class="name"> {processName(users[secondAnswerVoter]['userName'])} </div>
                            {/if}
                        </div>
                    {/each}
                </div>
                <div class="secondAnswer"> {secondAnswer} </div>
            </div>
        </div>
    </div>
    <div class="buttonContainer">
        {#if isHost === true}
            <CustomButton disableBtn = {false} btnText = {btnText} on:click = {handleNextQuestion}/>
        {/if}
        {#if voter}
            <CustomButton disableBtn = {false} btnText = {"Vote"} on:click = {handleNextQuestion}/>
        {/if}
    </div>
    
</main>
<style>
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
    }
    @media screen and (max-width : 900px) {
        :global(html) {
            font-size : 16px;
        }
    }
    
    .container {
        width : 35%;
        margin : auto;
    }
    .question {
        color : #fff;
        font-family : 'Manrope';
        font-weight : 900;
        font-size : 0.9rem;
        letter-spacing: 1.25px;
        line-height: 1.25rem;
        max-width : 75%;
        margin : auto;
    }
    .disabledFirstAnswerContainer,.disabledSecondAnswerContainer {
        cursor : text;
        opacity : 0.5;
        padding : 1rem;
        position : relative;
        margin: 1rem;
    }
    .firstAnswerContainer,.secondAnswerContainer {
        padding : 1rem;
        position : relative;
        margin: 1rem;
        cursor : pointer;
    }
    .firstAnswerContainer,.disabledFirstAnswerContainer {
        margin-bottom : 1.5rem;
    }
    .firstAnswerContainer, .disabledFirstAnswerContainer {
        background-color: #6C44A8;
        box-shadow: -3px 4px 0px #9A72D6;
    }
    .secondAnswerContainer, .disabledSecondAnswerContainer {
        background-color: #A84480;
        box-shadow: 3px 4px 0px #F980C9;
    }
    .firstAnswerContainer:hover,.secondAnswerContainer:hover {
        transform: scale(1.05);
    }
    .firstAnswer {
        color : #fff;
        font-family : 'Manrope';
        font-weight : 900;
        font-size : 0.9rem;
        letter-spacing: 1.25px;
        line-height: 1.25rem;
        word-break: break-all;
    }
    .secondAnswer {
        color : #fff;
        font-family : 'Manrope';
        font-weight : 900;
        font-size : 0.9rem;
        letter-spacing: 1.25px;
        line-height: 1.25rem;
        word-break : break-all;
    }
    .upperSvg {
        position : absolute;
        top : 100%;
        left : 1rem;
    }
    .downSvg {
        position : absolute;
        bottom : 100%;
        right : 1rem;
    }
    .voters {
        display : flex;
        width : 75%;
        margin : auto;
        justify-content: center;
    }
    .voter {
        display : flex;
        flex-direction: column;
        align-items : center;
        padding : 0.25rem;
    }
    .profilePicture > img {
        height : 1rem;
        width : 1rem;
        border-radius : 50%;
    }

    .name {
        color : #fff;
        font-family : 'Padauk';
        font-weight : 700;
        font-size : 0.5rem; 
    }
    .buttonContainer {
        display : flex;
    }
</style>