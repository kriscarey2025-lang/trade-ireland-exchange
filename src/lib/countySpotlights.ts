export interface CountySpotlightData {
  slug: string;
  name: string;
  province: "Leinster" | "Munster" | "Connacht" | "Ulster";
  icon: string;
  heroTagline: string;
  intro: string;
  funFacts: string[];
  famousSkills: string[];
  didYouKnow: string;
  metaDescription: string;
}

export const countySpotlights: CountySpotlightData[] = [
  {
    slug: "carlow",
    name: "Carlow",
    province: "Leinster",
    icon: "🏰",
    heroTagline: "Ireland's smallest inland county, biggest on community spirit",
    intro: "Carlow might be compact, but it punches well above its weight when it comes to community, creativity, and craic. Home to SwapSkills HQ, this county knows a thing or two about neighbours helping neighbours. From the banks of the River Barrow to the slopes of Mount Leinster, Carlow folk have always been handy — and happy to share their skills.",
    funFacts: [
      "Carlow is home to Ireland's tallest inland cliffs at Mount Leinster — and some of Ireland's best paragliding instructors!",
      "The town hosted one of Ireland's first sugar beet factories, and the locals still know their way around a vegetable garden.",
      "Carlow IT (now SETU) has produced generations of engineers, designers, and tech-savvy graduates ready to swap skills.",
      "The Visual Centre for Contemporary Art in Carlow is one of Ireland's leading art spaces — creativity runs deep here.",
      "Carlow's Browne's Hill Dolmen has the largest capstone in Europe, weighing over 100 tonnes. The lads who moved that knew a thing or two about teamwork!"
    ],
    famousSkills: ["Gardening & horticulture", "Arts & crafts", "Engineering", "Baking", "Outdoor sports"],
    didYouKnow: "SwapSkills was born right here in Carlow! Founder Kristina Carey started the platform to help locals trade skills without money. The community response was so positive, it spread across all of Ireland. True Carlow spirit!",
    metaDescription: "Discover skill swapping in Carlow, Ireland. Browse local listings, fun facts, and connect with neighbours to trade skills — no money needed. SwapSkills HQ county!"
  },
  {
    slug: "dublin",
    name: "Dublin",
    province: "Leinster",
    icon: "🌉",
    heroTagline: "Where tech meets tradition — Dublin's got skills to spare",
    intro: "Dublin, the capital, is a melting pot of talent. From Silicon Docks coders to Temple Bar musicians, from Howth fishermen to Ballymun community gardeners — this city has every skill imaginable. And Dubliners? They're not shy about sharing. Whether it's teaching someone to code or showing them how to make a proper coddle, Dublin's SwapSkills community is buzzing.",
    funFacts: [
      "Dublin has more tech workers per capita than almost any European city — your next JavaScript tutor might be living next door!",
      "The city has over 1,000 pubs, and plenty of talented baristas and mixologists happy to swap cocktail-making skills.",
      "Dublin's community gardens have exploded in recent years — urban gardening is one of the most swapped skills in the capital.",
      "More than 200 languages are spoken in Dublin, making it perfect for language exchange swaps.",
      "The Liberties neighbourhood has been brewing beer since the 13th century. Homebrew skills? Sorted."
    ],
    famousSkills: ["Technology & coding", "Music & performance", "Languages", "Urban gardening", "Cooking & baking"],
    didYouKnow: "Dublin has the youngest population of any European capital, with nearly 50% of residents under 35. That's a LOT of energy for skill swapping!",
    metaDescription: "Swap skills in Dublin, Ireland. Find local listings for tech help, music lessons, gardening, language exchange and more. Join Dublin's SwapSkills community free."
  },
  {
    slug: "cork",
    name: "Cork",
    province: "Munster",
    icon: "⛵",
    heroTagline: "The Real Capital of skill swapping — sure look, Cork has it all",
    intro: "Cork people will tell you it's the real capital of Ireland — and when it comes to skills, they might be right. From the English Market's artisan food producers to the tech scene in Mahon, from traditional music in West Cork to surfing in Inchydoney, Cork has an incredible depth of talent. And they're fierce generous about sharing it.",
    funFacts: [
      "Cork's English Market has been running since 1788 — that's over 230 years of food skills passed down through generations!",
      "The county has more coastline than any other in Ireland, so watersport skills are in serious demand.",
      "UCC was the first university in Ireland to offer a degree in Food Science — Cork knows its grub.",
      "Spike Island off Cork harbour was once called 'Ireland's Alcatraz' — now it's a tourist attraction. Talk about a skill pivot!",
      "West Cork is home to a thriving community of artisan cheese makers, each with skills worth swapping for."
    ],
    famousSkills: ["Artisan food & cheese making", "Sailing & watersports", "Traditional music", "Tech & startups", "Brewing & distilling"],
    didYouKnow: "Cork has Ireland's only dedicated butter museum (yes, really). The county exported butter worldwide for centuries. If you need butter-making lessons, Cork's your spot!",
    metaDescription: "Discover skill swapping in Cork, Ireland. Browse local listings for food skills, music, tech help, watersports and more. Join Cork's SwapSkills community free."
  },
  {
    slug: "galway",
    name: "Galway",
    province: "Connacht",
    icon: "🎭",
    heroTagline: "The City of Tribes meets the City of Skills",
    intro: "Galway is Ireland's cultural heartbeat — a city where Irish is spoken on the streets, where buskers become legends, and where creativity flows as freely as the Corrib. From Connemara stone wall builders to Salthill surfers, from NUIG researchers to Westend artists, Galway folk are skilled, soulful, and always up for a swap.",
    funFacts: [
      "Galway was designated a European Capital of Culture — the artistic talent here is genuinely world-class.",
      "The Aran Islands off Galway still produce hand-knitted Aran jumpers using techniques passed down for generations.",
      "Galway's arts festival is the largest in Ireland, attracting over 200,000 visitors each July.",
      "Connemara ponies are bred here and known worldwide — equestrian skills are a Galway specialty.",
      "The city has more independent restaurants per capita than Dublin. Foodie skills? Galway's got them in spades."
    ],
    famousSkills: ["Arts & performance", "Irish language", "Knitting & textiles", "Music & busking", "Surfing"],
    didYouKnow: "Galway is one of the few places in Ireland where you can hear Irish (Gaeilge) spoken daily in the streets of the Gaeltacht areas. Irish language swaps are hugely popular here!",
    metaDescription: "Swap skills in Galway, Ireland. Find local listings for arts, music, Irish language, surfing and more. Join Galway's vibrant SwapSkills community free."
  },
  {
    slug: "limerick",
    name: "Limerick",
    province: "Munster",
    icon: "🏉",
    heroTagline: "A city that tackles everything — including skill swapping",
    intro: "Limerick is a city on the rise. From its rich sporting heritage to its thriving tech and innovation scene, Limerick combines grit with creativity. The people here are warm, direct, and ready to get stuck in. Whether it's rugby coaching, engineering know-how, or traditional crafts, Limerick's skill pool runs deep.",
    funFacts: [
      "Limerick is the spiritual home of Munster Rugby — coaching and fitness skills are in serious demand here.",
      "The city's medieval quarter features King John's Castle, built in the 13th century by seriously skilled stonemasons.",
      "Limerick was designated a UNESCO City of Literature — there are genuine wordsmiths here happy to help with your writing.",
      "The University of Limerick has one of Ireland's best engineering programmes, producing top-class technical talent.",
      "Limerick lace was once world-famous and exported globally — the craft is seeing a revival among local artisans."
    ],
    famousSkills: ["Sports coaching", "Engineering", "Writing & literature", "Lace making & crafts", "Music"],
    didYouKnow: "The limerick poem form is named after the city! There are actual limerick-writing workshops and competitions held here regularly. Fancy swapping poetry skills?",
    metaDescription: "Discover skill swapping in Limerick, Ireland. Browse local listings for sports coaching, engineering, crafts, writing and more. Join Limerick's SwapSkills community free."
  },
  {
    slug: "kerry",
    name: "Kerry",
    province: "Munster",
    icon: "⛰️",
    heroTagline: "The Kingdom of skills — from mountains to music",
    intro: "Kerry is known as 'The Kingdom' for good reason — it rules when it comes to natural beauty, hospitality, and homegrown talent. From Dingle's fishermen to Killarney's hoteliers, from hill walkers on the Kerry Way to traditional musicians in every pub, this county has skills that money can't buy (but you can definitely swap for!).",
    funFacts: [
      "The Ring of Kerry is one of Ireland's most famous drives — local tour guides have skills that take years to develop.",
      "Dingle is a Gaeltacht area where Irish is the daily language — perfect for language exchange swaps.",
      "Kerry footballers have won more All-Ireland titles than any other county. GAA coaching runs in the blood.",
      "Skellig Michael, a UNESCO World Heritage Site off Kerry's coast, was a Star Wars filming location. Even Hollywood needs Kerry!",
      "Kerry has some of Ireland's best artisan food producers, from farmhouse cheeses to smoked fish."
    ],
    famousSkills: ["GAA coaching", "Hospitality & tourism", "Irish language", "Outdoor adventure", "Artisan food"],
    didYouKnow: "Kerry people are famous for their storytelling — the art of the 'seanchaí' (traditional storyteller) is still alive and well here. Fancy learning the craft?",
    metaDescription: "Swap skills in Kerry, Ireland. Find local listings for GAA coaching, outdoor adventures, Irish language, food skills and more. Join Kerry's SwapSkills community free."
  },
  {
    slug: "waterford",
    name: "Waterford",
    province: "Munster",
    icon: "💎",
    heroTagline: "Ireland's oldest city, newest skill-swapping scene",
    intro: "Waterford, Ireland's oldest city, blends Viking heritage with modern innovation. Famous worldwide for Waterford Crystal, this county has always valued craftsmanship and precision. Today, that tradition continues with a diverse community of makers, growers, and doers ready to swap their skills.",
    funFacts: [
      "Waterford Crystal has been handcrafted here since 1783 — glass-blowing and craft skills are literally in the city's DNA.",
      "The Waterford Greenway is Ireland's longest off-road cycling and walking trail at 46km — cycling skills are huge here.",
      "Waterford is Ireland's oldest city, founded by Vikings in 914 AD. They were handy with boats AND swords.",
      "The county produces some of Ireland's best blaa bread — a Waterford-only delicacy. Baking skills? Check.",
      "WIT (now SETU Waterford) is a leader in pharmaceutical and science education, producing skilled graduates."
    ],
    famousSkills: ["Craftsmanship & glass work", "Cycling", "Baking", "Science & pharma", "Fishing"],
    didYouKnow: "The Waterford blaa (a soft, floury bread roll) has Protected Geographical Indication status from the EU. It can only be called a 'blaa' if it's made in Waterford!",
    metaDescription: "Discover skill swapping in Waterford, Ireland. Browse local listings for crafts, cycling, baking, science skills and more. Join Waterford's SwapSkills community free."
  },
  {
    slug: "kilkenny",
    name: "Kilkenny",
    province: "Leinster",
    icon: "🎨",
    heroTagline: "The Marble City where craft and creativity collide",
    intro: "Kilkenny is Ireland's craft capital — from the Design Centre in the Castle Yard to the Kilkenny Arts Festival, creativity is woven into every cobblestone. The city's medieval streets buzz with artists, brewers, woodworkers, and designers, all proud of their skills and eager to share them.",
    funFacts: [
      "Kilkenny is called the Marble City because of its black limestone streets — stonemasons here have skills that go back centuries.",
      "The Kilkenny Design Centre launched Ireland's modern craft movement. This county literally defined Irish design.",
      "Smithwick's brewery in Kilkenny is Ireland's oldest, operating since 1710. Brewing skills? Kilkenny's your county.",
      "The county has won more All-Ireland hurling titles than almost anywhere. Hurling coaching is a prized skill here.",
      "Kilkenny's Cat Laughs Comedy Festival is world-famous — comedy and performance skills thrive in this city."
    ],
    famousSkills: ["Craft & design", "Brewing", "Hurling coaching", "Comedy & performance", "Stonemasonry"],
    didYouKnow: "Kilkenny is technically a city, even though it has around 26,000 people. It retained its city charter since medieval times. Small city, massive talent!",
    metaDescription: "Swap skills in Kilkenny, Ireland. Find local listings for craft, design, brewing, hurling coaching and more. Join Kilkenny's SwapSkills community free."
  },
  {
    slug: "wexford",
    name: "Wexford",
    province: "Leinster",
    icon: "☀️",
    heroTagline: "The Sunny Southeast — where skills shine bright",
    intro: "Wexford basks in Ireland's sunniest weather and grows much of the country's food. This is farming country with a creative edge — the Wexford Opera Festival is internationally acclaimed, strawberry picking is a summer ritual, and the coast draws surfers, sailors, and seafood lovers. A county rich in skills and generosity.",
    funFacts: [
      "Wexford gets more sunshine than anywhere else in Ireland — ideal for gardening and outdoor skill swaps!",
      "The county produces a huge proportion of Ireland's soft fruit — strawberry growing skills are legendary here.",
      "Wexford Opera Festival is one of the world's most prestigious small opera festivals. Vocal coaching, anyone?",
      "Johnstown Castle is one of Ireland's most beautiful estates, with agricultural research that benefits the whole country.",
      "Hook Lighthouse in Wexford is the world's oldest operational lighthouse, dating back over 800 years."
    ],
    famousSkills: ["Farming & horticulture", "Opera & singing", "Surfing", "Strawberry growing", "Seafood cooking"],
    didYouKnow: "The phrase 'by hook or by crook' is believed to originate from Wexford, referring to Hook Head and the village of Crooke across the estuary!",
    metaDescription: "Discover skill swapping in Wexford, Ireland. Browse local listings for farming, music, surfing, cooking skills and more. Join Wexford's SwapSkills community free."
  },
  {
    slug: "wicklow",
    name: "Wicklow",
    province: "Leinster",
    icon: "🌿",
    heroTagline: "The Garden of Ireland blooms with skills",
    intro: "Wicklow is rightly called the Garden of Ireland — its landscapes are stunning, from Glendalough to the Sugarloaf, Powerscourt to Brittas Bay. But beyond the scenery, Wicklow is home to outdoor adventurers, organic farmers, film crews (hello, Vikings!), and a growing community of skill swappers.",
    funFacts: [
      "Wicklow has been a filming location for Braveheart, Vikings, P.S. I Love You, and more. Film industry skills are in demand!",
      "Powerscourt Gardens was voted the third most beautiful garden in the world. Gardening skills here are next level.",
      "The Wicklow Way is Ireland's first and most popular long-distance walking trail — outdoor guiding skills abound.",
      "Organic farming is booming in Wicklow, with some of Ireland's pioneering organic producers based here.",
      "Glendalough's monastic city was a centre of learning for centuries — education has deep roots in Wicklow."
    ],
    famousSkills: ["Gardening & landscaping", "Film & media", "Hiking & outdoor skills", "Organic farming", "Photography"],
    didYouKnow: "Wicklow Mountains National Park covers over 20,000 hectares — that's a LOT of outdoor skills being practiced every single day!",
    metaDescription: "Swap skills in Wicklow, Ireland. Find local listings for gardening, photography, outdoor adventures, farming and more. Join Wicklow's SwapSkills community free."
  },
  {
    slug: "meath",
    name: "Meath",
    province: "Leinster",
    icon: "👑",
    heroTagline: "The Royal County where ancient skills meet modern talent",
    intro: "Meath is Ireland's Royal County — home to the Hill of Tara, Newgrange, and centuries of heritage. Today, it's also a thriving commuter county with young families, equestrian centres, and a growing community spirit. From horse riding to heritage crafts, Meath skills span millennia.",
    funFacts: [
      "Newgrange is older than the Egyptian pyramids and Stonehenge — the engineering skills of ancient Meath were extraordinary.",
      "Meath is one of Ireland's premier horse racing and breeding counties. Equestrian skills are deeply valued.",
      "The Hill of Tara was the seat of the High Kings of Ireland — leadership skills have Meath roots!",
      "Tayto Park (now Emerald Park) is in Meath — yes, the crisp people built a theme park. Now THAT's a skill pivot.",
      "The Boyne Valley is one of Ireland's most important archaeological landscapes, drawing researchers from worldwide."
    ],
    famousSkills: ["Horse riding & equestrian", "Heritage & archaeology", "Farming", "Coaching & fitness", "Home improvement"],
    didYouKnow: "Meath's Newgrange passage tomb is aligned with the winter solstice sunrise — whoever designed it 5,000 years ago had serious astronomical skills!",
    metaDescription: "Discover skill swapping in Meath, Ireland. Browse local listings for equestrian, farming, fitness, heritage skills and more. Join Meath's SwapSkills community free."
  },
  {
    slug: "kildare",
    name: "Kildare",
    province: "Leinster",
    icon: "🐎",
    heroTagline: "Horse country with horsepower — and every other skill",
    intro: "Kildare is synonymous with horses, the Curragh, and Ireland's racing heritage. But there's much more to this county — tech companies in Leixlip, retail therapy in Kildare Village, and a growing community of skilled professionals who commute but love their local area. Kildare's skill pool is deep and diverse.",
    funFacts: [
      "The Curragh racecourse is the home of Irish flat racing — equestrian and stable management skills are premium here.",
      "Intel's European headquarters is in Leixlip, Kildare — some of the world's best tech skills are made right here.",
      "The Japanese Gardens in Kildare are among the finest in Europe — landscape design skills at their peak.",
      "Kildare was home to St. Brigid, one of Ireland's patron saints, who was famous for her generosity. Community spirit is ancient here!",
      "The county has some of Ireland's best golf courses, making golf coaching a popular skill to swap."
    ],
    famousSkills: ["Equestrian", "Technology & engineering", "Golf coaching", "Landscaping", "Fashion & retail"],
    didYouKnow: "Kildare produces more thoroughbred racehorses than almost anywhere in the world. If you need horse-related skills, you're in the right county!",
    metaDescription: "Swap skills in Kildare, Ireland. Find local listings for equestrian, tech, golf coaching, gardening and more. Join Kildare's SwapSkills community free."
  },
  {
    slug: "tipperary",
    name: "Tipperary",
    province: "Munster",
    icon: "🏑",
    heroTagline: "It's a long way to Tipperary — but the skills are worth the trip",
    intro: "Tipperary is hurling heartland and farming country rolled into one. From the Rock of Cashel to the Glen of Aherlow, this is a county of strong traditions, strong arms, and strong community bonds. Whether it's dairy farming, hurling coaching, or traditional crafts, Tipp folk have skills to share.",
    funFacts: [
      "Tipperary has won more All-Ireland hurling titles than any county except Kilkenny. Hurling IS life here.",
      "The Rock of Cashel is one of Ireland's most spectacular archaeological sites — medieval building skills on full display.",
      "Tipperary is Ireland's largest inland county, with vast farmland producing world-class dairy and beef.",
      "Cahir Castle is one of the largest and best-preserved castles in Ireland — the stonemasons did incredible work.",
      "The Glen of Aherlow is a hidden gem for hill walking — outdoor skills are abundant in Tipp."
    ],
    famousSkills: ["Hurling coaching", "Dairy farming", "Stonemasonry", "Hill walking", "Traditional music"],
    didYouKnow: "The famous World War I song 'It's a Long Way to Tipperary' made the county known worldwide — but locals will tell you it's worth every mile!",
    metaDescription: "Discover skill swapping in Tipperary, Ireland. Browse local listings for hurling coaching, farming, music, outdoor skills and more. Join Tipperary's SwapSkills community free."
  },
  {
    slug: "clare",
    name: "Clare",
    province: "Munster",
    icon: "🎵",
    heroTagline: "Where the music never stops and the skills keep flowing",
    intro: "Clare is the spiritual home of Irish traditional music — in towns like Doolin, Ennis, and Miltown Malbay, you can hear sessions in every pub. But Clare is also home to the wild Burren landscape, the Cliffs of Moher, and a fiercely independent community that values self-sufficiency and sharing.",
    funFacts: [
      "Doolin is considered the capital of Irish traditional music — musicians come from worldwide to learn here.",
      "The Burren is one of the most unique landscapes in Europe — botanists and geologists study skills here that exist nowhere else.",
      "The Cliffs of Moher attract over 1.5 million visitors a year. Tourism and guiding skills are essential in Clare.",
      "Willie Clancy Week in Miltown Malbay is the world's biggest traditional music summer school.",
      "Clare has some of Ireland's best surfing spots at Lahinch — surfing lessons are a top swap here."
    ],
    famousSkills: ["Traditional music", "Surfing", "Botany & nature", "Tourism & guiding", "Set dancing"],
    didYouKnow: "Clare has more traditional musicians per capita than anywhere else in Ireland. If you want to learn the fiddle, bodhrán, or tin whistle, Clare is where you go!",
    metaDescription: "Swap skills in Clare, Ireland. Find local listings for traditional music, surfing, nature walks, dancing and more. Join Clare's SwapSkills community free."
  },
  {
    slug: "mayo",
    name: "Mayo",
    province: "Connacht",
    icon: "🏔️",
    heroTagline: "Mayo, God help us — but sure we'll help each other!",
    intro: "Mayo is rugged, wild, and beautiful — from Croagh Patrick to Achill Island, from Westport to Ballina. Mayo people are resilient, resourceful, and community-minded. Despite being one of Ireland's more remote counties, the skill-swapping spirit is alive and well along the Wild Atlantic Way.",
    funFacts: [
      "Croagh Patrick is Ireland's holiest mountain — over 100,000 people climb it annually. Hiking skills are in high demand!",
      "Achill Island has Ireland's highest sea cliffs and a thriving artist colony. Creative skills flourish here.",
      "Westport was voted the best place to live in Ireland multiple times. Quality of life breeds quality skills!",
      "Mayo has some of Ireland's best salmon fishing — angling skills are passed down through generations.",
      "The Great Western Greenway is Ireland's first dedicated cycling and walking trail — 42km of skill-swapping scenery."
    ],
    famousSkills: ["Fishing & angling", "Hiking & mountaineering", "Art & painting", "Cycling", "Traditional crafts"],
    didYouKnow: "The Mayo GAA curse — supposedly placed in 1951 — says Mayo won't win an All-Ireland until the last member of that team passes. They came agonisingly close multiple times. Persistence is definitely a Mayo skill!",
    metaDescription: "Discover skill swapping in Mayo, Ireland. Browse local listings for outdoor adventures, fishing, art, cycling and more. Join Mayo's SwapSkills community free."
  },
  {
    slug: "donegal",
    name: "Donegal",
    province: "Ulster",
    icon: "🌊",
    heroTagline: "Ireland's wild northwest — where skills are as rugged as the coast",
    intro: "Donegal is Ireland's most northerly county and one of its most dramatic. With Europe's highest sea cliffs at Slieve League, pristine beaches, and a strong Gaeltacht tradition, Donegal is a place of resilience and resourcefulness. The people here are self-reliant, creative, and always willing to lend a hand.",
    funFacts: [
      "Donegal tweed is world-famous — weaving skills have been passed down here for centuries.",
      "Slieve League has cliffs nearly three times higher than the Cliffs of Moher. Scale matters in Donegal!",
      "Donegal is home to extensive Gaeltacht areas where Irish is the primary language. Language swaps are natural here.",
      "The county has some of Europe's best surfing beaches, particularly around Bundoran and Rossnowlagh.",
      "Donegal was named the 'coolest place on the planet' by National Geographic in 2017. Cool skills guaranteed!"
    ],
    famousSkills: ["Tweed weaving", "Surfing", "Irish language", "Fishing", "Traditional music"],
    didYouKnow: "Donegal is geographically closer to Iceland than to Cork! Despite its remote location, the digital nomad community is growing, bringing tech skills to the wild northwest.",
    metaDescription: "Swap skills in Donegal, Ireland. Find local listings for weaving, surfing, Irish language, music and more. Join Donegal's SwapSkills community free."
  },
  {
    slug: "sligo",
    name: "Sligo",
    province: "Connacht",
    icon: "📖",
    heroTagline: "Yeats Country — where poetry meets practicality",
    intro: "Sligo is forever associated with W.B. Yeats, and that literary spirit infuses everything. But Sligo is also a surfing hotspot, a foodie destination, and home to IT Sligo's tech graduates. It's a small county with a big heart and a surprising depth of talent.",
    funFacts: [
      "W.B. Yeats immortalised Sligo's landscapes — creative writing skills have deep roots here.",
      "Strandhill is one of Ireland's premier surf spots, with lessons available year-round.",
      "Sligo has been dubbed Ireland's foodie capital for its concentration of quality restaurants and producers.",
      "Ben Bulben is one of Ireland's most distinctive mountains — a magnet for hikers and photographers.",
      "The county has a vibrant traditional music scene, with sessions in pubs across Sligo town."
    ],
    famousSkills: ["Creative writing", "Surfing", "Food & cooking", "Photography", "Traditional music"],
    didYouKnow: "Sligo has more megalithic tombs than any other county in Ireland — the ancient people here were clearly very skilled builders!",
    metaDescription: "Discover skill swapping in Sligo, Ireland. Browse local listings for writing, surfing, cooking, photography and more. Join Sligo's SwapSkills community free."
  },
  {
    slug: "leitrim",
    name: "Leitrim",
    province: "Connacht",
    icon: "🛶",
    heroTagline: "Ireland's best-kept secret — small county, mighty skills",
    intro: "Leitrim is Ireland's least populated county, but what it lacks in numbers it makes up for in character. With stunning waterways, organic farms, and a thriving artist community, Leitrim attracts creative types and self-sufficient souls who value community over crowds.",
    funFacts: [
      "Leitrim has just 35,000 people — everyone literally knows everyone. Community skill-sharing is a way of life!",
      "The county has more rivers and lakes per square mile than almost anywhere in Ireland. Kayaking skills? Essential.",
      "Leitrim has become a haven for organic farmers and back-to-the-landers — sustainable living skills thrive here.",
      "The Leitrim Sculpture Centre in Manorhamilton attracts artists from worldwide.",
      "Leitrim has the shortest coastline of any Irish coastal county — just 4.7km. But they make every metre count!"
    ],
    famousSkills: ["Organic farming", "Kayaking & watersports", "Sculpture & art", "Woodworking", "Self-sufficiency"],
    didYouKnow: "Leitrim recently attracted a wave of remote workers and artists, creating a vibrant micro-community of creative skill swappers!",
    metaDescription: "Swap skills in Leitrim, Ireland. Find local listings for organic farming, art, kayaking, woodworking and more. Join Leitrim's SwapSkills community free."
  },
  {
    slug: "roscommon",
    name: "Roscommon",
    province: "Connacht",
    icon: "🌾",
    heroTagline: "The heart of Ireland — where community skills beat strongest",
    intro: "Roscommon sits right in the heart of Ireland, and it's a county built on farming, family, and community spirit. With rolling green pastures, historic castles, and friendly towns, Roscommon might be quiet, but the skills here are solid and the people are genuinely helpful.",
    funFacts: [
      "Roscommon is one of Ireland's most agricultural counties — farming skills are in the DNA.",
      "Rathcroghan near Tulsk was the ancient capital of Connacht — leadership has Roscommon roots.",
      "The county is known for its beef and sheep farming — animal husbandry skills are highly valued.",
      "Roscommon Castle dates from the 13th century — medieval craft skills on full display.",
      "The Percy French song 'Come Back Paddy Reilly to Ballyjamesduff' put Roscommon humour on the map."
    ],
    famousSkills: ["Farming & agriculture", "Animal husbandry", "Traditional crafts", "Carpentry", "Community organising"],
    didYouKnow: "Roscommon's Strokestown Park House has Ireland's Famine Museum, a powerful reminder of how community resilience and shared skills saved lives.",
    metaDescription: "Discover skill swapping in Roscommon, Ireland. Browse local listings for farming, carpentry, crafts and more. Join Roscommon's SwapSkills community free."
  },
  {
    slug: "westmeath",
    name: "Westmeath",
    province: "Leinster",
    icon: "🏊",
    heroTagline: "The Lake County — where skills run deep",
    intro: "Westmeath is Ireland's lakeland county, home to Lough Ennell and Lough Derravaragh, Mullingar's buzzing town centre, and Athlone's strategic crossroads. It's a county of water sports, good food, and a growing tech scene that makes it a hidden gem for skill swapping.",
    funFacts: [
      "Athlone Castle sits at the exact geographic centre of Ireland — skills radiate outward from here!",
      "Lough Ree and Lough Ennell are popular for sailing, fishing, and kayaking — watersport skills are everywhere.",
      "Mullingar is famous for its beef — Mullingar heifer is a thing. Butchery and cooking skills? Sorted.",
      "Joe Dolan, one of Ireland's most beloved singers, hailed from Mullingar. Musical talent runs deep.",
      "Westmeath has a thriving equestrian scene with riding schools and competitions throughout the county."
    ],
    famousSkills: ["Watersports", "Cooking & butchery", "Equestrian", "Music", "Fishing"],
    didYouKnow: "Niall Horan from One Direction is from Mullingar, Westmeath. The county's been producing musical talent long before boy bands though!",
    metaDescription: "Swap skills in Westmeath, Ireland. Find local listings for watersports, cooking, music, equestrian and more. Join Westmeath's SwapSkills community free."
  },
  {
    slug: "offaly",
    name: "Offaly",
    province: "Leinster",
    icon: "🌳",
    heroTagline: "The Faithful County — faithful to community and craft",
    intro: "Offaly might be under the radar, but this midlands county has a rich heritage in craftsmanship, bog culture, and community spirit. From Clonmacnoise's monastic brilliance to Birr Castle's scientific legacy, Offaly proves that great skills can come from unexpected places.",
    funFacts: [
      "Clonmacnoise was one of Europe's great centres of learning — monks here were skilled in metalwork, manuscript writing, and more.",
      "Birr Castle's telescope was the world's largest for over 70 years — scientific curiosity is an Offaly tradition.",
      "The county has extensive boglands — traditional turf-cutting skills are still practiced and valued.",
      "Offaly's hurling team won back-to-back All-Irelands in the 1980s — never underestimate the Faithful County!",
      "Tullamore D.E.W. whiskey originated here — distilling and blending skills with over 190 years of heritage."
    ],
    famousSkills: ["Distilling", "Heritage crafts", "Turf cutting", "Hurling", "Gardening"],
    didYouKnow: "The 'D.E.W.' in Tullamore D.E.W. stands for Daniel E. Williams, who ran the distillery. Offaly's entrepreneurial skills go way back!",
    metaDescription: "Discover skill swapping in Offaly, Ireland. Browse local listings for heritage crafts, distilling, gardening, sports and more. Join Offaly's SwapSkills community free."
  },
  {
    slug: "laois",
    name: "Laois",
    province: "Leinster",
    icon: "🏡",
    heroTagline: "The O'Moore County — strong roots, growing skills",
    intro: "Laois (pronounced Leesh!) is a compact midlands county with surprising depth. Home to the stunning Slieve Bloom Mountains, the heritage town of Abbeyleix, and a growing young population, Laois combines rural charm with modern ambition. The community spirit here is genuine and skills flow freely.",
    funFacts: [
      "The Slieve Bloom Mountains are some of the oldest in Europe — geological skills literally millions of years in the making.",
      "Abbeyleix was Ireland's first heritage town — preservation and restoration skills are valued deeply.",
      "The Electric Picnic festival is held in Laois (Stradbally) — one of Ireland's biggest cultural events happens right here.",
      "Laois is one of Ireland's fastest-growing counties by population — new families bring new skills!",
      "Dunamase Castle ruins offer stunning views and a reminder of medieval defensive engineering."
    ],
    famousSkills: ["Heritage restoration", "Farming", "Music & festivals", "Carpentry", "Home improvement"],
    didYouKnow: "The Electric Picnic in Stradbally attracts over 70,000 people each year — Laois hosts one of Europe's best music festivals. Event management skills? They've got it covered!",
    metaDescription: "Swap skills in Laois, Ireland. Find local listings for home improvement, farming, music, restoration and more. Join Laois's SwapSkills community free."
  },
  {
    slug: "longford",
    name: "Longford",
    province: "Leinster",
    icon: "📚",
    heroTagline: "Small county, big stories — and even bigger skills",
    intro: "Longford is one of Ireland's smallest counties but has produced some of its greatest writers and thinkers. With the River Shannon on its doorstep and Center Parcs bringing visitors, Longford is a county that's reinventing itself while keeping its warm community spirit intact.",
    funFacts: [
      "Oliver Goldsmith, author of 'She Stoops to Conquer', came from Longford. Literary skills have deep roots here.",
      "Center Parcs Longford Forest brought Ireland's first subtropical swimming paradise to the midlands.",
      "The Royal Canal runs through Longford — canal boat skills and waterway knowledge are local specialties.",
      "Longford's Corlea Trackway preserves an Iron Age road built over 2,000 years ago — ancient engineering!",
      "The county has a strong tradition of community drama and theatre groups."
    ],
    famousSkills: ["Writing & drama", "Watersports", "Community organising", "Childcare", "Gardening"],
    didYouKnow: "Longford's Corlea Trackway is one of the most significant Iron Age finds in Europe — a wooden road built in 148 BC. Skills preservation at its finest!",
    metaDescription: "Discover skill swapping in Longford, Ireland. Browse local listings for writing, gardening, childcare, drama and more. Join Longford's SwapSkills community free."
  },
  {
    slug: "louth",
    name: "Louth",
    province: "Leinster",
    icon: "⚔️",
    heroTagline: "The Wee County with mighty big skills",
    intro: "Louth is Ireland's smallest county but packs a punch. With Dundalk's tech hub, Drogheda's historic heart, and the stunning Cooley Peninsula, Louth bridges Northern Ireland and the Republic with energy and enterprise. Small but mighty — just like the best skill swaps.",
    funFacts: [
      "Louth is Ireland's smallest county by area — but its people have some of Ireland's biggest personalities!",
      "Dundalk has a growing tech and startup scene, earning it the nickname 'the border town that codes'.",
      "The Cooley Peninsula inspired the great Irish epic Táin Bó Cúailnge — legendary skills have Louth origins.",
      "Drogheda's St. Laurence Gate is one of the best-preserved medieval town gates in Ireland.",
      "Louth oysters are prized delicacies — shellfish harvesting skills are handed down through families."
    ],
    famousSkills: ["Technology & startups", "Seafood & oysters", "History & heritage", "Cross-border trade", "GAA coaching"],
    didYouKnow: "The legendary warrior Cú Chulainn is associated with Louth — defending Ulster single-handedly at the age of 17. Talk about a skillset!",
    metaDescription: "Swap skills in Louth, Ireland. Find local listings for tech, seafood skills, GAA coaching, heritage and more. Join Louth's SwapSkills community free."
  },
  {
    slug: "cavan",
    name: "Cavan",
    province: "Ulster",
    icon: "🎣",
    heroTagline: "The Lake County of Ulster — cast your net for skills",
    intro: "Cavan is Ireland's lake county, with reportedly 365 lakes — one for every day of the year! This border county has a reputation for being careful with money (the Cavan jokes are legendary), but that practicality translates into incredible self-sufficiency skills. Cavan folk can fix, build, and grow just about anything.",
    funFacts: [
      "Cavan has 365 lakes — one for each day of the year. Fishing and watersport skills are practically compulsory!",
      "Cavan people are famous for their thriftiness — making do and mending is basically a county sport. Perfect for skill swapping!",
      "The Shannon Pot in Cavan is the source of Ireland's longest river — everything great starts in Cavan.",
      "Cavan Crystal was renowned for its craftsmanship before it closed — the skills live on in local artisans.",
      "The county has a thriving poultry industry — Cavan produces a huge portion of Ireland's chicken."
    ],
    famousSkills: ["Fishing", "DIY & home repair", "Farming", "Thrifty living", "Poultry farming"],
    didYouKnow: "There's a famous joke: 'How do you know a Cavan man is having a good time? He takes his hands out of his pockets.' But those hands are incredibly skilled — Cavan folk are the ultimate DIYers!",
    metaDescription: "Discover skill swapping in Cavan, Ireland. Browse local listings for fishing, DIY, farming, home repair and more. Join Cavan's SwapSkills community free."
  },
  {
    slug: "monaghan",
    name: "Monaghan",
    province: "Ulster",
    icon: "🥁",
    heroTagline: "The Drumlin County — rolling hills, rolling skills",
    intro: "Monaghan is a county of drumlins (small rounded hills), strong farming traditions, and a vibrant arts scene anchored by the legacy of poet Patrick Kavanagh. It's a border county with a resilient spirit and a community that genuinely looks out for one another.",
    funFacts: [
      "Patrick Kavanagh, one of Ireland's greatest poets, was from Inniskeen, Monaghan. Literary skills are in the soil.",
      "Monaghan has a massive mushroom farming industry — producing over 60% of Ireland's mushrooms!",
      "The county is famous for its drumlin landscape — over 10,000 small hills shaped by glaciers.",
      "Monaghan town's Market House is a stunning example of 18th-century architecture and craft.",
      "The county has strong cross-border community ties, making it a natural hub for skill exchange."
    ],
    famousSkills: ["Poetry & writing", "Mushroom farming", "Traditional music", "Farming", "Community development"],
    didYouKnow: "Monaghan produces about 80% of the Republic of Ireland's mushrooms. If you need mushroom-growing skills, Monaghan is literally the only county to ask!",
    metaDescription: "Swap skills in Monaghan, Ireland. Find local listings for farming, writing, music, community skills and more. Join Monaghan's SwapSkills community free."
  },
];

export function getCountyBySlug(slug: string): CountySpotlightData | undefined {
  return countySpotlights.find(c => c.slug === slug);
}

export function getCountiesByProvince(province: string): CountySpotlightData[] {
  return countySpotlights.filter(c => c.province === province);
}
