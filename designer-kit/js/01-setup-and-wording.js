let SMALL = false;             // true for the mini label: small type is enlarged and the message line is dropped
let W = 400, H = 300, S = 1;   // current label in 1/100 inch, and its scale against the 4 x 3 base
// Label and sheet sizes come from the OnlineLabels print templates (units: 1/100 inch). art = which picture artwork is closest in shape.
const BLEED = 12.5;   // background color printed past each label edge, as in the templates
const ART_BOX = {champagne:[400, 300], prosecco:[300, 300]};
const artUse = base => { const k = sizeNow().art, [aw, ah] = ART_BOX[k]; return `<use href="#${base}-${k}${LITE ? "-s" : ""}" transform="scale(${(W / aw).toFixed(4)} ${(H / ah).toFixed(4)})"/>`; };
const SIZES = [
  {id:"champagne", name:"Champagne", w:425, h:275, label:"4¼ in × 2¾ in", stock:"OnlineLabels OL550 · letter sheet · 8 per sheet", sw:850, sh:1100, cols:2, rows:4, left:0, top:0, gx:0, gy:0, rx:0, art:"champagne", note:"", fit:"Sized for Veuve Clicquot 750 ml and the other champagne bottles on our tested list.", bottles:["Veuve Clicquot, all 750 ml labels","Moët & Chandon, all 750 ml labels","Nicolas Feuillatte Brut Champagne 750 ml","Taittinger La Française Brut 750 ml","Borrasca, all 750 ml labels","Mumm, all 750 ml labels","Sam's Club Members Choice Brut 750 ml","Louis Bouillot Crémant de Bourgogne 750 ml","Rondel Zero Sparkling 750 ml","Rondel Zero Rosé 750 ml","Freixenet 750 ml"], wrapKind:"Champagne wrap", wrapPrice:"$7.95"},
  {id:"prosecco",  name:"Prosecco",  w:283, h:309, label:"2.83 in × 3.09 in", stock:"OnlineLabels OL474 · letter sheet · 9 per sheet", sw:850, sh:1100, cols:3, rows:3, left:0, top:86.5, gx:0, gy:0, rx:0, art:"prosecco",    note:"", fit:"Sized for La Marca 750 ml and the other prosecco bottles on our tested list.", bottles:["La Marca Prosecco & Rosé 750 ml","La Vostro Prosecco & Rosé 750 ml","Cupcake Prosecco 750 ml","Bottega Ora Rosa Sparkling Rosé 750 ml","Mionetto Alcohol Removed Prosecco 750 ml","Castello de Poggio Prosecco DOC 750 ml","Armani Prosecco Rosé 750 ml","Chloe Prosecco 750 ml"], wrapKind:"Prosecco wrap", wrapPrice:"$7.95"},
  {id:"mini",      name:"Mini",      w:193.75, h:209.375, label:"1.94 in × 2.09 in", stock:"OnlineLabels OL6167 · letter sheet · 16 per sheet", sw:850, sh:1100, cols:4, rows:4, left:18.75, top:112.5, gx:12.5, gy:12.5, rx:0, art:"prosecco", small:true, note:"Mini labels are small, so they show up to three lines.", fit:"Sized for La Marca 187 ml and the other mini bottles on our tested list.", bottles:["La Marca Prosecco 187 ml","Chloe Prosecco 187 ml","Cupcake Prosecco 187 ml"], wrapKind:"Mini wraps · 6-pack", wrapPrice:"$28.95"}
];
function setSize(sz){ W = sz.w; H = sz.h; S = Math.min(W / 400, H / 300); SMALL = !!sz.small; }
// Small type on the mini label: enlarged, and never under about 4.7 points in print.
const sm = px => SMALL ? Math.max(px * 1.3, 6.5) : px;
const F = {
  script: "Great Vibes, cursive",
  serif: "Cormorant Garamond, Georgia, serif",
  display: "Playfair Display, Georgia, serif",
  sans: "Jost, Helvetica, Arial, sans-serif"
};
// Lettering styles. Each one swaps the four type roles the designs use, so every design works with every style.
const BASE_F = {...F};
const SANS = "Jost, Helvetica, Arial, sans-serif", GARAMOND = "Cormorant Garamond, Georgia, serif";
const FONT_STYLES = [
  {id:"classic",  name:"Classic script", scale:1,    f:{...BASE_F}},
  {id:"formal",   name:"Formal script",  scale:1,    dscale:.86, f:{script:"Pinyon Script, Great Vibes, cursive", serif:GARAMOND, display:"Cinzel, Georgia, serif", sans:SANS}},
  {id:"modern",   name:"Modern script",  scale:1.08, dscale:.86, f:{script:"Sacramento, cursive", serif:"Lora, Georgia, serif", display:"Montserrat, Helvetica, Arial, sans-serif", sans:"Montserrat, Helvetica, Arial, sans-serif"}},
  {id:"signature",name:"Signature",      scale:1.02, f:{script:"Ms Madi, Sacramento, cursive", serif:GARAMOND, display:SANS, sans:SANS}},
  {id:"flourish", name:"Signature flourish", scale:1.0, f:{script:"Whisper, Sacramento, cursive", serif:GARAMOND, display:SANS, sans:SANS}},
  {id:"sigtall",  name:"Signature tall",  scale:.92, f:{script:"Brittany Signature, Ms Madi, cursive", serif:GARAMOND, display:SANS, sans:SANS}},
  {id:"sigfine",  name:"Signature fine",  scale:1.3,  f:{script:"Thesignature, Ms Madi, cursive", serif:GARAMOND, display:SANS, sans:SANS}},
  {id:"sigwide",  name:"Signature wide",  scale:.62, f:{script:"Always Classy, Ms Madi, cursive", serif:GARAMOND, display:SANS, sans:SANS}},
  {id:"marker",   name:"Marker script",   scale:.84, f:{script:"Loverine, Pacifico, cursive", serif:GARAMOND, display:SANS, sans:SANS}},
  {id:"hand",     name:"Handwritten",    scale:1.05, f:{script:"Caveat, cursive", serif:"Lora, Georgia, serif", display:"Lora, Georgia, serif", sans:SANS}},
  {id:"playful",  name:"Playful",        scale:.74,  dscale:.95, f:{script:"Pacifico, cursive", serif:"Nunito, Helvetica, Arial, sans-serif", display:"Fredoka, Nunito, sans-serif", sans:"Nunito, Helvetica, Arial, sans-serif"}},
  {id:"timeless", name:"Serif italic",   scale:.72,  italic:true, plain:true, head:{font:"Playfair Display, Georgia, serif", italic:true}, f:{script:"Playfair Display, Georgia, serif", serif:GARAMOND, display:"Playfair Display, Georgia, serif", sans:SANS}},
  {id:"serif",    name:"Classic serif",  scale:.8, italic:true, plain:true, head:{font:"Playfair Display, Georgia, serif"}, f:{script:GARAMOND, serif:GARAMOND, display:"Playfair Display, Georgia, serif", sans:SANS}},
  {id:"serifcaps",name:"Serif capitals", scale:.8, italic:true, plain:true, head:{font:"Cinzel, Georgia, serif", upper:true, ls:.06, scale:.9}, f:{script:GARAMOND, serif:GARAMOND, display:"Cinzel, Georgia, serif", sans:SANS}},
  {id:"fineserif",name:"Fine serif",     scale:.8, italic:true, plain:true, head:{font:GARAMOND, weight:600, scale:1.14}, f:{script:GARAMOND, serif:GARAMOND, display:GARAMOND, sans:SANS}},
  {id:"sanscaps", name:"Modern capitals",scale:.8, italic:true, plain:true, head:{font:"Montserrat, Helvetica, Arial, sans-serif", upper:true, ls:.14, weight:500, scale:.8}, f:{script:"Lora, Georgia, serif", serif:"Lora, Georgia, serif", display:"Montserrat, Helvetica, Arial, sans-serif", sans:"Montserrat, Helvetica, Arial, sans-serif"}},
  {id:"boldcaps", name:"Bold capitals",  scale:.8, italic:true, plain:true, head:{font:"Montserrat, Helvetica, Arial, sans-serif", upper:true, ls:.03, weight:700, scale:.86}, f:{script:"Lora, Georgia, serif", serif:"Lora, Georgia, serif", display:"Montserrat, Helvetica, Arial, sans-serif", sans:"Montserrat, Helvetica, Arial, sans-serif"}},
  {id:"rounded",  name:"Rounded",        scale:.8, italic:false, plain:true, head:{font:"Fredoka, Nunito, sans-serif", weight:600, scale:.95}, f:{script:"Nunito, Helvetica, Arial, sans-serif", serif:"Nunito, Helvetica, Arial, sans-serif", display:"Fredoka, Nunito, sans-serif", sans:"Nunito, Helvetica, Arial, sans-serif"}},
  {id:"slab",     name:"Slab",           scale:.8, italic:true, plain:true, head:{font:"Roboto Slab, Rockwell, Georgia, serif", weight:700, scale:.9}, f:{script:"Lora, Georgia, serif", serif:"Lora, Georgia, serif", display:"Roboto Slab, Rockwell, Georgia, serif", sans:SANS}},
  {id:"typewriter",name:"Typewriter",    scale:.8, italic:true, plain:true, head:{font:"Courier Prime, Courier New, monospace", weight:700, scale:.88}, f:{script:"Courier Prime, Courier New, monospace", serif:"Courier Prime, Courier New, monospace", display:"Courier Prime, Courier New, monospace", sans:SANS}}
];
// The chosen lettering always sets the main line. Script styles use their script; the rest use their own headline font.
FONT_STYLES.forEach(x => { if (!x.head) x.head = {font:x.f.script, script:true}; });
const FIELDS = [
  {id:"top",    label:"Top line",            max:26},
  {id:"main",   label:"Names or main line",  max:26},
  {id:"detail", label:"Date or detail",      max:34},
  {id:"msg",    label:"Short message",       max:40}
];
// Each occasion: [name, top line, main line, detail, message, suggested palette]. All names are made-up samples.
const GROUPS = [
  {id:"weddings", name:"Weddings", pal:"Sage", subs:[
    ["Wedding favors","Together with love","Emma & Jack","June 14, 2027","Thank you for celebrating with us"],
    ["Engagement","She said yes","Emma & Jack","Engaged · March 2027","Cheers to forever"],
    ["Bridal shower","Bridal shower","Miss to Mrs.","Honoring Emma · May 2, 2027","Pop the bubbly","Blush"],
    ["Bachelorette","Emma's bachelorette","Last Toast","Nashville · April 2027","Before the veil","Rose"],
    ["Bridesmaid proposal","Can't say I do without you","Be My Bridesmaid?","Love, Emma","Pop it when you say yes","Blush"],
    ["Groomsman proposal","Suit up","Be My Groomsman?","Jack's wedding · June 2027","Cheers, brother","Navy & Gold"],
    ["Rehearsal dinner","Rehearsal dinner","Emma & Jack","June 13, 2027","The night before forever"],
    ["Table bottles","Table","No. 7","Emma & Jack · June 14, 2027","Please enjoy"],
    ["Wedding thank-you","With love and thanks","The Millers","Emma & Jack","We're so glad you came"],
    ["Anniversary","Cheers to","25 Years","Linda & Tom · Est. 2002","Still the one","Champagne"],
    ["Vow renewal","We still do","Linda & Tom","October 9, 2027","Twenty years and counting"]]},
  {id:"birthdays", name:"Birthdays", pal:"Party Brights", subs:[
    ["Birthday","Happy birthday","Cheers, Linda!","November 21, 2026","Make a wish"],
    ["21st","Finally legal","Mia's 21st","November 21, 2026","First of many toasts"],
    ["30th","Cheers to","Thirty","Mia · November 2026","Flirty and thriving"],
    ["40th","Cheers to","Forty","Dan · November 2026","Vintage and fabulous"],
    ["50th","Cheers to","Fifty","Linda · November 2026","Aged to perfection","Navy & Gold"],
    ["60th","Cheers to","Linda's 60th","November 21, 2026","Better with every year","Champagne"],
    ["70th","Cheers to","Linda's 70th","November 21, 2026","A true classic","Champagne"],
    ["80th","Cheers to","Linda's 80th","November 21, 2026","Eighty looks good on you","Champagne"],
    ["90th","Cheers to","Linda's 90th","November 21, 2026","Ninety years well lived","Champagne"],
    ["100th","Cheers to","Linda's 100th","November 21, 2026","A century of stories","Navy & Gold"],
    ["Any age","Cheers to","Linda's 47th","November 21, 2026","Better with every year","Party Brights"]]},
  {id:"baby", name:"Baby & family", pal:"Pastel Party", subs:[
    ["Baby shower","Baby shower","Oh Baby!","Honoring Mia · March 8, 2027","Pop it when she pops"],
    ["Pregnancy announcement","We're expecting","Baby Carter","Arriving August 2027","Our family is growing","Sage"],
    ["Gender reveal","He or she?","Pop to See","Baby Carter · April 2027","Either way, we'll celebrate"],
    ["New baby","Welcome to the world","Olivia Grace","Born May 3, 2027","Cheers to the new parents","Baby Pink"],
    ["Baptism","Blessed","Olivia Grace","Baptized June 6, 2027","Thank you for sharing our joy","Dusty Blue"],
    ["Adoption","Officially ours","Welcome, Noah","Forever family · July 2027","Loved beyond measure","Baby Blue"],
    ["Godparent proposal","Will you be my","Godmother?","Love, Olivia","A toast when you say yes","Lavender"]]},
  {id:"holidays", name:"Holidays", pal:"Christmas", subs:[
    ["Christmas","Merry & bright","The Carter Family","Christmas 2026","With warmest wishes","Christmas"],
    ["Hanukkah","Happy Hanukkah","The Levy Family","Hanukkah 2026","Love and light","Hanukkah"],
    ["New Year's","Cheers to","2027","Happy New Year","Pop at midnight","Navy & Gold"],
    ["Valentine's Day","Be mine","Happy Valentine's","February 14","You're my favorite","Burgundy"],
    ["Galentine's","Happy Galentine's","Cheers, Ladies","February 13","Friends are the best valentines","Baby Pink"],
    ["Easter","Happy Easter","The Carter Family","Spring 2027","Hop, sip and celebrate","Lavender"],
    ["Mother's Day","Happy Mother's Day","Best Mom Ever","Love, Emma and Jack","Thank you for everything","Blush"],
    ["Father's Day","Happy Father's Day","Cheers, Dad","Love, Emma and Jack","Thanks for everything","Navy & Gold"],
    ["Fourth of July","Happy Fourth","Red, White & Bubbly","July 4, 2027","Let freedom fizz","Red, White & Blue"],
    ["Halloween","Happy Halloween","Witches' Brew","October 31","Sip, sip, boo-ray","Halloween"],
    ["Thanksgiving","Give thanks","The Carter Family","Thanksgiving 2026","Grateful for you","Autumn"],
    ["Diwali","Happy Diwali","The Patel Family","Festival of Lights","Wishing you joy and light","Sunshine"],
    ["Lunar New Year","Happy Lunar New Year","The Chen Family","2027","Good fortune and good health","Burgundy"],
    ["St. Patrick's Day","Happy St. Patrick's Day","Cheers & Sláinte","March 17","Lucky to know you","Emerald"],
    ["Cinco de Mayo","Cinco de Mayo","Salud!","May 5","Let's fiesta","Coral"]]},
  {id:"milestones", name:"Milestones", pal:"Navy & Gold", subs:[
    ["Graduation","Congratulations","Class of 2027","Mia Carter · State University","The tassel was worth the hassle"],
    ["New job","Congratulations","You Got the Job","Cheers, Dan","On to big things"],
    ["Promotion","Well deserved","Cheers, Dan!","Vice President · 2027","Onward and upward"],
    ["Retirement","Happy retirement","Cheers, Linda","32 years well done","The best is yet to come","Champagne"],
    ["New home","Home sweet home","The Millers","Est. 2027","Cheers to new beginnings","Dusty Blue"],
    ["Fresh start","Cheers to","A Fresh Start","Mia · 2027","Onward","Coral"],
    ["You did it","You did it","Cheers, Mia!","We're so proud of you","Pop this, you earned it","Party Brights"]]},
  {id:"thanks", name:"Thank you & gifts", pal:"Dusty Blue", subs:[
    ["Thank you","With gratitude","Thank You","From the Carter family","You made all the difference"],
    ["Hostess","For our hostess","Thank You","With love, Emma & Jack","Thanks for having us","Blush"],
    ["Teacher","For a wonderful teacher","Mrs. Lopez","From Olivia · 2026–27","Thank you for a great year","Sunshine"],
    ["Neighbor","From our house to yours","Cheers, Neighbor","The Carter Family","So glad you're next door","Sage"],
    ["Coach","Thanks, Coach","Coach Davis","Wildcats · 2026 season","Thank you for believing in us","Navy & Gold"],
    ["Just because","Just because","Cheers to You","Love, Emma","No reason needed","Peach"],
    ["Get well","Get well soon","Thinking of You","Love, the Carters","Save this for a brighter day","Mint"],
    ["Thinking of you","Thinking of you","With Love","From Emma","Here when you need us","Lavender"]]},
  {id:"business", name:"Business", pal:"Navy & Gold", subs:[
    ["Closing gift","Welcome home","The Millers","From Lakeside Realty","Congratulations on your new home"],
    ["Client thank-you","With gratitude","Thank You","From all of us at Lakeside Realty","We appreciate your business"],
    ["Employee appreciation","You make us better","Thank You, Dan","Lakeside Realty · 2026","We appreciate all you do"],
    ["Work anniversary","Cheers to","10 Years","Dan Miller · Lakeside Realty","Thank you for a decade"],
    ["Holiday client gift","Season's greetings","Cheers to 2027","From Lakeside Realty","Thank you for a wonderful year","Christmas"],
    ["Grand opening","Now open","Grand Opening","Lakeside Realty · May 2027","Thank you for celebrating with us"],
    ["Event favor","Thank you for joining us","Annual Gala","Lakeside Realty · 2027","Cheers to a great night","Black & White"]]},
  {id:"gatherings", name:"Gatherings", pal:"Coral", subs:[
    ["Girls' trip","Girls' trip","Napa 2027","Emma · Mia · Linda · Kate","What happens here stays here"],
    ["Reunion","Together again","Carter Reunion","July 2027","Family is everything","Terracotta"],
    ["Book club","Book club","Read Between the Wines","Chapter & Cork Society","Sip happens","Burgundy"],
    ["Dinner party","Welcome","Dinner at the Millers'","November 14, 2026","Eat, drink and stay a while","Champagne"],
    ["Tailgate","Game day","Go Wildcats!","Tailgate 2026","Cheers to a win","Red, White & Blue"],
    ["Derby party","Derby day","Talk Derby to Me","First Saturday in May","And they're off","Mint"],
    ["Mardi Gras","Mardi Gras","Let the Good Times Roll","February 2027","Laissez les bons temps rouler","Lavender"],
    ["Friendsgiving","Friendsgiving","Thankful for You","November 2026","Friends are the family we choose","Autumn"]]},
  {id:"remembrance", name:"Remembrance", pal:"Dusty Blue", subs:[
    ["Celebration of life","In loving memory","Robert Carter","1948 – 2026","A toast to a life well lived"],
    ["Memorial","Forever in our hearts","Robert Carter","1948 – 2026","Please raise a glass","Black & White"]]},
  {id:"other", name:"Something else", pal:"Beau Blue", subs:[
    ["Your occasion","Cheers","Your Words Here","Date or detail","A short message"]]}
];
// Ready-made labels: finished wording with no names or dates. Each saying is [small top line, main line, small bottom line].
// g and s point at an occasion above, so the right seasonal designs show up.
const READY = [
  {id:"birthday", name:"Birthday", g:"birthdays", s:"Birthday", pal:"Party Brights", items:[
    ["","Happy Birthday","Make a wish"],["Cheers to","Another Year","And many more"],["","Make a Wish","Happy birthday"],
    ["","Aged to Perfection","Happy birthday"],["It's your day","Pop the Bubbly",""],["Happy birthday","Cheers to You",""],["Sip, sip","Hooray","Happy birthday"],
    ["Cheers to","Your Best Year Yet",""],["Another trip","Around the Sun","Happy birthday"],["Here's to","You","Happy birthday"],["Older, wiser","And Still Fabulous",""],["Let's","Party","It's your birthday"],["Birthday calories","Don't Count","Neither do the bubbles"],["Vintage","Not Old","Happy birthday"],["Still younger","Than This Bottle","Probably"],["Make a wish","Pop the Cork",""]]},
  {id:"milestone", name:"Milestone birthdays", g:"birthdays", s:"50th", pal:"Navy & Gold", items:[
    ["Cheers to","21","Finally legal"],["Cheers to","30","Flirty and thriving"],["Cheers to","40","Vintage and fabulous"],
    ["Cheers to","50","Aged to perfection"],["Cheers to","60","Better with every year"],["Cheers to","70","A true classic"],
    ["Cheers to","25","A quarter century"],["Cheers to","35","Still got it"],["Cheers to","45","Halfway to ninety"],["Cheers to","55","Speed limit reached"],["Cheers to","65","Officially a classic"],["Cheers to","75","Three quarters of a century"],["Cheers to","80","Eighty looks good on you"],["Cheers to","90","Ninety years well lived"],["Cheers to","100","A century of stories"]]},
  {id:"thanks", name:"Thank you", g:"thanks", s:"Thank you", pal:"Dusty Blue", items:[
    ["","Thank You","You made all the difference"],["","With Gratitude",""],["","You're the Best","Thank you"],
    ["","Thanks a Bunch",""],["Thank you","So Very Much",""],["A little something","To Say Thanks",""],
    ["","Many Thanks",""],["","Forever Grateful",""],["With heartfelt","Thanks",""],["","Thank You Kindly",""],["Thanks","A Million",""],["I owe you","One","Here's a bottle"],["You're the","Real MVP","Thank you"],["Words fell short","So Here's Bubbly",""]]},
  {id:"hostess", name:"Hostess", g:"thanks", s:"Hostess", pal:"Blush", items:[
    ["","Thanks for Having Us",""],["For our","Hostess","With thanks"],["Cheers to a","Lovely Evening",""],
    ["","Thank You","For a wonderful time"],["To the","Hostess with the Mostest",""],["Thank you for","A Perfect Night",""],
    ["With thanks","For Your Hospitality",""],["Thank you for","Opening Your Home",""],["Cheers to","Good Company",""],["For the","Host","With thanks"],["Thanks for","Feeding Us",""],["We came","For the Snacks","Thanks for having us"],["Open after","We Leave","You've earned it"],["Sorry about","The Noise","Thanks for having us"]]},
  {id:"congrats", name:"Congratulations", g:"milestones", s:"You did it", pal:"Navy & Gold", items:[
    ["","Congratulations",""],["","You Did It","We're so proud of you"],["Cheers","To You","Congratulations"],
    ["","Well Deserved","Congratulations"],["Pop this","You Earned It",""],["Here's to","Big Things","Congratulations"],
    ["","Bravo",""],["","Cheers to Your Success",""],["A toast to","Your Achievement",""],["","So Proud of You",""],["","Nailed It","Congratulations"],["","Look at You Go",""],["Told you","So","Congratulations"],["This calls","For Bubbly",""]]},
  {id:"home", name:"New home", g:"milestones", s:"New home", pal:"Dusty Blue", items:[
    ["","Home Sweet Home",""],["","Welcome Home",""],["Cheers to","New Beginnings",""],
    ["Congratulations on","Your New Home",""],["Bless","This Home",""],["Cheers to","New Keys","And new memories"],
    ["Cheers to","Your New Chapter",""],["May your home","Be Filled With Joy",""],["Welcome to","The Neighborhood",""],["New home","New Memories",""],["Home is where","The Bubbly Is",""],["Unpack","Later","Pop this first"],["New address","Same Great Taste",""],["Cheers to","Never Moving Again",""]]},
  {id:"engaged", name:"Engagement", g:"weddings", s:"Engagement", pal:"Sage", items:[
    ["","She Said Yes",""],["Cheers to the","Future Mr. & Mrs.",""],["","Engaged","Cheers to forever"],
    ["Congratulations","You're Engaged",""],["Cheers to","Forever",""],["Pop the bubbly","He Popped the Question",""],
    ["Cheers to the","Happy Couple",""],["","Love Wins","Congratulations"],["","Forever Starts Now",""],["Cheers to the","Bride & Groom to Be",""],["","Ring Bling",""],["","Finally","Congratulations"],["Does this ring","Make Me Look Engaged?",""],["","Off the Market",""]]},
  {id:"party", name:"Bridesmaids", g:"weddings", s:"Bridesmaid proposal", pal:"Blush", items:[
    ["Will you","Be My Bridesmaid?",""],["Will you","Be My Maid of Honor?",""],["Will you","Be My Matron of Honor?",""],
    ["Will you","Be My Flower Girl?",""],["Will you","Be My Man of Honor?",""],["Will you","Stand by My Side?",""],
    ["Thank you for","Standing by My Side",""],["I can't say I do","Without You",""],["Will you","Help Me Tie the Knot?",""],
    ["","Team Bride",""],["I found my guy","Now I Need My Girls",""],["Pop it","When You Say Yes",""]]},
  {id:"groomsmen", name:"Groomsmen", g:"weddings", s:"Groomsman proposal", pal:"Navy & Gold", items:[
    ["Will you","Be My Groomsman?",""],["Will you","Be My Best Man?",""],["Will you","Be My Usher?",""],
    ["Will you","Be My Ring Bearer?",""],["Will you","Stand by My Side?",""],["Thank you for","Standing by My Side",""],
    ["","Suit Up","I need you up there"],["","Team Groom",""],["I found my girl","Now I Need My Guys",""],
    ["Help me","Tie the Knot",""],["No pressure","But Say Yes",""],["Free drinks","For Life","If you say yes"]]},
  {id:"shower", name:"Shower & bachelorette", g:"weddings", s:"Bridal shower", pal:"Rose", items:[
    ["From","Miss to Mrs.",""],["","Pop the Bubbly","She's getting married"],["","Bride Tribe",""],
    ["The","Last Toast","Before the veil"],["Cheers to the","Bride to Be",""],["","Bride's Babes",""],
    ["","Showered with Love",""],["Cheers to","The Future Mrs.",""],["","Love Is Brewing",""],["","Here Comes the Bride",""],["","Bach & Bubbly",""],["","Bad & Boozy",""],["","Final Fling","Before the ring"],["She said yes","We Said Bubbly",""]]},
  {id:"wedding", name:"Wedding gift", g:"weddings", s:"Wedding favors", pal:"Champagne", items:[
    ["Cheers to the","Newlyweds",""],["","Mr. & Mrs.","Congratulations"],["","Happily Ever After",""],
    ["Congratulations on","Your Wedding",""],["Cheers to","Love",""],["","Just Married",""],["A toast to","Love",""],
    ["Best wishes on","Your Wedding Day",""],["To have","And to Hold","And to pop"],["","Forever & Always",""],["","Two Become One",""],["Eat, drink","And Be Married",""],["","Hitched",""],["I do","Me Too",""],["","To Love, Laughter","And happily ever after"]]},
  {id:"anniversary", name:"Anniversary", g:"weddings", s:"Anniversary", pal:"Champagne", items:[
    ["","Happy Anniversary",""],["","Still the One","Happy anniversary"],["","Cheers to Us",""],
    ["Cheers to","Another Year","Of us"],["Here's to","Many More","Happy anniversary"],["","Better Together",""],
    ["Here's to","Us","Then, now, always"],["","Years of Love",""],["","Forever to Go","Happy anniversary"],["","Love Grows","Happy anniversary"],["","Still Putting Up with Me","Happy anniversary"],["You're still","My Favorite","Happy anniversary"],["","Aged Like Fine Wine","Happy anniversary"],["I'd still","Swipe Right",""]]},
  {id:"baby", name:"Baby", g:"baby", s:"Baby shower", pal:"Pastel Party", items:[
    ["","Oh Baby",""],["","Welcome Little One",""],["Cheers to the","New Parents",""],
    ["Pop it","When She Pops",""],["For the","Mom to Be","You've got this"],["","Hello Baby","Congratulations"],
    ["It's a","Girl","Thanks for celebrating"],["It's a","Boy","Thanks for celebrating"],
    ["A little","Miracle","Congratulations"],["Welcome to","The World",""],["","Sweet Baby",""],["","Tiny Toes","Big cheers"],["Open when","Baby Arrives",""],["","Ready to Pop",""],["You'll need","This","Congratulations"],["","Sleep Is Overrated","Cheers, new parents"],["","Mom Fuel","For after baby"]]},
  {id:"grad", name:"Graduation", g:"milestones", s:"Graduation", pal:"Navy & Gold", items:[
    ["","Congrats, Grad",""],["Cheers to the","Graduate",""],["The tassel was","Worth the Hassle",""],
    ["","You Did It","Congratulations, graduate"],["Onward","And Upward","Congrats, grad"],["","Class of 2027",""],
    ["","The World Awaits","Congratulations, graduate"],["Here's to","Your Bright Future",""],["","With Honors",""],["","Proud of You","Congrats, grad"],["","Done & Dusted","Congrats, grad"],["Now","Hotter by One Degree",""],["Goodbye textbooks","Hello Bubbly",""],["","Adulting Starts Now","Good luck"]]},
  {id:"retire", name:"Retirement", g:"milestones", s:"Retirement", pal:"Champagne", items:[
    ["","Happy Retirement",""],["The best is","Yet to Come","Happy retirement"],["Officially","Off the Clock",""],
    ["Cheers to","Retirement",""],["Every day is","Saturday","Happy retirement"],["","Out of Office","Permanently"],
    ["Cheers to","Your Next Chapter",""],["","Well Earned","Happy retirement"],["Here's to","A Job Well Done",""],["","Time Well Spent","Happy retirement"],["Goodbye","Tension","Hello pension"],["No more","Mondays","Happy retirement"],["","Not My Problem Anymore","Happy retirement"],["","Retired","See you never"]]},
  {id:"christmas", name:"Christmas", g:"holidays", s:"Christmas", pal:"Christmas", items:[
    ["","Merry & Bright",""],["","Merry Christmas",""],["Cheers to","The Season",""],
    ["","Joy","Peace and cheer"],["","Comfort & Joy",""],["Happy","Holidays","With warmest wishes"],
    ["Season's","Greetings",""],["","Peace on Earth",""],["Warmest","Wishes","Merry Christmas"],["","Joy to the World",""],["","Holiday Spirit",""],["","Sleigh All Day",""],["","Merry Sipmas",""],["Dear Santa","I Can Explain",""],["Santa's","Little Helper",""],["On the","Naughty List","Worth it"],["","Let's Get Lit","Merry Christmas"]]},
  {id:"hanukkah", name:"Hanukkah", g:"holidays", s:"Hanukkah", pal:"Hanukkah", items:[
    ["","Happy Hanukkah",""],["","Love & Light","Happy Hanukkah"],["Eight nights","Of Light",""],["Festival of","Lights",""],
    ["Shalom","& Light",""],["Chag","Sameach",""],["Peace, love","And Light",""],["Happy","Chanukah",""],["Love","And Latkes",""],["","Oy to the World",""],["Eight","Nights of Cheer",""],["","Light It Up","Happy Hanukkah"],["Latkes","And Bubbly",""]]},
  {id:"newyear", name:"New Year's", g:"holidays", s:"New Year's", pal:"Navy & Gold", items:[
    ["","Happy New Year",""],["Cheers to the","New Year",""],["Pop at","Midnight",""],
    ["Cheers to","2027",""],["","Cheers","Happy New Year"],["New year","Same Bubbly",""],
    ["Here's to","New Beginnings",""],["A toast to","The Year Ahead",""],["","Auld Lang Syne",""],["","Hello 2027",""],["","New Year, Who Dis?",""],["My resolution","More Bubbly",""],["","Pop, Fizz, Clink",""],["Resolutions","Start Tomorrow",""]]},
  {id:"valentine", name:"Valentine's", g:"holidays", s:"Valentine's Day", pal:"Burgundy", items:[
    ["","Be Mine",""],["Happy","Valentine's Day",""],["","XOXO",""],
    ["You're my","Favorite",""],["","Love You","Always"],["Happy","Galentine's","Cheers, ladies"],
    ["","Forever Yours",""],["With all","My Love",""],["","My Valentine",""],["To my","One and Only",""],["","You're My Person",""],["Love you more","Than Bubbly","Almost"],["You had me","At Cheers",""],["Roses are red","This Is Better",""]]},
  {id:"moms", name:"Mother's Day", g:"holidays", s:"Mother's Day", pal:"Blush", items:[
    ["Happy","Mother's Day",""],["","Best Mom Ever",""],["Cheers,","Mom","Thank you for everything"],
    ["With love","To Mom","Happy Mother's Day"],["","World's Greatest Mom",""],["Because of you","I Am Me","Thanks, Mom"],
    ["For the mom","Who Does It All","Happy Mother's Day"],["","Love You, Mom","Happy Mother's Day"],["To the","Best Grandma","Happy Mother's Day"],
    ["","Mama Needs Bubbly",""],["Sorry for","My Teenage Years","Love you, Mom"],["","Your Favorite Child","Sent this"],
    ["","Mom Fuel","Happy Mother's Day"],["You were right","About Everything","Love you, Mom"]]},
  {id:"dads", name:"Father's Day", g:"holidays", s:"Father's Day", pal:"Navy & Gold", items:[
    ["Happy","Father's Day",""],["","Best Dad Ever",""],["Cheers,","Dad","Thanks for everything"],
    ["With love","To Dad","Happy Father's Day"],["","My Hero","Happy Father's Day"],["","World's Greatest Dad",""],
    ["For the dad","Who Has Everything","Happy Father's Day"],["","Love You, Dad","Happy Father's Day"],["To the","Best Grandpa","Happy Father's Day"],
    ["","Dad Fuel",""],["","Your Favorite Child","Sent this"],["Thanks for","Killing the Spiders","Love you, Dad"],
    ["Better than","A Tie","Happy Father's Day"],["","Dad Jokes Pair Well","With bubbly"]]},
  {id:"easter", name:"Easter", g:"holidays", s:"Easter", pal:"Lavender", items:[
    ["Happy","Easter",""],["","Hoppy Easter",""],["Hello","Spring",""],
    ["Easter","Blessings",""],["","He Is Risen",""],["","Spring Has Sprung",""],["Happy","Spring",""],["","Some Bunny Loves You",""],["","Egg-stra Special",""],["","Hippity Hoppity",""],["","Hunt Is Over","You found the good stuff"],["Carrots","Are Overrated",""]]},
  {id:"thanksgiving", name:"Thanksgiving", g:"holidays", s:"Thanksgiving", pal:"Autumn", items:[
    ["","Give Thanks",""],["Happy","Thanksgiving",""],["","Grateful","For you"],
    ["","Thankful",""],["Happy","Friendsgiving",""],["Gather","And Give Thanks",""],
    ["","Blessed","And grateful"],["So much","To Be Thankful For",""],["","Grateful Hearts",""],["","Gather Together",""],["Gobble","Till You Wobble",""],["Thankful for","Stretchy Pants",""],["Pairs well","With Pie",""],["","Pass the Bubbly",""]]},
  {id:"teacher", name:"Teacher", g:"thanks", s:"Teacher", pal:"Sunshine", items:[
    ["Thank you,","Teacher",""],["","Best Teacher Ever",""],["Thanks for a","Great Year",""],
    ["You're a","Class Act","Thank you"],["Thank you for","Helping Me Grow",""],["A great teacher","Changes Everything","Thank you"],
    ["With","Appreciation",""],["","You Made a Difference","Thank you"],["","Teacher Fuel",""],["You survived","My Kid","Thank you"],
    ["","Summer Break Starter Kit",""],["School's out","Bottoms Up",""],["Because of","My Class","Sorry, and thank you"]]},
  {id:"coach", name:"Coach", g:"thanks", s:"Coach", pal:"Navy & Gold", items:[
    ["","Thanks, Coach",""],["","Best Coach Ever",""],["Thanks for a","Great Season",""],
    ["Thank you for","Believing in Us",""],["","You Made a Difference","Thank you, Coach"],["With","Appreciation","Thanks, Coach"],
    ["Cheers to","A Winning Season",""],["","Coach Fuel",""],["You survived","Our Team","Thank you"],
    ["For all","The Early Mornings","Thanks, Coach"],["Off","The Clock","Enjoy, Coach"],["","Victory Lap","You earned it"]]},
  {id:"because", name:"Just because", g:"thanks", s:"Just because", pal:"Peach", items:[
    ["","Cheers",""],["","Just Because",""],["","Thinking of You",""],
    ["","You Deserve This",""],["Cheers","To You",""],["A little","Something","Just because"],
    ["","Enjoy",""],["","Treat Yourself",""],["Here's to","You",""],["With","Love",""],["It's","Five O'Clock Somewhere",""],["Because","Adulting Is Hard",""],["","You Look Thirsty",""],["No reason","Needed",""]]},
  {id:"getwell", name:"Get well", g:"thanks", s:"Get well", pal:"Mint", items:[
    ["","Get Well Soon",""],["","Brighter Days Ahead",""],["","Thinking of You","Get well soon"],["Sending","Love","And a little sparkle"],
    ["","Feel Better Soon",""],["","Wishing You Well",""],["Speedy","Recovery",""],["","Rest & Recover",""],["Doctor's","Orders","Sort of"],["","Liquid Sunshine","Feel better"],["Hurry up","And Get Better",""],["Save this","For the Comeback",""]]}
];
// Sayings for the occasions that had none, so every occasion offers ready-made wording.
READY.push(
  {id:"july4", name:"Fourth of July", g:"holidays", s:"Fourth of July", pal:"Red, White & Blue", items:[["Happy","Fourth of July",""],["","Red, White & Bubbly",""],["","Let Freedom Fizz",""],["Land of the free","Home of the Bubbly",""],["Stars, stripes","& Sips",""],["Sparklers","& Sparkling",""],["","Party Like It's 1776",""],["Light the fuse","Pop the Cork",""],["Liberty","& Bubbly for All",""],["","Cheers, America",""],["","Yankee Doodle Bubbly",""]]},
  {id:"halloween", name:"Halloween", g:"holidays", s:"Halloween", pal:"Halloween", items:[["Happy","Halloween",""],["","Witches' Brew",""],["Sip, sip","Boo-ray",""],["","Boos & Bubbly",""],["Trick or","Treat Yourself",""],["Eat, drink","& Be Scary",""],["If you've got it","Haunt It",""],["","Ghouls' Night Out",""],["Resting","Witch Face",""],["Creep it","Real",""],["","Spooky Sips",""],["This is my","Costume","I'm a bottle"]]},
  {id:"diwali", name:"Diwali", g:"holidays", s:"Diwali", pal:"Sunshine", items:[["Happy","Diwali",""],["Festival of","Lights",""],["Wishing you","Joy & Light",""],["","Shubh Deepavali",""],["Light, love","& Laughter",""],["May your year","Sparkle",""],["Shine","Bright","Happy Diwali"],["Sweets, lights","& Sparkling Nights",""],["Cheers to","A Bright New Year",""],["","Lit for Diwali",""]]},
  {id:"lunar", name:"Lunar New Year", g:"holidays", s:"Lunar New Year", pal:"Burgundy", items:[["Happy","Lunar New Year",""],["","Gong Xi Fa Cai",""],["Good fortune","& Good Health",""],["Wishing you","Prosperity",""],["Cheers to","A Lucky Year",""],["New year","New Luck",""],["","Fortune Favors the Bubbly",""],["Red envelopes","& Bubbly",""],["Lucky","You","Happy New Year"],["May your glass","Stay Full","And your year lucky"]]},
  {id:"stpat", name:"St. Patrick's Day", g:"holidays", s:"St. Patrick's Day", pal:"Emerald", items:[["Happy","St. Patrick's Day",""],["","Cheers & Sláinte",""],["Lucky","To Know You",""],["","Feeling Lucky",""],["Kiss me","I'm Bubbly",""],["","Irish You Were Here",""],["","Shamrocks & Shenanigans",""],["Pot of gold","Found It",""],["Who needs luck","I Have Bubbly",""],["Luck of","The Irish","In a bottle"],["Irish","For a Day",""],["","Sham-rocked",""]]},
  {id:"cinco", name:"Cinco de Mayo", g:"holidays", s:"Cinco de Mayo", pal:"Coral", items:[["Happy","Cinco de Mayo",""],["","Salud!",""],["Let's","Fiesta",""],["","Viva la Fiesta",""],["","Nacho Average Bubbly",""],["Taco","'Bout a Party",""],["Fiesta","Then Siesta",""],["","Cinco de Drinko",""],["Fiesta like","There's No Mañana",""],["Feliz","Cinco de Mayo",""],["","Olé!",""]]},
  {id:"team", name:"Team", g:"business", s:"Employee appreciation", pal:"Navy & Gold", items:[["","Thank You","For all you do"],["You make us","Better",""],["Happy","Work Anniversary",""],["Cheers to","A Job Well Done",""],["Cheers to","Another Year","On the team"],["Not all heroes","Wear Capes","Some answer emails"],["This could have","Been an Email","But it's bubbly"],["Meeting","Adjourned","Bubbly's open"],["","Employee of the Year","Every year"],["You survived","Another Year","With us"],["We'd be lost","Without You",""],["","Team Player of the Year",""],["Out of office","Starts Now",""]]},
  {id:"client", name:"Clients", g:"business", s:"Client thank-you", pal:"Navy & Gold", items:[["","Thank You","For your business"],["With","Appreciation",""],["Cheers to","Our Partnership",""],["Here's to","Working Together",""],["We","Appreciate You",""],["Deal closed","Bottle Open",""],["Favorite","Client","Don't tell the others"],["Clients like you","Are Rare","Like good bubbly"],["Pleasure","Doing Business",""],["Thanks for","Choosing Us",""]]},
  {id:"opening", name:"Grand opening", g:"business", s:"Grand opening", pal:"Navy & Gold", items:[["","Grand Opening",""],["","Now Open",""],["We're","Open","Come celebrate"],["Cheers to","Opening Day",""],["Thank you for","Celebrating With Us",""],["Doors open","Corks Popping",""],["Ribbon cut","Bottle Popped",""],["Open for","Business","And bubbly"],["","Come On In","We're finally open"],["First day","Best Day",""],["Welcome to","Day One",""],["Dream","Officially Open",""]]},
  {id:"event", name:"Event", g:"business", s:"Event favor", pal:"Black & White", items:[["Thank you","For Joining Us",""],["Cheers to","A Great Night",""],["","With Our Thanks",""],["A toast","To Tonight",""],["Take me","Home","I'm the party favor"],["The after-party","Is in Here",""],["You came","You Mingled","You earned this"],["Best","Guests Ever",""],["Encore","In a Bottle",""],["Thanks for","Coming",""]]},
  {id:"trip", name:"Girls' trip", g:"gatherings", s:"Girls' trip", pal:"Coral", items:[["","Girls' Trip",""],["Cheers to","The Girls",""],["","Vacay Mode",""],["What happens here","Stays Here",""],["Good times","& Tan Lines",""],["Wheels up","Corks Out",""],["","Sip Sip Away",""],["Besties","On the Loose",""],["Resting","Beach Face",""],["Sunscreen","& Bubbly",""],["","Out of Office",""],["","Trip Fuel",""]]},
  {id:"reunion", name:"Reunion", g:"gatherings", s:"Reunion", pal:"Terracotta", items:[["","Together Again",""],["Family","Reunion",""],["Cheers to","Family",""],["","Family Is Everything",""],["The gang's","All Here",""],["Crazy","Runs in the Family","So does bubbly"],["We put the fun","In Dysfunctional",""],["Same family","New Stories",""],["Older","Not Wiser",""],["Class","Reunion","Still got it"],["","Related & Proud",""],["Remember","When",""]]},
  {id:"bookclub", name:"Book club", g:"gatherings", s:"Book club", pal:"Burgundy", items:[["","Book Club",""],["Read","Between the Wines",""],["","Sip Happens",""],["My book club","Only Reads Labels",""],["Did anyone","Read the Book?",""],["Plot twist","More Bubbly",""],["Chapter one","Pour",""],["Shhh","I'm Reading","The label"],["Reading","Is Fundamental","So is bubbly"],["","Novel Idea",""],["Books","& Bubbly",""],["Well read","Well Poured",""]]},
  {id:"tailgate", name:"Tailgate", g:"gatherings", s:"Tailgate", pal:"Red, White & Blue", items:[["","Game Day",""],["","Go Team",""],["Cheers to","A Win",""],["","Tailgate Fuel",""],["Win or lose","We Pour",""],["Pregame","Like a Pro",""],["","First Down, Bottoms Up",""],["Parking lot","Party",""],["Defense","Wins Games","Bubbly wins tailgates"],["","Touchdown",""],["Sunday","Funday",""],["Rivalry","Week",""]]},
  {id:"derby", name:"Derby", g:"gatherings", s:"Derby party", pal:"Mint", items:[["","Derby Day",""],["","Talk Derby to Me",""],["And they're","Off",""],["","Run for the Roses",""],["Hats, horses","& Bubbly",""],["","Win, Place, Sip",""],["Hold your horses","Pop the Cork",""],["Big hats","Big Bets",""],["","Giddy Up",""],["","Derby Darling",""],["Down the","Stretch","They come"],["First Saturday","In May",""]]},
  {id:"mardigras", name:"Mardi Gras", g:"gatherings", s:"Mardi Gras", pal:"Lavender", items:[["Happy","Mardi Gras",""],["Let the","Good Times Roll",""],["Laissez les","Bons Temps Rouler",""],["","Fat Tuesday",""],["Beads","& Bubbly",""],["Throw me","Something","Preferably bubbly"],["","Masks On, Corks Off",""],["King cake","& Bubbly",""],["Bourbon Street","State of Mind",""],["","Geaux Time",""]]},
  {id:"memorial", name:"Remembrance", g:"remembrance", s:"Celebration of life", pal:"Dusty Blue", items:[["In loving","Memory",""],["Forever","In Our Hearts",""],["A toast to","A Life Well Lived",""],["Celebrating","A Beautiful Life",""],["Please","Raise a Glass",""],["Gone","But Never Forgotten",""],["Until we","Meet Again",""],["With love","& Remembrance",""],["","Always Loved",""],["Here's to","The Memories",""]]},
  {id:"table", name:"Table bottles", g:"weddings", s:"Table bottles", pal:"Sage", items:[["","Please Enjoy",""],["Cheers","From the Newlyweds",""],["A toast","From Us to You",""],["","Take a Sip",""],["Eat, drink","& Be Married",""],["This table","Is the Fun Table",""],["Liquid","Courage","For the dance floor"],["Pop it, pour it","Dance All Night",""],["Drink up","The Bar Is Far",""],["Share","Or Don't","We won't tell"]]},
  {id:"godparent", name:"Godparents", g:"baby", s:"Godparent proposal", pal:"Lavender", items:[["Will you be my","Godmother?",""],["Will you be my","Godfather?",""],["Will you be my","Godparents?",""],["Promoted to","Godmother",""],["Promoted to","Godfather",""],["Godparents","Wanted","Apply within"],["","Fairy Godmother","Position open"],["Say yes","Then Pop This",""],["A toast","When You Say Yes",""],["You've been","Chosen","Will you be my godparent?"]]},
  {id:"bach", name:"Bachelorette", g:"weddings", s:"Bachelorette", pal:"Rose", items:[["","Bride Tribe",""],["The","Last Toast","Before the veil"],["Last fling","Before the Ring",""],["","I Do Crew",""],["","Bach Bash",""],["Buy me bubbly","I'm the Bride",""],["She said yes","We Said Bubbly",""],["Bach","Shenanigans","What happens stays"],["","Bad & Boozy",""],["Same crew","New Last Name",""],["Sip sip","She's Hitched",""],["","Bride's Babes",""],["Final","Fiesta",""]]}
);
// Cheekier sayings, slotted in near the top of each list (after the entries other code points to by position).
const CHEEKY = {
  birthday:[["Another year","Still a Snack",""],["You're not old","You're Vintage",""],["Hotter than","The Candles",""],["Cake first","Bubbly Second","Regrets never"],["Birthday behavior","Starts Now",""],["Out of my way","It's My Birthday",""],["Wine improves","With Age","So did you"],["Main character","Energy","Happy birthday"]],
  thanks:[["You rock","I Pop",""],["Thanks","A Latte","But here's bubbly"],["I owe you","Big Time","Start with this"],["Too nice","Have a Bottle",""],["You're the","GOAT","Thank you"],["Gratitude","With Attitude","Cheers"]],
  hostess:[["I came","I Sipped","I'm staying"],["Invite me","Again","Please and thank you"],["Your house","My Bubbly","Perfect pairing"],["Thanks for not","Kicking Us Out",""],["Hostess gift","Do Not Share",""],["You cooked","I Brought Fizz","Teamwork"]],
  congrats:[["Look who's","Killing It",""],["Kind of","A Big Deal",""],["You did","The Thing","So proud"],["Crushed it","Now Uncork It",""],["Humble brag","Loud Bubbly",""],["Big deal","Alert","Congratulations"]],
  home:[["Keys in hand","Cork in Air",""],["Nice digs","Here's Some Bubbly",""],["Welcome to","Adulting","Now with a mortgage"],["Housewarming","Liquid Edition",""],["First rule","No Shoes","Second rule: bubbly"],["Mortgage","Looks Good on You",""]],
  engaged:[["She said","Finally",""],["Ring secured","Bubbly Required",""],["Fiancé","Has a Nice Ring","To it"],["Plus one","For Life",""],["Locked","It Down","Congratulations"],["I said yes","To the Bubbly Too",""]],
  party:[["Bride squad","Assemble",""],["You're stuck","With Me","Be my bridesmaid?"],["Emotional support","Bridesmaid","Position open"],["Yes is","The Only Answer",""],["Free dress","Sort Of","Be my bridesmaid?"],["Pop it","Before You Answer",""]],
  groomsmen:[["Rent a tux","Drink for Free",""],["One job","Don't Lose the Ring",""],["Suit up","Buttercup",""],["I need","Backup","Be my groomsman?"],["Stand there","Look Pretty","Be my groomsman?"],["Bachelor party","Depends on You",""]],
  shower:[["Rosé","All Day","Bride to be"],["Wifey","In Training",""],["Last name","Loading","Bride to be"],["Buy me bubbly","Call Me Mrs.",""],["Sip sip","She's Hitched",""],["Bach","Shenanigans","What happens stays"]],
  wedding:[["Hitched","Without a Hitch",""],["They did","We Drank",""],["Love is patient","Bubbly Is Not",""],["Till death","Or Dishes","Do us part"],["Married","& Merry",""],["Open bar","Open Hearts",""]],
  anniversary:[["Another year","No Regrets","Mostly"],["I'd marry you","Again","Probably"],["Still","Tolerating Each Other","Happy anniversary"],["Married","& Still Flirting",""],["Our love","Ages Well","So do we"],["You're stuck","With Me","Happy anniversary"]],
  baby:[["Bun's done","Pop the Cork",""],["Bottle service","Mom Edition",""],["You're about","To Be Tired","Congratulations"],["Nine months","Of Waiting","For this bottle"],["Tiny human","Big Bubbly",""],["Cry it out","Then Pour It Out",""]],
  grad:[["Degree","Acquired","Bubbly required"],["Student loans","Later","Bubbly now"],["Smarty","Pants","Congrats, grad"],["Barely","Graduated","Fully celebrating"],["Thank you","Coffee","And Mom and Dad"],["Class","Dismissed","Bar's open"]],
  retire:[["Do not","Disturb","Retired"],["Ask someone","Else","I'm retired"],["Alarm clock","Deleted",""],["Retired","Not Expired",""],["Monday","Who?",""],["Under new","Management","See spouse for details"],["My new boss","Is a Beach Chair",""]],
  christmas:[["Fa la la","La La Fizz",""],["Dear Santa","Define Good",""],["Jingle","Juice",""],["Elf","Fuel",""],["Holiday","Survival Kit",""],["Up to","Snow Good",""],["Santa","I've Been Good-ish",""],["Sleigh","The Holidays",""]],
  hanukkah:[["Eight nights","Eight Bottles","Kidding. Mostly."],["Spin it","To Win It","Happy Hanukkah"],["Light it up","Pour It Out",""],["Latke","Love",""],["Challah","At Me",""]],
  newyear:[["Kiss me","At Midnight",""],["Bye","2026","Don't call"],["New year","Same Me","Better bubbly"],["10, 9, 8","Pour",""],["Sparkle now","Nap Later",""],["Hello 2027","Be Nice",""]],
  valentine:[["Be my","Wine-entine",""],["You're","My Main Squeeze",""],["Single","& Sparkling",""],["Stupid","Cupid","Kidding. I love you."],["Galentines","Before Valentines",""],["Love","Potion","Handle with care"]],
  moms:[["Because","Kids","Love you, Mom"],["Mom's","Sippy Cup",""],["Mom","Off Duty",""],["Raising me","Deserves Bubbly",""],["Mother of","The Year","Self-nominated"],["World's okayest","Mom","Kidding. You're the best."]],
  dads:[["Grill","Sergeant",""],["Dad bod","Fuel",""],["Ask","Your Mother","Dad's busy"],["Thermostat","Police","Happy Father's Day"],["Lawn","Enforcement Officer",""],["Dad","Off Duty",""]],
  easter:[["Hoppy","Hour",""],["Egg hunt","Fuel","For the grown-ups"],["Chicks","Dig Bubbly",""],["Easter","Bubbly Hunt","You found it"],["Hip hop","Pop",""]],
  thanksgiving:[["Stuffed","& Sparkling",""],["Thankful for","Elastic Waistbands",""],["Family time","Survival Kit",""],["Leftovers","Are for Quitters",""],["Talk turkey","To Me",""],["Pass the gravy","Then the Bubbly",""]],
  teacher:[["Grading","Juice",""],["Recess","For Grown-Ups",""],["After-school","Special",""],["You deserve","A Medal","Here's a bottle"],["Thank you for","Not Giving Up","On my kid"],["Teachers can't live","On Apples Alone",""]],
  coach:[["MVP","Most Valuable Pour",""],["You yelled","We Won","Thanks, Coach"],["Off season","On Bubbly",""],["Hydrate","Coach's Orders",""],["Post-game","Press Conference","In a bottle"],["Timeout","Coach",""]],
  because:[["Emergency","Bubbly","Break seal as needed"],["Tuesday","Is Reason Enough",""],["Self-care","In a Bottle",""],["Plot twist","It's Bubbly",""],["Good vibes","Bottled",""],["Pop first","Ask Later",""]],
  getwell:[["Get well","Or Else","Love you"],["Laughter is","The Best Medicine","This is second"],["Rest up","Bubbly's Waiting",""],["Germs","Not Invited",""],["Sick days","Are for Reruns","Feel better"]]
};
const CHEEKY_AT = {valentine:6, thanksgiving:5, because:3};
Object.keys(CHEEKY).forEach(id => { const r = READY.find(x => x.id === id); if (r) r.items.splice(CHEEKY_AT[id] || 2, 0, ...CHEEKY[id]); });
// Sample dates and year sayings were written in 2026. Shift them so they stay current.
{ const now = new Date(), y = now.getFullYear(), m = now.getMonth(), by = d => t => String(t).replace(/\b20(2[6-9])\b/g, v => String(+v + d));
  const plain = y - 2026, newYear = (m < 2 ? y - 1 : y) - 2026, classOf = (m >= 7 ? y + 1 : y) - 2027;
  READY.forEach(r => { const d = r.id === "newyear" ? newYear : r.id === "grad" ? classOf : plain; if (d) r.items.forEach(it => { for (let i = 0; i < 3; i++) it[i] = by(d)(it[i]); }); });
  if (plain) GROUPS.forEach(g => g.subs.forEach(sb => { for (let i = 1; i < 5; i++) if (!/^19/.test(sb[i])) sb[i] = by(plain)(sb[i]); })); }

// Stand-in wraps until the real catalog is connected.
const WRAPS = [{id:"stripe"}, {id:"gingham"}, {id:"dots"}];
// Real collections on beaubottles.com, matched to the occasion. Anything not listed falls back to the collection for the bottle size.
const SHOP = "https://www.beaubottles.com/collections/";
const COLL = {
  wedding:["Wedding & Engagement","wedding-engagement-wraps"], birthday:["Birthday","birthday-celebration-wraps"], baby:["Baby Shower","baby-shower-overview-new-nav"],
  closing:["Closing & Housewarming Gifts","real-estate-closing-collection"], grad:["Graduation","graduation-wraps"], gameday:["Game Day","game-day-collection"],
  holiday:["Holiday Wraps","holiday-wraps"], thanksgiving:["Thanksgiving","thanksgiving"], christmas:["Christmas","christmas-overview-new-nav"], hanukkah:["Hanukkah","hanukkah"],
  valentine:["Valentine's Day","valentines-day-collection"], mardi:["Mardi Gras","mardi-masquerade"], easter:["Easter","easter-collection"], mom:["Mother's Day","mothers-day-wraps"],
  dad:["Father's Day","fathers-day-collection"], july4:["4th of July","stars-and-stripes"], halloween:["Halloween","halloween-collection"],
  champagne:["Champagne Wraps","champagne-collection"], prosecco:["Prosecco Wraps","la-marca-wraps"], mini:["Mini Wraps","mini-la-marca"]};
const COLL_SUB = {"Christmas":"christmas","Hanukkah":"hanukkah","New Year's":"holiday","Valentine's Day":"valentine","Galentine's":"valentine","Easter":"easter","Mother's Day":"mom",
  "Father's Day":"dad","Fourth of July":"july4","Halloween":"halloween","Thanksgiving":"thanksgiving","Friendsgiving":"thanksgiving","Graduation":"grad","New home":"closing",
  "Closing gift":"closing","Holiday client gift":"holiday","Tailgate":"gameday","Mardi Gras":"mardi"};
const COLL_GROUP = {weddings:"wedding", birthdays:"birthday", baby:"baby"};
function collNow(){
  const sub = groupNow().subs[state.sub][0], key = COLL_SUB[sub] || COLL_GROUP[state.group];
  return key ? {name:COLL[key][0], url:SHOP + COLL[key][1], matched:true, occasion:sub} : {name:COLL[state.size][0], url:SHOP + COLL[state.size][1], matched:false, occasion:sub};
}
const wrapName = i => { const col = collNow(); return `[${col.matched ? col.name : sizeNow().name} best seller ${i + 1}]`; };
const labelCount = () => namesMode() ? Math.max(1, nameList().length) : perSheet() * state.qty;
const wrapUnit = () => /6-pack/i.test(sizeNow().wrapKind) ? 6 : 1;                    // minis are sold by the six-pack
const wrapEach = () => +(sizeNow().wrapPrice.match(/\$([\d.]+)/) || [0, 0])[1];
const wrapMatch = () => Math.ceil(labelCount() / wrapUnit());                          // wraps (or packs) needed to dress every label
// Wraps set to "match" share the label count between them, after any the customer set by hand.
function wrapQty(w){
  if (!w.auto) return w.n;
  const autos = state.wraps.filter(x => x.auto), k = autos.length, i = autos.indexOf(w);
  const left = Math.max(k, wrapMatch() - state.wraps.filter(x => !x.auto).reduce((a, x) => a + x.n, 0));
  return Math.floor(left / k) + (i < left % k ? 1 : 0);
}
const subWords = s => ({top:s[1], main:s[2], detail:s[3], msg:s[4]});
// Starter screen list. The live version would use a fuller list plus an AI check.
const BLOCK_BRANDS = ["veuve","clicquot","moet","moët","dom perignon","disney","nike","starbucks","coca-cola","coca cola","louis vuitton"];
const BLOCK_WORDS = ["fuck","shit","bitch","asshole"];
const MAX_NAMES = 48;
