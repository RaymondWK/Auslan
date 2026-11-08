# *Auslan Fingerspelling Trainer*

Copyright © 2025 Dr. Raymond William Kennington Ph.D.
All Rights Reserved

By Dr. Raymond Kennington Ph.D. in Mathematics highly commended (cum laude)<br><br>
B.Sc.(Ma.Sc.)(Hons) Grad.Dip.Ed. B.Comp.Inf.Sci.(Hons)<br><br>
Sign Language Certificates (100%): Cert II & III Auslan<br><br>
Certificates include: CS50x, CS50 Python, CS50 SQL, CS50 Scratch<br><br>
Mensan (1976)

## Video Demo: https://youtu.be/9tQZvrkRPw0

## Distinctiveness and Complexity
### Distinctiveness and Uniqueness
The 2-handed fingerspelling training apps in this Application Suite are unique in the world: *Recognition*, *Memory*, *BlockWords* and *Reader*.<br><br>
There are numerous Javascript constructs, techniques and language usages that were not taught in the course, CS50Web, and not required to be used in any of the course's other projects.
### Application Suite
This is a suite of applications combined into one Django project. This had its problems. It needed a separate User application, interacting posts and messaging, a global template, a global index and a global layout page. This entailed having a layout page for each application group that was built on top of the global layout page. This required learning about *blocks* in HTML better than previously.
### Models
There are 16 Models across all apps in the suite, of which 13 models were created just for this project.
### Lines of Code
Approximate values.

| Type        |   LOCs |
| :---------- |  ----: |
| CSS         |  1,900 |
| HTML        |  1,200 |
| Javascript  |  5,600 |
| Python      |  2,000 |
|             |        |
| Total       | 10,700 |

This means that my overall average production rate was 16.5 LOCs/hour. This is my lowest ever rate for any software development project. This was caused by the amount of learning that was required, the amount of testing required for controlling the look and feel of the UI, the complexity of the fingerspelling games and especially the *Reader* app, and the complex inter-relationships between *CSS*, *HTML*, *Javascript* and *Python*.
### Using PostgreSQL
It would be considered easier to use SQLite, but it doesn't scale well, and this full-stack application suite will go live on the internet in the future, hopefully attaining many thousands of users. SQLite locks the entire database when writing to a single record. Multiple processes can read from the database simultaneously as long as no write operation is in progress. This is entirely unsuited to multiuser access. The goal is to extend this *Application Suite* with many more apps, which, hopefully, will attract many more users. The ultimate goal would be to have 1 million users playing games using fingerspelling images instead of alphabetic characters, and using the training apps to become more fluent in reading fingerspelling than any other system I have see on the WWW. Being an optimist, and knowing how good these apps would be once created, the only choice was a multi-user DBMS with row locking that is faster than SQLite.

This made it more complicated than it needed to have been. Another complexity occurred when updating the GitHub codespace: it deleted my database or my access to it. It was not straightforward to recreate it.
### Developing Games
Each of the interactive games provided in this *Application Suite* has its own complexities. The general aspects of creating a good user experience with multi-state gaming code is tricky.
### Creating *Letters*
![An image of the *Letters* page](images/Letters.png "Letters")
This was a steep learning curve at the time, but now looks very simple. It required learning how to handle multiple frames for a single letter, either 'H' or 'J', display the 26 images nicely in a grid, and place the corresponding alphabetic characters over the top of the images in an unobtrusive way and still look okay. Using a -ve value for *bottom* was not even a vague possibility at first, but it was the only logical option left (after trying so many other things). Using *flex* and some of its variations turned out to be necessary. This is complicated thinking, yet simplifies placing things where they are required; this requires a different mindset to programming with a graphical UI development environment like Delphi, in which one places objects where they are wanted.
### Creating *Recognition*
An image of the starting page.
![An image of the *Recognition* starting page](images/Recognition-Start-Screen.png "Recognition")
An image of the playing page.
![An image of the *Recognition* playing page](images/Recognition.png "Recognition")

This required about 700 lines of Javascript and 350 lines of CSS. There are multiple inputs to specify the game, multiple controls based on those inputs and multiple outputs. The control of availability of inputs under various choices of other inputs requires careful consideration. Validating inputs upon "input", "change" and "blur" were required.
### Creating the Game *Memory* (*Pairs* or *Concentration*)
![An image of the game *Memory*](images/Memory.png "Memory")
This interactive game is complete with many options. Some of the fingerspelled images have multiple frames that have to be animated, and re-animated after a small period of time. Cards had to be flipped, which was best shown by rotating 180 degrees out of the page. Identifying the cards and locating them when flipped to discover if a match required using *dataset* for a dynamically ordered set of cards.

The shape used for the grid of cards is a rectangle, whose dimensions can be computer-calculated for the maximum width or selected by the user. If to be selected by the user, then a nice-looking rectangle is chosen, but the user can change it. For example, with 6 pairs there are 12 cards with shapes 1x12,2x6,3x4,4x3,6x2 and 12x1. The nice one is 3x4, the closest, in fact, to having the golden ratio of 1.618.

A slider is used to dynamically change the size of the images, with a sample image displayed for visual determination of the desired size. One can also use the slide to change the size of the images whilst the game is proceeding. If the size becomes too large to fit the current grid shape widthwise, then the shape is altered to fit the next possible width smaller; e.g. if 2x12 becomes too wide, change to 3x8.

There is a single Model associated with this game. It stores the best scores for each specification of game, which is based on about 7 fields. The User application had to be connected to this in order to have *user* as a field in the model. This was new. There were 12 migrations for the fingerspelling (FS) apps, and 6 of these were for *Memory*, which were required as the game evolved. A simpler program would not require so many migrations, as it would have been easily determined at the outset what the Model was to be.

There's about 1,400 lines of Javascript code, and about 180 lines of CSS.
### Creating the Game *BlockWords*
![An image of the *BlockWords* page](images/BlockWords.png "BlockWords")
The game *BlockWords* required pre-processing a dictionary of about 140,000 words into a collection of 9-letter words, called *blockwords*, that have at least 15 commonly-known subwords (i.e. made up of letters from the blockword). These had to be entered into the database using Python and Django in a stand-alone program, not part of the full stack web application. This was new to me and had to be researched. Later, more words were needed to allow for a greater usage of 'J', 'Q' and 'Z'. This required another program that could add specific blockwords and their subwords. Later, this was added to in order to just add subwords for a blockword.

Dynamically placing a derangement of a blockword on the screen in a 3x3 grid and being able to identify each card when clicked was somewhat new and complicated. Setting up animations for images with multiple frames required handling the large blockword images and also the mini images that are in the 3 lists of of found subwords.

There are 7 models associated with *BlockWords*. First, there is the Model for blockwords and 3 lookup tables for 3-letter, 4-letter and 5-letter words (subwords). Each of the subwords could appear in up to 820 blockwords, so it was essential to normalise the data. There are 3 corresponding join Models. One could say that this game is dynamically powered by Django and Javascript, as it doesn't use any views for processing. There's about 600 lines of Javascript code, and about 230 lines of CSS.
### Creating *Reader*
The opening screen in mobile responsive format.
![An image of the *Reader* app's starting page](images/Reader-Start-Screen-Mobile.png "Reader")

The horizontal, scrolling reader in mobile responsive format.
![An image of the *Reader* app's horizontal, scrolling reader](images/Reader-Horizontal-Mode-Play-Mobile.png "Reader")

The vertical (out-from-the-screen) reader in mobile responsive format.
![An image of the *Reader* app's vertical reader](images/Reader-Vertical-Mode-Play-Mobile.png "Reader")

The complexity here was enormous. I had to write, rewrite, try-and-test, try-and-test, many, many times before the timing was correct. Even before that, setting up the type of container was difficult. I started with a grid with 12 columns. This didn't work. I couldn't get it to scroll 1 pixel at a time. In Delphi I would have a used a timer that fired at a fixed interval, say every 400ms, and then moved the images one pixel to the left, but that doesn't work when working with web browsers. How to move the images one pixel to the left was also not known to me. I stumbled across using `will-change: transform;` for the `scroll-strip` and using `scrollStripEl.style.transform = translateX(${scrollX}px);` (with backquotes around *translate ... px*). I also used `requestAnimationFrame(animate);` and a recursive routine for managing the scrolling process.

At one time it was moving like lightening. After trying to fix that, it stopped working again whilst changes were tried, and tried, ... .

Finally, after at least version 30, the images were moving again, v e r y  s l o w l y *like entirely too patient monks*. I wouldn't need to create web apps like these for learning to read fingerspelling if people signed *that* slowly. Easily fixed though, including another slider.

The main difficulty was having to deal with pixels that are not continuous but discrete entities and time, which essentially stepped in approximately 16ms chunks. There is a need to remove those images from the scrolling strip once they have passed the left margin, and re-adjusting the left offset of the images. Making the scrolling smooth-looking is nearly impossible, and there are still some slight jerky movements that can be seen when scrolling very fast. Many, many attempts were made to smooth it out 100% - without success.

When an animated letter (i.e. with more than 1 frame) is removed from the scrollable strip, it is necessary to turn off the animation of the letters 'H' and 'J'. To do this, one needs to use a MutationObserver callback function and specify `childList: true`, which means that any additions or removals (of images in this case) will cause the notification to be made. In the body of the MutationObserver it is necessary to test for the non-existence of the `div` that contains contains the image; if it doesn't exist, then it has been scrolled off the scrollable strip, and therefore needs to have its animation halted. It does this by clearing the *interval* created using setInterval(), and then disconnecting the observer. This, however, had to be scrapped entirely, because attaching a MutationObserver to each image when there are thousands of characters in the text causes the first tile to appear after an intolerably long time; too many resources were being used, I suppose. Another way had to be devised.

Trying to find a way to make the animations of the fingerspelled letters H and J begin again after 3 seconds was difficult. It couldn't be done the same way as in *Memory*, so a new way had to be devised. This took several attempts. It uses nested timers.

Making the scrolling smooth is difficult.

Later, there was the problem of speeding up the display process at the beginning of scrolling. There were two issues. The first involved initialising the starting location way to the right of the visible area; just a simple correction to initialise at the right edge of the correct rectangle - but finding this was a nightmare. To increase the response time after clicking on the `Start` button, a buffer was introduced. Finding the right place to update this buffer was tricky and time-consuming to discover what caused it to not work effectively. The second involved the number of times images were set up with an event for when to animate and when they dropped off the left end. This was solved by caching the letter images.

For comparison, mobile-responsive behaviour was already built in without putting in much extra effort.
### Mobile Responsive
An example of the complexity associated with making an application mobile responsive occurred in the *Memory* game. It took the same amount of time to make it sensibly mobile responsive as to make the game in the first place. One aspect was to make the shape of the rectangle of game tiles (images) have the dimensions of two factors of the number of cards selected by the user, from 2 to 26 doubled. Together with the ability to use a slider to specify the size of the fingerspelled images, this must be dynamically calculated for the grid to fit widthwise.<br><br>
As a consequence of the need for needing all the apps to be mobile responsive (and all the Javascript errors I managed to make), I have become much more comfortable with the use of Dev Tools on Google's Chrome. Checking CSS usage is really important when experimenting with CSS for mobile responsiveness - especially when using Bootstrap, because of it over-riding so much of what I thought should have worked. So much reading, so much trial and error, error, error.

Trying to put the various parts of the interface in different relative positions to what they were in for a large-screen interface was challenging, so say the least.

Converting *BlockWords* also required re-arranging the objects on the screen through the use of some extra divs and a lot of CSS. While developing this app, I thought it would be better to download all the images at once, which I did, and loaded the images from the cache. This was complicated. When I finished succeeding with this, I discovered through further reading that this is entirely unnecessary, because the web browsers always look in the cache first rather than fetching them every time they use them. I know now that this works if the same URL is used each time the images are required.

### Computer Player
Having a choice between a game of solitaire or playing against the computer also offers up added complexity that I have not had before when creating games in C, Delphi, C++, and others, namely that of asynchronous calls using *promise* or *await*.

Another complexity here is when users choose to restrict their moves to just a few seconds. A user can choose to lose the turn or have the computer make random picks of the cards. It turned out that it was necessary to lock the board when it was the computer's turn or when the computer was taking the user's turn for it after the user is being too slow. This needed to be reset when the user has a turn. There are many interwoven functions with many conditional statements for so many cases. This required using Dev Tools on Google's Chrome to find all the Javascript errors I manufactured.

### Development Time
Including the estimated time to submit the Application Suite, which is an involved process given that I used a virtual environment, the total time spent on this capstone project is above 750 hours, averaging above 50 hours/week. I created a very useful time tracker a long time ago, and I have used it with the project. This means that this project is much more extensive than any of the earlier projects for CS50 Web, because those took me less than 100 hours each.

### Additions to *Posts*
This had to be converted to work within a single project. Additions include *Muting posters* so that posters are not seen in the *New* list. This also required adding HTML and JS for viewing the muted list and allowing unmuting them. The same for *Blocking posters* so that their posts are not seen at all. These two changes required adding 2 Models and using Django code to determine those posts that were by muted posters and those people whom one had muted, and similarly for blocked users.

It is now possible to send messages directly to another user from a posted item. There are many important changes and additions that I had forgotten about, but documented as they were completed; see **Comments on Incorporating and Extending *Posts* and *Mail* (*Network*)** below.

The paging method was enhanced to include up to 7 buttons so that a page could be chosen that is close to the current page. Previously, only "Next" and "Prev" buttons were available. I created my own algorithm for working out which numbers were to be displayed and accessing the buttons from within Javascript; other methods I read about were not suitable to my requirement.
### Additions to *Mail*
The *Network* app was incorporated with the new name *Mail*. Additions include viewing the new messages since the previous login, and being able to mute and unmute other users, so that messages from those posters do not appear in the *New* list.

Infinite scroll has been implented for mailboxes. The user can use the mouse scroll wheel or the scrollbar to see earlier posts, 10 at a time.

The greatest complexity here was having to use promises when returning from loading messages. The function `load_messagebox` had to return a promise, and had to be itself returned. Examples are:<br>`return Promise.resolve();` and ` return fetch(url)`.

This occurs because after scrolling asychronously, it is necessary to let `loading = false`. This technique was not presented in lectures. Including the first 2 conditions in the event listener were not initially included. This took many, many hours on several days to get working through research, help and a lot of debugging to find the exact causes of problems, especially edge cases.

```
messagesView.addEventListener('scroll', () => {
    if (   !allLoaded
        && !loading
        && messagesView.scrollTop + messagesView.clientHeight
            >= messagesView.scrollHeight - 10) {

        loading = true;

        // Here, 'true' means 'appending' mode
        load_messagebox(globalMenuChoice, true)
        .catch(err => console.error(err))
        .finally(() => loading = false);
    }
});

```
### Using `data-` and `dataset-`
These were required. Here is what I wrote as a comment in the Javascript code:

`
NB: Passing the body caused a syntax problem by converting
    newlines to become multi-line code.
    Therefore a technique using data-* from Lecture 5
    is now used. I had to re-read the notes from the lecture and research its use in the context here.
`
### Comments on Incorporating and Extending *Posts* and *Mail* (*Network*)
During development, these documented thoughts at the time explain some of the added complexities.
1. Needing a base 'static' folder and having to update settings.py.
2. Needing a base 'templates' folder for the common ancestor for templates, and having to update settings.py.
3. Making these 2 changes is not difficult. What was difficult is not knowing where to put them and not knowing why they couldn't be found. I didn't know that settings.py needed to be updated.
4. Having to use app modifiers for URLs in fetch statements, and the complexity when they are dynamically calculated, like `posts/<int>`.
5. Learning the hard way that having the complete menu system in the one app is really messy and requires many changes, some of which were too advanced for me. This meant having to change it all back the way it was originally and then finding the way to using separate web pages for each app (posts & messages).
6. Items 1-5 took about 20 hours over a period of 6 days - and that was just for 'user_posts'.
7. For 'user_messages' it took longer than 20 hours over a period of 3 days.
8. Getting the Users-app model to be used by the other apps.
9. Getting the menus to operate correctly on each page.
10. Defining a custom user after already migrating some models and attempting to migrate it causes hellish problems. It took me about 8 hours to finally delete the ProgreSQL database and start again with no migrations; there is just not enough information on what to do. So many suggestions just didn't work. Very frustrating, and this was almost the final straw, as I felt like giving up.
11. Logging out from admin and not showing the same page that was displayed before clicking on the Admin menu item entailed creating a custom Admin site and updating the other admin.py files to register the models with the new site. 'Groups' was missing, initially the models had only one field displayed. Many, many issues. This took me about 7 hours.
12. Incorporating the 2 social media apps from previous projects was supposed to be easy, but it really, really wasn't. I extended them both, and can send messages from a post directly to a user.
Extensions include adding Mute/Unmute and Block/Unblock capability, still using AJAX.
13. Number of lines *Posts* has is 376 in views.py, 290 CSS and 1,150 Javascript, whereas it was just 278 in views.py, 210 CSS and 590 Javascript in the *Network* (*Posts*) project. For *Messages*, the numbers are 232, 273 and 708 compared with 178, 115 and 323. In both cases, there is a significant increase in the number of lines of code: 68% in *Posts* and 83% in *Messages*.
14. Much of the code has been improved, especially the fetch, next, error, catch, finally cycle.
15. Added button numbers for pagination. Determined mathematically which buttons to display given the number of posts in total, the number in each page view, and the maximum number of buttons to display. I wrote test code in Python and converted it to Javascript.
16. Implemented continuous scroll for the messaging app.
17. Can 'mute' users' messages.
18. Needing to handle the previous login time. This is to enable showing messages received since previously logging in.
19. Added infinite scrolling for messages. It's more complicated than the example provided in lectures, because the same identifiers must work for each of the message boxes, and also because different messages are required for different types of endings. Also, one must stop sending requests to the back end for more messages after they have run out.
20. Added page buttons for pagination. Up to 7 buttons are displayed between Previous and Next buttons. I created a function in Python that determined what the numbers on the buttons should be based on (a) the number of messages on each page, and (b) the maximum number of buttons wanted. Then I converted it to Javascript, and then improved it to use JS constructs.
21. Making usernames and email addresses case insensitive added a complexity I didn't consider. Authentication had to be altered, particularly by creating a Python file with a function that pre-processes the fields before authenticating, and then setting AUTHENTICATION_BACKENDS in settings.py.
22. Added 2-factor authentication for registrations.
### Case Insensitive Usernames
I had to learn about creating a class in a separate Python file for authentication using case-insensitive usernames. It also required altering settings.py:<br>
```
AUTHENTICATION_BACKENDS = [
    'users.backends.CaseInsensitiveUsernameBackend',
]
```
## Description
*Auslan Fingerspelling Trainer* is a collection of web applications in the one product that uses the principles of *Computer Aided Learning* (CAL) to train people in the use of the 2-handed fingerspelling alphabet used by Deaf people and other signers in the following sign languages.

<ul>
    <li><b>Auslan (Auslan)</b>: Auslan is the Australian Sign Language. Auslan is a complete language with its own grammar, syntax, and vocabulary, and it has regional variations and dialects. Auslan evolved from the sign languages brought to Australia by British, Irish, and Scottish immigrants in the 19th century.  The Australian government officially recognized Auslan as a community language in 1987 and as a legitimate language in 1991.</li>
    <li><b>British Sign Language (BSL)</b>: As a member of the BANZSL family, BSL shares the same manual alphabet and much of the same vocabulary as Auslan.</li>
    <li><b>New Zealand Sign Language (NZSL)</b>: As a member of the BANZSL family, NZSL shares the same manual alphabet and much of the same vocabulary as Auslan and BSL.</li>
    <li><b>Indo-Pakistani Sign Language</b>: Variations of the two-handed manual alphabet are used in some dialects of Indo-Pakistani Sign Language.</li>
    <li><b>South African Sign Language</b>: South African Sign Language is also considered part of the BANZSL family and uses this alphabet.</li>
</ul>

Note that the games provided here can be of interest to Deaf people too, because there are challenging games here that use the Deaf person's natural fingerspelling symbols.

Fingerspelling is not signing, but is used to spell words that do not have a specific sign.

Learning to fingerspell is quite easy, as it does not require people to interpret/read what is being communicated. On the other hand (pun intended), learning to interpret/read what someone has fingerspelled is quite **difficult**. There are very few resources available to learn FS.

Research has verified that "*Using a Communication App Improves the Online Student Learning Experience*" (Journal of Educational Research & Practice), enables users to communicate across countries, and enables people in isolated areas to communicate and participate with others with a similar interest in the learning area.
### Other Web Applications
The author is aware of one web site in Australia, [Signbank](https://signbank.com.au), that allows one to enter a single word and watch the characters being displayed one after the other in the same image area.
There is a web site in the UK that provides some useful ways to learn: [British Sign Language](https://www.signlanguageforum.com/bsl/fingerspelling/fingerspelling-game/).

1. Words are provided in which the players are to type in as many of the singly-displayed fingerspelling words they can in 2 minutes. The speed can be altered.
2. A puzzle maker. One can enter up to 6 words to *hide* amongst a block of fingerspelled images of letters. The player is to find them all.
3. The user can enter a word, which is then displayed in FS images.

 However, they make the common mistake about learning fingerspelling online, and that is to display words in fingerspelled images where the images show the FS-spelled letters from the signer's point of view, not the reader's point of view. That is, in fact, detrimental to the learning of reading FS signs; [Print a Word – BSL Fingerspelling](https://www.british-sign.co.uk/print-a-word-in-fingerspelling/).

### These Applications
This project is in its infancy, providing:
1. **Letters**
This allows one to see the FS images with their letters and see the image enlarged. This is also done on the [Signbank](https://signbank.com.au) website.
2. **Recognition**
This is a collection of 32 variations of the same game, determined by 5 pairs of radiobuttons; for one of these, there are 10 possible values for the number of alphabets used, and each of these determines sub-variations. The FS images are displayed and are shown one at a time in a large display area. The user is to select the image/letter corresponding to the displayed image. Options:
    * *Hide highlighting*: Images are bounded by a rectangle to show it has been used. Hiding this means that the user needs to choose from all the letters and/or the images, not just the unhighlighted images. The highlights still appear after making a move, as does a red boundary if in error, at the time of choosing, but would disappear once the *Next* button is pressed. This is one of the requirements of CAL, to given instant feedback.
    * *Hide Images*: When the images are hidden, i.e. no displayed, the user cannot reply on matching the displayed image with a letter image, but must know precisely the letter of the image.
    * *Have Repetitions*: The default is to play with one image for each letter of the alphabet. The user can opt to play with 1 to 10 sets of alphabets, given a maximum of 260 randomised characters to correctly select.
    * *Timed*: Having a timed game makes it a challenge to better one's previous best time. This encourages users to concentrate more on knowing the images. Users can also compare their times with others. (A future version will keep and display a leaderboard.)
    * *Randomised Images*: The display of the letters/images makes it harder to play, but also provides an environment in which users are to become more able to distinguish and read letters faster and more ably.

    All these options provide 32 combinations of increasing difficulty, enabling users to learn through play. It also provides a way for beginners to advanced fingerspellers to improve their FS in a fun way.<br><br>
    There is also a choice of seeing uppercase or lowercase letters on the images. Labelling them with uppercase is the norm, but people read faster with lowercase letters. Because lowercase letters are more-easily read, our brains have a better association with words when they are in lowercase. This means that learning to read fingerspelled words will be more effective using lowercase letters. Hence the option.<br><br>

    It is possible to stop the game, reset the options (or leave the same) and start a new game.

    There is a running score and percentage correct for each letter of the alphabet. One can see at a glance which FS images require more attention. This is another feature of good CAL software.
3. **Memory**
    Also called <i>Pairs</i> or <i>Concentration</i>, this is a classic children's
    game where players flip over two face-down cards at a time, trying to find
    matching pairs from a grid set out on a table; if they match, they keep
    the pair and go again, but if not, the cards are flipped back, and play
    passes to the next person, with the goal being to collect the most pairs
    by the end.

    <strong>Skills Developed: </strong>Focus, visual memory, concentration,  recall, and faster FS reading, as there is very little time to see the cards when they are turned over. The game of *Memory* is one of the best ways to train memorisation of visual information. Timing it, elicits a higher level of acuity and concentration.

    <strong>Options:</strong>
      * Vary the card size using a slider
      * Specify the number of pairs to play with, from 2 to 26
      * Choose the shape of the grid; e.g. for 6 pairs: 1x12, 2x6, 3x4, 4x3, 6x2, 12x1
      * Choose to have the shape determined automatically to be as wide as the screen will allow; contributes to mobile responsiveness
      * Play Solitaire or against the Computer:
        * Beginner
        * Intermediate
        * Advanced
        * Expert (algorithm from a mathematics masters thesis by [Erik Alfthan, May 21, 2007, "Optimal strategy in the childrens game Memory"](https://www.math.kth.se/xComb/x1.pdf))
      * Timing:
        * Untimed
        * Timed with the option of losing a turn or having a random turn taken for the user, with the user choosing the maximum time for the user to take a move

    <strong>Statistics:</strong> For each type of game, Moves, Matches, Accuracy, Score and time are measured and displayed after each turn. This allows the user to monitor progress and increase attention, if possible.

    <strong>Best results are recorded for each user:</strong>

        * Solitaire: Moves/Accuracy/Time
        * Computer : Score/Accuracy

4. **BlockWords**
There are many sites, magazines and apps that provide the ability to play games that involve finding words when there is a central letter and a number of words arranged around it. Many of them require the middle letter to be one of the letters in the words. The FS images are in rectangular form, and due to the license requirements are not to be modified. Hence, they have been placed in a rectangular block, and not a circle or a hexagon, etc.
<br><br>
In games similar to *BlockWords*, the goal is to find all the words that can be made from the letters, but obscure, obsolete and archaic words are included. In *BlockWords*, a blockword consists of 9 letters that can be used to make a 9-letter word. However, in BlockWords the goal is not to stress people out by pushing them to find *all* the possible words, but only 10 common words each of 3-letter, 4-letter and 5-letter words. There are 820 blockwords, and there are at least 15 common words in each of the 3 lengths of words to find, although most have at least 25 and some have over 100 words.
<br><br>
The goal is to learn to read fingerspelling, to use the images just as easily as the Roman alphabet. In CAL software, it is considered important to allow the learner to be successful, which encourages them to want to play again. The words have been filtered by the author to remove words that might offend some people, and obscure, obsolete and archaic words, and some words that are so specific to one field of knowledge; this took many hours to read and remove hundreds for words from thousands of words. The user is encouraged to find many more of the words than the minimum of 10 in each group required for success.
<br><br>
As each word is checked for being in a list, either the grid shakes ("no") or inserts the found word to a list of the same length in alphabetical order. There are also *Cancel*, *Back* and *Hint* buttons, in addition to the 'Add' button; the letters C, A, B and H may be used instead of clicking these buttons. Clicking/touching a used letter causes it to be removed from the word being built, from the position it was originally placed in.

5. **Reader**
*Reader* is a fingerspelling reading practice application designed to improve visual recognition speed and accuracy. It is akin to both software for training for speed reading and software for increasing typing speed.<br><br>
The user pastes or types in some text, presses the Start button, and starts reading and, optionally, typing what is displayed.
<br><br>
One slider can be used to alter the size of the fingerspelled images, and another slider can be used to increase or decrease the speed.
<br><br>
The exercise may be repeated as often as one likes.<br><br>
<strong>Options:</strong>
    * Display horizontally or as frames in the same place
    * Size of images
    * Speed
    * Type/Not Type

    The presentation rate can be adjusted dynamically while the images are being displayed.

6. **Posts** This app has been incorporated into the project because of a CAL requirement that learners be able to communicate with each other about anything associated with the website's learning software. There are some notable additional functionalities compared with the earlier project.<br>
    * Muting posters who one doesn't want to see in the *New* list.
    * Blocking posters whose posts one doesn't want to see at all.
    * It is possible to send a message directly to a person from a post.

7. **Messages** This app has been incorporated into the project because of a CAL requirement that learners be able to communicate with each other about anything associated with the web site learning software. There are some notable additional functionalities compared with the earlier project, which had 3 mailboxes: *Inbox*, *Sent* and *Archived*.<br>
    * New message since previous login can be seen in a *New* list
    * Muting messages from those posters not wanted in the *New* list.

## Why I built this Application Suite
1. When I was 10 years old, there was a boy the same age as me who had been given up a birth because he was stone deaf and would never be able to hear. His parents had given him up at birth to a mental institution. No-one taught him anything. He was put in with others with very limited brain functions. I was shocked and disturbed by this, as I came from a family who put their brains to good use in many and varied ways. I then read about Helen Keller, and was moved by what she was able to accomplish despite being deaf and blind.<br><br>
I decide then that I would do something for the Deaf community.
2. I once lost the ability to speak for 2 years. All I could do was whisper, and I was told I would never talk again. Only being able to whisper is like being deaf, because you can't communicate with other people; e.g. over the phone, in a noisy street, in a restaurant, etc. The reason for this was 3 operations on my larynx, removing about 70% of it due to the squamous papilloma virus expanding it, likely activated by lecturing in large lecture theatres without a PA system. The choices were: choke to death or never speak again. This is when I started learning Auslan and went to Deaf dinners so that I could communicate with people.
<br><br>
I did learn it quite well, and I advertised my private tutoring services in mathematics free to a Deaf person who wanted to attend university and was in early high school. A parent phoned me, and told me about her daughter who was in Year 8. She couldn't add 8 and 5 when we first started; this was my first question. After 18 months, she achieved her first 100%. After that, always 100% *and* the bonus questions, if any. I even taught her many mathematical signs, many of which I found in the German sign language.
3. Now that I have retired, I have time to give something to the Deaf community in a more-general way. Applications on the WWW can help millions of people, and eventually help teachers teach children at schools. This is a legacy I'd like to leave behind me.
<br><br>
On June 30th I intend my application suite to go live with many more applications and stages of learning to assist both Deaf and hearies, especially in the classroom. If it works well, I will eventually donate it to the Deaf community. It is so difficult to learn to read fingerspelled words. Therefore, CAL software provides another way to learn, through play and by having tools available at any time, especially when others are not available to practice with.
4. I have tried learning to develop applications for the WWW on no less than 3 prior occasions - and failed; once in the 1990s, once in the 2000s, and again in the 2010s. This time I have taken the Harvard online courses and have been determined to succeed. I wanted to succeed to show my children (15 and 9 years old) how to study and to persevere until the task is done - not just done, but done to 100%: 100% effort and 100% outcome.

5. I wanted to create a masterpiece of something that was difficult to develop, is unique in the world, and would be extremely useful to many people. Well, it's not a masterpiece, but certainly has some aspects of masterful software engineering. Time ran out, so most of the 30 ideas had to be postponed till this project will have been marked. A long time ago I knew 100% of the C++ programming language, but with full stack web development, I think that would never happen as it is too vast.<br><br>
This product is indeed unique in the world, and it will be extremely useful to millions of people in the world once it is published on the WWW and becomes known. It will have a large suite of drills, test and games. It will also be adapted to American Sign Language as well, and also to left-handed fingerspelling.

## Folders and Files
### Complete file structure
<details>
<summary>Project structure</summary>

```text
.
├── add_extra_words.py
├── auslan
│   ├── asgi.py
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── views.py
│   └── wsgi.py
├── data
│   ├── find_words.py
│   ├── used_words_3.txt
│   ├── used_words_4.txt
│   ├── used_words_5.txt
│   └── used_words_9.txt
├── fs
│   ├── admin.py
│   ├── apps.py
│   ├── __init__.py
│   ├── migrations
│   │   ├── 0001_initial.py
│   │   ├── 0002_memoryhighscore_min_duration.py
│   │   ├── 0003_remove_memoryhighscore_min_time.py
│   │   ├── 0004_memoryhighscore_max_accuracy.py
│   │   ├── 0005_blockword_derangedword_subword.py
│   │   ├── 0006_delete_subword.py
│   │   ├── 0007_word3_word4_word5_subword3_subword4_subword5.py
│   │   ├── 0008_alter_subword3_blockword_alter_subword4_blockword_and_more.py
│   │   ├── 0009_delete_derangedword.py
│   │   ├── 0010_memoryhighscore_min_moves.py
│   │   ├── 0011_alter_memoryhighscore_min_moves.py
│   │   ├── 0012_alter_memoryhighscore_computer_strength.py
│   │   └── __init__.py
│   ├── models.py
│   ├── static
│   │   └── fs
│   │       ├── css
│   │       │   ├── blockwords.css
│   │       │   ├── memory.css
│   │       │   └── reader.css
│   │       ├── images
│   │       │   ├── favicon.png
│   │       │   └── favicon Copyright Notice.txt
│   │       ├── js
│   │       │   ├── blockwords.js
│   │       │   ├── memory-auth.js
│   │       │   ├── memory-guest.js
│   │       │   └── reader.js
│   │       ├── letters
│   │       │   ├── blank.jpg
│   │       │   ├── letter_images_copyright_notice.txt
│   │       │   ├── th_A.jpg
│   │       │   ├── th_B.jpg
│   │       │   ├── th_C.jpg
│   │       │   ├── th_D.jpg
│   │       │   ├── th_E.jpg
│   │       │   ├── th_F.jpg
│   │       │   ├── th_G.jpg
│   │       │   ├── th_H0.jpg
│   │       │   ├── th_H1.jpg
│   │       │   ├── th_H2.jpg
│   │       │   ├── th_H3.jpg
│   │       │   ├── th_H4.jpg
│   │       │   ├── th_I.jpg
│   │       │   ├── th_J0.jpg
│   │       │   ├── th_J1.jpg
│   │       │   ├── th_J2.jpg
│   │       │   ├── th_K.jpg
│   │       │   ├── th_L.jpg
│   │       │   ├── th_M.jpg
│   │       │   ├── th_N.jpg
│   │       │   ├── th_O.jpg
│   │       │   ├── th_P.jpg
│   │       │   ├── th_Q.jpg
│   │       │   ├── th_R.jpg
│   │       │   ├── th_S.jpg
│   │       │   ├── th_T.jpg
│   │       │   ├── th_U.jpg
│   │       │   ├── th_V.jpg
│   │       │   ├── th_W.jpg
│   │       │   ├── th_X.jpg
│   │       │   ├── th_Y.jpg
│   │       │   └── th_Z.jpg
│   │       └── styles.css
│   ├── templates
│   │   └── fs
│   │       ├── blockwords.html
│   │       ├── intro.html
│   │       ├── layout.html
│   │       ├── letters.html
│   │       ├── memory.html
│   │       ├── reader.html
│   │       └── recognition.html
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── images
│   ├── BlockWords.png
│   ├── Letters.png
│   ├── Memory.png
│   ├── Reader-Horizontal-Mode-Play-Mobile.png
│   ├── Reader-Start-Screen-Mobile.png
│   ├── Reader-Vertical-Mode-Play-Mobile.png
│   ├── Recognition.png
│   └── Recognition-Start-Screen.png
├── log.txt
├── populate_blockwords.py
├── populate_user_data.py
├── README.md
├── static
│   └── base
│       └── styles.css
├── templates
│   └── base
│       ├── about.html
│       ├── help.html
│       ├── index.html
│       └── layout.html
├── user_messages
│   ├── admin.py
│   ├── apps.py
│   ├── __init__.py
│   ├── migrations
│   │   ├── 0001_initial.py
│   │   ├── 0002_initial.py
│   │   ├── 0003_remove_usermessage_binned_remove_usermessage_ignored_and_more.py
│   │   ├── 0004_alter_usermessage_recipients.py
│   │   └── __init__.py
│   ├── models.py
│   ├── static
│   │   └── user_messages
│   │       ├── inbox.js
│   │       └── styles.css
│   ├── templates
│   │   └── user_messages
│   │       └── inbox.html
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── user_posts
│   ├── admin.py
│   ├── apps.py
│   ├── __init__.py
│   ├── migrations
│   │   ├── 0001_initial.py
│   │   ├── 0002_initial.py
│   │   ├── 0003_rename_post_userpost.py
│   │   ├── 0004_mute.py
│   │   ├── 0005_block_delete_ignore.py
│   │   └── __init__.py
│   ├── models.py
│   ├── output.txt
│   ├── static
│   │   └── user_posts
│   │       └── styles.css
│   ├── templates
│   │   └── user_posts
│   │       └── index.html
│   ├── tests.py
│   ├── urls.py
│   └── views.py
└── users
    ├── admin.py
    ├── apps.py
    ├── backends.py
    ├── __init__.py
    ├── migrations
    │   ├── 0001_initial.py
    │   ├── 0002_alter_user_email.py
    │   ├── 0003_user_previous_login.py
    │   ├── 0004_alter_user_options_user_unique_lower_username_and_more.py
    │   └── __init__.py
    ├── models.py
    ├── static
    │   └── users
    │       └── styles.css
    ├── templates
    │   └── users
    │       ├── login.html
    │       ├── post_logout.html
    │       ├── register.html
    │       └── verify.html
    ├── tests.py
    ├── urls.py
    └── views.py

36 directories, 145 files
```
</details>

### Files Created
<details>
<summary>Created Files structure</summary>

```text
.
├── add_extra_words.py
├── auslan
│   ├── urls.py
│   └── views.py
├── data
│   ├── find_words.py
│   ├── used_words_3.txt
│   ├── used_words_4.txt
│   ├── used_words_5.txt
│   └── used_words_9.txt
├── fs
│   ├── admin.py
│   ├── models.py
│   ├── static
│   │   └── fs
│   │       ├── css
│   │       │   ├── blockwords.css
│   │       │   ├── memory.css
│   │       │   └── reader.css
│   │       ├── images
│   │       │   ├── favicon.png
│   │       │   └── favicon Copyright Notice.txt
│   │       ├── js
│   │       │   ├── blockwords.js
│   │       │   ├── memory-auth.js
│   │       │   ├── memory-guest.js
│   │       │   └── reader.js
│   │       ├── letters
│   │       │   ├── blank.jpg
│   │       │   ├── letter_images_copyright_notice.txt
│   │       │   ├── th_A.jpg
│   │       │   ├── th_B.jpg
│   │       │   ├── th_C.jpg
│   │       │   ├── th_D.jpg
│   │       │   ├── th_E.jpg
│   │       │   ├── th_F.jpg
│   │       │   ├── th_G.jpg
│   │       │   ├── th_H0.jpg
│   │       │   ├── th_H1.jpg
│   │       │   ├── th_H2.jpg
│   │       │   ├── th_H3.jpg
│   │       │   ├── th_H4.jpg
│   │       │   ├── th_I.jpg
│   │       │   ├── th_J0.jpg
│   │       │   ├── th_J1.jpg
│   │       │   ├── th_J2.jpg
│   │       │   ├── th_K.jpg
│   │       │   ├── th_L.jpg
│   │       │   ├── th_M.jpg
│   │       │   ├── th_N.jpg
│   │       │   ├── th_O.jpg
│   │       │   ├── th_P.jpg
│   │       │   ├── th_Q.jpg
│   │       │   ├── th_R.jpg
│   │       │   ├── th_S.jpg
│   │       │   ├── th_T.jpg
│   │       │   ├── th_U.jpg
│   │       │   ├── th_V.jpg
│   │       │   ├── th_W.jpg
│   │       │   ├── th_X.jpg
│   │       │   ├── th_Y.jpg
│   │       │   └── th_Z.jpg
│   │       └── styles.css
│   ├── templates
│   │   └── fs
│   │       ├── blockwords.html
│   │       ├── intro.html
│   │       ├── layout.html
│   │       ├── letters.html
│   │       ├── memory.html
│   │       ├── reader.html
│   │       └── recognition.html
│   ├── urls.py
│   └── views.py
├── images
│   ├── BlockWords.png
│   ├── Letters.png
│   ├── Memory.png
│   ├── Reader-Horizontal-Mode-Play-Mobile.png
│   ├── Reader-Start-Screen-Mobile.png
│   ├── Reader-Vertical-Mode-Play-Mobile.png
│   ├── Recognition.png
│   └── Recognition-Start-Screen.png
├── populate_blockwords.py
├── populate_user_data.py
├── README.md
├── static
│   └── base
│       └── styles.css
├── templates
│   └── base
│       ├── about.html
│       ├── help.html
│       ├── index.html
│       └── layout.html
├── user_messages
│   ├── admin.py
│   ├── models.py
│   ├── static
│   │   └── user_messages
│   │       ├── inbox.js
│   │       └── styles.css
│   ├── templates
│   │   └── user_messages
│   │       └── inbox.html
│   ├── urls.py
│   └── views.py
├── user_posts
│   ├── admin.py
│   ├── models.py
│   ├── static
│   │   └── user_posts
│   │       └── styles.css
│   ├── templates
│   │   └── user_posts
│   │       └── index.html
│   ├── urls.py
│   └── views.py
└── users
│   ├── admin.py
    ├── backends.py
    ├── models.py
    ├── static
    │   └── users
    │       └── styles.css
    ├── templates
    │   └── users
    │       ├── login.html
    │       ├── post_logout.html
    │       ├── register.html
    │       └── verify.html
    ├── urls.py
    └── views.py

91 files
```
</details>

### Contents of Create Files
The base folder for this project is *auslan*.

These are the contents of the created files and those that were almost entirely coded for this project. They are in the order of the previous subsection on *Files Created*.
#### add_extra_words.py
After populating the auslan database with the 9-letter words (blockwords) that have enough subwords that can be made from the letters of each blockword, it was found that some common words were not included in the subword lists. This file allows adding these to the existing tables in the database directly.
#### auslan/urls.py
This file specifies the project-wide URL patterns (`home`, `help`, `about`) and app routes for the main menus (`fs`, `user_messages`, `user_posts`, `users`).
#### auslan/views.py
This provides the views for rendering the project-wide web pages.
#### data/find_words.py
This utility file displays blockwords that contain a specified word. The words are taken from the text file *used_words_9.txt*. Letter counts are used to test for compliance.
#### data/used_words_3.txt
This file contains all the 3-letter words (subwords) that are used to populate the database.
#### data/used_words_4.txt
This file contains all the 4-letter words (subwords) that are used to populate the database.
#### data/used_words_5.txt
This file contains all the 5-letter words (subwords) that are used to populate the database.
#### data/used_words_9.txt
This file contains all the 9-letter words (subwords) that are used to populate the database.
#### fs/admin.py
In order to see the MemoryHighScore values and all words, the code in this file was created to do so.

It is necessary to import all the FS models and register them with using `auslan_admin_site`.
#### fs/models.py
This file defines the models that are used by the fingerspelling apps to get data from and save data to the PostgreSQL database.

Classes:
* MemoryHighScore: Records the best score, accuracy, duration, moves
* **BlockWord**: The 9-letter words
* **Word3**: The 3-letter words
* **Word4**: The 4-letter words
* **Word5**: The 5-letter words
* **SubWord3**: join table between BlockWord and Word3
* **SubWord4**: join table between BlockWord and Word4
* **SubWord5**: join table between BlockWord and Word5
#### fs/static/fs/css/blockwords.css
CSS specifications for the BlockWords game, including for mobile responsiveness.
#### fs/static/fs/css/memory.css
CSS specifications for the Memory game, including for mobile responsiveness.
#### fs/static/fs/css/reader.css
CSS specifications for the Reader app, including for mobile responsiveness.
#### fs/static/fs/images/favicon.png
Iconic image representing the Auslan website to help users quickly identify and recognize this site at a glance.
#### fs/static/fs/images/favicon Copyright Notice.txt
Copyright notice for favicon.png
#### fs/static/fs/js/blockwords.js
This file contains the Javascript for the BlockWords game.

The names of most of the functions are self-explanatory.

**clearBoardUI**:<br>
**format_count**: displayed right-justified<br>
**updateCounts**: of the 3-, 4- and 5-letter successes<br>
**makeTile**: creates elements for the images in a grid format with identifiers and other data like *used* and its index position in the word being built but not yet checked.<br>
**startTileAnimation**: animates letters 'H' and 'J' in the word being created.

**startMiniAnimation**: animates letters 'H' and 'J' in the images in the tables of successful word-finds.<br>
**renderFoundWord**: inserts the found word in alphabetical order in the appropriate table of found words.<br>
**onTileClick**: if used already then it is removed from the word being created (from the position it was used in), and if not used already, then it is added to the end of the found word (assuming there is room).
**rebuildSelectionUI**: redraws the images of the word being created, but is only there in case the visual word is not the same as the internally stored word.<br>
**updateCurrentSelectionUI**: if a discrepancy in the number of images in the word being created and the internal word, then rebuild the visual word. Otherwise update only changed tiles, which occurs after removing one.<br>

**clearSelection**: clear the word being created.<br>
backspaceSelection: delete the last letter of the word being created.<br>
**decodeList**: letters are sent from the server in decoded form so that users can't see the word lists in Dev Tools or by viewing the source code. This function decodes a list.<br>
**getDecodedWordLists**: gets the decoded word lists for each of the 3-, 4- and 5-letter word lists.<br>
**getCandidateLists**: checks for server data and either returns a map with 3 empty lists or gets the 3 decoded word lists.<br>
**checkAndAddSelection**: if the word being created is checked (via the *Add* button) and fails then the whole grid is shaken from side to side (indicating *unsuccessful*). Otherwise, it is rendered into the appropriate *found* table.

**animateWrong**: makes the grid shake from side to side (using CSS).<br>
**flashMessage**: a simple alert function.<br>
**maybeGoalReached**: if the goal has been reached but not exceeded in any of the 3 categories, then alert the user of *success*.<br>
**hintAction**: add a letter to the word being created, if possible, to make a word in the list of allowed words. Words are first selected from lists that are incomplete. If it is not possible to find any word then the grid is shaken from side to side.<br>
**buildBoardFromData**: using the fetched data, build the board using the random letters provided.<br>

**findUnusedTileForLetter**: find an unused tile for the letter that is passed to it.<br>
**haveInSituChars**: as part of the derangement of words, it checks if all characters of a word are not in their orignal positions.<br>
**shuffleArray**: shuffle an array in-place using the Fisher-Yates algorithm.<br>
**derangement**: return a derangement of the word passed to it.<br>
**fetchNewBlockword**: fetch a new blockword with its associated subwords, and derange the blockword.<br>

**getCachedImage**: for a given letter and suffix ('','0','1','2','3','4') get the image from the cache.<br>
**preloadImages**: and store in a cache.<br>
**loadImage**: from the cache.<br>
**document.addEventListener('keydown')**: checks if the keyboard C, A, B or H is pressed, and, if so, activates the corresponding button event: *Clear*, *Add*, *Back* or *Hint*.
**decodeWord**: decode an encoded word using a simple XOR cipher.

**makePopover**: create a bootstrap popover for an element with the id and content passed in.
#### fs/static/fs/js/memory-auth.js
This Javascript file applies to *Memory*, and is specialised for authorised users only.

**getCookie**: sometimes the CSRF cookie is more reliable than using Django's inserted value.<br>
**updateCardWidthProperty**: set the CSS variable for card width.<br>
**stopTurnTimer**: halt the turn timer for the player if on.<br>
**disableComputerStandards**: disable the radio buttons associated with the standard of computer player.<br>
**resetUnknownPairsMap**: set all pairs to be unknown.

**countUnknownLetters**: count letters not yet seen.<br>
**isLetterUnknown**:<br>
**setKnown**: sets a letter to be known when flipped.<br>
updateWhoseTurn:<br>
**setInitialTurnInfo**: if solitaire set playerTurn to true and starting position to '1'. Otherwise set to false and randomly choose position '1' or '2', respectively.<br>
**getFactorPairs**: e.g. 12 has: 1x12, 2x6, 3x4, 4x3, 6x2, 12x1

**getBestGridShape**: returns the middle factor pair for odd numbers of factors and the factor pair just to the left of middle if an even number.<br>
**updateGridShape**: updates the visual elements with the factors and the auto-selected best factor pair.<br>
**getCurrentGridShape**: return the number of rows and columns for the current grid shape.<br>
**applyShape**: set the grid to have the parameter's number of columns, each with 1 fraction of the total.<br>
**showPopup**: display a popup message for a short amount of time.

**pickBestShapeThatFits**: the main auto-fit logic, in which the number of columns of the grid that can fit across the screen is used to determine the best shape. The parameter specifies if the width is increasing or not.<br>
**slider.addEventListener("input")**: auto-picks the best shape depending on the width-slider's value.<br>
**autoShapeCB.addEventListener('change')**: auto-picks the best shape if the checkbox is changed from not checked to checked.<br>
**window.addEventListener("resize")**: auto-picks the best shape if the window width changes.<br>
**renderGrid**: renders the grid on the screen according to the size and the shape specified in the controls. It applies a colour to the back of each card.

**disableTimerSettings**: updates some controls' disabled state according to other states in order to control access to allowed controls.<br>
**enableTimerSettings**: updates some controls' disabled state according to other states in order to control access to allowed controls.<br>
**enableComputerStandards**: enables the user to be able to select radio buttons for the computer's standard.<br>
**disableComputerStandards****: prevents the user from being able to select radio buttons for the computer's standard.<br>
**modeSolitaire.addEventListener('change')**: if a game of solitaire, disables the computer standards radiobuttons and timer settings (but not all).

**modeComputer.addEventListener('change')**: if playing against the computer, enable the computer standards radiobuttons, and enable timer settings (but not all).<br>
**disableAllGameOptions**:<br>
**enableAllGameOptions**:<br>
**startBtn.addEventListener('click')**: sets up the game for playing, including changing the button's text to 'Stop', updating the grid shape and disabling all game options, but if it displays 'Stop', then do the reverse.<br>
**requestMemoryGame**: uses *fetch* to get the random letters to be used in the game and sets up the game for playing, including starting or stopping the timer according to conditions.<br>

**initGame**: completely initialises the game by defining the cards with data such as 'the card is not face up', is not matched and has not been seen yet. Counts are initialised, user options are processed, the screen stats are updated, the grid is rendered, all game options are disabled, turn info is set, and the clock is started.<br>
**animateFrames**: animates the frames for images for 'H' and 'J'.<br>
**onCardClick**: process the user's choice of card, including flipping the card, checking if a match has been found, and locking the board if necessary.<br>
**checkMatch**: check if a pair of cards is a match, updates parameters, checks if the game is over, flips the cards back if not a pair, and switches whose next move if the computer is playing.<br>
**resetTurnTimer**: stop the turn timer, create a timed event that will call *handleSlowMove()* when it times out.

**handleSlowMove**: the user either loses a turn (if that option is set) or has 2 random picks of cards (if that option is set).<br>
**flipForAuto**: the two chosen cards are flipped, animation of frames (if required) is waited till completion for each card, and match processing occurs with updated counters if a match. A completed game is checked for, and play changes to the computer if the computer is playing.<br>
**getBeginnerMove**: get a random move for the computer.<br>
**getIntermediateMove**: get a random move with 50% chance, and otherwise choose a *seen* pair at random.<br>
**getAdvancedMove**: if no cards have been seen or paired, get the beginner's move, choose a *seen* pair if possible, and try to match up the first card with a *seen* card.<br>

**getExpertMove**: get a move using the optimal method of Erik Alfthan.<br>
**computerMove**: make a computer move based on the choice of standard, keep taking moves whilst matching pairs and the game is not complete.<br>
**delay**: a small delay to give the user time to see the images.<br>
**updateStats**: display updated statistics.<br>
**isGameComplete**: returns if the game is complete.<br>
**endGame**: processes the end of a game by stopping the timer(s), updating screen content, displaying a *winner* or *draw* message, sets some variables ready for a new game, and submits the results to the server to have the user's best values updated (if improved).

**startClock**: starts the clock and displays the duration of the game.<br>
**clamp**: ensures inputs are integers and limits inputs to their *min* and *max* values.<br>
**flash**: uses CSS to indicate for a short time that the number has been altered to be valid.<br>
**input.addEventListener('change')**: for each numeric input that alters the grid shape, *clamp* the input on changing and update the grid shape.<br>
**input.addEventListener('blur')**: for each numeric input that alters the grid shape, *clamp* the input on leaving the element and update the grid shape.<br>

**makePopover**: create a bootstrap popover for an element with the id and content passed in.<br>
**shuffleArray**:shuffle an array in-place using the Fisher-Yates algorithm.<br>
**triggerHighlight**: highlights the final *score*, *moves*, *accuracy* and *time* fields if they have improved their best ever values by flashing them (using my favourite colour, *old gold* #CFB53B<br>
**submitMemoryResult**: sends the defining variables and the user-player statistics of the latest game to the server for processing. The return values will include which statistics have improved.<br>
**slider.addEventListener("input"**: upon a change in the value of the card-width slider, the CSS card width variable is updated, the image width visual display is updated, and the test image's width is updated giving a visual idea of how big or small the FS images will be when rendered. By updating the CSS variable, one effect is to update the size of the images displayed in the game grid immediately.

#### fs/static/fs/js/memory-guest.js
This Javascript file applies to *Memory*, and is specialised for guest users only. Thus, only the altered or removed functions and events will be documented here.

The purpose of the alterations is to limit the grid shape to just one shape, namely 2x2. This is to encourage users to register.

**getFactorPairs**: removed <br>
**getBestGridShape**: returns [2, 2]<br>
**updateGridShape**: sets the number of pairs to 2 and sets all correspondings to numbers corresponding to this; includes values and text content<br>
**getCurrentGridShape**: returns [2, 2]<br>
**pickBestShapeThatFits**: code removed and returns nothing

#### fs/static/fs/js/reader.js
This file contains the Javascript for the *Reader* app.

The names of some of the functions are self-explanatory.

**initButtonStates**: enable the Start button and disable the Pause, Stop and Check buttons.<br>
**updateLetterWidthValues**: when the user sets a different width for the images, this function is called to update the CSS root value for card width, and updates some global variables.<br>
**updateScrollSpeedValues**: when the user sets a different speed factor, this function is called to update the scroll speed values (in pixels per second). For the vertical display, the time displayed per image is calculated dynamically when needed.<br>
**sizeSliderEl.addEventListener("input")**: when the user adjusts the slider for image size, this even fires and calls `updateLetterWidthValues` to set dependent values.<br>
**speedSliderEl.addEventListener("input")**: when the user adjusts the slider for speed factor, this even fires and calls `updateScrollSpeedValues` to set dependent values.

**getColumnGap**: gets computed value of the actual width of the column gap between images as they scroll.<br>
**resetVerticalImage**: after hiding and unhiding an <div>, it seems that the image inside the <div> no longer is affected by the CSS for it. As a white outline of an empty image was supposed to be centred and not at the top-left of its parent container, this function is used to delete image, recreate it, and then add it as a child of <div>.<br>
**endOfReading**: update internal values and UI elements that are required at the end of a game, such as cancelling animations, clearing the set of animated letter images, setting buttons to be available/not available, re-displaying the text area and test image (used for visual resizing), resetting the vertical image's rectangular outline, and displaying an end-of-reading message.<br>
**preloadImage**: loads an image into a cache for fast access, to remove downloading the same letter image repeatedly, to centralise the animation of letter images that have frames, and separate the process of loading images from the process of displaying images.<br>
**maintainBuffer**: add as many images as is needed (and possible) in order to maintain a full buffer.

**registerAnimatedTile**: add a letter image (tile) to the set of animated tiles, including the image, letter, frames, index of the main image, the next time duration till the next frame, the first frame's duration, and the other frames' duration.<br>
**unregisterAnimatedTile**: removes a tile from the set of animated letter images.<br>
**updateAnimatedTiles**: delete tiles that are no longr connected to the page. If sufficient time has elapsed, display the next frame in the sequence for each tile, and update the next time a tile's frame is to be displayed.<br>
**ensureActualLetterAdvance**: returns the number of pixels actually advanced or to be advanced before dropping off the end, so to speak.<br>
**addBufferedTile**: for horizontal displays, gets and image from the cache, unless it's not ready yet, and adds the image to the end of the scrolling container, ensures the advance of the scrolled images, and registers animated letters 'H' and 'J'.

**feedStrip**: calls `maintainButton()`, and if the letter queue is not empty checks if there is enough room in the buffer to add another image.<br>
**consumeOffscreenTiles**: remove an image that has left the scrolling area, update the scrolling X-coordinate to compensate for the removal, and set the left position of the scrolled tiles.<br>
**animate**: this is the recursive routine that every 16 ms adjusts the left scroll value, which could change the position of the scrolling images or not, as it depends on the time since the previous check. It calls `feedStrip`, `consumeOffscreenTiles` and updateAnimatedTiles. If the reading has ended, calls `endOfReading`.<br>
**startScrolling**: initialise some variables and start the animation.<br>
**updateDuplicateCounter**: this is for vertical displays. It updates the number of duplicate letters that have occurred consecutively.

**calculateSecondsPerImage**: determines the time in seconds (as a decimal number) to display each image when displaying vertically. A straight line formula is used to specify the relationship between the speed factor (from the slider) the desired period for displaying an image.<br>

**addVerticalImage**: re-determines the variable for the vertical image element, because it was removed from the DOM and re-added, unregisters an animated tile, updates the duplicate counter, displays the image with animations if it has more than 1 frame.<br>
**feedDisplay**: feeds a letter item from the letter queue to `addVerticalImage` (see item above).<br>
**animateVertical**: this is the recursive routine that checks every 16 ms to see if it's time for a new image to be displayed.<br>
**startDisplaying**: initialise some variables, hide the duplicate count element,  and start the animation.
**queueImage**: push and source/letter pair onto the image queue.

**addCharacters**: for each character in the provided text, determines which type of letter it is and adds appropriate items to image queue. Choices are in sequence: ' ', [0-9.] (which are displayed as words), [^a-zA-Z], alphabetic (with special consideration for animated letters).<br>
**start**: check that text has been entered, initialise some variables and UI displays, populate the image queue, and either start scrolling horizontally or start displaying vertically (out of the screen).<br>
**pause**: initialise some variables and UI displays, update the text of the *Pause* button to either *Submit* or *Pause*, and restarts the appropriate animation (if un-pausing).<br>
**stop**: stops the animation, and updates variables and the UI elements, ready for either checking the typing against the text, or starting a new reading.<br>
**checkTheResults**: informs the user to check the types words. [In a future version, it is anticipated that some form of automated checking will be provided.]

**check**: calls `checkTheResults` to process the typed text, and updates some UI elements.<br>
**modeH.addEventListener("click")**: when the mode is changed to *Horizontal*, show the horizontal display area, hide vertical display area and show the test image that is used for sizine in conjuction with the size slider.<br>
**modeV.addEventListener("click")**: when the mode is changed to *Vertical*, show the vertical display area, hide horizontal display area and hide the test image that is used for sizine in conjuction with the size slider.<br>
##sourceTextEl.addEventListener("input")**: listens for a change to the source text element, and displays the number of characters to be fingerspelled.<br>
**makePopover**: create a bootstrap popover for an element with the id and content passed in.

#### fs/static/fs/letters
This folder contains the letter image files and a blank image.

The letter image files are licensed from [Signbank](https://signbank.com.au) and the license appears in full in letter_images_copyright_notice.txt.

The files are named:
```
    th_A.jpg  ... th_G.jpg
    th_H0.jpg ... th_H4.jpg
    th_I.jpg
    th_J0.jpg ... th_J2.jpg
    th_K.jpg  ... th_Z.jpg
```
where 'H' and 'J' have more than one frame because these letters use motion in real life. These letters require animation *ibidem*.

#### fs/static/styles.css
CSS for the FS Training menu, for mobile responsiveness, and conversions of the menu to a hamburger icon.

It also includes styles for the body of the FS pages and for the copyright/license that is displayed in the footer of every page that has FS images.

#### fs/templates/fs/blockwords.html
Provides the visual interface for the *BlockWords* game.

Many of the controls are self-explanatory.

**popup**: The value in playing FS BlockWords<br>
**popup**: Playing BlockWords<br>
***New* button**:<br>
***Total* span**: total number of words found.<br>
**3-letter word count (top)**: duplicate of what is placed above each of the tables of words. Used with narrow screens and appears above the grid to inform the player of their progress.

**4-letter word count (top)**: see above, but for 4-letter words<br>
**5-letter word count (top)**: see above, but for 5-letter words<br>
**3x3 grid**: displays 9 available letters for making words in a rectangular form.<br>
***Cancel* button**: clears the display of the currently-chosen letters, allowing the user to start a new word.<br>
***Add* button**: checks the currently-created word and, if valid, adds it to one of the 3 word lists.

***Back* button**: deletes the last letter picked from the currently-created word.<br>
***Hint* button**: adds a letter to the picked letters to make the prefix of a valid word, or shakes the grid if there aren't any valid words with the given prefix.<br>
#### fs/templates/fs/intro.html
Provides a page that introduces the FS website.

It provides some educational guidelines to learning to read fingerspelling and a brief description of the *drills*, *tests* and *games* provided for their benefit. Mention is also made of the posting and messaging systems.

Also included is a little about what happened when I learned Auslan and its fingerspelling, and why I think some many people give up because reading fingerspelling is so difficult. I explain how to do it better using pedagogically sound methods, which are inherently provided by these applications.

It also lists the sign languages in the world that use the 2-handed alphabet, or slight variations of it.
#### fs/templates/fs/layout.html
Provides the menu for the FS Training apps and its navbar toggler (hamburger menu).
#### fs/templates/fs/letters.html
Provides the HTML, CSS and Javascript for the *Letters* app in the one file.

##### HTML
There's a main image that's much larger than the grid of all alphabet images. The letter 'H' and 'J' have multiple frames downloaded from the server (or from the cache). There's radiobuttons for letter case. There is also a popup button that explains how to make good use of this web page.

##### CSS
The styles set the size of images, the boundaries of a selected image, the shape of the grid, the general look of the page, and the settings required for mobile reponsiveness.

##### Javascript
**getSelectedLetterCase**: gets the value from the selected radio button.<br>
**updateAllLetterCase**: updates the letters displayed in the grid with the selected letter-case.<br>
**radio.addEventListener("change")**: calls the function that will update the letter case in the grid.<br>
**letterCells.forEach(cell)**: for each letter image (cell) set up what to do if clicked, namely clear all previous highlights and highlight the cell clicked. The image is shown in the large dispay area and animated if required.<br>
**startLoopingAnimation**: shows all the frames of the image of 'H' and 'J' and sets it up to repeat the animations by looping.

**["H", "J"].forEach(letter)**: get the details of letter to be animated and calls the looping animation function.<br>
**makePopover**: create a bootstrap popover for an element with the id and content passed in.
#### fs/templates/fs/memory.html
Provides a page that displays the *Memory* game and all the inputs and outputs that go to help it be such a great game.

**popover button**: The Value in Playing.<br>
**popover button**: Best Scores and Times.<br>
**slider**: for the card size.<br>
**test image**: to show the user the actual size of the cards before starting a game.<br>
**pair-count**: number of pairs to be used in the next game.

**auto-shape checkbox**: allows the user to choose between auto-shaping the game grid or manually shaping it.<br>
**grid-shape selector**: the user can choose from the possible shapes if the user selected manual shaping.<br>
**mode radiobuttons**: the user can choose to play solitaire or against the computer.<br>
**computer-standard radiobuttons**: Beginner/Intermediate/Advanced/Expert.<br>
**timer radiobuttons**: the user can choose from Untimed/Lose Turn/Random Turn.

**time per move input**: the number of seconds the user is allowed to take for a move before the turn is taken automatically (at random).<br>
***Start* button**:<br>
**current turn**: Player/Computer<br>
**statistics labels**: Matches/Score/Moves/Accuracy/Time<br>
**best statistics labels**: High Score/Low Moves/High Accuracy/Fastest Time.

**popup label**: indicates that an automatic change of shape has occurred.<br>

#### fs/templates/fs/reader.html
Provides the HTML for the *Reader* app.

**source text**: field for entering the text to be fingerspelled, entered via pasting text or typing it in.<br>
**popover button**: information on getting started.<br>
**letter count**: displays the number of characters typed into or pasted into the text area for converting to displayed fingerspelling signs.<br>
**mode buttons**: for choosing *horizontal* or *vertical* display of images.<br>
**width slider**: for specifying the width in 48 - 192 pixels.

**speed slider**: for specifying the speed factor in 10 - 500, which is used differently in each mode.<br>
**test image**: a visual representation of what the size the images will actually be based on the width slider's value.<br>
**scroll strip**: a <div> that is used to scroll the letter-images from right to left, starting at the far right, off-screen.<br>
**vertical image**: a single image that will display the letter-images one at a time.<br>
**4 buttons to control the reading process**: Start, Pause, Stop, Check.

**typing area**: field for the user to type what they read, if they want to check it after the text has been displayed in its entirety.<br>

#### fs/templates/fs/recognition.html
Provides the HTML, CSS and Javascript for the *Recognition* app in the one file.

##### HTML
**main image**: displays an image to be identified.<br>
***Start* button**:<br>
**popover button**: Displaying the next image.<br>
**instruction label**: Choose the matching image.<br>
**Game Over paragraph**: visible when the game has ended.

***Play again* button**:<br>
**letter grid**: FS images for all letters of the alphabet, used for selecting.<br>
**exercise number input**: 1..32 for the choice of game type.<br>
**popover button**: Selecting which exercise.<br>
**login required message**: Login required to use these options.

**randomise radiobuttons**: randomise the position of the letter images in the grid.<br>
**popover button**: random or alphabetical order.<br>
**timed radiobuttons**: timed/untimed<br>
**popover button**: Timed or untimed?<br>
**have repetitions radiobuttons**: include multiple copies of the alphabet or just 1.

**number of repetitions input**: up to 10 copies of the alphabet, which would be 260 letters.<br>
**popover button**: Choose 1 or more alphabets.<br>
**hide images radiobuttons**: hide or display the images, leaving just the letters.<br>
**popover button**: Hide or display images?<br>
**hide highlighting radio buttons**: hide or display bounding rectangles around an image once picked.

**popover button**: To highlight or not to highlight, ...<br>
**results table**: This is an elaborate table that shows the number of correct, incorrect and percent of picks. It is updated dynamically. Totals for correct and incorrect are displayed at the bottom of the table along with the overall percentage of correct picks.<br>
##### CSS

##### Javascript
Most of the functions and events are self-explanatory.

**setTimerDisplayElements**: displays or hides the UI timer.<br>
**setHasRepetitionsElements**: displays or hides the input box for the number of repetitions.<br>
**resetMainImage**: removes and re-displays the empty main image so that the small white image does not appear when no letter image is displayed.<br>
**setImageDisplayElements**: display or hide the images in the grid.<br>
**setHideHighlightsRadio**: sets/unsets the radiobutton for hiding highlights

**startTimer**: also update displays.<br>
**stopTimer**:<br>
**shuffleArray**: Fisher–Yates shuffle.<br>
** render(array)**: display the grid, clearing first.<br>
**setExerciseNumber**: convert the 5 boolean radiobutton decisions to a single 5-bit number and add 1. Set the displayed value.

**setIsRandomArray**: if is to be a randomised grid, randomise the letters and render the grid. Otherwise, render the original, alphabetical order.<br>
**radio.addEventListener("change")**: for the randomisation radiobuttons, setIsRandomArray and set the exercise number.<br>
**updateRadioButtons**: if the user selects a game type number using the input field, extract the bit values from the number after subtracting 1, and then set both internal and external values for each option.<br>
**updateRadioButtons**: before displaying a new letter, it is necessary to stop the displayed letter from animating, if it is animating.<br>
**resetCounters**: reset the number of correct and incorrect scores for each letter, and update the display in the results table. Also reset the totals.

**getRandomAlphabetOrder**: returns the numbers of the letters in random order; A=0, B=1, etc.<br>
**displayLetter**: display the letter to be identified, where the letter is loaded from the cache or the server.Animations are started if the letters have them. The container is used to get the img element because it was removed from and added to the DOM. This was to display an outlined rectangle (the size of an image) in the main image display area. Otherwise there was a small white rectangle displayed in the top left corner.<br>
**startLoopingAnimation**: generic function to start a looping animation on a given <img><br>
**stopThumbnailAnimation**: stop animation of a letter.<br>
**displayFSLetter**: choose one of the letters using the randomly-ordered sequence, continuing from the previously-chosen letters (using post incrementation [a++]). Return the letter and the random image.

**clearHighlightsAndLetters**: this can include the correct answers or not. The main image is cleared if a parameter is set to do so.<br>
**stopBtn.addEventListener('click')**: halts the process and sets it up to start a new game. Hides the stop button, hides the play instruction, shows the entire start container, displays all the options, clears the highlights and letters, displays all the letter images, sets all characters to *white*, and, finally, resets the score counters.<br>
**startBtn.addEventListener('click')**: if this button has the text *Start* then, taking into account all the options selected, set up the variables and the elements on the page, and start the game. If this button displays *Next*, clear highlights and letters as required, and then display the instruction and display the next random letter. Otherwise the button has the text *Play*, which is not seen, so the instruction becomes hidden, the button displays *Next*, and the *Start* button is re-displayed.<br>
**document.addEventListener('keydown')**: if the key is a space, the code is 'Space' or the keyCode is 32, then prevent scrolling the screen. If the *Start* button's text is 'Next', then generate a click() event programmatically.<br>
**cell.addEventListener('click')**: every cell in the grid has this event attached to it. If the cell is clicked when it is the user's time to pick an image/letter from the grid, then process that pick. This includes testing for correct/incorrect and testng for the end of the game. Scores are also updated accordingly.

**playAgainBtn.addEventListener('click')**: set up the UI for a new game.<br>
**updateAllLetterCase**: set the case of letters on all images to the selected case.<br>
**radio.addEventListener("change")**: update letter-case when the radiobutton choice is changed.<br>
**updateTimed**: update the timer display elements.<br>
**radio.addEventListener("change")**: update whether timed or not, and update the exercise number both internally and on the page.

**updateRepetitions**:<br>
**radio.addEventListener("change")**: update whether repetitions are used or not, and update the exercise number both internally and on the page.<br>
**updateHideImages**:<br>
**radio.addEventListener("change")**: update whether images are hidden or not, and update the exercise number both internally and on the page.<br>
**radio.addEventListener("change"**: update whether highlights are hidden or not, and update the exercise number both internally and on the page.

**getSelectedLetterCase**: from the radiobuttons.<br>
**updateScore**: for the given letter, increment scores for correct or wrong, update the totals, and display all on the page.<br>
**clamp**: ensures inputs are integers and limits inputs to their *min* and *max* values.<br>
**flash**: uses CSS to indicate for a short time that the number has been altered to be valid.<br>
**input.addEventListener('input'), ('change') or 'blur'**: clamp the input and if input is *exercise number*, then update the game options radiobuttons.

**makePopover**: create a bootstrap popover for an element with the id and content passed in.

There are 7 popover messages defined at the end of scripting.

#### fs/urls.py
This file specifies the fingerspelling (FS) app's URL patterns (`letters`, `recognition`, `memory`, `memory/new`, `save_memory_result`, `blockwords`, `blockword/random`, `reader`). The 2nd-to-last one is about getting a random blockword.
#### fs/views.py
The views closely relate to the fs/urls mentioned in the previous item.

**intro**: render the introduction page.<br>
**get_letters**: an internal function that adds the letters to a dictionary, including the frames for 'H' and 'J' as lists.<br>
**get_subset_of_letters**: gets the filenames (without extensions) for the subset of letters passed in.<br>
**letters**: gets all the letters and renders the *Letters* page, passing the letters.<br>
**recognition**: gets all the letters and renders the *Recognition* page, passing the letters.

**memory_new**: Returns a shuffled array of card objects for the memory game, with letters randomly chosen according to how many pairs are requested.<br>
**save_memory_result**: Save the results of the game if any relevant statistics have improved.<br>
**encode_word**: uses and XOR cipher to hide the words from users.<br>
**blockwords**: render the *BlockWords* web page, passing a single blockword and its corresponding subwords.<br>
**reader**: render the *Reader* web page.
#### images/BlockWords.png
An image of the *BlockWords* page that is included in this README document.
#### images/Letters.png
An image of the *Letters* page that is included in this README document.
#### images/Memory.png
An image of the *Memory* page that is included in this README document.
#### images/Reader-Horizontal-Mode-Play_Mobile.png
An image of the *Reader* in horizontal mode with some large images scrolling through to the left. This is in narrow-screen mode.
#### images/Reader-Start-Screen_Mobile.png
An image of the *Reader* as it initially displays. This is in narrow-screen mode.
#### images/Reader-Vertical-Mode-Play_Mobile.png
An image of the *Reader* in vertical mode with a single letter-image displayed. This is in narrow-screen mode.
#### images/Recognition.png
An image of the *Recognition* playing page that is included in this README document.
#### images/Recognition-Start-Screen.png
An image of the *Recognition* starting page that is included in this README document.
#### populate_blockwords.py
This file provides the initialisation code required to populate the database in a normalised fashion.

It is necessary for populating the database after creating a new, empty database.

The populating function uses bulk saving to speed up the process because there are so many records to post.

This file is what the marker will use to populate the database with the required words.

**get_words**: reads in the words given the file_path (including filename).<br>
**read_in_the_words**: calls `get_words` (see previous item) to get the words of lengths 3, 4, 5 and 9.<br>
**save_words_3**: saves the 3-letter words in the database.<br>
**save_words_4**: saves the 4-letter words in the database.<br>
**save_words_5**: saves the 5-letter words in the database.

**save_words_9**: saves the 9-letter words in the database.<br>
**display_saved_words3**: displays the 3-letter words as found in the database.<br>
**display_saved_words4**: displays the 4-letter words as found in the database.<br>
**display_saved_words5**: displays the 5-letter words as found in the database.<br> <br>
**display_saved_words_9**: displays the 9-letter words as found in the database.

**letter_counts**: for the word passed to this function, it returns a dictionary containing keys being the alphabet and the values being the number of each letter are in the word passed in.<br>
**is_A_le_B**: uses the letter-count dictionaries of 2 words passed in, namely counts_A and counts_B, and returns True if all counts of A are <= all counts of B, otherwise False.<br>
**display_subwords**: displays all the subwords of a 9-letter blockword.<br>
**save_all_subwords**: A *subword* is a word from a list that can be made from the letters of a blockword.

The subwords are stored as a join table between *blockwords* and *words*.

This is optimised: it preloads all subwords into fast lookup dictionaries and uses bulk saving (saving 2000 records per bulk_create).<br>
**display_saved_subwords**: for the blockword pass in, displays the subwords as found in the database.
#### populate_user_data
**populate_fs**: first deletes all current subwords in the database, then all words, then all blockwords.

Then:<br>
1. it saves the 3-, 4- and 5-letters words;
2. it saves the blockwords (the 9-letter words;
3. it saves all the subwords.<br>

**display_words_containing**: display all the *blockwords* whose subwords include the word passed in (more-efficiently that scanning a large list).<br>
**display_counts_of_saved_words**: display counts of all words, subwords and blockwords in the database. This is to allow a simple check of the successful initialisation of the database with the word data.<br>
**check_counts_of_saved_words**: at the end of the process, a test is made to see if the counts of records in the tables agrees with the known counts, with a suitable message provided to indicate success or failure.
#### populate_user_data.py
In order to save the markers a long time populating the database with data, 25 users and a large number of Posts and Messages has been provided with some being *liked*, *muted*, *archived*, *blocked* and *followed*.

It starts by emptying the join tables related to this data and then deletes unwanted users, keeping the superuser 'su' and 'fsadmin', if it is there.
#### README.md
This README document.
#### static/base/styles.css
CSS for the main menu, for mobile responsiveness, and conversions of the menu to a hamburger icon.
#### templates/base/about.html
**Version**: 1.0<br>
**Copyright**: Notice of copyright by the author for his contributions.<br>
**Licensing**: For the fingerspelling images: CC BY-NC-ND 4.0<br>
**Attribution**: author and associates, with web link<br>
**What's new in this version**: summary of what has been added to Version 1.00, which is the same as described on the *Help* page because this is the first version. It is in a hierarchical structure.
#### templates/base/help.html
The popovers on each app's web pages provided more-detailed descriptions of how to use each page than on this help page, but this page is a good central location for how to use them.

This page also describes what the limitations are if the user is not logged in.
#### templates/base/index.html
This is the opening web page. It provides a *welcome* heading and a few lines to describe the product.

#### templates/base/layout.html
This is the base layout that other layouts inherit from.

First it tests if Javascript is enabled - if not, then a message appears requesting the user to enable it in order to use this website.

It provides the logo (favicon), and the main menu and a popover that provides the login name of the user (if logged in). There is a hamburger button for use on narrow screens.

Menu items (LHS): FS, Posts, Messages, Admin, Help, About.
Menu items (RHS): Login, Register.

There is a small amount of script to handle the *popover* and highlighting the active menu item.
#### user_messages/admin.py
In order to see the UserMessage values, the code in this file was created to do so. It also provides search fields and filter fields.

In order to see the recipients, a helper method was required.

**display_recipients**: join all recipient usernames wiht commas, so that they appear as a single column in *admin*.
#### user_messages/models.py
This file defines the models that are used by the *User Messages* app to store user messages and users who are muted by the user and those users who have muted the user.

Classes:
* MemoryHighScore: Records the best score, accuracy, duration, moves
* **BlockWord**: The 9-letter words
* **Word3**: The 3-letter words
* **Word4**: The 4-letter words
* **Word5**: The 5-letter words
* **SubWord3**: join table between BlockWord and Word3
* **SubWord4**: join table between BlockWord and Word4
* **SubWord5**: join table between BlockWord and Word5
#### user_messages/static/user_messages/inbox.js
Javascript for the user_messages page.

Most of the functions and events are self-explanatory.

**nearBottomOfPage**:<br>
**document.addEventListener("click")**: clicking on a menu item cause the corresponding page's messagebox to be loaded: *New*, *Inbox", "Sent", "Archived", "Muted", "Compose"<br>
**highlightMenuChoice**:<br>
**showNotification**: displays the message.<br>
**noteElement.addEventListener("animationend")**: hide the message and animate its removal.
**form.addEventListener('submit')**: posts a new message to the recipients with the specified subject and body. Shows a *success* message or an *error* message, and re-enables the *Submit* button.<br>
**document.addEventListener("click")**: if for the *Reply* or *Reply All* buttons, call `compose_message` with the required parameters. [This was complex to solve.] It was required because of a problem passing raw text from the 'body' that contained newlines. The reply button is added dynamically to a message, so the button does not exist after loading the DOM. Therefore the button must be searched for amongst all buttons. Calls `compose_message` with the required parameters.

If the *Mute* or *Unmute* button is clicked the user who made the post is *muted* or *unmuted*, respectively, using `fetch` and checking responses. A message is provide if users try to *mute* themselves.<br>
**clearViews**: clear messages from *messages-view*, *message-view* and *muted-view*.<br>
**compose_message**: set all the field values and make the first editable field active.<br>
**archive**: send the archive/unarchive request to the server and receive a JSON response.

**deleteMessage**:<br>
**load_messagebox**: load all the messages from the server for the specified messagebox (menu). Add the HTML to display all the information.<br>
**prefixLines**: add the *prefix* parameter to each line of text.<br>
**load_message**: fetch a message given its message id from the server. If the user is *muted*, then include a button for *Reply* with the message fields stored as `data-*` as properties of the button. Similarly for *Reply All*, with the added field value for `is_muted`. Before sending the request to the server, replace all '];'\n' with "<br>".<br>
**load_muted_users**: include a button to *unmute* the muted user.

#### user_messages/static/user_messages/styles.css
CSS specifications for the User Messages app, including for mobile responsiveness.
#### user_messages/templates/user_messages/inbox.html
This page is used for all of the functionality of the messaging app. It's menu has *New*, *Inbox*, *Compose*, *Sent*, *Archived*, *Muted*. There is a hamburger menu for use on narrow screens. There is an area (<div>) for each of *messages*, *message* and *muted*. There is form for sending messages.

A small amount of *Javascript* is also present.<br>
**getCookie**: sometimes the CSRF cookie is more reliable than using Django's inserted value.<br>
**currentUserId**: is set to the Django-provided `request.user.id`.

#### user_messages/urls.py
This file specifies the *User Messages* app's URL patterns ("", `send`, `get_message/<int:message_id>`, `get_messages/<str:messagebox>`, `get_muted_users`).

#### user_messages/views.py
The views closely relate to the user_messages/urls mentioned in the previous item.

**index**: render *inbox.html* or redirect to the login page.<br>
**send**: save a message to the PostgreSQL database, after several checks for validity.<br>
**get_messages**: get all the messages from the server for the requested messagebox, and send them to the client, ordered latest first.<br>
**get_message**: get a specified message (via `message_id`) from the server and send all information about it to the client.<br>
**mute**: mutes the user with the specified `user_id`.

**get_muted_users**: get all users who are currently muted by the current user, and send them to the client.<br>
#### user_posts/admin.py
In order to see the UserPost values, the code in this file was created to do so. It also provides search fields and filter fields.
#### user_posts/models.py
This file defines the models that are used by the *User Posts* app to get data from and save data to the PostgreSQL database.
#### user_posts/static/user_posts/styles.css
CSS specifications for the *User Posts* app, including for mobile responsiveness.
#### user_posts/templates/user_posts/index.html
This page is used for all of the functionality of the menu items for the posting app. It's menu has *Timeline*, *New*, *All Posts*, *Following*, *Multed*, *Blocked*. There is a hamburger menu for use on narrow screens. There is an area (<div>) for each of *messages*, *message* and *muted*. There is form for sending messages.

For the *Timeline* posts the numbers of *Following* and *Followers* appears at the top of the page, just below the *User Posts* menu. There is a notification line and a result line. There is a text area for submitting a post. Then there is a place for the posts.

In the footer is a collection of pagination buttons. The method of deciding how many buttons are displayed was designed completely by me, and the code for the buttons was also completely written by me.

There is a *Compose* area which allows compostion and submission of said composition.

If displaying *muted* users or *blocked* users, there are 2 separate areas for displaying them.

`Javascript` is included.

**getCookie**: sometimes the CSRF cookie is more reliable than using Django's inserted value.<br>
**showNotification**: display a notification for a brief time.<br>
**noteElement.addEventListener("animationend")**: at the end of animation of a notification, hide the notice.<br>
**textElement.addEventListener("input")**: adjust the height to accommodate the height of the text field of posts.<br>
**update_visual_follows**: update the display of *following* according to the parameter.

**autoExpand**: auto-size the text area as lines are added or removed.<br>
**document.addEventListener("click")**: if clicked on the *like* button: if a post is liked then change it to unliked and vice versa. Update the database for the current user and the selected post and the web page.

If clicked on the *Send* button: compose a message with the click-target's dataset field values.

if clicked on the *Follow* button: if already following then unfollow and vice versa. Update the database and the screen.

If clicked on the *Mute* or *Unmute* button: mute/unmute the user accordingly by updating the database and the web page. Reload the page.

If clicked on the *Block* or *Unblock* button: block/unblock the user accordingly by updating the database and the web page. Reload the page.

If clicked on the *Edit* button: set up the screen for editing and post the edited item to the server.

If clicked on the *Cancel* button: replace the text area with the original text and remove both the *Cancel* and *Save* buttons, and re-enable the *Edit* button.

If clicked on the *Save* button: save the text in the text area to the database.

If clicked on the *submit-create* button: save the entered text to the database, show a result message, and re-load posts.

If clicked on the *submit-compose* button: update the database with the new post.<br>
**selectChosenMenuItem**: highlight the selected menu item using CSS.<br>
**processFollows**: gets the counts of *Following* and *Followers* and displays them on the web page.<br>
**item.addEventListener('click')**: loads the data for the menu item that was clicked, sets up the web page accordingly, and hightlights the chosen menu item.

**getButtonNumbers**: returns an array of the number of pagination buttons to use based on the number of pages and which page is currently displayed.<br>
**updatePaginationControls**: given which menu, the page, the number of total pages, and whether there are previous and/or next pages, the appropriate page of posts is loaded.<br>
**load_posts**: does the physical loading of posts by sending the current menu and current page to the server.

Displays whether liked or not and provides the number of likes.

A *follow* button is provided.

A *mute* button is provided.

A *block* button is provided.

If displaying the *Timeline*, *All Posts* or *Following*, a button is added to the post that allows sending a *message* to the poster. This message can be read inside the *Messages* app.

An *Edit* button is provided for each post, if the user is logged in.<br>
**load_muted_users**: includes a button for unmuting.<br>
**load_blocked_users**: includes a button for unblocking.<br>
**compose_message**: can be to multiple recipients using their usernames. Messages are sent internally and read via the *Messages* app.
#### user_posts/urls.py
This file specifies the *User Posts* app's URL patterns ("", `create`, `get_posts/<str:chosenPosts>`, `like/<int:post_id>`, `follow/<int:user_id>`, `get_follow_counts`, `post_edit/<int:post_id>`, `mute/<int:user_id>`, `get_muted_users`, `block/<int:user_id>`, `get_blocked_users`).

#### user_posts/views.py
The views closely relate to the user_posts/urls mentioned in the previous item.

**index**: render the only page for this app.<br>
**create**: create a new *Post* record in the database from the text that was sent and the current user.<br>
**get_posts**: return the chosen menu's posts.

If *New*: If logged in, then preclude posts from those this user has muted, preclude the blocked users and preclude those from users who have blocked the current user.

If *All Posts*: preclude the blocked users and preclude those from users who have blocked the current user.

If *Timeline*: return all the user's own posts.

If *Following*: return the posts from users the current user is following.

Django paginator controls are incorporated in this function.<br>
**like**: update that specified post is being liked/unliked by the current user. Being liked or unliked is determined by getting the value from JSON data passed by the client.<br>
**follow**: update that specified post is being followed/unfollowed by the current user. Being followed or unfollowed is determined by getting the value from JSON data passed by the client.

**get_follow_counts**: both counts (following and followers) are returned to the client.<br>
**post_edit**: update the user's edited text.<br>
**mute**: mute the user specified.<br>
**get_muted_users**:<br>
**block**: block the user specified.

**get_blocked_users**:<br>
#### users/backends.py
This was added in order to use case-insensitive usernames for the User model. It is required because of the need to have unique usernames. "John32" is not a different person to "JOHN32".

**class CaseInsensitiveUsernameBackend(ModelBackend)**: compare lowercase usernames and check passwords with the lowercase version. It required adding the following to settng.py:
```
AUTHENTICATION_BACKENDS = [
    'users.backends.CaseInsensitiveUsernameBackend',
]
```
**authenticate**: the user authentication over-ride function in the class mentioned in the previous item.<br>
#### users/admin.py
In order to see the User values, the code in this file was created to do so. It also provides search fields and editable fields. It also provides fieldsets for use when the admin user (superuser) wishes to edit them in the form displayed when one clicks on a user for editing.

Also registers a group admin class and a user admin class.
#### users/models.py
This file defines the models that are used by the *Users* app to get user data from and save user data to the PostgreSQL database.

`class User(AbstractUser)` allowed the addition of `email` being unique, `is_verified` for determining if the user has entered the verfication code to the supplied email address, and `previous_login` for use in determining which posts are new and which messages have appeared since the previous login.

It also enables setting up unique constraints on username and email address.
#### users/static/users/styles.css
CSS specifications for the Users app, including for mobile responsiveness.
#### users/templates/users/login.html
Page with a form for getting the user's username and password. Renders the *next* page that was passed to it.
#### users/templates/users/post_logout.html
An intermediary file to ensure that the *next* page is correct page to be rendered. It has a very simple message about redirecting. Renders the *next* page that was passed to it.
#### users/templates/users/register.html
Page with a form for getting the user's email address, first and last names, username, password and confirmation passord. It then sends a 6-digit code to the new user's email address (as entered). It then renders a verification page and awaits the entry of the code (within 10 minutes).

However, as this is not a live site, these codes are sent to the TERMINAL of the GitHub Codespaces bash terminal via the web page<br> `reimagined-space-invention-...56.github.dev`. Enter this code into the input field of the verification page that appears after the registration page.
#### users/templates/users/verify.html
Form for entering the verification code that was sent to the email address entered on the registration screen.
#### users/urls.py
This file specifies the *Users* app's URL patterns ("", `admin`, `login`, `logout`, `register`, `verify`).
#### users/views.py
The views closely relate to the users/urls mentioned in the previous item.

**login_view**: includes preventing open redirect attacks by testing for allowed host and scheme.<br>
**logout_view**:<br>
**register**:<br>
**verify**: this verifies that the code entered by the user is the same as the code sent to the registrant's email address.

However, as this is not a live site, these codes are sent to the TERMINAL of the GitHub Codespaces bash terminal via the web page<br> `reimagined-space-invention-...56.github.dev`. Enter this code into the input field of the verification page that appears after the registration page.

## Running the Application Suite
This takes place in a GitHub Codespaces *bash* terminal.

1. Create a project folder called `auslan` in the workspace root.
2. Change directory to this folder: `cd auslan`.
3. Create a virtual environment:<br>
`python3 -m venv venv`.
4. Activate the virtual environment.<br>
`source venv/bin/activate`<br>
(assuming your environment is named venv)
5. Ensure *Python* has the required packages installed by running the following command from the *auslan* folder:<br>
`pip install -r requirements.txt`<br><br>
These are the main packages required for this project are as follows, but the `pip freeze` produced a much longer list.<br>
```
Django==5.2.7
psycopg[binary]==3.2.10
```
Standard library modules used (so not installed by `pip`.): os, sys, random, pathlib, datetime, base64 and json.
6. Start the database server:<br>
`sudo service postgresql start`
7. Create a PostgreSQL database and owner role with a database access password. Here is one way to do it.<br><br>Replace DB_USER and DB_PASS with your chosen values. The suggested name is `auslan_db`, but if you choose a different name for the database, you must update it in the the script below and in `settings.py` (see below for details).<br>

⚠️ If the database or user already exists, these commands will fail.
This is expected behaviour.
```
#!/bin/bash

DB_NAME="auslan_db"
DB_USER="youruser"
DB_PASS="yourpassword"

# Create a new PostgreSQL user with a password
# The -c flag runs a single SQL command
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';"

# Create a new database
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Grant all privileges on the database to the new user
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

echo "PostgreSQL user '$DB_USER' and database '$DB_NAME' created with access granted."
```
How to Use the Script<br>
**Save the script**: Save the code above as a file (e.g., `create_db_user.sh`).<br>
**Make it executable**: Run `chmod +x create_db_user.sh` in your terminal.<br>
**Run the script**: Execute the script using `./create_db_user.sh`.


This is to be updated in `settings.py`:
```
DATABASES = {
    'default': {
        'ENGINE'  : 'django.db.backends.postgresql',
        'NAME'    : 'auslan_db'        , # database name
        'USER'    : '' , # PostgreSQL username
        'PASSWORD': ''   , # PostgreSQL password
        'HOST'    : 'localhost'        , # or IP address / domain
        'PORT'    : '5432'             , # default PostgreSQL port
    }
}
```
8. Copy all the code to the base folder. See the complete tree structure shown near the beginning of this document to be certain of what it should look like.<br><br>The folder must contain `manage.py` at its top level.
9. Update `settings.py` with the database access username and password, if you haven't already done it in a previous step.
10. In `settings.py` update CSRF_TRUSTED_ORIGINS according to your own setup. Currently it is:<br>
```
CSRF_TRUSTED_ORIGINS = [
    "https://127.0.0.1:8000",
    "https://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
]
```
11. Create the tables by running: `python3 manage.py migrate`
12. Create the Django superuser `su` using:<br>`python3 manage.py createsuperuser`<br>It **must** be `su` as this is assumed in the program. (without quotation marks).
13. Run `python3 manage.py check` to check the configuration.
14. Populate the database with the *blockwords*, *words* and *subwords* by running:<br>`python3 populate_blockwords.py`.
15. Populate the database with initial user data:<br>`python3 populate_user_data.py`.<br><br>The program only removes non-superuser Django application users. PostgreSQL database roles and the database owner are not affected.
16. Run the Application Suite with:<br>`python3 manage.py runserver`.<br><br> If the main web page doesn't automatically appear, switch to the *PORTS* window and right-click on *port 8000* and choose the menu option *Open in Browser*.
17. Usernames are A,B,C,D,E,F (case is ignored). Passwords are a,b,c,d,e,f (case matters).<br><br>Login as `su` to see the *Django Admin* menu option. It is best to **right-click** on it and choose to display the **Django Admin** page in a new tab.
18. Use the menu systems to navigate the pages, and use the little blue buttons with a white *i* on them to get some information about using the interface.
19. Registering a new user is through the *Register* link that appears when no user is logged in. After filling in a form and clicking on the *Register* button, a 6-digit code to the new user's email address as entered. It then renders a verification page and awaits the entry of the code (within 10 minutes). However, as this is not a live site, these codes are sent to the TERMINAL of the GitHub Codespaces bash terminal via the web page<br> `reimagined-space-invention-...56.github.dev`. Enter this code into the input field of the verification page that appears after the registration page.

**Note**: If the database needs to be reset, delete all user-related data by running<br>`python3 populate_user_data.py`,<br>which safely clears dependent tables before re-populating.
## My Review of Application Suite
Brilliant, powerful, and of tremendous benefit to learners of the BANZSL 2-Handed alphabet. As a result of using it during development for testing purposes and then as my preferred games to play on the WWW, I have begun to read fingerspelled words as *words*, not a sequence of images that must be converted to English letters and then formed into a word. I am truly seeing them as *words*. It's amazing. I tried learning to read fingerspelling this way for 5 years at TAFE (Tertiary and Further Education) in a Certificates II and III of Auslan.

*BlockWords* is a masterpiece of software engineering that will provide people who have the desire to learn fingerspelling with a game that is fun and challenging to play, whilst at the same time helping them learn, like a child learns, to learn by play without consciously trying to memorise word-sequences. Not only that, Deaf people could also play these games using their native fingerspelling.

It can be done any time of day. The game provides instant feedback (a requirement of CAL software), and a wide variety of combinations of letters from which to create words. Just 9 letters are available for making the goal of 10 words of each of 3, 4 and 5 letters. The concentrated repetition that occurs with such a high rate, eyes darting from one letter to another to another etc., enable learning at such a fast rate. I would say without exaggeration, that it is 100 times more effective than watching 10 words being fingerspelled in 15 minutes, which is what was done at the beginning of lessons in a classroom.

*Memory* is also a work of science and art. As one tries to match up pairs of FS images by recalling where they are placed, recognition of the individual symbols becomes automatic. One does indeed commit the images of FS letters to *memory* without even thinking about it. Once is focussed on pairing them up. Deaf people can now enjoy a game that uses their own alphabet.

*Recognition* is another excellent way to recognise individual letters instantly as one searches for the image in the grid for the one letter that is displayed. Having 32 levels of difficulty provides a graduation of challenges for people to ascend as they become more confident.

*Reader* is a stellar app that is a phenomenon of outstanding quality used to create an outcome for people using a very simple idea. In the late 1990s, I met a person who had created an app in the late 1980's using the normal alphabetic letters to train people to speed read. His sales averaged 10/week world-wide for more than a decade, generating about 40% of his regular income at first, and then this percentage decreased gradually, but provided a nice steady income. It took him less than a day to create it; I recall he mentioned 4 hours.

This app is not the ultimate in what can be achieved, but to do better, one would have every single word fingerspelled by a native signer and recorded. Let's say 140,000 words at 5 seconds each, making 700,000 videos, each taking up 1 MB of disk space. That would require 700,000,000,000 bytes of disk space, i.e. 700 GB. This would cost around $100/month. Not too bad really, but the *Reader* app requires only the storage of the FS letter-images requires about 100 KB. Also, it would be difficult, though nigh impossible, to imagine who would make the 700,000 videos.

As a requirement of Computer Aided Learning software, there should be an ability of users to communicate with each other about the applications, their uses, and learning the knowledge aspired to using the software. As such, the *Posting* and *Messaging* applications have been added. These two applications were taken and adapted from earlier projects - but have been added to significantly. One can now *mute* and *block* other users. There is also infinite scrolling in one them and a more-advanced paging system with page numbers in the other. This is a valuable addition to the FS apps.
## Development Time
It took about 650 hours to develop this Application Suite, which is separate from the time spent creating the first versions of *Posting* and *Messaging* (previously called *Network*).
## Development Learning
There are so many new aspects of accessing databases with Django, writing Javascript and creating CSS, especially for mobile responsiveness, that I have read well in excess of 1,000 pages of manuals and web pages.
## Development Management
The documentation tool used to organise and manage the production of this Application Suite is called *Treepad Lite*. As of writing this document, it currently has over 500 nodes with over 75,000 characters and about 12,500 words - almost as many as this README document.
## Limitations
### Memory
Unlogged-in user can only play games with 2 pairs.
### Posts
Unlogged-in users can see all the posts, but that's all.

Clicking on a *like/unlike* button works by hiding the heart symbol and showing it again later. This is to avoid race conditions with clicking on the same heart twice in quick succession. The code for controlling this properly at the back end is beyond my comprehension for this version.

"Last login" for posts is the same as for messages - they need to be independent. Also, they should depend on the last time the user viewed each of the apps, not last time logged in. This was not thought of when the two social media apps were combined into one application suite.
### Messages
Users must be logged in to use this.
## Future Development
This will be my first *Web Application Suite* to go live, which is projected to occur on 30 June 2026.

Before that happens, it is expected that more than 10 apps will be added to do with fingerspelling, and numerous options and variations will be added to the current fingerspelling apps.
___
According to Microsoft Word, this document has 64 A4 pages, more than 17,700 words, more than 96,000 characters not counting spaces, more than 115,000 including spaces, and in excess of 2,420 lines with at least 1,235 paragraphs.
