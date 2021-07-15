export const params =  new URLSearchParams(window.location.search);
export  const getParams =  function (name) {
    return '' + params.get(name);
};
export const getGameSessionId = function () {
    return getParams('roomId') + getParams('sessionId');
};
// export const questionArray =  [
//     "What is the first thing you would do if you won the lottery ?",
//     "Something you'd like to smash with a wrecking ball",
//     "Something you wouldn't want to find growing on your neck",
//     "What would the sequel to the painting 'Dogs Playing Poker' be named?",
//     "The worst planet to crash land on to would be the planet of _______",
//     "Where are all the missing socks?",
//     "What is the best way to tell if someone is dead ?",
//     "The real secret to living to age 100 is?",
//     "Worst name for a race horse?",
//     "Name an animal Noah shouldn't have saved",
//     "If the winning coach gets Gatorade dumped on him, what should the losing coach get dumped on him ?",
//     "A great way to kill time at work",
//     "The least romantic place to propose a marriage",
//     "What's really causing Global warming?",
//     "What name would a teacher laugh at when calling out roll?",
//     "A great president from a cartoon series would be __________",
//     "The best way to impress an Alien from Mars",
//     "A movie guaranteed to be a hit with necrophilacs -",
//     "A double rainbow doesn't have gold at the end of it. Instead it has _______",
//     "What's the first thing you would do if you could time travel?",
//     "What would be the mascot of a baseball team you owned?",
//     "An alternative use for an old gaming console",
//     "What would your license plate say if there were no limit on length?",
//     "A new genre of music you just made up right now",
//     "If facebook was no longer allowed to sell private info, name something else they'd do instead",
//     "You are an actor in a TV series. What's your most famous line?",
//     "What two words would passengers never want to hear a pilot say?",
//     "You would never go on a roller coaster called __________",
//     "Name a candle scent designed specifically for Kim Kardashian",
//     "The biggest downside of living in Hell",
//     "You should never give alcohol to __________",
//     "On your wedding night, it would be really horrible to find out that the person you married is ________",
//     "A name for a really bad Broadway musical",
//     "What is Mona Lisa smiling about?",
//     "A name for a brand for designer adult diapers",
//     "The worst thing for an evil witch to turn you into",
//     "The crime you would commit if you could get away with it",
//     "A terrible name for a cruise ship",
//     "The most intriguing phrase to find in a dating profile",
//     "How can you tell if your tailor is in love with you ?",
//     "The most surprising place to find a missing contact lens",
//     "A sign that your dog is an idiot",
//     "The worst tattoo to have on your butt would consist of these three words",
//     "The only thing we have to fear is fear itself. Oh, and also ________",
//     "If you really want to waste your one phone call in prison, call the ________",
//     "The name of a font nobody would ever use",
//     "The most awesome Guiness World Record to break",
//     "A street name you never see",
//     "The dumbest person in the history of all time",
//     "What did they really find in King Tut's tomb?",
//     "An awkward thing to shout while bouncing with your friend on a trampoline",
//     "Surprising photos to find on Garfield's phone would be of?",
//     "Why should you never turn your back on a penguin ?",
//     "The most common injury of the super wealthy",
//     "A weird skill left handers are better at",
//     "The best use for a leftover meatball",
//     "The worst theme for a pinball machine",
//     "The best way to escape the inside of a whale",
//     "A lame thing to say before your big drag race",
//     "The one thing you wouldn't mind holding between your butt cheeks for an hour",
//     "Jesus's REAL last words",
//     "INvent a family friendly replacement word that you could say instead of an actual curse word",
//     "A good name for a fictional town in Australia",
//     "A good catchphrase everytime to yell everytime you finish pooping",
//     "A weird catchphrase Jesus would say before performing a miracle",
//     "The name of a cereal for serial killers",
//     "A procedure that not even the slimiest plastic surgeon would do",
//     "It never ends well when you mix _______ and ________",
//     "What should be dumped on the losing coach at the end of a football game ?",
//     "One thing that you should never gift your grandmom",
//     "A terrible place to dump your grandmom's ashes",
//     "Really awful cheerleaders would yell _________",
//     "What would you do with eight arms?",
//     "What do you wish you could say to yourself as a high schooler",
//     "New show idea: America's next top ___",
//     "A weird thing for an astronaut to say on the moon",
//     "Never _______ after applying lotion",
//     "The name of a dog food bread that you probably should not buy",
//     "A perfectly good reason to walk around with a raven",
//     "A rejected title in the Magic School Bus series: The Magic School Bus goes to ",
//     "In 25 years people of the future will look back and think we're morons for not realizing that ",
//     "Santa's phasing out reindeer and next year, his sleigh will be pulled by",
//     "A polite way to say \"booger\"",
//     "I am sorry professor but I couldn't complete my homework because of ",
//     "Where's Jimmy Hoffa?",
//     "What do vegans tase like?",
//     "What a caveman has nightmares about?",
//     "A rejected crayon color",
//     "The name of a conference where internet trolls gather",
//     "A great opening line to start a conversation with a stranger at a party",
//     "Name the eighth dwarf who got cut at the last minute",
//     "What unicorn flatulence smells like?",
//     "Disney has decided to replace Iron man with",
//     "A lesser talked about room in the White House",
//     "As Shakespeare once said \"\"",
//     "The last thing you see before being blown up",
//     "Rename the capital of France",
//     "What a statue on Easter Island might say when erected for the first time?",
//     "Three words to describe the Matterhorn",
//     "The name of the new V.I.L.E recruit",
//     "Chase's definition of romance",
//     "What is glitter really made up of ?",
//     "What is Pope Francis's biggest secret?",
//     "Why would someone wish to have two eggs of the exact same size for breakfast?",
//     "Life Pro Tip: After the quarantine is over, facemasks can also be used for ________",
//     "The quarantine is just a secret government plot to ___",
//     "Because of COVID-19 there is now a ballot to",
//     "What Netflix didn't tell you about Joe Exotic during Tiger King",
//     "The surprising new service Amazon is rolling out during quarantine",
//     "The Center for Disease Control recently discovered this unlikey symptom of Covid-19",
//     "The title of Kanye's new quarantine inspired song",
//     "Best name for a Covid cooking Show",
//     "Coronavirus secretly gives you this superpower:",
//     "An inventive way to get rid of headlice",
//     "The worst thing to find when you move into a new house",
//     "A thought that keeps Santa Claus awake at night",
//     "What an alarm clock could say that would wake you right up ?",
//     "The best name to give an ugly baby",
//     "Usually it's bacon, lettuce and tomato, but come up with a BLT that you wouldn't want to eat",
//     "The worst air freshner scent",
//     "Something you'd make a butler do the moment you hired him",
//     "The creepiest thing to whisper in someone's ears as you are hugging them",
//     "Something overheard at the Last Supper",
//     "A surprising new part of the field sobreity test that needs you to do _______ prove that you are not drunk",
//     "Thing you'd be most surprised to have a dentist find in your mouth",
//     "A rejected title for Mopey Dick",
//     "Where do you think the beef really is?",
//     "The best thing about going to prison",
//     "Something a weatherman might tell if he completely snapped during a weather forecast",
//     "The name of a sexy new dance move",
//     "Rename a famous work of literature so that it is ruined by the word 'butt\"",
//     "Something you promise to yell if you win this game",
//     "Today's music needs more _____",
//     "A clever thing for James Bond to say as he throws someone out of an airplane",
//     "You never know when you are going to need insurance. You could wake up tomorrow and _________",
//     "It's disappointing to put together a 1000 piece puzzle and realize it's just a picture of _________",
//     "If we can't afford to bury or cremate you, what should we do with your body?",
//     "A name for a really scary swamp: _________ Swamp",
//     "The name of a painting Michelangelo was ashamed he created",
//     "A bad reason to call 911",
//     "Something you don't expect to see when you spy on your neighbours",
//     "A club you wish they had in high school",
//     "Another name for Canada",
//     "The name that cavemen probably gave diarrheoa",
//     "There's Gryffindor, Ravenclaw, Slytherin and Hufflepuff,but what's the Hogwarts house few ever heard of?",
//     "The name of the website that probably gave your computer a virus",
//     "What happens when you finally make an eye contact with a crazy person in a subway",
//     "What you don't want to hear from a passenger next to you at the start of a 20 hour flight",
//     "What you'd guess is an inadvertised ingredient in most hot dogs?",
//     "A good use for toenail clippings",
//     "The new movie idea: The Muppets take ______",
//     "What is the sexiest and least sexy name?",
//     "What secret conspiracy would you like to start?",
//     "A wifi name you'd use so that people refrain using it",
//     "In 40 years what would people be nostalgic for?",
//     "The unwritten rules you'd like to have at your workplace",
//     "How many chickens would it take to kill an elephant?",
//     "A body part you'd wish to detach and why?",
//     "Weirdest thing a guest would do at your house",
//     "what mythical would improve the world the most if it existed?",
//     "What inanimate object you wish to remove from existence",
//     "If peanut butter wasn't called peanut butter, what would it be called?",
//     "If life were a video game, what would the cheat codes be?",
//     "What sport would be the funniest to add a mandatory amount of alcohol to?",
//     "What two totally normal things become weird if you do them back to back?",
//     "What imaginary set of items could you buy that would make the cashier most uncomfortable?",
//     "Some interesting alternatives to war that countries could settle their differences with",
//     "What would the world be like if it was filled with male and female copies of you?",
//     "If you were arrested with no explanation, your friends and family would think you had done _____",
//     "A scientific experiment you'd run if money and ethics weren't an issue",
//     "What could you wear on your head that would make people stop what they are doing and stare in awe",
//     "What nightmares do you think cavemen had about cavewomen?",
//     "What would be the dumbest way to get injured on Mars?",
//     "Something that absolutely doesn't make you think of a bathroom at some level",
//     "The name of the worst planet",
//     "Something you would like to do when you are sleep walking",
//     "Top 3 ingredients in the sleuth in a garbage processing unit",
//     "The best part of being a dwarf",
//     "Life would be so much better if we all lived as ______",
//     "Make up a word that means \"farting in the wrong place\"",
//     "Turns out that the meaning of work is _______",
//     "Turns out that the meaning of love is ________",
//     "What's the way to get to Timbuktu ?",
//     "What would you do if you went with Alice in Wonderland",
//     "What would be written in the book held by the statue of libery?",
//     "A great hiding place for an alien on earth would be ",
//     "Weirdest thing you would see in your bedroom",
//     "The weirdest thing to be spotted on the Moon",
//     "A noble prize category that never made it",
//     "10 lions feasting on a tiger would be called as",
//     "The hardest part of being a museum caretaker",
//     "The worst thing to share with prison inmates",
//     "The worst thing to say to a prison guard",
//     "A song for vegan people",
//     "If Justin Bieber composed a song for Donald Trump, the chorus would have the line -",
//     "Newton's first words after the apple fell on his head -",
//     "The least popular topping on a pizza",
//     "A bad substitute for a hair shampoo",
//     "Never trust a person who ______",
//     "Come up with a full form for ADS relating to food",
//     "Where would you like a third eye placed on your body?",
//     "The one thing that cashiers say everyday",
//     "If Jesus were to be born tomorrow, where would he take birth ?",
//     "Life Hack: If there is no place for floaters in a shoe rack, simply",
//     "What was the first thing Adam said to Eve when they saw each other?",
//     "A strange announcement from a pilot in mid air in a flight",
//     "A strange thing to shout when your wallet igets robbed",
//     "How would an astronaut pass his time while in his spacecraft while travelling from Mars to Earth",
//     "Something an over excited fan would do at a horse race",
//     "Weirdest thing for say to a clown in a circus",
//     "Something you wish was made of iron instead of the usual material",
//     "Somethiing Donals Trump reminds himself of everyday",
//     "A rejected title for Hitler's book, Mein Kampf",
//     "The title of Donald Trump's autobiography would be ________",
//     "The title of Kim Kardashian's autobiography would be _________",
//     "What is the thinker in the Thinker's statue thinking of?",
//     "Why is the Leaning Tower of Pisa REALLY leaning?",
//     "A weird annnouncement from the President: I did not play ___________-",
//     "The only way to truly kill a mosquito is _______",
//     "A line you'd see on Joey's (from F.R.I.E.N.D.S) dating profile",
//     "If dogs were to have a dating profile, their bio would read _______-",
//     "A group name that would freak out the tour guide on a group tour",
//     "A weird way to ask someone \" How about having a coffee together and then _________\"",
//     "A name that no one in history has ever had",
//     "If Rahul Gandhi's statue were to be made, it would be known as the Statue of ________",
//     "The treasure at the base of the Mount Everest that no one knows about has ________",
//     "The weirdest thing to come out of a volcano",
//     "The gross thing nobody knows about Santa Claus",
//     "If people were valued by the memes based on them, the world's most valuable people's list would include",
//     "Weird parameter to be included as Forbes list of most ________",
//     "A terrible name for a Chinese restaurant",
//     "The book titled \"100 places you should never visit\" should definitely have _________",
//     "The strangest thing to shout when you see a cockroach come flying towards you",
//     "Terrible name for a horoscope column",
//     "The pep talk you'd get from a football coach who bet on the other team",
//     "The hardest job to do while on a roller coaster",
//     "A good use for an abandoned restaurant",
//     "The booth that nobody visits in a fun fair is called _________",
//     "A strange thing for a ghost to be afraid of",
//     "A strange thing for a ghost to whisper in your ear",
//     "A new soccer tradition you'd like to see is post match ___",
//     "Frankenstein's middle school nick name",
//     "Donald trumps nick name at home would be ",
//     "The last wish of a fish before it's death would be",
//     "A fun activity that only requires 3 fingers",
//     "Weirdest thing to see in the cockpit of an airplane",
//     "A great way to make a shark mad is to __________",
//     "A weird to keep your toes warm is _________",
//     "The weridest thing to say as a waiter to a couple at your restaurant",
//     "What REALLY made dinosaurs extinct?",
//     "The zombie apocalypse has begun. You have an SUV and a baseball bat. Where are you going first?",
//     "If you could change what falls from the sky everytime it rains, what would it be?",
//     "What do you think of garden gnomes ?",
//     "You are given an elephant. You can't give it away or sell it. What would you do with it?",
//     "An alternate name for Winnie the Pooh",
//     "A skittles flavour that missed the cut",
//     "An alternate name for Doraemon",
//     "A lesser known Doraemon's gadget is ___________",
//     "If the Beatles were not called Beatles, what would they be called ?",
//     "Another name for Thomas and friends",
//     "An inappropriate theme for a kid's night dress",
//     "A pizza topping rejected by the FDA",
//     "Things you never say to an author",
//     "Another name for a fist pump",
//     "Weird and obscure name of a Harry Potter Spell",
//     "More money, more __________",
//     "The weirdest trick an animal in a circus could showcase",
//     "The worst moment to be captured in a photograph",
//     "An unpopular use of a toilet paper.",
//     "Your toilet paper brand name",
//     "Why does the ostrich hate you ?",
//     "A terrible thing to spray paint on a car",
//     "What does a goat mean when it bleats twice?",
//     "It never ends well when you add ______ to _________",
//     "The least fitting job for an MBA graduate",
//     "An unpopular command the army uses",
//     "Weird activity 3 people would do on someone's birthday",
//     "What is better pizza or candle?",
//     "Worst thing you can tell the kids about the death of a fish",
//     "A new spell Harry Potter was unable to use",
//     "The worst use of an instant teleportation device is",
//     "If you could teleport yourself to a place for 3 mins, where would it be?",
//     "The title of an action movie starring parrots",
//     "The first thing the cocoon did after turning into a butterfly",
//     "ctrl+alt+shif+> would be a new keyboard shortcut to ______",
//     "The wise old saying \"Look before you ________\"",
//     "A terrible street name",
//     "A terrible reply to \" Hey you up?\"",
//     "A lesser known use of tentacles",
//     "A weird setting in a refrigerator",
//     "weirdest title of an autobiography",
//     "The worst theme for a pinball",
//     "Android phones are better than iphones because",
//     "What makes us human is what also makes us _________",
//     "An answer you would like from Alexa if you her asked her about \"current affairs\"",
//     "Why should you be our new president?",
//     "How will this world end?",
//     "Oh Shit, ______ is dead!",
//     "A meme on 2020",
//     "Weirdest thing to blame 2020 for ________",
//     "Where did humans come from?",
//     "A resolution for 2021",
//     "If I had a 7 million dollars, I would ______",
//     "What came first, the egg or the chicken?",
//     "We know how 2020 was. How would 2021 be?",
//     "A meme for New Year",
//     "If you had to give up on one thing for the rest of your life, what would it be?",
//     "Tom and Jerry fight because _________",
//     "A weird pose for a mannequin challenge",
//     "One thing you could have done in school for a better grade",
//     "The best thing about online dating is",
//     "The weirdest thing to happen on a blind date",
//     "Oh ghosh, Santa gave me ________ for christmas",
//     "Bells, jingles, gifts and _________ are hanging around the xmas tree",
//     "In 5 days god created the world and on the 6th day he created ______",
//     "You want a World War 3 for ",
//     "Socks never stay in pairs because",
//     "If you are invisible, what would you see?",
//     "Two things to have with you if you were trapped on an island are ____ and ______",
//     "Weirdest thing to say at a funeral",
//     "When the cows aren't chewing or mooing, they do _________",
//     "One thing that should happen only in dreams and never in reality",
//     "Something you'd never expect to see on McDonald's menu",
//     "It's not spinach, it's actually ______ that gives Popeye strength",
//     "Error 101 would be a new error code in googel for _________",
//     "A great way to get expelled from Hogwarts",
//     "The most pointless place to have a GoPro camera stuck on",
//     "The worst place to hide counterintelligence documents",
//     "Come up with a clever insult using the word Ape",
//     "The least romantic anniversary gift",
//     "To become a millionaire in a week simply _",
//     "The most common item in the lost and found box in Hell",
//     "A 3 word description for a person wearing a mask in the wrong manner",
//     "one thing you'd surely see on the bucket list of an international student",
//     "The biggest mistake you can make at an all-you-can-eat buffet",
//     "If the coronavirus vaccine was to be made at home, it would surely contain",
//     "What do other viruses think of coronavirus?",
//     "A weird thing to shout when you're midair while skydiving",
//     "Come up with a full name for the acronym D.I.S",
//     "Another name for a pizza",
//     "An apple a day keeps the doctor away because _________",
//     "What movie would be greatly improved if it were made into a musical",
//     "If animals could talk, who would be the rudest?",
//     "What set of items could you buy at a store, to make the cashier laugh",
//     "If you were a king/queen for a day, the first rule that you would change is -",
//     "What is invisible, but you wish people could see?",
//     "If you were wrongly put into an insane assylum, how would you convinve them that you are actually sane and not just pretending?",
//     "If a random person on a street starts laughing looking at you, what's the first thing that would come to your mind?",
//     "A funny answer to the question - 'how's it going?'",
//     "Change one word from any movie title, to change the whole plot",
//     "If you were to add a sport to the Olympics, which one would it be?",
//     "an unknown fact about the secret 8th dwarf",
//     "A tagline for a toilet paper brand",
//     "A tagline for a mosquito repellent brand",
//     "Something Godzilla does when he's drunk",
//     "If _____ and _______ had a kid, it would be _______",
//     "A phrase you would love to hear Morgan Freeman say",
//     "A funny thing to write down in your address",
//     "The most boring graffitti you could see in a subway",
//     "A weird name for a funeral home",
//     "Garfield's lesser known fantasy",
//     "Something you don't want to find in your Christmas stocking",
//     "The year 2020 will be remembered as the _______ year",
//     "The years 2011 to 2020 would be known as the _______ Age",
//     "Players could be banned from Olympics for intentional _______",
//     "A better name for belly buttons",
//     "Something you don't want to hear from a guy driving your romantic horse drawn carriage",
//     "The worst thing to get stuck in your hair",
//     "A really dumb round table discussion would be about this topic",
//     "The title of a cookbook written by a cowboy",
//     "The worst sign off line to have on your email",
//     "An area you would like to have at your workplace",
//     "How do birds come to know if they're are flying north or south?",
//     "What do Pandas dream of when they sleep 18 hours a day?",
//     "In the future America will change it's name to",
//     "The worst vehicle to drag race in",
//     "You get the weirdest image results when you search for _____",
//     "The weirdest doughnut in the world is filled with _________",
//     "A name of a dating site for people over 80",
//     "A weird thing for Alexa to say on her own to you when started",
//     "A message alert tone that will definitely catch everone's attention"
// ];