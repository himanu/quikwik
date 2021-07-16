<script>
    import QuikWikSmallIcon from './QuikWikSmallIcon.svelte';
    import RoundIndicatorAndTimer from './RoundIndicatorAndTimer.svelte';
    import ScorecardIcon from './ScorecardIcon.svelte';
    import {listenFirebaseKey,dbAllAnswers,dbQuestions,dbUsers,dbPage,dbScoreOfUsers,dbScoreOfUser,dbCurrentQuestionNumber,dbCurrentQuestionVoters,dbVoteTimer,dbGameSessionRoundValue,dbHost,dbNoOfVotersRemaining} from './database';
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
    let scoreOfUsers;
    let time; //For round animation
    let roundValue;
    let opacityOfContainer;
    let isThisVoted = false;
    let noOfVotersRemaining;

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
    listenFirebaseKey(dbNoOfVotersRemaining,(dbNoOfVotersRemainingRef)=>{
        dbNoOfVotersRemainingRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            noOfVotersRemaining = snap.val();
        })
    })
    // listenFirebaseKey(dbVoteTimer,(dbVoteTimerRef)=>{
    //     dbVoteTimerRef.on('value',(snap)=>{
    //         if(!snap.exists()) {
    //             votingTimerHasStarted = false;
    //             console.log('TImer not exists ',snap.val());
    //             return;
    //         }
    //         votingTimerHasStarted = true;
    //         console.log('voting timer has started');
    //         timer = snap.val();
    //         interval = setInterval(()=>{
    //             leftTime = Math.floor((timer - Date.now())/1000);
    //             if(leftTime <= 0) {
    //                 console.log('Clear the interval');
    //                 leftTime = 0;
    //                 clearInterval(interval);
    //                 votingTimerHasStarted = false;
    //             }
    //             else if(leftTime > 5) {
    //                 leftTime = 5;
    //             }
    //         },100);
    //     })
    // })
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
            secondAnswerVoted = false;
            firstAnswerVoted = false;
            firstAnswerContainerBackground = "#fff";
            firstAnswerTextColor = "#343E98";
            secondAnswerContainerBackground = "#fff";
            secondAnswerTextColor = "#343E98";
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
            console.log('All answers ',allAnswers);
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
                isThisVoted = currentQuestionVoters[userId];
                spectator = false;
            }
        })
    })
    let currentQuestionUsers;
    let currentQuestionFirstUser,currentQuestionSecondUser,currentQuestionFirstUserName,currentQuestionSecondUserName;
    let firstAnswer,secondAnswer;
    let firstAnswerVoters = [];
    let secondAnswerVoters = [];
    let leadingMsg;
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
            firstAnswerVoters = currentQuestionUsers[currentQuestionFirstUser]['votedBy'];
            secondAnswerVoters = currentQuestionUsers[currentQuestionSecondUser]['votedBy'];
            if(firstAnswerVoters)
            firstUserVotes = firstAnswerVoters.length;
            if(secondAnswerVoters)
            secondUserVotes = secondAnswerVoters.length;
            currentQuestionFirstUserName = processName( users[currentQuestionFirstUser]);
            currentQuestionSecondUserName = processName( users[currentQuestionSecondUser]);
            if(firstUserVotes > secondUserVotes) {
                leadingMsg = `${currentQuestionFirstUserName} is leading`;
            }
            else if(firstUserVotes < secondUserVotes) {
                leadingMsg = `${currentQuestionSecondUserName} is leading`;
            }
            else if(firstUserVotes === secondUserVotes){
                leadingMsg = `Both answer gets the equal vote`;
            }
            console.log('leadingMsg ',leadingMsg);
            console.log('firstAnswerVoters ',firstAnswerVoters);
            console.log('secondAnswerVoters ',secondAnswerVoters);
        }
    }
    $: {
        if(users && currentQuestionFirstUser && currentQuestionSecondUser) {
            currentQuestionFirstUserName = processName( users[currentQuestionFirstUser]);
            currentQuestionSecondUserName = processName( users[currentQuestionSecondUser]);
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
            if(!isThisVoted)
                message = 'VOTE ONE OF THE ANSWER';
            else {
                message = 'WAITING FOR OTHER VOTERS TO VOTE'
            }
        }
        else if(spectator) {
            message = 'WAITING FOR VOTERS TO VOTE';
        }
    }
    let firstUserVotes = 0,secondUserVotes = 0;
    $: {
        if(!firstAnswerVoters) {
            firstAnswerVoters = [];
        }
        else {
            if(isThisVoted) {
                if(firstAnswerVoters.includes(userId)) {
                    firstAnswerContainerBackground = "#6C44A8";
                    firstAnswerTextColor = "#fff";
                    secondAnswerContainerBackground = "#fff";
                    secondAnswerTextColor = "#343E98";
                }
            }
            firstUserVotes = firstAnswerVoters.length;
        }
        if(!secondAnswerVoters) {
            secondAnswerVoters = [];
        }
        else {
            if(isThisVoted) {
                if(secondAnswerVoters.includes(userId)) {
                    firstAnswerContainerBackground = "#fff";
                    firstAnswerTextColor = "#343E98";
                    secondAnswerContainerBackground = "#A84480";
                    secondAnswerTextColor = "#fff";
                }
            }
            secondUserVotes = secondAnswerVoters.length;
        }
    }
    $: {
        console.log('First Answer Voters ',firstAnswerVoters);
        console.log('second Answer Voters ',secondAnswerVoters)
    }
    let firstAnswerVoted = false,secondAnswerVoted = false;
    let firstAnswerTextColor = "#343E98", secondAnswerTextColor = "#343E98";
    let secondAnswerContainerBackground = "#fff",firstAnswerContainerBackground = "#fff";
    function voteFirstAnswer() {
        if(spectator || isThisVoted) {
            return;
        }
        firstAnswerVoted = true;
        secondAnswerVoted = false;
        firstAnswerContainerBackground = "#6C44A8";
        firstAnswerTextColor = "#fff";
        secondAnswerTextColor = "#343E98";
        secondAnswerContainerBackground = "#fff";
    }
    function voteSecondAnswer() {
        if(spectator || isThisVoted) {
            return true;
        }
        secondAnswerVoted = true;
        firstAnswerVoted = false;
        firstAnswerContainerBackground = "#fff";
        firstAnswerTextColor = "#343E98";
        secondAnswerContainerBackground = "#A84480";
        secondAnswerTextColor = "#fff";
    }
    function registerVote() {
        if(!firstAnswerVoted && !secondAnswerVoted) {
            return ;
        }
        if(noOfVotersRemaining === 1) {
            noOfVotersRemaining = 0;
        }
        listenFirebaseKey(dbCurrentQuestionVoters,(dbCurrentQuestionVotersRef)=>{
            dbCurrentQuestionVotersRef.child(userId).set(true);
        })
        if( firstAnswerVoted ){
            firstAnswerVoters.push(userId);
            console.log('First Answer voters in register vote ',firstAnswerVoters);
            listenFirebaseKey(dbAllAnswers,(dbAllAnswersRef)=>{
                dbAllAnswersRef.child(currentQuestionId).child(currentQuestionFirstUser).child('votedBy').set(firstAnswerVoters);
            })
        }
        else if(secondAnswerVoted) {
            secondAnswerVoters.push(userId);
            console.log('second Answer voters in register vote ',secondAnswerVoters);
            listenFirebaseKey(dbAllAnswers,(dbAllAnswersRef)=>{
                dbAllAnswersRef.child(currentQuestionId).child(currentQuestionSecondUser).child('votedBy').set(secondAnswerVoters);
            })
        }
    }
    function processName(user) {
        let name = user['userName'];
        let fname = name?.split(" ")[0];
        if(fname?.length > 8)
        {
            fname = fname.slice(0,5) + "...";
        }
        if(user.id === userId) {
            fname += " (You)";
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
        console.log('increment first user score');
        return new Promise((resolve,reject)=>{
                let firstUserScore = scoreOfUsers[currentQuestionFirstUser];
                firstUserScore +=  1;
                dbScoreOfUsers.child(currentQuestionFirstUser).set(firstUserScore)
                .then(()=>{
                    console.log('First user score is incremented');
                    resolve()
                })
                .catch(()=>{
                    console.log('Some error occur in incrementing first user score');
                    resolve();
                });
        })
    }
    function incrementSecondUserScore() {
        console.log('increment second user score');
        return new Promise((resolve,reject)=>{
            let secondUserScore  = scoreOfUsers[currentQuestionSecondUser];
            secondUserScore += 1;
            dbScoreOfUsers.child(currentQuestionSecondUser).set(secondUserScore)
            .then(()=>{
                console.log('Second user score is increased')
                resolve();
            })
            .catch(()=>{
                console.log('Some error occur in incrementing second user score');
                resolve(); 
            })
            
        })
    }

    function updateScore() {
        console.log('I am called');
        firstUserVotes = firstAnswerVoters.length;
        secondUserVotes = secondAnswerVoters.length;
        console.log('firstUserVotes ',firstUserVotes);
        console.log('secondUserVotes ',secondUserVotes);
        if(firstUserVotes > secondUserVotes) {
            incrementFirstUserScore()
            .then(()=>{
                nextQuestion();
            })
        }
        else if(firstUserVotes < secondUserVotes) {
            incrementSecondUserScore()
            .then(()=>{
                nextQuestion();
            })
        }
        else {
            nextQuestion();
        }
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
        listenFirebaseKey(dbVoteTimer,(dbVoteTimerRef)=>{
            dbVoteTimerRef.set(Date.now() + 11000).then(()=>{
                votingTimerHasStarted = true;
            });
            setTimeout(()=>{
                votingTimerHasStarted = false;
                updateScore();
                dbVoteTimerRef.remove();
            },11000);
        })
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
    <ScorecardIcon score = {myScore*10} />
        <RoundIndicatorAndTimer message = {message} timerType = {'votingScreenTimer'} isThisLastQuestion = {isThisLastQuestion}/>
        {#if votingTimerHasStarted || noOfVotersRemaining === 0}
            <div class="leaderMsg">
                {leadingMsg}
            </div>
        {/if}
        <div class="container" style = 'opacity : {opacityOfContainer}'>
            <div class="question">
                {currentQuestion}
            </div>
            <div class = 'answers'>
                <div class:firstAnswerContainer = {voter && !isThisVoted} style="--backgroundColor: {firstAnswerContainerBackground}" class:disabledFirstAnswerContainer = {spectator || isThisVoted} on:click = {voteFirstAnswer}>                      
                    <svg class = 'upperSvg' width="32" height="26" viewBox="0 0 32 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 25.5L20 0L31.5 13.5L0 25.5Z" fill={firstAnswerContainerBackground}/>
                    </svg>

                    <div class="firstAnswer" style = "--textColor : {firstAnswerTextColor}"> {firstAnswer} </div>
                    {#if isThisVoted || spectator}
                        <div class = 'author'>- {currentQuestionFirstUserName}</div>
                    {/if}
                </div>
                
                <div class:secondAnswerContainer = {voter && !isThisVoted} style="--backgroundColor: {secondAnswerContainerBackground}" class:disabledSecondAnswerContainer = {spectator || isThisVoted} on:click = {voteSecondAnswer}>  
                    
                    <svg class = 'downSvg' width="32" height="26" viewBox="0 0 32 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M31.5 25.5L11.5 0L0 13.5L31.5 25.5Z" fill={secondAnswerContainerBackground}/>
                    </svg>

                    <div class="secondAnswer" style = "--textColor : {secondAnswerTextColor}"> {secondAnswer} </div>
                    {#if isThisVoted || spectator}
                        <div class = 'author'>- {currentQuestionSecondUserName}</div>
                    {/if}
                </div>
            </div>
            {#if isThisVoted || spectator}
                <div class="voters">
                    {#if users && firstAnswerVoters}
                        <div class="firstAnswerVoters">
                            {#each firstAnswerVoters as voter}
                                <div class="voter" class:disabledVoter = {!currentQuestionVoters[voter]}>
                                    {processName(users[voter])}
                                </div>
                            {/each}
                        </div>
                        <div class="secondAnswerVoters">
                            {#each secondAnswerVoters as voter}
                                <div class="voter" class:disabledVoter = {!currentQuestionVoters[voter]}>
                                    {processName(users[voter])}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
        <div class="buttonContainer">
            {#if voter}
                {#if !isThisVoted}
                    <CustomButton disableBtn = {!firstAnswerVoted && !secondAnswerVoted} btnText = {"Vote"} on:click = {registerVote}/>
                {/if}
            {/if}
            {#if isHost === true && noOfVotersRemaining}
                <CustomButton disableBtn = {false} btnText = {btnText} on:click = {handleNextQuestion}/>
            {/if}
        </div>
        {#if voter && !isThisVoted}
            <div class = 'waitingForOtherAnswer'>
                Vote the answer which you likes the most
            </div>
        {/if}
        {#if (voter && isThisVoted) || (spectator)}
            {#if noOfVotersRemaining}
                <div class = 'waitingForOtherAnswer'>
                    All voters have not voted.<br/>
                    Wait for them or {isHost?"":"ask host"} click next question
                </div>
            {/if}
        {/if}
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
        width : 60%;
        margin : auto;
    }
    .question {
        color : #fff;
        font-family : 'Manrope';
        font-weight : 900;
        font-size : 0.9rem;
        letter-spacing: 1.25px;
        line-height: 1.25rem;
        max-width : 50%;
        margin : auto;
    }
    .leaderMsg {
        color : #B49BFF;
        font-family : 'Manrope';
        font-weight : 900;
        font-size : 1.25rem;
        max-width : 50%;
        margin : 1rem;
    }
    .answers,.voters {
        display : flex;
        justify-content: center;
        align-items: stretch;
    }
    .disabledFirstAnswerContainer,.disabledSecondAnswerContainer {
        cursor : text;
        opacity : 0.5;
        padding : 1rem;
        position : relative;
        margin: 1rem;
        background: var(--backgroundColor);
        border-radius : 10px;
        display : flex;
        flex-direction: column;
        justify-content: center;
        flex : 1;
    }
    .firstAnswerContainer,.disabledFirstAnswerContainer {
        box-shadow : -5px -5px #441291;
    }
    .secondAnswerContainer,.disabledSecondAnswerContainer {
        box-shadow: -5px -5px #CF017D;
    }
    .firstAnswerContainer,.secondAnswerContainer {
        padding : 1rem;
        position : relative;
        margin: 1rem;
        cursor : pointer;
        border-radius : 10px;
        background: var(--backgroundColor);
        display : flex;
        flex-direction: column;
        justify-content: center;
        flex : 1;
    }
    
    .firstAnswerContainer:hover,.secondAnswerContainer:hover {
        transform: scale(1.05);
    }
    .firstAnswerContainer:hover {
        background : #6C44A8;
    }
    .firstAnswerContainer:hover .firstAnswer{
        color : #fff;
    }
    .firstAnswerContainer:hover .upperSvg path {
        fill :#6C44A8;
    }
    .secondAnswerContainer:hover {
        background: #A84480;
    }
    .secondAnswerContainer:hover .secondAnswer {
        color : #fff;
    }
    .secondAnswerContainer:hover .downSvg path {
        fill : #A84480;
    }
    .firstAnswer {
        font-family : 'Manrope';
        font-weight : 900;
        font-size : 0.9rem;
        letter-spacing: 1.25px;
        line-height: 1.25rem;
        word-break: break-all;
        color : var(--textColor);
    }
    .secondAnswer {
        font-family : 'Manrope';
        font-weight : 900;
        font-size : 0.9rem;
        letter-spacing: 1.25px;
        line-height: 1.25rem;
        word-break : break-all;
        color : var(--textColor);
    }
    .author {
        font-family : 'Manrope';
        font-size : 0.6rem;
        color : #B49BFF;
        text-align: right;
        font-style: italic;
    }
    .firstAnswerVoters,.secondAnswerVoters {
        flex : 1;
        display : flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        margin : 1rem;
    }
    .voter {
        background: #333333;
        font-family : 'Padauk';
        font-size : 0.65rem;
        border-radius : 5px;
        color : #fff;
        padding : 10px;
        margin : 5px;
    }
    .disabledVoter {
        opacity : 0.5;
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
    .buttonContainer {
        display : flex;
    }
    .upperSvg {
        position : absolute;
        top : 70%;
        left : -0.7rem;
    }
    .downSvg {
        position : absolute;
        top : 70%;
        right : -0.7rem;
    }
</style>