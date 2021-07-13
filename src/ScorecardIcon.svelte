<script>
    export let score;
</script>
{#key score}
    <div class="scoreBox">
        <div class="outerCircle">
            <div class="innerCircle"></div>
        </div>
        <div class = "score">
            {score}
        </div>
    </div>
{/key}
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
        height : 1.5rem;
        border-radius : 1.25rem;
        background-color: #4C45AC;
        display : flex;
        justify-content: space-between;
        align-items: center;
    }
    .outerCircle {
        height: 1rem;
        width : 1rem;
        border-radius: 50%;
        background-color: #F2B746;
        padding : 0.25rem;
        margin : 0.25rem;
    }
    .innerCircle {
        height : 0.5rem;
        width : 0.5rem;
        border-radius: 50%;
        background-color: #FDF498;
    }
    .score {
        color : #fff;
        font-family : 'Padauk';
        font-weight : 700;
        height : 1rem;
        margin : 0.25rem;
        display : flex;
        justify-content: center;
        align-items: center;
        font-size : 1rem;
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