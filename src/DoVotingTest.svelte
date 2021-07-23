<script>
    import QuikWikSmallIcon from './QuikWikSmallIcon.svelte';
    import RoundIndicatorAndTimer from './RoundIndicatorAndTimer.svelte';
    import ScorecardIcon from './ScorecardIcon.svelte';
    import {listenFirebaseKey,dbAllAnswers,dbQuestions,dbUsers,dbPage,dbScoreOfUsers,dbScoreOfUser,dbCurrentQuestionNumber,dbCurrentQuestionVoters,dbVoteTimer,dbGameSessionRoundValue,dbHost,dbNoOfVotersRemaining} from './database';
    import {getParams} from './utils';
    import CustomButton from './CustomButton.svelte';
    import RoundIndicator from './RoundIndicator.svelte';
    import SmallTick from './svg/SmallTick.svelte';
    import {fly} from 'svelte/transition';

    let allAnswers;
    let questionIds = [];
    let allQuikWikQuestions;
    let users;
    let userId = getParams('userId');
    let totalNumberOfQuestion;
    let hostId;
    let isHost = false;
    let handleNextQuestionClicked;

    let questionNumber;
    let currentQuestionId; // depends on question number
    let currentQuestion = 'Loading ...'; // depends on current Question id
    let spectator = false;
    let voter = false;
    let myScore;
    let votingTimerHasStarted = false;
    let currentQuestionVotersIsLoaded = false;
    let scoreOfUsers;
    let time; //For round animation
    let roundValue;
    let opacityOfContainer;
    let isThisVoted = false;
    let noOfVotersRemaining;
    let questionNumberHasChanged = false;
    let currentQuestionVoters,currentQuestionVotersArray = [];
    let currentQuestionUsers;
    let currentQuestionFirstUser,currentQuestionSecondUser,currentQuestionFirstUserName,currentQuestionSecondUserName;
    let firstAnswer,secondAnswer;
    let firstAnswerVoters = [];
    let secondAnswerVoters = [];
    let leadingMsg;
    let message;
    let firstUserVotes = 0,secondUserVotes = 0;
    let firstAnswerVoted = false,secondAnswerVoted = false;
    let firstAnswerTextColor = "#343E98", secondAnswerTextColor = "#343E98";
    let secondAnswerContainerBackground = "#fff",firstAnswerContainerBackground = "#fff";
    let btnText;
    let isThisLastQuestion

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
    
    listenFirebaseKey(dbVoteTimer,(dbVoteTimerRef)=>{
        
        dbVoteTimerRef.on('value',(snap)=>{
            if(!snap.exists()) {
                votingTimerHasStarted = false;
                console.log('voter and spectator set to false');
                spectator = false;
                voter = false;
                isThisVoted = false;
                console.log('TImer not exists ',snap.val());
                currentQuestionVotersIsLoaded = false;
                return;
            }
            votingTimerHasStarted = true;
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
    
    listenFirebaseKey(dbCurrentQuestionNumber,(dbCurrentQuestionNumberRef)=>{
        dbCurrentQuestionNumberRef.on('value',(snap)=>{
            if(!snap.exists()) {
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
            opacityOfContainer = 0.8;
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
    
    listenFirebaseKey(dbCurrentQuestionVoters,(dbCurrentQuestionVotersRef)=>{
        dbCurrentQuestionVotersRef.on('value',(snap)=>{
            console.log('Hey i am called currentQuestionVoters');
            if(!snap.exists()) {
                return;
            }
            currentQuestionVoters = snap.val();
            currentQuestionVotersIsLoaded = true;
            currentQuestionVotersArray = [];
            for(const id in currentQuestionVoters) {
                currentQuestionVotersArray.push(id);
            }
            voter = (getParams('userId') in currentQuestionVoters);
            console.log("voter ",voter);
            if(voter === true)
            {
                console.log('he is voter');
                isThisVoted = currentQuestionVoters[userId];
                spectator = false;
            }
            else {
                spectator = true;
            }
        })
    })
    $: {
        if(!voter && !spectator && currentQuestionVotersIsLoaded) {
            voter = (getParams('userId') in currentQuestionVoters);
            if(voter === true) {
                spectator = false;
            }
            else {
                spectator = true;
            }
        }
    }
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
                    firstAnswerVoters = currentQuestionUsers[id]['votedBy'];
                    currentQuestionFirstUserName = processName( users[currentQuestionFirstUser]);
                }
                else if(temp === 2) {
                    currentQuestionSecondUser = id;
                    secondAnswer = currentQuestionUsers[id]['ansText'];
                    secondAnswerVoters = currentQuestionUsers[id]['votedBy'];
                    currentQuestionSecondUserName = processName( users[currentQuestionSecondUser]);
                }
                temp += 1;
            }
            
            if(firstAnswerVoters)
                firstUserVotes = firstAnswerVoters.length;
            if(secondAnswerVoters)
                secondUserVotes = secondAnswerVoters.length;
            if(firstUserVotes > secondUserVotes) {
                leadingMsg = `${currentQuestionFirstUserName} got the most votes`;
            }
            else if(firstUserVotes < secondUserVotes) {
                leadingMsg = `${currentQuestionSecondUserName} got the most votes`;
            }
            else if(firstUserVotes === secondUserVotes){
                leadingMsg = `It's a draw`;
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
    
    $:{
        if(voter) {
            if(!isThisVoted)
                message = 'TIME TO VOTE';
            else {
                message = 'WAITING FOR OTHERS TO VOTE'
            }
        }
        else if(spectator) {
            message = 'WAITING FOR VOTERS TO VOTE';
        }
    }
    
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
                    firstAnswerVoted = true;
                    secondAnswerVoted = false;
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
                    firstAnswerVoted = false;
                    secondAnswerVoted = true;
                }
            }
            secondUserVotes = secondAnswerVoters.length;
        }
    }
    $: {
        console.log('First Answer Voters ',firstAnswerVoters);
        console.log('second Answer Voters ',secondAnswerVoters)
    }
    
    function voteFirstAnswer() {
        if(spectator || isThisVoted || votingTimerHasStarted) {
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
        if(spectator || isThisVoted || votingTimerHasStarted) {
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
    function processName(user,isOnlyYouRequired) {
        let name = user['userName'];
        let fname = name?.split(" ")[0];
        if(fname?.length > 10)
        {
            fname = fname.slice(0,9) + "...";
        }
        if(user.id === userId) {
            if(isOnlyYouRequired) {
                return ('You');
            }
            fname += "(You)";
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
        if(firstAnswerVoters && secondAnswerVoters) {
            firstUserVotes = firstAnswerVoters.length;
            secondUserVotes = secondAnswerVoters.length;
            if(firstUserVotes > secondUserVotes) {
                leadingMsg = `${currentQuestionFirstUserName} got the most votes`;
            }
            else if(firstUserVotes < secondUserVotes) {
                leadingMsg = `${currentQuestionSecondUserName} got the most votes`;
            }
            else if(firstUserVotes === secondUserVotes){
                leadingMsg = `It's a draw`;
            }
        }
    }
    function handleNextQuestion() {
        if(isHost !== true) {
            return ;
        }
        console.log('leadingMsg ',leadingMsg);
        listenFirebaseKey(dbVoteTimer,(dbVoteTimerRef)=>{
            dbVoteTimerRef.set(Date.now() + 16000).then(()=>{
                console.log('Voting timer is set success');
            });
            // setTimeout(()=>{
            //     updateScore();
            //     dbVoteTimerRef.remove();
            // },30000);
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
    let disableBtn;
    let tooltipMsg;
    $: {
        if( voter === true && !isThisVoted ) {
            disableBtn = true;
            tooltipMsg = "You need to vote first.";
        }
        else {
            disableBtn = false;
            tooltipMsg = "All voters have not voted. Do you still want to continue?";
        }
    }
</script>
<main>
    {#if time === 0} 
        <RoundIndicator roundValue = {questionNumber + 1}/>
    {/if}
    <QuikWikSmallIcon/>
    <ScorecardIcon/>
    {#if (voter || spectator) && questionNumberHasChanged}
        <RoundIndicatorAndTimer message = {message} noOfVotersRemaining = {noOfVotersRemaining} timerType = {'votingScreenTimer'} isThisLastQuestion = {isThisLastQuestion}/>

        {#if votingTimerHasStarted}
            <div class="leaderMsg" in:fly ="{{ y: -20, duration: 1000 }}">
                {leadingMsg}
            </div>
        {/if}

        {#if isThisVoted || spectator || votingTimerHasStarted}
            <div class = "votersContainer" in:fly ="{{ y: -20, duration: 1000 }}">
                <div class="votersHeading">
                    Voter List
                </div> 
                <div class="allvoters">
                    {#each currentQuestionVotersArray as voter}
                        <div class="voterContainer" title = "{currentQuestionVoters[voter] === true? `${processName(users[voter],true)} have Voted` : `${processName(users[voter],true)} have not voted`}">
                            <div class = "voterName">
                                { processName(users[voter]) }
                            </div>
                            {#if currentQuestionVoters[voter]}
                                <div class = "votingStatus">
                                    <SmallTick/> 
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
        {#key isThisVoted}
            <div class="container" style = 'opacity : {opacityOfContainer}' in:fly ="{{ y: -20, duration: 1000 }}">
                <div class="question">
                    {currentQuestion}
                </div>
                <div class = 'answers'>
                    <div class:firstAnswerContainer = {voter && !isThisVoted && !votingTimerHasStarted} style="--backgroundColor: {firstAnswerContainerBackground}" class:disabledFirstAnswerContainer = {spectator || isThisVoted || votingTimerHasStarted} on:click = {voteFirstAnswer}>                      
                        <svg class = 'upperSvg' width="32" height="26" viewBox="0 0 32 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 25.5L20 0L31.5 13.5L0 25.5Z" fill={firstAnswerContainerBackground}/>
                        </svg>

                        <div class="firstAnswer" style = "--textColor : {firstAnswerTextColor}"> {firstAnswer} </div>
                        {#if isThisVoted || spectator || votingTimerHasStarted}
                            <div class = 'author' style = "color: {isThisVoted === true && firstAnswerVoted === true?"#fff":"#000"}" >- {currentQuestionFirstUserName}</div>
                        {/if}
                    </div>
                    
                    <div class:secondAnswerContainer = {voter && !isThisVoted && !votingTimerHasStarted} style="--backgroundColor: {secondAnswerContainerBackground}" class:disabledSecondAnswerContainer = {spectator || isThisVoted || votingTimerHasStarted} on:click = {voteSecondAnswer}>  
                        
                        <svg class = 'downSvg' width="32" height="26" viewBox="0 0 32 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M31.5 25.5L11.5 0L0 13.5L31.5 25.5Z" fill={secondAnswerContainerBackground}/>
                        </svg>

                        <div class="secondAnswer" style = "--textColor : {secondAnswerTextColor}"> {secondAnswer} </div>
                        {#if isThisVoted || spectator || votingTimerHasStarted}
                            <div class = 'author' style = "color: {isThisVoted === true && secondAnswerVoted === true?"#fff":"#000"}" >- {currentQuestionSecondUserName}</div>
                        {/if}
                    </div>
                </div>
                {#if isThisVoted || spectator || votingTimerHasStarted}
                    <div class="voters">
                        {#if users && firstAnswerVoters}
                            <div class="firstAnswerVoters">
                                {#each firstAnswerVoters as voter}
                                    <div class="voterContainer" title = "{currentQuestionVoters[voter] === true? `${processName(users[voter],true)} have voted the first Answer`: `have not voted`}">
                                        <div class = "voterName">
                                            {processName(users[voter])}
                                        </div>
                                        <div class = "votingStatus">
                                            <SmallTick/> 
                                        </div>
                                    </div>
                                {/each}
                            </div>
                            <div class="secondAnswerVoters">
                                {#each secondAnswerVoters as voter}
                                    <div class="voterContainer" title = "{currentQuestionVoters[voter] === true? `${processName(users[voter],true)} have voted the first Answer`: `have not voted`}">
                                        <div class = "voterName">
                                            {processName(users[voter])}
                                        </div>
                                        <div class = "votingStatus">
                                            <SmallTick/> 
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
            
            <div class="buttonContainer" in:fly ="{{ y: -20, duration: 1000 }}">
                {#if voter && !votingTimerHasStarted}
                    {#if !isThisVoted}
                        {#if firstAnswerVoted || secondAnswerVoted}
                            <CustomButton disableBtn = {false} btnText = {"Vote"} on:click = {registerVote}/>
                        {:else}
                            <CustomButton disableBtn = {true} btnText = {"Vote"} on:click = {registerVote}/>
                        {/if}
                    {/if}
                {/if}
                {#if isHost === true && noOfVotersRemaining && !votingTimerHasStarted}
                    <CustomButton disableBtn = {disableBtn} tooltipMsg = {tooltipMsg} btnText = {btnText} on:click = {handleNextQuestion} btnType = "Next Question"/>
                {/if}
            </div>
        {/key}
        {#if !isHost && noOfVotersRemaining && votingTimerHasStarted} 
            <div class = 'waitingForOtherAnswer' in:fly ="{{ y: -20, duration: 1000 }}">
                Host has pressed next question button.
            </div>
        {/if}
        {#if voter && !isThisVoted}
            <div class = 'waitingForOtherAnswer' in:fly ="{{ y: -20, duration: 1000 }}">
                {#if !votingTimerHasStarted}
                    Vote the answer which you like the most
                {/if}
            </div>
        {/if}
        {#if (voter && isThisVoted) || (spectator)}
            {#if noOfVotersRemaining && !votingTimerHasStarted}
                <div class = 'waitingForOtherAnswer' in:fly ="{{ y: -20, duration: 1000 }}">
                    All voters have not voted.
                </div>
            {/if}
        {/if}
    {/if}
    
</main>
<style>
    ::-webkit-scrollbar {
        width: 14px;
    }

	/* Track */
	::-webkit-scrollbar-track {
			background: transparent;
			border-radius : 7px;
	}

	/* Handle */
	::-webkit-scrollbar-thumb {
			background: darkgray;;
			border-radius : 10px;
			border : 4px solid #0C0030;
	}
	::-webkit-scrollbar-thumb:hover {
			background: #333;
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
    }
    @media screen and (max-width : 900px) {
        :global(html) {
            font-size : 16px;
        }
    }
    .votersContainer {
		max-width : 60%;
        min-width : 30%;
		text-align : center;
		margin : 0px auto;
	}
    .votersHeading {
        font-family : 'Padauk';
        font-weight : 700;
        color : #fff;
		padding : 0.5rem;
		font-size : 0.5rem;
    }
    .allvoters {
		display : flex;
		max-width : 100%;
		overflow-x : auto;
		margin : auto;
		background : transparent;
		border-radius : 5px;
		align-items : stretch;
        justify-content: center;
	}
	.voterContainer {
		display : flex;
        background: #333333;
		color : #fff;
		align-items : center;
		margin : 4px;
		padding : 0.1rem 0.5rem;
		border-radius : 5px;
	}
	.voterName {
        font-family : 'Padauk';
        font-size : 0.65rem;
	}
    .votingStatus {
        margin-left : 0.5rem;
    }
    .container {
        width : 60%;
        margin : auto;
    }
    @media screen and (max-width : 1000px) {
        .container {
            width : 65%;
        }
    }
    @media screen and (max-width : 900px) {
        .container {
            width : 70%;
        }
    }
    @media screen and (max-width : 800px) {
        .container {
            width : 75%;
        }
    }
    @media screen and (max-width : 700) {
        .container {
            width : 80%;
        }
    }
    @media screen and (max-width : 600) {
        .container {
            width : 85%;
        }
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
        opacity : 0.8;
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
        text-align: right;
        font-style: italic;
    }
    .firstAnswerVoters,.secondAnswerVoters {
        flex : 1;
        display : flex;
        justify-content: center;
        align-items : stretch;
        overflow-x : auto;
        margin : 1rem;
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
        flex-direction: column;
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