<script>
    import {dbScoreOfUser} from './database';
    let score;
    let prevScore = false;
    let doAnimation = false;
    let scoreHasLoaded = false;
    dbScoreOfUser.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        
        if(prevScore) {
            if(score !== snap.val()*10) {
                doAnimation = true;
            }
        }
        else {
            prevScore = true;
        }
        score = snap.val()*10;
        scoreHasLoaded = true;
    })
</script>
{#if scoreHasLoaded}
    <div class="scoreBox">
        <div class="outerCircle">
            <div class="innerCircle"></div>
        </div>
        <div class = "score" class:doAnimation = {doAnimation}>
            {score}
        </div>
    </div>
{/if}
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
    .scoreBox {
        position: absolute;
        top : 1rem;
        right : 1rem;
        border-radius : 1.25rem;
        background-color: #4C45AC;
        display : flex;
        justify-content: space-between;
        align-items: center;
        padding : 0.25rem;
    }
    .outerCircle {
        border-radius: 50%;
        background-color: #F2B746;
        padding : 0.25rem;
    }
    .innerCircle {
        padding : 0.25rem;
        border-radius: 50%;
        background-color: #FDF498;
    }
    .score {
        color : #fff;
        font-family : 'Padauk';
        font-weight : 700;
        display : flex;
        justify-content: center;
        align-items: center;
        margin-left : 0.25rem;
    }
    .doAnimation {
        animation : Hello 1s 1;
    }
    @keyframes Hello {
		0% {
			font-size : 1rem;
		}
		50% {
			font-size : 2rem;
		}
		100% {
			font-size : 1rem;
		}
    }
</style>